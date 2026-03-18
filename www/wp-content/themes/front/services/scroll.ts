import { computed, Ref, ref, unref } from "@vue/reactivity";
import {
	onBeforeRender,
	onBeforeResize,
	onRendered,
	syncToStore,
	useEmitter,
	useEvents,
	useNodeResizer,
	useStore,
} from "composables";
import { useReactivity, useRoute } from "core";
import { Service } from "core/service";
import { gsap } from "gsap";
import {
	debounce,
	easing,
	extend,
	getBounds,
	getProps,
	getRelativeBounds,
	round,
	smooth,
	toArray,
} from "utils";

export interface ScrollService extends Service {
	el: HTMLElement;
	isSmoothed: Ref<boolean>;
	isEnabled: Ref<boolean>;
	to: (y: number | HTMLElement, offset: number) => void;
	set: (pos: number, smooth: boolean) => void;
}

export function Scroll(args: Service) {
	// Extend

	extend(Service, this, args);
	const node = args.el;

	// Props

	const { on } = useEvents();
	const { watch, effect } = useReactivity();

	const props = getProps(node);

	// Vars

	const route = useRoute();
	const page = useStore("page");
	const device = useStore("device");
	const store = useStore("scroll");
	const emitter = useEmitter();
	const resizer = useNodeResizer();
	let mutator: MutationObserver;

	const isSmoothed = computed(() => !(device.isTouch || device.isTablet));
	const childEls: Ref<HTMLElement[]> = ref([]);

	const position = ref(0);
	const target = ref(0);
	const delta = ref(0);
	const size = ref(0);
	const smoothing = ref(8); // 6
	const isScrolling = ref(false);
	const isEnabled = ref(false);
	const isMain = node.getAttribute("v-scroll") === "main";

	const ease = easing("1, 0, 1, 1");

	let stopSync: Function;
	let anim: GSAPAnimation | null;
	if (isMain) store.el = node;
	node.scrollTop = 0; // reset scroll (firefox refresh page bug fix)

	// Hooks

	onMounted(() => {
		const el = isMain ? document.body : node;
		childEls.value = toArray(node.children);

		on(el, "wheel", onWheel);
		on(el, "wheel", onInputEnd);
		on(node, "scroll", onScroll);
		on(el, "keydown", onKeyDown);
		on(el, "focusin", onFocus);
		// emitter.on("beforeRender", onBeforeRender);
		// emitter.on("afterRender", onRendered);
		setup();
		containerSetup();
		setLimits();

		mutator = new MutationObserver(onMutate);
		mutator.observe(node, {
			attributes: false,
			childList: true,
			subtree: false,
		});

		resizer.observe(childEls.value, setLimits);
	});

	onUnmounted(() => {});

	afterReady(() => {
		if (route.hash) {
			const el = document.querySelector(route.hash);
			if (el) {
				const bounds = getBounds(el);
				set(bounds.y - 250, false);
			}
		}
	});

	onUnmounted(() => {
		// emitter.off("beforeRender", onBeforeRender);
		// emitter.off("afterRender", onRendered);

		resizer.unobserve(childEls.value);
		mutator.disconnect();
	});

	// Handles

	onBeforeRender(node, (tick) => {
		if (!isSmoothed.value) return;
		position.value = round(
			smooth(target.value, position.value, smoothing.value, tick.delta),
			1,
		);
		// position.value = smooth(target.value, position.value, smoothing.value, tick.delta);
	});

	// onRendered(node, (tick) => {
	// 	if (!isSmoothed.value) return null;

	// 	childEls.value.forEach((el: HTMLElement) => {
	// 		if (el.classList.contains("scrollbar")) return;
	// 		if (isMain && store.el != node) return;
	// 		el.style.transform = `translate3d(0, ${-position.value}px, 0)`; // using transforms
	// 	});
	// });

	watch(position, () => {
		node.scrollTo({ top: position.value, behavior: "instant" });
	});

	onBeforeResize(() => setLimits());

	// Functions

	const onWheel = (el: HTMLElement, event: WheelEvent) => {
		if (!isEnabled.value || !size.value || !page.isReady) return;
		event.stopPropagation();

		target.value = limit(target.value + event.deltaY);
		isScrolling.value = true;
	};

	const onScroll = (el: HTMLElement, event: Event) => {
		if (!isEnabled.value) return;
		event.stopPropagation();
		if (!isSmoothed.value) {
			target.value = position.value = node.scrollTop;
			isScrolling.value = true;
		}
	};

	const onFocus = (el: HTMLElement, event: Event) => {
		requestAnimationFrame(() => {
			let target = event.target as HTMLElement;
			if (target.closest("[v-scroll]") !== node) return null;
			const bounds = getRelativeBounds(target, node);

			// If below visible section
			if (bounds.bottom < 0 && bounds.top > node.offsetHeight)
				to(position.value - bounds.bottom + 100);

			// If above visible section
			if (bounds.top < 0 && bounds.bottom > node.offsetHeight)
				to(position.value + bounds.top - 100);
		});
	};

	const onKeyDown = (el: HTMLElement, event: KeyboardEvent) => {
		if (!isEnabled.value || !size.value) return;

		const tagName = document.activeElement?.tagName.toLowerCase();
		const ignore = ["input", "button", "a", "textarea"];

		if (!tagName || ignore.indexOf(tagName) != -1) return;

		switch (event.keyCode) {
			case 40:
				// Down
				target.value = limit(target.value + 50);
				break;
			case 38:
				// Up
				target.value = limit(target.value - 50);
				break;
			case 32:
				// Space
				to(position.value + window.innerHeight);
				break;

			default:
				break;
		}
	};

	const onInputEnd = debounce(() => {
		isScrolling.value = false;
	}, 50);

	const onScrollEnd = debounce(() => {
		delta.value = 0;
		isScrolling.value = false;
	}, 50);

	// Utils

	const onMutate = (mutations: MutationRecord[], observer: MutationObserver) => {
		mutations.forEach((mutation) => {
			if (mutation.removedNodes) {
				resizer.unobserve(mutation.removedNodes);
			}
			if (mutation.addedNodes) {
				resizer.observe(mutation.addedNodes, setLimits);
			}
		});

		childEls.value = toArray(node.children);
	};

	const setup = () => {
		node.style.top = "0";
		node.style.left = "0";
		node.style.right = "0";
		node.style.bottom = "0";
		// node.style.backfaceVisibility = "hidden";
		// node.style.willChange = "scroll-position";
		// node.style.transform = "translateZ(0)";
		// node.style.overscrollBehavior = "none";
	};

	const containerSetup = () => {
		// node.scrollTo(0, 0);
		target.value = 0;
		position.value = 0;

		// Mac overflow scroll fix

		if (isMain) {
			document.documentElement.style.position = "fixed";
			document.documentElement.style.height = !isSmoothed.value
				? "calc(100% - 1px)"
				: "100%";
		}

		if (isSmoothed.value) {
			node.style.position = "absolute";
			node.style.overflow = "hidden";

			// childEls.value?.forEach((el) => {
			// 	el.style.willChange = "transform";
			// });
		} else {
			node.style.position = "absolute";
			// Enable native scroll
			node.style.overflowY = "auto";

			// Remove any applied transforms
			childEls.value?.forEach((el: HTMLElement) => {
				el.style.transform = "";
				// el.style.willChange = "";
			});
		}
	};

	const setLimits = () => {
		size.value = node.scrollHeight - node.offsetHeight;
		target.value = limit(target.value);
		position.value = target.value;
	};

	const limit = (value: number) => {
		return Math.max(Math.min(value, size.value), 0);
	};

	const to = async (y: number | HTMLElement, offset: number = 0) => {
		y = unref(y);
		if (y == undefined) return;
		if (anim) return;

		if (y instanceof Element) {
			const bounds = getBounds(y);
			y = position.value + bounds.y - offset;
		}

		const pos = { y: position.value };
		const duration = Math.min(Math.abs((position.value - y) / 50), 0.6);
		const tempSmooth = smoothing.value;
		smoothing.value = 1;

		anim = gsap.to(pos, {
			y: limit(y),
			duration: duration,
			ease: ease,
			onUpdate: (a) => {
				set(pos.y);
			},
		});
		await anim;

		anim = null;

		smoothing.value = tempSmooth;
	};

	const set = (pos: number, smooth: boolean = true) => {
		const y = limit(pos);

		target.value = y;
		if (!smooth) position.value = y;
	};

	// Effects

	effect(() => {
		if (!isSmoothed.value) {
			node.style.overflow = isEnabled.value ? "" : "hidden";
		}
	});

	watch(position, (value: number, oldValue: number) => {
		delta.value = value - oldValue;
		onScrollEnd();
	});

	watch(isSmoothed, () => containerSetup());

	watch(
		() => store.el,
		() => {
			if (isMain && store.el != node) {
				if (stopSync) stopSync();
			}
		},
	);

	// Expose

	const values = {
		position,
		target,
		delta,
		size,
		smoothing,
		isScrolling,
		isSmoothed,
		isEnabled,
		to,
		set,
	};

	defineExpose(values);
	supply("scroll", values);
	if (isMain) stopSync = syncToStore("scroll", values);
}

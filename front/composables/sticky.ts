import { computed, Ref, ref, unref } from "@vue/reactivity";
import { useReactivity } from "core";
import { clamp, debounce, easing, getBounds, receive, withDefaults } from "utils";
import { useIntersect } from "./intersector";
import { useStore } from "./store";
import { useBounds } from "composables";

export const useSticky = (props: {
	el: HTMLElement; //
	containerEl?: HTMLElement;
	align?: string;
	offset?: number | Ref<number>;
	smoothing?: number | Ref<number>;
	isActive?: boolean | Ref<boolean>;
	applyTransform?: boolean | Ref<boolean>;
	contain?: "both" | "top" | "bottom";
}) => {
	const { watch, effect } = useReactivity();

	// Vars
	const node = props.el;

	const {
		align, //
		smoothing,
		isActive,
		offset,
		applyTransform,
		containerEl,
		contain = "both",
	} = withDefaults(props, {
		containerEl: node.parentElement,
		align: "center",
		smoothing: 30,
		isActive: true,
		offset: 0,
		applyTransform: true,
	}) as typeof props;

	let smoothingTop = unref(smoothing);
	let smoothingBottom = unref(smoothing);

	const scroll = receive("scroll", props.el);
	const device = useStore("device");
	const containerIntersect = useIntersect(containerEl);

	let bounds = useBounds(node);
	let containerBounds = useBounds(containerEl);

	const progress = ref(0);
	const unsmoothedProgress = ref(0);
	const position = ref(0);
	const size = ref(0);

	const ease = easing(".25,0,.77,.5");
	const isNative = computed(
		() => (device.isTouch && unref(isActive)) || unref(smoothing) == 0,
	);

	// Hooks

	// onMounted(() => {
	// 	node.style.willChange = "transform";
	// });

	// onResized(() => resize());
	// onAfterResize(() => update());

	// Functions

	const update = () => {
		if (!unref(isActive)) return;

		//

		const dif = device.height - bounds.height;
		const calc = scroll.position - bounds.top;
		const parentOffset = containerBounds.top - bounds.top;

		let start = 0;
		let end = containerBounds.height - device.height + dif + parentOffset;
		let top = 0;
		let value = 0;

		// Offset
		if (align == "center") {
			start = -dif / 2;
			top = -dif / 2;
			end -= dif / 2;
		}

		if (align == "bottom") {
			start = -dif;
			top = -dif;
			end -= dif;
		}

		if (offset) {
			start -= unref(offset);
			top -= unref(offset);
			end -= unref(offset);
		}

		// Smoothing
		if (smoothing) {
			start += smoothingTop * 5;
			end -= smoothingBottom * 5;
		}

		if (end < top) {
			if (unref(applyTransform)) node.style.transform = `translate3d(0, 0, 0)`;
			position.value = value;
			return;
		}

		// Stick

		if (contain != "bottom") {
			if (smoothing && smoothingTop && calc < start && calc > start - smoothingTop * 10) {
				// Smooth enter
				let p = 1 - (start - calc) / (smoothingTop * 10);
				p = ease(p);
				value = p * smoothingTop * 5;
			} else if (calc < start) {
				// Before
				value = 0;

				if (isNative.value) {
					node.style.position = "sticky";
					node.style.pointerEvents = "";
				}
			}
		}

		if (
			(calc > start && calc < end) ||
			(calc > start && contain == "top") ||
			(calc < end && contain == "bottom")
		) {
			// Stuck
			value = scroll.position - bounds.top - top;
			if (isNative.value && contain != "both") {
				node.style.position = "fixed";
				node.style.pointerEvents = "none";
			}
		}

		if (calc > end && contain != "top") {
			// After
			value = containerBounds.height - device.height + 0 + dif + parentOffset;

			if (isNative.value) {
				node.style.position = "sticky";
				node.style.pointerEvents = "";
			}
		}

		if (
			contain != "top" &&
			smoothing &&
			smoothingBottom &&
			calc < end + smoothingBottom * 10 &&
			calc > end
		) {
			// Smooth leave
			let p = (end - calc + smoothingBottom * 10) / (smoothingBottom * 10);
			p = ease(p);
			value -= p * smoothingBottom * 5;
		}

		node.dataset.stuck = calc > start && calc < end ? "true" : "false";
		// if (end < 0) value = 0;

		if (!isNative.value) node.style.transform = `translate3d(0, ${value}px, 0)`;

		if (contain == "bottom") {
			value -= containerBounds.top;
		}

		position.value = value;
		size.value = containerBounds.height - bounds.height;
		progress.value = value / size.value;

		unsmoothedProgress.value = clamp(
			(value - smoothingTop * 5) / (size.value - smoothingTop * 5 - smoothingBottom * 5),
			0,
			1,
		);
	};

	const resize = () => {
		// Reset

		if (isNative.value) {
			node.style.position = "sticky";
			node.style.top = unref(offset) + "px";

			if (align == "center") {
				node.style.top = (device.height - bounds.height) / 2 + unref(offset) + "px";
			}

			if (align == "bottom") {
				node.style.top = device.height - bounds.height + unref(offset) + "px";
			}
		} else {
			node.style.position = "";
			node.style.top = "";
		}

		const maxSmoothing = Math.min(
			(containerBounds.height - bounds.height) / 10,
			unref(smoothing),
		);

		smoothingTop = bounds.top <= 0 ? 0 : maxSmoothing;
		smoothingBottom = maxSmoothing;

		update();
	};

	// Effects

	watch(
		[
			() => scroll.size,
			() => containerBounds.top,
			() => containerBounds.height,
			() => bounds.top,
			() => bounds.height,
		],
		debounce(resize, 500),
	);

	watch([() => scroll.position, () => containerIntersect.isIntersecting], () => {
		if (containerIntersect.isIntersecting) update();
	});

	provide("sticky", {
		el: node,
		position,
		progress,
	});

	// watch(isActive, resize);

	return {
		el: node,
		position,
		progress,
		unsmoothedProgress,
		size,
		bounds,
		containerBounds,
		smoothing,
	};
};

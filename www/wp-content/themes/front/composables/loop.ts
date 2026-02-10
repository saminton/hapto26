import { Ref, reactive, ref, unref } from "@vue/reactivity";
import { onAfterResize, onBeforeResize } from "composables";
import { useReactivity } from "core";
import { Bounds, Vector2 } from "types";
import { getBounds, receive } from "utils";
import { onBeforeRender } from "./renderer";

type Item = {
	el: HTMLElement;
	bounds: Bounds;
	offset: Vector2;
	indexableEls?: Element[];
};

export function useLoop(props: {
	el: HTMLElement;
	boundsEl?: HTMLElement;
	speed?: number | Ref<number>;
	scrollSpeed?: number | Ref<number>;
}) {
	//

	const { watch, effect } = useReactivity();

	const node = unref(props.el);
	const containerEl = props.boundsEl ?? node.parentElement;
	const scroll = receive("scroll", node);
	const children = Array.from(node.children);

	let items: Item[] = [];
	const bounds: Bounds = reactive({
		x: 0, //
		y: 0,
		width: 0,
		height: 0,
		left: 0,
		top: 0,
		bottom: 0,
		right: 0,
	});

	const position = reactive({ x: 0, y: 0 });
	const itemsWidth = ref(0);
	const isPaused = ref(false);

	onMounted(() => {
		setup();
		resize();
	});

	onUnmounted(() => {
		//
	});

	onBeforeResize(() => {
		isPaused.value = true;
		resize();
	});

	onAfterResize(() => {
		isPaused.value = false;
	});

	onBeforeRender(containerEl, (tick) => {
		if (isPaused.value) return;

		// Speed
		let speed = unref(props.speed) ?? -1;
		let scrollSpeed = unref(props.scrollSpeed) ? unref(props.scrollSpeed) * 0.2 : 0;

		scrollSpeed *= speed >= 0 ? 1 : -1;
		if (scroll.delta) speed += scroll.delta * scrollSpeed;

		// Position
		let calc = (position.x + speed * tick.delta) % itemsWidth.value;
		calc = Math.round(calc * 10) / 10;
		if (calc > 0) calc -= itemsWidth.value;

		// Set
		if (calc) position.x = calc;
	});

	// Functions

	const setup = () => {
		node.style.display = "flex";
		node.style.maxWidth = "100%";
		node.style.flexWrap = "nowrap";
		node.style.whiteSpace = "nowrap";
		node.style.userSelect = "none";
		node.style.willChange = "transform";

		// Prevent screen reader
		node.setAttribute("aria-hidden", "true");
	};

	const resize = () => {
		position.x = 0;
		//
		node.innerHTML = "";
		Object.assign(bounds, getBounds(containerEl));

		items = [];

		let appended = append();
		let first = appended[0];
		let last = appended[appended.length - 1];

		const margin =
			parseFloat(getComputedStyle(first.el).marginLeft) +
			parseFloat(getComputedStyle(last.el).marginRight);

		itemsWidth.value = last.bounds.right - bounds.x + margin;

		let i = 0;

		while (i < 2 || (last.bounds.left < bounds.width && i < 50)) {
			const appended = append();
			last = appended[0];
			i++;
		}
	};

	const append = () => {
		let appended = [];

		children.forEach((child: HTMLElement, i) => {
			const clone = node.appendChild(child.cloneNode(true)) as HTMLElement;
			const bounds = getBounds(clone);

			const tags = ["a", "button", "input", "textarea"];
			const indexableEls = Array.from(clone.querySelectorAll(tags.join(",")));
			if (tags.includes(clone.tagName.toLowerCase())) indexableEls.push(clone);

			const offset = reactive({ x: 0, y: 0 });

			const item: Item = {
				el: clone,
				bounds,
				indexableEls,
				offset,
			};

			items.push(item);
			appended.push(item);

			// Remove tab indexing from elements
			indexableEls.forEach((el: Element) => {
				el.setAttribute("tabindex", "-1");
			});
		});

		return appended;
	};

	// Handles

	watch(position, () => {
		node.style.transform = `translate3d(${position.x}px, 0, 0)`;
	});

	watch(
		() => scroll.size,
		() => {
			resize();
		},
	);

	return { offset: position, bounds };
}

import { ref } from "@vue/reactivity";
import { useDrag, useEvents, useStore } from "composables";
import { Component, useReactivity, useScope } from "core";
import { aria, clamp, extend, getProps, receive } from "utils";

export function Scrollbar(args) {
	// Extend

	extend(Component, this, args);
	const node = args.el;

	// Props

	const { on, once } = useEvents();
	const { child, children } = useScope(this);
	const { watch, effect } = useReactivity();

	const props = getProps(node);

	// Vars

	const isMain = "main" in props;
	const scroll = isMain ? useStore("scroll") : receive("scroll", node);
	const device = useStore("device");
	const barEl = child("bar");

	const drag = useDrag(barEl);
	const height = ref(0);
	const position = ref(0);
	const isActive = ref(false);

	// Hooks

	onMounted(() => {});

	onUnmounted(() => {});

	// Effects

	effect(() => {
		barEl.style.transform = `translateY(${position.value}px)`;
	});

	effect(() => {
		aria(node, "grabbed", drag.isDown);
	});

	effect(() => {
		barEl.style.height = height.value + "px";
	});

	watch(
		() => scroll.position,
		() => {
			const y = (scroll.target / scroll.size) * (node.offsetHeight - height.value);
			position.value = clamp(y, 0, node.offsetHeight - height.value);
		},
	);

	watch(
		() => scroll.size,
		() => {
			height.value = Math.min(
				(node.offsetHeight / scroll.size) * node.offsetHeight,
				node.offsetHeight * 0.9,
			);
			isActive.value = scroll.size > 0;
		},
	);

	watch(
		() => drag.y,
		() => {
			// position.value = (scroll.target / scroll.size) * (node.offsetHeight - height.value);
			// a = b / c * (d - e)
			// a / (d - e) = b / c
			// a / (d - e) * c = b

			const delta = (drag.deltaY / (node.offsetHeight - height.value)) * scroll.size;
			scroll.set(scroll.target + delta);
		},
	);

	effect(() => {
		node.setAttribute(
			"aria-hidden",
			!(scroll.isEnabled && scroll.isSmoothed && isActive.value && !device.isTouch.value),
		);
	});
}

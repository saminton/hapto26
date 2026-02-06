import { Component, useReactivity, useScope } from "core";
import { ref, reactive } from "@vue/reactivity";
import { useBounds, useEvents, useSticky, useStore } from "composables";
import { getProps, extend, receive, closest, aria } from "utils";

export function Anchors(args) {
	// Extend

	extend(Component, this, args);
	const node = args.el;

	// Props

	const { on, once } = useEvents();
	const { child, children } = useScope(this);
	const { watch, effect, computed } = useReactivity();

	const {} = getProps(node);

	// Vars

	const index = ref(null);
	const sticky = useSticky({
		el: node,
		align: "bottom",
	});

	const scroll = receive("scroll", node);
	const items = children("item").map((el) => {
		const target = el.dataset.target;
		const targetEl = document.querySelector(`[data-anchor="${target}"]`) as HTMLElement;
		const bounds = useBounds(targetEl, scroll);

		return {
			el,
			target,
			targetEl,
			bounds,
		};
	});

	// Hooks

	onMounted(() => {
		on(
			items.map((item) => item.el),
			"click",
			clicked
		);
	});

	onUnmounted(() => {});

	// Functions

	const clicked = (el, e, i) => {
		const item = items[i];
		if (item.targetEl) scroll.to(item.targetEl);
	};

	// Effects

	watch(
		() => scroll.position,
		() => {
			const current = closest(
				items,
				scroll.position,
				(item) => item.bounds.y - 100,
				(goal, value) => value < goal
			);

			index.value = current.index;
		}
	);

	effect(() => {
		items.forEach((item, i) => {
			aria(item.el, "selected", i == index.value);
		});
	});
}

import { ref, reactive, Ref } from "@vue/reactivity";
import { useReactivity } from "core";
import { aria, closest, receive, withDefaults } from "utils";
import { useBounds } from "./bounds";
import { useEvents } from "./events";
import { Bounds, Scroll } from "types";
import { useStore } from "./store";

export type AnchorItem = {
	el: HTMLElement;
	id: string;
	targetEl: HTMLElement;
	targetBounds: Bounds;
};

export const useAnchors = (props: {
	el: HTMLElement;
	itemEls: HTMLElement[]; //
	attr?: string;
	updateUrl?: boolean;
	scroll?: Scroll;
}) => {
	// Vars
	const { watch, effect } = useReactivity();
	const { itemEls, scroll, attr } = withDefaults(props, {
		attr: "href",
		updateUrl: true,
		scroll: receive("scroll", props.el),
	}) as typeof props;

	const { on, once } = useEvents();

	const device = useStore("device");
	const index: Ref<Number> = ref(0);
	const items: AnchorItem[] = [];
	itemEls.forEach((el) => {
		const to = attr ? el.getAttribute(attr) : null;
		if (!to) return;
		const targetEl = document.getElementById(to.replace("#", ""));
		if (!targetEl) return;

		items.push({
			el: el,
			id: to,
			targetEl: targetEl,
			targetBounds: useBounds(targetEl),
		});
	});

	// Hooks

	onMounted(() => {
		on(
			items.map((item) => item.el),
			"click",
			clicked,
		);
	});

	// Functions

	const clicked = (el: HTMLElement, e: Event, i: number) => {
		e.preventDefault();
		e.stopPropagation();
		goTo(i);
	};

	const goTo = (i: number) => {
		const item = items[i];
		if (!item) return;
		scroll?.to(item.targetEl);
	};

	// Effects

	watch(
		() => scroll?.position,
		() => {
			if (!scroll) return;
			//
			const current = closest(
				items,
				scroll.position,
				(item) => item.targetBounds.top,
				(goal, top) => top - device.height * 0.5 < goal,
			);

			index.value = current.index;
		},
	);

	effect(() => {
		items.forEach((item, i) => {
			aria(item.el, "selected", i == index.value);
		});
	});

	return {
		items,
		index,
	};
};

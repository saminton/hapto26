import { reactive } from "@vue/reactivity";
import { onNodeResized } from "./node-resizer";
import { getBounds, receive } from "utils";
import { Bounds, Scroll } from "types";
import { useReactivity } from "core";
import { onBeforeResize } from "composables";

export const useBounds = (node: HTMLElement, scroll: Scroll = null): Bounds => {
	const { watch, effect } = useReactivity();
	if (!scroll) scroll = receive("scroll", node);

	const bounds = reactive({
		x: 0,
		y: 0,
		cx: 0,
		cy: 0,
		left: 0,
		right: 0,
		top: 0,
		bottom: 0,
		width: 0,
		height: 0,
	});

	const update = () => {
		node.style.transform = "";
		const temp = getBounds(node, scroll);
		Object.assign(bounds, temp);
	};

	onNodeResized(node, update);
	onBeforeResize(update);
	update();
	if (scroll.size) watch(() => scroll.size, update);

	return bounds;
};

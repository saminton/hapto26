import { reactive } from "@vue/reactivity";
import {
	onAfterResize,
	onBeforeResize,
	onRendered,
	useBounds,
	useStore,
} from "composables";
import { Service, useReactivity } from "core";
import { extend, getProps, receive } from "utils";

export function Parallax(args) {
	// Extend

	extend(Service, this, args);
	const node = args.el;

	// Props

	const { watch, effect } = useReactivity();
	const { parallax } = getProps(node);

	// Vars

	const scroll = receive("scroll", node);
	// const sticky = inject("sticky");
	const lateral = receive("lateral", node);
	const bounds = useBounds(node);
	const device = useStore("device");
	const position = reactive({ x: 0, y: 0 });

	// Hooks
	onMounted(() => {});

	onUnmounted(() => {});

	onBeforeResize(() => {
		// Reset position
		position.y = 0;
		position.x = 0;
	});

	onAfterResize(() => update());

	onRendered(node, () => {
		if (lateral.position != undefined) {
			const center = bounds.cx - lateral.position - device.width / 2;
			position.x = center * (parallax / 100);
		} else {
			const center = bounds.cy - scroll.position - device.height / 2;
			position.y = center * (parallax / 100);
		}
	});

	// Handles

	const update = () => {};

	// Effects

	effect(() => {
		node.style.transform = `translate3d(${position.x}px, ${position.y}px, 0)`;
	});

	supply("parallax", {
		position,
	});
}

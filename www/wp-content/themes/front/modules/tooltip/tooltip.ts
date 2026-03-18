import { Component, useReactivity, useScope } from "core";
import { ref, reactive } from "@vue/reactivity";
import { useEvents, useStore } from "composables";
import { getProps, extend, getBounds } from "utils";

export interface TooltipComponent extends Component {
	el: HTMLElement;
}

export function Tooltip(args: Component) {
	// Extend

	extend(Component, this, args);
	const node = args.el;

	// Props

	const { on, once } = useEvents();
	const { child, children } = useScope(this);
	const { watch, effect, computed } = useReactivity();

	const {} = getProps(node);

	// Vars

	const containerEl = child("container");
	const device = useStore("device");
	let isOpen = ref(false);

	// Hooks

	onMounted(() => {
		on(node.parentElement, "mouseenter", open);
		on(node, "mouseleave", close);
	});

	onUnmounted(() => {});

	// Functions

	const open = () => {
		isOpen.value = true;

		// Keep on screen

		const parentBounds = getBounds(node.parentElement);
		const bounds = getBounds(node);
		const containerBounds = getBounds(containerEl);

		let center = bounds.left + bounds.width / 2;
		let width = containerBounds.width;
		let offset = parentBounds.width / 2 - width / 2;
		let frame = (24 + 8) * device.rem;

		let overRight = center + width / 2 - device.width + frame;
		if (overRight > 0) {
			offset -= overRight;
		}

		let overLeft = center - width / 2 + frame;
		if (overLeft < 0) {
			offset += overLeft;
		}

		containerEl.style.left = offset + "px";
	};

	const close = () => {
		isOpen.value = false;
	};

	effect(() => {
		node.inert = !isOpen.value;
	});

	// Effects

	defineExpose({
		isOpen,
		open,
		close,
	});
}

import { syncToStore, useEvents, useStore } from "composables";
import { Component, useReactivity, useScope } from "core";
import { aria, extend, getProps } from "utils";

export function Menu(args) {
	// Extend

	extend(Component, this, args);
	const node = args.el;

	// Props

	const { on, once } = useEvents();
	const { child, children } = useScope(this);
	const { watch, effect } = useReactivity();

	const {} = getProps(node);

	// Vars

	const menu = useStore("menu");

	// Hooks

	onMounted(() => {});

	onUnmounted(() => {});

	// Functions

	const toggle = () => {
		menu.isOpen = !menu.isOpen;
	};

	// Effect

	effect(() => {
		aria(node, "hidden", !menu.isOpen);
	});

	syncToStore("menu", {
		toggle,
	});
}

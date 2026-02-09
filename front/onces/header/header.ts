import { useEvents, useStore } from "composables";
import { Component, useReactivity, useRoute, useScope } from "core";
import { aria, extend, getProps } from "utils";

export function Header(args) {
	// Extend

	extend(Component, this, args);
	const node = args.el;

	// Props

	const { on, once } = useEvents();
	const { child, children } = useScope(this);
	const { watch, effect } = useReactivity();

	const {} = getProps(node);

	// Vars

	const toggleEl = child("toggle");
	const menu = useStore("menu");
	const itemsEls = children("items") as HTMLLinkElement[];
	const page = useStore("page");
	const route = useRoute();

	// Hooks

	onMounted(() => {
		// on(toggleEl, "click", onClick);
	});

	onUnmounted(() => {});

	// Functions

	// Effects

	effect(() => {
		itemsEls.forEach((el) => {
			aria(el, "current", el.href == route.fullPath);
		});
	});
}

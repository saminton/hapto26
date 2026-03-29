import { Component, useReactivity, useScope } from "core";
import { ref, reactive } from "@vue/reactivity";
import { useEvents, useStore } from "composables";
import { getProps, extend, aria } from "utils";

export interface OverlayComponent extends Component {
	el: HTMLElement;
	isOpen: boolean;
}

export function Overlay(args: Component) {
	// Extend

	extend(Component, this, args);
	const node = args.el;

	// Props

	const { watch, effect } = useReactivity();

	// Vars

	const store = useStore("overlay");

	// Hooks

	onMounted(() => {
		//
	});

	onUnmounted(() => {});

	// Handles

	const onClick = () => {};

	// Functions

	// Effects

	effect(() => {
		aria(node, "hidden", !store.isOpen);
	});
}

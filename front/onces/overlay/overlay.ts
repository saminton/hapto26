import { Component, useReactivity, useScope } from "core";
import { ref, reactive } from "@vue/reactivity";
import { useEvents, useStore } from "composables";
import { getProps, extend } from "utils";

export function Overlay(args) {
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
		console.log(store);
	});

	onUnmounted(() => {});

	// Handles

	const onClick = () => {};

	// Functions

	// Effects

	effect(() => {
		node.ariaHidden = !store.isOpen;
	});
}

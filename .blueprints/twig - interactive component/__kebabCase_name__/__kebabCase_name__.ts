import { Component, useReactivity, useScope } from "core";
import { ref, reactive } from "@vue/reactivity";
import { useEvents, useStore } from "composables";
import { getProps, extend } from "utils";

export function {{pascalCase name}}(args) {
	// Extend

	extend(Component, this, args);
	const node = args.el;

	// Props

	const { on, once } = useEvents();
	const { child, children } = useScope(this);
	const { watch, effect, computed } = useReactivity();

	const { } = getProps(node);

	// Vars
	
	// Hooks
	
	onMounted(() => {});
	
	onUnmounted(() => {});
	
	// Functions
	
	// Effects
	
}
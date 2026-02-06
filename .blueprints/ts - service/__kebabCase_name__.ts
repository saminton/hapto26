import { onRendered } from "composables";
import { ref, reactive } from "@vue/reactivity";
import { Service, useReactivity } from "core";
import { extend, getProps } from "utils";

export function {{pascalCase name}}(args) {
	// Extend

	extend(Service, this, args);
	const node = args.el;

	// Props

	const { watch, effect } = useReactivity();
	const {} = getProps(node);

	// Vars

	// Hooks
	onMounted(() => {});

	onUnmounted(() => {});

	onRendered(node, () => {});

	// Handles

	// Effects
}

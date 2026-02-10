import { Component, useReactivity, useRouter, useScope } from "core";
import { ref, reactive } from "@vue/reactivity";
import {
	onAfterRender,
	onBeforeRender,
	onRendered,
	useAnim,
	useEvents,
	useSticky,
	useStore,
} from "composables";
import { getProps, extend } from "utils";

export function Test(args) {
	// Extend

	extend(Component, this, args);
	const node = args.el;

	// Props

	const { on, once } = useEvents();
	const { child, children } = useScope(this);
	const { watch, effect } = useReactivity();

	const {} = getProps(node);

	// Vars

	const device = useStore("device");
	const router = useRouter();

	const buttonEl = child("button");
	const titleEl = child("title");

	useSticky({
		el: titleEl,
		align: "top",
	});

	// Hooks

	onMounted(() => {
		on(buttonEl, "click", () => router.replace("test"));
	});

	onUnmounted(() => {});

	// Functions

	// Effects
}

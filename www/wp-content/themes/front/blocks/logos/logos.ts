import { Component, useReactivity, useScope } from "core";
import { ref, reactive } from "@vue/reactivity";
import { useEvents, useStore } from "composables";
import { getProps, extend } from "utils";
import { useLoop } from "composables/loop";
import { useCarousel } from "composables/carousel";

export interface LogosComponent extends Component {
	el: HTMLElement;
}

export function Logos(args: Component) {
	// Extend

	extend(Component, this, args);
	const node = args.el;

	// Props

	const { on, once } = useEvents();
	const { child, children } = useScope(this);
	const { watch, effect, computed } = useReactivity();

	const {} = getProps(node);

	// Vars

	const itemsEl = child("items");

	const loop = useCarousel({
		el: itemsEl,
		align: "center",
	});

	// Hooks

	onMounted(() => {});

	onUnmounted(() => {});

	// Functions

	// Effects
}

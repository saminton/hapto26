import { ref } from "@vue/reactivity";
import { useEvents } from "composables";
import { Component, useReactivity, useScope } from "core";
import { clamp, extend, getProps } from "utils";

export function Quantity(args) {
	// Extend

	extend(Component, this, args);
	const node = args.el;

	// Props

	const { on, once } = useEvents();
	const { child, children } = useScope(this);
	const { watch, effect } = useReactivity();

	const props = getProps(node);

	// Vars

	const fieldEL = child("field") as HTMLInputElement;

	const { min, max, value } = getProps(fieldEL);
	const lessEL = child("less");
	const moreEL = child("more");
	const amount = ref(value);

	// Hooks

	onMounted(() => {
		on(lessEL, "click", decrement);
		on(moreEL, "click", increment);
	});

	// Functions

	const add = (value) => {
		let total = Number(fieldEL.value) + value;
		if (min !== undefined) total = Math.max(total, min);
		if (max !== undefined) total = Math.min(total, max);
		amount.value = total;
	};

	const increment = () => {
		add(1);
	};

	const decrement = () => {
		add(-1);
	};

	// Effects

	effect(() => {
		fieldEL.value = amount.value;
	});
}

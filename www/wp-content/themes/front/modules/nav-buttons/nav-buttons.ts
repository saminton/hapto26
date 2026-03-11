import { Component, useReactivity, useScope } from "core";
import { ref, reactive } from "@vue/reactivity";
import { useEvents, useStore } from "composables";
import { getProps, extend, attr, aria } from "utils";

export function NavButtons(args: Component) {
	// Extend

	extend(Component, this, args);
	const node = args.el;

	// Props

	const { on, once } = useEvents();
	const { child, children } = useScope(this);
	const { watch, effect } = useReactivity();

	const {} = getProps(node);

	// Vars

	const previousEl = child("previous");
	const nextEl = child("next");
	const emit = defineEmits();
	const atStart = ref(false);
	const atEnd = ref(false);

	// Hooks

	onMounted(() => {
		on([previousEl, nextEl], ["mousedown", "mouseup", "click"], prevent);
		on(previousEl, "click", () => emit("previous"));
		on(nextEl, "click", () => emit("next"));
	});

	onUnmounted(() => {});

	// Functions

	const prevent = (el: HTMLElement, e: Event) => {
		e.stopPropagation();
		el.blur();
	};

	// Effects

	effect(() => {
		if (previousEl) aria(previousEl, "disabled", atStart.value);
		if (nextEl) aria(nextEl, "disabled", atEnd.value);
	});

	defineExpose({
		atStart,
		atEnd,
	});
}

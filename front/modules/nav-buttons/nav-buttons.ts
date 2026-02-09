import { Component, useReactivity, useScope } from "core";
import { ref, reactive } from "@vue/reactivity";
import { useEvents, useStore } from "composables";
import { getProps, extend, attr } from "utils";

export function NavButtons(args) {
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

	const prevent = (el, e) => {
		e.stopPropagation();
		el.blur();
	};

	// Effects

	effect(() => {
		previousEl.toggleAttribute("disabled", atStart.value);
		nextEl.toggleAttribute("disabled", atEnd.value);
	});

	defineExpose({
		atStart,
		atEnd,
	});
}

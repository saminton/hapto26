import { Component, useReactivity, useScope } from "core";
import { ref, reactive } from "@vue/reactivity";
import { useEvents, useStore } from "composables";
import { getProps, extend } from "utils";

export function Searchbar(args) {
	// Extend

	extend(Component, this, args);
	const node = args.el;

	// Props

	const { on, once } = useEvents();
	const { child, children } = useScope(this);
	const { watch, effect, computed } = useReactivity();

	const {} = getProps(node);

	// Vars

	const input = child("input", true);
	const submitEl = child("submit");
	const emit = defineEmits();

	// Hooks

	onMounted(() => {
		on(submitEl, "click", submit);
		on(input.el, "keydown", keydown);
		console.log(`submitEl`, submitEl);
		console.log(`input.el`, input.el);
	});

	onUnmounted(() => {});

	// Functions

	const keydown = (el, e) => {
		if (e.key == "Enter") {
			submit();
		}
	};

	const submit = () => {
		console.log(`'submit'`, "submit");
		emit("submit", input.value);
	};

	// Effects

	defineExpose({
		value: input.value,
		isFocused: input.isFocused,
		clear: input.clear,
	});
}

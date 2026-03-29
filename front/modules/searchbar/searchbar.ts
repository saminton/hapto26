import { InputComponent } from "atoms/input";
import { useEvents } from "composables";
import { Component, useReactivity, useScope } from "core";
import { extend, getProps } from "utils";

export function Searchbar(args: Component) {
	// Extend

	extend(Component, this, args);
	const node = args.el;

	// Props

	const { on, once } = useEvents();
	const { child, children, component } = useScope(this);
	const { watch, effect, computed } = useReactivity();

	const {} = getProps(node);

	// Vars

	const input = component("input") as InputComponent;
	const submitEl = child("submit");
	const emit = defineEmits();

	// Hooks

	onMounted(() => {
		on(submitEl, "click", submit);
		on(input.el, "keydown", keydown);
	});

	onUnmounted(() => {});

	// Functions

	const keydown = (el: HTMLElement, e: KeyboardEvent) => {
		if (e.key == "Enter") {
			submit();
		}
	};

	const submit = () => {
		emit("submit", input.value);
	};

	// Effects

	defineExpose({
		value: input.value,
		isFocused: input.isFocused,
		clear: input.clear,
	});
}

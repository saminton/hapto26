import { ref } from "@vue/reactivity";
import { useEvents } from "composables";
import { Component, useReactivity, useScope } from "core";
import { aria, debounce, extend, getProps } from "utils";

export function Textarea(args) {
	// Extend

	extend(Component, this, args);
	const node = args.el;

	// Props

	const { on, once } = useEvents();
	const { child, children } = useScope(this);
	const { watch, effect } = useReactivity();

	const props = getProps(node);

	// Vars

	const fieldEl = child("field");
	const areaEl = child("area");
	const countEl = child("count");

	const value = ref("");
	const isFocused = ref(false);

	// Hooks

	onMounted(() => {
		// Mutation can be replaced with :has selector when available
		const observer = new MutationObserver(mutate);
		observer.observe(areaEl, {
			attributes: true, //
			attributeFilter: ["disabled", "aria-invalid"],
			subtree: false,
		});
		on(areaEl, "keydown", debounce(onChange, 0.1));
		on(areaEl, "focusin", () => (isFocused.value = true));
		on(areaEl, "focusout", () => (isFocused.value = false));
		on(areaEl, ["change", "keyup", "input"], autoHeight);
		mutate();
		autoHeight();
	});

	onUnmounted(() => {});

	// Function

	const onChange = () => {
		value.value = areaEl.value;
	};

	const mutate = () => {
		node.toggleAttribute("disabled", areaEl.hasAttribute("disabled"));
		aria(node, "invalid", areaEl.getAttribute("aria-invalid"));
	};

	const autoHeight = () => {
		fieldEl.style.height = 0;
		fieldEl.style.height = areaEl.scrollHeight + "px";
	};

	// Functions

	// Effects
	effect(() => {
		node.toggleAttribute("filled", isFocused.value || value.value != "");
	});
}

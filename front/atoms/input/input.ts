import { ref } from "@vue/reactivity";
import { useEvents } from "composables";
import { Component, useReactivity, useScope } from "core";
import { aria, debounce, extend, getProps } from "utils";

export function Input(args) {
	// Extend

	extend(Component, this, args);
	const node = args.el;

	// Props

	const { on, once } = useEvents();
	const { child, children } = useScope(this);
	const { watch, effect } = useReactivity();

	const {} = getProps(node);

	// Vars

	const areaEl = child("area") as HTMLInputElement;

	const value = ref("");
	const isFocused = ref(false);

	// Hooks

	onMounted(async () => {
		// Mutation can be replaced with :has selector when available
		const observer = new MutationObserver(mutate);
		observer.observe(areaEl, {
			attributes: true, //
			attributeFilter: ["disabled", "aria-invalid"],
			subtree: false,
		});
		on(areaEl, "keydown", debounce(onChange, 0.1));
		on(areaEl, ["change", "propertychange", "paste", "cut", "mousedown"], onChange);
		on(areaEl, "focusin", () => (isFocused.value = true));
		on(areaEl, "focusout", () => (isFocused.value = false));
		mutate();
	});

	onUnmounted(() => {
		//
	});

	// Function

	const onChange = (el, e) => {
		value.value = el.value;
	};

	effect(() => {
		node.toggleAttribute("filled", isFocused.value || value.value != "");
	});

	const mutate = () => {
		node.toggleAttribute("disabled", areaEl.hasAttribute("disabled"));
		aria(node, "invalid", areaEl.getAttribute("aria-invalid"));
	};

	const clear = () => {
		areaEl.value = "";
		value.value = "";
	};

	// Effects

	defineExpose({
		el: node,
		value,
		isFocused,
		clear,
	});
}

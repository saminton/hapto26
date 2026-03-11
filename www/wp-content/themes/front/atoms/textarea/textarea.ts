import { ref } from "@vue/reactivity";
import { useEvents } from "composables";
import { Component, useReactivity, useScope } from "core";
import { aria, attr, debounce, extend, getProps } from "utils";

export interface TextareaComponent extends Component {
	el: HTMLTextAreaElement;
	value: string;
	isFocused: boolean;
	clear: () => void;
}

export function Textarea(args: Component) {
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
	const areaEl = child("area") as HTMLTextAreaElement;
	const countEl = child("count");

	const value = ref("");
	const isFocused = ref(false);

	// Hooks

	onMounted(() => {
		// Mutation can be replaced with :has selector when available
		const observer = new MutationObserver(mutate);
		if (areaEl)
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
		if (areaEl) value.value = areaEl.value;
	};

	const mutate = () => {
		if (!areaEl) return;
		attr(node, "disabled", areaEl.hasAttribute("disabled"));
		aria(node, "invalid", areaEl.getAttribute("aria-invalid"));
	};

	const autoHeight = () => {
		if (!fieldEl || !areaEl) return;
		fieldEl.style.height = "0";
		fieldEl.style.height = areaEl.scrollHeight + "px";
	};

	// Functions

	// Effects
	effect(() => {
		node.toggleAttribute("filled", isFocused.value || value.value != "");
	});
}

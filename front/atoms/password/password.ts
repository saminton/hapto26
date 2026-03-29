import { ref } from "@vue/reactivity";
import { useEvents } from "composables";
import { Component, useReactivity, useScope } from "core";
import { aria, attr, extend, getProps } from "utils";

interface PasswordComponent extends Component {
	el: HTMLInputElement;
	isVisible: boolean;
	toggle: () => void;
}

export function Password(args: Component) {
	// Extend

	extend(Component, this, args);
	const node = args.el;

	// Props

	const { on, once } = useEvents();
	const { child, children } = useScope(this);
	const { watch, effect } = useReactivity();

	const {} = getProps(node);

	// Vars

	const events = useEvents();
	const toggleEl = child("toggle");
	const iconEls = children("icon");
	const inputEl = node.querySelector("input");
	const isVisible = ref(false);

	// Hooks

	onMounted(() => {
		events.on(toggleEl, "click", onClick);
	});

	onUnmounted(() => {
		events.off(toggleEl, "click", onClick);
	});

	// Effects

	effect(() => {
		aria(iconEls[0], "hidden", !isVisible.value);
		aria(iconEls[1], "hidden", isVisible.value);
		if (inputEl) attr(inputEl, "type", isVisible.value ? "text" : "password");
	});

	// Handles

	const onClick = () => {
		isVisible.value = !isVisible.value;
	};

	// Functions
}

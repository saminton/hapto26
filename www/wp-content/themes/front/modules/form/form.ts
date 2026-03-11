import { useEvents, useStore } from "composables";
import { FormState, useForm } from "composables/form";
import { Component, useReactivity, useScope } from "core";
import { ajax, aria, extend, getProps } from "utils";

export function Form(args: Component) {
	// Extend

	extend(Component, this, args);
	const node = args.el;

	// Props

	const { on, once } = useEvents();
	const { child, children } = useScope(this);
	const { watch, effect } = useReactivity();

	const {} = getProps(node);

	// Vars
	const closeEls = children("close");
	const fieldsEl = child("fields") as HTMLFormElement;
	const buttonEl = child("button");
	const successEl = child("success");
	const errorEl = child("error");
	const popin = useStore("popinForm");

	const form = useForm({
		el: fieldsEl,
		onSubmit: (data) => request(data),
	});

	// Hooks

	onMounted(() => {
		on(closeEls, "click", closePopin);
	});

	onUnmounted(() => {});

	// Handles
	const closePopin = () => {
		popin.isOpen = false;
	};

	// Functions

	const request = async (data: FormData) => {
		// Add form type
		data.append("type", node.id);

		const res = await ajax("contact-form", data, {
			format: "form",
		});

		return data;
	};

	// Effects

	effect(() => {
		aria(fieldsEl, "hidden", form.state.value != FormState.DEFAULT);
		if (errorEl) aria(errorEl, "hidden", form.state.value != FormState.ERROR);
		if (successEl) aria(successEl, "hidden", form.state.value != FormState.SENT);
	});
}

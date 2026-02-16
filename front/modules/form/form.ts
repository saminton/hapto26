import { ref } from "@vue/reactivity";
import { useEvents, useStore } from "composables";
import { useForm } from "composables/form";
import { Component, useReactivity, useScope } from "core";
import { getProps, extend, aria, ajax } from "utils";

export function Form(args) {
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
	// 0: form
	// 1: error
	// 2: success
	const state = ref(0);

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
		// for (const [key, value] of data.entries()) {
		// 	console.log(`${key}: ${value}`);
		// }
		// Add form type
		data.append("type", node.id);

		const res = await ajax("contact-form", data, {
			format: "form",
		});

		if (res.error) {
			state.value = 1;
		} else {
			state.value = 2;
		}
	};

	// Effects

	effect(() => {
		aria(fieldsEl, "hidden", state.value != 0);
		aria(errorEl, "hidden", state.value != 1);
		aria(successEl, "hidden", state.value != 2);
	});
}

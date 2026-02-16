import { Component, useReactivity, useScope } from "core";
import { ref, reactive } from "@vue/reactivity";
import { useEvents, useStore } from "composables";
import { getProps, extend, ajax, aria } from "utils";
import { useForm } from "composables/form";

export function Newsletter(args) {
	// Extend

	extend(Component, this, args);
	const node = args.el;

	// Props

	const { on, once } = useEvents();
	const { child, children } = useScope(this);
	const { watch, effect } = useReactivity();

	const { errorMessage, successMessage } = getProps(node);

	// Vars

	const formEl = child("form") as HTMLFormElement;
	const inputEl = child("input input") as HTMLInputElement;
	const submitEl = child("submit") as HTMLButtonElement;
	const spinnerEl = child("spinner");

	const isLoading = ref(false);

	// Hooks

	const form = useForm({
		el: formEl,
		onSubmit: (data) => request(data),
		onError: (data) => error(data),
		onSent: (data) => sent(data),
	});

	onMounted(() => {
		//
	});

	onUnmounted(() => {});

	// Functions

	const request = async (data: FormData) => {
		// Add form type
		data.append("type", node.id);

		submitEl.setAttribute("aria-disabled", "true");
		const response = await ajax("newsletter", data, {
			format: "form",
		});

		return response;
	};

	const error = (response) => {
		inputEl.value = "";
		inputEl.placeholder = response.detail ?? errorMessage;
		inputEl.focus();
	};

	const sent = (response) => {
		if (!response.id) {
			error(response);
			return;
		}

		inputEl.value = "";
		inputEl.placeholder = successMessage;
	};

	// Effects

	effect(() => {
		aria(node, "busy", form.isSending.value);
		aria(submitEl, "hidden", form.isSending.value);
		aria(spinnerEl, "hidden", !form.isSending.value);
	});
}

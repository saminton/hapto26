import { ref } from "@vue/reactivity";
import { useEvents } from "composables";
import { FormState, useForm } from "composables/form";
import { Component, useReactivity, useScope } from "core";
import { ajax, aria, extend, getProps } from "utils";

export interface NewsletterComponent extends Component {
	el: HTMLElement;
	errorMessage: string;
	successMessage: string;
}

export function Newsletter(args: Component) {
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

	const error = (response: any) => {
		inputEl.value = "";
		inputEl.placeholder = response.detail ?? errorMessage;
		inputEl.focus();
	};

	const sent = (response: any) => {
		if (!response.id) {
			error(response);
			return;
		}

		inputEl.value = "";
		inputEl.placeholder = successMessage;
	};

	// Effects

	effect(() => {
		aria(node, "busy", form.state.value == FormState.SENDING);
		if (submitEl) aria(submitEl, "hidden", form.state.value == FormState.SENT);
		if (spinnerEl) aria(spinnerEl, "hidden", form.state.value != FormState.SENDING);
	});
}

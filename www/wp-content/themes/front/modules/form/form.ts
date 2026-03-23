import { ref } from "@vue/reactivity";
import { FormState, useForm } from "composables/form";
import { Component, useReactivity, useScope } from "core";
import { ajax, aria, extend, getProps } from "utils";

export interface FormComponent extends Component {
	el: HTMLElement;
}

export function Form(args: Component) {
	// Extend

	extend(Component, this, args);
	const node = args.el;

	// Props

	const { child } = useScope(this);
	const { effect } = useReactivity();

	const {} = getProps(node);

	// Vars

	const fieldsEl = child("fields") as HTMLFormElement;
	const messageEl = child("message") as HTMLElement;

	const form = useForm({
		el: fieldsEl,
		onSubmit: (data) => request(data),
		onSent: (response) => sent(response),
		onError: (response) => error(response),
	});

	let nonce: string;
	const message = ref("");

	// Hooks

	onMounted(async () => {});

	onReady(async () => {
		try {
			const res = await ajax("nonce", { name: "contact_form" });
			nonce = res.data;
		} catch (error) {
			console.error("Error retreiving nonce");
		}
	});

	onUnmounted(() => {});

	// Functions

	const request = async (data: FormData) => {
		// Add form type
		data.append("type", node.id);
		data.append("nonce", nonce);
		let response: object = {};

		try {
			response = await ajax("contact-form", data, {
				format: "form",
			});
		} catch (error) {
			console.error("Error sending form");
		}

		return response;
	};

	const error = (response: any) => {
		message.value = response.data.message;
		console.warn(response);
	};

	const sent = (response: any) => {
		message.value = response.data.message;
		console.warn(response);
	};

	// Effects

	effect(() => {
		messageEl.inert = form.isValid.value && message.value == "";
	});

	effect(() => {
		if (message.value != "") messageEl.textContent = message.value;
	});
}

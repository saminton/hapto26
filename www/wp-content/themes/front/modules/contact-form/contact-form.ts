import { FormState, useForm } from "composables/form";
import { Component, useReactivity, useScope } from "core";
import { ajax, aria, extend, getProps } from "utils";

export interface ContactFormComponent extends Component {
	el: HTMLElement;
}

export function ContactForm(args: Component) {
	// Extend

	extend(Component, this, args);
	const node = args.el;

	// Props

	const { child } = useScope(this);
	const { effect } = useReactivity();

	const {} = getProps(node);

	// Vars

	const fieldsEl = child("fields") as HTMLFormElement;
	const successEl = child("success");
	const errorEl = child("error");

	const form = useForm({
		el: fieldsEl,
		onSubmit: (data) => request(data),
	});

	let nonce: string;

	// Hooks

	onMounted(async () => {});

	onReady(async () => {
		try {
			const res = await ajax("nonce", { name: "contact_form" }, { format: "json" });
			nonce = res;
		} catch (error) {
			console.error(error);
		}
	});

	onUnmounted(() => {});

	// Functions

	const request = async (data: FormData) => {
		// Add form type
		data.append("type", node.id);
		data.append("nonce", nonce);

		try {
			const res = await ajax("contact-form", data, {
				format: "form",
			});
		} catch (error) {
			console.error(error);
		}

		return data;
	};

	// Effects

	effect(() => {
		aria(fieldsEl, "hidden", form.state.value != FormState.DEFAULT);
		if (errorEl) aria(errorEl, "hidden", form.state.value != FormState.ERROR);
		if (successEl) aria(successEl, "hidden", form.state.value != FormState.SENT);
	});
}

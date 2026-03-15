import { Ref, ref } from "@vue/reactivity";
import { useEvents } from "./events";
import { aria, getFormData, isValidField, isValidForm } from "utils";
import { useEmitter } from "./emitter";

export enum FormState {
	DEFAULT,
	SENDING,
	ERROR,
	SENT,
}

export const useForm = (props: {
	el: HTMLFormElement;
	onSubmit: (data: FormData) => Promise<Object>;
	onError?: (respnse: any) => void;
	onSent?: (respnse: any) => void;
}) => {
	// Vars
	const { on, once } = useEvents();
	const fieldEls = props.el.querySelectorAll("input, textarea, select");
	const submitEls = props.el.querySelectorAll(
		"input[type='submit'], button:not([type='button'])",
	);

	const state: Ref<FormState> = ref(FormState.DEFAULT);
	const isValid = ref(true);

	// Hooks
	onMounted(() => {
		on(fieldEls, ["input", "change"], onChange);
		on(fieldEls, "blur", onBlur);
		on(fieldEls, "focus", onFocus);
		on(submitEls, "click", onSubmit);
	});

	const onChange = (el: HTMLFormElement) => {
		isValidField(el, true);
	};

	const onBlur = (el: HTMLFormElement) => {
		isValidField(el, true);
	};

	const onFocus = (el: HTMLFormElement) => {
		aria(el, "invalid", false);
	};

	const onSubmit = async (el: HTMLFormElement, e: Event) => {
		e.preventDefault();

		if (state.value == FormState.SENDING) return;

		isValid.value = isValidForm(props.el, true);

		if (!isValid.value) return;

		state.value = FormState.SENDING;

		try {
			const data = getFormData(props.el);
			const response = await props.onSubmit(data);
			props.onSent?.(response);
			state.value = FormState.SENT;
		} catch (error) {
			console.warn(error);
			props.onError?.(error);
			state.value = FormState.ERROR;
		}
	};

	return {
		isValid,
		state,
	};
};

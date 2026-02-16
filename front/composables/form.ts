import { ref } from "@vue/reactivity";
import { useEvents } from "./events";
import { aria, getFormData, isValidField, isValidForm } from "utils";

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

	const isValid = ref(false);
	const isSending = ref(false);
	const isSent = ref(false);

	// Hooks
	onMounted(() => {
		on(fieldEls, ["input", "change"], onChange);
		on(fieldEls, "blur", onBlur);
		on(fieldEls, "focus", onFocus);
		on(submitEls, "click", onSubmit);
	});

	const onChange = (el, e) => {
		isValid.value = isValidForm(props.el);
	};

	const onBlur = (el) => {
		isValidField(el, true);
		isValid.value = isValidForm(props.el);
	};

	const onFocus = (el) => {
		aria(el, "invalid", null);
	};

	const onSubmit = async (el, e) => {
		e.preventDefault();

		if (isSending.value) return;

		isValid.value = isValidForm(props.el, true);
		if (!isValid.value) return;

		isSending.value = true;

		try {
			const data = getFormData(props.el);
			const response = await props.onSubmit(data);
			props.onSent?.(response);
		} catch (error) {
			console.warn(error);
			props.onError?.(error);
		}

		isSent.value = true;
		isSending.value = false;
	};

	return {
		isValid,
		isSending,
		isSent,
	};
};

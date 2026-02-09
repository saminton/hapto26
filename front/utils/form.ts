import { aria, toArray } from "utils";

export const isValidEmail = (value: string) => {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
};

export const isValidPhoneNumber = (value: string) => {
	return /^[0-9+\(\)#\.\s\/ext-]+$/.test(value);
};

export const isValidDate = (value): boolean => {
	const timestamp = Date.parse(value);
	return !isNaN(timestamp);
};

export const isValidField = (el, setAria: boolean = false) => {
	let isValid = true;

	switch (el.type) {
		case "email":
			isValid = isValidEmail(el.value);
			break;
		case "tel":
			isValid = isValidPhoneNumber(el.value);
			break;
		case "date":
			isValid = isValidDate(el.value);
			break;
	}

	isValid = isValid && isValidRequired(el);

	if (setAria) aria(el, "invalid", isValid ? null : true);
	return isValid;
};

export const isValidRequired = (el) => {
	if (!el.hasAttribute("required")) return true; // check if field is required
	if (el.type === "checkbox") return el.checked;

	return el.value.trim() !== "";
};

export const isValidForm = (node: HTMLElement, setAria: boolean = false) => {
	let hasError = false;
	toArray(node.querySelectorAll("input, textarea, select")).forEach((el) => {
		if (setAria) el.value = el.value.trim();

		const isValid = isValidField(el, setAria);

		if (!isValid) hasError = true;
	});

	return !hasError;
};

export const getFormData = (node: HTMLFormElement) => {
	const formData = new FormData(node);

	// Add checkboxes as arrays
	toArray(node.querySelectorAll("input[type='checkbox']")).forEach((el) => {
		if (el.checked) formData.append(`${el.name}[]`, el.value);
	});

	return formData;
};

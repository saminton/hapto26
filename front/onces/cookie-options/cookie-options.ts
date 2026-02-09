import { Component, useScope, useCookie, useReactivity } from "core";
import { useEvents, useStore } from "composables";
import { aria, extend, getProps } from "utils";

export function CookieOptions(args) {
	// Extend

	extend(Component, this, args);
	const node = args.el;

	// Props

	const { on, once } = useEvents();
	const { child, children } = useScope(this);
	const { watch, effect } = useReactivity();

	const props = getProps(node);

	// Vars

	const userPrefs = useCookie("userPrefs");
	const userPrefsSet = useCookie("userPrefsSet");
	const cookieOptions = useStore("cookieOptions");

	const closeEl = child("close");
	const acceptEl = child("accept");
	const refuseEl = child("refuse");
	const checkboxEls = children("checkbox input");

	// Hooks

	onMounted(() => {
		on(refuseEl, "click", refuse);
		on(acceptEl, "click", accept);
		on(closeEl, "click", close);
		setDefaultValues();
	});

	// Functions

	const setDefaultValues = () => {
		if (userPrefs.value) return null;
		checkboxEls.forEach((el: HTMLInputElement) => {
			if (el.name) el.checked = userPrefs.value[el.name] ?? false;
		});
	};

	const accept = () => {
		const prefs = {};
		checkboxEls.forEach((el: HTMLInputElement) => {
			if (el.name) prefs[el.name] = el.checked;
		});
		userPrefs.value = prefs;
		cookieOptions.isOpen = false;
		userPrefsSet.value = true;
	};

	const refuse = () => {
		const prefs = {};
		checkboxEls.forEach((el: HTMLInputElement) => {
			if (el.name) prefs[el.name] = false;
		});
		userPrefs.value = prefs;
		cookieOptions.isOpen = false;
		userPrefsSet.value = true;
	};

	const close = () => {
		cookieOptions.isOpen = false;
	};

	// Effects

	effect(() => {
		// Show or hide
		node.dataset.completed = userPrefsSet.value === true;
		aria(node, "hidden", !cookieOptions.isOpen);
	});

	effect(() => {
		if (!userPrefs.value) return null;
		checkboxEls.forEach((el: HTMLInputElement) => {
			if (el.name) el.checked = userPrefs.value[el.name];
		});
	});
}

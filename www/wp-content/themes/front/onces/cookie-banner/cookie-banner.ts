import { useEvents, useStore } from "composables";
import { Component, useCookie, useReactivity, useScope } from "core";
import { extend, getProps } from "utils";

export function CookieBanner(args) {
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
	const store = useStore("cookieBanner");
	const page = useStore("page");
	const userPrefsSet = useCookie("userPrefsSet");
	const cookieOptions = useStore("cookieOptions");

	const closeEl = child("close");
	const acceptEl = child("accept");
	const refuseEl = child("refuse");
	const paramsEl = child("params");

	// Hooks

	onMounted(() => {
		on(acceptEl, "click", accept);
		on(closeEl, "click", refuse);
		on(refuseEl, "click", refuse);
		on(paramsEl, "click", configure);
		setDefaultValues();
	});

	onUnmounted(() => {});

	// Functions

	const accept = () => {
		// Save cookies preferences
		const prefs = {};
		Object.keys(userPrefs.value).forEach((key) => {
			prefs[key] = true;
		});
		userPrefs.value = prefs;
		userPrefsSet.value = true;
	};

	const configure = () => {
		cookieOptions.isOpen = true;
	};

	const refuse = () => {
		// Save cookies preferences
		const prefs = {};
		Object.keys(userPrefs.value).forEach((key) => {
			prefs[key] = false;
		});
		userPrefs.value = prefs;
		userPrefsSet.value = true;
	};

	const setDefaultValues = () => {
		if (userPrefs.value) return null;
		userPrefs.value = {};
	};

	// Effects

	effect(() => {
		store.isOpen =
			userPrefsSet.value != true &&
			!cookieOptions.isOpen &&
			!page.el.classList.contains("privacy");
	});

	effect(() => {
		node.setAttribute("aria-hidden", !store.isOpen);
	});
}

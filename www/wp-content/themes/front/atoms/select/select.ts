import { Component, useReactivity, useScope } from "core";
import { ref, reactive } from "@vue/reactivity";
import { useEvents, useMutator, useStore } from "composables";
import { getProps, extend, attr, clamp } from "utils";

export function Select(args) {
	// Extend

	extend(Component, this, args);
	const node = args.el;

	// Props

	const { on, once } = useEvents();
	const { child, children } = useScope(this);
	const { watch, effect } = useReactivity();

	const emit = defineEmits();

	const {} = getProps(node);

	// Vars

	const dropdownEl = child("dropdown");
	const optionsEl = child("options");
	const areaEl = child("area") as HTMLSelectElement;
	const optionEls = children("option");
	const isOpen = ref(false);
	const focusIndex = ref(0);
	const device = useStore("device");
	const mutator = useMutator();
	const scroll = mutator.findService("scroll", optionsEl);

	const current = ref(areaEl.value);
	const name = areaEl.name;

	// Hooks

	onMounted(() => {
		on(areaEl, "mousedown", onClick);
		on(window, "click", onClick);
		on(window, "keydown", onKeyDown);
		on(areaEl, "keydown", onAreaKeyDown);
		on(optionEls, ["keydown", "click"], onSelect);
		on(areaEl, "change", changed);
	});

	onUnmounted(() => {});

	// Functions

	const changed = () => {
		current.value = areaEl.value;
		console.log(`'chamge'`, "chamge", areaEl.value);
		emit("change");
	};

	const onClick = (el: HTMLElement, e: Event) => {
		if (device.isTouch) return; // Native select on touch devices

		if (e.target == areaEl) {
			e.preventDefault();
			open();
		} else {
			close();
			return;
		}
	};

	const onKeyDown = (el: HTMLElement, e: KeyboardEvent) => {
		if (!isOpen.value) return;
		if (e.code == "Tab") close();
	};

	const onAreaKeyDown = (el: HTMLElement, e: KeyboardEvent) => {
		e.stopPropagation();

		if (e.code == "Space" || e.code == "Enter") {
			e.preventDefault();
			toggle();
			focus(0);
		}
		if (e.code == "ArrowDown" || e.code == "ArrowUp") {
			e.preventDefault();
			open();
			focus(0);
		}
	};

	const onSelect = (el: HTMLElement, e: KeyboardEvent | PointerEvent) => {
		e.preventDefault();
		e.stopPropagation();

		let selected = false;
		if (e instanceof KeyboardEvent) {
			if (e.code == "Space" || e.code == "Enter") {
				selected = true;
				areaEl.focus();
			}

			if (e.code == "ArrowDown") focus(focusIndex.value + 1);
			if (e.code == "ArrowUp") focus(focusIndex.value - 1);

			// Letters
			if (e.key.match(/^[a-zA-Z]?$/)) {
				find(e.key);
				return;
			}

			// Numbers
			if (e.key.match(/^[0-9]?$/)) {
				find(e.key);
				return;
			}
		}

		if (e instanceof PointerEvent || e instanceof MouseEvent) {
			selected = true;
			el.blur();
		}

		if (selected) {
			e.preventDefault();

			const options = Array.from(areaEl.options);
			const foundEl = options.find((option) => option.value === el.dataset.value);
			foundEl.selected = true;

			changed();
			close();
		}
	};

	const find = (letter: string) => {
		const found = optionEls.findIndex(
			(el) => el.dataset.value.charAt(0).toLowerCase() == letter
		);
		if (found != -1) focus(found);
	};

	const focus = (i: number) => {
		focusIndex.value = clamp(i, 0, optionEls.length - 1);
		optionEls[focusIndex.value].focus();
	};

	const toggle = () => {
		isOpen.value = !isOpen.value;
	};

	const open = () => {
		isOpen.value = true;
	};

	const close = () => {
		isOpen.value = false;
	};

	const reset = () => {
		areaEl.selectedIndex = 0;
		changed();
		close();
	};

	// Effects

	effect(() => {
		if (isOpen.value) {
			dropdownEl.style.height = optionsEl.offsetHeight + "px";
			node.focus();
		} else {
			dropdownEl.style.height = areaEl.offsetHeight + "px";
			focusIndex.value = null;
		}
		node.toggleAttribute("open", isOpen.value);
		optionEls.forEach((el) => {
			attr(el, "tabindex", isOpen.value ? "0" : "-1");
		});

		node.style.zIndex = isOpen.value ? 10 : "";
		scroll.isEnabled.value = isOpen.value;
	});

	defineExpose({
		name,
		current,
		reset,
		open,
		close,
		toggle,
		focus,
	});
}

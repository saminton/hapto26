import { Ref, ref, unref } from "@vue/reactivity";
import { useEvents } from "./events";
import { onBeforeResize } from "./resizer";
import { aria, getBounds, withDefaults } from "../utils";
import { onNodeResized } from "./node-resizer";
import { useReactivity } from "core";
// https://css-tricks.com/how-to-animate-the-details-element/
// https://www.w3.org/WAI/ARIA/apg/patterns/accordion/examples/accordion/

export const useAccordion = (props: {
	el?: HTMLElement;
	summaryEl?: HTMLButtonElement;
	contentEl?: HTMLElement;
	isActive?: boolean | Ref<boolean>;
}) => {
	// Vars
	const { on, once } = useEvents();

	const {
		isActive, //
		summaryEl,
		contentEl,
	} = withDefaults(props, {
		isActive: true,
		summaryEl: props.el?.children[0],
		contentEl: props.el?.children[1],
	}) as typeof props;

	const formEls = Array.from(contentEl.querySelectorAll("button, input, textarea"));
	const isOpen = ref(null);
	let contentHeight = 0;

	const { watch, effect } = useReactivity();

	// Hooks
	onMounted(() => {
		if (summaryEl.tagName !== "BUTTON")
			console.warn("Accordion: Prop summaryEl must be a <button>");

		summaryEl.setAttribute("role", "button");
		contentEl.setAttribute("role", "region");

		resize();
		on(summaryEl, "click", onToggle);
		update(isOpen.value, null);
	});

	onBeforeResize(() => {
		resize();
	});

	onNodeResized(contentEl, () => {
		resize();
	});

	const resize = () => {
		const bounds = getBounds(contentEl.children[0]);
		contentHeight = bounds.height;
		contentEl.style.overflow = "hidden";
	};

	const onToggle = (el, e) => {
		if (!unref(isActive)) return;
		e.preventDefault();

		isOpen.value = !isOpen.value;
	};

	const open = () => {
		isOpen.value = true;
	};

	const close = () => {
		isOpen.value = false;
	};

	const update = (current, old) => {
		contentEl.style.height = old ? contentHeight + "px" : "0";
		requestAnimationFrame(() => {
			contentEl.style.height = current ? contentHeight + "px" : "0";
		});

		const value = window.getComputedStyle(contentEl).transitionDuration;
		const duration = value.includes("ms") ? parseFloat(value) : parseFloat(value) * 1000;

		setTimeout(() => {
			if (isOpen.value) contentEl.style.height = "auto";
		}, duration);
	};

	watch(isOpen, update);

	effect(() => {
		// Make form elements unfocasables when collapsed
		formEls.forEach((el: HTMLElement) => {
			if (!isOpen.value) el.setAttribute("tabindex", "-1");
			else el.removeAttribute("tabindex");
		});

		aria(summaryEl, "expanded", isOpen.value);
		aria(contentEl, "hidden", !isOpen.value);
	});

	return {
		isOpen,
		open,
		close,
		resize,
		summaryEl,
		contentEl,
	};
};

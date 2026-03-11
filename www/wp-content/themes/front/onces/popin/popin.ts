import { Component, useReactivity, useScope } from "core";

import { syncToStore, useEvents, useMutator, useStore } from "composables";
import { gsap } from "gsap";
import { ScrollService } from "services";
import { ajax, aria, easing, extend, getProps } from "utils";

export interface PopinComponent extends Component {
	el: HTMLElement;
	isOpen: boolean;
	load: (type: string, data: {}) => void;
	goTo: (url: string) => void;
	open: (callback?: CallableFunction) => void;
	close: () => void;
}

export function Popin(args: Component) {
	// Extend

	extend(Component, this, args);
	const node = args.el;

	// Props

	const { on, once } = useEvents();
	const { child, children, service } = useScope(this);
	const { watch, effect } = useReactivity();

	const {} = getProps(node);

	// Vars

	const mutator = useMutator();
	const contentEl = child("content");
	const contentScroll = service("scroll") as ScrollService;

	const overlay = useStore("overlay");
	const closeEl = child("close");
	const page = useStore("page");
	const scroll = useStore("scroll");
	const store = useStore("popin");
	store.el = node;
	let onClose: Function | null;

	// Hooks

	onMounted(() => {
		on(closeEl, "click", close);
	});

	onUnmounted(() => {});

	// Handles

	// Functions

	const goTo = async (url: string) => {
		await load("page", { url });
	};

	const load = async (type: string, data: {}) => {
		const response = await ajax(type, data);

		let el = document.createElement("div") as Element;
		el.innerHTML = response.html ?? response;

		const pageEl = el.querySelector(`main`);
		const targetEl = el.querySelector('main [v-barba="popin"]');
		el = targetEl ?? pageEl ?? el;

		if (store.isOpen) await close();

		if (!el || !contentEl) {
			return;
		}

		// Clear old content
		contentEl.innerHTML = "";
		contentScroll.set(0, false);
		// Set new content
		contentEl.style.opacity = "0";
		contentEl.innerHTML = el.innerHTML;

		// Wait for content to load
		await once(mutator, "ready");

		// Show new content

		// Extra time for sticky to setup
		await new Promise<void>((resolve, reject) => {
			setTimeout(resolve, 100);
		});

		contentEl.style.opacity = "1";
	};

	const open = async (callback?: CallableFunction) => {
		store.isOpen = true;
		aria(node, "hidden", false);

		await gsap.fromTo(
			node,
			{
				y: "100%",
				opacity: 1,
			},
			{
				y: "0%",
				ease: easing("ease_out"),
				delay: 0.4,
			},
		);

		contentScroll.isEnabled.value = true;
		if (callback) onClose = callback;
	};

	const close = async () => {
		store.isOpen = false;
		await gsap.fromTo(
			node,
			{
				y: "0%",
			},
			{
				y: "100%",
				ease: easing("ease_out"),
			},
		);

		aria(node, "hidden", true);
		node.style.opacity = "0";
		node.style.transform = "";

		// Time for popin to reset itself
		await new Promise<void>((resolve, reject) => {
			setTimeout(resolve, 100);
		});

		if (onClose) onClose();
		onClose = null;

		// await gsap.fromTo(
		// 	node,
		// 	{
		// 		scale: 1,
		// 		opacity: 1,
		// 	},
		// 	{
		// 		scale: 0.95,
		// 		opacity: 0,
		// 		ease: easing("ease_out"),
		// 		duration: 0.5,
		// 	}
		// );
	};

	watch(
		() => store.isOpen,
		() => {
			scroll.isEnabled = !store.isOpen;
			// overlay.isOpen = store.isOpen;
			// aria(closeEl, "hidden", store.isOpen);
			// overlay.el.setAttribute("popin", store.isOpen);
		},
	);

	watch(() => page.isReady, close);

	syncToStore("popin", {
		el: node,
		load,
		goTo,
		open,
		close,
	});
}

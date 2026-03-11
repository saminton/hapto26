import {
	events,
	useDevice,
	useGtag,
	usePointer,
	useRenderer,
	useResizer,
	useStore,
} from "composables";
import "core/declare";
import "theme/declare";
import barba from "@barba/core";
import { getTransitions } from "theme";
import { useMutator } from "../composables/mutator";
import gsap from "gsap";
import { attr, getProps } from "utils";
import { effect } from "@vue/reactivity";
import { Component } from "./component";

export function App(
	components: Component[],
	services: Component[],
	plugins: Component[],
) {
	const init = async () => {
		const device = useDevice();
		const pointer = usePointer();
		const renderer = useRenderer();
		const resizer = useResizer();
		const mutator = useMutator();
		const gtag = useGtag();
		const page = useStore("page");
		const transitions = getTransitions();
		const scroll = useStore("scroll");
		const loader = useStore("loader");
		const store = useStore("pointer");

		device.init();
		pointer.init();
		renderer.init();
		gtag.init();

		gsap.config({
			autoSleep: 60,
			nullTargetWarn: false,
		});

		(window as any).where = () => {
			console.log(scroll.position);
		};

		(window as any).demo = (from = 0, to = scroll.size, speed = 1) => {
			scroll.target = from;
			scroll.position = from;
			gsap.to(scroll, {
				keyframes: { target: [from, to], ease: "none" },
				duration: ((to - from) * 0.002) / speed,
				delay: 1,
			});
		};

		if (document.querySelector(`main[v-barba]`))
			barba.init({
				transitions: transitions,
				debug: true,
				logLevel: "warning",
				schema: {
					prefix: "v-barba",
				},
				prevent: ({ event }: { event: Event }) => {
					if (event.type !== "click") return;
					if (store.preventClick) {
						event.preventDefault();
						event.stopPropagation();
						return true;
					}
				},
			});

		// Update page
		page.el = document.querySelector(`main`);
		page.props = getProps(page.el);

		// If no barba container force reload page
		// Usefull for plugin pages / woocommerce
		barba.hooks.afterLeave((data: any) => {
			if (!data.next.html.includes('v-barba="container"'))
				location.assign(data.next.url.href);
			// window.location.href = data.next.url.href;
		});

		barba.hooks.before((data: any) => {
			scroll.isEnabled = false;
		});

		barba.hooks.beforeEnter(async (data: any) => {
			// Wait for components to load
			await events.once(mutator, "ready");
		});

		barba.hooks.enter(async (data: any) => {
			// Update page info
			page.el = data.next.container;
			page.props = getProps(page.el);
			page.isReady = true;
			scroll.isEnabled = false;
		});

		barba.hooks.after(async (data: any) => {
			scroll.isEnabled = true;
		});

		mutator.init({
			el: document.body,
			components,
			services,
			plugins,
		});

		events.on(window, ["mouseup"], blur);
		events.on(window, ["keydown"], onKeydown);

		// Prevent firefox default dragging behaviour
		document.addEventListener("dragstart", (e) => e.preventDefault());

		// Wait for components to load
		await events.once(mutator, "complete");

		loader.hide();
		page.isReady = true;
		scroll.isEnabled = true;
	};

	// Prevent focus state on click
	const blur = (el: HTMLElement, event: Event) => {
		let target = event.target as HTMLElement;
		let targetEl = target.closest?.("a, button, summary, label") as HTMLElement | null;
		if (targetEl && targetEl.tagName == "LABEL")
			targetEl = targetEl.querySelector("input[type='radio'], input[type='checkbox']");

		if (targetEl)
			requestAnimationFrame(() => {
				targetEl.blur();
			});
	};

	const onKeydown = (el: HTMLElement, e: KeyboardEvent) => {
		if (e.key == "g" && e.ctrlKey) document.body.toggleAttribute("grid");
	};

	window.addEventListener("load", () => init());
}

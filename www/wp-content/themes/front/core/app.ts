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

export function App(components, services, plugins) {
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

		const store = useStore("pointer");

		if (document.querySelector(`main[v-barba]`))
			barba.init({
				transitions: transitions,
				debug: true,
				logLevel: "warning",
				schema: {
					prefix: "v-barba",
				},
				prevent: ({ event }) => {
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
		barba.hooks.afterLeave((data) => {
			if (!data.next.html.includes('v-barba="container"'))
				location.assign(data.next.url.href);
			// window.location.href = data.next.url.href;
		});

		barba.hooks.before((data) => {
			scroll.isEnabled = false;
		});

		barba.hooks.beforeEnter(async (data) => {
			// Wait for components to load
			await events.once(mutator, "ready");
		});

		barba.hooks.enter(async (data) => {
			// Update page info
			page.el = data.next.container;
			page.props = getProps(page.el);
			page.isReady = true;
			scroll.isEnabled = false;
		});

		barba.hooks.after(async (data) => {
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

		console.log("hide loader");
		console.log(`scroll`, scroll);
		loader.hide();
		page.isReady = true;
		scroll.isEnabled = true;

		effect(() => {
			attr(page.el, "ready", page.isReady);
		});
	};

	// Prevent focus state on click
	const blur = (el, event) => {
		let targetEl = event.target.closest?.("a, button, summary, label");
		if (targetEl && targetEl.tagName == "LABEL")
			targetEl = targetEl.querySelector("input[type='radio'], input[type='checkbox']");

		if (targetEl)
			requestAnimationFrame(() => {
				targetEl.blur();
			});
	};

	const onKeydown = (el, e) => {
		if (e.key == "g" && e.ctrlKey) document.body.toggleAttribute("grid");
	};

	window.addEventListener("load", () => init());
}

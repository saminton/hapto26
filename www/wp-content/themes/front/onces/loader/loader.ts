import { useEvents, useStore } from "composables";
import { Component, useReactivity, useScope } from "core";
import { gsap } from "gsap";
import { easing, extend, getProps } from "utils";

export function Loader(args) {
	// Extend

	extend(Component, this, args);
	const node = args.el;

	// Props

	const { on, once } = useEvents();
	const { child, children } = useScope(this);
	const { watch, effect } = useReactivity();

	const {} = getProps(node);

	// Vars

	const store = useStore("loader");
	const page = useStore("page");

	// Hooks

	onMounted(() => {
		on(window, "click", onClick);
	});

	onReady(() => {
		hide();
	});

	onUnmounted(() => {});

	// Functions

	const onClick = (e) => {
		console.log(`click`);
		store.isOpen ? hide() : show();
	};

	const show = async () => {
		store.isOpen = true;
		// await gsap.fromTo(
		// 	node,
		// 	{
		// 		clipPath: `inset(0 100% 0 0)`,
		// 	},
		// 	{
		// 		clipPath: `inset(0 0% 0 0)`,
		// 		ease: easing("ease_in"),
		// 	}
		// );
	};

	const hide = async () => {
		store.isOpen = false;
		// gsap.fromTo(
		// 	node,
		// 	{
		// 		clipPath: `inset(0 0 0 0%)`,
		// 	},
		// 	{
		// 		clipPath: `inset(0 0 0 100%)`,
		// 		ease: easing("ease_out"),
		// 		delay: 0.2,
		// 	}
		// );
	};

	// Effects

	watch(
		() => store.isOpen,
		() => {
			node.setAttribute("aria-hidden", !store.isOpen);
		},
	);

	store.show = show;
	store.hide = hide;

	// Provide
}

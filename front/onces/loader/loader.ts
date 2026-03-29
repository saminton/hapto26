import { useEvents, useStore } from "composables";
import { Component, useReactivity, useScope } from "core";
import { gsap } from "gsap";
import { aria, cssVar, easing, extend, getProps } from "utils";

export interface LoaderComponent extends Component {
	el: HTMLElement;
	isOpen: boolean;
	show: () => void;
	hide: () => void;
}

export function Loader(args: Component) {
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
	const frameEl = child("frame");
	const logoEl = child("logo");
	const backgroundEl = child("background");

	// Hooks

	onMounted(async () => {});

	onReady(() => {
		hide();
	});

	onUnmounted(() => {});

	// Functions

	const show = async () => {};

	const hide = async () => {
		if (!store.isOpen) return;
		store.isOpen = false;

		const base = "0rem";
		const top = cssVar("frame_top");
		const bottom = cssVar("frame_bottom");
		const right = cssVar("frame_right");

		const from = `polygon(
			0% 0%,
			0% 100%,
			${base} 100%,
			${base} ${base},
			calc(100% - ${base}) ${base},
			calc(100% - ${base}) calc(100% - ${base}),
			${base} calc(100% - ${base}),
			${base} 100%,
			100% 100%,
			100% 0%
		)`;

		const to = `polygon(
			0% 0%,
			0% 100%,
			${right} 100%,
			${right} ${top},
			calc(100% - ${right}) ${top},
			calc(100% - ${right}) calc(100% - ${bottom}),
			${right} calc(100% - ${bottom}),
			${right} 100%,
			100% 100%,
			100% 0%
		)`;

		const tl = gsap.timeline();

		tl.fromTo(
			frameEl,
			{
				clipPath: from,
			},
			{
				clipPath: to,
				ease: easing("ease_out"),
				delay: 0.2,
			},
			0,
		);

		tl.to(
			logoEl,
			{
				opacity: 0,
			},
			0,
		);

		tl.to(
			backgroundEl,
			{
				opacity: 0,
			},
			0.5,
		);

		await tl;

		node.hidden = true;
	};

	// Effects

	store.show = show;
	store.hide = hide;

	// Provide
}

import { Component, useReactivity, useScope } from "core";
import { ref, reactive, Ref } from "@vue/reactivity";
import { onResized, useEvents, useStore } from "composables";
import { getProps, extend, getRelativeBounds, getBounds } from "utils";
import { gsap } from "gsap";

export interface SolutionDemoComponent extends Component {
	el: HTMLElement;
	progress: Ref<number>;
}

export function SolutionDemo(args: Component) {
	// Extend

	extend(Component, this, args);
	const node = args.el;

	// Props

	const { on, once } = useEvents();
	const { child, children } = useScope(this);
	const { watch, effect, computed } = useReactivity();

	const {} = getProps(node);

	// Vars

	const cardMainEl = child("card_main") as HTMLElement;
	const mediaEl = child("media") as HTMLElement;
	const cardSecondaryEls = children("card_secondary") as HTMLElement[];

	const progress = ref(0);
	const device = useStore("device");
	let timeline: GSAPTimeline;

	// Hooks

	onMounted(() => {
		createTimeline();
	});

	onResized(() => {
		createTimeline();
	});

	onUnmounted(() => {});

	// Functions

	const createTimeline = () => {
		timeline = gsap.timeline({ duration: 1, paused: true });
		timeline.fromTo(
			cardSecondaryEls[0],
			{
				y: 140 * device.rem,
				rotate: -5,
			},
			{
				y: 40 * device.rem,
				rotate: -10,
				duration: 0.5,
			},
			0,
		);
		timeline.fromTo(
			cardSecondaryEls[1],
			{
				y: 170 * device.rem,
				rotate: 5,
			},
			{
				y: 70 * device.rem,
				rotate: 10,
				duration: 0.5,
			},
			0,
		);

		timeline.to(
			[...cardSecondaryEls, cardMainEl],
			{
				opacity: 0,
				duration: 0.25,
			},
			0.5,
		);

		const mediaBounds = getBounds(mediaEl);
		const rel = getRelativeBounds(
			cardMainEl.firstElementChild as HTMLElement,
			mediaBounds,
		);
		const ratio = 1.8;
		const targetHeight = (mediaBounds.width * 1) / ratio;
		const clip = (mediaBounds.height - targetHeight) / 2;

		timeline.fromTo(
			mediaEl,
			{
				clipPath: `inset(${rel.top}px ${rel.right}px ${rel.bottom}px ${rel.left}px round .8rem)`,
			},
			{
				clipPath: `inset(${clip}px 0px ${clip}px 0px round .8rem)`,
				duration: 0.5,
			},
			0.5,
		);

		timeline.fromTo(
			mediaEl.firstElementChild,
			{
				opacity: 0,
			},
			{
				opacity: 1,
				duration: 0.25,
			},
			0.75,
		);
	};

	// Effects

	watch(progress, () => {
		timeline?.progress(progress.value);
	});

	defineExpose({
		progress,
	});
}

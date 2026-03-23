import { Ref, unref } from "@vue/reactivity";
import { useReactivity } from "core";
import { Animation, getAnimations } from "theme";
import { receive, withDefaults } from "utils";
import { useBounds } from "./bounds";
import { useIntersect } from "./intersector";
import { Split, SplitBy, useSplit } from "./split";
import { useStore } from "./store";

export type AnimData = {
	el: HTMLElement;
	html?: Ref<string>;
	letters?: Ref<HTMLElement[]>;
	words?: Ref<HTMLElement[]>;
	lines?: Ref<HTMLElement[]>;
};

export type Anim = {
	play: () => void;
	end: () => void;
	reset: () => void;
	split?: Split;
	set: (callback: (data: AnimData) => GSAPTimeline) => void;
};

export const useAnim = (props: {
	el: HTMLElement; //
	name?: string; // Todo: Ref
	delay?: number; // Todo: Ref
	stagger?: number; // Todo: Ref
	detect?: boolean;
	split?: SplitBy;
	setup?: (data: AnimData) => Promise<void>;
	timeline?: (data: AnimData) => GSAPTimeline;
}): Anim => {
	// Base

	const { watch, effect } = useReactivity();
	props = withDefaults(props, {
		delay: 0,
		detect: true,
	});

	// Vars

	const scroll = receive("scroll", props.el);
	const device = props.stagger ? useStore("device") : null;
	const bounds = props.stagger ? useBounds(props.el) : null;
	const animations = getAnimations();

	let animation: Animation;
	if (props.name) animation = animations.find((item) => item.name === props.name);
	else animation = { name: "custom" };

	animation = withDefaults(animation, {
		isActive: true,
		setup: props.setup,
		timeline: props.timeline,
		delay: 0,
	});

	let split = null;
	if (props.split != null) split = useSplit(props.el, props.split);
	if (animation.split != null) split = useSplit(props.el, animation.split);
	const data = split ?? { el: props.el };

	const intersect = useIntersect(props.el);
	let timeline: GSAPTimeline;
	let isReady = false;

	// Hooks

	onMounted(async () => {
		if (!animation) return;
		await setup();
	});

	onReady(() => {});

	afterReady(() => {
		isReady = true;
		detect();
	});

	// Handles

	// Functions

	const setup = async () => {
		if (animation.setup) await animation.setup(data);
		if (animation.timeline) timeline = animation.timeline(data, props.delay);
		if (timeline && props.detect) {
			timeline.pause();
			timeline.seek(0);
		}

		props.el.style.willChange = "transform";
		detect();
		if (unref(animation.isActive) === false) end();
	};

	const play = (delay?: number) => {
		delay = delay || props.delay || 0;
		if (props.stagger) delay += (bounds.x / device.width) * props.stagger;

		timeline.delay(delay).restart(true);
	};

	const end = () => {
		timeline.totalProgress(1);
	};

	const reset = () => {
		timeline.pause();
		timeline.totalProgress(0);
	};

	const set = (callback: (AnimData: AnimData) => GSAPTimeline) => {
		timeline = callback(data);
	};

	const detect = () => {
		if (
			!props.detect || //
			!isReady ||
			!timeline ||
			unref(animation.isActive) === false
		) {
			return;
		}

		if (intersect.isIntersecting) {
			if (!scroll.isScrolling || scroll.delta > 0) {
				play();
			} else {
				end();
			}
		} else {
			if (scroll.delta < 0) {
				reset();
			} else {
				end();
			}
		}
	};

	// Effects

	watch(
		() => intersect.isIntersecting,
		() => {
			detect();
		},
	);

	if (split)
		watch(
			() => split.html.value,
			() => {
				console.log(`split html changed`);
				setup();
			},
		);

	return {
		play,
		end,
		reset,
		split,
		set,
	};
};

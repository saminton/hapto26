import { Ref, computed, effect, isRef, ref, unref } from "@vue/reactivity";
import { aria, clamp, toArray, withDefaults } from "utils";
import { onNodeResized } from "./node-resizer";
import { onRendered } from "./renderer";
import { useEvents } from "composables";

export function useSlideshow(props: {
	el: HTMLElement;
	containers: HTMLElement[];
	index?: number | Ref<number>;
	canLoop?: boolean | Ref<boolean>;
	autoHeight?: boolean | Ref<boolean>;
	canInterrupt?: boolean | Ref<boolean>;
	interval?: number | Ref<number>;
	transition?: CallableFunction;
	previousEls?: HTMLElement | HTMLElement[] | NodeList;
	nextEls?: HTMLElement | HTMLElement[] | NodeList;
}) {
	// Vars

	// const canLoop = props.canLoop !== undefined ? props.canLoop : true;
	// const autoHeight = props.autoHeight !== undefined ? props.autoHeight : false;
	// const canInterrupt = props.canInterrupt !== undefined ? props.autoHeight : false;
	// const interval = props.interval || 0;

	const {
		canLoop, //
		autoHeight,
		canInterrupt,
		interval,
		previousEls,
		nextEls,
	} = withDefaults(props, {
		canLoop: true,
		autoHeight: false,
		canInterrupt: false,
		interval: 0,
		previousEls: [],
		nextEls: [],
	});

	const startIndex = props.index || 0;
	const index = ref(0);
	const isBusy = ref(false);
	const isPaused = ref(false);
	const { on } = useEvents();

	const timer = ref(0);
	const progress = computed(() => 1 - timer.value / unref(interval));

	// Hooks

	onMounted(() => {
		goTo(unref(startIndex), false);
		if (unref(autoHeight)) adjustHeight();

		on(nextEls, "click", next);
		on(previousEls, "click", previous);
	});

	onNodeResized(props.el, () => {
		if (unref(autoHeight)) adjustHeight();
	});

	onRendered(props.el, (event) => {
		if (isPaused.value || interval == 0) return;
		timer.value -= event.deltaTime;
		if (timer.value < 0) {
			timer.value = interval;
			next();
		}
	});

	// Functions

	const play = () => {
		isPaused.value = false;
	};

	const pause = () => {
		isPaused.value = true;
	};

	const next = () => {
		goTo(index.value + 1);
	};

	const previous = () => {
		goTo(index.value - 1);
	};

	const getTotal = () => {
		return (
			Math.max(
				...props.containers.map((el) => {
					return unref(el).children.length;
				}),
			) ?? 0
		);
	};

	const goTo = async (i: number, isAnimated: boolean = true) => {
		if (!unref(canInterrupt) && isBusy.value) return null;
		isBusy.value = true;

		// loop around when smaller then first or larger than last index
		const total = getTotal();

		const direction = i > index.value ? 1 : -1;

		if (unref(canLoop)) i = total !== 0 ? ((i % total) + total) % total : 0;
		else i = clamp(i, 0, total - 1);

		const from = index.value;
		const to = i;

		index.value = i;

		if (props.transition) {
			// Use transition function if provided
			await props.transition(from, to, direction);
		} else {
			// Otherwise use base transition
			baseTransition(from, to, direction);
		}
		isBusy.value = false;
	};

	const baseTransition = (from: number, to: number, direction: number) => {
		// Simply hide or show the current item
		// in each container
		props.containers.forEach((el) => {
			toArray(el.children).forEach((child, i) => {
				child.style.visibility = to === i ? "" : "hidden";
			});
		});
	};

	const adjustHeight = () => {};

	// Effects

	effect(() => {
		if (previousEls) aria(previousEls, "disabled", index.value == 0 && !unref(canLoop));
		if (nextEls) aria(nextEls, "disabled", index.value == getTotal() && !unref(canLoop));
	});

	return {
		index,
		previous,
		next,
		goTo,
		play,
		pause,
		timer,
		progress,
		isPaused,
	};
}

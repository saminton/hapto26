import { Ref, computed, ref, unref } from "@vue/reactivity";
import {
	onBeforeRender,
	onNodeResized,
	useDrag,
	useEvents,
	useIntersect,
	useStore,
} from "composables";
import { useReactivity } from "core";
import { Bounds } from "types";
import {
	aria,
	attr,
	clamp,
	debounce,
	getBounds,
	getRelativePosition,
	getStyles,
	smooth,
	toArray,
	withDefaults,
} from "utils";

export function useCarousel(props: {
	el: HTMLElement;
	smoothing?: number | Ref<number>;
	startIndex?: number;
	incrementBy?: number | Ref<number>;
	canLoop?: boolean | Ref<boolean>;
	canOvershoot?: boolean | Ref<boolean>;
	canDrag?: boolean | Ref<boolean>;
	align?: string | Ref<string>;
	snap?: boolean | Ref<boolean>;
	previousEls?: HTMLElement | HTMLElement[] | NodeList;
	nextEls?: HTMLElement | HTMLElement[] | NodeList;
}) {
	const { watch, effect } = useReactivity();

	// Vars
	const node = props.el;

	const {
		startIndex,
		smoothing,
		incrementBy,
		canOvershoot,
		canLoop,
		canDrag,
		align,
		snap,
		previousEls,
		nextEls,
	} = withDefaults(props, {
		startIndex: 0,
		smoothing: 10,
		incrementBy: 1,
		canOvershoot: false,
		canLoop: false,
		canDrag: true,
		align: false,
		snap: true,
		previousEls: [],
		nextEls: [],
	}) as typeof props;

	const index = ref(startIndex);
	const delta = ref(0);
	const position = ref(0);
	const progress = ref(0);
	const target = ref(0);
	const isScrolling = ref(false);
	const atStart = ref(false);
	const atEnd = ref(false);
	const scrollDelta = ref(0);
	const pointer = useStore("pointer");
	const device = useStore("device");
	const drag = useDrag(node.parentElement, "x");
	const { on } = useEvents();
	const intersect = useIntersect(node.parentElement);

	const min = ref(0);
	const max = ref(0);

	let items = Array.from(node.children).map((el: HTMLElement) => ({
		el: el,
		width: 0,
		x: 0,
		marginLeft: 0,
		marginRight: 0,
		distance: 0,
	}));
	let bounds = ref({} as Bounds);

	// Hooks

	onMounted(() => {
		storeItemBounds();
		setMinMax();
		goTo(Math.floor(index.value), false);
		on(node, "wheel", onWheel);
		on(node, "wheel", onWheelEnd);

		on(nextEls, "click", next);
		on(previousEls, "click", previous);
	});

	onReady(() => {});

	onNodeResized(node.children, () => resize());

	onBeforeRender(node.parentElement, (tick) => {
		// Smooth position changes
		const calc = smooth(
			target.value,
			position.value,
			device.isTouch && drag.isDown ? 2 : unref(smoothing),
			tick.delta,
		);

		delta.value = calc - position.value || 0;
		position.value = clamp(calc, min.value, max.value);
	});

	// Functions

	const resize = () => {
		if (!node) return null;
		// Reset transform for correct calculations
		items.forEach((item) => {
			item.el.style.transform = "";
		});
		storeItemBounds();
		setMinMax();
		// Trigger position update to reapply external transforms

		if (unref(snap)) goTo(index.value, false);
		else position.value = position.value - 0.1;
	};

	const getIndex = (pos): number => {
		// Start values
		let dist = Infinity;
		let temp = 0;
		// Find item closest to current position
		items.forEach((item, i) => {
			// Calculate offset for each item
			let calc = item.x - pos;

			if (unref(align) === "center") {
				calc += (item.width - bounds.value.width) / 2;
			}

			// Distance = absolute value
			calc = Math.abs(calc);
			item.distance = calc;

			if (calc < dist) {
				temp = i;
				dist = calc;
			}
		});

		// Correct index for first and last elements
		if (pos < 10) {
			temp = 0;
		}
		if (pos > max.value - 10) {
			temp = items.length - 1;
		}

		temp = clamp(temp, 0, items.length - unref(incrementBy));

		// Return index
		return temp;
	};

	const storeItemBounds = () => {
		// Store bounds of container
		bounds.value = getBounds(node);
		const offset = getStyles(node, "margin-left") || 0;

		items.forEach((item) => {
			// Store each item size and offset relative to container on resize
			const temp = getBounds(item.el);
			const { x } = getRelativePosition(temp, bounds.value);
			const styles = getStyles(node, "margin-left", "margin-right");

			item.width = temp.width;
			item.marginLeft = styles.marginLeft;
			item.marginRight = styles.marginRight;
			item.x = x + offset;
		});
	};

	const next = () => {
		goTo(index.value + unref(incrementBy), true, true);
	};

	const previous = () => {
		goTo(index.value - unref(incrementBy), true, true);
	};

	const goTo = (i: number, animate: boolean = true, preventSame: boolean = false) => {
		const total = items.length;
		if (!total) return null;

		const dir = i > index.value ? 1 : -1;

		// loop around when smaller then first or larger than last index
		if (unref(canLoop)) i = ((i % total) + total) % total;
		else i = clamp(i, 0, total - 1);

		// Make sure index changes
		// Find next element that is not the same index as current
		let targetIndex = getIndex(getItemOffset(items[i]));
		let attempts = 0;

		if (preventSame) {
			while (targetIndex == index.value && attempts < 5) {
				i = clamp(i + unref(incrementBy) * dir, 0, total - 1);
				targetIndex = getIndex(getItemOffset(items[i]));
				attempts++;
			}
		}

		// Get offset of chosen item
		const calc = limit(getItemOffset(items[targetIndex]));

		// Set new target position to position of targeted item
		target.value = calc;

		if (!animate) position.value = calc;
	};

	const getItemOffset = (item) => {
		if (unref(align) === "center") {
			// Adjust offset of item centered in container
			return (
				item.x -
				(bounds.value.width - item.width + item.marginLeft + item.marginRight) / 2
			);
		} else {
			return item.x;
		}
	};

	const limit = (value) => {
		return clamp(value, min.value, max.value);
	};

	const setMinMax = () => {
		if (unref(align) == "center" && unref(canOvershoot)) {
			const containerWidth = node.offsetWidth;
			const first = items[0];
			const last = items[items.length - 1];

			min.value = -(containerWidth - first.width) * 0.5;
			max.value = totalWidth() - containerWidth + (containerWidth - last.width) * 0.5;
		} else {
			min.value = 0;
			max.value = Math.max(totalWidth() - node.offsetWidth, 0);
		}
	};

	const totalWidth = () => {
		if (!items.length) return 0;
		const last = items[items.length - 1];
		return last.x + last.width;
	};

	const onWheel = (el, e) => {
		if (!unref(canDrag)) return null;
		if (Math.abs(e.deltaX) > Math.abs(e.deltaY) + 5) isScrolling.value = true;
		if (!isScrolling.value) return null;

		e.stopPropagation();
		target.value = limit(target.value + e.deltaX);
		scrollDelta.value = e.deltaX;
	};

	const onWheelEnd = debounce(() => {
		if (!unref(canDrag)) return null;
		isScrolling.value = false;
		if (unref(snap)) goTo(getIndex(target.value + scrollDelta.value * 10));
	}, 100);

	// Effects

	effect(() => {
		if (items) {
			items.forEach((item, i) => {
				aria(item.el, "current", i === index.value);
			});
		}
	});

	effect(() => {
		toArray(previousEls).forEach((el) => {
			el.toggleAttribute("disabled", atStart.value);
		});

		toArray(nextEls).forEach((el) => {
			el.toggleAttribute("disabled", atEnd.value);
		});
	});

	watch(position, () => {
		if (!node) return null;
		// When position is updated
		// Translate container
		node.style.transform = `translate3d(${-position.value}px, 0, 0)`;

		// Calculate index based on current position
		if (items.length === 0) return null;

		index.value = getIndex(position.value);
		if (max.value != 0) progress.value = position.value / max.value;

		atStart.value = position.value < 1 && !unref(canLoop);
		atEnd.value = position.value > max.value - 1 && !unref(canLoop);
	});

	watch(
		() => drag.moved,
		() => {
			if (!unref(canDrag)) return null;
			target.value = limit(target.value - drag.deltaX);
		},
	);

	watch(
		() => drag.isDown,
		() => {
			if (!unref(canDrag)) return null;
			if (!drag.isDown && unref(snap)) goTo(getIndex(target.value - drag.deltaX * 10));
		},
	);

	watch(
		() => drag.hasMoved,
		() => {
			pointer.preventClick = drag.hasMoved;
		},
	);

	return {
		index,
		next,
		previous,
		goTo,
		delta,
		position,
		progress,
		target,
		items,
		bounds,
		canLoop,
		smoothing,
		max,
		atStart,
		atEnd,
		drag,
	};
}

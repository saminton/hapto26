import { ref, reactive, computed } from "@vue/reactivity";
import {
	onBeforeResize,
	onNodeResized,
	onResized,
	useSticky,
	useStore,
} from "composables";
import { useReactivity } from "core";
import { getBounds, receive, withDefaults } from "utils";

export const useLateral = (props: { el: HTMLElement }) => {
	// Vars
	const { watch, effect } = useReactivity();
	props = withDefaults(props, {
		delay: 0,
		detect: true,
	}) as typeof props;

	const scroll = receive("scroll", props.el);
	const parentEl = props.el.parentElement;
	const childrenEls = Array.from(props.el.children) as HTMLElement[];
	const device = useStore("device");
	const size = ref(0);
	const isActive = computed(() => size.value > device.height);

	const { position, progress } = useSticky({
		el: props.el,
	});

	const p = computed(() =>
		isActive ? position.value / (size.value - device.height) : progress.value,
	);

	/**
	 * Set in css
	 * display: flex;
	 *	flex-wrap: nowrap;
	 *	width: fit-content;
	 */

	// Hooks
	onMounted(() => {
		//
		resize();
	});

	onUnmounted(() => {});

	onResized(() => resize());

	onNodeResized(props.el, () => resize());

	// Functions

	const resize = () => {
		props.el.style.width = "100%";

		// Reset state
		childrenEls.forEach((el) => {
			el.style.transform = "";
		});

		// Get size

		const lastEl = childrenEls[childrenEls.length - 1];
		const bounds = getBounds(props.el);
		const lastBounds = getBounds(lastEl);
		const l = bounds.left;
		const r = device.width - bounds.right;
		const width = lastBounds.right - l;

		// let width = props.el.scrollWidth;

		let calc = width + device.height; // add height remove by sticky calculations
		calc -= bounds.width; // remove container width
		calc -= device.height - bounds.height; // adjust for container height smaller than window

		size.value = calc;
	};

	effect(() => {
		parentEl.style.height = isActive.value ? size.value + "px" : "";
		// parentEl.style.clipPath = isActive.value ? "inset(0)" : "";
	});

	effect(() => {
		console.log(position.value);

		childrenEls.forEach((el) => {
			el.style.transform = `translate3d(-${position.value}px, 0, 0)`;
		});
	});

	if (scroll.size) watch(() => scroll.size, resize);

	return {
		position,
		size,
		isActive,
		progress: p,
	};
};

import { Component, useReactivity, useScope } from "core";
import { ref, reactive } from "@vue/reactivity";
import { AnimData, useAnim, useEvents, useStore } from "composables";
import { getProps, extend, easing } from "utils";
import gsap from "gsap";

export interface NumberComponent extends Component {
	el: HTMLElement;
}

export function Number(args: Component) {
	// Extend

	extend(Component, this, args);
	const node = args.el;

	// Props

	const { on, once } = useEvents();
	const { child, children } = useScope(this);
	const { watch, effect, computed } = useReactivity();

	const {} = getProps(node);

	// Vars

	const digits = children("digit").map((el) => ({
		el: el,
		value: parseFloat(el.dataset.value),
	}));

	const anim = useAnim({
		el: node,
		timeline: (data: AnimData) => createTimeline(data),
	});

	// Hooks

	onMounted(() => {});

	onUnmounted(() => {});

	// Functions

	const createTimeline = (data: AnimData) => {
		const tl = gsap.timeline();

		digits.forEach((digit, i) => {
			const offset = digit.value == 0 ? 10 : digit.value;
			tl.fromTo(
				digit.el,
				{ y: `0lh` },
				{ y: `-${offset}lh`, duration: 1, ease: easing("ease_out") },
				i * 0.1 + 0.5,
			);
		});
		return tl;
	};

	// Effects
}

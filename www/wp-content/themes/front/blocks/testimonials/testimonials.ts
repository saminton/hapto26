import { Component, useReactivity, useScope } from "core";
import { ref, reactive } from "@vue/reactivity";
import { onRendered, useEvents, useStore } from "composables";
import { getProps, extend } from "utils";
import { useCarousel } from "composables/carousel";

export interface TestimonialsComponent extends Component {
	el: HTMLElement;
}

export function Testimonials(args: Component) {
	// Extend

	extend(Component, this, args);
	const node = args.el;

	// Props

	const { on, once } = useEvents();
	const { child, children } = useScope(this);
	const { watch, effect, computed } = useReactivity();

	const {} = getProps(node);

	// Vars

	const itemsEl = child("items") as HTMLElement;
	const previousEl = child("previous") as HTMLButtonElement;
	const nextEl = child("next") as HTMLButtonElement;
	const gaugeEl = child("gauge") as SVGCircleElement;

	const { index, next } = useCarousel({
		el: itemsEl,
		canLoop: true,
		nextEls: [nextEl],
		previousEls: [previousEl],
	});

	let timer = 0;
	let interval = 6;

	// Hooks

	onMounted(() => {});

	onUnmounted(() => {});

	onRendered(node, (tick) => {
		timer += tick.deltaTime;
		if (timer > interval) {
			next();
		}
		gaugeEl.style.strokeDashoffset = String(100 - (timer / interval) * 100);
	});

	// Functions

	watch(index, () => {
		timer = 0;
	});

	// Effects
}

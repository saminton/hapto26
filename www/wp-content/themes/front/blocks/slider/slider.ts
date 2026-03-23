import { Component, useReactivity, useScope } from "core";
import { ref, reactive } from "@vue/reactivity";
import { useEvents, useStore } from "composables";
import { getProps, extend } from "utils";
import { useCarousel } from "composables/carousel";
import { useLoop } from "composables/loop";
import { gsap } from "gsap";

export interface SliderComponent extends Component {
	el: HTMLElement;
}

export function Slider(args: Component) {
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
	const containerEl = child("container");
	const speed = ref(-1);
	const {} = useLoop({
		el: itemsEl,
		speed,
	});

	let anim: GSAPAnimation;

	// Hooks

	onMounted(() => {
		on(containerEl, "mouseenter", pause);
		on(containerEl, "mouseleave", play);
	});

	onUnmounted(() => {});

	// Functions

	const play = () => {
		if (anim) anim.kill();
		anim = gsap.to(speed, { value: -1, duration: 0.5 });
	};

	const pause = () => {
		if (anim) anim.kill();
		anim = gsap.to(speed, { value: 0, duration: 0.5 });
	};

	// Effects
}

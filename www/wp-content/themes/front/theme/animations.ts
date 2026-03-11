import { Ref } from "@vue/reactivity";
import { easing } from "../utils";
import { gsap } from "gsap";
import { SplitBy, useStore } from "composables";

export type AnimationNodes = {
	el: HTMLElement;
	words: Ref<HTMLElement[]>;
	lines: Ref<HTMLElement[]>;
};

export type Animation = {
	name: string;
	isActive?: boolean | Ref<Boolean>;
	split?: SplitBy;
	setup?: Function;
	timeline?: Function;
};

export function getAnimations(): Animation[] {
	const device = useStore("device");
	const animations = [];

	animations.push({
		name: "title",
		split: SplitBy.WORDS,
		timeline: (data: AnimationNodes) => {
			const tl = gsap.timeline();
			tl.fromTo(
				data.words.value,
				{
					opacity: 0,
				},
				{
					opacity: 1,
					duration: 0.2,
					ease: easing("ease"),
					// clearProps: "all",
					stagger: 0.2,
				},
			);

			tl.fromTo(
				data.el.querySelectorAll("u"),
				{
					backgroundSize: "0% 1px",
				},
				{
					backgroundSize: "100% 1px",
					// ease: easing("ease"),
					stagger: 0.3,
				},
			);

			return tl;
		},
	});

	animations.push({
		name: "text",
		split: SplitBy.LINES,
		timeline: (data: AnimationNodes) => {
			const tl = gsap.timeline();
			let items = data.lines.value.map((el) => el.children[0]);
			tl.fromTo(
				items,
				{
					y: "1.2lh",
				},
				{
					y: "0lh",
					duration: 0.7,
					// ease: easing("ease"),
					stagger: 0.1,
					// clearProps: "all",
				},
			);

			tl.fromTo(
				data.el.querySelectorAll("u"),
				{
					backgroundSize: "0% 1px",
				},
				{
					backgroundSize: "100% 1px",
					// ease: easing("ease"),
					stagger: 0.3,
				},
			);

			return tl;
		},
	});

	animations.push({
		name: "fade-up",
		timeline: (data: AnimationNodes) => {
			return gsap.fromTo(
				data.el,
				{
					opacity: 0,
					y: "2rem",
				},
				{
					opacity: 1,
					y: "0rem",
					duration: 1,
					ease: easing("ease_out"),
					// clearProps: "all",
				},
			);
		},
	});

	animations.push({
		name: "mask-in",
		timeline: (data: AnimationNodes) => {
			return gsap.fromTo(
				data.el.children[0],
				{
					clipPath: "inset(100% 100% 0 0)",
				},
				{
					clipPath: "inset(0% 0% 0 0)",
					duration: 1,
					ease: easing("ease"),
					// clearProps: "all",
				},
			);
		},
	});

	return animations;
}

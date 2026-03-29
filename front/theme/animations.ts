import { Ref } from "@vue/reactivity";
import { easing } from "../utils";
import { gsap } from "gsap";
import { SplitBy, useStore } from "composables";

export type AnimationNodes = {
	el: HTMLElement;
	words: Ref<HTMLElement[]>;
	lines: Ref<HTMLElement[]>;
	letters: Ref<HTMLElement[]>;
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
		name: "letters",
		split: SplitBy.LETTERS,
		timeline: (data: AnimationNodes) => {
			const tl = gsap.timeline({ paused: true });
			tl.fromTo(
				data.letters.value,
				{
					opacity: 0,
					y: ".1em",
				},
				{
					opacity: 1,
					duration: 0.5,
					y: "0em",
					ease: easing("ease_out"),
					// clearProps: "all",
					stagger: 0.05,
				},
			);
			return tl;
		},
	});

	animations.push({
		name: "title",
		split: SplitBy.WORDS,
		timeline: (data: AnimationNodes) => {
			const tl = gsap.timeline({ paused: true });
			tl.fromTo(
				data.words.value,
				{
					opacity: 0,
					y: ".2em",
				},
				{
					opacity: 1,
					duration: 0.5,
					y: "0em",
					ease: easing("ease_out"),
					// clearProps: "all",
					stagger: 0.05,
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
			const tl = gsap.timeline({ paused: true });
			let items = data.lines.value.map((el) => el.children[0]);
			tl.fromTo(
				items,
				{
					opacity: 0,
					y: ".2em",
				},
				{
					opacity: 1,
					duration: 0.5,
					y: "0em",
					ease: easing("ease_out"),
					// clearProps: "all",
					stagger: 0.1,
					delay: 0.3,
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
					delay: 0.3,
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
		name: "fade-in",
		timeline: (data: AnimationNodes) => {
			return gsap.fromTo(
				data.el,
				{
					opacity: 0,
				},
				{
					opacity: 1,
					duration: 1,
					ease: easing("ease_out"),
					// clearProps: "all",
				},
			);
		},
	});

	animations.push({
		name: "items",
		timeline: (data: AnimationNodes) => {
			return gsap.fromTo(
				data.el.children,
				{
					opacity: 0,
					y: "1rem",
				},
				{
					opacity: 1,
					y: "0rem",
					duration: 1,
					ease: easing("ease_out"),
					// clearProps: "all",
					stagger: 0.3,
					delay: 0.3,
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

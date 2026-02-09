import { Ref } from "@vue/reactivity";
import { easing } from "../utils";
import { gsap } from "gsap";
import { SplitType, useStore } from "composables";

export type Animation = {
	name: string;
	isActive?: boolean | Ref<Boolean>;
	split?: SplitType;
	setup?: Function;
	timeline?: Function;
};

export function getAnimations(): Animation[] {
	const device = useStore("device");
	const animations = [];

	animations.push({
		name: "title",
		split: SplitType.words,
		timeline: (data) => {
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
					ease: easing("ease"),
					stagger: 0.3,
				},
			);

			return tl;
		},
	});

	animations.push({
		name: "text",
		split: SplitType.lines,
		timeline: (data) => {
			console.log(`data.lines`, data.lines.value);
			const tl = gsap.timeline();
			tl.fromTo(
				data.lines.value.map((el) => el.children[0]),
				{
					y: "1.2lh",
				},
				{
					y: "0lh",
					duration: 0.7,
					ease: easing("ease"),
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
					ease: easing("ease"),
					stagger: 0.3,
				},
			);

			return tl;
		},
	});

	animations.push({
		name: "fade-up",
		timeline: (data) => {
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
		timeline: (data) => {
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

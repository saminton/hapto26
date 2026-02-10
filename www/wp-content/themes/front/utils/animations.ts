import gsap from "gsap";
import CustomEase from "gsap/CustomEase";
import { cssVar } from "./html";

gsap.registerPlugin(CustomEase);
export const easing = (name: string) => {
	if (name.includes(",")) return CustomEase.create("cubic", name);
	return CustomEase.create("cubic", cssVar(name));
};

export const smooth = (
	target: number,
	current: number,
	smoothing: number,
	delta: number,
	precision: number = 10000,
) => {
	const calc = current + ((target - current) / smoothing) * delta;
	const value = Math.floor(calc * precision) / precision;
	return value;
};

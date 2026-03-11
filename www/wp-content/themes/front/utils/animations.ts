import gsap from "gsap";
import CustomEase from "gsap/CustomEase";
import { cssVar } from "./html";

gsap.registerPlugin(CustomEase);
export const easing = (name: string) => {
	const match = cssVar(name).match(/cubic-bezier\(([^)]+)\)/);
	if (match && match[1]) return CustomEase.create("cubic", match[1]);
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

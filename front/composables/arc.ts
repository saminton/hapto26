import { getBounds, withDefaults } from "utils";
import { AnimData, onDisplayChange, useAnim } from "composables";
import { onResized } from "./resizer";
import { Ref, ref, unref } from "@vue/reactivity";
import { useReactivity } from "core";
import { getAnimations } from "theme";

// Inspired par
// https://circletype.labwire.ca/

// text: text to be displayed
// angle: will space text over desired angle, overrides spacing parameter
// maxAngle: will space automatically but limit to desired angle
// radius: radius of circle used
// spacing: manual spacing
// start: start arc at a given angle
// invert : curve text inwards or outwards
// offsetY: offset arc vertically, use 0 to set arc to baseline
// anim: use animation from the themes animation
// timeline: use custom animation

export const useArc = (props: {
	el: HTMLElement;
	text?: string;
	angle?: number | Ref<number>;
	maxAngle?: number;
	radius?: number | Ref<number>;
	// repeat?: number;
	spacing?: number | Ref<number>;
	start?: number | Ref<number>;
	invert?: boolean;
	offsetY?: number | Ref<number>;
	anim?: string;
	timeline?: (data: AnimData) => GSAPTimeline;
	delay?: number;
}) => {
	props = withDefaults(props, {
		text: props.el.innerText,
		invert: false,
		start: 0,
	});

	const { watch, effect } = useReactivity();

	let items = [];
	let fontSize: number;
	let lineHeight: number;
	let letterSpacing: number;
	let height: number;
	const letters = ref<HTMLElement[]>();
	let isSetup = false;

	const hasAnim = props.anim || props.timeline;
	let anim;
	let animations;

	if (hasAnim) {
		animations = getAnimations();
		anim = useAnim({
			el: props.el, //
			timeline: props.timeline,
			delay: props.delay,
		});
	}

	onMounted(() => {
		setup();
		watch(props.angle, draw);
		watch(props.radius, draw);
		watch(props.spacing, draw);
	});

	onResized(() => setup());

	onDisplayChange(props.el, (isDisplayed) => {
		if (isDisplayed) setup();
	});

	const setup = () => {
		props.el.innerHTML = "";
		const parent = props.el.parentElement;

		props.el.style.transform = "none";
		props.el.style.animation = "none";
		parent.style.transform = "none";
		parent.style.animation = "none";

		items = props.text.split(/(?!$)/u).map((letter) => {
			const el = document.createElement("span");
			const letterEl = document.createElement("v-letter");
			letterEl.innerHTML = letter;
			el.appendChild(letterEl);
			props.el.append(el);
			if (letter === " ") el.innerHTML = "&nbsp;";

			return {
				el: el,
				rotation: null,
				bounds: null,
			};
		});

		const style = window.getComputedStyle(props.el);
		fontSize = parseFloat(style.fontSize);
		lineHeight = parseFloat(style.lineHeight);
		letterSpacing = parseFloat(style.letterSpacing) || 0;

		height = props.el.offsetHeight;

		items.forEach((item) => {
			item.bounds = getBounds(item.el);
		});

		isSetup = true;

		draw();

		letters.value = Array.from(props.el.querySelectorAll("v-letter"));
		props.el.style.transform = "";
		props.el.style.animation = "";
		parent.style.transform = "";
		parent.style.animation = "";

		if (hasAnim) anim.set(createAnim);
	};

	const degreesPerRadian = 180 / Math.PI;
	const radiansToDegrees = (angleInRadians) => angleInRadians * degreesPerRadian;

	const draw = () => {
		if (!isSetup) return;

		let total = 0;

		const radius = unref(props.radius) ?? height / 2;
		const originY = radius;
		const origin = `center ${originY / fontSize}em`;
		const innerRadius = radius - lineHeight;
		const spacing = unref(props.spacing) ?? letterSpacing;

		items.forEach((item) => {
			const r = radiansToDegrees((item.bounds.width + spacing) / innerRadius);
			item.rotation = total + r / 2;
			total += r;
		});

		let dif = props.angle ? unref(props.angle) / total : 1;
		if (props.maxAngle && total > props.maxAngle) dif = props.maxAngle / total;

		items.forEach((item, i) => {
			item.el.style = ""; // reset
			const { style } = item.el;
			const rotate = total * -0.5 + item.rotation * (props.invert ? -1 : 1);
			const x = (item.bounds.width * -0.5) / fontSize;
			const y =
				unref(props.offsetY) === null ? height / 2 - radius : unref(props.offsetY);
			const offset = radius * 2 - lineHeight;

			let transform = `translate(${x}em, ${y}px) `;
			if (props.invert)
				transform += `rotate(${
					(rotate + total) * dif + unref(props.start)
				}deg) translateY(${offset}px)`;
			else transform += `rotate(${rotate * dif + unref(props.start)}deg)`;

			style.position = "absolute";
			style.left = "50%";
			style.transform = transform;
			style.transformOrigin = origin;
		});
	};

	const createAnim = (data) => {
		// Add letters to anim data
		data.letters = letters;

		if (props.timeline) return props.timeline(data);
		if (props.anim) {
			// Find animation
			const animation = animations.find((item) => item.name === props.anim);
			if (animation?.timeline) return animation.timeline(data, 0);
		}
	};

	return {
		letters,
	};
};

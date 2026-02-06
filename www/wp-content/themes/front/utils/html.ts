import { Bounds, Scroll } from "types";
import { camelCase } from "./case";
import { toArray } from "utils";

export function getBounds(
	el: Element, //
	scroll: Scroll = null
): Bounds {
	if (!el) console.warn(`Bounds: No HTML element passed`);

	let { left, top, width, height } = el.getBoundingClientRect();
	if (scroll && scroll.position) {
		top += scroll.position;
	}
	return {
		x: left,
		y: top,
		cx: left + width * 0.5,
		cy: top + height * 0.5,
		left,
		top,
		right: left + width,
		bottom: top + height,
		width,
		height,
	};
}

export function getRelativeBounds(
	a: HTMLElement | Bounds,
	b: HTMLElement | Bounds,
	scroll?: Scroll
): Bounds {
	if (a! instanceof HTMLElement) a = getBounds(a, scroll);
	if (b! instanceof HTMLElement) b = getBounds(b, scroll);

	const bounds = getRelativePosition(a, b);
	bounds.width = a.width;
	bounds.height = a.height;

	return bounds;
}

export function getRelativePosition(a: Bounds, b: Bounds): Bounds {
	const x = (a.left || a.x) - (b.left || b.x);
	const y = (a.top || a.y) - (b.top || b.y);
	const left = x;
	const top = y;
	const right = b.right - a.right;
	const bottom = b.bottom - a.bottom;

	return { x, y, left, top, right, bottom };
}

export function getStyles(el: HTMLElement, ...names) {
	const styles = window.getComputedStyle(el);
	const temp = {};
	names.forEach((name) => {
		let value = styles[name] as any;
		if (value.includes("px")) value = parseFloat(value);
		temp[camelCase(name)] = value;
	});

	if (names.length === 1) {
		return temp[names[0]];
	}
	return temp as Partial<CSSStyleDeclaration>;
}

export const getTransform = (el: HTMLElement) => {
	const transform = getComputedStyle(el).transform;
	let scale = 1;
	let rotation = 0;

	if (transform == "none") {
		return {
			scale, //
			rotation,
		};
	}

	const values = transform.split("(")[1].split(")")[0].split(",");

	const a = parseFloat(values[0]);
	const b = parseFloat(values[1]);
	const c = parseFloat(values[2]);
	const d = parseFloat(values[3]);

	scale = Math.sqrt(a * a + b * b);
	rotation = Math.round(Math.atan2(b, a) * (180 / Math.PI));

	return {
		scale, //
		rotation,
	};
};

let globalStyle = null;
export const cssVar = (name: string, node: HTMLElement = null) => {
	if (!globalStyle) {
		globalStyle = getComputedStyle(document.documentElement);
	}
	if (!node) {
		return globalStyle.getPropertyValue(`--${name}`).trim();
	} else {
		return getComputedStyle(node).getPropertyValue(`--${name}`).trim();
	}
};

export const cssVarRGB = (name: string, node: HTMLElement = null): number[] => {
	return cssVar(name, node)
		.split(",")
		.map((value: string) => Number(value) / 255);
};

export const attr = (
	els: HTMLElement | HTMLElement[] | NodeList,
	prop: string,
	value: boolean | string | number
) => {
	toArray(els).forEach((el) => {
		if (!el) return;
		if (value == null || value === false) el.removeAttribute(prop);
		else if (value === true) el.setAttribute(prop, "");
		else el.setAttribute(prop, value);
	});
};

export const style = (
	els: HTMLElement | HTMLElement[] | NodeList,
	prop: string,
	value: boolean | string | number
) => {
	if (!isNaN(Number(value)) && value != "")
		value = Math.round(Number(value) * 1000) / 1000;

	if (prop == "x") {
		prop = "transform";
		value = `translateX(${value}px)`;
	}
	if (prop == "y") {
		prop = "transform";
		value = `translateY(${value}px)`;
	}
	if (prop == "z") {
		prop = "transform";
		value = `translateZ(${value}px)`;
	}
	if (prop == "scale") {
		prop = "transform";
		value = `scale(${value})`;
	}
	toArray(els).forEach((el) => {
		if (value == null) el.style.removeProperty(prop);
		else el.style.setProperty(prop, value);
	});
};

export type CSSStyle = {
	[index: string]: number | string | boolean;
};

export function styles(
	el: HTMLElement | HTMLElement[],
	styles: Partial<CSSStyleDeclaration> | CSSStyle
) {
	let transform = "";
	for (const [key, value] of Object.entries(styles)) {
		if (key == "x") transform += `translateX(${value}px) `;
		if (key == "y") transform += `translateY(${value}px) `;
		if (key == "z") transform += `translateZ(${value}px) `;
		if (key == "scale") transform += `scale(${value}) `;
	}

	for (const [key, value] of Object.entries(styles)) {
		if (key == "x" || key == "y" || key == "z" || key == "x" || key == "scale") {
		} else style(el, key, value);
	}

	if (transform) {
		style(el, "transform", transform);
	}
}

export const aria = (
	els: HTMLElement | HTMLElement[] | NodeList,
	prop: string,
	value: boolean | string
) => {
	if (!els) return;
	if (value === true) value = "true";
	if (value === false) value = "false";

	const correct = [
		"activedescendant",
		"atomic",
		"autocomplete",
		"braillelabel",
		"brailleroledescription",
		"busy",
		"checked",
		"colcount",
		"colindex",
		"colindextext",
		"colspan",
		"controls",
		"current",
		"describedby",
		"description",
		"details",
		"disabled",
		"dropeffect",
		"errormessage",
		"expanded",
		"flowto",
		"grabbed",
		"haspopup",
		"hidden",
		"invalid",
		"keyshortcuts",
		"label",
		"labelledby",
		"level",
		"live",
		"modal",
		"multiline",
		"multiselectable",
		"orientation",
		"owns",
		"placeholder",
		"posinset",
		"pressed",
		"readonly",
		"relevant",
		"required",
		"roledescription",
		"rowcount",
		"rowindex",
		"rowindextext",
		"rowspan",
		"selected",
		"setsize",
		"sort",
		"valuemax",
		"valuemin",
		"valuenow",
		"valuetext",
	];

	if (correct.indexOf(prop) == -1)
		console.warn(
			`aria-${prop} is incorrect, available attributes: https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes`
		);

	toArray(els).forEach((el) => {
		if (value == null) el.removeAttribute(`aria-${prop}`);
		else el.setAttribute(`aria-${prop}`, value);
	});
};

export const checkDisplay = (el: HTMLElement) => {
	if (el.offsetWidth || el.offsetHeight || el.getClientRects().length) return true;
	else return false;
};

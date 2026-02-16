export const clamp = (value: number, min: number, max: number): number =>
	Math.min(max, Math.max(min, value));

export const wrap = (value: number, min: number, max: number): number => {
	var r = max - min;
	return min + ((((value - min) % r) + r) % r);
};

export const round = (number: number, precision: number) =>
	Math.round(number * precision) / precision;

export const lerp = (x: number, y: number, a: number) => x * (1 - a) + y * a;

export const invlerp = (x: number, y: number, a: number) =>
	clamp((a - x) / (y - x), 0, 1);

// https://www.trysmudford.com/blog/linear-interpolation-functions/
export const remap = (x1: number, y1: number, x2: number, y2: number, a: number) =>
	lerp(x2, y2, invlerp(x1, y1, a));

export const rgb = (color: string) => color.split(",").map((str) => parseInt(str));

export const lerpRGB = (a: number[], b: number[], p) =>
	a.map((value, i) => lerp(a[i], b[i], p));

/*
// Usage:

// Avec un array de chiffres
const items = [4, 9, 15, 6, 2];
const goal = 13;
const current = closest(items, goal);
// returns {diff: 2, index: 2}

// Avec un array d'objets
const items = [{ x: 6 }, { x: 15 }, { x: 12 }];
const goal = 13;
const current = closest(items, goal, (item) => item.x);
// returns {diff: 1, index: 2}

// Avec une comparaison custom
const items = [{ x: 1 }, { x: 3 }, { x: 5 }];
const goal = 4;
const current = closest(
	items,
	goal,
	(item) => item.targetBounds.top,
	(goal, value) => value < goal
);
// returns {diff: 1, index: 2}
*/

export const closest = (
	items: any[], //
	goal: number,
	map?: (item: any) => number,
	check?: (goal: number, value: number, dist: number) => boolean,
) => {
	let dist = Infinity;
	let index = null;

	if (!check)
		check = (goal, value, dist) => Math.abs(value - goal) < Math.abs(dist - goal);

	items.forEach((value, i) => {
		if (map) {
			value = map(value);
		}

		if (check(goal, value, dist)) {
			dist = value;
			index = i;
		}
	});

	return {
		diff: Math.abs(goal - dist),
		index,
	};
};

export const toRadians = (angle: number) => angle * (Math.PI / 180);

export const toDegrees = (angle: number) => angle * (180 / Math.PI);

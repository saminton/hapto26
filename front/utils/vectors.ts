// export function normalize(a: Vector2, b: Vector2): Vector2;
// export function normalize(a: Vector3, b: Vector3): Vector3;

// export function normalize(a: any, b: any): any {
// 	return;
// }

// export function distance(a: Vector2, b: Vector2): Vector2;
// export function distance(a: Vector3, b: Vector3): Vector3;

// export function distance(a: any, b: any): any {
// 	return;
// }

export class Vector2 {
	x = 0;
	y = 0;
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}
}

export class Vector3 {
	x = 0;
	y = 0;
	z = 0;
	constructor(x, y, z) {
		this.x = x;
		this.y = y;
		this.z = z;
	}
}

export class Vector4 {
	x = 0;
	y = 0;
	z = 0;
	a = 0;
	constructor(x, y, z, a) {
		this.x = x;
		this.y = y;
		this.z = z;
		this.a = a;
	}
}

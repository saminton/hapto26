/**
 * Limit the speed of a repeating function
 * @param {function} func
 * @param {int} duration time between two calls
 * @returns null
 */

export function throttle(callback: Function, duration: number) {
	var lastTime = 0;
	return function () {
		var now = performance.now();
		if (now - lastTime >= duration) {
			callback.apply(this, arguments);
			lastTime = now;
		}
	};
}

export function debounce(
	callback: Function,
	limit: number,
	isImmediate: boolean = false
) {
	var timeout;
	return function () {
		var context = this,
			args = arguments;
		var later = function () {
			timeout = null;
			if (!isImmediate) callback.apply(context, args);
		};
		var callNow = isImmediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, limit);
		if (callNow) callback.apply(context, args);
	};
}

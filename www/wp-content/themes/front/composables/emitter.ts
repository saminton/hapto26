// Modernized version of
// https://github.com/scottcorgan/tiny-emitter/blob/master/index.js

export function Emitter() {
	const events = {};

	this.on = (name: string, callback: Function, context) => {
		(events[name] || (events[name] = [])).push({
			callback,
			context,
		});
	};

	this.once = (name: string, callback: Function, context) => {
		return new Promise((resolve) => {
			const listener = function () {
				this.off(name, listener);
				callback.apply(context, arguments);
				resolve(null);
			};

			listener.handle = callback;
			this.on(name, listener);
		});
	};

	this.off = (name: string, callback: Function) => {
		const array = events[name];
		const keep = [];

		if (!array) return null;
		for (var i = 0, len = array.length; i < len; i++) {
			if (array[i].callback !== callback && array[i].callback.handle !== callback) {
				keep.push(array[i]); // Keep event if the callback does not match ones we are trying to remove
			}
		}

		if (keep.length) events[name] = keep;
		else delete events[name];
	};

	this.emit = function (name: string) {
		const data = [].slice.call(arguments, 1);
		const array = (events[name] || []).slice();
		let i = 0;

		for (i; i < array.length; i++) {
			array[i].callback.apply(array[i].context, data);
		}
	};

	this.destroy = () => {
		for (const prop of Object.getOwnPropertyNames(events)) {
			delete events[prop];
		}
	};
}

// Instance

let emitter = null;

// Composables

export const useEmitter = () => {
	if (!emitter) emitter = new Emitter();
	return emitter;
};

export const onEmitted = (name: string, callback: Function) => {
	onMounted(() => emitter.on(name, callback));
	onUnmounted(() => emitter.off(name, callback));
};

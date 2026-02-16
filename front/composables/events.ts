import { toArray } from "../utils";

function Events() {
	const created = {};
	const registered = [];

	// Public

	this.create = (name: string) => {
		if (!created[name]) created[name] = new Event(name);
	};

	this.on = (
		nodes: HTMLElement | NodeList,
		names: string | Array<string>,
		callback: Function,
		props: Array<any> = [],
		options: any,
	) => {
		if (!nodes) return;
		toArray(nodes).forEach((node, i) => {
			if (!node) return;
			toArray(names).forEach((name) => {
				const data = {
					el: node,
					name: name,
					function: callback.name,
					callback: (e: Object) => callback(...props, node, e, i),
					options: options,
				};

				if (node.on && node.off) {
					// Is component
					if (!node.on) {
						console.warn("No events exposed");
					}
					node.on(data.name, data.callback);
				} else {
					// Is html element
					node.addEventListener(data.name, data.callback, data.options);
					registered.push(data);
				}
			});
		});
	};

	this.dispatch = (nodes: HTMLElement | NodeList, name: string) => {
		toArray(nodes).forEach((node, i) => {
			node.dispatchEvent(created[name]);
		});
	};

	this.off = (
		nodes: HTMLElement | NodeList,
		names: string | Array<string>,
		callback: Function,
	) => {
		// Todo: use handles instead
		if (!nodes) return null;
		toArray(nodes).forEach((node, i) => {
			if (!node) return;
			toArray(names).forEach((name, i) => {
				if (node.el) {
					// Is component
					if (!node.off) {
						console.warn("No events exposed");
					}
					node.off(name, callback);
				} else {
					// Is html element
					// Find registered event
					const index = registered.findIndex(
						(item) =>
							item.el == node && item.name == name && item.function == callback.name,
					);
					if (index != -1) {
						const data = registered[index];
						// Remove attached event
						node.removeEventListener(data.name, data.callback, data.options);
						// Remove from array
						delete registered[index];
						registered.splice(index, 1);
					}
				}
			});
		});
	};

	this.once = (
		nodes: HTMLElement | NodeList,
		names: string | Array<string>,
		callback: Function,
	) => {
		return new Promise((resolve) => {
			const handle = (el, event) => {
				this.off(nodes, names, handle);
				if (callback) callback(el, event);
				resolve(event);
			};

			this.on(nodes, names, handle);
		});
	};

	this.destroy = () => {
		registered.forEach((data) => {
			if (data.el.el) {
				data.el.off(data.name, data.callback);
			} else {
				data.el.removeEventListener(data.name, data.callback, data.options);
			}
		});
	};
}

// Composables
const singleton = new Events();
export const events = singleton;

export const useEvents = () => {
	const instance = new Events();

	if (onUnmounted)
		onUnmounted(() => {
			instance.destroy();
		});

	return instance;
};

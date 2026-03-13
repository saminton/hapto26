import { Component } from "core";
import { toArray } from "../utils";

type ElementOrComponent = HTMLElement | Window | Component;
type ElementsOrComponent = HTMLElement | HTMLElement[] | NodeList | Window | Component;

type Events = {
	create: (name: string) => void;
	on: (
		nodes: ElementsOrComponent,
		names: string | Array<string>,
		callback?: (...args: any[]) => void,
		props?: Array<any>,
		options?: any,
	) => void;
	dispatch: (nodes: ElementsOrComponent, name: string) => void;
	off: (
		nodes: ElementsOrComponent,
		names: string | Array<string>,
		callback?: (...args: any[]) => void,
	) => void;
	once: (
		nodes: ElementsOrComponent,
		names: string | Array<string>,
		callback?: (...args: any[]) => void,
	) => Promise<any>;
	destroy: () => void;
};

type EventsConstructor = {
	(): Events;
	new (): Events;
};

type CustomEvent = {
	el: ElementOrComponent;
	name: string;
	function: string;
	callback: EventListener;
	options: any;
};

function Events() {
	const created: { [key: string]: Event } = {};
	const registered: Array<CustomEvent> = [];

	// Public

	const create = (name: string) => {
		if (!created[name]) created[name] = new Event(name);
	};

	const on = (
		nodes: ElementsOrComponent,
		names: string | Array<string>,
		callback: (...args: any[]) => void,
		props: Array<any> = [],
		options: object = {},
	) => {
		if (!nodes) return;
		toArray(nodes).forEach((node: ElementOrComponent, i: number) => {
			if (!node) return;
			toArray(names).forEach((name: string) => {
				const data: CustomEvent = {
					el: node,
					name: name,
					function: callback.name,
					callback: ((e: Event) => callback(...props, node, e, i)) as EventListener,
					options: options,
				};

				if (node instanceof HTMLElement || node instanceof Window) {
					// Is html element
					node = node as HTMLElement;
					node.addEventListener(data.name as string, data.callback, data.options);
					registered.push(data);
				} else {
					node = node as Component;
					node.on(data.name, data.callback);
				}
			});
		});
	};

	const dispatch = (nodes: ElementsOrComponent, name: string) => {
		toArray(nodes).forEach((node, i) => {
			node.dispatchEvent(created[name]);
		});
	};

	const off = (
		nodes: ElementsOrComponent,
		names: string | Array<string>,
		callback: (...args: any[]) => void,
	) => {
		// Todo: use handles instead
		if (!nodes) return;
		toArray(nodes).forEach((node: ElementOrComponent, i: number) => {
			if (!node) return;
			toArray(names).forEach((name: string, i: number) => {
				if (node instanceof HTMLElement || node instanceof Window) {
					// Is html element
					node = node as HTMLElement;
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
				} else {
					node = node as Component;
					node.off(name, callback);
				}
			});
		});
	};

	const once = (
		nodes: ElementsOrComponent,
		names: string | Array<string>,
		callback: (...args: any[]) => void,
	) => {
		return new Promise((resolve) => {
			const handle = (el: ElementsOrComponent, event: Event) => {
				off(nodes, names, handle);
				if (callback) callback(el, event);
				resolve(event);
			};

			on(nodes, names, handle);
		});
	};

	const destroy = () => {
		registered.forEach((data) => {
			off(data.el, data.name, data.callback);
		});
	};

	return {
		create,
		on,
		dispatch,
		off,
		once,
		destroy,
	};
}

// Composables
const singleton = new (Events as EventsConstructor)();
export const events = singleton;

export const useEvents = () => {
	const instance = new (Events as EventsConstructor)();

	if (onUnmounted)
		onUnmounted(() => {
			instance.destroy();
		});

	return instance;
};

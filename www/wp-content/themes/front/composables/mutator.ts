import { watch } from "@vue/reactivity";
import { Emitter, EmitterConstructor, useStore } from "composables";
import md5 from "md5";
import { kebabCase, snakeCase, toArray } from "../utils";
import { Component, ComponentConstructor, Service, ServiceConstructor } from "core";

type Mutator = {
	init: (args: {
		el: Element;
		components: ComponentConstructor[];
		services: ServiceConstructor[];
		plugins: ComponentConstructor[];
	}) => void;
	findComponent: (el: Element) => Component | null;
	findService: (name: string, el: Element) => Service | null;
	findServices: (name: string, els: Element[] | NodeList) => Service[];
	components: Component[];
	services: Service[];
	plugins: Component[];
	mountedPromises: Promise<void>[];
	readyPromises: Promise<void>[];
	on: (name: string, callback: Function) => void;
	once: (name: string, callback?: Function) => Promise<void>;
	off: (name: string, callback: Function) => void;
};

type MutatorConstructor = {
	(): Mutator;
};

type Entry = {
	type: "component" | "service" | "plugin";
	el: HTMLElement;
	class: any;
	name: string;
	uid?: string;
};

function Mutator() {
	let componentConstructs: ComponentConstructor[] = [];
	let serviceConstructs: ServiceConstructor[] = [];
	let pluginConstructs: ComponentConstructor[] = [];

	const components: Component[] = [];
	const services: Service[] = [];
	const plugins: Component[] = [];
	const mountedPromises: Promise<void>[] = [];
	const readyPromises: Promise<void>[] = [];

	const { emit, on, once, off } = new (Emitter as EmitterConstructor)();
	const page = useStore("page");

	const onMutate = (mutations: MutationRecord[]) => {
		for (const mutation of mutations) {
			if (mutation.type !== "childList") return;
			mutation.addedNodes.forEach((node) => added(node as HTMLElement));
			mutation.removedNodes.forEach((node) => removed(node as HTMLElement));
		}
	};

	// Instantiate components and services from nodes added to document

	const added = async (node: HTMLElement) => {
		if (node?.nodeType !== 1) return; // do nothing on text nodes

		// if (document.hidden) {
		// 	const promise = new Promise((resolve, reject) => {
		// 		events.once(
		// 			document,
		// 			"visibilitychange",
		// 			setTimeout(() => {
		// 				resolve(true);
		// 			}, 1000)
		// 		);
		// 	});

		// 	mountedPromises.push(promise);
		// 	await promise;
		// }

		// Create components
		const items = traverse(node).reduce((result: any[], item: Entry) => {
			if (item.type == "service") {
				try {
					const instance = new item.class(item);
					services.push(instance);
					result.push(instance);
				} catch (error) {
					console.error(`Service: Error creating "${item.name}" \n`, error);
				}
			}
			if (item.type == "component") {
				try {
					const instance = new item.class(item);
					components.push(instance);
					result.push(instance);
				} catch (error) {
					console.error(`Component: Error creating "${item.name}" \n`, error);
				}
			}
			if (item.type == "plugin") {
				try {
					const instance = new item.class(item);
					plugins.push(instance);
					result.push(instance);
				} catch (error) {
					console.error(`Plugin: Error creating "${item.name}" \n`, error);
				}
			}
			return result;
		}, []);

		// Pile component mount promises
		items.forEach((item) => {
			if (!item) return;

			const promise = item.mount();
			mountedPromises.push(promise);
			promise.then(() => {
				const index = mountedPromises.indexOf(promise);
				if (index > -1) {
					mountedPromises.splice(index, 1);
				}
			});
		});

		// Wait for component mount promises
		await Promise.all(mountedPromises);

		// All components have loaded
		if (mountedPromises.length == 0) {
			emit("ready");

			// lazyLoad(items); // load images sequentially
		}

		// Pile component mount promises
		items.forEach((item) => {
			if (!item) return;

			const promise = item.ready();
			readyPromises.push(promise);
			promise.then(() => {
				const index = readyPromises.indexOf(promise);
				if (index > -1) {
					readyPromises.splice(index, 1);
				}
			});
		});

		// Wait for component mount promises
		await Promise.all(readyPromises);

		// All components have loaded
		if (readyPromises.length == 0) {
			emit("complete");
		}

		// Wait for transition / loader
		if (!page.isReady)
			await new Promise<void>((resolve, reject) => {
				const dispose = watch(
					() => page.isReady,
					() => {
						resolve();
						dispose();
					},
				);
			});

		// Call component after ready methods
		items.forEach((item) => {
			item.afterReadyCallbacks.forEach((callback: Function) => callback());
		});
	};

	// Unmount components and services removed from page

	const removed = (node: HTMLElement) => {
		if (node.nodeType !== 1) return; // do nothing on text nodes

		const items = traverse(node);
		items.forEach((item: Entry) => {
			if (item.type == "service") {
				let i = services.length;
				while (i--) {
					if (services[i].el == item.el) {
						services[i].destroy(); // call unmount
						delete services[i]; // Delete from memory
						services.splice(i, 1); // Remove index from array
					}
				}
			}
			if (item.type == "component") {
				let i = components.length;
				while (i--) {
					if (components[i].el == item.el) {
						components[i].destroy(); // call unmount
						delete components[i]; // Delete from memory
						components.splice(i, 1); // Remove index from array
					}
				}
			}
			if (item.type == "plugin") {
				let i = plugins.length;
				while (i--) {
					if (plugins[i].el == item.el) {
						plugins[i].destroy(); // call unmount
						delete plugins[i]; // Delete from memory
						plugins.splice(i, 1); // Remove index from array
					}
				}
			}
		});
	};

	// load images sequentially
	// const lazyLoad = (items) => {
	// 	const images = items
	// 		.filter(
	// 			(item) => item.name == "image" && item.el.getAttribute("postload") == "true"
	// 		)
	// 		.reverse();
	// 	images.reduce((prev, curr) => prev.then(() => curr.load()), Promise.resolve());
	// };

	// Find components within a given node

	const traverse = (node: HTMLElement) => {
		const found: Entry[] = [];

		const check = (el: HTMLElement) => {
			// Components

			componentConstructs.forEach((component: ComponentConstructor) => {
				const name = snakeCase(component.name);
				const uid = md5(name).slice(0, 4);

				if (el.classList.contains(name + "-" + uid)) {
					found.unshift({
						type: "component",
						el: el,
						class: component.class || component,
						name: name,
						uid: uid,
					});
				}
			});

			// Services
			serviceConstructs.forEach((service: ServiceConstructor) => {
				const name = kebabCase(service.name);
				if (el.hasAttribute("v-" + name))
					found.unshift({
						type: "service",
						el: el,
						class: service.class || service,
						name: name,
					});
			});

			// plugins

			pluginConstructs.forEach((plugin: ComponentConstructor) => {
				const name = snakeCase(plugin.name);

				if (el.classList.contains(name)) {
					found.unshift({
						type: "plugin",
						el: el,
						class: plugin.class || plugin,
						name: name,
					});
				}
			});
		};

		const recursive = (node: HTMLElement) => {
			Array.from(node.children).forEach((el: any) => {
				check(el);
				recursive(el);
			});
		};

		check(node);
		recursive(node);
		return found;
	};

	const findComponent = (el: HTMLElement) => {
		return components.find((item: Component) => item.el == el);
	};

	const findService = (name: string, el: HTMLElement) => {
		return services.find((item: Service) => item.el == el && item.name == name);
	};

	const findServices = (name: String, els: HTMLElement[] | NodeList) => {
		return toArray(els).map((el) => mutator.findService("anim", el));
	};

	const init = (args: {
		el: HTMLElement;
		components: ComponentConstructor[];
		services: ServiceConstructor[];
		plugins: ComponentConstructor[];
	}) => {
		// Create nodes from existing nodes

		componentConstructs = args.components ?? [];
		serviceConstructs = args.services ?? [];
		pluginConstructs = args.plugins ?? [];

		// Check for document mutations

		new MutationObserver(onMutate).observe(args.el, {
			attributes: false,
			childList: true,
			subtree: true,
		});

		added(args.el);
	};

	return {
		init,
		findComponent,
		findService,
		findServices,
		components,
		services,
		plugins,
		mountedPromises,
		readyPromises,
		on,
		once,
		off,
	};
}

// Instance

let mutator: Mutator;

// Composables

export const useMutator = () => {
	if (!mutator) mutator = (Mutator as MutatorConstructor)();
	return mutator;
};

import { watch } from "@vue/reactivity";
import { Emitter, useStore } from "composables";
import md5 from "md5";
import { kebabCase, snakeCase } from "../utils";
import { Component, Service } from "core";

type Entry = {
	type: "component" | "service" | "plugin";
	el: HTMLElement;
	class: any;
	name: string;
	uid?: string;
};

function Mutator() {
	let componentConstructs = [];
	let serviceConstructs = [];
	let pluginConstructs = [];
	this.components = [];
	this.services = [];
	this.plugins = [];
	this.mountedPromises = [];
	this.readyPromises = [];

	const { emit, on, off } = new Emitter();
	this.on = on;
	this.off = off;
	const page = useStore("page");

	const onMutate = (mutations) => {
		for (const mutation of mutations) {
			if (mutation.type !== "childList") return null;
			mutation.addedNodes.forEach((node) => added(node));
			mutation.removedNodes.forEach((node) => removed(node));
		}
	};

	// Instantiate components and services from nodes added to document

	const added = async (node) => {
		if (node?.nodeType !== 1) return null; // do nothing on text nodes

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

		// 	this.mountedPromises.push(promise);
		// 	await promise;
		// }

		// Create components
		const items = traverse(node).reduce((result: any[], item: Entry) => {
			if (item.type == "service") {
				try {
					const instance = new item.class(item);
					this.services.push(instance);
					result.push(instance);
				} catch (error) {
					console.error(`Service: Error creating "${item.name}" \n`, error);
				}
			}
			if (item.type == "component") {
				try {
					const instance = new item.class(item);
					this.components.push(instance);
					result.push(instance);
				} catch (error) {
					console.error(`Component: Error creating "${item.name}" \n`, error);
				}
			}
			if (item.type == "plugin") {
				try {
					const instance = new item.class(item);
					this.plugins.push(instance);
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
			this.mountedPromises.push(promise);
			promise.then(() => {
				const index = this.mountedPromises.indexOf(promise);
				if (index > -1) {
					this.mountedPromises.splice(index, 1);
				}
			});
		});

		// Wait for component mount promises
		await Promise.all(this.mountedPromises);

		// All components have loaded
		if (this.mountedPromises.length == 0) {
			emit("ready");

			// lazyLoad(items); // load images sequentially
		}

		// Pile component mount promises
		items.forEach((item) => {
			if (!item) return;

			const promise = item.ready();
			this.readyPromises.push(promise);
			promise.then(() => {
				const index = this.readyPromises.indexOf(promise);
				if (index > -1) {
					this.readyPromises.splice(index, 1);
				}
			});
		});

		// Wait for component mount promises
		await Promise.all(this.readyPromises);

		// All components have loaded
		if (this.readyPromises.length == 0) {
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
			item.afterReadyCallbacks.forEach((callback) => callback());
		});
	};

	// Unmount components and services removed from page

	const removed = (node) => {
		if (node.nodeType !== 1) return null; // do nothing on text nodes

		const items = traverse(node);
		items.forEach((item: Entry) => {
			if (item.type == "service") {
				let i = this.services.length;
				while (i--) {
					if (this.services[i].el == item.el) {
						this.services[i].destroy(); // call unmount
						delete this.services[i]; // Delete from memory
						this.services.splice(i, 1); // Remove index from array
					}
				}
			}
			if (item.type == "component") {
				let i = this.components.length;
				while (i--) {
					if (this.components[i].el == item.el) {
						this.components[i].destroy(); // call unmount
						delete this.components[i]; // Delete from memory
						this.components.splice(i, 1); // Remove index from array
					}
				}
			}
			if (item.type == "plugin") {
				let i = this.plugins.length;
				while (i--) {
					if (this.plugins[i].el == item.el) {
						this.plugins[i].destroy(); // call unmount
						delete this.plugins[i]; // Delete from memory
						this.plugins.splice(i, 1); // Remove index from array
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

			componentConstructs.forEach((component: Component) => {
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
			serviceConstructs.forEach((service: Service) => {
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

			pluginConstructs.forEach((plugin: Component) => {
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

		const recursive = (node) => {
			Array.from(node.children).forEach((el: any) => {
				check(el);
				recursive(el);
			});
		};

		check(node);
		recursive(node);
		return found;
	};

	this.findComponent = (el) => {
		return this.components.find((item) => item.el == el);
	};

	this.findService = (name, el) => {
		return this.services.find((item) => item.el == el && item.name == name);
	};

	this.findServices = (name, els: HTMLElement[] | NodeList) => {
		return Array.from(els).map((el) => mutator.findService("anim", el));
	};

	this.init = (args: any) => {
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
}

// Instance

let mutator;

// Composables

export const useMutator = () => {
	if (!mutator) mutator = new Mutator();
	return mutator;
};

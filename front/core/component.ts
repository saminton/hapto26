import { isReadonly, isRef, reactive, ref } from "@vue/reactivity";
import { Emitter, useMutator } from "composables";
import { useReactivity } from "./reactivity";

export type Component = {
	el: HTMLElement;
	name: string;
	class: string;
	uid: string;
	promise: Promise<void>;
	provides: [];
	ready: () => Promise<void>;
	mount: () => Promise<void>;
	destroy: () => void;
};

export function Component(args) {
	this.el = args.el;
	this.name = args.name;
	this.uid = args.uid;
	this.promise = null;

	let isMounted = false;
	let isReady = false;
	let isUnmounted = false;

	// Construct

	this.mountedCallbacks = [];
	this.readyCallbacks = [];
	this.afterReadyCallbacks = [];
	this.unmountedCallbacks = [];
	this.provides = {};

	// Override global functions for current component

	window.onMounted = (callback: Function) => {
		this.mountedCallbacks.push(callback);
	};

	window.onReady = (callback: Function) => {
		this.readyCallbacks.push(callback);
	};

	window.afterReady = (callback: Function) => {
		this.afterReadyCallbacks.push(callback);
	};

	window.onUnmounted = (callback: Function) => {
		this.unmountedCallbacks.push(callback);
	};

	window.defineEmits = () => {
		if (!this.emitter) this.emitter = new Emitter();
		// Create emitter

		this.on = this.emitter.on;
		this.off = this.emitter.off;
		this.once = this.emitter.once;

		onUnmounted(() => {
			this.emitter.destroy();
		});

		// Return emit

		return this.emitter.emit;
	};

	window.provide = (key: string, value: any) => {
		this.provides[key] = value;
	};

	window.inject = (name: string, fallback: any = null) => {
		const mutator = useMutator();
		let el = this.el;

		const refer = ref(fallback);
		const { watch, effect } = useReactivity();

		onMounted(() => {
			let found;
			while (el.parentElement) {
				el = el.parentElement;
				// Find component
				const component = mutator.components.find((item) => {
					return item.el == el && Object.keys(item.provides).indexOf(name) != -1;
				});
				if (component) {
					found = component.provides[name];
				}
			}

			if (found !== undefined) {
				if (isRef(found)) {
					// Sync refs
					refer.value = found.value;
					watch(found, () => {
						refer.value = found.value;
					});

					if (!isReadonly(found))
						watch(refer, () => {
							found.value = refer.value;
						});
				} else refer.value = found;
			} else {
				// console.warn(`No parent found providing "${name}"`);
			}
		});
		return refer;
	};

	const warn = (name) => {
		console.warn(`${this.name} called '${name}' outside of component setup`);
	};

	this.mount = async () => {
		if (isMounted) return null;

		// Warn about inproper use
		window.onMounted = () => warn("onMounted");
		window.onReady = () => warn("onReady");
		window.afterReady = () => warn("afterReady");
		window.onUnmounted = () => warn("onUnmounted");
		window.provide = () => warn("provide");
		window.inject = () => warn("inject");
		window.defineEmits = () => warn("defineEmits");
		window.defineExpose = () => warn("defineExpose");

		this.promise = Promise.all(this.mountedCallbacks.map((callback) => callback()));
		await this.promise;
		isMounted = true;
	};

	this.ready = async () => {
		if (isReady) return null;

		this.promise = Promise.all(this.readyCallbacks.map((callback) => callback()));
		await this.promise;
		isReady = true;

		// If has been unmounted call destroy function
		if (isUnmounted) this.destroy();
	};

	// Public functions

	this.destroy = () => {
		isUnmounted = true;
		// If not yet mounted do nothing
		if (!isMounted) return null;
		this.unmountedCallbacks.forEach((callback) => callback());
	};

	window.defineExpose = (methods) => {
		Object.entries(methods).forEach(([key, value]) => {
			if (!this[key]) this[key] = value;
			else console.warn(`Cannot expose '${key}' is a reserved method`);
		});
	};
}

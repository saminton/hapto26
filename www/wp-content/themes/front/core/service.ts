import { Emitter } from "composables";

export type Service = {
	el: HTMLElement;
	name: string;
	class: string;
	supplying: [];
	promise: Promise<void>;
	ready: () => Promise<void>;
	mount: () => Promise<void>;
	destroy: () => void;
};

export function Service(args) {
	this.el = args.el;
	this.name = args.name;
	this.promise = null;

	let isMounted = false;
	let isReady = false;
	let isUnmounted = false;

	// Construct

	this.mountedCallbacks = [];
	this.readyCallbacks = [];
	this.afterReadyCallbacks = [];
	this.unmountedCallbacks = [];
	this.supplying = {};

	// Override global functions for current component

	window.onMounted = (callback) => {
		this.mountedCallbacks.push(callback);
	};

	window.onReady = (callback) => {
		this.readyCallbacks.push(callback);
	};

	window.afterReady = (callback: Function) => {
		this.afterReadyCallbacks.push(callback);
	};

	window.onUnmounted = (callback) => {
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

	window.supply = (key: string, value: any) => {
		this.supplying[key] = value;
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
		window.supply = () => warn("supply");

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

	this.destroy = () => {
		isUnmounted = true;
		// If not yet mounted do nothing
		if (!isUnmounted) return null;
		this.unmountedCallbacks.forEach((callback) => callback());
	};

	window.defineExpose = (methods) => {
		Object.entries(methods).forEach(([key, value]) => {
			if (!this[key]) this[key] = value;
			else console.warn(`Cannot expose '${key}' is a reserved method`);
		});
	};
}

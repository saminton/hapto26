import { Ref, ref } from "@vue/reactivity";
import { useEvents, useIntersect, useTick } from "composables";
import { useReactivity } from "core";
import { useEmitter } from "./emitter";

// Singleton

export type Renderer = {
	init: () => void;
	start: () => void;
	stop: () => void;
	delta: Ref<number>;
	tick: Ref<number>;
	clock: Ref<number>;
};

type RendererConstructor = {
	(): Renderer;
	new (): Renderer;
};

export type Tick = {
	time: number;
	deltaTime: number;
	delta: number;
};

function Renderer() {
	const events = useEvents();

	let request: number;
	this.delta = ref(0);
	this.tick = ref(0);
	this.clock = ref(performance.now());

	const frame = (past: number = null, now: number = performance.now()) => {
		if (request) return;
		request = requestAnimationFrame(() => {
			request = null;
			frame(now);
		});
		const last = past || now;

		this.clock.value = now * 0.001;
		this.delta.value = (now - last) * 0.001;
		this.tick.value = (now - last) * (60 / 1000); // normalize at 60fps

		const { emit } = useEmitter();
		const event: Tick = {
			time: this.clock.value,
			deltaTime: this.delta.value,
			delta: this.tick.value,
		};

		emit("beforeRender", event);
		emit("rendered", event);
		emit("afterRender", event);
	};

	this.init = () => {
		this.start();

		window.addEventListener("visibilitychange", (e) => {
			if (document.hidden) this.stop();
			else this.start();
		});
	};

	this.start = () => {
		if (!request) frame();
	};

	this.stop = () => {
		if (request) cancelAnimationFrame(request);
		request = null;
	};
}

// Instance

let renderer: Renderer;

// Composables

export const useRenderer = () => {
	if (!renderer) renderer = new (Renderer as RendererConstructor)();
	return renderer;
};

const listen = (node: HTMLElement, callback: (tick: Tick) => void, timing: string) => {
	if (!renderer) renderer = new (Renderer as RendererConstructor)();
	const { watch } = useReactivity();
	const tick = useTick(timing, callback);
	const intersect = useIntersect(node);

	watch(
		() => intersect.isIntersecting,
		() => {
			if (intersect.isIntersecting) tick.start();
			else tick.stop();
		},
	);

	onUnmounted(() => tick.stop());
};

export const onBeforeRender = (node: HTMLElement, callback: (tick: Tick) => void) => {
	listen(node, callback, "beforeRender");
};

export const onRendered = (node: HTMLElement, callback: (tick: Tick) => void) => {
	listen(node, callback, "rendered");
};

export const onAfterRender = (node: HTMLElement, callback: (tick: Tick) => void) => {
	listen(node, callback, "afterRender");
};

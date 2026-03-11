import { Ref, isRef, reactive } from "@vue/reactivity";
import { toArray } from "../utils";

export type Intersector = {
	observe: (
		els: HTMLElement | HTMLElement[] | Ref<HTMLElement> | Ref<HTMLElement[]>,
		callback: Function,
	) => void;
	unobserve: (
		els: HTMLElement | HTMLElement[] | Ref<HTMLElement> | Ref<HTMLElement[]>,
	) => void;
};

type IntersectorConstructor = {
	(): Intersector;
	new (): Intersector;
};

function Intersector(
	options: {
		root?: HTMLElement;
		rootMargin?: string; // 100px
		threshold?: number;
	} = {},
) {
	let storedItems: Array<{ el: HTMLElement; callback: Function }> = [];

	const onIntersect = (entries: IntersectionObserverEntry[]) => {
		entries.forEach((entry: IntersectionObserverEntry) => {
			storedItems.forEach((item) => {
				if (entry.target === item.el) item.callback(entry);
			});
		});
	};

	const observer = new IntersectionObserver(onIntersect, options);

	this.observe = (
		els: HTMLElement | HTMLElement[] | Ref<HTMLElement> | Ref<HTMLElement[]>,
		callback: Function,
	) => {
		if (isRef(els)) els = els.value;
		toArray(els).forEach((el) => {
			storedItems.push({
				el,
				callback,
			});
			observer.observe(el);
		});
	};

	this.unobserve = (
		els: HTMLElement | HTMLElement[] | Ref<HTMLElement> | Ref<HTMLElement[]>,
	) => {
		if (isRef(els)) els = els.value;
		toArray(els).forEach((el) => {
			storedItems = storedItems.filter((item) => item.el !== el);
			observer.unobserve(el);
		});
	};
}

// Instance

let intersector: Intersector;

// Composables

export const useIntersect = (node: HTMLElement | null) => {
	const item = reactive({
		bounds: {
			bottom: 0,
			height: 0,
			left: 0,
			right: 0,
			top: 0,
			width: 0,
			x: 0,
			y: 0,
		},
		isIntersecting: false,
	});

	if (!intersector) intersector = new (Intersector as IntersectorConstructor)();
	onReady(() => {
		if (node)
			intersector.observe(node, (event: IntersectionObserverEntry) => {
				item.bounds = event.boundingClientRect;
				item.isIntersecting = event.isIntersecting;
			});
	});

	onUnmounted(() => {
		if (node) intersector.unobserve(node);
	});

	return item;
};

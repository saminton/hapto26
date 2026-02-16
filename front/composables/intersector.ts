import { Ref, isRef, reactive } from "@vue/reactivity";
import { toArray } from "../utils";

function Intersector(
	options: {
		root?: HTMLElement;
		rootMargin?: string; // 100px
		threshold?: number;
	} = {},
) {
	let storedItems = [];

	const onIntersect = (entries) => {
		entries.forEach((entry: IntersectionObserverEntry) => {
			storedItems.forEach((item) => {
				if (entry.target === item.el) item.callback(entry);
			});
		});
	};

	const observer = new IntersectionObserver(onIntersect, options);

	this.observe = (els, callback) => {
		if (isRef(els)) els = els.value;
		toArray(els).forEach((el) => {
			storedItems.push({
				el,
				callback,
			});
			observer.observe(el);
		});
	};

	this.unobserve = (els) => {
		if (isRef(els)) els = els.value;
		toArray(els).forEach((el) => {
			storedItems = storedItems.filter((item) => item.el !== el);
			observer.unobserve(el);
		});
	};
}

// Instance

let intersector = null;

// Composables

export const useIntersect = (node: HTMLElement) => {
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

	if (!intersector) intersector = new Intersector();
	onReady(() => {
		intersector.observe(node, (event) => {
			item.bounds = event.boundingClientRect;
			item.isIntersecting = event.isIntersecting;
		});
	});

	onUnmounted(() => {
		intersector.unobserve(node);
	});

	return item;
};

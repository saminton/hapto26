import { isRef, Ref } from "@vue/reactivity";
import { debounce, toArray } from "../utils";

type NodeResizer = {
	observe: (
		els: HTMLElement | NodeList | Ref<HTMLElement> | Ref<NodeList>,
		callback: Function,
	) => void;
	unobserve: (els: HTMLElement | NodeList | Ref<HTMLElement> | Ref<NodeList>) => void;
};

type NodeResizerConstructor = {
	(): NodeResizer;
	new (): NodeResizer;
};

function NodeResizer() {
	let storedItems: {
		el: HTMLElement;
		callback: Function;
	}[] = [];

	const onResize = (entries: ResizeObserverEntry[]) => {
		entries.forEach((entry) => {
			storedItems.forEach((item) => {
				if (entry.target === item.el) item.callback(entry);
			});
		});
	};

	const observer = new ResizeObserver(onResize);

	this.observe = (
		els: HTMLElement | NodeList | Ref<HTMLElement> | Ref<NodeList>,
		callback: Function,
	) => {
		if (isRef(els)) els = els.value;
		toArray(els).forEach((el: HTMLElement) => {
			if (!el || el.nodeType !== 1) return null;
			storedItems.push({
				el,
				callback,
			});
			observer.observe(el);
		});
	};

	this.unobserve = (els: HTMLElement | NodeList | Ref<HTMLElement> | Ref<NodeList>) => {
		if (isRef(els)) els = els.value;
		toArray(els).forEach((el: HTMLElement) => {
			if (!el || el.nodeType !== 1) return null;
			storedItems = storedItems.filter((item) => item.el !== el);
			observer.unobserve(el);
		});
	};
}

// Instance

let resizer: NodeResizer;

// Composables

export const useNodeResizer = () => {
	if (!resizer) resizer = new (NodeResizer as NodeResizerConstructor)();
	return resizer;
};

export const onNodeResized = (els: any, callback: Function, wait: number = 200) => {
	const handle = wait == 0 ? callback : debounce(callback, wait);

	onMounted(() => {
		if (!resizer) resizer = new (NodeResizer as NodeResizerConstructor)();
		resizer.observe(els, handle);
	});

	onUnmounted(() => {
		if (!resizer) resizer = new (NodeResizer as NodeResizerConstructor)();
		resizer.observe(els, handle);
	});
};

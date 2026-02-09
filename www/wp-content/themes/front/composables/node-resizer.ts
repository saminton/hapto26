import { isRef } from "@vue/reactivity";
import { debounce, toArray } from "../utils";

function NodeResizer() {
	let storedItems: {}[] = [];

	const onResize = (entries) => {
		entries.forEach((entry) => {
			storedItems.forEach((item: any) => {
				if (entry.target === item.el) item.callback(entry);
			});
		});
	};

	const observer = new ResizeObserver(onResize);

	this.observe = (els, callback) => {
		if (isRef(els)) els = els.value;
		toArray(els).forEach((el) => {
			if (!el || el.nodeType !== 1) return null;
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
			if (!el || el.nodeType !== 1) return null;
			storedItems = storedItems.filter((item) => item.el !== el);
			observer.unobserve(el);
		});
	};
}

// Instance

let resizer;

// Composables

export const useNodeResizer = () => {
	if (!resizer) resizer = new NodeResizer();
	return resizer;
};

export const onNodeResized = (els: any, callback: Function, wait: number = 200) => {
	const handle = wait == 0 ? callback : debounce(callback, wait);

	onMounted(() => {
		if (!resizer) resizer = new NodeResizer();
		resizer.observe(els, handle);
	});

	onUnmounted(() => {
		if (!resizer) resizer = new NodeResizer();
		resizer.observe(els, handle);
	});
};

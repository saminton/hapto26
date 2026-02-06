import { useMutator } from "composables";
import md5 from "md5";

export const useScope = (target) => {
	const mutator = useMutator();

	// Definitions
	function child(query: string): HTMLElement;
	function child(query: string, component: boolean): any;

	// Implementation
	function child(query: string, component?: boolean): HTMLElement | any {
		const node = target.el ? target.el : target;
		// const el = node.querySelector(`.${target.name}-${query}-${target.uid}`);
		const el = node.querySelector(`.${query}-${target.uid}`);
		if (!component) return el;
		else return mutator.findComponent(el);
	}

	// Definitions
	function childOf(parent: HTMLElement, query: string): HTMLElement;
	function childOf(parent: HTMLElement, query: string, component: boolean): any;

	// Implementation
	function childOf(
		parent: HTMLElement,
		query: string,
		component?: boolean,
	): HTMLElement | any {
		// const el = parent.querySelector(
		// 	`.${target.name}-${query}-${target.uid}`,
		// ) as HTMLElement;
		const el = parent.querySelector(`.${query}-${target.uid}`) as HTMLElement;
		if (!component) return el;
		else return mutator.findComponent(el);
	}

	// Definitions
	function children(query: string): HTMLElement[];
	function children(query: string, component: boolean): any[];

	// Implementation
	function children(query: string, component?: boolean): HTMLElement[] | any[] {
		const node = target.el ? target.el : target;
		const els = Array.from(
			// node.querySelectorAll(`.${target.name}-${query}-${target.uid}`),
			node.querySelectorAll(`.${query}-${target.uid}`),
		);
		if (!component) return els as HTMLElement[];
		else return els.map((el) => mutator.findComponent(el));
	}

	// Definitions
	function childrenOf(parent: HTMLElement, query: string): HTMLElement[];
	function childrenOf(parent: HTMLElement, query: string, component: boolean): any[];

	// Implementation
	function childrenOf(
		parent: HTMLElement,
		query: string,
		component?: boolean,
	): HTMLElement[] | any[] {
		const els = Array.from(
			// parent.querySelectorAll(`.${target.name}-${query}-${target.uid}`),
			parent.querySelectorAll(`.${query}-${target.uid}`),
		);
		if (!component) return els as HTMLElement[];
		else return els.map((el) => mutator.findComponent(el));
	}

	function component(query: string): any {
		const el = target.el ? target.el : target;
		const uid = md5(query).slice(0, 4);
		return mutator.findComponent(el.querySelector("." + query + "-" + uid));
	}

	function components(query: string): any[] {
		const el = target.el ? target.el : target;
		const uid = md5(query).slice(0, 4);
		return Array.from(el.querySelectorAll("." + query + "-" + uid)).map((el) =>
			mutator.findComponent(el),
		);
	}

	function service(query: string): any {
		const el = target.el ? target.el : target;
		return mutator.findService(query, el.querySelector(`[v-${query}]`));
	}

	function services(query: string): any[] {
		const el = target.el ? target.el : target;
		return Array.from(el.querySelectorAll(`[v-${query}]`)).map((el) =>
			mutator.findService(query, el),
		);
	}

	function createEl(tag: string, className: string, appendTo: HTMLElement) {
		const el = document.createElement(tag);
		el.classList.add(`.${target.name}-${className}-${target.uid}`);
		if (appendTo) appendTo.appendChild(el);
		return el;
	}

	return {
		child,
		childOf,
		children,
		childrenOf,
		component,
		components,
		service,
		services,
		createEl,
	};
};

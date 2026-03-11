import { useMutator } from "composables";
import md5 from "md5";
import { Component } from "./component";
import { Service } from "./service";

export const useScope = (target: Component) => {
	const mutator = useMutator();

	// Implementation
	function child(query: string): HTMLElement | null {
		const el = target.el.querySelector(`.${query}-${target.uid}`) as HTMLElement;
		return el;
	}

	// Definitions
	// Implementation
	function childOf(parent: HTMLElement, query: string): HTMLElement | any {
		const el = parent.querySelector(`.${query}-${target.uid}`) as HTMLElement;
		return el;
	}

	// Implementation
	function children(query: string, component?: boolean): HTMLElement[] | any[] {
		const els = Array.from(
			target.el.querySelectorAll(`.${query}-${target.uid}`),
		) as HTMLElement[];
		return els;
	}

	// Implementation
	function childrenOf(
		parent: HTMLElement,
		query: string,
		component?: boolean,
	): HTMLElement[] | any[] {
		const els = Array.from(
			parent.querySelectorAll(`.${query}-${target.uid}`),
		) as HTMLElement[];
		return els;
	}

	function component(query: string): Component {
		const uid = md5(query).slice(0, 4);
		return mutator.findComponent(target.el.querySelector("." + query + "-" + uid));
	}

	function components(query: string): Component[] {
		const uid = md5(query).slice(0, 4);
		return Array.from(target.el.querySelectorAll("." + query + "-" + uid)).map((el) =>
			mutator.findComponent(el),
		);
	}

	function service(query: string): Service {
		return mutator.findService(query, target.el.querySelector(`[v-${query}]`));
	}

	function services(query: string): Service[] {
		return Array.from(target.el.querySelectorAll(`[v-${query}]`)).map((el) =>
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

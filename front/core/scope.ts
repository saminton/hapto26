import { useMutator } from "composables";
import { Component } from "./component";
import { Service } from "./service";

export const useScope = (target: Component) => {
	const mutator = useMutator();

	// Implementation
	function child(query: string): Element | null {
		const el = target.el.querySelector(`.${query}-${target.uid}`) as Element;
		return el;
	}

	// Definitions
	// Implementation
	function childOf(parent: Element, query: string): Element | null {
		const el = parent.querySelector(`.${query}-${target.uid}`) as Element;
		return el;
	}

	// Implementation
	function children(query: string, component?: boolean): Element[] | any[] {
		const els = Array.from(
			target.el.querySelectorAll(`.${query}-${target.uid}`),
		) as Element[];
		return els;
	}

	// Implementation
	function childrenOf(
		parent: Element,
		query: string,
		component?: boolean,
	): Element[] | any[] {
		const els = Array.from(
			parent.querySelectorAll(`.${query}-${target.uid}`),
		) as Element[];
		return els;
	}

	function component(query: string): Component {
		// const uid = md5(query).slice(0, 4);
		return mutator.findComponent(target.el.querySelector("." + query + "-" + target.uid));
	}

	function components(query: string): Component[] {
		// const uid = md5(query).slice(0, 4);
		return Array.from(target.el.querySelectorAll("." + query + "-" + target.uid)).map(
			(el) => mutator.findComponent(el),
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

	function createEl(tag: string, className: string, appendTo: Element) {
		const el = document.createElement(tag);
		el.classList.add(`${className}-${target.uid}`);
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

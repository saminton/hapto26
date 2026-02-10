import { isRef, reactive, ref, unref } from "@vue/reactivity";
import { camelCase } from "./case";
import { isNumeric } from "./types";
import { useMutator } from "composables";

export const getComponent = (node: HTMLElement) => {
	if (!node) return null;
	const mutator = useMutator();
	return mutator.findComponent(node);
};

export const extend = (constructor: Function, target: any, args: any = null) => {
	constructor.call(target, args); // Extend component
	return Object.assign({}, target); // Create super
};

export const getProps = (node: HTMLElement) => {
	let props: any = Object.assign({}, node.dataset);

	node.getAttributeNames().forEach((param, i) => {
		// Ignore classes and services
		if (param.indexOf("c-") == 0) return null;
		let value = node.getAttribute(param);
		let key = param.replace(/^(data-|c-|a-|s-|v-)/gi, "");
		key = camelCase(key);
		props[key] = value;
	});

	Object.keys(props).forEach((key) => {
		let value = props[key];

		// Boolean values
		if (value === "true") value = true;
		else if (value === "false") value = false;
		// Empty value
		else if (value === "") value = null;
		// Numerical value
		else if (isNumeric(value)) value = parseFloat(value);
		// Sequence of numbers
		// else if (/^\s*\d+(\s*,\s*\d+)*\s*$/.test(value)) {
		// 	value = value.split(",").map((value) => Number(value));
		// }
		// Json
		else
			try {
				value = JSON.parse(value);
				node.removeAttribute(key);
			} catch (error) {}

		props[key] = value;
	});

	return props;
};

const states = {};

export const useState = (name: string, value: Function) => {
	if (states[name]) return states[name];
	else {
		states[name] = ref(value());
		return states[name];
	}
};

export const receive = (name: string, node: any) => {
	const data = reactive({});
	const mutator = useMutator();

	const update = (el) => {
		if (!el) return null;
		let service = undefined;

		while (el && !service) {
			service = mutator.findService(name, el);
			if (service) Object.assign(data, service.supplying[name]);
			el = el.parentElement;
		}
	};

	onMounted(() => {
		update(unref(node));
	});

	return data as any;
};

export const withDefaults = <T extends { [key: string]: any }>(
	a: T,
	b: { [key: string]: any },
): T => {
	// const values = b;
	// Object.entries(a).forEach((entry) => {
	// 	const key = entry[0];
	// 	const value = entry[1];
	// 	values[key] = value;
	// });

	// return values as T;
	return Object.assign({}, b, a);
};

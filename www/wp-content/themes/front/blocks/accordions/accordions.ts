import { Component, useReactivity, useScope } from "core";
import { ref, reactive } from "@vue/reactivity";
import { useEvents, useStore } from "composables";
import { getProps, extend } from "utils";
import { AccordionComponent } from "modules/accordion";

export interface AccordionsComponent extends Component {
	el: HTMLElement;
}

export function Accordions(args: Component) {
	// Extend

	extend(Component, this, args);
	const node = args.el;

	// Props

	const { on, once } = useEvents();
	const { child, children, components } = useScope(this);
	const { watch, effect, computed } = useReactivity();

	const {} = getProps(node);

	// Vars

	const items = components("accordion") as AccordionComponent[];

	// Hooks

	onMounted(() => {
		items.forEach((item, i) => {
			if (i == 0) item.open();
			on(item, "open", closeOthers(item));
		});
	});

	onUnmounted(() => {});

	// Functions

	const closeOthers = (item: AccordionComponent) => () => {
		items.forEach((other) => {
			if (other != item) other.close();
		});
	};

	// Effects
}

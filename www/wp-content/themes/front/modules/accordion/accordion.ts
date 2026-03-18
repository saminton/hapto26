import { Component, useReactivity, useScope } from "core";
import { ref, reactive, Ref } from "@vue/reactivity";
import { useAccordion, useEvents, useStore } from "composables";
import { getProps, extend } from "utils";

export interface AccordionComponent extends Component {
	el: HTMLElement;
	isOpen: Ref<boolean>;
	open: () => void;
	close: () => void;
}

export function Accordion(args: Component) {
	// Extend

	extend(Component, this, args);
	const node = args.el;

	// Props

	const { on, once } = useEvents();
	const { child, children } = useScope(this);
	const { watch, effect, computed } = useReactivity();

	const {} = getProps(node);

	// Vars

	const summaryEl = child("summary") as HTMLButtonElement;
	const contentEl = child("content") as HTMLElement;

	const emit = defineEmits();

	const { isOpen, open, close } = useAccordion({
		el: node,
		summaryEl: summaryEl,
		contentEl: contentEl,
	});

	// Hooks

	onMounted(() => {});

	onUnmounted(() => {});

	// Functions

	effect(() => {
		if (isOpen.value) {
			emit("open");
		} else {
			emit("close");
		}
	});

	// Effects

	defineExpose({
		isOpen,
		open,
		close,
	});
}

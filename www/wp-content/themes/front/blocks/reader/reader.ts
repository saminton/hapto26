import { Component, useReactivity, useScope } from "core";
import { ref, reactive } from "@vue/reactivity";
import {
	AnimData,
	onRendered,
	SplitBy,
	useAnim,
	useBounds,
	useEvents,
	useSplit,
	useStore,
} from "composables";
import { getProps, extend } from "utils";
import { gsap } from "gsap";

export interface ReaderComponent extends Component {
	el: HTMLElement;
}

export function Reader(args: Component) {
	// Extend

	extend(Component, this, args);
	const node = args.el;

	// Props

	const { on, once } = useEvents();
	const { child, children } = useScope(this);
	const { watch, effect, computed } = useReactivity();

	const {} = getProps(node);

	// Vars

	const textEl = child("text") as HTMLElement;

	const split = useSplit(textEl, SplitBy.LETTERS);
	const bounds = useBounds(textEl);
	const device = useStore("device");
	const scroll = useStore("scroll");

	// Hooks

	onMounted(() => {});

	onReady(() => {});

	onUnmounted(() => {});

	// Functions

	// Effects

	effect(() => {
		const p = ((bounds.top - scroll.position - device.height * 0.7) / bounds.height) * -1;
		split.letters.value.forEach((el, i) => {
			el.inert = i / split.letters.value.length > p;
		});
	});
}

import { Component, useReactivity, useScope } from "core";
import { ref, reactive } from "@vue/reactivity";
import {
	onBeforeResize,
	onResized,
	useBounds,
	useEvents,
	useSticky,
	useStore,
} from "composables";
import { getProps, extend, clamp, cssVar } from "utils";
import { SolutionDemoComponent } from "blocks/solution-demo";

export interface SolutionComponent extends Component {
	el: HTMLElement;
}

export function Solution(args: Component) {
	// Extend

	extend(Component, this, args);
	const node = args.el;

	// Props

	const { on, once } = useEvents();
	const { child, children, component } = useScope(this);
	const { watch, effect, computed } = useReactivity();

	const {} = getProps(node);

	// Vars

	const heroEl = child("hero") as HTMLElement;
	const demoEl = child("demo") as HTMLElement;
	const containerEl = child("container") as HTMLElement;
	const demo = component("demo") as SolutionDemoComponent;
	const scroll = useStore("scroll");
	const device = useStore("device");

	useSticky({ el: demoEl });
	const heroBounds = useBounds(heroEl);
	const containerBounds = useBounds(containerEl);

	// Hooks

	onMounted(() => {
		update();
	});

	onUnmounted(() => {});

	onBeforeResize(() => {
		update();
	});

	// Functions

	const update = () => {
		// const childEl = heroEl.firstElementChild as HTMLElement;
		// heroEl.style.height = childEl.clientHeight + "px";
		// childEl.style.position = "fixed";
		// childEl.style.top = "0";
		// heroEl.style.position = "sticky";
		// heroEl.style.top = "0";
	};

	// Effects

	effect(() => {
		const p1 = clamp(scroll.position / heroBounds.height, 0, 1);
		const total = containerBounds.height - device.height;
		const p2 = clamp((scroll.position - heroBounds.height) / (total - 500), 0, 1);

		heroEl.style.opacity = String(1 - p1);
		demo.progress.value = (p1 + p2) / 2;
	});

	effect(() => {
		// demo.progress.value = progress.value;
	});
}

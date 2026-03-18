import { ref, reactive, Ref } from "@vue/reactivity";
import { onAfterResize, useBounds, useEvents, useStore } from "composables";
import { Component, useReactivity, useRoute, useScope } from "core";
import { Bounds } from "types";
import { aria, closest, extend, getBounds, getProps, toArray } from "utils";

export interface HeaderComponent extends Component {
	el: HTMLElement;
}

export function Header(args: Component) {
	// Extend

	extend(Component, this, args);
	const node = args.el;

	// Props

	const { on, once } = useEvents();
	const { child, children, createEl } = useScope(this);
	const { watch, effect } = useReactivity();

	const {} = getProps(node);

	// Vars

	const route = useRoute();
	const toggleEl = child("toggle");
	const menu = useStore("menu");
	const itemsEls = children("items") as HTMLLinkElement[];
	const page = useStore("page");
	const anchorsEl = child("anchors");

	const scroll = useStore("scroll");
	const device = useStore("device");

	let anchors: {
		el: HTMLElement; //
		targetEl: HTMLElement;
		targetBounds: Bounds;
	}[] = [];
	const anchorIndex = ref(0);

	// Hooks

	onMounted(() => {
		populate();
	});

	onUnmounted(() => {});

	// Functions

	const populate = () => {
		anchors = [];
		toArray(document.querySelectorAll("[v-anchor]")).forEach((el: HTMLElement) => {
			const li = createEl("li", "anchor", anchorsEl);
			const a = createEl("a", "", li) as HTMLLinkElement;
			a.href = "#" + el.id;
			a.innerText = el.getAttribute("v-anchor");
			a.addEventListener("click", (e) => {
				e.preventDefault();
				scroll.to(el, 60);
			});

			anchors.push({
				el: li,
				targetEl: el,
				targetBounds: getBounds(el),
			});
		});
	};

	onAfterResize(() => {
		anchors.forEach((anchor) => {
			anchor.targetBounds = getBounds(anchor.targetEl);
		});
	});

	// Effects

	watch(
		() => scroll.position,
		() => {
			const current = closest(
				anchors,
				scroll.position,
				(item) => item.targetBounds.top,
				(goal, top) => top - device.height * 0.5 < goal,
			);
			anchorIndex.value = current.index;
		},
	);

	watch(anchorIndex, () => {
		anchors.forEach((anchor, i) => {
			aria(anchor.el, "current", i == anchorIndex.value);
		});
	});

	effect(() => {
		itemsEls.forEach((el) => {
			aria(el, "current", el.href == route.fullPath);
		});
	});
}

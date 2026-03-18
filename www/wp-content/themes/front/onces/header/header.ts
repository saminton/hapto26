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
		targetTop: Number;
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
		anchorsEl.innerHTML = "";
		toArray(page.el.querySelectorAll("[v-anchor]")).forEach((el: HTMLElement) => {
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
				targetTop: getBounds(el).top,
			});
		});
	};

	onAfterResize(() => {
		console.log(`resized`);
		anchors.forEach((anchor) => {
			anchor.targetTop = getBounds(anchor.targetEl).top + scroll.position;
		});
	});

	// Effects

	watch(
		() => page.el,
		() => populate(),
	);

	watch(
		() => scroll.position,
		() => {
			const current = closest(
				anchors,
				scroll.position,
				(item) => item.targetTop,
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

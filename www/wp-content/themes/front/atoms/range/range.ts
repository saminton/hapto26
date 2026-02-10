import { computed, ref } from "@vue/reactivity";
import { useBounds, useDrag, useEvents } from "composables";
import { Component, useReactivity, useScope } from "core";
import { extend, getBounds, getProps, remap } from "utils";

export function Range(args) {
	// Extend

	extend(Component, this, args);
	const node = args.el;

	// Props

	const { on, once } = useEvents();
	const { child, children } = useScope(this);
	const { watch, effect } = useReactivity();

	const {} = getProps(node);

	// Vars

	const dragEl = child("drag");
	const inputEl = child("input") as HTMLInputElement;
	const drag = useDrag(dragEl);
	const bounds = useBounds(node);
	const dragBounds = getBounds(dragEl);

	let current = ref(Number(inputEl.value));
	let position = computed(() =>
		remap(
			Number(inputEl.min), //
			Number(inputEl.max),
			0,
			bounds.width - dragBounds.width,
			current.value,
		),
	);

	// Hooks

	onMounted(() => {
		update();
	});

	onUnmounted(() => {});

	// Handles

	const onDrag = () => {
		current.value = remap(
			0,
			bounds.width - dragBounds.width,
			Number(inputEl.min),
			Number(inputEl.max),
			position.value + drag.deltaX,
		);
	};

	// Functions

	const update = () => {
		dragEl.style.transform = `translateX(${position.value}px)`;
	};

	// Effects

	watch(() => drag.x, onDrag);
	watch(() => position.value, update);

	defineExpose({
		current,
	});
}

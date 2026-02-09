import { ref } from "@vue/reactivity";
import {
	events,
	onNodeResized,
	onResized,
	useAnim,
	useEvents,
	useStore,
} from "composables";
import { useIntersect } from "composables/intersector";
import { Component, useReactivity, useScope } from "core";
import { extend, getBounds, getProps, receive } from "utils";

export function Image(args) {
	// Extend

	extend(Component, this, args);
	const node = args.el;

	// Props

	const { on, once } = useEvents();
	const { child, children } = useScope(this);
	const { watch, effect } = useReactivity();

	const {
		preload, //
		fit,
		src,
		srcset,
		loaded,
		retina,
	} = getProps(node);

	// Vars

	const device = useStore("device");
	const sourceEl = child("source");

	// Hooks

	onMounted(async () => {
		setSize();
	});

	onResized(() => {
		setSize();
	});

	const setSize = () => {
		const bounds = getBounds(node);
		const containerRatio = bounds.width / bounds.height;
		const attr = getProps(sourceEl);
		const imageRatio = attr.width / attr.height;
		let width = bounds.width;
		let height = bounds.height;

		if (fit && fit == "contain") {
			// Check if the image is wider or taller than the container
			if (imageRatio > containerRatio) {
				// Image is wider, so it should fill the container width
				width = bounds.width;
				height = bounds.height / imageRatio;
			} else {
				// Image is taller, so it should fill the container height
				height = bounds.height;
				width = bounds.width * imageRatio;
			}
		}

		if (fit && fit == "cover") {
			// Check if the image is wider or taller than the container
			if (imageRatio > containerRatio) {
				// Image is wider, so it should fit the container height
				height = bounds.height;
				width = height * imageRatio;
			} else {
				// Image is taller, so it should fit the container width
				width = bounds.width;
				height = width / imageRatio;
			}
		}

		if (!retina) {
			width = width / window.devicePixelRatio;
		}

		sourceEl?.setAttribute("sizes", (width / device.width) * 100 + "vw");
	};
}

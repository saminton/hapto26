import { onResized, useEvents, useStore } from "composables";
import { Component, useReactivity, useScope } from "core";
import { extend, getBounds, getProps } from "utils";

export interface MediaComponent extends Component {
	el: HTMLElement;
	type: string;
	play: () => void;
	pause: () => void;
	seek: (time: number) => void;
	getDuration: () => number;
}

export function Media(args: Component) {
	// Extend

	extend(Component, this, args);
	const node = args.el;

	// Props

	const { on, once } = useEvents();
	const { child, children } = useScope(this);
	const { watch, effect } = useReactivity();

	const { fit, type } = getProps(node);

	// Vars

	const emit = defineEmits();
	const device = useStore("device");
	const imageEl = child("image") as HTMLImageElement;
	const videoEl = child("video") as HTMLVideoElement;

	// Hooks

	onMounted(async () => {
		setSize();
		if (imageEl && imageEl.getAttribute("loading") == "eager") await load();
		if (videoEl) on(videoEl, "ended", () => emit("ended"));
	});

	onResized(() => {
		setSize();
	});

	const load = async () => {
		if (imageEl) {
			if (!imageEl.complete || imageEl.naturalWidth === 0)
				await Promise.race([
					once(imageEl, "load"), //
					once(imageEl, "error"),
				]);
			imageEl.setAttribute("loading", "eager");
		}
		if (videoEl)
			await new Promise<void>(async (resolve, reject) => {
				try {
					const response = await fetch(videoEl.src);
					const arrayBuffer = await response.arrayBuffer();
					const blob = new Blob([arrayBuffer], { type: "video/yourvideosmimmetype" }); // Assuming a generic video mimetype or it could be determined from response.headers.get('Content-Type')
					videoEl.src = URL.createObjectURL(blob);
					resolve();
				} catch (error) {
					reject(error);
				}
			});
	};

	const setSize = () => {
		if (!imageEl) return;
		const bounds = getBounds(node);
		const containerRatio = bounds.width / bounds.height;
		const attr = getProps(imageEl);
		const ratio = attr.width / attr.height;
		let width = bounds.width;
		let height = bounds.height;

		if (fit && fit == "contain") {
			// Check if the image is wider or taller than the container
			if (ratio > containerRatio) {
				// Image is wider, so it should fill the container width
				width = bounds.width;
				height = bounds.height / ratio;
			} else {
				// Image is taller, so it should fill the container height
				height = bounds.height;
				width = bounds.width * ratio;
			}
		}

		if (fit && fit == "cover") {
			// Check if the image is wider or taller than the container
			if (ratio > containerRatio) {
				// Image is wider, so it should fit the container height
				height = bounds.height;
				width = height * ratio;
			} else {
				// Image is taller, so it should fit the container width
				width = bounds.width;
				height = width / ratio;
			}
		}

		imageEl.setAttribute("sizes", (width / device.width) * 100 + "vw");
	};

	const play = () => {
		if (!videoEl) return;
		videoEl.play();
	};

	const pause = () => {
		if (!videoEl) return;
		videoEl.pause();
	};

	const seek = (time: number) => {
		if (!videoEl) return;
		if (time < videoEl.duration - 0.1) videoEl.currentTime = time;
	};

	const getDuration = () => {
		if (!videoEl) return 0;
		return videoEl.duration;
	};

	defineExpose({
		type,
		play,
		pause,
		seek,
		getDuration,
	});
}

import { Component, useReactivity, useScope } from "core";
import { ref, reactive } from "@vue/reactivity";
import { onAfterResize, useAnim, useEvents, useSticky, useStore } from "composables";
import { getProps, extend, getBounds, aria } from "utils";
import { gsap } from "gsap";
import { MediaComponent } from "atoms/media";

export interface DemoPreviewComponent extends Component {
	el: HTMLElement;
}

export function DemoPreview(args: Component) {
	// Extend

	extend(Component, this, args);
	const node = args.el;

	// Props

	const { on, once } = useEvents();
	const { child, children, components } = useScope(this);
	const { watch, effect, computed } = useReactivity();

	const {} = getProps(node);

	// Vars

	const columnsEl = child("columns") as HTMLElement;
	const titleItems = children("title_item").map((el) => ({
		el,
		anim: useAnim({
			el,
			name: "title",
			detect: false,
		}),
	}));
	const listItemEls = children("list_item") as HTMLElement[];
	const videos = components("video") as MediaComponent[];
	const videosEl = child("videos") as HTMLElement;
	const leftEl = child("left") as HTMLElement;
	const topEl = child("top") as HTMLElement;
	const listEl = child("list") as HTMLElement;
	const fluxEl = child("flux") as HTMLElement;

	const total = titleItems.length + 1;
	const titleIndex = ref(0);
	const listIndex = ref(-1);
	const { unsmoothedProgress: progress } = useSticky({
		el: columnsEl,
	});
	const device = useStore("device");

	let timeline: GSAPTimeline;

	// Hooks

	onMounted(() => {
		setup();
		on(listItemEls, "mouseenter", (el, e, i) => {
			listIndex.value = i;
		});
		on(
			videos,
			"ended",
			() => (listIndex.value = (listIndex.value + 1) % listItemEls.length),
		);
	});

	onAfterResize(() => {
		setup();
	});

	onUnmounted(() => {});

	// Functions

	const setup = () => {
		fluxEl.style.height = `calc(${total + 3 * 100}rem)`;
		const segment = 1 / total;
		const tl = gsap.timeline({ paused: true });
		const top = getBounds(leftEl).height / 2;
		tl.fromTo(
			topEl,
			{ y: top, scale: 2 },
			{ y: 0, scale: 1, duration: segment },
			1 - segment * 2,
		);
		// tl.fromTo(
		// 	[listEl, videosEl],
		// 	{ opacity: 0 },
		// 	{ opacity: 1, duration: segment },
		// 	1 - segment
		// );

		timeline = tl;
	};

	// Effects

	watch(progress, () => {
		timeline?.progress(progress.value / timeline.duration());
		titleIndex.value = Math.round(progress.value * (total + 2));
	});

	effect(() => {
		titleItems.forEach((item, i) => {
			var isHidden = i != Math.min(titleIndex.value - 1, titleItems.length - 1);
			if (!isHidden && item.el.hidden) item.anim.play();
			item.el.hidden = isHidden;
		});

		listEl.inert = titleIndex.value < titleItems.length + 2;
		videosEl.inert = titleIndex.value < titleItems.length + 2;
	});

	watch(titleIndex, (curr: number, prev: number) => {
		if (titleIndex.value == titleItems.length + 2 && prev < curr) {
			listIndex.value = 0;
			if (videos[0]) videos[0].play();
		}
	});

	effect(() => {
		videos.forEach((video: MediaComponent, i) => {
			video.el.hidden = i != listIndex.value;
			if (i == listIndex.value) {
				video.seek(0);
				video.play();
			} else {
				video.seek(0);
				video.pause();
			}
		});

		listItemEls.forEach((el, i) => {
			aria(el, "current", i == listIndex.value);
		});
	});
}

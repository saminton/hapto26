import { computed, ref } from "@vue/reactivity";
import { events, onRendered, useEvents } from "composables";
import { useIntersect } from "composables/intersector";
import { Component, useReactivity, useScope } from "core";
import { aria, debounce, extend, getProps } from "utils";

export function Video(args) {
	// Extend

	extend(Component, this, args);
	const node = args.el;

	// Props

	const { on, once } = useEvents();
	const { child, children } = useScope(this);
	const { watch, effect } = useReactivity();

	const {
		url, //
		src,
		autoplay,
		muted,
		loop,
		hasControls,
		platform,
	} = getProps(node);

	// Vars

	const sourceEl = child("source") as HTMLVideoElement;
	const playEl = child("play");
	const overlayEl = child("overlay");
	const progressEl = child("progress") as HTMLProgressElement;
	const controlsEl = child("controls");
	const coverEl = child("cover");
	const intersect = useIntersect(node);

	const isLoaded = ref(false);
	const controlsHidden = ref(true);
	const current = ref(url ?? src);
	const isMuted = ref(muted ? true : false);

	// Use states
	// -1: Not started
	// 0: Ended
	// 1: Playing
	// 2: Paused
	// 3: Buffering

	const state = ref(-1);

	let youtube;
	let vimeo;

	onMounted(() => {
		on([playEl, overlayEl, coverEl], "click", toggle);
		on(node, ["mouseenter", "focusin", "mousemove"], showControls);
		on(node, ["mouseout", "focusout"], () => hideControls);
		on(node, "mousemove", delayHideControls);
		on(progressEl, "click", progressClick);
	});

	onUnmounted(() => {
		//
	});

	onRendered(node, () => {
		if (!progressEl) return;
		if (!platform) progressEl.value = (sourceEl.currentTime / sourceEl.duration) * 100;
		if (youtube)
			progressEl.value = (youtube.getCurrentTime() / youtube.getDuration()) * 100;
	});

	// Functions

	const toggle = () => {
		if (state.value == 2 || state.value == 3) play();
		else pause();
	};

	const showControls = () => {
		controlsHidden.value = false;
	};
	const hideControls = () => {
		if (state.value == 1) controlsHidden.value = true;
	};

	const delayHideControls = debounce(() => {
		if (state.value == 1) controlsHidden.value = true;
	}, 750);

	const progressClick = (el, e) => {
		let rect = progressEl.getBoundingClientRect();
		let x = e.clientX - rect.left;

		const progress = x / progressEl.clientWidth;
		const duration = youtube?.getDuration() ?? sourceEl.duration;
		seek(progress * duration);
	};

	const load = async (src: string = null) => {
		state.value = 3;
		if (src) current.value = src;

		// Youtube
		if (platform == "youtube") {
			if (!youtube) await loadYoutube();
			else {
				// Todo: add promise
				// youtube.loadVideoById(current.value);
			}
			return;
		}

		// Vimeo
		if (platform == "vimeo") {
			if (!vimeo) await loadVimeo();
			else {
				// Todo: add promise
				// vimeo.loadVideoById(current.value);
			}
			return;
		}

		// File
		loadFile();
	};

	const loadFile = async () => {
		sourceEl.src = current.value;

		// Metadata loaded
		// await events.once(sourceEl, "loadeddata");

		// Video ready to play
		await events.once(sourceEl, "canplay");

		isLoaded.value = true;
		state.value = 2;
		if (intersect.isIntersecting && autoplay) play();
	};

	const loadScript = (src: string) =>
		new Promise<void>((resolve, reject) => {
			// Youtube script already addded
			if (document.querySelector(`script[src*="${src}"]`)) {
				resolve();
				return;
			}

			// Append script
			const scriptEl = document.createElement("script");
			scriptEl.src = src;
			const el = document.getElementsByTagName("script")[0];
			el.parentNode.insertBefore(scriptEl, el);

			scriptEl.onload = () => {
				resolve();
			};
		});

	const loadYoutube = async () => {
		// Load script
		if (!window.YT) {
			await loadScript("https://www.youtube.com/iframe_api");
			await new Promise<void>((resolve, reject) => {
				const timer = setInterval(() => {
					if (window.YT) {
						clearInterval(timer);
						resolve();
					}
				}, 500);
			});
		}

		// Create player
		await new Promise<void>((resolve, reject) => {
			const temp = new YT.Player(sourceEl, {
				videoId: current.value,
				playerVars: {
					autoplay: autoplay,
					muted: isMuted.value,
					controls: 0,
					rel: 0,
					fs: 0,
					modestbranding: 1,
				},
				events: {
					onReady: () => {
						youtube = temp;
						isLoaded.value = true;

						if (isMuted.value) youtube.mute();
						if (autoplay) state.value = 1;
						else pause();
						resolve();
					},
					onStateChange: (e) => {
						if (e.data == 0 && loop) youtube.seekTo(0);
						state.value = e.data;
					},
				},
			});
		});
	};

	const loadVimeo = async () => {
		await loadScript("https://player.vimeo.com/api/player.js");
		vimeo = new (window as any).Vimeo.Player(sourceEl, {
			id: current.value,
			width: node.offsetWidth,
			controls: false,
			autoplay: autoplay,
			muted: muted.value,
			loop: loop,
		});

		isLoaded.value = true;
		if (autoplay) state.value = 1;
	};

	const play = () => {
		state.value = 1;
	};

	const pause = () => {
		state.value = 2;
	};

	const mute = () => {
		isMuted.value = true;
	};

	const unMute = () => {
		isMuted.value = false;
	};

	const seek = (time: number) => {
		youtube?.seekTo(time);
		sourceEl.currentTime = time;
	};

	// Effects

	watch(
		() => intersect.isIntersecting,
		() => {
			if (intersect.isIntersecting) {
				if (!isLoaded.value) {
					load();
					return;
				}
				if (autoplay) play();
			} else {
				if (autoplay) pause();
			}
		},
	);

	effect(() => {
		node.setAttribute("loaded", isLoaded.value);
	});

	effect(() => {
		console.log(state.value);

		switch (state.value) {
			case 1:
				if (!platform) sourceEl.play();
				youtube?.playVideo();
				vimeo?.play();
				controlsHidden.value = true;
				break;
			case 2:
				if (!platform) sourceEl.pause();
				youtube?.pauseVideo();
				vimeo?.pause();
				controlsHidden.value = false;

			default:
				break;
		}
	});

	effect(() => {
		if (overlayEl) aria(overlayEl, "hidden", controlsHidden.value);
		if (playEl) aria(playEl, "hidden", controlsHidden.value);
		if (controlsEl) aria(controlsEl, "hidden", state.value != 1 || controlsHidden.value);
	});

	effect(() => {
		if (state.value == 1) aria(coverEl, "hidden", true);
	});

	effect(() => {
		if (isMuted.value) {
			youtube?.mute();
			vimeo?.setVolume(0);
		} else {
			youtube?.unMute();
			vimeo?.setVolume(1);
		}
		sourceEl?.toggleAttribute("muted", isMuted.value);
	});

	defineExpose({
		state: computed(() => state.value), // readonly
		isMuted,
		play,
		pause,
		toggle,
		seek,
		load,
		mute,
		unMute,
	});
}

import { Ref, ref, watch } from "@vue/reactivity";
import { useRoute } from "core";
import { useEvents } from "./events";
import { withDefaults } from "utils";

interface AudioManager {
	el: HTMLElement;
	isMuted: Ref<boolean>;
	current: Ref<any>;
	add: (fileName: string) => void;
	reset: (fileName: string) => void;
	play: (
		fileName: string,
		options: {
			loop?: boolean;
			restart?: boolean;
			time?: number;
			multiple?: boolean; // Todo
		},
	) => void;
	pause: (fileName: string) => void;
}

type AudioManagerConstructor = {
	(): AudioManager;
	new (): AudioManager;
};

type AudioFile = {
	el: HTMLAudioElement;
	url: string;
	fileName: string;
	loaded: boolean;
	isPlaying: boolean;
	progress: Ref<number>;
};

function AudioManager() {
	const files: AudioFile[] = [];

	const { on, once, off } = useEvents();
	const route = useRoute();
	this.isMuted = ref();
	this.current = ref();

	this.add = (fileName: string) => {
		let url = fileName.includes("://")
			? fileName
			: `${window.location.origin}/wp-content/themes/front/assets/audio/${fileName}`;

		if (files.find((file) => file.url == url)) return;
		const el = document.createElement("audio");

		el.src = url;
		el.volume = this.isMuted.value ? 0 : 1;
		const file = {
			el: el,
			url: url,
			fileName: fileName,
			loaded: false,
			isPlaying: false,
			progress: ref(0),
		};
		files.push(file);

		once(el, "loadeddata", () => {
			file.loaded = true;
		});
	};

	this.reset = (fileName: string) => {
		const file = files.find((file) => file.fileName == fileName);
		if (!file) {
		}

		file.isPlaying = false;
		file.el.currentTime = 0;
		file.el.pause();
	};

	this.play = async (
		fileName: string,
		options: {
			loop?: boolean;
			restart?: boolean;
			time?: number;
			multiple?: boolean; // Todo
		},
	) => {
		const file = files.find((file) => file.fileName == fileName);
		if (!file) {
		}

		options = withDefaults(options, {
			loop: false,
			multiple: false,
			restart: true,
		});

		file.el.loop = options.loop;
		file.isPlaying = true;

		if (!file.loaded) await once(file.el, "loadeddata");

		if (options.restart) options.time = 0;
		if (options.time != undefined) file.el.currentTime = options.time;

		file.el.play();
		this.current.value = file;
	};

	this.pause = (fileName: string) => {
		const file = files.find((file) => file.fileName == fileName);
		if (!file) return;

		file.el.pause();
		file.isPlaying = false;
	};

	watch(this.isMuted, () => {
		files.forEach((file) => {
			file.el.volume = this.isMuted.value ? 0 : 1;
		});
	});
}

let instance: AudioManager;

export const useAudio = (files?: string[]) => {
	if (!instance) instance = new (AudioManager as AudioManagerConstructor)();
	if (files)
		files.forEach((file) => {
			instance.add(file);
		});

	return instance;
};

import { ref } from "@vue/reactivity";
import { useRoute } from "core";
import { useEvents } from "./events";
import { withDefaults } from "utils";
import { watch } from "@vue-reactivity/watch";

function AudioManager() {
	const files = [];

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
		}
	) => {
		const file = files.find((file) => file.fileName == fileName);
		if (!file) {
		}

		options = withDefaults(options, {
			loop: false,
			multiple: false,
			restart: true,
		});

		file.loop = options.loop;
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

let instance;

export const useAudio = (files?: string[]) => {
	if (!instance) instance = new AudioManager();
	if (files)
		files.forEach((file) => {
			instance.add(file);
		});

	return instance;
};

import { Ref, ref } from "@vue/reactivity";
import { useReactivity, useRoute } from "core";

export type FileLoader = {
	contents: Ref<string>;
	image: HTMLImageElement;
	isLoaded: Ref<boolean>;
	load: CallableFunction;
};

export const useFile = (path: string): FileLoader => {
	// Vars
	const { watch, effect } = useReactivity();

	const isLoaded = ref(false);
	const contents = ref("");
	const image = new Image();

	const baseFolder = !path.includes("http")
		? location.origin + "/wp-content/themes/front/"
		: path;

	// Functions

	const load = async () => {
		if (isLoaded.value) return;
		// Load image
		const imageTypes = [".png", ".jpg", ".webp"];
		if (imageTypes.some((type) => path.includes(type))) return loadImage();
		// Load file contents
		return loadContents();
	};

	const loadImage = async () => {
		await new Promise<HTMLImageElement>((resolve, reject) => {
			image.onload = () => {
				resolve(image);
			};
			image.onerror = () => {
				reject(image);
			};
			image.src = baseFolder + path;
			isLoaded.value = true;
		});
	};

	const loadContents = async () => {
		var request = new XMLHttpRequest();

		await new Promise<string>((resolve, reject) => {
			request.open("GET", baseFolder + path);
			request.onreadystatechange = () => {
				if (request.readyState == 4 && request.status == 200) {
					contents.value = request.responseText;
					resolve(contents.value);
					isLoaded.value = true;
				}
				if (request.readyState == 0 && request.status == 200) {
					contents.value = request.responseText;
					reject(contents.value);
					isLoaded.value = true;
				}
			};
			request.send();
		});
	};

	return {
		contents,
		image,
		isLoaded,
		load,
	};
};

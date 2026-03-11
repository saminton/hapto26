import { ajax } from "utils";

const baseUrl = "/wp-content/themes/front/assets/";
const files: {
	path: string; //
	promise: Promise<string>;
	contents: string;
}[] = [];

export const useAssets = () => {
	const loadImage = (path: string) => {
		const imageEl = document.createElement("img") as HTMLImageElement;
		imageEl.src = baseUrl + path;
		return imageEl;
	};

	const loadFile = async (path: string) => {
		// Look for file
		let file = files.find((item) => item.path == path);

		// Wait for file if loading
		if (file) {
			await file.promise;
		}

		// Create new file
		if (!file) {
			// Request file contents from path
			const promise = ajax("", null, {
				method: "GET",
				origin: baseUrl + path,
				parse: false,
			});

			// Store new file
			file = {
				path,
				promise: promise,
				contents: "",
			};
			files.push(file);

			file.contents = await promise;
		}

		return file.contents;
	};

	const loadSVG = async (path: string) => {
		// Load contents
		const contents = await loadFile(path);

		// Extract html contents from response
		const templateEl = document.createElement("template");
		templateEl.innerHTML = contents;
		return templateEl.content.querySelector("svg");
	};

	return {
		image: loadImage,
		svg: loadSVG,
		file: loadFile,
	};
};

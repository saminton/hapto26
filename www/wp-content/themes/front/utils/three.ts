import { useEvents } from "composables";
import { useRoute } from "core";
import {
	Group,
	LinearFilter,
	RepeatWrapping,
	RGBFormat,
	Scene,
	Texture,
	TextureLoader,
	VideoTexture,
} from "three";
import { GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

// Models

const modelLoader = new GLTFLoader();
export type Model = {
	load: () => Promise<Group>;
	scene: Group;
};

export const useModel = (path: string) => {
	const scene = new Group();
	const route = useRoute();

	// Local file
	let url = path;
	if (!path.includes("http")) url = route.origin + "/wp-content/themes/front/" + path;

	const load = async () => {
		let gltf: GLTF;
		try {
			gltf = await modelLoader.loadAsync(url);
			scene.add(...gltf.scene.children);
		} catch (error) {
			console.error("Failed to load gltf");
		}
		return scene;
	};

	return {
		load,
		scene,
	};
};

// Textures

const textureLoader = new TextureLoader();

export const useTexture = (path: string | HTMLImageElement | HTMLVideoElement) => {
	let texture = new Texture();
	const route = useRoute();
	const { on, once } = useEvents();

	// Local file
	let url = "";
	let el = null;

	if (!path) {
		console.warn("No texture file or node provided");
	} else if (path instanceof HTMLVideoElement) {
		el = path;
		texture = new VideoTexture(el);
		texture.minFilter = LinearFilter;
		texture.magFilter = LinearFilter;
		// texture.wrapT = RepeatWrapping; // Does not work on IOS
		// texture.repeat.y = -1;
		texture.flipY = false;
		el.play();
		// texture.format = RGBFormat;
	} else if (path instanceof HTMLImageElement) {
		el = path;
	} else {
		if (!path.includes("http")) url = route.origin + "/wp-content/themes/front/" + path;
		else url = path;
	}

	const load = async () => {
		if (el && el instanceof HTMLImageElement) {
			el.removeAttribute("loading"); // disabled lazy loading
			if (!el.complete || el.naturalWidth !== 0)
				await Promise.race([once(el, "load"), once(el, "error")]);
			url = el.currentSrc;
		}

		if (!url) return texture;
		try {
			const source = await textureLoader.loadAsync(url);
			Object.assign(texture, source);
		} catch (error) {
			console.error("Failed to load texture");
		}

		return texture;
	};

	return {
		load,
		texture,
	};
};

export const rgbToColor = (color) => {
	// Split the color string into an array of components
	const components = color.split(",").map((component) => parseInt(component.trim()));

	// Ensure values are within valid range (0-255)
	const red = Math.min(255, Math.max(0, components[0]));
	const green = Math.min(255, Math.max(0, components[1]));
	const blue = Math.min(255, Math.max(0, components[2]));

	// Construct the RGB string
	return `rgb(${red}, ${green}, ${blue})`;
};

import { ref, watch } from "@vue/reactivity";
import { useEmitter, onEmitted } from "./emitter";
import { useStore } from "composables";
import { debounce } from "utils";

// Singleton

function Resizer() {
	const device = useStore("device");
	const scroll = useStore("scroll");
	const { emit } = useEmitter();
	const event = {};

	this.resize = async () => {
		emit("beforeResize", event);

		// Wait for frame in case of style changes
		await new Promise((resolve, reject) => {
			requestAnimationFrame(() => resolve(null));
		});
		emit("resized", event);

		// Timeout in case of newly added componants
		setTimeout(() => {
			emit("afterResize", event);
		}, 0);
	};

	watch(() => device.width, this.resize);
}

// Instance

let resizer;

// Composables

export const useResizer = () => {
	if (!resizer) resizer = new Resizer();
	return resizer;
};

export const onBeforeResize = (callback: Function) => {
	if (!resizer) resizer = new Resizer();
	onEmitted("beforeResize", callback);
};

export const onResized = (callback: Function) => {
	if (!resizer) resizer = new Resizer();
	onEmitted("resized", callback);
};

export const onAfterResize = (callback: Function) => {
	if (!resizer) resizer = new Resizer();
	onEmitted("afterResize", callback);
};

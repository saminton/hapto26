import { ref } from "@vue/reactivity";
import { useEvents } from "./events";
import { useStore } from "./store";
import { debounce } from "utils";

export type Pointer = {
	init: () => void;
};

type PointerConstructor = {
	(): Pointer;
	new (): Pointer;
};

function Pointer() {
	const { on, once } = useEvents();
	const device = useStore("device");
	const store = useStore("pointer");

	this.init = () => {
		on(window, ["mousemove", "touchmove", "touchstart"], onPointerMove);
		on(window, ["mousemove", "touchmove", "touchstart"], debounce(resetDelta, 20));
		on(window, ["mousedown", "touchstart"], onPointerDown);
		on(window, ["mouseup", "touchend"], onPointerUp);
		on(document.body, ["mouseenter"], onEnter);
	};

	const onEnter = (el: HTMLElement, e: MouseEvent) => {
		const temp = getPosition(e);
		store.x = temp.x;
		store.y = temp.y;
	};

	const onPointerMove = (el: HTMLElement, e: MouseEvent) => {
		if (store.preventMove) e.preventDefault();

		// Temp
		const temp = getPosition(e);

		// Delta
		store.delta = {
			x: temp.x - store.x,
			y: temp.y - store.y,
		};

		// Set
		store.x = temp.x;
		store.y = temp.y;
	};

	const onPointerDown = (el: HTMLElement, e: MouseEvent) => {
		const temp = getPosition(e);
		store.x = temp.x;
		store.y = temp.y;

		store.isDown = true;
	};

	const onPointerUp = (el: HTMLElement, e: MouseEvent) => {
		// if (store.preventClick) {
		// 	event.preventDefault();
		// 	event.stopImmediatePropagation();
		// }
		store.isDown = false;
	};

	const resetDelta = () => {
		store.delta = { x: 0, y: 0 };
	};

	const getPosition = (event: MouseEvent | TouchEvent) => {
		let clientX = store.x;
		let clientY = store.y;

		if ("touches" in event) {
			// It's a TouchEvent
			if (event.touches && event.touches[0]) {
				clientX = event.touches[0].clientX;
				clientY = event.touches[0].clientY;
			}
		} else {
			// It's a MouseEvent
			clientX = event.clientX;
			clientY = event.clientY;
		}

		const tx = clientX;
		const ty = clientY;

		return { x: tx, y: ty };
	};
}

// Instance

let instance: Pointer;

// Composables

export const usePointer = () => {
	if (!instance) instance = new (Pointer as PointerConstructor)();
	return instance;
};

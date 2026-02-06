import { ref } from "@vue/reactivity";
import { useEvents } from "./events";
import { useStore } from "./store";
import { debounce } from "utils";

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

	const onEnter = (el, e) => {
		const temp = getPosition(event);
		store.x = temp.x;
		store.y = temp.y;
	};

	const onPointerMove = (el, e) => {
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

	const onPointerDown = (el, e) => {
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

	const getPosition = (event) => {
		const tx = event.clientX || (event.touches ? event.touches[0].clientX : store.x);
		const ty = event.clientY || (event.touches ? event.touches[0].clientY : store.y);

		return { x: tx, y: ty };
	};
}

// Instance

let instance = null;

// Composables

export const usePointer = () => {
	if (!instance) instance = new Pointer();
	return instance;
};

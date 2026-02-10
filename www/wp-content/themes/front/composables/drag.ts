import { reactive, unref } from "@vue/reactivity";
import { useReactivity } from "core";
import { debounce } from "utils";
import { useEvents } from "./events";
import { useStore } from "./store";

export const useDrag = (node: HTMLElement, direction?: string) => {
	const { on, once } = useEvents();
	const { watch, effect } = useReactivity();

	const pointer = useStore("pointer");

	let wasCancelled = false;
	let isFirstMove = false;

	const data = reactive({
		isDown: false,
		hasMoved: false,
		moved: false,
		x: 0,
		y: 0,
		startX: 0,
		startY: 0,
		deltaX: 0,
		deltaY: 0,
	});

	onMounted(() => {
		on(unref(node), ["mousedown", "touchstart"], debounce(onDown, 0));
		on(window, ["mousemove", "touchmove"], onMoved);
		node.style.userSelect = "none";
	});

	// Handles

	const onDown = () => {
		data.isDown = true;
		data.startX = pointer.x;
		data.startY = pointer.y;
		data.x = pointer.x - data.startX;
		data.y = pointer.y - data.startY;
		data.isDown = true;
		data.hasMoved = false;

		isFirstMove = true;
		wasCancelled = false;
	};

	const onMoved = (x) => {
		if (!data.isDown) return;

		// Temp
		const tx = pointer.x - data.startX;
		const ty = pointer.y - data.startY;

		const dx = tx - data.x;
		const dy = ty - data.y;

		if (isFirstMove && Math.abs(dx) && Math.abs(dy) && Math.abs(dx) != Math.abs(dy)) {
			if (direction == "x" && Math.abs(dy) > Math.abs(dx)) wasCancelled = true;
			if (direction == "y" && Math.abs(dx) > Math.abs(dy)) wasCancelled = true;
			isFirstMove = false;
		}

		if (direction == "x" && Math.abs(tx) > 4) data.hasMoved = true;
		if (direction == "y" && Math.abs(ty) > 4) data.hasMoved = true;

		if (wasCancelled) return;

		// Delta
		data.deltaX = dx;
		data.deltaY = dy;

		// Set
		data.x = tx;
		data.y = ty;

		data.moved = !data.moved;
	};

	watch(
		() => pointer.isDown,
		() => {
			if (!pointer.isDown) {
				setTimeout(() => {
					data.isDown = false;
					data.hasMoved = false;
				});
			} else {
				data.deltaX = 0;
				data.deltaY = 0;
			}
		},
	);

	return data;
};

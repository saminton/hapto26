import { useEmitter } from "./emitter";

export const useTick = (type: string, callback: Function) => {
	const emitter = useEmitter();
	let listening = false;

	const start = () => {
		if (listening) return;
		emitter.on(type, callback);
		listening = true;
	};

	const stop = () => {
		if (!listening) return;
		emitter.off(type, callback);
		listening = false;
	};

	onUnmounted(() => stop);

	return {
		start,
		stop,
	};
};

import { watch } from "@vue-reactivity/watch";
import { computed, ComputedGetter, ComputedRef, effect } from "@vue/reactivity";

export const useReactivity = () => {
	const handles = [];

	const watchHandle = (observer, callback) => {
		const handle = watch(observer, callback);
		handles.push(handle);
		return handle;
	};

	const effectHandle = (callback) => {
		const handle = effect(callback);
		handles.push(handle);
		return handle;
	};

	const computedHandle = <T>(callback: ComputedGetter<T>): ComputedRef<T> => {
		const handle = computed(callback);
		handles.push(handle);
		return handle;
	};

	onUnmounted(() => {
		handles.forEach((handle) => {
			if (handle.effect) {
				handle.effect.stop();
			} else {
				handle();
			}
		});
	});

	return {
		watch: watchHandle,
		effect: effectHandle,
		computed: computedHandle,
	};
};

import { watch, WatchStopHandle } from "@vue-reactivity/watch";
import { isRef, reactive, ref, Ref } from "@vue/reactivity";
import { stores } from "../theme";

function Store() {
	const items = {};

	this.get = (name?: string) => {
		if (name) return items[name];
		else return items;
	};

	this.set = (name: string, values: object) => {
		if (items[name]) console.error(`"${name}" already set`);
		else items[name] = reactive(values);
	};

	this.sync = (name: string, values: object) => {
		const handles: WatchStopHandle[] = [];
		Object.entries(values).forEach((entry) => {
			const key = entry[0];
			const value = entry[1];

			if (items[name][key] === undefined) {
				console.error(
					`Store: attempting to set "${key}" of "${name}" but the property does not exist`,
				);
				return;
			}

			if (isRef(value)) {
				items[name][key] = value.value;

				// Sync varibles
				handles.push(
					watch(value, () => {
						items[name][key] = value.value;
					}),
				);

				handles.push(
					watch(
						() => items[name][key],
						() => (value.value = items[name][key]),
					),
				);
			} else {
				if (typeof items[name][key] !== typeof value) {
					console.error(`Store: Type mismatch for "${key}" of "${name}"`);
					return;
				}
				items[name][key] = value;
			}
		});

		const stop = () => {
			console.log(`stop sync`);
			handles.forEach((handle) => handle());
		};

		return stop;
	};
}

// Instance

const store = new Store();

Object.entries(stores).forEach((item) => {
	const key = item[0];
	const values = item[1];
	store.set(key, values);
});

// Composable

export const useStore = (name) => {
	return store.get(name);
};

export const syncToStore = (name?: string, values?: object) => {
	const stop = store.sync(name, values);
	onUnmounted(() => {
		stop();
	});

	return stop;
};

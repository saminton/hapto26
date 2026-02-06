import { useEvents } from "composables";
import { Component, useReactivity, useRouter, useScope } from "core";
import { getProps, extend, ajax } from "utils";

export function AdminWidget(args) {
	// Extend

	extend(Component, this, args);
	const node = args.el;

	// Props

	const { on, once } = useEvents();
	const { child, children } = useScope(this);
	const { watch, effect } = useReactivity();

	const {} = getProps(node);

	// Vars

	const router = useRouter();
	const editEl = child("edit");

	// Hooks

	onMounted(() => {});

	onUnmounted(() => {});

	// Handles

	const onClick = () => {};

	// Functions

	// Effects

	watch(
		() => router.currentRoute.value.fullPath,
		async () => {
			const response = await ajax("admin-widget", {
				url: router.currentRoute.value.fullPath,
			});

			editEl.href = response.edit;
		}
	);
}

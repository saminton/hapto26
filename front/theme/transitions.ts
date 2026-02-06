import { ITransitionData, ITransitionPage } from "@barba/core";
import { useStore } from "../composables/store";

export function getTransitions(): ITransitionPage[] {
	const menu = useStore("menu");
	const loader = useStore("loader");
	const transitions = [];

	transitions.push({
		name: "default",
		leave: async (data: ITransitionData) => {
			// Before container appended to page
			menu.isOpen = false;
			await loader.show();
		},
		beforeEnter: async (data: ITransitionData) => {
			// Container was appended to page
			data.next.container.style.opacity = "0";
		},
		enter: async (data: ITransitionData) => {
			// Components are setup
			// Page is ready
			data.next.container.style.opacity = "1";
			data.current.container.style.opacity = "0";

			await loader.hide();
		},
	});

	return transitions;
}

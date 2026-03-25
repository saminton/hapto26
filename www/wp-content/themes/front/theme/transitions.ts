import { ITransitionData, ITransitionPage } from "@barba/core";
import { useStore } from "../composables/store";
import gsap from "gsap";

export function getTransitions(): ITransitionPage[] {
	const menu = useStore("menu");
	const loader = useStore("loader");
	const transitions = [];
	const wrapperEl = document.querySelector(`[v-barba="wrapper"]`);

	transitions.push({
		name: "default",
		leave: async (data: ITransitionData) => {
			// Before container appended to page
			// menu.isOpen = false;
			// await loader.show();

			await gsap.to(wrapperEl, {
				duration: 0.5,
				opacity: 0,
				ease: "power2.out",
			});
		},
		beforeEnter: async (data: ITransitionData) => {
			// Container was appended to page
			data.current.container.style.opacity = "0";
		},
		enter: async (data: ITransitionData) => {
			// Components are setup
			// Page is ready
			await gsap.to(wrapperEl, {
				duration: 0.5,
				opacity: 1,
				ease: "power2.out",
			});

			await loader.hide();
		},
	});

	return transitions;
}

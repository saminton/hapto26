import { ref } from "@vue/reactivity";
import barba, { Trigger } from "@barba/core";
import { useRoute } from "./route";
import { useStore } from "composables";

function Router() {
	// Todo: Imitate nuxt functions
	// https://nuxt.com/docs/api/composables/use-router

	this.currentRoute = ref(useRoute());

	this.back = () => {
		if (barba.history.previous) barba.go(barba.history.previous.url);
	};

	// this.forward = () => {};

	this.go = (href: string) => {
		barba.go(href);
	};

	this.push = (url: string) => {
		// barba.history.add(url, "barba", "push"); // awaiting next version
		barba.history.add(url, "barba");
	};

	this.replace = (url: string) => {
		// barba.history.add(url, "barba", "replace"); // awaiting next version
		barba.history.add(url, "barba");
	};

	this.prefetch = (href: string) => {
		barba.prefetch(href);
	};
}

// Instance

let instance = null;

// Composable

export const useRouter = () => {
	if (!instance) instance = new Router();
	return instance;
};

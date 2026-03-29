import { reactive } from "@vue/reactivity";
import barba from "@barba/core";

function Route() {
	this.data = reactive({
		fullPath: "",
		hash: "",
		// matched: "",
		// meta: "",
		// name: "",
		path: "",
		// redirectedFrom: "",
		host: "",
		// uri: '',
		params: {},
		origin: "",
		protocol: "",
	});

	const update = () => {
		const params = {};
		window.location.href.replace(
			/[?&]+([^=&]+)=([^&]*)/gi,
			(match: string, key: string, value: string) => {
				params[key] = value;
				return match;
			},
		);

		this.data.fullPath = window.location.href;
		this.data.hash = window.location.hash;
		this.data.path = window.location.pathname;
		this.data.host = window.location.host;
		// this.data.search = window.location.search;
		this.data.params = params;
		this.data.origin = window.location.origin;
		this.data.protocol = window.location.protocol;
	};

	barba.hooks.afterLeave(() => update());
	window.addEventListener("hashchange", () => {
		this.data.hash = window.location.hash;
	});
	update();
}

// Instance

let instance = null;

// Composable

export const useRoute = () => {
	if (!instance) instance = new Route();
	return instance.data as {
		fullPath: string;
		hash: string;
		path: string;
		host: string;
		origin: string;
		protocol: string;
		params: { string: string };
	};
};

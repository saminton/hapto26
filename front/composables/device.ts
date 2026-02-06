// https://dev.to/siddharthshyniben/implementing-reactivity-from-scratch-51op

import { cssVar, debounce } from "../utils";
import { useStore } from "./store";

// Singleton

function Device() {
	const store = useStore("device");
	// const browser = ref("");

	this.init = () => {
		// detectBrowser();
		window.addEventListener("resize", debounce(resized, 500));
	};

	// const detectBrowser = () => {};

	const resized = () => {
		if (store.width !== window.innerWidth) {
			(document.querySelector(":root") as HTMLElement).style.setProperty(
				"--100vh",
				window.innerHeight + "px",
			);
		}

		store.width = window.innerWidth;
		store.height = window.innerHeight;
		store.ratio = store.width / store.height;

		store.isDesktop = store.width > parseFloat(cssVar("tablet"));
		store.isTablet = store.width <= parseFloat(cssVar("tablet"));
		store.isPhone = store.width <= parseFloat(cssVar("phone"));

		let format = "desk";
		if (store.isTablet) format = "tablet";
		if (store.isPhone) format = "phone";
		store.format = format;

		store.isTouch = window.matchMedia("(pointer: coarse)").matches; // Bug pixel 7

		const isPortrait = window.matchMedia("(orientation: portrait)").matches;
		store.orientation = isPortrait ? "portrait" : "landscape";
		store.rem = parseFloat(getComputedStyle(document.documentElement)["font-size"]) / 10;

		// const platform = navigator.userAgentData?.platform || navigator.platform.toLowerCase();
		const platform = navigator.platform.toLowerCase();
		const agent = navigator.userAgent.toLowerCase();

		// Browser
		if (agent.indexOf("firefox") > -1) store.browser = "firefox";
		if (agent.indexOf("safari") > -1) store.browser = "safari";
		if ((window as any).chrome) store.browser = "chrome";

		// Platform
		if (platform.indexOf("win") > -1) store.os = "windows";

		document.documentElement.setAttribute("browser", store.browser);
		document.documentElement.setAttribute("os", store.os);
	};

	resized();
}

// Instance

let instance = null;

// Composable

export const useDevice = () => {
	if (!instance) instance = new Device();
	return instance;
};

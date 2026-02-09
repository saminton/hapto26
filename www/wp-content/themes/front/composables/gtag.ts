// Singleton

import { watch } from "@vue-reactivity/watch";
import { useRoute, useCookie } from "core";

function Gtag() {
	const userPrefs = useCookie("userPrefs");
	const route = useRoute();
	let tag_id = "";

	// Update on user preference change
	watch(userPrefs, () => {
		if (!window.gtag || !userPrefs.value) return;
		gtag("consent", "update", {
			ad_storage: userPrefs.value.ads ? "granted" : "denied",
			analytics_storage: userPrefs.value.analytics ? "granted" : "denied",
		});
	});

	// Update on page change
	watch(
		() => route.path,
		() => {
			if (!window.gtag || !tag_id) return;
			gtag("config", tag_id, {
				page_path: route.fullPath,
			});
			gtag("event", "page_view", {
				page_title: document.title,
				page_location: location.href,
				page_path: location.pathname,
			});
		},
	);

	this.init = () => {
		// Get tag ID from script
		const script: HTMLScriptElement = document.querySelector(
			'script[src*="googletagmanager.com"]',
		);
		tag_id = script.src.split("id=")[1];

		if (!window.gtag || !userPrefs.value) return;

		// Default consent mode is "denied" for both ads and analytics, but delay for 1 seconds until the Cookie Solution is loaded
		gtag("consent", "default", {
			ad_storage: userPrefs.value.ads ? "granted" : "denied",
			analytics_storage: userPrefs.value.analytics ? "granted" : "denied",
			wait_for_update: 1000, // milliseconds
		});

		// Further redact your ads data (optional)
		// gtag("set", "ads_data_redaction", true);
	};
}

// Instance

let instance;

// Composable

export const useGtag = () => {
	if (!instance) instance = new Gtag();
	return instance;
};

import { effect, ref } from "@vue/reactivity";
import { Cookie } from "../types";

// Singleton

function Cookies() {
	this.get = (name) => {
		const now = new Date().getTime();
		let json = null;

		try {
			json = JSON.parse(window.localStorage.getItem(name));
		} catch (error) {
			console.warn("Unable to retreive cookies");
			return null;
		}

		if (!json) return null;
		// compare the expiry time of the item with the current time
		if (json.expires && now > json.expires) {
			// If the item is expired, delete the item from storage
			// and return null
			this.remove(name);
			return null;
		}

		return json.value;
	};

	this.set = (name, value: any, options) => {
		let expires = null;
		if (options.expires) expires = options.expires.getTime();
		if (options.maxAge) expires = new Date().getTime() + options.maxAge * 1000;

		// Save data to local storage

		try {
			window.localStorage.setItem(
				name,
				JSON.stringify({
					value: value,
					expires: expires, // in seconds
				})
			);
		} catch (error) {
			console.warn("Unable to set cookies");
		}
	};

	this.remove = (name) => {
		try {
			localStorage.removeItem(name);
		} catch (error) {
			console.warn("Unable to remove cookies");
		}
	};

	const store = {};

	this.use = (name, options) => {
		if (store[name]) return store[name];
		else {
			const cookie = ref(this.get(name));
			store[name] = cookie;

			effect(() => {
				if (cookie.value === null || cookie.value === undefined) cookies.remove(name);
				cookies.set(name, cookie.value, options);
			});

			return cookie;
		}
	};
}

// Instance

let cookies = null;

// Composables

export const useCookie = (name: string, options: Cookie = {}) => {
	if (!cookies) cookies = new Cookies();

	const defaults = <Cookie>{
		maxAge: null,
		expires: null,
		httpOnly: false,
		domain: "",
		path: "",
		sameSite: false,
		encode: null,
		decode: null,
	};

	// Overwrite defaults
	options = { ...defaults, ...options };

	return cookies.use(name, options);
};

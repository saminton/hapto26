export const stores = {
	device: {
		width: 0,
		height: 0,
		isDesktop: true,
		isTablet: false,
		isPhone: false,
		isTouch: false,
		rem: 1,
		vh: 1,
		ration: 1.778,
		format: "desk",
		browser: "chome",
		os: "mac",
		orientation: "landscape",
	},

	pointer: {
		x: 0,
		y: 0,
		delta: { x: 0, y: 0 },
		isDown: false,
		preventMove: false,
		preventClick: false,
	},

	keys: {
		// holding: () => {},
	},

	page: {
		el: null,
		isReady: false,
		props: {},
	},

	scroll: {
		el: null,
		position: 0,
		target: 0,
		delta: 0,
		size: 0,
		smoothing: 0,
		isScrolling: false,
		isSmoothed: false,
		isEnabled: true,
		to: () => {},
		set: () => {},
	},

	menu: {
		isOpen: false,
	},

	overlay: {
		isOpen: false,
	},

	loader: {
		isOpen: true,
		show: () => {},
		hide: () => {},
	},

	cookieBanner: {
		isOpen: false,
	},

	cookieOptions: {
		isOpen: false,
	},
};

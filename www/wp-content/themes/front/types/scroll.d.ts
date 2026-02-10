export type Scroll = {
	el: HTMLElement;
	position: number;
	target: number;
	delta: number;
	size: number;
	smoothing: number;
	isScrolling: boolean;
	isSmoothed: boolean;
	isEnabled: boolean;
	to: CallableFunction;
	set: CallableFunction;
};

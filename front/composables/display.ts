import { checkDisplay } from "utils";

export const onDisplayChange = (node: HTMLElement, callback: CallableFunction) => {
	let isDisplayed = false;

	let observer = new MutationObserver((mutation) => {
		const wasDisplayed = isDisplayed;
		isDisplayed = checkDisplay(node);

		if (isDisplayed != wasDisplayed) callback(isDisplayed);
	});

	const parentEls: HTMLElement[] = [];
	let el = node;
	while (el && el.tagName != "V-LAYOUT") {
		parentEls.unshift(el);
		el = el.parentElement;
	}

	onMounted(() => {
		isDisplayed = checkDisplay(node);

		parentEls.forEach((el) => {
			observer.observe(el, {
				attributes: true,
				attributeFilter: ["style", "aria-hidden", "class"],
				subtree: false,
			});
		});
	});

	onUnmounted(() => {
		observer?.disconnect();
	});
};

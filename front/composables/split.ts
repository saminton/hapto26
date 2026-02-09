import { Bounds } from "types";
import { getBounds, toArray } from "utils";
import { ref } from "@vue/reactivity";
import { useStore } from "./store";
import { useReactivity } from "core";
import { onBeforeResize } from "./resizer";
import { onDisplayChange } from "composables";

type Branch = {
	el: HTMLElement;
	children?: any[];
};

export enum SplitType {
	letters,
	words,
	lines,
}

export const useSplit = function (node: HTMLElement, by?: SplitType) {
	const emit = defineEmits();
	const device = useStore("device");
	const html = ref("");
	const letters = ref([]);
	const words = ref([]);
	const lines = ref([]);
	let tree: Branch;

	console.log(`by`, by);

	const { watch, effect } = useReactivity();

	let resolve;
	const promise = new Promise((res) => {
		resolve = res;
	});

	onMounted(async () => {
		tree = createTree();
		await calculate();
		resolve();
	});

	watch(
		() => device.width,
		async () => {
			await calculate();
		},
	);

	// Todo: modify resizer to wait for async functions
	// onBeforeResize(async () => {
	// 	await calculate();
	// });

	onDisplayChange(node, async () => {
		node.style.opacity = "0";
		await calculate();
		node.style.opacity = "1";
	});

	const calculate = async () => {
		lines.value = [];
		words.value = [];
		letters.value = [];
		html.value = "";
		node.innerHTML = "";

		// Recursivly append elements
		const append = (item: Branch, parent: HTMLElement, depth: number) => {
			// Append children to independant parents

			// if (item.children && item.children.length > 0) {
			// 	let cloneEl = item.el.cloneNode(true) as HTMLElement;
			// 	item.children.forEach((child, i) => {
			// 		cloneEl = item.el.cloneNode(true) as HTMLElement;
			// 		parent.appendChild(cloneEl);
			// 		append(child, cloneEl, depth + 1);
			// 	});
			// } else parent.appendChild(item.el);

			// Append all to same parent (native, but breaks lines)
			parent.appendChild(item.el);
			if (item.children) {
				item.children.forEach((child, i) => {
					append(child, item.el, depth + 1);
				});
			}
		};

		// Append tree to page

		tree.children.forEach((item, i) => {
			append(item, node, 0);
		});

		await new Promise<void>((resolve, reject) => {
			requestAnimationFrame(() => resolve());
		});

		if (by == SplitType.lines) {
			node.innerHTML = splitLines();
		}

		if (by == SplitType.letters) {
			splitLetters();
		}

		lines.value = Array.from(node.querySelectorAll("[v-line]"));
		words.value = Array.from(node.querySelectorAll("[v-word]"));
		letters.value = Array.from(node.querySelectorAll("[v-letter]"));
		html.value = node.innerHTML;

		emit("split");
	};

	const createTree = (): Branch => {
		const store = (el): Branch => {
			// Do not store children for SVGs or components
			if (el.tagName == "SVG" || el.hasAttribute("v-component")) return { el: el };

			// Everything else

			const item = {
				el: el.cloneNode(false),
				children: [],
			};

			let childEl = el.firstChild;
			while (childEl) {
				// Recursive on children
				if (childEl.tagName) {
					item.children.push(store(childEl));
					if (childEl.nextSibling) {
						const content = childEl.nextSibling.textContent[0];
						if (content == " " || content == " ") item.children.push(space());
					}
				}

				// Split text into words
				else item.children.push(...splitWords(childEl));

				childEl = childEl.nextSibling;
			}

			return item;
		};

		return store(node.cloneNode(true));
	};

	const splitLetters = () => {
		Array.from(node.querySelectorAll("[v-word]")).forEach((wordEl) => {
			wordEl.innerHTML = wordEl
				.getAttribute("v-word")
				.split(/(?!$)/u)
				.reduce((prev, curr) => {
					return prev + "<span v-letter>" + curr + "</span>";
				}, "");
		});
	};

	const space = (str: string = " ") => {
		const el = document.createElement("v-space");
		el.innerHTML = str;
		return { el };
	};

	const word = (str: string = "") => {
		const wordEl = document.createElement("span");
		const clipEl = document.createElement("span");
		wordEl.setAttribute("v-word", str);
		clipEl.setAttribute("v-clip", "");
		clipEl.innerHTML = str;
		wordEl.appendChild(clipEl);
		return wordEl;
	};

	const splitWords = (el) => {
		const words = el.textContent.split(/\s+/g);

		// if (words[words.length - 1] != "") words.push(" ");

		const items = [];
		words.forEach((str, i) => {
			if (str == "") return null;

			const arr = str.split(/\-/g);
			arr.forEach((sub, j) => {
				if (j != arr.length - 1) sub += "-";
				items.push({ el: word(sub) });
				if (j != 0) items.push(space());
			});

			if (i == words.length - 1) return;

			// space
			items.push(space());
		});

		return items;
	};

	const getAttrs = (el) => {
		const attrs = {};
		el.getAttributeNames().forEach((attr, i) => {
			attrs[attr] = el.getAttribute(attr);
		});
		return attrs;
	};

	const splitLines = () => {
		const lines = [];
		let line = [];
		let lastBounds: Bounds;
		let groupEl: HTMLElement;
		let groupAttrs: { [key: string]: string };

		toArray(node.children).forEach((el: HTMLElement, i) => {
			// Todo: Regroup words with same attributes

			const bounds = getBounds(el);
			el = el.cloneNode(true) as HTMLElement;

			if (i == 0) {
				line.push(el);
				lastBounds = bounds;
				groupEl = el;
				groupAttrs = getAttrs(el);
				return;
			}

			if (el.tagName == "BR" || el.innerHTML == " ") {
				line.push(el);
				return;
			}

			if (bounds.bottom - bounds.height * 0.25 > lastBounds.bottom) {
				lines.push(line);
				line = [el];
				lastBounds = bounds;
				groupEl = el;
				groupAttrs = getAttrs(el);
				return;
			}

			// Group elements with same attributes
			// Exclude spaces
			const attrs = getAttrs(el);
			const attrMatch = JSON.stringify(attrs) === JSON.stringify(groupAttrs);
			const groupMatch = !attrs["v-word"] && attrMatch; // Do not check if is word

			if (groupMatch) {
				groupEl.innerHTML += el.innerHTML;
			} else {
				groupEl = el;
				groupAttrs = getAttrs(el);
				line.push(el);
			}
		});

		lines.push(line);

		let html = "";

		lines.forEach((line) => {
			html += "<span v-line><span>";
			line.forEach((el, i) => {
				if (el.tagName == "BR" || el.tagName == "SVG") html += el.outerHTML;
				else html += el.textContent;
			});
			html += "</span></span>";
		});

		// let html = node.innerHTML;
		return html;
	};

	return {
		el: node,
		html,
		letters,
		words,
		lines,
		promise,
	};
};

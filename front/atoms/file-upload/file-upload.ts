import { reactive, ref } from "@vue/reactivity";
import { useEvents } from "composables";
import { Component, useReactivity, useScope } from "core";
import { getProps, extend, toArray, attr, aria } from "utils";

export class CustomFileList implements FileList {
	[index: number]: File;
	readonly length: number;

	constructor(files: File[]) {
		this.length = files.length;
		for (let i = 0; i < files.length; i++) {
			this[i] = files[i];
		}
	}

	item(index: number): File | null {
		return this[index];
	}
}

export function FileUpload(args) {
	// Extend

	extend(Component, this, args);
	const node = args.el;

	// Props

	const { on, once } = useEvents();
	const { child, children, childOf } = useScope(this);
	const { watch, effect } = useReactivity();

	const { multiple } = getProps(node);

	// Vars

	const uploadEl = child("upload") as HTMLInputElement;
	const inputEl = child("input") as HTMLInputElement;
	const itemsEl = child("items");
	const buttonEl = child("button");
	const templateEl = child("template") as HTMLTemplateElement;
	const files: File[] = reactive(Array.from(inputEl.files));

	// Hooks

	onMounted(() => {
		on(uploadEl, "change", changed);
		on(buttonEl, "click", () => uploadEl.click());
		update();

		console.log(`templateEl`, templateEl);
	});

	onUnmounted(() => {});

	// Handles

	const changed = (el: HTMLElement, e?: Event) => {
		console.log(`e`, e);
		// files.length = 0;
		if (multiple) {
			files.push(...Array.from(uploadEl.files));
		} else {
			files.length = 0;
			files.push(uploadEl.files[0]);
		}
	};

	// Functions

	const update = () => {
		console.log(`'update'`, "update");
		itemsEl.innerHTML = "";

		// Update input
		let list = new DataTransfer();

		files.forEach((file, i) => {
			list.items.add(file);

			const itemEl = document.createElement("div");
			itemEl.className = "item-" + this.uid;
			itemEl.innerHTML = templateEl.innerHTML;
			itemsEl.appendChild(itemEl);
			const titleEl = childOf(itemEl, "title");
			const removeEl = childOf(itemEl, "remove");

			titleEl.innerHTML = `${file.name}`;
			once(removeEl, "click", (el: HTMLElement, e: Event) => remove(e, i));
		});

		inputEl.files = list.files;

		aria(itemsEl, "hidden", files.length == 0);
	};

	const remove = (e: Event, i: number) => {
		e.preventDefault();
		e.stopPropagation();
		files.splice(i, 1);
	};

	// Effects

	watch(files, update);
}

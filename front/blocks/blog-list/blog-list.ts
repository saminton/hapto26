import { Component, useReactivity, useScope } from "core";
import { ref, reactive } from "@vue/reactivity";
import { useEvents, useStore } from "composables";
import { getProps, extend, ajax } from "utils";
import { gsap } from "gsap";

export interface BlogListComponent extends Component {
	el: HTMLElement;
}

export function BlogList(args: Component) {
	// Extend

	extend(Component, this, args);
	const node = args.el;

	// Props

	const { on, once } = useEvents();
	const { child, children } = useScope(this);
	const { watch, effect, computed } = useReactivity();

	const {} = getProps(node);

	// Vars

	const itemsEl = child("items");
	const filterEls = children("filter") as HTMLLabelElement[];

	// Hooks

	onMounted(() => {
		on(filterEls, "change", onChanged);
	});

	onUnmounted(() => {});

	// Functions

	const onChanged = () => {
		// {
		// 	taxonomy: '',
		// 	field: 'id',
		// 	terms: terms,
		// }

		const terms: string[] = [];
		filterEls.forEach((el) => {
			const inputEl = el.querySelector("input");
			if (inputEl.checked && inputEl.value && inputEl.value != "")
				terms.push(inputEl.value);
		});

		const taxonomies = [];
		if (terms.length) taxonomies.push({ taxonomy: "article_type", field: "id", terms });

		filter({
			search: "",
			taxonomies,
		});
	};

	const filter = async ({
		search = "",
		taxonomies = [],
	}: {
		search: string;
		taxonomies?: {
			taxonomy: string;
			field: string;
			terms: string | string[];
		}[];
	}) => {
		// {
		// 	taxonomy: '',
		// 	field: 'id',
		// 	terms: terms,
		// }

		const query = {
			query: "posts",
			where: {
				post_type: "article",
				tax_query: taxonomies,
				// s: search,
			},
			post: [
				"title", //
				"date",
				"url",
				"thumbnail",
			],
			fields: [
				"hero", //
			],
			taxonomies: {
				article_type: {
					query: "term",
					term: [
						"name", //
						"id",
					],
				},
			},
		};

		const anim = gsap.to(itemsEl, { opacity: 0, duration: 0.2 });

		try {
			const request = ajax("component", {
				component: "modules/card-article",
				query,
			});

			const [res] = await Promise.all([request, anim]);
			itemsEl.innerHTML = res;
		} catch (error) {
			// throw new Error(String(error));
			throw new Error("Error");
		}

		await gsap.to(itemsEl, { opacity: 1, duration: 0.2 });
	};

	// Effects
}

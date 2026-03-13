import { useEvents } from "composables";
import { Component, useReactivity, useScope } from "core";
import { ajax, extend, getProps } from "utils";

export interface ListArticlesComponent extends Component {
	el: HTMLElement;
	filter: ({
		search,
		taxonomies,
	}: {
		search: string;
		taxonomies: any[];
	}) => Promise<void>;
}

export function ListArticles(args: Component) {
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

	// Hooks

	onMounted(() => {});

	onUnmounted(() => {});

	// Functions

	const filter = async ({ search = "", taxonomies = [] }) => {
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
				s: search,
			},
			post: [
				"title", //
				"date",
				"url",
			],
			fields: [
				"excerpt", //
			],
			taxonomies: {
				article_category: {
					query: "term",
					term: [
						"name", //
						"id",
					],
				},
			},
		};

		try {
			const res = await ajax("component", {
				component: "modules/card-article",
				query,
			});

			if (itemsEl) itemsEl.innerHTML = res;
		} catch (error) {
			throw new Error(String(error));
		}
	};

	// Effects

	defineExpose({
		filter,
	});
}

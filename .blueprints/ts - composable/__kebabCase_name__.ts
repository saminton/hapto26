import { ref, reactive } from "@vue/reactivity";
import { useReactivity } from "core";
import { withDefaults } from "utils";

export const use{{pascalCase name}} = (props: {
	el: HTMLElement,
}) => {

	// Vars
	const { watch, effect } = useReactivity();
	props = withDefaults(props, {
		delay: 0,
		detect: true,
	}) as typeof props;

	// Hooks

	onMounted(() => {})

	// Functions

	return {}
}
import { useAnim } from "../composables";
import { Service } from "../core";
import { extend, getProps } from "../utils";

export function Anim(args) {
	// Extend

	extend(Service, this, args);
	const node = args.el;
	const props = getProps(node);

	// Vars

	const {
		play, //
		end,
		reset,
		split,
		set,
	} = useAnim({
		el: node,
		name: node.getAttribute("v-anim"),
		delay: props.delay,
		stagger: props.stagger,
	});

	// Hooks

	onMounted(async () => {
		// await new Promise((resolve) => {
		// 	setTimeout(() => {
		// 		resolve(true);
		// 	}, 2000);
		// });
	});

	defineExpose({
		play,
		end,
		reset,
		split,
		set,
	});

	// Hooks
}

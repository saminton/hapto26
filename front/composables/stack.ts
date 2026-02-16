// import { reactive } from "@vue/reactivity";
// import { useReactivity } from "core";

// export const useStack = function (
// 	format: any,
// 	reduce: CallableFunction = (a, b) => a + b
// ) {
// 	const { watch, effect } = useReactivity();

// 	const stacks: any = reactive({});
// 	const value = reactive(format);

// 	watch(stacks, () => {
// 		const total = {};
// 		Object.keys(value).forEach((key) => {
// 			total[key] = 0;
// 		});

// 		Object.values(stacks).forEach((stack) => {
// 			Object.keys(stack).forEach((key) => {
// 				total[key] = reduce(total[key], stack[key]);
// 			});
// 		});

// 		Object.assign(value, total);
// 	});

// 	return {
// 		stacks,
// 		value,
// 	};
// };

// const { stacks, value } = useStack({ x: 0, y: 0 }, (a, b) => a + b);
// stacks.nudge = { x: 0, y: 0 };
// stacks.nudge.x = 1;

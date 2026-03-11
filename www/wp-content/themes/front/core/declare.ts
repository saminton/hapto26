// Global functions

declare function onMounted(callback: CallableFunction): void;
declare function onUnmounted(callback: CallableFunction): void;
declare function onReady(callback: CallableFunction): void;
declare function afterReady(callback: CallableFunction): void;
declare function provide(name: string, values: any): void;
declare function inject(name: string, values?: unknown): void;
declare function supply(name: string, values: any): void;
declare function defineEmits(name?: string): (name: string, value?: any) => void;
declare function defineExpose(values: object): void;

// Files

declare module "*.frag" {
	const content: any;
	export default content;
}

declare module "*.vert" {
	const content: any;
	export default content;
}

declare module "*.glsl" {
	const content: any;
	export default content;
}

window.onMounted = () => {};
window.onUnmounted = () => {};
window.onReady = () => {};
window.afterReady = () => {};
window.provide = () => {};
window.inject = () => {};
window.defineEmits = () => () => {};
window.defineExpose = () => {};

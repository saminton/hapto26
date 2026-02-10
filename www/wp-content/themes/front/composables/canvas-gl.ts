import { Ref, unref } from "@vue/reactivity";
import { useReactivity } from "core";
// import { Color } from "three";
import { Color, Vector2, Vector3, Vector4, withDefaults } from "utils";
import { onResized } from "./resizer";
import { useStore } from "./store";
import { useBounds } from "./bounds";
import { onRendered } from "./renderer";
import { useSticky } from "./sticky";

type Uniform = {
	value: number | Vector2 | Vector3 | string | WebGLTexture;
	location?: WebGLUniformLocation;
};

type Attribute = {
	type: number;
	size: number;
	normalized: boolean;
	stride: number;
	offset: number;
	location?: number;
};

export const useCanvasGL = (props: {
	el: HTMLCanvasElement;
	vertex: string | Ref<string>;
	fragment: string | Ref<string>;
}) => {
	// Vars
	const { watch, effect, computed } = useReactivity();
	const {
		el, //
		vertex,
		fragment,
	} = withDefaults(props, {}) as typeof props;

	const device = useStore("device");
	const bounds = useBounds(el.parentElement);
	const sticky = useSticky({
		el: el,
		smoothing: 0,
	});

	const gl = el.getContext("webgl");
	const buffer = gl.createBuffer();

	let program: WebGLProgram = null;
	const uniforms: { [name: string]: Uniform } = {};
	const attributes: { [name: string]: Attribute } = {};
	const textures: Array<WebGLTexture> = [];

	const size = computed(() => ({
		width: Math.min(bounds.width, device.width),
		height: Math.min(bounds.height, device.height),
	}));

	// Hooks

	onMounted(async () => {
		// Base uniforms
		createUniform("uTime", 0);
		createUniform("uOffset", new Vector2(0, 0));
		createUniform("uResolution", new Vector2(size.value.width, size.value.height));
		createUniform("uPointer", new Vector2(0, 0));

		// Base attributes
		createAttribute("aPosition", {
			size: 2,
			type: WebGLRenderingContext.FLOAT,
			normalized: false,
			stride: 16,
			offset: 0,
		});
	});

	onUnmounted(() => {
		dispose();
	});

	onRendered(props.el.parentElement, (tick) => {
		uniforms.uTime.value = tick.time;
		uniforms.uResolution.value = new Vector2(size.value.width, size.value.height);
	});

	onResized(() => resize());

	// Functions

	const resize = () => {
		el.width = bounds.width;
		el.height = bounds.height;
	};

	effect(() => {
		resize();
	});

	const setup = () => {
		for (const [key, uniform] of Object.entries(uniforms)) {
		}
		setupCanvas();
		setupProgram();
		setupData();
	};

	const render = () => {
		gl.viewport(0, 0, bounds.width, bounds.height);
		gl.useProgram(program);

		for (const [key, attribute] of Object.entries(attributes)) {
			gl.enableVertexAttribArray(attribute.location);
			gl.vertexAttribPointer(attribute.location, 2, gl.FLOAT, false, 16, 0);
		}

		let textureIndex = 0;
		for (const [key, uniform] of Object.entries(uniforms)) {
			const value = uniform.value;
			// https://webglfundamentals.org/webgl/lessons/webgl-shaders-and-glsl.html
			switch (true) {
				case value === true || value === false:
					gl.uniform1i(
						uniform.location, //
						value as number,
					);
					break;

				case value instanceof WebGLTexture:
					gl.activeTexture(gl["TEXTURE" + textureIndex]);
					gl.bindTexture(gl.TEXTURE_2D, value);
					gl.uniform1i(uniform.location, textureIndex);
					textureIndex++;
					break;

				case value instanceof Vector2:
					gl.uniform2f(
						uniform.location, //
						value.x,
						value.y,
					);
					break;

				case value instanceof Vector3:
					gl.uniform3f(
						uniform.location, //
						value.x,
						value.y,
						value.z,
					);
					break;

				case value instanceof Color:
					gl.uniform3f(
						uniform.location, //
						value.r,
						value.g,
						value.b,
					);
					break;

				case value instanceof Vector4:
					gl.uniform4f(
						uniform.location, //
						value.x,
						value.y,
						value.z,
						value.a,
					);
					break;

				default:
					gl.uniform1f(uniform.location, value as number);
					break;
			}
		}

		gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
		gl.drawArrays(gl.TRIANGLES, 0, 6);
	};

	const setupCanvas = () => {
		el.width = bounds.width; // * devicePixelRatio
		el.height = bounds.height;

		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
		gl.enable(gl.BLEND);
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
	};

	const createUniform = (
		name: string,
		value:
			| boolean
			| number
			| Vector2
			| Vector3
			| string
			| HTMLImageElement
			| WebGLTexture,
	) => {
		// Create texture from image
		if (value instanceof HTMLImageElement) {
			value = createTexture(value);
		}

		uniforms[name] = {
			value: value,
		};
	};

	const createAttribute = (name: string, values: Attribute) => {
		// Memory allocation
		attributes[name] = values;
	};

	const setupData = () => {
		// Attribute memory allocation
		for (const [key, attribute] of Object.entries(attributes)) {
			attribute.location = gl.getAttribLocation(program, key);
		}

		// Uniform memory allocation
		for (const [key, uniform] of Object.entries(uniforms)) {
			uniform.location = gl.getUniformLocation(program, key);
		}
		// Bind buffer
		gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

		// Geometry buffer data
		const geometryData = getRectangleData();
		const data = new Float32Array(geometryData);
		gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
	};

	// type 0: vertex or 1: fragment
	const createShader = (type: number, src: string): WebGLShader => {
		const shader = gl.createShader(type);
		gl.shaderSource(shader, src);
		gl.compileShader(shader);

		const didCompile = gl.getShaderParameter(shader, gl.COMPILE_STATUS);

		if (didCompile) {
			return shader;
		} else {
		}
	};

	const createProgram = (vertexShader: WebGLShader, fragmentShader: WebGLShader) => {
		const program = gl.createProgram();
		gl.attachShader(program, vertexShader);
		gl.attachShader(program, fragmentShader);
		gl.linkProgram(program);

		const didLink = gl.getProgramParameter(program, gl.LINK_STATUS);

		if (didLink) {
			return program;
		} else {
		}
	};

	const setupProgram = () => {
		const vertexShader = createShader(gl.VERTEX_SHADER, unref(vertex));
		const fragmentShader = createShader(gl.FRAGMENT_SHADER, unref(fragment));
		program = createProgram(vertexShader, fragmentShader);
	};

	const createTexture = (image: HTMLImageElement): WebGLTexture => {
		const texture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, texture);

		const level = 0;
		const internalFormat = gl.RGBA;
		const width = 1;
		const height = 1;
		const border = 0;
		const srcFormat = gl.RGBA;
		const srcType = gl.UNSIGNED_BYTE;
		const view = new Uint8Array([255, 0, 0, 255]);

		gl.texImage2D(
			gl.TEXTURE_2D,
			0,
			internalFormat,
			width,
			height,
			border,
			srcFormat,
			srcType,
			view,
		);
		gl.bindTexture(gl.TEXTURE_2D, null);

		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, srcFormat, srcType, image);
		// gl.REPEAT by default
		// gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		// gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		gl.generateMipmap(gl.TEXTURE_2D);

		textures.push(texture);
		return texture;
	};

	const deleteTexture = (texture: WebGLTexture) => {
		const index = textures.findIndex((item) => texture == item);
		if (index != -1) {
			textures.splice(index, 1);
		}
	};

	const getRectangleData = () => {
		const scale = 1; //Math.random();

		//data : x,y,u,v

		const data = [
			-scale,
			-scale,
			0,
			0,
			-scale,
			scale,
			0,
			1,
			scale,
			scale,
			1,
			1,
			-scale,
			-scale,
			0,
			0,
			scale,
			scale,
			1,
			1,
			scale,
			-scale,
			1,
			0,
		];
		return data;
	};

	const dispose = () => {
		// https://stackoverflow.com/questions/23598471/how-do-i-clean-up-and-unload-a-webgl-canvas-context-from-gpu-after-use
		// https://stackoverflow.com/questions/37072303/how-to-free-and-garbage-collect-a-webgl-context

		// Dispose of all textures
		while (textures.length) {
			gl.deleteTexture(textures.pop());
		}

		// Dispose of context
		const context = gl.getExtension("WEBGL_lose_context");
		if (context) context.loseContext();
		// else console.warn("Unable to loose WEBGL context", props.el);
	};

	watch(() => device.height, resize);

	return {
		setup,
		render,
		createUniform,
		createAttribute,
		createTexture,
		deleteTexture,
		uniforms,
		attributes,
		dispose,
		bounds,
	};
};

// Example usage

// import { onRendered, onResized, useBounds, useEvents } from "composables";
// import { useCanvasGL } from "composables/canvas-gl";
// import { useFile } from "composables/file";
// import { Component, useReactivity, useScope } from "core";
// import { extend, getProps, Vector2 } from "utils";

// export function Crater(args) {
// 	// Extend

// 	extend(Component, this, args);
// 	const node = args.el;

// 	// Props

// 	const { on, once } = useEvents();
// 	const { child, children } = useScope(this);
// 	const { watch, effect } = useReactivity();

// 	const {} = getProps(node);

// 	// Vars

// 	const vert = useFile("shaders/crater/crater.vert");
// 	const frag = useFile("shaders/crater/crater.frag");

// 	const canvasEl = child("canvas") as HTMLCanvasElement;
// 	const bounds = useBounds(canvasEl);
// 	const gl = useCanvasGL({
// 		el: canvasEl,
// 		vertex: vert.contents,
// 		fragment: frag.contents,
// 	});

// 	// Hooks

// 	onMounted(async () => {
// 		await Promise.all([
// 			vert.load(), //
// 			frag.load(),
// 		]);

// 		gl.createUniform("uTime", 0);
// 		gl.createUniform("uResolution", new Vector2(bounds.width, bounds.height));

// 		gl.createAttribute("aPosition", {
// 			size: 2,
// 			type: WebGLRenderingContext.FLOAT,
// 			normalized: false,
// 			stride: 16,
// 			offset: 0,
// 		});

// 		gl.setup();
// 	});

// 	onReady(() => {
// 		gl.render();
// 	});

// 	onUnmounted(() => {});

// 	onRendered(node, (tick) => {
// 		gl.uniforms.uTime.value = tick.time;
// 		gl.render();
// 	});

// 	onResized(() => resize());

// 	// Functions

// 	const resize = () => {
// 		gl.uniforms.uResolution.value = new Vector2(bounds.width, bounds.height);
// 	};

// 	// Effects
// }

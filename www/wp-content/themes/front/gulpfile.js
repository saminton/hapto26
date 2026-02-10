import browserSync from "browser-sync";
import concat from "gulp-concat";
import esbuild from "gulp-esbuild";
import * as dartSass from "sass";
import gulp from "gulp";
import gulpSass from "gulp-sass";
import livereload from "gulp-livereload";
import sassGlob from "gulp-sass-glob";
import sourcemaps from "gulp-sourcemaps";
import postcss from "gulp-postcss";
import cssModules from "postcss-modules";
import sortMQ from "postcss-sort-media-queries";
// import * as dotenv from 'dotenv' // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
// dotenv.config()
import bump from "gulp-bump";
import { glsl } from "esbuild-plugin-glsl";
import md5 from "md5";

const args = {};
process.argv.forEach((arg, i) => {
	if (arg.includes("--")) args[arg.replace("--", "")] = process.argv[i + 1];
});

// https://github.com/csstools/postcss-unmq

// Options
const sassCompiler = gulpSass(dartSass);

const theme = "starter";
const folders = [
	"atoms",
	"blocks",
	"bundles",
	"composables",
	"core",
	"layouts",
	"layouts",
	"modules",
	"onces",
	"pages",
	"services",
	"theme",
	"utils",
	"error",
	"plugins",
];

const output = {
	scripts: "build",
	styles: "build",
};

// const bundles = {
// 	desktop: {
// 		min: 769,
// 		removeMin: true,
// 	},
// 	tablet: {
// 		max: 768,
// 		min: 481,
// 		removeMin: true,
// 		removeMax: true,
// 	},
// 	mobile: {
// 		max: 480,
// 		removeMax: true,
// 	},
// };

let is_build = false;

// Scripts

export function scripts(complete) {
	if (!is_build)
		return gulp
			.src("bundles/app.ts")
			.pipe(
				esbuild({
					outfile: `app.js`,
					bundle: true,
					minify: false,
					keepNames: true,
					sourcemap: "inline",
					target: ["es6"],
					tsconfig: "tsconfig.json",
					plugins: [
						glsl({
							minify: false,
						}),
					],
				}),
			)
			.on("error", swallowError)
			.pipe(gulp.dest(output.scripts))
			.on("end", () => {
				livereload.reload();
				complete();
			});
	else
		return gulp
			.src("bundles/app.ts")
			.pipe(
				esbuild({
					outfile: `app.min.js`,
					bundle: true,
					minify: true,
					keepNames: true,
					target: ["es6"],
					tsconfig: "tsconfig.json",
					legalComments: "linked",
					plugins: [
						glsl({
							minify: true,
						}),
					],
				}),
			)
			.on("error", swallowError)
			.pipe(gulp.dest(output.scripts))
			.on("end", () => {
				complete();
			});
}

// Styles

export function styles(complete) {
	const postOptions = [
		sortMQ(),
		cssModules({
			generateScopedName: function (selector, filepath, css) {
				// console.log(hash);

				let filename = filepath
					.replace(/^.*[\\/]/, "")
					.replace(/\.[^/.]+$/, "")
					.replace("-", "_");

				let uid = "";
				// No uids for plugins folders
				if (!filepath.includes("/plugins/")) uid = "-" + md5(filename).slice(0, 4);

				if (selector == filename) return filename + uid;
				// return filename + "-" + selector + uid;
				return selector + uid;
			},
			hashPrefix: "prefix",
			getJSON: () => null,
		}),
	];

	const cssPaths = [
		"core/app.scss",
		"atoms/**/**.scss",
		"modules/**/**.scss",
		"blocks/**/**.scss",
		"onces/**/**.scss",
		"pages/**/**.scss",
		"error/**/**.scss",
		"plugins/**/**.scss",
	];

	if (!is_build)
		return gulp
			.src(cssPaths)
			.pipe(sourcemaps.init())
			.pipe(sassGlob())
			.pipe(
				sassCompiler({
					silenceDeprecations: ["global-builtin", "color-functions"],
				}).on("error", sassCompiler.logError),
			)
			.pipe(postcss(postOptions))
			.pipe(sourcemaps.write())
			.pipe(concat("app.css"))
			.pipe(gulp.dest(output.styles))
			.pipe(livereload());
	else
		return gulp
			.src(cssPaths)
			.pipe(sassGlob())
			.pipe(
				sassCompiler({
					silenceDeprecations: ["global-builtin", "color-functions"],
				}).on("error", sassCompiler.logError),
			)
			.pipe(postcss(postOptions))
			.pipe(concat("app.min.css"))
			.pipe(gulp.dest(output.styles));
}

// Webserver

export function webserver() {
	browserSync.init(
		{
			proxy: `http://${theme}.localhost`,
			scrollThrottle: 100,
			minify: false,
			ghostMode: {
				clicks: true,
				forms: true,
				scroll: true,
				location: true,
			},
			open: false,
			callbacks: {
				ready: (err, bs) => {
					// process.exit()
				},
			},
			port: 3002,
		},
		() => {},
	);
}

// Watch

function getFolders() {
	const js = folders.map((item) => item + "/**/*.ts");
	const css = folders.map((item) => item + "/**/*.scss");
	const twig = folders.map((item) => item + "/**/*.twig");
	const php = [".twig/**/*.php", "../api/**/*.php"];
	const shader = ["./**/*.vert", "./**/*.frag"];

	return {
		js,
		css,
		twig,
		php,
		shader,
	};
}

export function watch() {
	is_build = false;
	livereload.listen();

	gulp.parallel(scripts, styles, webserver)();

	const { js, css, twig, php, shader } = getFolders();
	gulp.watch(js, scripts);
	gulp.watch(css, styles);
	gulp.watch(twig, reload);
	gulp.watch(shader, reload);
	// gulp.watch([...js, ...css, ...twig, ...php]).on("change", formatFile);
}

gulp.task("bump", function (complete) {
	/// <summary>
	/// It bumps revisions
	/// Usage:
	/// 1. gulp bump : bumps the package.json and bower.json to the next minor revision.
	///   i.e. from 0.1.1 to 0.1.2
	/// 2. gulp bump --version 1.1.1 : bumps/sets the package.json and bower.json to the
	///    specified revision.
	/// 3. gulp bump --type major       : bumps 1.0.0
	///    gulp bump --type minor       : bumps 0.1.0
	///    gulp bump --type patch       : bumps 0.0.2
	///    gulp bump --type prerelease  : bumps 0.0.1-2
	/// </summary>

	var type = args.type;
	var version = args.version;
	var options = {};
	var msg = "bumped";
	if (version) {
		options.version = version;
		msg += " to " + version;
	} else {
		options.type = type ?? "patch";
		msg += " for a " + type;
	}

	return gulp.src("package.json").pipe(bump(options)).pipe(gulp.dest("./"));
});

export function build(complete) {
	is_build = true;
	gulp.parallel(scripts, styles)();
	complete();
}

function reload(complete) {
	livereload.reload();
	complete();
}

// Utils

function swallowError(error) {
	console.log(error);
	this.emit("end");
}

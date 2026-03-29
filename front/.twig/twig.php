<?php

function twigSetup() {
	$theme_path = $_SERVER["DOCUMENT_ROOT"] . "/wp-content/themes/front/";

	include_once "dotenv.php";
	require_once $theme_path . "/vendor/autoload.php";
	require_once $theme_path . "/.twig/loader.php";
	require_once $theme_path . "/.twig/token-parsers.php";

	(new DotEnv($theme_path . ".env"))->load();
	$loader = new Twig\Loader\CustomFileLoader($theme_path);

	$twig = new \Twig\Environment($loader, [
		"debug" => true
	]);

	$twig->addExtension(new \Twig\Extension\DebugExtension());
	$twig->addTokenParser(new \Twig\TokenParser\DefaultTokenParser());

	$global_data = vl_get_data_global();
	if ($global_data) {
		foreach ($global_data as $key => $value):
			$twig->addGlobal($key, $value);
		endforeach;
	}

	include $theme_path . "/.twig/filters.php";
	include $theme_path . "/.twig/functions.php";

	return $twig;
}

if (!is_admin()) {
	include_once "dotenv.php";
	(new DotEnv(__DIR__ . "/../.env"))->load();

	// Constants

	define("APP_ENV", getenv("APP_ENV"));
	define("THEME_FOLDER_NAME", "front");
	define("THEME_FOLDER", get_bloginfo("template_url") . "/../" . THEME_FOLDER_NAME);

	// Globals

	global $package; // package.json
	global $build_folder; // absolute path
	global $api_path; // absolute path
	global $theme_path; // absolute path

	$root = $_SERVER["DOCUMENT_ROOT"];
	$build_folder = THEME_FOLDER . "/build/";
	$api_path = $root . "/wp-content/themes/api/";
	$theme_path = $root . "/wp-content/themes/" . THEME_FOLDER_NAME . "/";
	$package = json_decode(curl_get_contents($theme_path . "/package.json"), true);

	// Styles

	add_action("wp_print_styles", function () {
		global $build_folder;
		global $package;
		$file_name = APP_ENV === "dev" ? "app.css" : "app.min.css";
		$file = $build_folder . $file_name . "?v=" . $package["version"];
		wp_enqueue_style("app", $file);
	});

	// Scripts

	add_action("wp_print_scripts", function () {
		global $build_folder;
		global $package;
		$file_name = APP_ENV === "dev" ? "app.js" : "app.min.js";
		$file = $build_folder . $file_name . "?v=" . $package["version"];
		wp_enqueue_script("app", $file);
	});

	// Template filter

	add_filter("template_include", "vl_twig_template_include", 0);
}

function vl_twig_template_include($path) {
	global $post;
	$post = is_tax() ? get_queried_object() : $post;

	// Twig

	$twig = twigSetup();

	// Data

	$layout_data = vl_get_data_layout();
	$path = vl_get_path($post);

	if ($path) {
		$post_data = vl_get_data($post);
	} else {
		$path = "error/error";
		$post_data = vl_get_data_error($post);
	}

	// Format data for twig

	$data = (object) array_merge((array) $layout_data, (array) $post_data);
	$data = json_decode(json_encode($data), true);
	$term = is_tax() ? get_queried_object() : false;

	$data["head"] = [];
	$data["foot"] = [];

	wp_head();
	wp_footer();

	if ($post && function_exists("YoastSEO")):
		// Head

		$meta_helper = YoastSEO()->classes->get(
			Yoast\WP\SEO\Surfaces\Meta_Surface::class
		);
		$meta = $meta_helper->for_post($post->ID);

		if ($term) {
			$meta = $meta_helper->for_term($term->term_id);
		} else {
			$meta_helper->for_post($post->ID);
		}

		$data["head"] = $meta->get_head()->json;
		$data["head"]["image"] = isset($data["head"]["og_image"])
			? $data["head"]["og_image"][0]["url"]
			: "";
	endif;

	// Enqueues

	global $head;
	global $foot;
	$data["head"] = $head;
	$data["foot"] = $foot;

	// Robots

	$data["head"]["is_public"] = get_option("blog_public");
	$data["head"]["title"] = get_the_title($post);
	$data["head"]["favicon"] = [
		"is_set" => has_site_icon(),
		"32" => get_site_icon_url(32),
		"192" => get_site_icon_url(192),
		"180" => get_site_icon_url(180),
		"270" => get_site_icon_url(270),
		"svg" => null
	];

	// APIs

	$data["api"] = vl_get_field("api_keys", "option");

	// Render

	echo $twig->render($path . ".twig", $data);

	return null; // prevent wp from loading default file
}

function vl_get_path($post, $path = null) {
	global $theme_path;
	$route = vl_get_page_route_info($post);
	$folder = $theme_path . "pages/";

	if (!$route) {
		return null;
	}

	// Single file
	$path = $folder . $route["template"];

	// File in folder
	if (!file_exists($path . ".twig")) {
		$path = $folder . $route["template"] . "/" . $route["template"];
	}

	return str_replace($theme_path, "", $path);
}

// Render twig components with data

function vl_render_twig_component(string $component, $data = []) {
	// Twig

	$twig = twigSetup();

	// Format data for twig

	$data = (object) $data;
	$data = json_decode(json_encode($data), true);

	preg_match("/\/(.*)/", $component, $output);
	$file = $component . $output[0] . ".twig";

	// Make data iterable
	if (!isset($data[0]) || !$data[0]) {
		$data = [$data];
	}

	// return $file;
	$ret = "";
	$i = 0;
	foreach ($data as $entry_data) {
		$entry_data["index"] = $i;
		// Render

		ob_start();
		try {
			echo $twig->render($file, $entry_data);
		} catch (\Throwable $th) {
			echo $th;
		}
		$ret .= ob_get_contents();
		ob_end_clean();

		$i++;
	}

	return trim($ret);
}

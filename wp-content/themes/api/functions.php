<?php

add_theme_support("menus");
add_theme_support("post-thumbnails");
function vl_theme_setup() {
	load_theme_textdomain("theme", get_template_directory() . "/languages");
}
function include_directory($dir) {
	foreach (glob(__DIR__ . "/" . $dir . "/*.php") as $path) {
		include $path;
	}
}

// Utils

include_directory("utils");

// Theme

include_directory("theme");

// Plugins

include_directory("plugins");

// Admin

include_directory("admin");

// Data

include_directory("data");
include_directory("post-types");
include_directory("taxonomies");
include_directory("templates");

// Routes

// include_directory('routes');
include_directory("ajax");
// include 'debug.php'; // Create rest API routes

// PHP Templating

include $_SERVER["DOCUMENT_ROOT"] . "/wp-content/themes/front/.twig/twig.php";

<?php

// global $dir;
// global $theme_path;

// $dir = $_SERVER['DOCUMENT_ROOT'];
// $theme_path = $dir.'/wp-content/themes/theme/';

add_filter(
	"template_include",
	function ($path) {
		global $post;
		global $theme_path;

		// Render page content

		$id = $post->ID;
		$func = "vl_get_data_" . vl_get_page_template($id);
		$data = $func($id);

		return null; // prevent wp from loading default file
	},
	0
);

// function vl_get_path($post, $path = null) {

// 	global $theme_path;
// 	$route = vl_get_page_route_info($post);

// 	if($route) {
// 		$path = $theme_path.'pages/'.$route['template'].'.php';
// 	}

// 	return $path;
// }

// function include_file($path, $data = []){
// 	extract($data);
// 	$data = null;
// 	include $path;
// }

<?php

// Global data to inject into all pages

function vl_get_data_layout() {
	global $post;

	$data["menu"] = vl_get_menu_by_name("Menu") ?? [];
	$data["home_url"] = get_home_url();
	// $data['error'] = vl_get_field('error', 'option');
	// $data['cookie_banner'] = vl_get_field('cookie_banner', 'option');
	// $data['cookie_options'] = vl_get_field('cookie_options', 'option');
	// $data['footer'] = vl_get_field('footer', 'option');

	$data["ancestor_id"] = vl_get_top_ancestor_id();
	$data["id"] = isset($post) ? $post->ID : null;

	return $data;
}

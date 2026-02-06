<?php

// https://support.advancedcustomfields.com/forums/topic/multiple-top-level-options-pages/

/**
 * Create an option page group
 *
 * @param  string $name
 * @param  string $sub_name
 * @param  string $icon
 * @param  int $position
 * @return void
 */
function vl_option_page($name, $sub_name = "Global", $icon = null, $position = 25) {
	if (function_exists('acf_add_options_sub_page')) {
		acf_add_options_sub_page($name);
		acf_add_options_sub_page([
			'title' => $sub_name,
			'menu_title' => $name . '-default',
			'parent' => 'acf'
		]);
	}

	add_action('admin_menu', function () use ($name, $sub_name, $icon, $position) {
		$slug = 'acf-options-' . sanitize_title($name) . '-default';
		add_menu_page($name, $name, 'manage_options', $slug, null, $icon, $position);
		add_submenu_page($slug, '', $sub_name, 'manage_options', $slug, '');
	});
}

/**
 * Create an option sub page
 *
 * @param  string $parent_name
 * @param  string $name
 * @return void
 */
function vl_sub_option_page($parent_name, $name) {
	acf_add_options_sub_page([
		'title' => $name,
		'parent' => 'acf-options-' . sanitize_title($parent_name) . '-default'
	]);
}

<?php

define('DISALLOW_FILE_EDIT', true);

// Set Home page from template

$home_id = get_posts([
	'post_type' => 'page',
	'fields' => 'ids',
	'nopaging' => true,
	'meta_key' => '_wp_page_template',
	'meta_value' => 'templates/home.php',
	'suppress_filters' => false
]);

if ($home_id && $home_id[0]) {
	update_option('page_on_front', $home_id[0]);
	update_option('show_on_front', 'page');
}

/**
 * Proper ob_end_flush() for all levels
 *
 * This replaces the WordPress `wp_ob_end_flush_all()` function
 * with a replacement that doesn't cause PHP notices.
 */
remove_action('shutdown', 'wp_ob_end_flush_all', 1);
add_action('shutdown', function () {
	while (@ob_end_flush());
});

add_action('admin_print_styles', 'vl_admin_css');
function vl_admin_css() {
	wp_register_style(
		'admin_css',
		get_template_directory_uri() . '/admin/admin.css',
		false,
		'1.0.0'
	);
	wp_register_script(
		'admin_js',
		plugin_dir_url(__FILE__) . '/admin/admin.js',
		false,
		'1.0.0'
	);
	wp_enqueue_style('admin_css');
	wp_enqueue_script('admin_js');
}

// Flush

add_action('wp_update_nav_menu_item', 'vl_flush_permalinks', 10, 2);
function vl_flush_permalinks() {
	flush_rewrite_rules(true);
}

<?php

/**
 * Plugin Name: Admin Theme
 * Plugin URI: http://viens-la.com
 * Description: Simple modern Wordpress admin theme.
 * Version: 1.0.0
 * Author: Your Name
 * Author URI: http://viens-la.com
 * License: GPL2
 */

function admin_css() {
	wp_register_style(
		'admin_theme',
		plugin_dir_url(__FILE__) . 'build/admin-theme.css',
		false,
		'1.0.0'
	);
	wp_register_script(
		'admin_theme',
		plugin_dir_url(__FILE__) . 'build/admin-theme.js',
		false,
		'1.0.0'
	);
	wp_enqueue_style('admin_theme');
	wp_enqueue_script('admin_theme');
}
add_action('admin_print_styles', 'admin_css', 11);

function admin_tmce_css() {
	add_editor_style( plugin_dir_url(__FILE__) . 'build/admin-theme-tmce.css' );
}
add_action( 'after_setup_theme', 'admin_tmce_css' );
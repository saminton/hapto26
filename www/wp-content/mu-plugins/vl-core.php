<?php

/**
 * Plugin Name: Viens-là core
 * Description: Nécessaire au fonctionnement du site
 * Author: Viens-là
 * Version: 0.1
 */

function vl_activate_plugin($plugin) {
	// Programmatically install and activate wordpress plugin
	$current = get_option('active_plugins');
	$plugin = plugin_basename(trim($plugin));

	if (!in_array($plugin, $current)) {
		$current[] = $plugin;
		sort($current);
		do_action('activate_plugin', trim($plugin));
		update_option('active_plugins', $current);
		do_action('activate_' . trim($plugin));
		do_action('activated_plugin', trim($plugin));
	}

	return null;
}

add_action('wp_install', function () {
	// Plugins to activate on unstallation
	$plugins = [
		'acf-autosize/acf-autosize.php', //
		'acf-content-analysis-for-yoast-seo/yoast-acf-analysis.php',
		'advanced-custom-fields-pro/acf.php',
		'classic-editor/classic-editor.php',
		'imagify/imagify.php',
		'intuitive-custom-post-order/intuitive-custom-post-order.php',
		'post-duplicator/m4c-postduplicator.php',
		'safe-svg/safe-svg.php',
		'wordpress-seo/wp-seo.php',
		"admin-theme/admin-theme.php"
	];

	// Actiavte plugins
	foreach ($plugins as $slug) {
		vl_activate_plugin($slug);
	}

	// Set template for home page
	update_post_meta(2, '_wp_page_template', 'templates/home.php');

	// Set theme
	// add_filter('template', function () {
	// 	return 'api';
	// });
	// add_filter('option_template', function () {
	// 	return 'api';
	// });
	// add_filter('option_stylesheet', function () {
	// 	return 'api';
	// });
	switch_theme('api');
});

// add_action('after_setup_theme', function() {
// 	echo '<pre>';
// 	var_dump('Setup');
// 	die();
// 	echo '</pre>';
// });


add_action('init', function () {

	// Set englih by default
	$user = wp_get_current_user();

	if ($user->ID == 1) {
		update_user_meta($user->ID, 'locale', 'en_US');
	}

	// Disable certain plugins locally
	$ips = ['127.0.0.1', '::1'];

	if (!in_array($_SERVER['REMOTE_ADDR'], $ips)) {
		return null;
	}

	$plugins = [
		'wordfence/wordfence.php', //
		'wps-hide-login/wps-hide-login.php'
	];

	if ($plugins) {
		foreach ($plugins as $path):
			if (function_exists('is_plugin_active') && is_plugin_active($path)) {
				deactivate_plugins($path);
			}
		endforeach;
	}
});

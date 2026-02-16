<?php

// Menu slugs
// add_action('admin_init', function () {
// 	echo '<pre>' . print_r($GLOBALS['menu'], true) . '</pre>';
// });

function vl_remove_menus() {
	remove_menu_page("acf-options-blocks"); // hide acf options
	remove_menu_page("edit-comments.php"); //Comments
	remove_menu_page("acf-options-footer");

	add_admin_menu_separator(16);

	// Hide acf from when not local to prevent changes
	$whitelist = ["127.0.0.1", "::1"];
	if (!in_array($_SERVER["REMOTE_ADDR"], $whitelist)) {
		remove_menu_page("edit.php?post_type=acf-field-group");
	}

	if (get_current_user_id() != 1) {
		remove_menu_page("edit.php?post_type=acf-field-group"); //ACF
		remove_menu_page("themes.php"); //Appearance
		// remove_menu_page('edit.php'); //Posts
		// remove_menu_page('index.php'); //Dashboard
		remove_menu_page("plugins.php"); //Plugins
		remove_menu_page("tools.php"); //Tools
		// remove_menu_page('options-general.php'); //Settings
		// remove_menu_page('admin.php?page=wpseo_dashboard'); //SEO
		// remove_menu_page('admin.php?page=sitepress-multilingual-cms%2Fmenu%2Flanguages.php'); //WPML
	}
}
add_action("admin_menu", "vl_remove_menus");

// Add menu editor as separate menu item

function vl_new_nav_menu() {
	global $menu;
	global $submenu;

	add_menu_page(
		"Menus",
		"Menus",
		"manage_options",
		"nav-menus.php",
		null,
		"dashicons-menu",
		21
	);

	unset($submenu["themes.php"][10]); // Removes Menu
}
add_action("admin_menu", "vl_new_nav_menu");

// Limit max menu depth in admin panel

function vl_limit_depth($hook) {
	if ($hook != "nav-menus.php") {
		return;
	}

	// override default value right after 'nav-menu' JS
	wp_add_inline_script("nav-menu", "wpNavMenu.options.globalMaxDepth = 1;", "after");
}
add_action("admin_enqueue_scripts", "vl_limit_depth");

function add_admin_menu_separator($position) {
	global $menu;
	$index = 0;
	if (is_array($menu)) {
		foreach ($menu as $offset => $section) {
			if (substr($section[2], 0, 9) == "separator") {
				$index++;
			}
			if ($offset >= $position) {
				$menu[$position] = [
					"",
					"read",
					"separator{$index}",
					"",
					"wp-menu-separator"
				];
				break;
			}
		}

		ksort($menu);
	}
}

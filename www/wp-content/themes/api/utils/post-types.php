<?php

global $post_templates;
$post_templates = [];

/**
 * Create custom post with default values
 *
 * @param  mixed $data
 * @return void
 */
function vl_custom_post_type($data) {
	$singular = $data['singular'];
	$pluriel = $data['pluriel'];
	$f = $data['feminin'];
	$abbr = isset($data['abbr']) ? $data['abbr'] : false; // le , la, l'

	if ($abbr) {
		$l = "l'";
	} else {
		$l = $f ? 'la ' : 'le ';
	}

	$slc = strtolower($singular);
	$plc = strtolower($pluriel);

	// $labels = [
	// 	'name' => $pluriel,
	// 	'singular_name' => $singular,
	// 	'add_new_item' => $f ? 'Ajouter une ' . $slc : 'Ajouter un ' . $slc,
	// 	'edit_item' => 'Modifier ' . $l . $slc,
	// 	'new_item' => $f ? 'Nouvelle ' . $slc : 'Nouveau ' . $slc,
	// 	'all_items' => $f ? 'Toutes les ' . $plc : 'Tous les ' . $plc,
	// 	'view_item' => 'Voir ' . $l . $slc,
	// 	'search_items' => $f ? 'Rechercher une ' . $slc : 'Rechercher un ' . $slc,
	// 	'not_found' => $f ? 'Aucune ' . $slc . ' trouvé' : 'Aucun ' . $slc . ' trouvée',
	// 	'not_found_in_trash' => $f
	// 		? 'Aucune ' . $slc . ' trouvée dans la corbeille'
	// 		: 'Aucun ' . $slc . ' trouvé dans la corbeille',
	// 	'parent_item_colon' => '',
	// 	'menu_name' => $pluriel
	// ];

	$labels = [
		'name' => $pluriel,
		'singular_name' => $singular
		// 'add_new_item' => 'Add new ' . $slc,
		// 'edit_item' => 'Modify ' . $l . $slc,
		// 'new_item' => 'New ' . $slc,
		// 'all_items' => 'All ' . $plc,
		// 'view_item' => 'See ' . $slc,
		// 'search_items' => 'Search for ' . $slc,
		// 'not_found' => 'No ' . $slc . ' found',
		// 'not_found_in_trash' => 'No ' . $slc . ' found in trash',
		// 'parent_item_colon' => '',
		// 'menu_name' => $pluriel
	];

	$defaults = [
		'public' => true,
		'publicly_queryable' => $data['public'] ?? true,
		'show_ui' => true,
		'show_in_menu' => true,
		'query_var' => true,
		'template' => null,
		'rewrite' => [
			'slug' => __(remove_accents($data['name']), 'theme'),
			'with_front' => false
		],
		'capability_type' => 'post',
		'has_archive' => false,
		'hierarchical' => false,
		'menu_position' => 6,
		'show_in_rest' => true,
		'supports' => ['title', 'thumbnail', 'editor'],
		'menu_icon' => 'dashicons-media-default',
		'labels' => $labels
	];

	foreach ($data as $key => $value):
		$defaults[$key] = $value;
	endforeach;

	register_post_type($data['name'], $defaults);

	if ($defaults['template']) {
		global $post_templates;
		$post_templates[$data['name']] = $defaults['template'];
	}
}

// Remove default posts

add_filter(
	'register_post_type_args',
	function ($args, $post_type) {
		if ($post_type === 'post') {
			$args['public'] = false;
			$args['show_ui'] = false;
			$args['show_in_menu'] = false;
			$args['show_in_admin_bar'] = false;
			$args['show_in_nav_menus'] = false;
			$args['can_export'] = false;
			$args['has_archive'] = false;
			$args['exclude_from_search'] = true;
			$args['publicly_queryable'] = false;
			$args['show_in_rest'] = false;
		}
		return $args;
	},
	0,
	2
);

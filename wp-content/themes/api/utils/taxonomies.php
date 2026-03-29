<?php

function vl_custom_taxonomy($data) {
	$singular = $data["singular"];
	$pluriel = $data["pluriel"];
	$f = $data["feminin"];
	$abbr = isset($data["abbr"]) ? $data["abbr"] : false; // le , la, l'

	if ($abbr) {
		$l = "l'";
	} else {
		$l = $f ? "la " : "le ";
	}

	$slc = strtolower($singular);
	$plc = strtolower($pluriel);

	$defaults = [
		"hierarchical" => true,
		"public" => true,
		"query_var" => true,
		"has_archive" => true,
		"publicly_queryable" => true,
		"exclude_from_search" => true,
		"show_in_rest" => true,
		"rewrite" => ["slug" => __(remove_accents($data["name"]), "theme")],
		"labels" => [
			"name" => $singular,
			"singular_name" => $singular,
			"search_items" => $f ? "Rechercher une " . $slc : "Rechercher un " . $slc,
			"all_items" => $f ? "Toutes les " . $plc : "Tous les " . $plc,
			"parent_item" => $singular . " parent",
			"parent_item_colon" => $singular . " parent",
			"edit_item" => "Modifier " . $l . $slc,
			"update_item" => "Mettre à jour " . $l . $slc,
			"add_new_item" => $f ? "Ajouter une " . $slc : "Ajouter un " . $slc,
			"new_item_name" => $f ? "Nouvelle " . $slc : "Nouveau " . $slc,
			"menu_name" => $pluriel
		]
	];

	foreach ($data as $key => $value):
		$defaults[$key] = $value;
	endforeach;

	register_taxonomy($data["name"], $data["posttype"], $defaults);
}

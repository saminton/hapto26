<?php

/**
 * @param  mixed $req
 * @return void
 */
function vl_get_menu_by_name($name) {
	$items = wp_get_nav_menu_items($name);
	$menu = wp_get_nav_menu_object($name);
	if (!$items) {
		return null;
	}
	$ret = [
		"fields" => vl_get_fields($menu),
		"items" => []
	];

	if ($items) {
		foreach ($items as $item):
			$ret["items"][$item->ID] = [
				"parent" => intval($item->menu_item_parent),
				"title" => $item->title,
				"url" => $item->url,
				"page_id" => intval($item->object_id),
				"description" => $item->description,
				"class" => "",
				"fields" => vl_get_fields($item->ID),
				"children" => []
			];

			// Format classes
			foreach ($item->classes as $value) {
				$ret["items"][$item->ID]["class"] .= $value . " ";
			}
		endforeach;
	}

	// Recursivly append children

	if ($ret["items"]) {
		foreach ($ret["items"] as $top):
			foreach ($ret["items"] as $key => $item):
				if ($item["parent"]) {
					$parent_id = $item["parent"];
					unset($item["parent"]);
					$ret["items"][$parent_id]["children"][$key] = $item;
				}
			endforeach;
		endforeach;
	}

	// Clean top level

	foreach ($ret["items"] as $key => $item):
		if ($item["parent"]) {
			unset($ret["items"][$key]);
		}
		unset($ret["items"][$key]["parent"]);
	endforeach;

	// Recursivly remove item keys

	$ret["items"] = vl_remove_menu_item_keys($ret["items"]);

	return $ret;
}

function vl_remove_menu_item_keys($items) {
	$temp = [];
	foreach ($items as $key => $item):
		if ($item["children"]) {
			$item["children"] = vl_remove_menu_item_keys($item["children"]);
		}
		$temp[] = $item;
	endforeach;

	return $temp;
}

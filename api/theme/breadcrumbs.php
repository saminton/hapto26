<?php

function vl_post_relations() {
	// Relation between posts and templates
	return [
			// 'article' => 'articles'
		];
}

function vl_get_breadcrumbs($id) {
	$relations = vl_post_relations();
	$type = get_post_type();
	$hierarchy = [];

	function append_page($array, $id) {
		$post = get_post($id);
		$parent = $post->post_parent;

		$array[] = [
			"title" => get_the_title($post),
			"url" => get_permalink($post)
		];

		if ($parent) {
			$array = append_page($array, $parent);
		}

		return $array;
	}

	// Append current post / page
	$hierarchy = append_page($hierarchy, $id);

	if ($type != "page") {
		// If post has relation to template
		if (in_array($type, array_keys($relations))) {
			$hierarchy = append_page(
				$hierarchy,
				vl_get_page_id_from_template($relations[$type])
			);
		}
	}

	if (!is_front_page()):
		// Append home page
		$hierarchy = append_page($hierarchy, vl_get_page_id_from_template("home"));
	endif;

	// Reverse hierarchy
	$hierarchy = array_reverse($hierarchy);

	return $hierarchy;
}

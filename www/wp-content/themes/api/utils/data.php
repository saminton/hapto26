<?php

/**
 * Get data specific to page type
 * @param  mixed $post
 * @return object
 */
function vl_get_data($post): array {
	$route = vl_get_page_route_info($post);
	$data = [];

	if ($route) {
		$func = "vl_get_data_" . snake_case($route["template"]);
	}

	// Taxo

	if (is_tax()) {
		$term = get_queried_object();
		$data = $func($term->term_id);
	} else {
		$data = $func($post->ID);
	}

	return $data ?: [];
}

/**
 * Get post title and URL from either a post ID or a URL.
 * @param mixed $input Post ID (int) or Post URL (string).
 * @return array|false
 */
function vl_url($input) {
	// Check if the input is numeric (post ID)
	if (is_numeric($input)) {
		$post = get_post((int) $input);
	} else {
		// Assume it's a URL
		$post_id = url_to_postid($input);
		if (!$post_id) {
			return false;
		}
		$post = get_post($post_id);
	}

	// Ensure a valid post object was found
	if (!$post || is_wp_error($post)) {
		return false;
	}

	// Return title and URL
	return [
		"title" => get_the_title($post),
		"url" => get_permalink($post)
	];
}

function vl_query(array $args) {
	$args["suppress_filters"] = false; // language

	if (isset($args["where"]) && !isset($args["where"]["posts_per_page"])) {
		$args["where"]["posts_per_page"] = -1;
	}

	// Term
	if (isset($args["query"]) && $args["query"] === "term") {
		if (isset($args["where"]["id"])) {
			return vl_term($args["where"]["id"], $args);
		} else {
			// Todo: get term from query
		}
	}

	// Terms
	if (isset($args["query"]) && $args["query"] === "terms") {
		if (isset($args["where"]["ids"])) {
			return vl_array_map(function ($id) use ($args) {
				return vl_term($id, $args);
			}, $args["where"]["ids"]);
		} else {
			return vl_array_map(function ($term) use ($args) {
				return vl_term($term->term_id, $args);
			}, get_terms($args["where"]));
		}
	}

	// Single post
	if (isset($args["query"]) && $args["query"] === "post") {
		if (isset($args["where"]["id"])) {
			return vl_post($args["where"]["id"], $args);
		} else {
			$posts = get_posts($args["where"]);
			return isset($posts[0]) ? vl_post($posts[0]->ID, $args) : null;
		}
	}

	// Array of posts
	if (isset($args["query"]) && $args["query"] === "posts") {
		if (isset($args["where"]["ids"])) {
			return vl_array_map(function ($id) use ($args) {
				return vl_post($id, $args);
			}, $args["where"]["ids"]);
		} else {
			return vl_array_map(function ($post) use ($args) {
				return vl_post($post->ID, $args);
			}, get_posts($args["where"]));
		}
	}
}

function vl_post($id, array $args) {
	if (is_int($id)) {
		$post = (array) get_post($id);
	} else {
		$post = (array) $id;
		if (!isset($post["ID"])) {
			return null;
		}
		$id = $post["ID"];
	}

	$data = [];

	// Post data
	if (isset($args["post"])) {
		$data["post"] = vl_post_data($post, $args["post"]);
	}

	// Custom data
	if (isset($args["post"])) {
		// Onclude only requested data from post
		foreach ($args["post"] as $key => $value) {
			$key_name = $key;
			// If requested addition data key is in value
			if (is_int($key_name)) {
				$key_name = $value;
			}
			if (isset($post[$key_name])) {
				$data[$key_name] = $post[$key_name];
			}
		}
	}

	// Fields
	if (isset($args["fields"])) {
		$data["fields"] = vl_post_fields($args["fields"], $id);
	}

	if (isset($args["taxonomies"])) {
		$data["taxonomies"] = vl_post_taxonomies($args["taxonomies"], $id);
	}

	return $data;
}

function vl_post_data($post, $query) {
	$data = [];

	// Set to lowercase and remove "post" prefix from wordpress data
	$post = array_reduce(
		array_keys($post),
		function ($carry, $key) use ($post) {
			$carry[str_replace("post_", "", strtolower($key))] = $post[$key];
			return $carry;
		},
		[]
	);

	$id = $post["id"];

	// Filter out unrequested data
	foreach ($query as $key => $value) {
		$key_name = $key;
		// If requested addition data key is in value
		if (is_int($key_name)) {
			$key_name = $value;
		}
		if (isset($post[$key_name])) {
			$data[$key_name] = $post[$key_name];
		}
	}

	// Custom data
	// Include in post data when requested

	// Post parent query
	if (isset($query["parent"])) {
		$data["parent"] = vl_query(
			array_merge($query["parent"], [
				"where" => ["id" => $post["parent"]]
			])
		);
	}

	if (in_array("thumbnail", $query)) {
		$data["thumbnail"] = vl_get_thumbnail_metadata($id) ?? [];
	}

	if (in_array("url", $query)) {
		$data["url"] = get_the_permalink($id);
	}

	if (in_array("author", $query)) {
		$data["author"] = get_the_author_meta("display_name", $post["author"]);
	}

	if (in_array("date", $query)) {
		$data["date"] = get_the_date("d M Y", $id);
	}

	if (in_array("content", $query)) {
		$data["content"] = apply_filters(
			"the_content",
			get_post_field("post_content", $id)
		);
	}

	if (in_array("index", $query)) {
		$data["post"]["index"] = array_search(
			$id,
			get_posts([
				"post_type" => $post["type"],
				"posts_per_page" => -1,
				"fields" => "ids",
				"suppress_filters" => false
			])
		);
	}

	return $data;
}

function vl_post_fields($query, $id) {
	$data = [];

	// Get requested fields from query
	foreach ($query as $key => $value) {
		if (is_int($key)) {
			// No additional data requested
			// Use value as key
			$items = vl_get_field($value, $id);
			$data[$value] = $items;
		} else {
			// Additional data requested

			$items = vl_get_field($key, $id);

			$data[$key] = vl_post_field($items, $query[$key], $key);
		}
	}

	return $data;
}

function vl_post_field($items, $query, $key) {
	if (!$items) {
		return null;
	}

	// If data requested
	if (isset($query["query"])) {
		$where = is_array($items) ? ["ids" => $items] : ["id" => $items];
		if (isset($query["where"])) {
			$where = array_merge($where, $query["where"]);
		}

		$query = array_merge($query, [
			"query" => $query["query"],
			"where" => $where
		]);

		return vl_query($query);
	}

	// Sub fields
	else {
		// Flexible content
		if (isset($items[0]["component"])) {
			return vl_flexible_content_query($items, $query);
		}

		// Repeater
		if (isset($items[0])) {
			$items = array_map(function ($item) use ($query, $key) {
				return vl_post_field($item, $query, $key);
			}, $items);
		}

		foreach ($items as $item_key => $item) {
			// Request data for sub field
			if (isset($query[$item_key])) {
				// Recursive field query
				$item_query = $query[$item_key];
				$items[$item_key] = vl_post_field($item, $item_query, $item_key);
			}
		}

		return $items;
	}
}

function vl_post_taxonomies($query, $id) {
	$data = [];
	// Get requested fields for query
	foreach ($query as $key => $value) {
		if (is_int($key)) {
			$terms = get_the_terms($id, $value);
			// No additional data requested
			$data[$value] = vl_array_map(function ($item) {
				return $item->term_id;
			}, $terms);
		} else {
			$terms = get_the_terms($id, $key);
			// Addition data requested
			if ($terms) {
				// Single term requested
				if ($value["query"] == "term") {
					// Todo: get primary term
					$data[$key] = vl_query(
						array_merge(
							[
								"where" => [
									"id" => $terms[0]->term_id
								]
							],
							$value
						)
					);
				}

				// Multiple terms requested
				if ($value["query"] == "terms") {
					$data[$key] = vl_query(
						array_merge(
							[
								"where" => [
									"ids" => array_map(function ($term) {
										return $term->term_id;
									}, $terms)
								]
							],
							$value
						)
					);
				}
			}
		}
	}
	return $data;
}

function vl_term($id, array $args) {
	if (is_int($id)) {
		$term = (array) get_term($id);
	} else {
		$term = (array) $id;
		$id = $term["term_id"];
	}

	$data = [];

	// Term data
	if (isset($args["term"])) {
		$data["term"] = vl_term_data($term, $args["term"]);
	}

	// Fields
	if (isset($args["fields"])) {
		$data["fields"] = vl_term_fields($args["fields"], "term_" . $id);
	}

	return $data;
}

function vl_term_data($term, $query) {
	// Get terms from query
	$data = [];
	$id = $term["term_id"];

	// Set to lowercase and remove "term" prefix from wordpress data
	$term = array_reduce(
		array_keys($term),
		function ($carry, $key) use ($term) {
			$carry[str_replace("term_", "", strtolower($key))] = $term[$key];
			return $carry;
		},
		[]
	);

	// Set parent to null if no parent
	if ($term["parent"] == 0) {
		$term["parent"] = null;
	}

	$id = $term["id"];

	// Filter out unrequested data
	foreach ($query as $key => $value) {
		$key_name = $key;
		// If requested addition data key is in value
		if (is_int($key_name)) {
			$key_name = $value;
		}

		if (isset($term[$key_name])) {
			$data[$key_name] = $term[$key_name];
		}
	}

	if ($term["parent"] && isset($query["parent"])) {
		// Todo: Term parent query
		// $data['parent'] = vl_query(
		// 	array_merge($query['parent'], [
		// 		'where' => ['id' => $term['parent']]
		// 	])
		// );
	}

	// Term url
	if (in_array("url", $query)) {
		$data["url"] = get_term_link($id);
	}

	return $data;
}

function vl_term_fields($query, $id) {
	$data = [];

	// Get requested fields from query
	foreach ($query as $key => $value) {
		if (is_int($key)) {
			// No additional data requested
			// Use value as key
			$items = vl_get_field($value, $id);
			$data[$value] = $items;
		} else {
			// Todo : Addition term field quests
			// Additional data requested
			// $items = vl_get_field($key, $id);
			// $data[$key] = vl_post_field($items, $query[$key], $key);
		}
	}

	return $data;
}

function vl_sorted_query(string $taxonomy, $query) {
	$terms = get_terms([
		"taxonomy" => $taxonomy,
		"hide_empty" => true,
		"fields" => "ids"
	]);

	$ret = [];

	// For pages with terms
	foreach ($terms as $term_id) {
		$term = get_term($term_id);

		$category = [
			"name" => $term->name,
			"posts" => []
		];

		$query["where"]["tax_query"] = [
			[
				"terms" => $term_id,
				"field" => "id",
				"taxonomy" => $taxonomy
			]
		];

		$category["posts"] = vl_query($query);

		if ($category["posts"]) {
			array_push($ret, $category);
		}
	}

	// For pages without terms
	$category = [
		"name" => null,
		"posts" => []
	];

	$query["where"]["tax_query"] = [
		[
			"terms" => $terms,
			"field" => "id",
			"taxonomy" => $taxonomy,
			"operator" => "NOT IN"
		]
	];

	$category["posts"] = vl_query($query);
	if ($category["posts"]) {
		array_push($ret, $category);
	}

	return $ret;
}

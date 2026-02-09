<?php

/**
 * @param  array $overrides
 * @param  array $defaults
 * @return array
 */
function with_defaults(array $overrides = [], array $defaults = []): array {
	$args = $defaults;
	if ($overrides) {
		foreach ($overrides as $key => $override):
			if ($override !== '') {
				$args[$key] = $override;
			}
		endforeach;
	}
	return $args;
}

/**
 * @param  string $part path to file
 * @param  array $arrays data to pass
 * @return void
 */
function vl_template(string $part, ...$arrays): void {
	get_template_part($part, null, $arrays ? array_merge(...$arrays) : null);
}

/**
 * @param  string $part path to file
 * @param  array $arrays data to pass
 * @return string
 */
function vl_get_template_contents(string $part, ...$arrays): string {
	ob_start();
	vl_template($part, ...$arrays);
	$contents = ob_get_contents();
	ob_end_clean();
	return $contents;
}

/**
 * Get type of page from id
 * @param  mixed $id
 * @return String
 */
function vl_get_page_type($post) {
	if (is_int($post)) {
		$post = get_post($post);
	}
	if (in_array(get_post_type($post), vl_get_custom_post_types())) {
		return 'single';
	}
	if (is_category($post->id)) {
		return 'taxonomy';
	}
	if (get_page_template_slug($post)) {
		return 'template';
	}
	if (get_post_type($post) === 'page') {
		return 'page';
	}
	return '';
}

function vl_get_custom_post_types() {
	return array_keys(
		get_post_types([
			'public' => true,
			'_builtin' => false
		])
	);
}

function vl_get_page_template($post) {
	if (is_int($post)) {
		$post = get_post($post);
	}
	$type = vl_get_page_type($post);
	if ($type === 'single') {
		return $post->post_type;
	}
	if ($type === 'template') {
		return str_replace(['templates/', '.php'], '', get_page_template_slug($post));
	}
	if ($type === 'page') {
		return 'page';
	}
}

function vl_get_page_id_from_template(string $name) {
	$pages = get_posts([
		'post_type' => 'page',
		'fields' => 'ids',
		'nopaging' => true,
		'meta_key' => '_wp_page_template',
		'meta_value' => 'templates/' . $name . '.php',
		'suppress_filters' => false
	]);
	if (!$pages) {
		return null;
	}
	return $pages[0];
}

function to_object(object $arr) {
	return json_decode(json_encode($arr));
}

function vl_format_rgb_color(array $color) {
	if (!$color) {
		return null;
	}
	return $color['red'] . ',' . $color['green'] . ',' . $color['blue'];
}

function vl_format_hex_color(string $color) {
	list($r, $g, $b) = sscanf($color, "#%02x%02x%02x");
	return "$r,$g,$b";
}

function vl_add_ajax(string $name): void {
	add_action('wp_ajax_' . $name, $name);
	add_action('wp_ajax_nopriv_' . $name, $name);
}

function vl_get_next_post_ids(
	int $id,
	int $count,
	bool $in_same_term = false,
	string $exclude = '',
	string $taxonomy = 'category'
) {
	$ids = [];
	$stored_id = $id;
	for ($i = 0; $i < $count; $i++):
		$stored_id = vl_get_next_post_id($stored_id, $in_same_term, $exclude, $taxonomy);
		if ($stored_id != $id && !in_array($stored_id, $ids)) {
			array_push($ids, $stored_id);
		}
	endfor;

	return $ids;
}

function vl_get_next_post_id(
	$id,
	bool $in_same_term = false,
	string $exclude = '',
	string $taxonomy = 'category'
) {
	global $post;
	$post = get_post($id);
	setup_postdata($post);
	$next = get_previous_post($in_same_term, $exclude, $taxonomy);
	wp_reset_postdata();

	if (!$next) {
		$posts = get_posts([
			'post_type' => get_post_type($id),
			'post_status' => 'publish',
			'numberposts' => 1,
			'order_by' => 'publish_date',
			'order' => 'DESC',
			'suppress_filters' => false
		]);
		$next = $posts[0];
	}

	return $next ? $next->ID : null;
}

function vl_get_previous_post_id(
	$id,
	bool $in_same_term = false,
	string $exclude = '',
	string $taxonomy = 'category'
) {
	global $post;
	$post = get_post($id);
	setup_postdata($post);
	$previous = get_next_post();
	wp_reset_postdata($in_same_term, $exclude, $taxonomy);

	if (!$previous) {
		$posts = get_posts([
			'post_type' => get_post_type($id),
			'post_status' => 'publish',
			'numberposts' => 1,
			'order_by' => 'publish_date',
			'order' => 'ASC',
			'suppress_filters' => false
		]);
		$previous = $posts[0];
	}

	return $previous ? $previous->ID : null;
}

function vl_array_map(callable $callback, ...$arrays): array {
	return $arrays[0] ? array_map($callback, ...$arrays) : [];
}

function vl_array_filter($array, callable $callback, int $mode = 0): array {
	return $array ? array_filter($array, $callback, $mode) : [];
}

function vl_get_top_ancestor_id(WP_Post $post = null) {
	if (!$post) {
		global $post;
	}
	if (!$post) {
		return null;
	}
	if (0 == $post->post_parent) {
		return $post->ID;
	} else {
		$parents = get_post_ancestors($post->ID);
		return end($parents);
	}
}

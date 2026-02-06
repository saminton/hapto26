<?php

function vl_get_routes() {
	// $post_types = vl_get_custom_post_types();
	global $post_templates;

	$page_ids = get_posts([
		'post_type' => 'page', //array_merge(['page'], $post_types),
		'posts_per_page' => -1,
		'post_status' => "publish",
		'fields' => 'ids',
		'suppress_filters' => false
	]);

	$data = [];

	$data['post_types'] = [];
	$data['pages'] = [];

	$post_types = vl_get_custom_post_types();
	if ($post_types) {
		foreach ($post_types as $post_type):
			$data['post_types'][] = [
				'uri' => '/' . $post_type,
				'template' => kebab_case($post_templates[$post_type] ?? $post_type)
			];
		endforeach;
	}

	if ($page_ids) {
		foreach ($page_ids as $id):
			$route_info = vl_get_page_route_info($id);
			if ($route_info) {
				$data['pages'][] = $route_info;
			}
		endforeach;
	}

	return $data;
}

function vl_get_page_route_info($post) {
	if (!$post) {
		return null;
	}

	// Taxo
	if (is_tax()) {
		$term = get_queried_object();

		return [
			'uri' => str_replace(get_bloginfo('url'), '', get_term_link($term->term_id)),
			'template' => kebab_case($term->taxonomy)
		];
	}

	if (is_int($post)) {
		$post = get_post($post);
	}

	$type = vl_get_page_type($post);

	if (!$type) {
		return null;
	}

	// Post type
	$template = get_post_type($post);
	global $post_templates;

	if ($type === 'single' && isset($post_templates[$template])) {
		$template = $post_templates[$template];
	}

	// Page
	if (get_post_type($post) === 'page') {
		$template = vl_get_page_template($post) ?? 'page';
	}

	return [
		'uri' => str_replace(get_bloginfo('url'), '', get_the_permalink($post)),
		'template' => kebab_case($template)
	];
}

function vl_register_route($name, $type, $callback) {
	add_action('rest_api_init', function () use ($name, $type, $callback) {
		register_rest_route('/vl', $name, [
			'methods' => $type,
			// 'callback' => $callback
			'callback' => function ($req) use ($callback) {
				$args = $req->get_params();
				if (isset($args['json'])) {
					try {
						$args = (array) json_decode($args['json'], true);
					} catch (\Throwable $th) {
					}
				}
				return $callback($args, $req);
			}
		]);
	});
}

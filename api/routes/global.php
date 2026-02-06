
<?php
// Get all routes

vl_register_route('routes', 'GET', function () {
	return vl_get_routes();
});

// Get page from ID or url

vl_register_route('page', 'GET', function ($args) {
	$id = 0;

	if (isset($args['id'])) {
		$id = intval($args['id']);
	}
	if (isset($args['uri'])) {
		$id = url_to_postid(get_bloginfo('url') . $args['uri']);
	}
	if (!$id) {
		return null;
	}

	// Preview

	if (
		isset($args['preview']) &&
		$args['preview'] === 'true' &&
		current_user_can('edit_posts')
	) {
		$preview_id = get_posts([
			'post_status' => 'any',
			'post_parent' => $id,
			'fields' => 'ids',
			'post_type' => 'revision',
			'sort_column' => 'ID',
			'sort_order' => 'desc',
			'posts_per_page' => 1,
			'suppress_filters' => false
		])[0];
	}

	$func = 'vl_get_data_' . snake_case(vl_get_page_template($id));
	$data = $func($preview_id ?? $id);

	if (function_exists('YoastSEO')) {
		$meta_helper = YoastSEO()->classes->get(
			Yoast\WP\SEO\Surfaces\Meta_Surface::class
		);
		$meta = $meta_helper->for_post($id);
		$data['head'] = $meta->get_head()->json;
	}

	$data['footer'] = get_field('footer', 'option');

	return $data;
});

// Get data from query

vl_register_route('query', 'GET', function ($args) {
	return vl_query($args);
});


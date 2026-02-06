<?php

// Register post type

vl_custom_post_type([
	'name' => 'article',
	'singular' => 'Article',
	'pluriel' => 'Articles',
	'template' => 'article',
	'feminin' => false,
	'abbr' => false, // l'
	'public' => true,
	'menu_icon' => 'dashicons-welcome-learn-more' // overwrite default values
]);

// Data

function vl_get_data_article($id) {
	$data = vl_query([
		'query' => 'post',
		'where' => [
			'id' => $id
		],
		'post' => [
			'title', //
			'content'
		],
		'fields' => [
			//
		]
	]);

	return $data;
}

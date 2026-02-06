<?php

// Register post type

vl_custom_post_type([
	'name' => '{{snakeCase name}}',
	'singular' => '{{pascalCase name}}',
	'pluriel' => '{{pascalCase name}}',
	'template' => '{{kebabCase name}}',
	'feminin' => false,
	'abbr' => false, // l'
	'public' => true,
	'menu_icon' => 'dashicons-welcome-learn-more' // overwrite default values
]);

// Data

function vl_get_data_{{snakeCase name}}($id) {
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
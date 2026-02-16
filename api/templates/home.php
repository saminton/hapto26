<?php

// Template name: Home

// Data

function vl_get_data_home($id) {
	// Todo:
	// Term fields
	// Flexible content

	$data = vl_query([
		"query" => "post",
		"where" => [
			"id" => $id
		],
		"post" => [
			"title", //
			"thumbnail"
			// 'content'
		],
		"fields" => [
			//
			"gallery"
		]
	]);

	// $data['articles'] = vl_query([
	// 	'query' => 'posts', // posts | post
	// 	'where' => [
	// 		'post_type' => 'article'
	// 	],
	// 	'post' => [
	// 		'title', //
	// 		'url'
	// 	]
	// ]);

	// var_dump($data);

	return $data;
}

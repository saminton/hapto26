<?php

// Template name: Blog

function vl_get_data_blog($id) {
	$data = vl_query([
		"query" => "post",
		"where" => [
			"id" => $id
		],
		"post" => [
			"title", //
			"content"
		]
	]);

	$data["filters"] = vl_query([
		"query" => "terms",
		"where" => [
			"taxonomy" => "article_type",
			"hide_empty" => false
		],
		"term" => [
			"name", //
			"id"
		]
	]);

	$data["articles"] = vl_query([
		"query" => "posts",
		"where" => [
			"post_type" => "article"
		],
		"post" => [
			"title", //
			"content",
			"date",
			"thumbnail",
			"url"
		],
		"fields" => [
			"hero" //
		],
		"taxonomies" => [
			"article_type" => [
				"query" => "terms",
				"term" => ["id"]
			]
		]
	]);

	return $data;
}

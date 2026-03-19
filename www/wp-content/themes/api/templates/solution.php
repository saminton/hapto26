<?php

// Template name: Solution

function vl_get_data_solution($id) {
	$data = vl_query([
		"query" => "post",
		"where" => [
			"id" => $id
		],
		"post" => [
			"title", //
			"content"
		],
		"fields" => [
			"hero", //
			"demo",
			"flexible_content"
		]
	]);

	return $data;
}

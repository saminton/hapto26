<?php

// Template name: Simple

function vl_get_data_simple($id) {
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
			"paragraph" //
		]
	]);

	return $data;
}

<?php

// Template name: Privacy

function vl_get_data_privacy($id) {
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
			//
		]
	]);

	return $data;
}

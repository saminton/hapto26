<?php

// Template name: Contact

function vl_get_data_contact($id) {
	$data = vl_query([
		"query" => "post",
		"where" => [
			"id" => $id
		],
		"post" => [
			"title", //
			"content"
		],
		"fields" => ["form"]
	]);

	return $data;
}

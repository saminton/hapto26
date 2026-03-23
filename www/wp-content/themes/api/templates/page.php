<?php

// Data

function vl_get_data_page($id) {
	$data = vl_query([
		"query" => "post",
		"where" => [
			"id" => $id
		],
		"post" => [
			"id", //
			"title",
			"date",
			"author",
			"thumbnail",
			"content"
		],
		"fields" => [
			"hero", //
			"flexible_content"
		]
	]);

	if ($data["fields"]["flexible_content"]) {
		$data["fields"]["flexible_content"] = array_map(function ($item) {
			// Retreive contact form data from contact page
			if ($item["acf_fc_layout"] == "contact_form"):
				$item = array_merge(
					$item,
					vl_query([
						"query" => "post",
						"where" => [
							"id" => vl_get_page_id_from_template("contact")
						],
						"fields" => ["form"]
					])["fields"]
				);
			endif;
			return $item;
		}, $data["fields"]["flexible_content"]);
	}

	return $data;
}

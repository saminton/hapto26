<?php

function vl_extract_file_upload_data($files) {
	$ret = [];
	if ($files) {
		foreach ($files as $key => $data) {
			if (is_array($data["name"])) {
				$count = count($data["name"]);
				for ($i = 0; $i < $count; $i++) {
					if ($data["size"][$i] >= 3 * 10000000) {
						// Todo: If larger than 3MB
					} else {
						$ret[] = [
							"field" => $key,
							"name" => $data["name"][$i],
							"type" => $data["type"][$i],
							"tmp_name" => $data["tmp_name"][$i],
							"error" => $data["error"][$i],
							"size" => $data["size"][$i]
						];
					}
				}
			} else {
				if ($data["size"] >= 3 * 10000000) {
					// Todo: If larger than 3MB
				} else {
					$ret[] = [
						"field" => $key,
						"name" => $data["name"],
						"type" => $data["type"],
						"tmp_name" => $data["tmp_name"],
						"error" => $data["error"],
						"size" => $data["size"]
					];
				}
			}
		}
	}
	return $ret;
}

function vl_upload_file(
	$file,
	$path = "/test",
	$post_type = "attachment",
	$post_parent = null
) {
	error_reporting(0);
	add_filter("upload_mimes", "vl_nopriv_custom_upload_mimes");

	$attach_id = [];
	$url = [];
	$link = [];
	$title = [];
	$type = [];

	add_filter("upload_dir", function ($dirs) use ($path) {
		$dirs["subdir"] = "/";
		$dirs["path"] = $dirs["basedir"] . $path;
		$dirs["url"] = $dirs["baseurl"] . $path;
		return $dirs;
	});

	$result = wp_handle_upload($file, ["test_form" => false]);

	if (isset($result["error"])) {
		return [
			"error" => true,
			"type" => "file",
			"message" => __("Erreur pièce jointe", "theme")
		];
	}

	$attachment = [
		"guid" => $result["url"],
		"post_mime_type" => $result["type"],
		"post_title" => preg_replace('/\.[^.]+$/', "", basename($result["file"])),
		"post_content" => "",
		"post_status" => "inherit"
	];

	if ($post_parent) {
		$attachment["post_parent"] = $post_parent;
		$others = get_posts([
			"post_type" => "attachment",
			"post_parent" => $post_parent
		]);
		$attachment["menu_order"] = count($others) + 1;
	}

	$attach_id = wp_insert_attachment($attachment, $result["file"]);

	if ($post_type != "attachment") {
		wp_update_post(["ID" => $attach_id, "post_type" => $post_type]);
	}

	if ($attach_id == 0) {
		return [
			"error" => true,
			"type" => "file",
			"message" => __("Erreur pièce jointe", "theme")
		];
	}

	//$attach_id = wp_insert_attachment( $attachment, $filename, 37 );

	require_once ABSPATH . "wp-admin/includes/image.php";
	$attach_data = wp_generate_attachment_metadata($attach_id, $result["file"]);
	//print_r($attach_data);
	wp_update_attachment_metadata($attach_id, $attach_data);

	$url = $result["url"];

	if (strpos($result["type"], "image/") !== false) {
		$type = "image";
	} else {
		$type = "document";
	}

	if (isset($attach_data["sizes"]) && isset($attach_data["sizes"]["thumbnail"])) {
		$url = dirname($result["url"]) . "/" . $attach_data["sizes"]["thumbnail"]["file"];
		$link = $result["url"];
		$title = basename($link);
	} else {
		$src = wp_get_attachment_image_src($attach_id, "thumbnail", true);
		$url = $src[0];
		$link = wp_get_attachment_url($attach_id);
		$title = basename($link);
	}

	remove_filter("upload_dir", "wpse_183245_upload_dir");
	remove_filter("upload_mimes", "vl_nopriv_custom_upload_mimes");

	return [
		"id" => $attach_id,
		"url" => $url,
		"link" => $link,
		"title" => $title,
		"type" => $type,
		"error" => false
	];
}

function vl_nopriv_custom_upload_mimes($existing_mimes = []) {
	return [
		"jpg|jpeg|jpe" => "image/jpeg",
		"gif" => "image/gif",
		"png" => "image/png",
		"bmp" => "image/bmp",
		"pdf" => "application/pdf",
		"doc" => "application/msword",
		"docx" =>
			"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
		"rtf" => "image/rtf",
		"txt" => "image/txt",
		"csv" => "text/csv",
		"tsv" => "text/tab-separated-values",
		"rtx" => "text/richtext",
		"zip" => "application/zip"
	];
}

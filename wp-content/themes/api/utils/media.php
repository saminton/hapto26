<?php

/**
 * Get thumbnail metadata
 *
 * @param  mixed $id
 * @return void
 */

function vl_get_thumbnail_metadata($id = null) {
	$image_id = vl_get_thumbnail_id($id);
	if (!$image_id) {
		$image_id = get_post_thumbnail_id($id);
	}
	if (!$image_id) {
		return null;
	}

	return vl_format_image($image_id);
}

/**
 * Get thumbnail ID from post ID
 *
 * @param  mixed $id
 * @return void
 */
function vl_get_thumbnail_id($id = null) {
	if (!$id) {
		$id = get_the_ID();
	}
	// return is_tax('', $id) ? get_term_meta($id, 'thumbnail_id', true) : get_post_thumbnail_id($id);
	return is_tax("", $id)
		? get_term_meta($id, "thumbnail_id", true)
		: get_post_thumbnail_id($id);
}

/**
 * vl_format_image
 *
 * @param  mixed $id
 * @return void
 */
function vl_format_image($id) {
	$meta = wp_get_attachment_metadata($id);
	$image_data = wp_get_attachment_image_src($id, "full");

	if (!$meta) {
		return null;
	}

	$data = [
		// 'width'    => $meta['width'],
		// 'height'   => $meta['height'],
		"src" => $image_data[0],
		"type" => "image",
		"srcset" => "",
		"width" => $image_data[1],
		"height" => $image_data[2],
		"ratio" => $meta["width"] / $meta["height"],
		"caption" => wp_get_attachment_caption($id),
		"alt" => get_post_meta($id, "_wp_attachment_image_alt", true)
	];

	$sizes = get_intermediate_image_sizes($id);

	if ($sizes) {
		foreach ($sizes as $i => $size):
			$size = wp_get_attachment_image_src($id, $size);
			$data["srcset"] .= $size[0] . " " . $size[1] . "w";
			if ($i !== count($sizes)) {
				$data["srcset"] .= ", ";
			}
		endforeach;
	}

	return $data;
}

function vl_format_file($field) {
	$data = [
		"id" => $field["id"],
		"filename" => $field["filename"],
		"url" => $field["url"],
		"type" => $field["type"],
		"title" => $field["title"],
		"filesize" => $field["filesize"]
	];

	// Video
	if ($field["type"] == "video") {
		$data["width"] = $field["width"];
		$data["height"] = $field["height"];
		$data["ratio"] = $field["width"] / $field["height"];
	}

	// Image
	elseif (isset($field["sizes"])) {
		$data = array_merge($data, vl_format_image($field["ID"]));
	}

	return $data;
}

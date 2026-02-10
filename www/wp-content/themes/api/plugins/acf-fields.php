<?php

/**
 * Default ACF field group styles
 *
 * @param  mixed $field_group
 * @return void
 */
add_action("acf/validate_field_group", "change_field_group_settings", 10, 1);
function change_field_group_settings($field_group) {
	$field_group["style"] = "seamless";
	// $field_group['show_in_rest'] = 1;

	// Force hide default content editor

	if (!$field_group["hide_on_screen"]) {
		$field_group["hide_on_screen"] = ["the_content"];
	} elseif (!in_array("the_content", $field_group["hide_on_screen"])) {
		array_push($field_group["hide_on_screen"], "the_content");
	}

	return $field_group;
}

/**
 * Change ACF WYSIWYG default settings
 *
 * @param  mixed $field
 * @return void
 */
add_filter("acf/get_valid_field", "change_post_content_type");
function change_post_content_type($field) {
	$field["name"] = snake_case($field["name"]);

	// echo '<pre>' . var_dump($field) . '</pre>';
	// die();

	if ($field["type"] == "wysiwyg") {
		$field["tabs"] = "visual";
		$field["media_upload"] = 0;
	}
	if ($field["type"] == "image") {
		$field["preview_size"] = "small";
		$field["max_size"] = "2";
		$field["return_format"] = "array";
	}

	return $field;
}

/**
 * Get custom formatted ACF fields
 *
 * @param  mixed $id
 * @return void
 */
function vl_get_fields($id) {
	$fields = get_fields($id);
	$data = [];
	if ($fields) {
		foreach ($fields as $key => $field):
			$data[$key] = vl_get_field($key, $id);
		endforeach;
	}
	return $data;
}

/**
 * Custom ACF fields formatting
 *
 * @param  mixed $fields
 * @return void
 */
function vl_get_field($name, $id) {
	$field = get_field_object($name, $id);

	// Seemless clones
	if (
		isset($field["type"]) &&
		$field["type"] == "clone" &&
		$field["display"] == "seamless"
	) {
		if (count($field["value"]) == 1) {
			$clone_name = array_keys($field["value"])[0];
			return vl_format_field($field["value"][$clone_name]);
		} else {
			return vl_format_field($field["value"]);
		}
	}

	// Other fields
	return vl_format_field(get_field($name, $id));
}

function vl_format_field($field) {
	// $object = get_field_object($key, $id);
	// if ($object && $object['type'] == 'flexible_content') {
	// 	// Format flexible content data
	// 	return vl_format_flexible_content($items, $query);
	// }

	if (is_string($field)) {
		// Format hex color
		if (preg_match('/^#[a-f0-9]{6}$/i', $field)) {
			return vl_format_hex_color($field);
		}
		return $field;
	}

	if (is_object($field)) {
		$field = (array) $field;
	}

	if (!is_array($field)) {
		return $field;
	}

	if (isset($field[0]) && is_array($field[0]) && isset($field[0]["acf_fc_layout"])) {
		// Is flexible content
		return vl_format_flexible_content($field);
	}

	$data = [];

	// Format rgb color
	if (isset($field["red"]) && isset($field["green"]) && isset($field["blue"])) {
		return vl_format_rgb_color($field);
	}

	// File & images
	if (
		isset($field["mime_type"]) &&
		isset($field["filename"]) &&
		isset($field["filesize"])
	) {
		return vl_format_file($field);
	}

	// Prevent sending wordpress data to API
	if (isset($field["ID"])) {
		return $field["ID"];
	}

	// Recursive
	if (is_array($field)) {
		foreach ($field as $key => $value):
			$data[$key] = vl_format_field($value);
		endforeach;
	}

	return $data;
}

function vl_format_flexible_content($field) {
	return vl_array_map(function ($block) {
		// Set component
		$key = $block["acf_fc_layout"];
		unset($block["acf_fc_layout"]);

		// Format fields
		$block = vl_format_field($block);

		// Flatten if only child is array and name matches layout
		// Usefull for clones in flexible content
		if (
			count($block) == 1 &&
			$key == array_keys($block)[0] &&
			is_array($block[array_keys($block)[0]])
		) {
			$block = $block[array_keys($block)[0]];
		}

		// Set component
		$block["acf_fc_layout"] = $key;
		$block["component"] = kebab_case($key);
		return $block;
	}, $field);
}

function vl_flexible_content_query($items, $query) {
	return vl_array_map(function ($block) use ($query) {
		$key = $block["acf_fc_layout"];

		if (!is_array($query)) {
			// No additional data requested
			return $block;
		}

		// Request additional flexible content data
		$keys = array_filter(array_keys($query), function ($key) {
			return !is_int($key);
		});

		if (in_array($key, $keys)) {
			// For each field of flexible layout
			$block_query = $query[$key];

			// echo '<pre>';
			// var_dump($query[$key]);
			// var_dump($block);
			// echo '</pre>';
			// die();

			foreach ($block as $key => $item) {
				if (!isset($block_query[$key])) {
					// No additional data requested
					$block[$key] = $item;
				} else {
					// Request additional data
					$block[$key] = vl_post_field($item, $block_query[$key], $key);
				}
			}
		}

		return $block;
	}, $items);

	die();
}

/**
 * Make sure field names are lower case only
 */

add_filter("acf/update_field", "vl_acf_update_field", 10, 1);
function vl_acf_update_field($field) {
	$field["name"] = str_replace("-", "_", strtolower($field["name"]));
	return $field;
}

/**
 * Set default heigt for wysiwyg fields
 */

add_filter("acf-autosize/wysiwyg/min-height", function () {
	return 50;
});

add_filter("acf/load_attachment", "custom_load_attachment", 10, 3);
function custom_load_attachment($response, $attachment, $meta) {
	if ($response["type"] == "image") {
		$response["icon"] = $response["sizes"]["small"];
	}
	return $response;
}

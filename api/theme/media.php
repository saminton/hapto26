<?php
// Retirer le format medium_large

add_filter('intermediate_image_sizes', function ($sizes) {
	return array_filter($sizes, function ($val) {
		return 'medium_large' !== $val; // Filter out 'medium_large'
	});
});

add_action(
	'init',
	function () {
		add_image_size('small', 400, 0, false);
		add_image_size('medium_plus', 1280, 0, false);

		update_option('thumbnail_size_w', 150);
		update_option('thumbnail_size_h', 0);

		update_option('medium_size_w', 800);
		update_option('medium_size_h', 0);

		update_option('large_size_w', 1920);
		update_option('large_size_h', 0);
	},
	11
);

// Clean uploaded files names

add_filter(
	'sanitize_file_name',
	function ($filename) {
		$sanitized_filename = remove_accents($filename); // Convert to ASCII

		// Standard replacements
		$invalid = [
			' ' => '-',
			'%20' => '-',
			'_' => '-'
		];
		$sanitized_filename = str_replace(
			array_keys($invalid),
			array_values($invalid),
			$sanitized_filename
		);

		$sanitized_filename = preg_replace('/[^A-Za-z0-9-\. ]/', '', $sanitized_filename); // Remove all non-alphanumeric except .
		$sanitized_filename = preg_replace('/\.(?=.*\.)/', '', $sanitized_filename); // Remove all but last .
		$sanitized_filename = preg_replace('/-+/', '-', $sanitized_filename); // Replace any more than one - in a row
		$sanitized_filename = str_replace('-.', '.', $sanitized_filename); // Remove last - if at the end
		$sanitized_filename = strtolower($sanitized_filename); // Lowercase

		return $sanitized_filename;
	},
	10,
	1
);

// Allowed file type uploads

add_filter(
	'upload_mimes',
	function ($mime_types) {
		unset($mime_types['tif|tiff']); //Removing the tiff extension
		return $mime_types;
	},
	1,
	1
);

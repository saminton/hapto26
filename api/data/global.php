<?php
function vl_get_data_global() {
	global $current_user;
	global $post;
	$data = [];

	// User
	if ($current_user->ID) {
		$data["user"] = [
			"id" => $current_user->ID,
			"role" => $current_user->roles[0],
			"is_admin" => $current_user->roles[0] == "administrator",
			"name" => $current_user->display_name
		];
	} else {
		$data["user"] = null;
	}

	// Route

	$protocol = empty($_SERVER["HTTPS"]) ? "http" : "https";
	$uri = parse_url($_SERVER["REQUEST_URI"], PHP_URL_PATH);
	$base = $protocol . "://$_SERVER[HTTP_HOST]";
	$path = $base . $uri;
	$full_path = $base . $_SERVER["REQUEST_URI"];

	$data["route"] = [
		"protocol" => $protocol,
		"host" => $_SERVER["HTTP_HOST"],
		"domain" => $protocol . "://" . $_SERVER["HTTP_HOST"] . "/",
		"path" => $path,
		"full_path" => $full_path,
		"uri" => parse_url($_SERVER["REQUEST_URI"], PHP_URL_PATH),
		"params" => $_GET
	];

	$data["paths"] = [
		"assets" => $base . "/wp-content/themes/front/assets"
	];

	$data["urls"] = [
		"admin" => $_SERVER["HTTP_HOST"] . "/wp-admin",
		"edit" => $post ? admin_url("post.php?post=" . $post->ID) . "&action=edit" : null,
		"home" => vl_url(get_home_url()),
		"privacy" => vl_url(get_privacy_policy_url())
		// 'contact' => vl_url(vl_get_page_id_from_template('contact'))
	];

	// Langs

	$data["langs"] = [
		"current" => "fr",
		"available" => []
	];

	// Social links

	$data["social_links"] = vl_get_field("social", "option");

	// Polylang

	// $data['langs']['current'] = get_locale();
	// $langs = pll_languages_list(['fields' => []]);

	// if ($langs) {
	// 	foreach ($langs as $lang):
	// 		$data['langs']['available'][] = [
	// 			'slug' => $lang->slug,
	// 			'code' => $lang->locale,
	// 			'url' => pll_home_url($lang->slug),
	// 			'is_current' => $lang->locale == get_locale()
	// 		];
	// 	endforeach;
	// }

	// Weglot

	// $options = weglot_get_options();
	// $ori = $options['original_language'];
	// $curr = weglot_get_current_language();
	// $data['langs']['current'] = $curr;
	// $home = $data['route']['protocol'] . '://' . $data['route']['host'];

	// array_push($data['langs']['available'], [
	// 	'code' => $ori,
	// 	'url' => $home . '/?wg-choose-original=true',
	// 	'is_current' => $ori == $curr
	// ]);

	// foreach ($options['destination_language'] as $lang):
	// 	$code = $lang['language_to'];
	// 	array_push($data['langs']['available'], [
	// 		'code' => $code,
	// 		'url' => $home . '/' . $code . '/?wg-choose-original=false',
	// 		'is_current' => $code == $curr
	// 	]);
	// endforeach;

	return $data;
}

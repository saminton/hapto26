<?php

// vl_register_ajax("field", function ($args) {
// 	return vl_get_field($args["key"], $args["id"]);
// });

// vl_register_ajax("query", function ($args) {
// 	return vl_query($args);
// });

vl_register_ajax("token", function ($args) {
	if (!isset($_COOKIE["guest_session"])) {
		$session_id = bin2hex(random_bytes(32));

		setcookie(
			"guest_session",
			$session_id,
			time() + 3600,
			"/",
			"",
			is_ssl(),
			true // HttpOnly
		);

		$_COOKIE["guest_session"] = $session_id;
	} else {
		$session_id = $_COOKIE["guest_session"];
	}

	// Create CSRF token bound to session
	$token = hash_hmac("sha256", $session_id, wp_salt());

	wp_send_json([
		"token" => $token
	]);
});

// vl_register_ajax("page", function ($args) {
// 	return ["html" => file_get_contents($args["url"])];
// 	// return ;
// });

vl_register_ajax("component", function ($args) {
	if ($args["query"]) {
		$data = vl_query($args["query"]);
		if (isset($args["data"])) {
			$data = array_merge($data, $args["data"]);
		}
	} else {
		$data = $args["data"] ?? [];
	}
	if ($data) {
		return vl_render_twig_component($args["component"], $data);
	}
});

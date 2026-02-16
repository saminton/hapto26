<?php

vl_register_ajax("contact-form", function () {
	$args = $_POST;
	$files = vl_extract_file_upload_data($_FILES);
	$uploads = [];

	// File uploads
	if ($files) {
		foreach ($files as $file):
			$uploads[] = vl_upload_file($file);
		endforeach;
	}

	// return data
	$data = [
		"post" => $args,
		"files" => $files,
		"uploads" => $uploads,
		"error" => false
	];

	// Email filters

	$blog_name = get_bloginfo("name");
	$server_name = $_SERVER["SERVER_NAME"];
	add_filter("wp_mail_content_type", function () {
		return "text/html";
	});

	// Client mail

	// $from = "noreply@$server_name";
	// $to = $args['email'];
	// $body = vl_get_template_contents('emails/template', $args);
	// $headers = ["From: $blog_name <" . $from . ">"];

	// $sent = wp_mail(
	// 	$to, //
	// 	'Votre message',
	// 	$body,
	// 	$headers
	// );

	// $data['client'] = [
	// 	'from' => $from,
	// 	'name' => $name,
	// 	'to' => $to,
	// ];

	// if(!$sent) $data['error'] = true;

	// if ($data['error']) {
	// 	return $data;
	// }

	// Company mail

	$from = $args["email"];
	$name = $args["name"];
	$to = get_field("details_email", vl_get_page_id_from_template("contact"));
	$headers = []; //"From: $blog_name <info@" . $blog_name . ".com>"
	$body = vl_get_template_contents("emails/template", $args);

	$data["company"] = [
		"from" => $from,
		"name" => $name,
		"to" => $to,
		"body" => $body
	];

	$sent = wp_mail(
		$to, //
		"Vous avez un nouveau message",
		$body,
		$headers
	);

	if (!$sent) {
		$data["error"] = true;
	}

	return $data;
});

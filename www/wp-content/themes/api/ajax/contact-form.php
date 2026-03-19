<?php

vl_register_ajax("contact-form", function () {
	if (
		!isset($_POST["nonce"]) ||
		!wp_verify_nonce($_POST["nonce"], "contact_form_nonce")
	) {
		error_log("Message not sent: invalid nonce");
		wp_send_json_error([
			"nonce" => $_POST["nonce"],
			"message" => "Invalid request"
		]);
	}

	$ip = $_SERVER["REMOTE_ADDR"];
	// $files = vl_extract_file_upload_data($_FILES);
	// $uploads = [];

	// Return data
	$data = [
		"message" => ""
	];

	// Form fields
	$fields = [
		"company" => sanitize_text_field($_POST["company"] ?? ""),
		"lastname" => sanitize_text_field($_POST["lastname"] ?? ""),
		"firstname" => sanitize_text_field($_POST["firstname"] ?? ""),
		"phone" => sanitize_text_field($_POST["phone"] ?? ""),
		"email" => sanitize_email($_POST["email"] ?? ""),
		"message" => sanitize_textarea_field($_POST["message"] ?? ""),
		"birthdate" => sanitize_text_field($_POST["birthdate"] ?? "") // Honeypot spam check (fake field)
	];

	// Field checks
	// Valid email
	if (!is_email($fields["email"]) || preg_match("/[\r\n]/", $fields["email"])) {
		$data["message"] = "Email invalide";
		wp_send_json_error($data);
	}
	// Valid email
	if (strlen($fields["message"]) > 5000) {
		$data["message"] = "Message trop long";
		error_log("Message not sent: too long");
		wp_send_json_error($data);
	}

	// Honeypot spam check (set to a hidden field with plausible name)
	if (!empty($fields["birthdate"])) {
		$data["message"] = "Spam detected";
		error_log("Spam detected from IP: " . $ip);
		wp_send_json_error($data);
	}

	// Limit send frequency
	$transient_key = "contact_form_" . md5($ip);
	if (get_transient($transient_key)) {
		$data["message"] = "Veuillez patienter avant de renvoyer.";
		error_log("Rate limit triggered for IP: " . $ip);
		wp_send_json_error($data);
	}
	set_transient($transient_key, true, 10);

	// File uploads
	// if ($files) {
	// 	foreach ($files as $file):
	// 		$uploads[] = vl_upload_file($file);
	// 	endforeach;
	// }

	// Email filters

	$blog_name = get_bloginfo("name");
	$server_name = parse_url(home_url(), PHP_URL_HOST);
	add_filter("wp_mail_content_type", function () {
		return "text/html";
	});

	// Email sent to host

	$from = $fields["email"];
	$to = get_field("form_email", vl_get_page_id_from_template("contact"));
	$subject = "Vous avez un nouveau message";
	$headers = ["From: $blog_name <info@$server_name>"];
	$body = vl_get_template_contents("emails/template", $fields);

	$data["host"] = [
		"from" => $from,
		"to" => $to,
		"subject" => $subject,
		"body" => $body
	];

	$sent = wp_mail(
		$to, //
		$subject,
		$body,
		$headers
	);

	if (!$sent) {
		$data["message"] = "Une erreur est survenue lors de l’envoi du message.";
		wp_send_json_error($data);
	}

	error_log("Message sent from $from to $to");

	// Email sent to client

	$from = "noreply@$server_name";
	$to = $fields["email"];
	$subject = "Votre message";
	$headers = ["From: $blog_name <" . $from . ">"];
	$body = vl_get_template_contents("emails/template", $fields);

	$data["client"] = [
		"from" => $from,
		"to" => $to,
		"subject" => $subject,
		"body" => $body
	];

	$sent = wp_mail(
		$to, //
		$subject,
		$body,
		$headers
	);

	if (!$sent) {
		$data["message"] = "Une erreur est survenue lors de l’envoi du message.";
		wp_send_json_error($data);
	}

	error_log("Message sent from $from to $to");

	remove_filter("wp_mail_content_type", "set_html_content_type");
	$data["message"] = "Message envoyé";
	// wp_send_json_success($data); // Debug purposes only
	wp_send_json_success(["message" => "Message envoyé"]);
});

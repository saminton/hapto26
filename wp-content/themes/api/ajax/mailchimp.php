<?php

// global $api_client;
// $fields = get_field('api_keys', 'option');

// $api_client = new MailchimpMarketing\ApiClient();
// $api_client->setConfig([
// 	'apiKey' => $fields['mailchimp'],
// 	'server' => substr($fields['mailchimp'], strpos($fields['mailchimp'], '-') + 1)
// ]);

// vl_register_ajax('add_mailchimp_subscriber', function ($args) {
// 	global $api_client;
// 	$fields = get_field('api_keys', 'option');

// 	$email = $_POST['billing_email'] ?? ($args['email'] ?? $_POST['email']);
// 	$subscriber_hash = md5(strtolower($email));

// 	// Custom field data required by mailchimp
// 	$schema = (object) [];

// 	$data = [
// 		"email_address" => $email,
// 		"status_if_new" => 'subscribed',
// 		"merge_fields" => $schema
// 	];

// 	try {
// 		return $api_client->lists->setListMember(
// 			$fields['mailchimp_mailing_list_id'],
// 			$subscriber_hash,
// 			$data
// 		);
// 	} catch (\Throwable $th) {
// 		return $th
// 			->getResponse()
// 			->getBody()
// 			->getContents();
// 	}
// });

<?php

function vl_register_ajax($name, $callback) {
	add_action('wp_ajax_' . $name, function () use ($callback) {
		$ajax = file_get_contents('php://input');
		$args = json_decode($ajax, true);
		die(json_encode($callback($args)));
	});
	add_action('wp_ajax_nopriv_' . $name, function () use ($callback) {
		$ajax = file_get_contents('php://input');
		$args = json_decode($ajax, true);
		die(json_encode($callback($args)));
	});
}

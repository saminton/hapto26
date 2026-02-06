<?php

vl_register_route('{{kebabCase name}}', 'GET', function ($req) {
	$data = [];
	$args = $req->get_params();

	return $data;
});

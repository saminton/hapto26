<?php

// Template name: {{pascalCase name}}

function vl_get_data_{{snakeCase name}}($id){
	$data = vl_query([
		'query' => 'post',
		'where' => [
			'id' => $id
		],
		'post' => [
			'title', //
			'content'
		],
		'fields' => [
			//
		]
	]);

	return $data;
	
}
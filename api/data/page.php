<?php

// Data

function vl_get_data_page($id) {
	$data = vl_query([
		'query' => 'post',
		'where' => [
			'id' => $id
		],
		'post' => [
			'id', //
			'title',
			'date',
			'author',
			'thumbnail',
			'content'
		],
		'fields' => [
			'image' //
		]
	]);

	return $data;
}

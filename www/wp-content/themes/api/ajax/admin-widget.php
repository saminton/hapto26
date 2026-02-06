<?php

vl_register_ajax('admin-widget', function ($args) {
	$post_id = url_to_postid($args['url']);
	return [
		'edit' => $post_id
			? admin_url('post.php?post=' . $post_id) . '&action=edit'
			: null
	];
});

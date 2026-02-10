<?php

// https://developer.wordpress.org/reference/hooks/wp_head/
// https://v3.nuxtjs.org/guide/features/head-management/

// function vl_head() {

// 	$data = [];
// 	$data['title'] = wp_get_document_title();
// 	$data['viewport'] = 'width=device-width, initial-scale=1, maximum-scale=1';
// 	$data['charset'] = 'utf-8';
// 	$data['meta'] = [];
// 	$data['meta'][] = ['name' => '', 'content' => '']; // meta example

// 	// Robots
// 	if(get_option('blog_public')) $data['meta'][] = ['name' => '', 'content' => ''];

// 	return $data;

// }

// Remove admin bar

add_action("after_setup_theme", function () {
	show_admin_bar(false);
});

// Disable XML-RPC

add_filter("xmlrpc_enabled", function (): bool {
	return false;
});

// Remove XML-RPC link from <head>

remove_action("wp_head", "rsd_link");
remove_action("wp_head", "wlwmanifest_link");
remove_action("wp_head", "wp_generator");
remove_action("wp_head", "rest_output_link_wp_head");
remove_action("wp_head", "print_emoji_detection_script", 7);
remove_action("wp_print_styles", "print_emoji_styles");
remove_action("wp_head", "feed_links", 2);
remove_action("wp_head", "wp_shortlink_wp_head");
remove_action("wp_body_open", "wp_global_styles_render_svg_filters");
remove_action("wp_head", "wp_generator");

// Alter dns-prefetch links in <head>

add_filter(
	"wp_resource_hints",
	function (array $urls, string $relation): array {
		// If the relation is different than dns-prefetch, leave the URLs intact
		if ($relation !== "dns-prefetch") {
			return $urls;
		}

		// Remove s.w.org entry
		$urls = array_filter($urls, function (string $url): bool {
			return strpos($url, "s.w.org") === false;
		});

		// List of domains to prefetch:
		$dnsPrefetchUrls = [];
		return array_merge($urls, $dnsPrefetchUrls);
	},
	10,
	2
);

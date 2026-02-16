<?php

global $head;
global $foot;

add_filter("use_block_editor_for_post", "__return_false");

// Capture outgoing header and footer content
// and extract links, styles & scripts

function vl_extract_styles_and_scripts($html) {
	$enqueues = [];
	preg_match_all(
		'/<(\w+)(\s[^>]*?)?>(.*?)<\/\1>|<(\w+)(\s[^>]*?)?\/?>/s',
		$html,
		$tag_match
	);

	if ($tag_match) {
		foreach ($tag_match[0] as $html):
			preg_match('/id=["\']([^"\']*)["\']/', $html, $id_match);
			preg_match("/<([^ ]+)/", $html, $tag_match);
			// Remove id attributes
			$html = preg_replace(
				'/\s*(id|class)\s*=\s*("[^"]*"|\'[^\']*\')/i',
				"",
				$html
			);
			$enqueues[] = [
				"tag" => $tag_match[1],
				"id" => $id_match ? $id_match[1] : null,
				"html" => $html
			];
		endforeach;
	}

	// echo '<pre>';
	// var_dump($enqueues);
	// echo '</pre>';
	// die();

	return $enqueues;
}

add_action(
	"wp_head",
	function () {
		ob_start();
	},
	0
);

add_action(
	"wp_head",
	function () {
		global $head;
		$head["html"] = ob_get_clean();
		$head["enqueues"] = vl_extract_styles_and_scripts($head["html"]);
	},
	PHP_INT_MAX
); //PHP_INT_MAX will ensure this action is called after all other actions that can modify head

// Remove all tags from footer and store in variable

add_action(
	"wp_footer",
	function () {
		ob_start();
	},
	0
);

add_action(
	"wp_footer",
	function () {
		global $head;
		$foot["html"] = ob_get_clean();
		$foot["enqueues"] = vl_extract_styles_and_scripts($head["html"]);
	},
	PHP_INT_MAX
); //PHP_INT_MAX will ensure this action is called after all other actions that can modify head

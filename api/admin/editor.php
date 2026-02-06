<?php

// Toolbars

add_filter('acf/fields/wysiwyg/toolbars', 'vl_acf_toolbars');
function vl_acf_toolbars($toolbars) {
	// Uncomment to view format of $toolbars
	$base1 = [
		'formatselect',
		'bold',
		'italic',
		'underline',
		'bullist',
		'numlist',
		'blockquote',
		'alignleft',
		'aligncenter',
		'alignright',
		'link',
		'superscript',
		'subscript',
		'spellchecker',
		'wp_more', // add read more
		'fullscreen',
		'wp_adv' // add $base2
	];
	$base2 = [
		'strikethrough',
		'hr',
		'forecolor',
		'pastetext',
		'removeformat',
		'charmap',
		'outdent',
		'indent',
		'undo',
		'redo',
		'wp_help'
	];
	// VERY SIMPLE
	$toolbars['Very Simple'] = [];
	$toolbars['Very Simple'][1] = [
		'bold',
		'italic',
		'underline',
		'link'
		// 'surrounded',
		// 'underlined',
	];
	// BASIC
	$toolbars['Basic'] = [];
	$toolbars['Basic'][1] = [
		// 'formatselect',
		// 'styleselect',
		'bold',
		'italic',
		'underline',
		'link',
		'forecolor',
		'bullist',
		'numlist'
	];
	// FULL
	$toolbars['Full'] = [];
	$toolbars['Full'][1] = [
		// 'formatselect',
		'styleselect',
		'bold',
		'italic',
		'underline',
		'link',
		'forecolor',
		'bullist',
		'numlist'
	];
	return $toolbars;
}

function vl_acf_toolbar_colors($init) {
	$custom_colours = '
		"00CEC1", "Aqua",
	';
	// build colour grid default+custom colors
	$init['textcolor_map'] = '[' . $custom_colours . ']';
	// change the number of rows in the grid if the number of colors changes
	// 8 swatches per row
	$init['textcolor_rows'] = 1;
	return $init;
}
add_filter('tiny_mce_before_init', 'vl_acf_toolbar_colors');

function vl_mce_mod($init) {
	// $init['block_formats'] = "Paragraph=p; Heading 2=h2; Heading 3=h3; Heading 4=h4; Smaller=h5";

	$style_formats = [
		[
			'title' => 'Heading 2',
			'block' => 'h2',
			'wrapper' => false
		],
		[
			'title' => 'Heading 3',
			'block' => 'h3',
			'wrapper' => false
		],
		[
			'title' => 'Heading 4',
			'block' => 'h4',
			'wrapper' => false
		]
		// array(
		// 	'title' => 'Small',
		// 	'block' => 'small',
		// 	'wrapper' => false,
		// ),
	];
	$init['style_formats'] = json_encode($style_formats);
	return $init;
}
add_filter('tiny_mce_before_init', 'vl_mce_mod');

function vl_tiny_mce_tweaks($first_init) {
	$first_init['formats'] =
		'{' .
		'alignleft: [' .
		'{selector: "p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li", styles: {textAlign:"left"}},' .
		'{selector: "img,table,dl.wp-caption", classes: "alignleft"}' .
		'],' .
		'aligncenter: [' .
		'{selector: "p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li", styles: {textAlign:"center"}},' .
		'{selector: "img,table,dl.wp-caption", classes: "aligncenter"}' .
		'],' .
		'alignright: [' .
		'{selector: "p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li", styles: {textAlign:"right"}},' .
		'{selector: "img,table,dl.wp-caption", classes: "alignright"}' .
		'],' .
		'strikethrough: {inline: "del"},' .
		'underline: {inline: "u"}' .
		'}';

	return $first_init;
}
add_filter('tiny_mce_before_init', 'vl_tiny_mce_tweaks');

// Paste

add_filter('tiny_mce_before_init', 'ag_tinymce_paste_as_text');
function ag_tinymce_paste_as_text($init) {
	$init['paste_as_text'] = true;
	return $init;
}

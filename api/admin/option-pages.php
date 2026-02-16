<?php
// ACF option pages

if (function_exists("acf_add_options_sub_page")) {
	add_action("acf/init", function () {
		vl_option_page("Footer", "Footer", "dashicons-editor-table", 21);

		vl_option_page("404", "404", "dashicons-sos", 20);
		vl_sub_option_page("404", "404");

		// vl_option_page('Blocks', 'Newsletter', 'dashicons-schedule', 25);
		// vl_sub_option_page('Blocks', 'Age Gate');

		vl_option_page("Divers", "Cookies", "dashicons-info-outline", 22);
		vl_sub_option_page("Divers", "Réseaux sociaux");
		vl_sub_option_page("Divers", "API");
	});
}

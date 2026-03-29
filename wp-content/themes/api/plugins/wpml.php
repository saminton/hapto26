<?php

if (function_exists("icl_object_id")) {
	function vl_get_langs() {
		$langs = [];
		$items = apply_filters(
			"wpml_active_languages",
			null,
			"orderby=id&order=desc&skip_missing=0"
		);

		if ($items) {
			foreach ($items as $item):
				$url = apply_filters("wpml_permalink", get_home_url(), $item["code"]); // redirect to home
				$langs[] = [
					"code" => $item["code"],
					"name" => $item["native_name"],
					"url" => $url,
					"is_current" => $item["code"] == ICL_LANGUAGE_CODE
				];
			endforeach;
		}

		return $langs;
	}
}

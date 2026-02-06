<?php

use Twig\TwigFunction;

$twig->addFunction(
	new TwigFunction(
		"attr",
		function ($name, $value, $default = null) {
			if ($value === true) {
				return $name;
			}
			if ($value === false) {
				return '';
			}
			if ($value === null) {
				return '';
			}
			if ($value === '') {
				$value = $default;
			}
			return "$name='$value'";
		},
		['is_safe' => ['html']]
	)
);

$twig->addFunction(
	new TwigFunction("data", function ($data) {
		$str = '';

		if ($data) {
			foreach ($data as $key => $value):
				$str .= 'data-' . $key;
				if ($value !== null) {
					$str .= '=' . $value . ' ';
				} else {
					$str .= ' ';
				}
			endforeach;
		}
		return $str;
	})
);

$twig->addFunction(
	new TwigFunction(
		"merge",
		function (...$items) {
			if (!$items) {
				return [];
			}
			$result = [];
			foreach ($items as $item):
				if ($item) {
					$result = array_merge($result, $item);
				}
			endforeach;
			return $result;
		},
		['is_safe' => ['html']]
	)
);

$twig->addFunction(
	new TwigFunction(
		"style",
		function ($styles) {
			if ($styles) {
				$str = '';
				foreach ($styles as $key => $value) {
					if ($value) {
						$str .= "$key: $value;";
					}
				}
				return 'style="' . $str . '"';
			} else {
				return false;
			}
		},
		['is_safe' => ['html']]
	)
);

$twig->addFunction(
	new TwigFunction(
		"asset",
		function ($path = "") {
			return get_bloginfo('template_url') . '/../front/assets/' . $path;
		},
		['is_safe' => ['html']]
	)
);

$twig->addFunction(
	new TwigFunction(
		"svg",
		function ($path, $class = '') {
			$path = $_SERVER["DOCUMENT_ROOT"] . '/wp-content/themes/front/' . $path;

			if (!file_exists($path)) {
				return;
			}
			$svg = file_get_contents($path);
			$svg = preg_replace('/<\?xml[^>]+\/>/im', '', $svg); // remove xml tags
			$svg = preg_replace('#\s(id|class)="[^"]+"#', '', $svg); // remove class and id
			$svg = str_replace('<svg', '<svg class="' . $class . '"', $svg); // add class

			return $svg;
		},
		['is_safe' => ['html']]
	)
);

$twig->addFunction(new TwigFunction("do_action", "do_action", ['is_safe' => ['html']]));

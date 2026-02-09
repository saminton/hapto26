<?php

use Twig\TwigFilter;

$twig->addFilter(
	new TwigFilter("merge", function (...$items) {
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
	})
);

$twig->addFilter(
	new TwigFilter("truncate", function (string $str, int $length) {
		if (strlen($str) > $length) {
			return substr($str, 0, strpos(wordwrap($str, $length), "\n")) . '...';
		} else {
			return $str;
		}
	})
);

$twig->addFilter(
	new TwigFilter("slugify", function ($str) {
		return kebab_case(remove_accents($str));
	})
);

$twig->addFilter(
	new TwigFilter("pad", function ($str, $length = 1, $text = '0') {
		return str_pad($str, $length, $text, STR_PAD_LEFT);
	})
);

$twig->addFilter(
	new TwigFilter("bool", function ($value) {
		return $value ? 'true' : 'false';
	})
);

$twig->addFilter(
	new TwigFilter(
		"translate",
		function (?string $str): string {
			if (function_exists('icl_object_id')) {
				$var = snake_case($str);
				icl_register_string('theme', $var, $str);
				return icl_t('theme', $var, $str);
			} else {
				return $str;
			}

			// // Check if translation is already added

			// global $api_path;
			// $file = $api_path . '/theme/translations.php';
			// $append = '__("' . $str . '", "theme");' . "\n";

			// $handle = fopen($file, 'r');

			// $found = false; // init as false
			// while (($buffer = fgets($handle)) !== false) {
			// 	if (strpos($buffer, $append) !== false) {
			// 		$found = true;
			// 		break; // Once you find the string, you should break out the loop.
			// 	}
			// }
			// fclose($handle);

			// // If not add new translation
			// if (!$found) {
			// 	file_put_contents($file, $append, FILE_APPEND | LOCK_EX);
			// }

			// return __($str, 'theme');
		},
		['is_safe' => ['html']]
	)
);

$twig->addFilter(
	new TwigFilter(
		"upload",
		function (string $string): string {
			$name = getenv('NAME');
			$uploads = getenv('UPLOADS');
			if (!$uploads) {
				return $string;
			}
			$url = str_replace("http://$name.localhost/", $uploads, $string);
			return $url;
		},
		['is_safe' => ['html']]
	)
);

$twig->addFilter(
	new TwigFilter(
		"autop",
		function (?string $str): string {
			$str = trim(wpautop($str));
			return $str;
		},
		['is_safe' => ['html']]
	)
);

$twig->addFilter(
	new TwigFilter(
		"strip",
		function (?string $str): string {
			$str = htmlentities($str, 0, 'utf-8');
			$str = str_replace("&nbsp;", " ", $str);
			$str = html_entity_decode($str);

			$str = trim(wpautop($str));
			$str = str_replace('<p>', '', $str);
			$str = str_replace('</p>', '<br/>', $str);
			if (substr($str, -strlen('<br/>')) === '<br/>') {
				$str = substr_replace($str, "", -strlen('<br/>'));
			}
			return $str;
		},
		['is_safe' => ['html']]
	)
);

$twig->addFilter(
	new TwigFilter("strpad", function (
		string $str,
		int $length,
		string $pad_string = " "
	): string {
		return str_pad($str, $length, $pad_string, STR_PAD_LEFT);
	})
);

$twig->addFilter(
	new TwigFilter(
		"youtube_id",
		function (?string $str): string {
			// $string_test = "https://www.youtube.com/watch?v=jfKfPfyJRdk";
			$str = substr($str, strpos($str, '=') + 1);
			return $str;
		},
		['is_safe' => ['html']]
	)
);

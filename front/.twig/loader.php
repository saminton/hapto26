<?php

namespace Twig\Loader;

// use Twig\Loader\FilesystemLoader;
// use Twig\NodeVisitor\AbstractNodeVisitor;
// use Twig\Environment;
// use Twig\Node\Node;
use Twig\Source;

class CustomFileLoader extends \Twig\Loader\FilesystemLoader {
	protected function findTemplate(string $path, bool $throw = true) {
		if (!str_contains($path, ".")) {
			$part = explode("/", $path)[1];
			if (str_contains($path, "core/")) {
				$path = $path . ".twig";
			} else {
				$path = $path . "/" . $part . ".twig";
			}
		}
		return parent::findTemplate($path, $throw);
	}

	public function getSourceContext(string $name): Source {
		if (null === ($path = $this->findTemplate($name))) {
			return new Source("", $name, "");
		}

		$filename = str_replace(".twig", "", basename($name));

		$html = file_get_contents($path);
		if (!str_contains($path, "/plugins")) {
			$html = $this->scope('/class="([^"]+)"/', $html, $filename);
			$html = $this->scope('/class: \'([^\']+)\'/', $html, $filename);
		}

		return new Source($html, $name, $path);
	}

	protected function scope($pattern, $html, $name) {
		// $test = 'class="one {{ two ~ \'three\' }} one-four six {{ seven }}"';
		// $pattern = '/class="([^"]+)"/';
		// $pattern = '/class="([^"]+)"|class: \'([^\']+)\'/';
		// Edges cases
		// class="one one-two" -> "one" will be replaced twice
		// class: 'one' ~ two ~ 'three' -> "three" will not be replaced

		// Use preg_replace_callback to modify the matched groups
		$html = preg_replace_callback(
			$pattern,
			function ($matches) use ($name) {
				$name = snake_case($name);
				// Split by "{{" "}}"
				$replace = preg_split("/(?:{{[^{}]*}})/", $matches[1]);

				// Trim spaces
				$source = array_map(function ($string) {
					return trim($string);
				}, $replace);

				// Map groups
				$replace = array_map(function ($string) use ($name) {
					// Create hash from class
					$uid = substr(hash("md5", $name), 0, 4);
					// Explode and rejoin
					return join(
						" ",
						array_map(function ($string) use ($name, $uid) {
							// Prefix with filename
							return $string . "-" . $uid;
							// if ($string == '' || $string == $name) {
							// 	return $string . '-' . $uid;
							// }
							// return $name . '-' . $string . '-' . $uid;
						}, explode(" ", $string))
					);
				}, $source);

				// Replace occurences
				$output = str_replace($source, $replace, $matches[0]);
				return $output;
			},
			$html
		);

		return $html;
	}
}

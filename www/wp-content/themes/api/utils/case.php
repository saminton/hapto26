<?php

function snake_case($string) {
	return mb_strtolower(
		preg_replace(
			'/[-]|[ ]|[__]/',
			'_',
			preg_replace('/(.)(?=[A-Z])/', '_$2', $string)
		),
		'UTF-8'
	);
}

function kebab_case($string) {
	return mb_strtolower(
		preg_replace(
			'/[_]|[ ]|[--]/',
			'-',
			str_replace('/(.)(?=[A-Z])/', '-$2', $string)
		),
		'UTF-8'
	);
}

function pascal_case($string) {
	return str_replace(
		' ',
		'',
		ucwords(preg_replace('/[^a-z0-9' . implode('', []) . ']+/', ' ', $string))
	);
}

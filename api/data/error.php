<?php

// Data

function vl_get_data_error($id) {
	$data = get_field("error", "option");

	return $data;
}

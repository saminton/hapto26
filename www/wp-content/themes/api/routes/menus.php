<?php

// Get menu from name

vl_register_route('menu', 'GET', function ($args) {
	return vl_get_menu_by_name($args['name']);
});

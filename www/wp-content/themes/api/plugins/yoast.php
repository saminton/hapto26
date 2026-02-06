<?php

/**
 * Move Yoast Meta Box to bottom
 *
 * @return void
 */
add_filter('wpseo_metabox_prio', 'vl_yoast_order');
function vl_yoast_order() {
	return 'low';
}

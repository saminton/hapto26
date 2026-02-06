<?php
$args = with_defaults($args, [
	'name' => ''
]); ?>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">

<html xmlns="http://www.w3.org/1999/xhtml">
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
	<title></title>
	<?php vl_template('emails/styles'); ?>
	<style type="text/css">
		
	</style>
</head>
<body>
	
	<table cellpadding="0" cellspacing="0" class="flux"><tr><td><table>
		<tr>
			<p>Hello <?= $args['name'] ?></p>
		</tr>
	</table></td></tr></table>
	
</body>
</html>


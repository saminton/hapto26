<?php
// Defaults

$defaults = [];
$data = wp_parse_args($args, $defaults);

// Data

$fields = [
	'Prénom' => $data['firstname'],
	'Nom de famille' => $data['lastname'],
	'Email' => $data['email'],
	'Message' => $data['message']
];
?>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">

<html xmlns="http://www.w3.org/1999/xhtml">
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
	<title></title>
	<?php vl_get_template_contents('emails/styles'); ?>
	<style type="text/css">
		
	</style>
</head>
<body>

<table cellpadding="0" cellspacing="0">
	<tr>
		<td>
			<table class="table">
				<?php foreach ($fields as $key => $value): ?>
					<tr>
						<td><b><?= $key ?></b></td>
						<td><?= $value ?></td>
					</tr>
				<?php endforeach; ?>
			</table>
		</td>
	</tr>
</table>
</body>
</html>


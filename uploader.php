<?php 

/*
* Example file for accessing the uploader class.
*/

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

var_dump($_POST);
var_dump($_FILES);

$logged_in = true;


if ($logged_in) {
	require('classes/uploader.class.php');
	$imgUploader = new imgUploader();
	$imgUploader->setData($_FILES, $_POST);	
}


?>
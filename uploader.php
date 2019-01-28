<?php

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

echo "POST, ";
var_dump($_POST);

echo "FILES, ";

$_FILES['uploaderimg']['name'] = $_POST['filename'];

var_dump($_FILES);

echo 'response';
?>
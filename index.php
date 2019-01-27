<!DOCTYPE html>
<html>
<head>
	<title>PHP and JS Upload</title>
	<link rel="stylesheet" type="text/css" href="css/uploader.css">
	<script src="js/jquery-3.1.1.js"></script>
	<script src="js/uploader.js"></script>
</head>
<body>

<h1>PHP/JS uploader</h1>

<form method="post" action="" id="uploadform" enctype="multipart/form-data">
<div id="dropzone"></div>

<input type="file" name="userimg" id="userimg">
<input type="submit" id="btnupload" name="btnupload" value="Upload Image">

<input type="text" name="filename" id="filename" value="test string">

</form>
<a href=".">reset</a>

<div id="status"></div>

</body>
</html>
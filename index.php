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

<form method="post" action="" id="uploaderform" enctype="multipart/form-data">
<div id="dropzone"></div>

<label for="uploaderimg" id="uploaderlbl" class="uploaderbtn">Select Image</label>
<input type="file" name="uploaderimg" id="uploaderimg">
<input type="submit" name="uploadersubmit" id="uploadersubmit" value="Upload Image" class="uploaderbtn">
<button id="uploaderreset" class="uploaderbtn">Reset</button>

</form>
<a href=".">reload</a>

<div id="status"></div>

</body>
</html>
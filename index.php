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
	<div id="dropzone">
		<div id="imgmain">
			<div id="imgwrap">
				<img id="image" src="">
				<input type="text" id="filename" name=""filename" value="">
				<p id="size">Size: <span></span></p>
				<p id="width">Width: <span></span></p>
				<p id="height">Height: <span></span></p>
				<button id="btnthumbedit" class="btndefault">Edit Thumbnail</button>
			</div>
			<div id="thumb">
				<div><img id="thumbimg" src=""></div>
				<select id="thumbpos">
					<option value="center" selected>Center</option>
					<option value="top">Top</option>
					<option value="bottom">Bottom</option>
					<option value="left">Left</option>
					<option value="right">Right</option>
				</select>
				<button id="btnimgback" class="btndefault">Back to Image</button>
			</div>
		</div>
	</div>

<label for="uploaderimg" id="uploaderlbl"  class="btndefault">Select Image</label>
<input type="file" name="uploaderimg" id="uploaderimg">
<input type="submit" name="uploadersubmit" id="uploadersubmit" value="Upload Image"  class="btndefault">
<button id="uploaderreset" class="btndefault">Reset</button>

</form>

<a href="." class="btndefault">reload</a>

</body>
</html>
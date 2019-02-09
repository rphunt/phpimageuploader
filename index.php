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
			<div id="imgspec">
				<section>
					<div class="imgwrap"><img id="image" src=""></div>
					<label for="filename">File Name:</label>
					<input type="text" id="filename" name="filename" value="">
					<label for="imgscalelimit">Rescaling Limit:</label>
					<input type="text" id="imgscalelimit" name="imgscalelimit" value="800">
					<p id="size">Size: <span></span></p>
					<p id="width">Width: <span></span></p>
					<p id="height">Height: <span></span></p>
					<button id="btnthumbedit" class="btndefault">Edit Thumbnail</button>
				</section>
			</div>
			<div id="thumbspec">
				<section>
					<div class="imgwrap"><img id="thumbimg" src=""></div>
					<label for="thumbsize">Thumb Size:</label>
					<input type="text" name="thumbsize" id="thumbsize" value="300">
					<div>
						<select id="thumbpos" name="thumbpos">
							<option value="center" selected>Center</option>
							<option value="top">Top</option>
							<option value="bottom">Bottom</option>
							<option value="left">Left</option>
							<option value="right">Right</option>
						</select>
					</div>
					<button id="btnimgback" class="btndefault">Back to Image</button>
				</section>
			</div>
		</div>
		<div id="respmsg"></div>
	</div>

<label for="uploaderimg" id="uploaderlbl"  class="btndefault">Select Image</label>
<input type="file" name="uploaderimg" id="uploaderimg">
<input type="submit" name="uploadersubmit" id="uploadersubmit" value="Upload Image"  class="btndefault">
<button id="uploaderreset" class="btndefault">Reset</button>

</form>

<a href="." class="btndefault">reload</a>

</body>
</html>
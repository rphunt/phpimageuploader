<?php

class imgUploader {

	/* Set variables. */

	private $imgUploadDir = 'uploads/'; //where images will be saved
	private $uploadField = 'uploaderimg'; //upload form input field name
	private $files = null; //temporary storage for $_FILES global
	private $imgLoaded = null; //properties of the uploaded image
	private $imgMax = 2000000; //largest file size allowed
	private $imgTypes = array('jpg', 'jpeg', 'png', 'gif'); //file extensions allowed 
	private $imgMime = array('image/jpg', 'image/jpeg', 'image/png', 'image/gif'); //file mime types allowed
	private $imgTmp = ''; // temp image for resizing and cropping
	private $imgPath = ''; //file path information
	private $errors = ''; //errors message to be displayed
	private $msgs = ''; // messages to be displayed
	private $phpFileUploadErrors = array( //file upload errors captions
	    0 => 'The file uploaded successfully',
	    1 => 'The uploaded file exceeds the upload_max_filesize directive in php.ini',
	    2 => 'The uploaded file exceeds the MAX_FILE_SIZE directive that was specified in the HTML form',
	    3 => 'The uploaded file was only partially uploaded',
	    4 => 'No file was uploaded',
	    6 => 'Missing a temporary folder',
	    7 => 'Failed to write file to disk.',
	    8 => 'A PHP extension stopped the file upload.',
	);
	private $postVals = array( // posted values to load into local araray
			'filename' => '',
			'overwrite' => '',
			'cropx' => 0,
			'cropy' => 0,
			'thumbdim' => 0
		);


	public function __construct() {

	}

	/* Functions */

	public function setData($files=null, $posts=null) {
		/* accept $_FILES and $_POST and run methods */

		$this->files = $files;
		$this->posts = $posts;

		$this->checkPosts();
		$this->checkUpload();
		$this->checkUploadFolder();
		$this->checkFileTypes();
		$this->checkFileSize();
		$this->checkFileErrors();
		$this->checkExistingFile();
		$this->imgSave();
		$this->tempImage();
		$this->imageResizing();
		$this->makeThumb();	
	} 

	private function checkPosts() {

		foreach ($this->postVals as $postKey => $postVal) {
			if (isset($_POST[$postKey]) && (trim($_POST[$postKey])!='')) {
				$this->postVals[$postKey] = $_POST[$postKey];
			}
		}
	}

	private function checkUpload() {
		/* Check if this page was accessed by a specific file upload.
		* Check if the name value is where it should be.
		* Check if posted filename  exists, use that name instead.
		*/
		if (!isset($this->files['uploaderimg'])) {
			$this->set_error('Ths page was accessed incorrectly.');
			$this->show_error(true);
		} else if (!isset($this->files[$this->uploadField]['name'])) {
			$this->set_error('Upload is incorrectly formatted. Note, only one file is accepted at a time.');
			$this->show_error(true);
		} else {
			$this->imgLoaded = $this->files['uploaderimg'];
			
			if($this->postVals['filename']!='') {
				$this->imgLoaded['name'] = $this->postVals['filename'];
			}
		}
	}


	private function checkFileTypes() {
		/* Check the file extensions and the mime types. */
		$this->imgPath = pathinfo($this->imgLoaded['name']);
		$imgExt =  strtolower($this->imgPath['extension']);
		$imgType = strtolower($this->imgLoaded['type']);

		if (!in_array($imgExt, $this->imgTypes)) {
			$this->set_error("Please select an image of the type JPG, JPEG, GIF, or PNG.");
			$this->show_error(true);
		}

		if (!in_array($imgType, $this->imgMime)) {
			$this->set_error("Please select an image of the type JPG, JPEG, GIF, or PNG.");
			$this->show_error(true);
		}

		return true;
	}

	private function checkUploadFolder() {
		/* Check if the destiination folder exists, create it if not. */
		if (!file_exists($this->imgUploadDir)) {
			if (!mkdir($this->imgUploadDir )) {
				$this->set_error("Could not create upload folder.");
				$this->show_error(true);
			}
		}
	}

	private function checkFileErrors() {
		/* Check for file upload errors */
		if ($this->imgLoaded['error']>0) {
			$this->set_error($this->phpFileUploadErrors[$this->imgLoaded['error']]);
			$this->show_error(true);
		}
	}

	private function checkFileSize() {
		/* Check for excessive file size. */
		if ($this->imgLoaded['size']>$this->imgMax) {
			$this->set_error("The maximum file size allowed is ".$this->imgMax.".");
			$this->show_error(true);
		}
	}

	private function checkExistingFile() {
		/* Check if file already exists. */
		
		if ($this->postVals['overwrite']=='true') {
			$this->set_msg('Overwriting.'); // testing - delete later.
			$this->show_msg();
		} else if (file_exists($this->imgUploadDir.$this->imgLoaded['name'])) {
			$this->set_error('<strong>'.$this->imgUploadDir.$this->imgLoaded['name']."</strong><br>file already exists. Overwrite?");
			$this->show_error(true);
		}
	}

	/* Set error text, if there already is text, replace it with a line break and new text. */
	private function set_error($error='') {
		$this->errors =  ($this->errors!='') ? '<br>'.$error : $error;
	}

	/* Set message text, if there already is text, replace it with a line break and new text. */
	private function set_msg($msg='') {
		$this->msgs =  ($this->msgs!='') ? '<br>'.$msg : $msg;
	}

	private function show_error($kill = false) {
		/* display errors 
		* Note, messages with 'ERROR:' in them are intended to be displayed by ajax. 
		* If kill is set to true, stop script that called this.
		*/
		echo 'ERROR: '.$this->errors;
		if ($kill) {die();}
	}

	private function show_msg() {
		/* 
		* Display messages. 
		*/
		echo $this->msgs;
	}

	private function imgSave() {
		/* Move temp files to destination folder */
		if (move_uploaded_file($this->imgLoaded['tmp_name'], $this->imgUploadDir.$this->imgLoaded['name'])) {
			$this->set_msg("Upload complete");
			$this->show_msg();
		} else {
			$this->set_error("There was a problem saving the file on the server.");
			$this->show_error(true);
		}
	}


	private function tempImage() {

		/* check file type to create a temp image */

		$savedImg = $this->imgUploadDir.$this->imgLoaded['name'];

		switch($this->imgLoaded['type']) {
			case "image/png":
				$this->imgTmp = imagecreatefrompng($savedImg);
				break;
			case "image/jpeg":
				$this->imgTmp = imagecreatefromjpeg($savedImg);
				break;	
			case "image/gif":
				$this->imgTmp = imagecreatefromgif($savedImg);
				break;			
			case "image/bmp":
				$this->imgTmp = imagecreatefrombmp($savedImg);
				break;			
			case "image/jpg":
				$this->imgTmp = imagecreatefromjpeg($savedImg);
				break;
			default:
				$this->imgTmp = NULL;		
		}
	}


	/*
	* Default resizing to 800.
	*/
	private function imageResizing(){

		/*** to do: handle overwrite ***/
		
		if ($this->imgTmp!=NULL) {

			if (imagesx($this->imgTmp) < 800 && imagesy($this->imgTmp) < 800) {return;}

			$imgBase =  strtolower($this->imgPath['basename']);
			$aspect = (imagesx($this->imgTmp) / imagesy($this->imgTmp));
			
			/* Based on aspect ratio, either width 800 or maximum height 800 */
			if ($aspect<1) {

				$imgScaled800 = imagescale($this->imgTmp, (800 * $aspect));
			} else {
				$imgScaled800 = imagescale($this->imgTmp, 800);
			}
			
			/* save scaled images as jpg */
			imagejpeg($imgScaled800, $this->imgUploadDir.$imgBase.'-800.jpg', 90);
		}
	}


	/*
	* Default thumbnail cropping to square and resizing to 300.
	*/
	private function makeThumb() {

		/*** to do: handle overwrite ***/


		if ($this->imgTmp!=NULL) {

			$imgBase =  strtolower($this->imgPath['basename']);
			$aspect = (imagesx($this->imgTmp) / imagesy($this->imgTmp));

			/* Height and width based on aspect ratio. */
			if ($aspect<1) {
				$squareval = imagesx($this->imgTmp); 
			} else {
				$squareval = imagesy($this->imgTmp);
			}

			/* Top and left amount to crop, using the offset supplied in posted offsets */
			$offsetx = $squareval * $this->postVals['cropx'];
			$offsety = $squareval * $this->postVals['cropy'];

			/* Crop the thumbnail to a square at full size. */
			$imgCrop = imagecrop($this->imgTmp, ['x'=>$offsetx, 'y'=>$offsety, 'width'=>$squareval, 'height'=>$squareval]);

			/* Scale thumbnail down to 300 */
			$thumbDim = $this->postVals['thumbdim'];
			$imgScaled300 = imagescale($imgCrop, $thumbDim);
			imagejpeg($imgScaled300, $this->imgUploadDir.$imgBase.'-'.$thumbDim.'.jpg', 90);

		}
	}

}

?>
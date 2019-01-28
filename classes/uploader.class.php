<?php

class imgUploader {

	/* set variables */

	private $imgUploadDir = 'uploads/'; //where images will be saved
	private $uploadField = 'uploaderimg'; //upload form input field name
	private $files = null; //temporary storage for $_FILES global
	private $imgLoaded = null; //properties of the uploaded image
	private $imgMax = 2000000; //largest file size allowed
	private $imgTypes = array('jpg', 'jpeg', 'png', 'gif'); //file extensions allowed 
	private $imgMime = array('image/jpg', 'image/jpeg', 'image/png', 'image/gif'); //file mime types allowed
	private $error = ''; //error message to be displayed
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
			'filename' => ''
		);


	public function __construct() {

	}

	/* functions */

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
		$this->imgResizing();
	} 

	private function checkPosts() {
		$this->postVals = array(
			'filename' => '',
			'overwrite' => false
		);

		foreach ($this->postVals as $postKey => $postVal) {
			if (isset($_POST[$postKey]) && (trim($_POST[$postKey])!='')) {
				$this->postVals[$postKey] = $_POST[$postKey];
			}
		}
	}

	private function checkUpload() {
		/* check if this page was accessed by a specific file upload
		* check if the name value is where it should be
		* check if posted filename  exists, use that name instead
		*/
		if (!isset($this->files['uploaderimg'])) {
			$this->error = 'Ths page was accessed incorrectly.';
			$this->show_errors(true);
		} else if (!isset($this->files[$this->uploadField]['name'])) {
			$this->error = 'Upload is incorrectly formatted. Note, only one file is accepted at a time.';
			$this->show_errors(true);
		} else {
			$this->imgLoaded = $this->files['uploaderimg'];
			
			if($this->postVals['filename']!='') {
				$this->imgLoaded['name'] = $this->postVals['filename'];
			}
		}
	}


	private function checkFileTypes() {
		/* check the file extensions and the mime types */
		$imgPath = pathinfo($this->imgLoaded['name']);
		$imgExt =  $imgPath['extension'];

		if (!in_array($imgExt, $this->imgTypes)) {
			$this->error = "Please select an image of the type JPG, JPEG, GIF, or PNG.";
			$this->show_errors(true);
		}

		if (!in_array($this->imgLoaded['type'], $this->imgMime)) {
			$this->error = "Please select an image of the type JPG, JPEG, GIF, or PNG.";
			$this->show_errors(true);
		}

		return true;
	}

	private function checkUploadFolder() {
		/* check if the destiination folder exists, create it if not */
		if (!file_exists($this->imgUploadDir)) {
			if (!mkdir($this->imgUploadDir )) {
				$this->error = "Could not create upload folder.";
				$this->show_errors(true);
			}
		}
	}

	private function checkFileErrors() {
		/* check for file upload errors */
		if ($this->imgLoaded['error']>0) {
			$this->error = $this->phpFileUploadErrors[$this->imgLoaded['error']];
			$this->show_errors(true);
		}
	}

	private function checkFileSize() {
		/* check for excessive file size */
		if ($this->imgLoaded['size']>$this->imgMax) {
			$this->error = "The maximum file size allowed is ".$this->imgMax.".";
			$this->show_errors(true);
		}
	}

	private function checkExistingFile() {
		/* check if file already exists */
		
		if ($this->postVals['overwrite']) {
			echo 'overwriting'; // testing - delete later
		} else if (file_exists($this->imgUploadDir.$this->imgLoaded['name'])) {
			$this->error = $this->imgUploadDir.$this->imgLoaded['name']." file already exists. Overwrite?";
			$this->show_errors(true);
		}
	}

	private function show_errors($kill = false) {
		/* display errors 
		* note, messages with 'ERROR:' in them are intended to be displayed by ajax 
		* if kill is set to true, stop script taht called this 
		*/
		echo 'ERROR: '.$this->error;
		if ($kill) {die();}
	}

	private function imgSave() {
		/* move temp files to destination folder */
		if (move_uploaded_file($this->imgLoaded['tmp_name'], $this->imgUploadDir.$this->imgLoaded['name'])) {
			echo "Upload complete";
		} else {
			$this->error = "There was a problem saving the file on the server.";
			$this->show_errors(true);
		}
	}

	private function imgResizing(){

	}

}

?>
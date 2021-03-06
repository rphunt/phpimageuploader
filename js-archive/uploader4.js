/*
* jQuery JS for php upload page and php endpoint.
* Ajax consists of POST values and a FILE object.
* Endpoint should use both sets of data to allow things 
* like overwrite, resize, and rename.
*/
$(document).ready(function() {

	/*** Variables ***/

	let form = $('#uploaderform'); // form as object
	let input = $('#uploaderimg'); // file input as object
	let endpoint = 'uploader.php'; // endpoint path
	let dropzone = $('#dropzone'); // dropzone as element
	let msg = $('#respmsg'); // message element

	let srcFile = null; // set to the file data
	let scaleDefault = 800; //  default size of square thumbnail
	let scaleDim = scaleDefault; // size of square thumbnail
	let thumbSizes = {}; // set of values for thumbnail, width, height, x, y
	let thumbDefault = 300; //  default size of square thumbnail
	let thumbDim = thumbDefault; // size of square thumbnail
	let offsetx = 0;
	let offsety = 0;
	let cropx = 0;
	let cropy = 0;
	let filename = '';
	let overwrite = false;

	let c = function(log) {console.log(log);} // console abbreviation

	/*** Events ***/


	/* Handle file drag and drop event. 
	* Assign file data to srcFile.
	* Display file info.
	*/
	dropzone[0].ondrop = (e) => {
		e.preventDefault();
		srcFile = e.dataTransfer.files[0];
		display();
	}

	/* Handle form select button event.
	* Assign file data to srcFile.
	* Display file info.
	*/
	input.on('change', function(e) {
		e.preventDefault();
		srcFile = input[0].files[0];
		display();
	});

	/*
	* Clear form when starting to select new file. 
	*/
	input.on('click', function() {
		uploaderReset(true);
	});

	/*
	* Handle form submission.
	*/
	form.on('submit', function(e) {
		e.preventDefault();

		filename =  form[0].filename.value;
		thumbDim =  form[0].thumbsize.value;
		scaleDim =  form[0].imgscalelimit.value;

		messagePanel();
		$('<div class="progress holder"><div class="progress value">Uploading...<div id="num"></div><div id="perc"></div></div></div>').appendTo(msg);
		$('<button id="btnok" class="btndefault">Cancel</button>').appendTo(msg);

		upload();
	});

	$('#uploaderreset').on('click', function(e) {
		e.preventDefault();
		uploaderReset(true);
	});

	$('#btnthumbedit').on('click', function(e) {
		e.preventDefault();
		$('#imgmain').css('margin-left', '-400px');
	});

	$('#btnimgback').on('click', function(e) {
		e.preventDefault();
		$('#imgmain').css('margin-left', '0');
	});

	$('#thumbpos').on('change', function(e) {
		thumbPos($(this).val());
	})


	/* 
	* Handle other drag events to have no effect.
	*/
	document.ondrop = (e) => {
		e.preventDefault();
	}

	document.ondragover = (e) => {
		e.preventDefault();
	}

	dropzone[0].ondragover = (e) => {
		e.preventDefault();
	}
	
	/*
	* Handle events form elements created by ajax.
	*/
	dropzone.on('click', '#btnoverwriteyes', function(e) {
		e.preventDefault();
		overwrite =  true;
		upload();
	});

	dropzone.on('click', '#btnoverwriteno', function(e) {
		e.preventDefault();
		msg.hide().empty();
		uploaderReset(true)
	});

	dropzone.on('click', '#btnoverwriteedit', function(e) {
		e.preventDefault();
		msg.hide().empty();
		controlsShow();
	});

	dropzone.on('click', '#btnok', function(e) {
		e.preventDefault();
		msg.hide().empty();
		uploaderReset(true)
	});

	/*** Functions ***/

	/*
	* Create formdata and append file data and post data.
	* Ajax to endpoint page.
	*/
	let upload = function() {

		let formdata = new FormData();
		formdata.append('uploaderimg', srcFile);
		formdata.append('filename', filename);
		formdata.append('cropx', cropx);
		formdata.append('cropy', cropy);
		formdata.append('thumbdim', thumbDim);
		formdata.append('scaledim', scaleDim);
		formdata.append('overwrite', overwrite);

		var ajax = new XMLHttpRequest();

		ajax.upload.addEventListener('progress', uploadProgress, false);
		ajax.addEventListener('load', uploadDone, false);
		ajax.addEventListener('error', uploadFail, false);
		ajax.addEventListener('abort', uploadFail, false);
		ajax.open('POST', endpoint);
		ajax.send(formdata);
	};


	/*
	* Functions to reset the form controls,
	* variables, and the dropzone back to initial conditions.
	*/

	function uploadProgress(e) {
		var percent = (e.loaded/e.total) *100;
		c(percent+'%');

		$('.progress.value').css('width', Math.round(percent)+'%');

		$('.progress #num').text("Uploaded: "+e.loaded+" Total: "+e.total);
		$('.progress #perc').text(percent+"%");

	}

	let uploaderReset = (clearVars) => {
		form[0].reset();
		controlsReset();
		if (clearVars) {varsReset();}
	};

	let controlsReset = () => {
		$('#uploadersubmit, #uploaderreset').hide();
		$('#imgmain').css('margin-left', '0');
		$('#thumbpos option').show();
	};

	let controlsHide = () => {
		$('#uploadersubmit, #uploaderreset').hide();
	};

	let controlsShow = () => {
		$('#uploadersubmit, #uploaderreset').show();
	};

	let varsReset = () => {
		$('#imgspec, #thumbspec').hide();
		$('#imgspec #image, #thumbspec #thumbimg').attr('src', '');
		$('#imgspec #filename').val('');
		$('#imgspec #size span').text('');
		$('#imgspec #width span').text('');
		$('#imgspec #height span').text('');

		srcFile = null;
		form[0].reset();
		overwrite = false;
		thumbDim = thumbDefault; 
	};

	/*
	* Display image and stats about it.
	* Include a field for changing the name.
	*/
	let display = () => {
		uploaderReset(false);

		let reader = new FileReader();

		reader.onload = function (e) {

			// image object
			let img = new Image();

			// wait for image to load, then display form.
			img.onload =function() {

	   			$('#imgspec #image, #thumbspec #thumbimg').attr('src', img.src);
	   			$('#imgspec #filename').val(srcFile.name);
	   			$('#imgspec #size span').text(srcFile.size);
	   			$('#imgspec #width span').text(img.width);
	   			$('#imgspec #height span').text(img.height);
	   			$('#imgspec, #thumbspec').show();


				// get thumb width and height
				thumbSizes = thumbResize(img.width, img.height);

	   			// resize thumb
	   			$('#thumbspec #thumbimg').css({
	   				'width': thumbSizes.width,
	   				'height': thumbSizes.height,
	   				'left': thumbSizes.x,
	   				'top': thumbSizes.y
	   			});

			};

			// load image
			img.src = e.target.result;

		};

        reader.readAsDataURL(srcFile);

		controlsShow();
	};

	/*
	* Actions on ajax done.
	* If response says file exists,  create buttons for overwrite question.
	* For normal responses, display OK button.
	*/
	let uploadDone = (e) => {
		controlsHide();

		resp = e.target.responseText;
		c(resp);

		if (resp.indexOf('ERROR:')>-1) {

			controlsReset();
			$('<p class="resperror">'+resp+'</p>').appendTo(msg);

			if (resp.indexOf('Overwrite?')>-1) {
				$('<button id="btnoverwriteyes" class="btndefault">Yes</button>').appendTo(msg);
				$('<button id="btnoverwriteno" class="btndefault">No</button>').appendTo(msg);
				$('<button id="btnoverwriteedit" class="btndefault">Edit</button>').appendTo(msg);
			} else {
				$('<button id="btnok" class="btndefault">OK</button>').appendTo(msg);
			}
		
			return false;
		} else {

			$('<p>'+resp+'</p>').appendTo(msg);
			$('<button id="btnok" class="btndefault">OK</button>').appendTo(msg);
		}
	};

	/*
	* Actions on ajax fail.
	* Display status info
	*/
	let uploadFail = (e) => {
		c('fail: '+e);
		uploaderReset(true);

		messagePanel(true);
		$('<p class="resperror">'+e.status+'<br>'+e.statusText+'</p>').appendTo(msg);
		$('<button id="btnok" class="btndefault">OK</button>').appendTo(msg);

		return false;
	};	

	/*
	* Set values to resize and reposition thumbnail.
	* Set positioing options depending on aspect ratio.
	*/

	let thumbResize = (wd, ht) => {
		let aspect = wd/ht;
		let offsetx, offsety;

		if (aspect<1) {
			wd = thumbDim;
			ht = thumbDim/aspect;
			offsetx = 0; 
			offsety = (ht-wd)/-2; 

			$('#thumbpos option').eq(3).hide();
			$('#thumbpos option').eq(4).hide();
		} else  {
			wd = thumbDim * aspect;
			ht = thumbDim;
			offsetx = (wd-ht)/-2; 
			offsety = 0; 

			$('#thumbpos option').eq(1).hide();
			$('#thumbpos option').eq(2).hide();
		}

		thumbSizes.width = wd;
		thumbSizes.height = ht;
		thumbSizes.x = parseInt(offsetx);
		thumbSizes.y = parseInt(offsety);

		cropx = offsetx/(-thumbDim);
		cropy = offsety/(-thumbDim);

		return thumbSizes;
	}

	/*
	* Reposition thumbnail when select option is chosen.
	* Set a proportion version of the offset also.
	*/

	let thumbPos = (pos) => {
		offsetx = thumbSizes.x;
		offsety =  thumbSizes.y;
		switch(pos) {
			case 'left':
				offsetx = 0;
				break;
			case 'right':
				offsetx = thumbDim - thumbSizes.width;
				break;
			case 'top':
				offsety = 0;
				break;
			case 'bottom':
				offsety = thumbDim - thumbSizes.height;
				break;
			default :
				offsetx = thumbSizes.x;
				offsety =  thumbSizes.y;
		};

		// reposition thumb
		$('#thumbspec #thumbimg').css({
			'left': parseInt(offsetx),
			'top': parseInt(offsety)
		});

		cropx = offsetx/(-thumbDim);
		cropy = offsety/(-thumbDim);

	};

	let messagePanel = () => {
		msg.show();
	};

});
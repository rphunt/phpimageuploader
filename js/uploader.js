/*
* JS for php upload page and php endpoint.
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
	let srcFile = null; // set to the file data
	let msg = null; // message element
	let thumbSizes = {}; // set of values for thumbnail
	let thumbDim = 300; // size of square thumbnail
	let cropx = 0;
	let cropy = 0;
	let filename = '';
	let overwrite = false;

	let c = function(msg) {console.log(msg);} // console abbreviation


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
	* Handle form submission.
	*/
	form.on('submit', function(e) {
		e.preventDefault();
		c('submit');
		filename =  form[0].filename.value;
		upload();
	});

	$('#uploaderreset').on('click', function(e) {
		e.preventDefault();
		uploaderReset(true);
	});

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
	
	dropzone.on('click', '#btnoverwriteyes', function(e) {
		e.preventDefault();
		overwrite =  true;
		msg.remove();
		upload();
	});

	dropzone.on('click', '#btnoverwriteno', function(e) {
		e.preventDefault();
		msg.remove();
		uploaderReset(true)
	});

	dropzone.on('click', '#btnoverwriteedit', function(e) {
		e.preventDefault();
		msg.remove();
		controlsShow();
	});

	dropzone.on('click', '#btnok', function(e) {
		e.preventDefault();
		msg.remove();
		uploaderReset(true)
	});

	dropzone.on('click', '#btnthumbedit', function(e) {
		e.preventDefault();
		$('#imgmain').css('margin-left', '-400px');
	});

	dropzone.on('click', '#btnimgback', function(e) {
		e.preventDefault();
		$('#imgmain').css('margin-left', '0');
	});

	$('#thumbpos').on('change', function(e) {
		thumbPos($(this).val());
	})


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
		formdata.append('overwrite', overwrite);

		$.ajax({
			url: endpoint,
			data: formdata,
			processData: false,
			contentType: false,
			type: 'multipart/form-data',
			method: 'POST'
		})
		.done(function(resp){
			uploadDone(resp);
		})
		.fail(function(xhr){
			uploadFail(xhr);
		});

	};


	/*
	* Functions to reset the form controls,
	* variables, and the dropzone back to initial conditions.
	*/
	let uploaderReset = (clearVars) => {
		controlsReset();
		if (clearVars) {varsReset();}
	};

	let controlsReset = () => {
		if (msg) {msg.remove()};
		$('#uploadersubmit, #uploaderreset').hide();
		$('#imgmain').css('margin-left', '0');
	};

	let controlsShow = () => {
		$('#uploadersubmit, #uploaderreset').show();
	};

	let varsReset = () => {
		$('#imgwrap, #thumb').hide();
		$('#imgwrap #image, #thumb #thumbimg').attr('src', '');
		$('#imgwrap #filename').val('');
		$('#imgwrap #size span').text('');
		$('#imgwrap #width span').text('');
		$('#imgwrap #height span').text('');

		srcFile = null;
		form[0].reset();
		overwrite = false;
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

	   			$('#imgwrap #image, #thumb #thumbimg').attr('src', img.src);
	   			$('#imgwrap #filename').val(srcFile.name);
	   			$('#imgwrap #size span').text(srcFile.size);
	   			$('#imgwrap #width span').text(img.width);
	   			$('#imgwrap #height span').text(img.height);
	   			$('#imgwrap, #thumb').show();


				// get thumb width and height
				thumbSizes = thumbResize(img.width, img.height);

				cropx = thumbSizes.x;
				cropy = thumbSizes.y;

	   			// resize thumb
	   			$('#thumb #thumbimg').css({
	   				'width': thumbSizes.width,
	   				'height': thumbSizes.height,
	   				'left': cropx,
	   				'top': cropy
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
	let uploadDone = (resp) => {
		c('done: '+resp);
		if (resp.indexOf('ERROR:')>-1) {
			
			controlsReset();

			msg = $('<div class="respmsg resperror"><p>'+resp+'</p></div>').appendTo(dropzone);

			if (resp.indexOf('Overwrite?')>-1) {
				$('<button id="btnoverwriteyes" class="btndefault">Yes</button>').appendTo(msg);
				$('<button id="btnoverwriteno" class="btndefault">No</button>').appendTo(msg);
				$('<button id="btnoverwriteedit" class="btndefault">Edit</button>').appendTo(msg);
			} else {
				$('<button id="btnok" class="btndefault">OK</button>').appendTo(msg);
			}
		
			return false;
		} else {
			msg = $('<div class="respmsg"><p>'+resp+'</p></div>').appendTo(dropzone);
			$('<button id="btnok" class="btndefault">OK</button>').appendTo(msg);
		}
	};

	/*
	* Actions on ajax fail.
	* Display status info
	*/
	let uploadFail = (xhr) => {
		c('fail: '+xhr);
		uploaderReset(false);
		$('<p class="error">'+xhr.status+'<br>'+xhr.statusText+'</p>').appendTo(dropzone);
		return false;
	};	

	/*
	* set values to resize and reposition thumbnail
	*/

	let thumbResize = (wd, ht) => {
		let aspect = wd/ht;
		let offsetx, offsety;

		if (aspect<1) {
			wd = thumbDim;
			ht = thumbDim/aspect;
			offsetx = 0; 
			offsety = (ht-wd)/-2; 
		} else  {
			wd = thumbDim * aspect;
			ht = thumbDim;
			offsetx = (wd-ht)/-2; 
			offsety = 0; 
		}

		thumbSizes.width = wd;
		thumbSizes.height = ht;
		thumbSizes.x = parseInt(offsetx);
		thumbSizes.y = parseInt(offsety);

		return thumbSizes;
	}

	let thumbPos = (pos) => {
		cropx = thumbSizes.x;
		cropy =  thumbSizes.y;
		switch(pos) {
			case 'left':
				cropx = 0;
				break;
			case 'right':
				cropx = thumbDim - thumbSizes.width;
				break;
			case 'top':
				cropy = 0;
				break;
			case 'bottom':
				cropy = thumbDim - thumbSizes.height;
				break;
			default :
				cropx = thumbSizes.x;
				cropy =  thumbSizes.y;
		};

		cropx = parseInt(cropx);
		cropy = parseInt(cropy);

		// reposition thumb
		$('#thumb #thumbimg').css({
			'left': cropx,
			'top': cropy
		});

	};

});
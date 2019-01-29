/*
* JS for php upload page and php endpoint.
* Ajax consists of POST values and a FILE object.
* Endpoint should use both sets of data to allow things 
* like overwrite and rename.
*/
$(document).ready(function() {

	/*** Variables ***/

	let form = $('#uploaderform'); // form as object
	let input = $('#uploaderimg'); // file input as object
	let srcFile = null; // set to the file data
	let endpoint = 'uploader.php'; // endpoint path
	let imgwrap = null; // html element where preview data is shown
	let uploadVals = new Array(); // additional fields to send
	let dropzone = $('#dropzone'); // dropzone as element
	let msg = null; // message element

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
		uploadVals.push({'name' : 'filename', 'val' : form[0].filename.value});
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
		uploadVals.push({'name' : 'overwrite', 'val' : true});
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
		msg.remove();
	});

	/*** Functions ***/

	/*
	* Create formdata and append file data and post data.
	* Ajax to endpoint page.
	*/
	let upload = function() {

		let formdata = new FormData();
		formdata.append('uploaderimg', srcFile);

		// cycle through extra fields to append
		for (i=0; i<uploadVals.length; i++) {
			formdata.append(uploadVals[i].name, uploadVals[i].val);
		}


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
		$('#uploadersubmit, #uploaderreset').hide();
	};

	let controlsShow = () => {
		$('#uploadersubmit, #uploaderreset').show();
	};

	let varsReset = () => {
		$('#imgwrap').hide();
		$('#imgwrap #image').attr('src', '');
		$('#imgwrap #filename').val('');
		$('#imgwrap #size span').text('');
		$('#imgwrap #width span').text('');
		$('#imgwrap #height span').text('');

		srcFile = null;
		form[0].reset();
		uploadVals = [];
	};

	/*
	* Display image and stats about it.
	* Include a field for changing the name.
	*/
	let display = () => {
		uploaderReset(false);


		var reader = new FileReader();

		reader.onload = function (e) {

			// image object and props
			var img = new Image();

			// wait for image to load, then display form.
			img.onload =function() {

	   			$('#imgwrap #image').attr('src', img.src);
	   			$('#imgwrap #filename').val(srcFile.name);
	   			$('#imgwrap #size span').text(srcFile.size);
	   			$('#imgwrap #width span').text(img.width);
	   			$('#imgwrap #height span').text(img.height);
	   			$('#imgwrap').show();

			};

			// load image
			img.src = e.target.result;

		};

        reader.readAsDataURL(srcFile);

		controlsShow();

		c(srcFile);
	};

	/*
	* Actions on ajax done.
	* If response says file exists,  create buttons for overwrite question.
	* For normal responses, display OK button.
	*/
	let uploadDone = (resp) => {
		c('done: '+resp);
		if (resp.indexOf('ERROR:')>-1) {
			msg = $('<div class="respmsg resperror"><p>'+resp+'</p></div>').appendTo(dropzone);

			if (resp.indexOf('Overwrite?')>-1) {
				$('<button id="btnoverwriteyes" class="btndefault">Yes</button>').appendTo(msg);
				$('<button id="btnoverwriteno" class="btndefault">No</button>').appendTo(msg);
				$('<button id="btnoverwriteedit" class="btndefault">Edit</button>').appendTo(msg);
			}

			controlsReset();
			
			return false;
		} else {
			msg = $('<div class="respmsg"><p>'+resp+'</p></div>').appendTo(dropzone);
			$('<button id="btnok" class="btndefault">OK</button>').appendTo(msg);
			controlsReset();
		}
	};

	/*
	* Actions on ajax fail.
	* Display status info
	*/
	let uploadFail = (xhr) => {
		c('fail: '+xhr.statusText);
		uploaderReset(false);
		$('<p class="error">'+xhr.status+'<br>'+xhr.statusText+'</p>').appendTo(dropzone);
		return false;
	};	

});
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

	/* handle file drag and drop event 
	* assign file data to srcFile 
	* display file info
	*/
	dropzone[0].ondrop = (e) => {
		e.preventDefault();
		srcFile = e.dataTransfer.files[0];
		display();
	}

	/* handle form select button event 
	* assign file data to srcFile 
	* display file info
	*/
	input.on('change', function(e) {
		e.preventDefault();
		srcFile = input[0].files[0];
		display();
	});

	/*
	* handle form submission
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
	* Handle other drag events to have no effect 
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
		upload();
	});


	dropzone.on('click', '#btnoverwriteno', function(e) {
		e.preventDefault();
		uploaderReset(true)
	});

	dropzone.on('click', '#btnoverwriteedit', function(e) {
		e.preventDefault();
		msg.remove();
	});

	dropzone.on('click', '#btnok', function(e) {
		e.preventDefault();
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

		/* cycle through extra fields to append */
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
	* Set uploader back to initial conditions
	* clearVars is set to also initialize values.
	*/
	let uploaderReset = (clearVars) => {
		dropzone.empty();
		$('#uploadersubmit, #uploaderreset').hide();

		if (clearVars) {
			srcFile = null;
			form[0].reset();
			uploadVals = [];
		}
	};

	/*
	* Display image and stats about it.
	* Include a field for changing the name.
	*/
	let display = () => {
		uploaderReset(false);


		var reader = new FileReader();

		reader.onload = function (e) {

			/* image object and props */
			var img = new Image();

			//wait for image to load, then display form
			img.onload =function() {

				imgwrap = $('<div id="imgwrap"></div>').appendTo(dropzone);
	        	$('<img>', {'src': img.src, 'id': srcFile.name}).appendTo(imgwrap);
				$('<input type="text" id="filename" name=""filename" value="'+srcFile.name+'">').appendTo(imgwrap);
				$('<p>Size: '+srcFile.size+'</p>').appendTo(imgwrap);
	        	$('<p>Height: '+img.height+'</p>').appendTo(imgwrap);
	        	$('<p>Width: '+img.width+'</p>').appendTo(imgwrap);
			};

			// load image
			img.src = e.target.result;

		};

        reader.readAsDataURL(srcFile);

		$('#uploadersubmit, #uploaderreset').show();

		c(srcFile);
	};

	/*
	* Actions on ajax done
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

			return false;
		} else {
			msg = $('<div class="respmsg"><p>'+resp+'</p></div>').appendTo(dropzone);
				$('<button id="btnok" class="btndefault">OK</button>').appendTo(msg);
		}
	};

	let uploadFail = (xhr) => {
		c('fail: '+xhr.statusText);
		uploaderReset(false);
		$('<p class="error">'+xhr.status+'<br>'+xhr.statusText+'</p>').appendTo(dropzone);
		return false;
	};	

});
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
	let filename = []; // key/value for renaming a file
	let imgwrap = null;

	dropzone = $('#dropzone'); // dropzone as element

	c = function(msg) {console.log(msg);}


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

		filename = ['filename', form[0].filename.value];

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

	// 
	// gallery.on('click', '#overwriteyes', function(e) {
	// 	e.preventDefault();
	// 	upload();
	// });

	//when upload form is submitted
	// gallery.on('click', '#overwriteno', function(e) {
	// 	e.preventDefault();
	// });


	/*** Functions ***/

	/*
	* Create formdata and append file data and post data.
	* Ajax to endpoint page.
	*/
	let upload = function() {

		let formdata = new FormData();
		formdata.append('uploaderimg', srcFile);
		formdata.append(filename[0], filename[1]);

		$.ajax({
			url: endpoint,
			data: formdata,
			processData: false,
			contentType: false,
			type: 'multipart/form-data',
			method: 'POST'
		})
		.done(function(resp){
			console.log('done: '+resp);
			if (resp.indexOf('ERROR:')!==-1) {
				uploaderReset(false);
				var error = $('<p class="error">'+resp+'</p>').appendTo(dropzone);
				return false;
			}
		})
		.fail(function(xhr){
			console.log('fail: '+xhr.statusText);
			uploaderReset(false);
			var error = $('<p class="error">'+xhr.status+'<br>'+xhr.statusText+'</p>').appendTo(dropzone);
			return false;
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


});
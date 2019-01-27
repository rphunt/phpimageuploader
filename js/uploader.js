/*
* JS for php upload page and php endpoint.
* Ajax consists of POST values and a FILE object.
* Endpoint should use both sets of data to allow things 
* like overwrite and rename.
*
*/
$(document).ready(function() {

	let form = $('#uploadform');
	let input = $('#userimg');
	let srcFile = null;
	let endpoint = 'uploader.php';
	let filename = [];

	dropzone = $('#dropzone')[0];

	c = function(msg) {console.log(msg);}

	/* handle file drag and drop event 
	* assign file data to srcFile 
	* filename input field is automatically set
	*/
	dropzone.ondrop = (e) => {
		e.preventDefault();
		srcFile = e.dataTransfer.files[0];
		form[0].filename.value = srcFile.name;
		c(srcFile);
	}

	/* handle form select button event 
	* assign file data to srcFile 
	* filename input field is automatically set
	*/
	input.on('change', function(e) {
		e.preventDefault();
		srcFile = input[0].files[0];
		form[0].filename.value = srcFile.name;
		c(srcFile);
	});

	form.on('submit', function(e) {
		e.preventDefault();
		c('submit');

		filename = ['filename', form[0].filename.value];

		upload();
	});

	let upload = function() {

		let formdata = new FormData();
		formdata.append('userimg', srcFile);
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
			c(resp);
		})
		.fail(function(xhr){
			c(xhr.statusText);
		});

	};

	/* handle other drag events to have no effect */

	document.ondrop = (e) => {
		e.preventDefault();
	}

	document.ondragover = (e) => {
		e.preventDefault();
	}

	dropzone.ondragover = (e) => {
		e.preventDefault();
	}



});
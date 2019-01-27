window.onload = (e) => {

	let form = 'uploadform';
	let input = 'userimg';
	let srcFile = null
	let c = (el) => {console.log(el);};

	let gebi = (el) => {
		return document.getElementById(el);
	};

	dropzone = gebi('dropzone');

	let upload = (formdata) => {

		// c(formdata);

		var file = gebi('userimg').files[0];
		formdata = new FormData();
		formdata.append('userimg', file);


		let ajax = new XMLHttpRequest();

		ajax.addEventListener('progress',ajaxProgress,false);
		ajax.addEventListener('load',ajaxLoad,false);
		ajax.addEventListener('error',ajaxError,false);
		ajax.addEventListener('abort',ajaxAbort,false);

		ajax.open('POST', 'uploader.php');
		ajax.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
		ajax.send(formdata);
	};

	let ajaxLoad = (e) => {
		c(e.target.responseText);
	};

	let ajaxError = (e) => {
		c('error');
	};

	let ajaxAbort = (e) => {
		c('aborted');
	};

	let ajaxProgress = (e) => {
		c('progress');
	};

	document.ondrop = (e) => {
		e.preventDefault();
	}

	document.ondragover = (e) => {
		e.preventDefault();
	}

	dropzone.ondragover = (e) => {
		e.preventDefault();
	}

	dropzone.ondrop = (e) => {
		e.preventDefault();
		document.querySelector('input').files = e.dataTransfer.files;
		c(gebi(input).files);
	}

	gebi(input).addEventListener('change', (e) => {
		e.preventDefault();
		c(gebi(input).files);
		
	});

	gebi(form).addEventListener('submit', (e) => {
		e.preventDefault();
		c('submit');
		let formdata = new FormData();
		formdata.append(input, gebi(input).files);
		upload(formdata);
	});


};
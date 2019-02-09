window.onload = (e) => {

	let form = 'uploadform';
	let input = 'userimg';
	let srcFile = null
	let c = function(el){console.log(el);};

	let gebi = function(el){
		return document.getElementById(el);
	};

	dropzone = gebi('dropzone');

		function uploadFile(e) {
			e.preventDefault();
			var srcFile = gebi('userimg').files[0];
			console.log(srcFile);

			var formdata = new FormData();
			formdata.append('userimg', srcFile);

			console.log(formdata);

			var ajax = new XMLHttpRequest();

			ajax.upload.addEventListener('progress', progressHandler, false);
			ajax.addEventListener('load', completeHandler, false);
			ajax.addEventListener('error', errorHandler, false);
			ajax.addEventListener('abort', abortHandler, false);
			ajax.open('POST', 'uploader.php');
			ajax.send(formdata);

		}

		gebi('uploadform').addEventListener('submit', function(e){
			uploadFile(e);
		});

		function progressHandler(e) {
		}

		function completeHandler(e) {
			c(e.target.responseText);		
		}

		function errorHandler() {
			c('Upload failed');				
		}

		function abortHandler() {
			c('Upload aborted');						
		}


};
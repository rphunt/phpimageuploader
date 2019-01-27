 $(document).ready(function() {
	
	var gallery = $('#gallery');
	var srcFile = null;
	var endpoint = 'image_upload.php';
	var form = $('#uploadform');

	/* init the gallery box */
	//clear sets if greeting is shown or not

	var galleryReset = function(clear) {
		gallery.children('#imgframe').remove();
		gallery.children('.error').remove();
		$('#btnupload, #btnreset').hide();
		if (clear) {
			gallery.children('#greet').hide();
		} else {
			gallery.children('#greet').show();
		}
		form[0].reset();
	};

	/* read file and create div and img tags for it */

	var display = function(file) {

		galleryReset(true);

		if ((/\.(gif|jpg|jpeg|png)$/i).test(file.name)) {
		} else {
			galleryReset(true);
			var error = $('<p class="error">Sorry, this is not an image file. Please select a file with either a JPG, JPEG, GIF, PNG extension.</p>').appendTo(gallery);
			return false;
		}

		var reader = new FileReader();

		reader.onload = function (e) {

			/* image object and props */
			var img = new Image();

			//wait for image to load, then display form
			img.onload =function() {

				img.name = file.name;  
				img.size = file.size;

	        	var div = $('<div id="imgframe">').appendTo(gallery);
	        	var a = $('<img>', {'src': img.src, 'id': file.name}).appendTo(div);
	        	var f = $('<form class="imgedit" method="post" action="">').appendTo(div);
	        	$('<input type="text" name="" id="" value="'+img.name+'">').appendTo(f);
	        	$('<p>Size: '+img.size+'</p>').appendTo(f);
	        	$('<p>Height: '+img.height+'</p>').appendTo(f);
	        	$('<p>Width: '+img.width+'</p>').appendTo(f);

			};

			// load image
			img.src = e.target.result;

		};

        reader.readAsDataURL(file);

        $('#btnupload, #btnreset').show();
	};

	var fileUpload = function() {

		console.clear();

		//var formdata = new FormData();
		var formdata = new FormData(form[0]);
		formdata.append('userimg', srcFile); // this method allows ajax for both form and drag and drop

		for (var el of formdata.values()) {
			console.log(el);
		}

		$.ajax({
			url: endpoint,
		    processData: false,
		    contentType: false,
		    type: 'multipart/form-data',
			method: 'POST',
			data: formdata
		})
		.done(function(resp){
			console.log('done: '+resp);
			if (resp.indexOf('ERROR:')!==-1) {
				galleryReset(true);
				var error = $('<p class="error">'+resp+'</p>').appendTo(gallery);
				return false;
			}
		})
		.fail( function(xhr){
			console.log('fail: '+xhr.statusText);
			galleryReset(true);
			var error = $('<p class="error">'+xhr.status+'<br>'+xhr.statusText+'</p>').appendTo(gallery);
			return false;
		});
	}


	/* actions */


	//when files added to input, cycle through them

	$('#userimg').on('change', function() {
		var fileCount = $(this)[0].files.length;

		if (fileCount>0) {
			srcFile = $(this)[0].files[0];
			display(srcFile);
		}
	});

	//reset button to clear gallery
	$('#btnreset').on('click', function(e) {
		e.preventDefault();
		galleryReset(false);
	});

	//when upload form is submitted
	$('#uploadform').on('submit', function(e) {
		e.preventDefault();
		fileUpload();
	});

	//when upload form is submitted
	gallery.on('click', '#overwriteyes', function(e) {
		e.preventDefault();
		fileUpload();
	});

	//when upload form is submitted
	gallery.on('click', '#overwriteno', function(e) {
		e.preventDefault();
	});

	/* drag and drop */

	document.ondrop = function(e){
		   e.preventDefault();   
	}

	document.ondragover = function(e){
		   e.preventDefault();   
	}

	gallery[0].ondragover = function(e){
		   e.preventDefault();   
	}

	gallery[0].ondrop = function(e) {
		e.preventDefault();
		srcFile = e.dataTransfer.files[0];

		srcFile.name.value = "sue";

		console.log(srcFile.name);

		display(srcFile);
	}


});




window.onload = (e) => {

	/* Init */

	let gebi = (id) => {
		return document.getElementById(id);
	};

	let qs = (sel) => {
		return document.querySelector(sel);
	};

	let c = (text) => {
		console.log(text);
	};

	/* Variables */

	let form = gebi('uploaderform');
	let fileInput = gebi('uploaderimg');
	c(fileInput);
	let dropzone = gebi('dropzone');
	let msg = gebi('respmsg');

	let uploaderreset = gebi('uploaderreset');
	let btnthumbedit = gebi('btnthumbedit');
	let btnimgback = gebi('btnimgback');
	let thumbpos = gebi('thumbpos');

	let srcFile = null;
	let filename = '';
	let overwrite = false;
	let scaleDim = 800;
	let thumbDim = 300;
	let endpoint = 'uploader.php';

	/* Events */

	dropzone.ondrop = (e) => {
		e.preventDefault();
		srcFile = e.dataTransfer.files[0];
		display();
	};

	fileInput.addEventListener('change', (e) => {
		e.preventDefault();
		c('change');
		srcFile = fileInput.files[0];
		display();
	});

	fileInput.addEventListener('click', () => {
		//uploaderReset(true);
		c('click');
	});


	form.addEventListener('submit', (e) => {
		e.preventDefault();

		filename =  form.filename.value;
		thumbDim =  form.thumbsize.value;
		scaleDim =  form.imgscalelimit.value;

		messagePanel();
		msg.insertAdjacentHTML('afterbegin', '<div class="progress holder"><div class="progress value">Uploading...<div id="num"></div><div id="perc"></div></div></div>');
		msg.insertAdjacentHTML('beforeend', '<button id="btnok" class="btndefault">Cancel</button>');

		//upload();
	});

	uploaderreset.addEventListener('click', (e) => {
		e.preventDefault();
		uploaderReset(true);
	});

	btnthumbedit.addEventListener('click', (e) => {
		e.preventDefault();
		$('#imgmain').css('margin-left', '-400px');
	});

	btnimgback.addEventListener('click', (e) => {
		e.preventDefault();
		$('#imgmain').css('margin-left', '0');
	});

	thumbpos.addEventListener('change', (e) => {
		thumbPos($(this).val());
	});

	document.ondrop = (e) => {
		e.preventDefault();
	};

	document.ondragover = (e) => {
		e.preventDefault();
	};

	dropzone.ondragover = (e) => {
		e.preventDefault();
	};

	/* Functions */

	let display = () => {
		//uploaderReset(false);
		c('display');

		let reader = new FileReader();

		reader.onload = function (e) {

			// image object
			let img = new Image();

			// wait for image to load, then display form.
			img.onload =function() {

	   			qs('#imgspec #image, #thumbspec #thumbimg').setAttribute('src', img.src);
	   			qs('#imgspec #filename').textContent = srcFile.name;
	   			qs('#imgspec #size span').textContent = srcFile.size;
	   			qs('#imgspec #width span').textContent = img.width;
	   			qs('#imgspec #height span').textContent = img.height;
	   			qs('#imgspec, #thumbspec').style.display ='block';


				// get thumb width and height
				thumbSizes = thumbResize(img.width, img.height);

	   			// resize thumb
	   			specImgStyles = qs('#thumbspec #thumbimg').style;
	   			specImgStyles.width(thumbSizes.width+'px');
	   			specImgStyles.height(thumbSizes.height+'px');
	   			specImgStyles.left(thumbSizes.x+'px');
	   			specImgStyles.top(thumbSizes.y+'px');
			};

			// load image
			img.src = e.target.result;

		};

        reader.readAsDataURL(srcFile);

		controlsShow();
	};


	let controlsShow = () => {
		qs('#uploadersubmit, #uploaderreset').style.display ='block';
	};


	let messagePanel = () => {
		msg.style.display('block');
	};


	let setButtons = () => {

		let btnoverwriteyes = gebi('btnoverwriteyes');
		let btnoverwriteno = gebi('btnoverwriteno');
		let btnoverwriteedit = gebi('btnoverwriteedit');
		let btnok = gebi('btnok');

		if (btnoverwriteyes) {
			btnoverwriteyes.addEventListener('onclick', (e) => {
				e.preventDefault();
				overwrite =  true;
				upload();
			});
		}

		if (btnoverwriteno) {
			btnoverwriteno.addEventListener('onclick', (e) => {
				e.preventDefault();
				msg.hide().empty();
				uploaderReset(true)
			});
		}

		if (btnoverwriteedit) {
			btnoverwriteedit.addEventListener('onclick', (e) => {
				e.preventDefault();
				msg.hide().empty();
				controlsShow();
			});
		}

		if (btnok) {
			btnok.addEventListener('onclick', (e) => {
				e.preventDefault();
				msg.hide().empty();
				uploaderReset(true)
			});
		}

	};

	let clearButtons = () => {
		if (btnoverwriteyes) { btnoverwriteyes = null;}
		if (btnoverwriteno) { btnoverwriteno = null;}
		if (btnoverwriteedit) { btnoverwriteedit = null;}
		if (btnok) { btnok = null;}
	};

};
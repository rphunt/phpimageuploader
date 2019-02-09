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
	let thumbSizes = {};
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
		uploaderReset(true);
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
		thumbPos(e.target.value);
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

	   			qs('#imgspec #image').setAttribute('src', img.src);
	   			qs('#thumbspec #thumbimg').setAttribute('src', img.src);
	   			qs('#imgspec #filename').value = srcFile.name;
	   			qs('#imgspec #size span').textContent = srcFile.size;
	   			qs('#imgspec #width span').textContent = img.width;
	   			qs('#imgspec #height span').textContent = img.height;
	   			qs('#imgspec').style.display = 'block';
	   			qs('#thumbspec').style.display = 'block';

				// get thumb width and height
				thumbSizes = thumbResize(img.width, img.height);

	   			// resize thumb
	   			let imgSpecStyles = qs('#thumbspec #thumbimg').style;
	   			imgSpecStyles.width = thumbSizes.width+'px';
	   			imgSpecStyles.height = thumbSizes.height+'px';
	   			imgSpecStyles.left = thumbSizes.x+'px';
	   			imgSpecStyles.top = thumbSizes.y+'px';
			};

			// load image
			img.src = e.target.result;

		};

        reader.readAsDataURL(srcFile);

		controlsShow();
	};


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

	let uploadProgress = (e) => {
		var percent = (e.loaded/e.total) *100;
		c(percent+'%');

		qs('.progress.value').style.width = Math.round(percent)+'%';
		qs('.progress #num').textContent = "Uploaded: "+e.loaded+" Total: "+e.total;
		qs('.progress #perc').textContent = percent+"%";

	};

	let thumbResize = (wd, ht) => {
		let aspect = wd/ht;
		let offsetx, offsety;
		let posList = qs('#thumbpos').options;

		if (aspect<1) {
			wd = thumbDim;
			ht = thumbDim/aspect;
			offsetx = 0; 
			offsety = (ht-wd)/-2; 

			posList[3].style.display = 'none';
			posList[4].style.display = 'none';
		} else  {
			wd = thumbDim * aspect;
			ht = thumbDim;
			offsetx = (wd-ht)/-2; 
			offsety = 0; 

			posList[1].style.display = 'none';
			posList[2].style.display = 'none';
		}

		thumbSizes.width = wd;
		thumbSizes.height = ht;
		thumbSizes.x = parseInt(offsetx);
		thumbSizes.y = parseInt(offsety);

		//cropx = offsetx/(-thumbDim);
		//cropy = offsety/(-thumbDim);

		return thumbSizes;
	}

	let thumbPos = (pos) => {
		c(pos);
		let offsetx = thumbSizes.x;
		let offsety =  thumbSizes.y;
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
		let thumbSpecStyles = qs('#thumbspec #thumbimg').style;
		thumbSpecStyles.left = parseInt(offsetx)+'px';
		thumbSpecStyles.top = parseInt(offsety)+'px';

		//cropx = offsetx/(-thumbDim);
		//cropy = offsety/(-thumbDim);

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

	/* Resets Functions */

	let uploaderReset = (clearVars) => {
		form.reset();
		controlsReset();
		if (clearVars) {varsReset();}
	};

	let controlsReset = () => {
		qs('#uploadersubmit').display = 'none';
		qs('#uploaderreset').display = 'none';
		gebi('imgmain').style.marginLeft = 0;
		qs('#thumbpos option').display = 'block';
	};

	let controlsHide = () => {
		gebi('uploadersubmit').display = 'none';
		gebi('uploaderreset').display = 'none';
	};

	let controlsShow = () => {
		gebi('uploadersubmit').display = 'block';
		gebi('uploaderreset').display = 'block';
	};

	let varsReset = () => {
		qs('#imgspec, #thumbspec').display = 'none';
		qs('#imgspec #image, #thumbspec #thumbimg').setAttribute('src', '');
		qs('#imgspec #filename').value ='';
		qs('#imgspec #size span').textContent = '';
		qs('#imgspec #width span').textContent = '';
		qs('#imgspec #height span').textContent = '';

		srcFile = null;
		form[0].reset();
		overwrite = false;
		thumbDim = thumbDefault; 
	};

	let messagePanel = () => {
		msg.style.display('block');
	};

};
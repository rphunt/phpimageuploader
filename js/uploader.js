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

	let btnoverwriteyes = null;
	let btnoverwriteno = null;
	let btnoverwriteedit = null;
	let btnok = null;
	let btcancel = null;

	let srcFile = null;
	let filename = '';
	let overwrite = false;
	let scaleDim = 800;
	let thumbDefault = 300;
	let thumbDim = thumbDefault;
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
		msg.insertAdjacentHTML('beforeend', '<div class="progress holder"><div class="progress value">Uploading...<div id="num"></div><div id="perc"></div></div></div>');
		msg.insertAdjacentHTML('beforeend', '<button id="btncancel" class="btndefault">Cancel</button>');
		setButtons();

		upload();
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
		uploaderReset(false);

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

	let uploadDone = (e) => {
		controlsHide();

		resp = e.target.responseText;

		if (resp.indexOf('ERROR:')>-1) {

			controlsReset();

			msg.insertAdjacentHTML('beforeend', '<p class="resperror">'+resp+'</p>');

			if (resp.indexOf('Overwrite?')>-1) {
				msg.insertAdjacentHTML('beforeend', '<button id="btnoverwriteyes" class="btndefault">Yes</button>');
				msg.insertAdjacentHTML('beforeend', '<button id="btnoverwriteno" class="btndefault">No</button>');
				msg.insertAdjacentHTML('beforeend', '<button id="btnoverwriteedit" class="btndefault">Edit</button>');
			} else {
				msg.insertAdjacentHTML('beforeend', '<button id="btnok" class="btndefault">OK</button>');

			}
			setButtons();

			return false;
		} else {

			msg.insertAdjacentHTML('beforeend', '<p>'+resp+'</p>');
			msg.insertAdjacentHTML('beforeend', '<button id="btnok" class="btndefault">OK</button>');
			setButtons();
		}
	};

	let uploadFail = (e) => {
		uploaderReset(true);

		messagePanel(true);
		msg.insertAdjacentHTML('beforeend', '<p class="resperror">'+e.status+'<br>'+e.statusText+'</p>');
		msg.insertAdjacentHTML('beforeend', '<button id="btnok" class="btndefault">OK</button>');
		setButtons();

		return false;
	};	


	let thumbResize = (wd, ht) => {
		let aspect = wd/ht;
		let offsetx, offsety;
		let posList = gebi('thumbpos').options;

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

		cropx = offsetx/(-thumbDim);
		cropy = offsety/(-thumbDim);

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

		cropx = offsetx/(-thumbDim);
		cropy = offsety/(-thumbDim);

	};

	let setButtons = () => {

		btnoverwriteyes = gebi('btnoverwriteyes');
		btnoverwriteno = gebi('btnoverwriteno');
		btnoverwriteedit = gebi('btnoverwriteedit');
		btnok = gebi('btnok');
		btncancel = gebi('btncancel');

		if (btnoverwriteyes) {
			btnoverwriteyes.addEventListener('click', (e) => {
				e.preventDefault();
				overwrite =  true;
				upload();
			});
		}

		if (btnoverwriteno) {
			btnoverwriteno.addEventListener('click', (e) => {
				e.preventDefault();
				messageClear();
				uploaderReset(true);
			});
		}

		if (btnoverwriteedit) {
			btnoverwriteedit.addEventListener('click', (e) => {
				e.preventDefault();
				messageClear();
				controlsShow();
			});
		}

		if (btnok) {
			btnok.addEventListener('click', (e) => {
				e.preventDefault();
				messageClear();
				uploaderReset(true);
			});
		}
		
		if (btncancel) {
			btncancel.addEventListener('click', (e) => {
				e.preventDefault();
				// messageClear();
				// uploaderReset(true);
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
		qs('#uploadersubmit').style.display = 'none';
		qs('#uploaderreset').style.display = 'none';
		gebi('imgmain').style.marginLeft = 0;
		qs('#thumbpos option').style.display = 'block';
		clearButtons();
	};

	let controlsHide = () => {
		gebi('uploadersubmit').style.display = 'none';
		gebi('uploaderreset').style.display = 'none';
	};

	let controlsShow = () => {
		c('controls');
		gebi('uploadersubmit').style.display = 'block';
		gebi('uploaderreset').style.display = 'block';
	};

	let varsReset = () => {
		gebi('imgspec').style.display = 'none';
		gebi('thumbspec').style.display = 'none';
		qs('#imgspec #image').setAttribute('src', '');
		qs('#thumbspec #thumbimg').setAttribute('src', '');
		qs('#imgspec #filename').value ='';
		qs('#imgspec #size span').textContent = '';
		qs('#imgspec #width span').textContent = '';
		qs('#imgspec #height span').textContent = '';

		srcFile = null;
		form.reset();
		overwrite = false;
		thumbDim = thumbDefault; 
	};

	let messagePanel = () => {
		msg.style.display = 'block';
	};

	let messageClear = () => {
		msg.style.display = 'none';
		msg.textContent = '';
		clearButtons();
	};

};
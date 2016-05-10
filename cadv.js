/**!
 * CADV - HTML5 "C"anvas based "ADV"enture game engine. 
 * Just another Visual Novel game engine. 
 * Visual Novel games are consider as "Adventure" games in Japan.
 * 
 * The 4th generation of BADV.
 * CADV aims to use less CSS that was required in previous generations.
 * Plans to write it in ES6(ES2015).
 * 
 * Requirements:
 * jQuery 2.x 
 * (For $.Animation, will be replaced one I figured how to use jQuery easing with alternate solution)
 * 
 * CryptoJS
 * (For MD5 encryption, might required for generating keys for server requests)
 * 
 * Supported Browsers:
 * WebKit / WebEngine based Browsers, Gecko based Browsers
 * (IE / Edge not supported, Safari also not supported)
 * 
 * Audio format:
 * Suggests WebM Vorbis, or WebM Opus.
 * Please check the browser's codec support.
 * 
 * Bundled Library / Plugin:
 * jQuery easing
 * ScreenFull
 * LZ-String
 * 
 * @author KiddoKenshin @ K2-R&D.com
 * @since 2012/04/01, RE: 2013/01/17, TRE: 2013/12/13, C-ADV: 2014/05/26
 * @version -WORK IN PROGRESS-
 * 
 * Current Progress: Audio Related
 * 
 * Rough DEMO using CADV: http://furi2purei.com/index.min.html
//*/

//# Common Functions #//
/** 
 * Generates MD5 string from supplied string.
 * (For server interactions, CryptoJS MD5 Needed)
 * 
 * @return string
 */
function MD5(stringIn) {
	if (typeof(CryptoJS) == 'undefined') {
		error('CryptoJS is required to use MD5');
	}
	var hash = CryptoJS.MD5(stringIn);
	return hash.toString();
}

/** 
 * Acquire current datetime.
 * (For server interactions)
 * 
 * @return string
 */
function getYmdHis() {
	var date = new Date();
	var ymdhis = 
		date.getFullYear() + 
		('0' + (date.getMonth() + 1)).slice(-2) + 
		('0' + date.getDate()).slice(-2) + 
		('0' + date.getHours()).slice(-2) + 
		('0' + date.getMinutes()).slice(-2) + 
		('0' + date.getSeconds()).slice(-2)
	;
	delete date;
	return ymdhis;
}

/**
 * Stores data to Web Storage for later usage. (Session Storage)
 * 
 * @param string uid | unique id to be use later
 * @param string dataString | the data to be store
 * @returns boolean
 */
function storeToLocalStorage(uid, dataString) {
	if (sessionStorage == undefined) {
		return false;
	}
	
	try {
		sessionStorage.setItem(uid, dataString);
		return true;
	} catch (error) {
		log(error);
		log('Ignoring errors. (HTML5 LocalStorage Not available!)');
		return false;
	}
}

/**
 * Retrieves data from Web Storage
 * 
 * @param string uid | unique id to claim data
 * @returns string
 */
function getFromLocalStorage(uid) {
	var data = null;
	if (sessionStorage != undefined) {
		data = sessionStorage.getItem(uid);
	}
	return data;
}

/**
 * Remove data from WebStorage
 * 
 * @param string uid | unique id to remove
 * @return void
 */
function removeFromLocalStorage(uid) {
	sessionStorage.removeItem(uid);
}

/**
 * Clear all Web Storage (Session Storage)
 * 
 * @return void
 */
function clearLocalStorage() {
	sessionStorage.clear();
}

/** 
 * Detects mobile device via user agent.
 * 
 * @return boolean
 */
var mobile;
function isMobile() {
	if (mobile == undefined) {
		mobile = false;
		if (navigator.userAgent.match(/(iPad|iPhone|iPod|Android|android)/g)) {
			mobile = true;
		}
	}
	return mobile;
}

/**
 * Display logs in console. Mostly for debugging purpose.
 * 
 * @param string message | String to be output in console.
 * @param boolean force | Outputs to console despite of not debug mode.
 * @return void
 */
function log(message, force) {
	if (cadv.system.debug || force === true) {
		console.log(message);
	}
}

/**
 * Throws an error. Most probably the best way to stop anything moving.
 * 
 * @param string message | The error message
 * @return void
 */
function error(message) {
	alert('Error occured, unable to proceed.');
	throw Error(message);
}

//# CADV Related #//
var cadv = new Object;

// System Settings, can be modify to suit user's needs
cadv.system = {
	'debug' : false, // Debug mode
	'stoponerror' : true, // Stop engine when error occured
	'title' : 'Canvas_Adventure_Engine', // Rename-able
	'version' : '', // Set by user, to check save files?
	'width' : 1280, // Game Width
	'height' : 720, // Game Height
	'defaultbgcolor' : '#000000', // Default background color
	'screenscale' : 1.0, // Screen Scaling (Game size / Screen size), Renew Scaling whenever Screen size changed
	'autoscale' : false, // Perform auto scaling (Fit to screen)
	
	'textselector' : undefined, // jQuery Object, Will be occupied after created.
	'textspeed' : 30, // fps
	
	'useaudio' : false // Web Audio API and other Audio related stuff 
};

// Audio related variables
cadv.audio = {
	'context' : null
};

// CSS for text output
// (Text on Canvas do not recognize new lines)
cadv.textOut = {
	'position' : 'absolute',
	'fontfamily' : 'Meiryo UI',
	'font-size' : '16px',
	'line-height' : '16px',
	'left' : '16px',
	'top' : '16px',
	'color' : '#FFFAFA',
	'overflow' : 'visible'
};

// In game states, not to be overwritten by user.
// TODO: Create this dynamically so it won't be overwritten easily?
cadv.states = {
	'outputingtext'	: false
};

// Custom variables, user can add them and manipulate them.
cadv.customvar = {};

//## PRELOAD Functions ##//
var loadErrors = 0;
var preload = {
	'images' : {},
	'audios' : {},
	'videos' : {}
};
var resources = {
	'images' : {},
	'audios' : {},
	'videos' : {}
};

////////////////////
// WIP

cadv.addPreloadResource = function(resourceType, resourceID, resourceURL) {
	switch(resourceType) {
		case 'image':
			preload.images[resourceID] = resourceURL;
			break;
		case 'audio':
			preload.audios[resourceID] = resourceURL;
			break;
		case 'video':
			preload.videos[resourceID] = resourceURL;
			break;
		default:
			var message = resourceType + ' is not a valid resource type!';
			log(message);
			if (cadv.system.stoponerror) {
				error(message);
			}
			break;
	}
	log(resourceURL + ' is added to preload list!');
};

cadv.startPreloadResources() = function() {
	for (var resourceType in preload) {
		if (!$.isEmptyObject(preload[resourceType])) {
			log('Total of preload ' + resourceType + ': ' + Object.keys(preload.images).length);
			
			/*
			for (var resourceID in preload[resourceType]) {
				// Load Resource
			}
			//*/
			
		} else {
			log('Preload list of ' + resourceType + ' is empty!');
		}
	}
};
////////////////////


/**
 * Add image source to preload list
 * 
 * @param string imageID | ID to be use later on manipulating them
 * @param string imageURL | Image source
 * @return void
 */
cadv.addPreloadImage = function(imageID, imageURL) {
	preload.images[imageID] = imageURL;
};

/**
 * Start the resource(image) loading.
 * 
 * @return void
 */
cadv.startPreloadImages = function() {
	if (!$.isEmptyObject(preload.images)) {
		log('Total of preload images: ' + Object.keys(preload.images).length);
		
		function loadToStorage(imageID, imageURL, noLocalStorage) {
			if (noLocalStorage) {
				var newImage = new Image();
				newImage.src = imageURL;
				resources.images[imageID] = newImage;
				log(imageID + ' loaded from storage!');
			} else {
				var request = new XMLHttpRequest();
				request.open('GET', imageURL, true);
				request.responseType = 'arraybuffer';
				request.onload = function(eventObj) {
					var imageBlob = new Blob([this.response]);
					var newImage = new Image();
					newImage.src = URL.createObjectURL(imageBlob);
					resources.images[imageID] = newImage;
					log(imageURL + ' loaded!');
					
					if (noLocalStorage !== true) {
						var arrBuffer = new Uint8Array(this.response);
						var i = arrBuffer.length;
						var binaryString = new Array(i);
						while (i--) {
							binaryString[i] = String.fromCharCode(arrBuffer[i]);
						}
						var data = binaryString.join('');
						var base64 = btoa(data);
						var dataURL = 'data:image/jpeg;base64,' + base64;
						
						var compressed = LZString.compress(dataURL);
						storeToLocalStorage(imageID, compressed);
					}
				};
				request.onerror = function() {
					var message = imageURL + ' error! (Request)';
					loadErrors++;
					log(message);
					if (cadv.system.stoponerror) {
						error(message);
					}
				};
				/* WIP
				request.onprogress = function(eventObj){
					if(eventObj.lengthComputable) {
						// var percentComplete = eventObj.loaded / eventObj.total;
						// do something with this
					}
				};
				//*/
				
				request.send();
			}
		}
		
		for (var imageId in preload.images) {
			var fromLocalStorage = getFromLocalStorage(imageId);
			if (fromLocalStorage !== null) {
				var decompressed = LZString.decompress(fromLocalStorage);
				loadToStorage(imageId, decompressed, true);
			} else {
				loadToStorage(imageId, preload.images[imageId]);
			}
		}
	}
};

/**
 * Add audio source to preload list
 * 
 * @param string audioID | ID to be use later on manipulating them
 * @param string audioURL | Audio source
 * @return void
 */
cadv.addPreloadAudio = function(audioID, audioURL) {
	if (!cadv.system.useaudio) return;
	preload.audios[audioID] = audioURL;
};

/**
 * Start the resource(audio) loading.
 * 
 * @return void
 */
cadv.startPreloadAudios = function() {
	if (!cadv.system.useaudio) return;
	
	if (!$.isEmptyObject(preload.audios)) {
		log(Object.keys(preload.audios).length);
		
		function loadAudio(audioId, audioFileUrl) {
			var request = new XMLHttpRequest();
			request.open('GET', audioFileUrl, true);
			request.responseType = 'arraybuffer';
			request.onload = function() {
				cadv.audio.context.decodeAudioData(request.response, function(buffer) {
					resources.audios[audioId] = buffer;
					log(audioFileUrl + ' loaded!');
				}, function() {
					// Error Callback
					var message = audioFileUrl + ' error! (Decode)';
					loadErrors++;
					log(message);
					if (cadv.system.stoponerror) {
						error(message);
					}
				});
			};
			request.onerror = function() {
				var message = audioFileUrl + ' error! (Request)';
				loadErrors++;
				log(message);
				if (cadv.system.stoponerror) {
					error(message);
				}
			};
			/* WIP
			request.onprogress = function(eventObj){
				if(eventObj.lengthComputable) {
					// var percentComplete = eventObj.loaded / eventObj.total;
					// do something with this
				}
			};
			//*/
			request.send();
		}
		
		for (var audioId in preload.audios) {
			loadAudio(audioId, preload.audios[audioId]);
		}
		
	}
};

/**
 * Add video source to preload list
 * 
 * @param string videoID | ID to be use later on manipulating them
 * @param string videoURL | Video source
 * @return void
 */
cadv.addPreloadVideo = function(videoID, videoURL) {
	// TODO: Check browser codec support?
	preload.videos[videoID] = videoURL;
};

/**
 * Start the resource(video) loading.
 * 
 * @return void
 */
cadv.startPreloadVideos = function() {
	// TODO: Check browser codec support?
	
	if (!$.isEmptyObject(preload.videos)) {
		log('Total of preload videos: ' + Object.keys(preload.videos).length);
		
		function loadVideo(videoId, videoFileUrl) {
			var request = new XMLHttpRequest();
			request.open('GET', videoFileUrl, true);
			request.responseType = 'arraybuffer';
			request.onload = function(eventObj) {
				var videoBlob = new Blob([eventObj.target.response], {type: 'video/webm'}); // TODO: Dynamically?
				resources.videos[videoId] = URL.createObjectURL(videoBlob);
				log(videoFileUrl + ' loaded!');
			};
			request.onerror = function() {
				var message = videoFileUrl + ' error! (Request)';
				loadErrors++;
				log(message);
				if (cadv.system.stoponerror) {
					error(message);
				}
			};
			/* WIP
			request.onprogress = function(eventObj){
				if(eventObj.lengthComputable) {
					// var percentComplete = eventObj.loaded / eventObj.total;
					// do something with this
				}
			};
			//*/
			request.send();
		}
		
		for (var videoId in preload.videos) {
			loadVideo(videoId, preload.videos[videoId]);
		}
		
	}
};

cadv.startPreload = function() {
	if (cadv.system.useaudio) {
		if (typeof(AudioContext) != 'undefined') {
			// Web Audio API is all unprefixed
			cadv.audio.context = AudioContext();
		} else {
			// FORCE to switch back
			cadv.system.useaudio = false;
			log('Unable to create audio context. Web Audio API might be not available.');
			
			// Empty Audio list
			preload.audios = {};
		}
	}
	
	cadv.startPreloadImages();
	// cadv.startPreloadAudios();
	// cadv.startPreloadVideos();
};

// INGAME Draw mechanics (Core)
var oldObjects = {
	'backgrounds' : {},
	'characters' : {},
	'messagewindow' : {}
};
var detailObjects = {
	'backgrounds' : {},
	'characters' : {},
	'messagewindow' : {}
};

var canvas, canvasContext;
var canvasRefresh = false;

cadv.performScaling = function() {
	cadv.system.screenscale = window.innerWidth / cadv.system.width;
	if (cadv.system.height * cadv.system.screenscale > window.innerHeight) {
		cadv.system.screenscale = window.innerHeight / cadv.system.height;
	}
	
	// No scale below 0.5 (50%)
	if (cadv.system.screenscale < 0.5) {
		cadv.system.screenscale = 0.5;
	}
	
	// Adjust canvas height to adapt changes
	if (cadv.system.screenscale > 1.0) {
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;
	} else {
		canvas.width = cadv.system.width;
		canvas.height = cadv.system.height;
	}
};

cadv.createImage = function(imageType, uid, imageUrl, extraParams) {
	// UID Unique check
	// var uid = MD5(imageUrl + '_' + getYmdHis());
	var newImage = new Image();
	newImage.onload = function() {
		var newCanvas = document.createElement('canvas');
		
		var detailObject = {
			'id' : uid, // Unique ID
			'canvasObject' : newCanvas, // Canvas Object Holder
			'imageObject' : newImage, // Image Object Holder
			'type' : imageType, // 
			'percentX' : '0',
			'percentY' : '0',
			'x' : '0',
			'y' : '0',
			'iWidth' : newImage.width,
			'iHeight' : newImage.height,
			'hFlip' : '1', // Horizontal Flip
			'vFlip' : '1', // Vertical Flip
			'opac' : '1', // Opacity
			'originX' : '50%', // Transform Origin X
			'originY' : '50%', // Transform Origin Y
			'stretch' : false, // Enable stretch (Mainly used in BG)
			'stretchScale' : '1', // Stretched Scale
			'imageScale' : '1', // Image Scale
			'rotate' : '0', // Rotation (Degree, 0 - 360)
			'xSlice' : '1',
			'ySlice' : '1',
			'xCount' : '0',
			'yCount' : '0'
			// Default Offset?
		};
		
		// Overwrites Parameter above if extra parameters were provided
		if (extraParams != undefined) {
			for (var key in extraParams) {
				if (detailObject[key] != undefined) {
					detailObject[key] = extraParams[key];
				}
			}
		}
		
		if (extraParams != undefined && extraParams.parentId != undefined && extraParams.childType != undefined) {
			if (detailObjects[imageType][extraParams.parentId] == undefined) {
				throw new Error('No such parent!');
			}
			if (detailObjects[imageType][extraParams.parentId][extraParams.childType] == undefined) {
				detailObjects[imageType][extraParams.parentId][extraParams.childType] = {};
			}
			detailObjects[imageType][extraParams.parentId][extraParams.childType] = detailObject;
		} else {
			detailObjects[imageType][uid] = detailObject;
		}
		
	};
	
	newImage.src = imageUrl;
	return uid;
};

cadv.createImageV2 = function(imageType, uid, imageID, extraParams) {
	var newImage = resources.images[imageID];
	var newCanvas = document.createElement('canvas');
	var detailObject = {
			'id' : uid, // Unique ID
			'canvasObject' : newCanvas, // Canvas Object Holder
			'imageObject' : newImage, // Image Object Holder
			'type' : imageType, // 
			'percentX' : '0',
			'percentY' : '0',
			'x' : '0',
			'y' : '0',
			'iWidth' : newImage.width,
			'iHeight' : newImage.height,
			'hFlip' : '1', // Horizontal Flip
			'vFlip' : '1', // Vertical Flip
			'opac' : '1', // Opacity
			'originX' : '50%', // Transform Origin X
			'originY' : '50%', // Transform Origin Y
			'stretch' : false, // Enable stretch (Mainly used in BG)
			'stretchScale' : '1', // Stretched Scale
			'imageScale' : '1', // Image Scale
			'rotate' : '0', // Rotation (Degree, 0 - 360)
			'xSlice' : '1',
			'ySlice' : '1',
			'xCount' : '0',
			'yCount' : '0'
				// Default Offset?
	};
	
	// Overwrites Parameter above if extra parameters were provided
	if (extraParams != undefined) {
		for (var key in extraParams) {
			if (detailObject[key] != undefined) {
				detailObject[key] = extraParams[key];
			}
		}
	}
	
	if (extraParams != undefined && extraParams.parentId != undefined && extraParams.childType != undefined) {
		if (detailObjects[imageType][extraParams.parentId] == undefined) {
			throw new Error('No such parent!');
		}
		if (detailObjects[imageType][extraParams.parentId][extraParams.childType] == undefined) {
			detailObjects[imageType][extraParams.parentId][extraParams.childType] = {};
		}
		detailObjects[imageType][extraParams.parentId][extraParams.childType] = detailObject;
	} else {
		detailObjects[imageType][uid] = detailObject;
	}
	
	return uid;
};

cadv.drawDetail = function(detailObject, parentObject) {
	if (oldObjects[detailObject.type][detailObject.id] == undefined) {
		oldObjects[detailObject.type][detailObject.id] = $.extend({}, detailObject);
	}
	
	detailObject.canvasObject.width = canvas.width; detailObject.canvasObject.height = canvas.height;
	if (parentObject !== undefined) {
		detailObject.canvasObject.width = cadv.system.width;
		detailObject.canvasObject.height = cadv.system.height;
		// Need calculate both to acquire enough canvas size
	}
	var ncContext = detailObject.canvasObject.getContext('2d');
	
	var scale = canvas.width / detailObject.imageObject.width;
	detailObject.stretchScale = scale;
	scale *= detailObject.imageScale;
	
	if (detailObject.stretch) {
		detailObject.iWidth = detailObject.imageObject.width * detailObject.imageScale;
		detailObject.iHeight = detailObject.imageObject.height * detailObject.imageScale;
		ncContext.scale(scale * parseInt(detailObject.hFlip), scale * parseInt(detailObject.vFlip));
	} else {
		if (parentObject !== undefined) {
			ncContext.scale(detailObject.hFlip * detailObject.imageScale, detailObject.vFlip * detailObject.imageScale);
		} else {
			// ncContext.scale(detailObject.hFlip * detailObject.imageScale * cadv.system.screenscale, detailObject.vFlip * detailObject.imageScale * cadv.system.screenscale);
			ncContext.scale(detailObject.hFlip * detailObject.imageScale, detailObject.vFlip * detailObject.imageScale);
		}
	}
	
	var useOriginX = detailObject.originX, useOriginY = detailObject.originY;
	if (useOriginX.indexOf('%') != 0) {
		useOriginX = detailObject.imageObject.width * (parseInt(useOriginX) / 100);
	}
	if (useOriginY.indexOf('%') != 0) {
		useOriginY = detailObject.imageObject.height * (parseInt(useOriginY) / 100);
	}
	
	ncContext.translate(useOriginX, useOriginY);
	if (parseInt(detailObject.rotate) != 0) {
		ncContext.rotate(detailObject.rotate * (Math.PI/180));
	}
	ncContext.translate(-useOriginX, -useOriginY);
	
	ncContext.globalAlpha = detailObject.opac;
	
	var useX = detailObject.x;
	var useY = detailObject.y;
	var prevXPercent = oldObjects[detailObject.type][detailObject.id]['percentX'];
	var prevYPercent = oldObjects[detailObject.type][detailObject.id]['percentY'];
	if (detailObject.percentX != prevXPercent) {
		useX = ((detailObject.iWidth - detailObject.imageObject.width) / detailObject.imageScale) * (parseInt(detailObject.percentX) / 100) * -1; // This Works
		// useX = ((this.iWidth - canvas.width) / this.iScale) * (parseInt(this.percentX) / 100) * -1;
		if (!isFinite(useX)) {
			useX = '0';
		}
		detailObject.x = useX;
	} else {
		// Renew percent X
		detailObject.percentX = ((detailObject.x / ((detailObject.iWidth - detailObject.imageObject.width) / detailObject.imageScale)) * -100);
		if (!isFinite(detailObject.percentX)) {
			detailObject.percentX = '0';
		}
	}
	
	// TODO: Logic for Percent Y differs from Percent X, needs more testing
	if (detailObject.percentY != prevYPercent) {
		var useScale = detailObject.imageScale;
		if (detailObject.stretch) {
			useScale = detailObject.stretchScale * detailObject.imageScale;
		}
		// useY = ((this.iHeight - image.height) / this.iScale) * (parseInt(this.percentY) / 100) * -1; // Not Working
		useY = ((detailObject.imageObject.height - (canvas.height / useScale))) * (parseInt(detailObject.percentY) / 100) * -1; // It works!
		if (!isFinite(useY)) {
			useY = '0';
		}
		detailObject.y = useY;
	} else {
		// Renew percent Y
		detailObject.percentY = ((detailObject.y / ((detailObject.iHeight - detailObject.imageObject.height) / detailObject.imageObject.iScale)) * -100);
		if (!isFinite(detailObject.percentY)) {
			detailObject.percentY = '0';
		}
	}
	// log(useY);
	
	if (detailObject.xSlice == '1' && detailObject.ySlice == '1') {
		// ncContext.drawImage(detailObject.imageObject, useX, useY, detailObject.imageObject.width * cadv.system.screenscale, detailObject.imageObject.height * cadv.system.screenscale);
		// ncContext.drawImage(detailObject.imageObject, 0, 0, detailObject.imageObject.width, detailObject.imageObject.height, useX, useY, detailObject.imageObject.width * cadv.system.screenscale, detailObject.imageObject.height * cadv.system.screenscale);
		ncContext.drawImage(detailObject.imageObject, 0, 0, detailObject.imageObject.width, detailObject.imageObject.height, useX, useY, detailObject.imageObject.width, detailObject.imageObject.height);
	} else {
		var xSize = detailObject.imageObject.width / detailObject.xSlice;
		var ySize = detailObject.imageObject.height / detailObject.ySlice;
		var xOffset = xSize * parseInt(detailObject.xCount);
		var yOffset = ySize * parseInt(detailObject.yCount);
		ncContext.drawImage(detailObject.imageObject, xOffset, yOffset, xSize, ySize, parseFloat(useX) + parseFloat(parentObject.x), parseFloat(useY) + parseFloat(parentObject.y), xSize, ySize);
		
		// log(ySize);
		
		delete xSize, ySize, xOffset, yOffset;
	}
	
	oldObjects[detailObject.type][detailObject.id] = $.extend({}, detailObject);
	
	if (detailObject.type == 'characters' && detailObject.face != undefined) {
		ncContext.drawImage(this.drawDetail(detailObject.face, detailObject), 0, 0);
	}
	
	delete ncContext, useX, useY;
	return detailObject.canvasObject;
};

// Modify for other uses (Shooter, RPG, etc...)
cadv.drawCanvas = function() {
	
	var widthOffset = 0;
	var heightOffset = 0;
	
	if (true || cadv.system.screenscale != '1.0') {
		widthOffset = Math.round(window.innerWidth - (cadv.system.width * cadv.system.screenscale));
		heightOffset = Math.round(window.innerHeight - (cadv.system.height * cadv.system.screenscale));
		// log($(window).height());
	}
	//*/
	
	// DEV NOTES: 
	// http://stackoverflow.com/questions/18565395/why-does-canvas-context-drawimage-fail-on-iphone
	// Explains canvasContext.drawImage (with 9 params) not working on iPhone but the one with 5 params does.
	
	// Background Layer
	for (var uid in detailObjects.backgrounds) {
		if (isMobile()) {
			// canvasContext.drawImage(this.drawDetail(detailObjects.backgrounds[uid]), widthOffset, heightOffset, canvas.width, canvas.height);
			canvasContext.drawImage(this.drawDetail(detailObjects.backgrounds[uid]), 0, 0, canvas.width, canvas.height);
		} else {
			// canvasContext.drawImage(this.drawDetail(detailObjects.backgrounds[uid]), 0, 0, cadv.system.width * cadv.system.screenscale, cadv.system.height * cadv.system.screenscale, widthOffset, heightOffset, cadv.system.width * cadv.system.screenscale, cadv.system.height * cadv.system.screenscale);
			// canvasContext.drawImage(this.drawDetail(detailObjects.backgrounds[uid]), 0, 0, cadv.system.width, cadv.system.height, widthOffset, heightOffset, cadv.system.width, cadv.system.height);
			canvasContext.drawImage(this.drawDetail(detailObjects.backgrounds[uid]), 0, 0, cadv.system.width, cadv.system.height, 0, 0, cadv.system.width, cadv.system.height);
		}
	}
	
	for (var uid in detailObjects.characters) {
		if (isMobile()) {
			// canvasContext.drawImage(this.drawDetail(detailObjects.characters[uid]), widthOffset, heightOffset, canvas.width, canvas.height);
			canvasContext.drawImage(this.drawDetail(detailObjects.characters[uid]), 0, 0, canvas.width, canvas.height);
		} else {
			// canvasContext.drawImage(this.drawDetail(detailObjects.characters[uid]), 0, 0, cadv.system.width * cadv.system.screenscale, cadv.system.height * cadv.system.screenscale, widthOffset, heightOffset, cadv.system.width * cadv.system.screenscale, cadv.system.height * cadv.system.screenscale);
			// canvasContext.drawImage(this.drawDetail(detailObjects.characters[uid]), 0, 0, cadv.system.width, cadv.system.height, widthOffset, heightOffset, cadv.system.width, cadv.system.height);
			canvasContext.drawImage(this.drawDetail(detailObjects.characters[uid]), 0, 0, cadv.system.width, cadv.system.height, 0, 0, cadv.system.width, cadv.system.height);
		}
	}
	
	for (var uid in detailObjects.messagewindow) {
		if (isMobile()) {
			// canvasContext.drawImage(this.drawDetail(detailObjects.messagewindow[uid]), widthOffset, heightOffset, canvas.width, canvas.height);
			canvasContext.drawImage(this.drawDetail(detailObjects.messagewindow[uid]), 0, 0, canvas.width, canvas.height);
		} else {
			// canvasContext.drawImage(this.drawDetail(detailObjects.messagewindow[uid]), 0, 0, cadv.system.width, cadv.system.height, widthOffset, heightOffset, cadv.system.width * cadv.system.screenscale, cadv.system.height * cadv.system.screenscale);
			// canvasContext.drawImage(this.drawDetail(detailObjects.messagewindow[uid]), 0, 0, cadv.system.width, cadv.system.height, widthOffset, heightOffset, cadv.system.width, cadv.system.height);
			canvasContext.drawImage(this.drawDetail(detailObjects.messagewindow[uid]), 0, 0, cadv.system.width, cadv.system.height, 0, 0, cadv.system.width, cadv.system.height);
		}
	}
	
	// Text output
	/*
	if (detailObjects.messagewindow.base != undefined) {
		// log(parseInt(cadv.textOut.left) + (detailObjects.messagewindow.base.x) + widthOffset);
		$('div#textout').css('left', ((parseInt(cadv.textOut.left) + (detailObjects.messagewindow.base.x)) * cadv.system.screenscale) + widthOffset + 'px');
		// $('div#textout').css('left', '1280px');
		// $('div#textout').css('top', parseInt(cadv.textOut.top) + (detailObjects.messagewindow.base.y) + heightOffset + 'px');
		$('div#textout').css('top', ((parseInt(cadv.textOut.top) + (detailObjects.messagewindow.base.y)) * cadv.system.screenscale) + heightOffset + 'px');
		// $('div#textout').css('zoom', cadv.system.screenscale); // Need to renew every refresh
		$('div#textout').css('transform', 'scale(' + cadv.system.screenscale + ')'); // Need to renew every refresh
		$('div#textout').css('transform-origin', '0% 0%');
		// log(((parseInt(cadv.textOut.top) + (detailObjects.messagewindow.base.y)) * cadv.system.screenscale));
	}
	//*/
	
	
};

cadv.resetCanvas = function() {
	canvasContext.clearRect(0, 0, canvas.width, canvas.height);
	canvasContext.fillStyle = cadv.system.defaultbgcolor;
	canvasContext.fillRect(0, 0, canvas.width, canvas.height);
	
	// Reset fillStyle
	canvasContext.fillStyle = '';
	
	// Save state
	canvasContext.save();
	
	// Apply Screen Scaling
	canvasContext.scale(cadv.system.screenscale, cadv.system.screenscale);
	
	// Redraw everything & restore state
	cadv.drawCanvas();
	canvasContext.restore();
		
	return canvasRefresh; // For jQuery.fx.timer
};

cadv.setPosition = function() {
	if (detailObjects.messagewindow == undefined) {
		log('Message Window not ready!');
		setTimeout(cadv.setPosition, 500);
		return;
	}
	
	// TODO: Center canvas content if browser width is larger than canvas contents, even if scale not applied?
	
	if (cadv.system.screenscale != 1.0) {
		var widthOffset = Math.round(window.innerWidth - (cadv.system.width * cadv.system.screenscale)) / 2;
		var heightOffset = Math.round(window.innerHeight - (cadv.system.height * cadv.system.screenscale)) / 2;
		
		if (cadv.system.screenscale <= 0.5) {
			heightOffset = 0;
			// $('body').css('height', (cadv.system.height / 2) + 'px');
		}
		
		$('canvas#cadv').css({
			'position' : 'fixed', // absolute?
			'left' : widthOffset + 'px',
			'top' : heightOffset + 'px'
		});
		
		$('div#textout').css({
			'left' : ((parseInt(cadv.textOut.left) + (detailObjects.messagewindow.base.x)) * cadv.system.screenscale) + widthOffset + 'px',
			'top' : ((parseInt(cadv.textOut.top) + (detailObjects.messagewindow.base.y)) * cadv.system.screenscale) + heightOffset + 'px',
			'transform' : 'scale(' + cadv.system.screenscale + ')',
			'transform-origin' : '0% 0%'
		});
	} else {
		$('div#textout').css({
			'left' : (parseInt(cadv.textOut.left) + (detailObjects.messagewindow.base.x)) + 'px',
			'top' : (parseInt(cadv.textOut.top) + (detailObjects.messagewindow.base.y)) + 'px',
		});
	}
};

cadv.start = function(callback) {
	canvasRefresh = true;
	jQuery.fx.timer(this.resetCanvas);
	
	if (callback !== undefined && typeof(callback) == 'function') {
		callback();
	}
	
	// Besure to remember to set MessageBox in callback
	cadv.setPosition();
};

cadv.stop = function() {
	canvasRefresh = false;
};

cadv.init = function(callback) {
	// Initialize Canvas
	canvas = document.createElement('canvas');
	canvas.id = 'cadv';
	canvas.width = cadv.system.width;
	canvas.height = cadv.system.height;
	canvasContext = canvas.getContext('2d');
	
	// Append Canvas to HTML Document(Body)
	$('body').empty().append(canvas).css('background-color', cadv.system.defaultbgcolor);
	
	// Default CSS settings for all browsers
	$('head').prepend('<style>*{padding:0;margin:0;}::-webkit-scrollbar{display: none;}canvas{vertical-align:top;}</style>');
	
	var timer = setInterval(function() {
		if ((Object.keys(preload.images).length + Object.keys(preload.audios).length - loadErrors) == (Object.keys(resources.images).length + Object.keys(resources.audios).length)) {
			clearTimeout(timer);
			
			// Create Text Output
			var newDiv = document.createElement('div');
			newDiv.id = 'textout';
			newDiv.style.cssText = '';
			for (var key in cadv.textOut) {
				newDiv.style.cssText += (' ' + key + ': ' + cadv.textOut[key] + ';');
			}
			
			$('body').append(newDiv);
			cadv.system.textselector = $('div#textout');
			
			// If autoscaling enabled
			if (cadv.system.autoscale) {
				cadv.performScaling();
			}
			
			if (callback !== undefined && typeof(callback) == 'function') {
				callback();
			} else {
				// Ladies and Gentlemen, start your engines!
				//cadv.start();
			}
			
		}
	}, 500);
	
	
};

// CADV Utilities
// EYE Related
cadv.startWink = function() {
	
};

// MOUTH Related
cadv.enableTextlip = function() {
	
};

// Work In Progress
// cadv.enableAudiolip = function() {};

// CLIPPING Related

// TEXT Related
cadv.textWriter = function(inputString) {
	
	// var textvisual = BADV.textvisual;
	// var outputElement = textvisual._outputElement;
	var inputLength = inputString.length;
	var textPosition = 0;
	var writerTimer = null;
	
	/*
	var doLipSync = false;
	if (lipElement !== undefined) {
		doLipSync = true;
	}
	//*/
	
	function outputText() {
		// FIXME: Might hang if tag not closed
		switch(inputLength.charAt(textPosition)) {
			case '<':
				// Tag Striper (example: <span>)
				while(inputLength.charAt(textPosition) != '>') {
					textPosition++;
				}
				break;
			case '&':
				// HTML Symbol Skipper (example: &amp;)
				while(inputLength.charAt(textPosition) != ';') {
					textPosition++;
				}
				break;
			default:
				// Add Position Value
				textPosition++;
				break;
		}
		
		$(outputElement).html(inputString.substring(0, textPosition));
		
		// Experimental Lip Sync
		/*
		if (doLipSync) {
			var currentChar = inputString.charAt(textPosition);
			var lipPos = 0;
			var lipHeight = parseInt($(lipElement).css('height') / 6); // Auto Detect
			if (textvisual._aLip.indexOf(currentChar) !== -1) {
				lipPos = 1;
			} else if (textvisual._iLip.indexOf(currentChar) !== -1) {
				lipPos = 2;
			} else if (textvisual._uLip.indexOf(currentChar) !== -1) {
				lipPos = 3;
			} else if (textvisual._eLip.indexOf(currentChar) !== -1) {
				lipPos = 4;
			} else if (textvisual._oLip.indexOf(currentChar) !== -1) {
				lipPos = 5;
			}
			$(lipElement).css('background-position', '0px ' + (lipPos * -lipHeight) + 'px');
		}
		//*/
		
		// Break Condition
		if (textPosition == inputLength || false) { // textvisual._outputingText == false) {
			$(outputElement).html(inputString.substring(0, inputLength)); // Complete text
			textvisual._outputingText = false;
			
			// Show Button?
			//showButton();
			
			/*
			setTimeout(function() {
				$(lipElement).css('background-position', '0px 0px');
			}, BADV.config._intervalPerFrame);
			//*/
			
			// Delete variable to lessen memory consumption
			// FIXME: (Not helping at all?, Remove?)
			delete inputLength;
			delete textPosition;
			delete writerTimer;
		} else {
			// Call again.
			writerTimer = setTimeout(outputText, Math.floor(1000 / cadv.system.textspeed));
		}
	}
	
	// textvisual._outputingText = true;
	writerTimer = setTimeout(outputText, Math.floor(1000 / cadv.system.textspeed));
	//*/
};

// Event Listeners
$(window).resize(function(e) {
	e.preventDefault();
	if (cadv.system.autoscale) {
		$(window).resize(cadv.performScaling);
	}
	
	cadv.setPosition();
});

// jQuery PLUGINs
/*
 * jQuery Easing v1.3 - http://gsgd.co.uk/sandbox/jquery/easing/
 *
 * Uses the built in easing capabilities added In jQuery 1.1
 * to offer multiple easing options
 *
 * TERMS OF USE - jQuery Easing
 * 
 * Open source under the BSD License. 
 * 
 * Copyright © 2008 George McGinley Smith
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without modification, 
 * are permitted provided that the following conditions are met:
 * 
 * Redistributions of source code must retain the above copyright notice, this list of 
 * conditions and the following disclaimer.
 * Redistributions in binary form must reproduce the above copyright notice, this list 
 * of conditions and the following disclaimer in the documentation and/or other materials 
 * provided with the distribution.
 * 
 * Neither the name of the author nor the names of contributors may be used to endorse 
 * or promote products derived from this software without specific prior written permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY 
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE
 *  COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 *  EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE
 *  GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED 
 * AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 *  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED 
 * OF THE POSSIBILITY OF SUCH DAMAGE. 
 *
*/
jQuery.easing.jswing=jQuery.easing.swing;jQuery.extend(jQuery.easing,{def:"easeOutQuad",swing:function(e,f,a,h,g){return jQuery.easing[jQuery.easing.def](e,f,a,h,g)},easeInQuad:function(e,f,a,h,g){return h*(f/=g)*f+a},easeOutQuad:function(e,f,a,h,g){return -h*(f/=g)*(f-2)+a},easeInOutQuad:function(e,f,a,h,g){if((f/=g/2)<1){return h/2*f*f+a}return -h/2*((--f)*(f-2)-1)+a},easeInCubic:function(e,f,a,h,g){return h*(f/=g)*f*f+a},easeOutCubic:function(e,f,a,h,g){return h*((f=f/g-1)*f*f+1)+a},easeInOutCubic:function(e,f,a,h,g){if((f/=g/2)<1){return h/2*f*f*f+a}return h/2*((f-=2)*f*f+2)+a},easeInQuart:function(e,f,a,h,g){return h*(f/=g)*f*f*f+a},easeOutQuart:function(e,f,a,h,g){return -h*((f=f/g-1)*f*f*f-1)+a},easeInOutQuart:function(e,f,a,h,g){if((f/=g/2)<1){return h/2*f*f*f*f+a}return -h/2*((f-=2)*f*f*f-2)+a},easeInQuint:function(e,f,a,h,g){return h*(f/=g)*f*f*f*f+a},easeOutQuint:function(e,f,a,h,g){return h*((f=f/g-1)*f*f*f*f+1)+a},easeInOutQuint:function(e,f,a,h,g){if((f/=g/2)<1){return h/2*f*f*f*f*f+a}return h/2*((f-=2)*f*f*f*f+2)+a},easeInSine:function(e,f,a,h,g){return -h*Math.cos(f/g*(Math.PI/2))+h+a},easeOutSine:function(e,f,a,h,g){return h*Math.sin(f/g*(Math.PI/2))+a},easeInOutSine:function(e,f,a,h,g){return -h/2*(Math.cos(Math.PI*f/g)-1)+a},easeInExpo:function(e,f,a,h,g){return(f==0)?a:h*Math.pow(2,10*(f/g-1))+a},easeOutExpo:function(e,f,a,h,g){return(f==g)?a+h:h*(-Math.pow(2,-10*f/g)+1)+a},easeInOutExpo:function(e,f,a,h,g){if(f==0){return a}if(f==g){return a+h}if((f/=g/2)<1){return h/2*Math.pow(2,10*(f-1))+a}return h/2*(-Math.pow(2,-10*--f)+2)+a},easeInCirc:function(e,f,a,h,g){return -h*(Math.sqrt(1-(f/=g)*f)-1)+a},easeOutCirc:function(e,f,a,h,g){return h*Math.sqrt(1-(f=f/g-1)*f)+a},easeInOutCirc:function(e,f,a,h,g){if((f/=g/2)<1){return -h/2*(Math.sqrt(1-f*f)-1)+a}return h/2*(Math.sqrt(1-(f-=2)*f)+1)+a},easeInElastic:function(f,h,e,l,k){var i=1.70158;var j=0;var g=l;if(h==0){return e}if((h/=k)==1){return e+l}if(!j){j=k*0.3}if(g<Math.abs(l)){g=l;var i=j/4}else{var i=j/(2*Math.PI)*Math.asin(l/g)}return -(g*Math.pow(2,10*(h-=1))*Math.sin((h*k-i)*(2*Math.PI)/j))+e},easeOutElastic:function(f,h,e,l,k){var i=1.70158;var j=0;var g=l;if(h==0){return e}if((h/=k)==1){return e+l}if(!j){j=k*0.3}if(g<Math.abs(l)){g=l;var i=j/4}else{var i=j/(2*Math.PI)*Math.asin(l/g)}return g*Math.pow(2,-10*h)*Math.sin((h*k-i)*(2*Math.PI)/j)+l+e},easeInOutElastic:function(f,h,e,l,k){var i=1.70158;var j=0;var g=l;if(h==0){return e}if((h/=k/2)==2){return e+l}if(!j){j=k*(0.3*1.5)}if(g<Math.abs(l)){g=l;var i=j/4}else{var i=j/(2*Math.PI)*Math.asin(l/g)}if(h<1){return -0.5*(g*Math.pow(2,10*(h-=1))*Math.sin((h*k-i)*(2*Math.PI)/j))+e}return g*Math.pow(2,-10*(h-=1))*Math.sin((h*k-i)*(2*Math.PI)/j)*0.5+l+e},easeInBack:function(e,f,a,i,h,g){if(g==undefined){g=1.70158}return i*(f/=h)*f*((g+1)*f-g)+a},easeOutBack:function(e,f,a,i,h,g){if(g==undefined){g=1.70158}return i*((f=f/h-1)*f*((g+1)*f+g)+1)+a},easeInOutBack:function(e,f,a,i,h,g){if(g==undefined){g=1.70158}if((f/=h/2)<1){return i/2*(f*f*(((g*=(1.525))+1)*f-g))+a}return i/2*((f-=2)*f*(((g*=(1.525))+1)*f+g)+2)+a},easeInBounce:function(e,f,a,h,g){return h-jQuery.easing.easeOutBounce(e,g-f,0,h,g)+a},easeOutBounce:function(e,f,a,h,g){if((f/=g)<(1/2.75)){return h*(7.5625*f*f)+a}else{if(f<(2/2.75)){return h*(7.5625*(f-=(1.5/2.75))*f+0.75)+a}else{if(f<(2.5/2.75)){return h*(7.5625*(f-=(2.25/2.75))*f+0.9375)+a}else{return h*(7.5625*(f-=(2.625/2.75))*f+0.984375)+a}}}},easeInOutBounce:function(e,f,a,h,g){if(f<g/2){return jQuery.easing.easeInBounce(e,f*2,0,h,g)*0.5+a}return jQuery.easing.easeOutBounce(e,f*2-g,0,h,g)*0.5+h*0.5+a}});
/*
 *
 * TERMS OF USE - EASING EQUATIONS
 * 
 * Open source under the BSD License. 
 * 
 * Copyright © 2001 Robert Penner
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without modification, 
 * are permitted provided that the following conditions are met:
 * 
 * Redistributions of source code must retain the above copyright notice, this list of 
 * conditions and the following disclaimer.
 * Redistributions in binary form must reproduce the above copyright notice, this list 
 * of conditions and the following disclaimer in the documentation and/or other materials 
 * provided with the distribution.
 * 
 * Neither the name of the author nor the names of contributors may be used to endorse 
 * or promote products derived from this software without specific prior written permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY 
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE
 *  COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 *  EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE
 *  GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED 
 * AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 *  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED 
 * OF THE POSSIBILITY OF SUCH DAMAGE. 
 *
 */

/*!
* screenfull
* v1.2.0 - 2014-04-29
* https://github.com/sindresorhus/screenfull.js
* (c) Sindre Sorhus; MIT License
*/
!function(){"use strict";var a="undefined"!=typeof module&&module.exports,b="undefined"!=typeof Element&&"ALLOW_KEYBOARD_INPUT"in Element,c=function(){for(var a,b,c=[["requestFullscreen","exitFullscreen","fullscreenElement","fullscreenEnabled","fullscreenchange","fullscreenerror"],["webkitRequestFullscreen","webkitExitFullscreen","webkitFullscreenElement","webkitFullscreenEnabled","webkitfullscreenchange","webkitfullscreenerror"],["webkitRequestFullScreen","webkitCancelFullScreen","webkitCurrentFullScreenElement","webkitCancelFullScreen","webkitfullscreenchange","webkitfullscreenerror"],["mozRequestFullScreen","mozCancelFullScreen","mozFullScreenElement","mozFullScreenEnabled","mozfullscreenchange","mozfullscreenerror"],["msRequestFullscreen","msExitFullscreen","msFullscreenElement","msFullscreenEnabled","MSFullscreenChange","MSFullscreenError"]],d=0,e=c.length,f={};e>d;d++)if(a=c[d],a&&a[1]in document){for(d=0,b=a.length;b>d;d++)f[c[0][d]]=a[d];return f}return!1}(),d={request:function(a){var d=c.requestFullscreen;a=a||document.documentElement,/5\.1[\.\d]* Safari/.test(navigator.userAgent)?a[d]():a[d](b&&Element.ALLOW_KEYBOARD_INPUT)},exit:function(){document[c.exitFullscreen]()},toggle:function(a){this.isFullscreen?this.exit():this.request(a)},onchange:function(){},onerror:function(){},raw:c};return c?(Object.defineProperties(d,{isFullscreen:{get:function(){return!!document[c.fullscreenElement]}},element:{enumerable:!0,get:function(){return document[c.fullscreenElement]}},enabled:{enumerable:!0,get:function(){return!!document[c.fullscreenEnabled]}}}),document.addEventListener(c.fullscreenchange,function(a){d.onchange.call(d,a)}),document.addEventListener(c.fullscreenerror,function(a){d.onerror.call(d,a)}),void(a?module.exports=d:window.screenfull=d)):void(a?module.exports=!1:window.screenfull=!1)}();

//Copyright (c) 2013 Pieroxy <pieroxy@pieroxy.net>
//This work is free. You can redistribute it and/or modify it
//under the terms of the WTFPL, Version 2
//For more information see LICENSE.txt or http://www.wtfpl.net/
//
//For more information, the home page:
//http://pieroxy.net/blog/pages/lz-string/testing.html
//
//LZ-based compression algorithm, version 1.4.4
var LZString=function(){function o(o,r){if(!t[o]){t[o]={};for(var n=0;n<o.length;n++)t[o][o.charAt(n)]=n}return t[o][r]}var r=String.fromCharCode,n="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",e="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+-$",t={},i={compressToBase64:function(o){if(null==o)return"";var r=i._compress(o,6,function(o){return n.charAt(o)});switch(r.length%4){default:case 0:return r;case 1:return r+"===";case 2:return r+"==";case 3:return r+"="}},decompressFromBase64:function(r){return null==r?"":""==r?null:i._decompress(r.length,32,function(e){return o(n,r.charAt(e))})},compressToUTF16:function(o){return null==o?"":i._compress(o,15,function(o){return r(o+32)})+" "},decompressFromUTF16:function(o){return null==o?"":""==o?null:i._decompress(o.length,16384,function(r){return o.charCodeAt(r)-32})},compressToUint8Array:function(o){for(var r=i.compress(o),n=new Uint8Array(2*r.length),e=0,t=r.length;t>e;e++){var s=r.charCodeAt(e);n[2*e]=s>>>8,n[2*e+1]=s%256}return n},decompressFromUint8Array:function(o){if(null===o||void 0===o)return i.decompress(o);for(var n=new Array(o.length/2),e=0,t=n.length;t>e;e++)n[e]=256*o[2*e]+o[2*e+1];var s=[];return n.forEach(function(o){s.push(r(o))}),i.decompress(s.join(""))},compressToEncodedURIComponent:function(o){return null==o?"":i._compress(o,6,function(o){return e.charAt(o)})},decompressFromEncodedURIComponent:function(r){return null==r?"":""==r?null:(r=r.replace(/ /g,"+"),i._decompress(r.length,32,function(n){return o(e,r.charAt(n))}))},compress:function(o){return i._compress(o,16,function(o){return r(o)})},_compress:function(o,r,n){if(null==o)return"";var e,t,i,s={},p={},u="",c="",a="",l=2,f=3,h=2,d=[],m=0,v=0;for(i=0;i<o.length;i+=1)if(u=o.charAt(i),Object.prototype.hasOwnProperty.call(s,u)||(s[u]=f++,p[u]=!0),c=a+u,Object.prototype.hasOwnProperty.call(s,c))a=c;else{if(Object.prototype.hasOwnProperty.call(p,a)){if(a.charCodeAt(0)<256){for(e=0;h>e;e++)m<<=1,v==r-1?(v=0,d.push(n(m)),m=0):v++;for(t=a.charCodeAt(0),e=0;8>e;e++)m=m<<1|1&t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t>>=1}else{for(t=1,e=0;h>e;e++)m=m<<1|t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t=0;for(t=a.charCodeAt(0),e=0;16>e;e++)m=m<<1|1&t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t>>=1}l--,0==l&&(l=Math.pow(2,h),h++),delete p[a]}else for(t=s[a],e=0;h>e;e++)m=m<<1|1&t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t>>=1;l--,0==l&&(l=Math.pow(2,h),h++),s[c]=f++,a=String(u)}if(""!==a){if(Object.prototype.hasOwnProperty.call(p,a)){if(a.charCodeAt(0)<256){for(e=0;h>e;e++)m<<=1,v==r-1?(v=0,d.push(n(m)),m=0):v++;for(t=a.charCodeAt(0),e=0;8>e;e++)m=m<<1|1&t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t>>=1}else{for(t=1,e=0;h>e;e++)m=m<<1|t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t=0;for(t=a.charCodeAt(0),e=0;16>e;e++)m=m<<1|1&t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t>>=1}l--,0==l&&(l=Math.pow(2,h),h++),delete p[a]}else for(t=s[a],e=0;h>e;e++)m=m<<1|1&t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t>>=1;l--,0==l&&(l=Math.pow(2,h),h++)}for(t=2,e=0;h>e;e++)m=m<<1|1&t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t>>=1;for(;;){if(m<<=1,v==r-1){d.push(n(m));break}v++}return d.join("")},decompress:function(o){return null==o?"":""==o?null:i._decompress(o.length,32768,function(r){return o.charCodeAt(r)})},_decompress:function(o,n,e){var t,i,s,p,u,c,a,l,f=[],h=4,d=4,m=3,v="",w=[],A={val:e(0),position:n,index:1};for(i=0;3>i;i+=1)f[i]=i;for(p=0,c=Math.pow(2,2),a=1;a!=c;)u=A.val&A.position,A.position>>=1,0==A.position&&(A.position=n,A.val=e(A.index++)),p|=(u>0?1:0)*a,a<<=1;switch(t=p){case 0:for(p=0,c=Math.pow(2,8),a=1;a!=c;)u=A.val&A.position,A.position>>=1,0==A.position&&(A.position=n,A.val=e(A.index++)),p|=(u>0?1:0)*a,a<<=1;l=r(p);break;case 1:for(p=0,c=Math.pow(2,16),a=1;a!=c;)u=A.val&A.position,A.position>>=1,0==A.position&&(A.position=n,A.val=e(A.index++)),p|=(u>0?1:0)*a,a<<=1;l=r(p);break;case 2:return""}for(f[3]=l,s=l,w.push(l);;){if(A.index>o)return"";for(p=0,c=Math.pow(2,m),a=1;a!=c;)u=A.val&A.position,A.position>>=1,0==A.position&&(A.position=n,A.val=e(A.index++)),p|=(u>0?1:0)*a,a<<=1;switch(l=p){case 0:for(p=0,c=Math.pow(2,8),a=1;a!=c;)u=A.val&A.position,A.position>>=1,0==A.position&&(A.position=n,A.val=e(A.index++)),p|=(u>0?1:0)*a,a<<=1;f[d++]=r(p),l=d-1,h--;break;case 1:for(p=0,c=Math.pow(2,16),a=1;a!=c;)u=A.val&A.position,A.position>>=1,0==A.position&&(A.position=n,A.val=e(A.index++)),p|=(u>0?1:0)*a,a<<=1;f[d++]=r(p),l=d-1,h--;break;case 2:return w.join("")}if(0==h&&(h=Math.pow(2,m),m++),f[l])v=f[l];else{if(l!==d)return null;v=s+s.charAt(0)}w.push(v),f[d++]=s+v.charAt(0),h--,s=v,0==h&&(h=Math.pow(2,m),m++)}}};return i}();"function"==typeof define&&define.amd?define(function(){return LZString}):"undefined"!=typeof module&&null!=module&&(module.exports=LZString);

// END OF FILE

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
 * (For $.Animation and Selector, will be replaced one I figured out an alternate solution)
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
 * Video format:
 * Suggests WebM-VP9.
 * Please check the browser's codec support.
 * 
 * Bundled Library / Plugin:
 * jQuery easing
 * ScreenFull
 * 
 * @author KiddoKenshin @ K2-R&D.com
 * @since 2012/04/01, RE: 2013/01/17, TRE: 2013/12/13, C-ADV: 2014/05/26
 * @version -WORK IN PROGRESS-
 * 
 * Current Progress: Audio Related
 * TODO: Split CADV functions to more obvious call style? Example: cadv.public.functionName, cadv.private.functionName
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

////////////////////
// Indexed DB
////////////////////
// TODO: Move into CADV object as it only uses in preload?
var iDB;
var iDBInit = false;
/**
 * Initialize Indexed DB to be used as local content manager. (Async)
 * 
 * @returns void
 */
function initDB() {
	iDB = null;
	if (!window.indexedDB) {
		log('Indexed DB not available');
		iDBInit = true;
		return;
	}
	
	var dbRequest = indexedDB.open('CADV_DB', 1); // Doesn't work in FireFox during Private Mode.
	dbRequest.onupgradeneeded = function(event) {
		// createObjectStore only works in OnUpgradeNeeded
		log('Initializing DB...');
		iDB = dbRequest.result;
		if(!iDB.objectStoreNames.contains('imageStorage')) {
			iDB.createObjectStore('imageStorage');
			log('imageStorage Created');
		}
		if(!iDB.objectStoreNames.contains('audioStorage')) {
			iDB.createObjectStore('audioStorage');
			log('audioStorage Created');
		}
		if(!iDB.objectStoreNames.contains('videoStorage')) {
			iDB.createObjectStore('videoStorage');
			log('videoStorage Created');
		}
	};
	dbRequest.onsuccess = function(event) {
		iDB = dbRequest.result;
		iDBInit = true;
		log('DB Opened!');
	};
	dbRequest.onerror = function(event) {
		iDBInit = true;
		log('DB Failed!');
	};
}

/**
 * Stores data to Indexed DB for later usage. (Async)
 * 
 * @param string resourceType | images, audios, videos
 * @param string uid | unique id to be use later
 * @param ArrayBuufer/Blob dataObject | the data to be store
 * @returns void
 */
function storeToIndexedDB(resourceType, uid, dataObject) {
	if (iDB == null) {
		log('iDB not available');
		return;
	}
	
	var useStorage = resourceType.substring(0, resourceType.length - 1) + 'Storage';
	var dbTransactions = iDB.transaction([useStorage], 'readwrite');
	var dbStorage = dbTransactions.objectStore(useStorage);
	var storeRequest = dbStorage.put(dataObject, uid);
	storeRequest.onsuccess = function(event) {
		log(uid + '(' + resourceType + ') stored.');
	};
	storeRequest.onerror = function(event) {
		log(uid + '(' + resourceType + ') error while put into DB.');
	};
}

/**
 * Retrieves data from Indexed DB. (Async)
 * 
 * @param string resourceType | images, audios, videos
 * @param string uid | unique id to be use later
 * @param function callback | refer to storageCallback in cadv.startPreloadResources
 * @returns void
 */
function getFromIndexedDB(resourceType, uid, callback) {
	if (iDB == null) {
		log('iDB not available');
		callback(resourceType, uid, null);
		return;
	}
	
	var useStorage = resourceType.substring(0, resourceType.length - 1) + 'Storage';
	var dbTransactions = iDB.transaction([useStorage], 'readwrite');
	var dbStorage = dbTransactions.objectStore(useStorage);
	var storeRequest = dbStorage.get(uid);
	storeRequest.onsuccess = function(event) {
		log(uid + '(' + resourceType + ') loaded.');
		callback(resourceType, uid, storeRequest.result);
	};
	storeRequest.onerror = function(event) {
		log(uid + '(' + resourceType + ') failed on retrieving.');
		callback(resourceType, uid, null);
	};
}

/**
 * Remove data from Indexed DB. (Async)
 * 
 * @param string resourceType | images, audios, videos
 * @param string uid | unique id for data to be removed
 * @return void
 */
function removeFromIndexedDB(resourceType, uid) {
	if (iDB == null) {
		log('iDB not available');
		return;
	}
	
	var useStorage = resourceType + 'Storage';
	var dbTransactions = iDB.transaction([useStorage], 'readonly');
	var dbStorage = dbTransactions.objectStore(useStorage);
	var storeRequest = dbStorage.delete(uid);
	storeRequest.onsuccess = function(event) {
		log(uid + '(' + resourceType + ') deleted.');
	};
	storeRequest.onerror = function(event) {
		log(uid + '(' + resourceType + ') error on deleting.');
	};
}

/**
 * Clear all Indexed DB
 * 
 * @return void
 */
function clearIndexedDB() {
	var dbRequest = indexedDB.deleteDatabase('CADV_DB');
	dbRequest.onsuccess = function () {
		iDBInit = false;
		log('DB deleted successfully');
		initDB();
	};
	dbRequest.onerror = function () {
		log('Unable to delete DB');
	};
	dbRequest.onblocked = function () {
		log('Unable to delete DB due to the operation being blocked');
	};
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

// WIP
cadv.pulic = {};
cadv.private = {};

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
	
	'useaudio' : false, // Web Audio API and other Audio related stuff
	'mastervolume' : 1, // MASTER Volume
	'bgmvolume' : 1, // BGM Volume
	'sfxvolume' : 1, // SFX Volume
	'voicevolume' : 1, // VOICE Volume
	
	'videovolume' : 1 // Video Volume
};

// Audio related variables
cadv.audio = {
	'context' : null
};

cadv.initAudio = function() {
	if (cadv.system.useaudio) {
		if (typeof(AudioContext) != 'undefined') {
			// Web Audio API is all unprefixed
			cadv.audio.context = new AudioContext();
			cadv.audio['master'] = cadv.audio.context.createGain();
			cadv.audio['master'].gain.value = cadv.system.mastervolume;
			cadv.audio['master'].connect(cadv.audio.context.destination);
			
			var audioType = ['bgm', 'sfx', 'voice'];
			for (var i = 0; i < audioType.length; i++) {
				var type = audioType[i];
				cadv.audio[type] = cadv.audio.context.createGain();
				cadv.audio[type].gain.value = cadv.system[type + 'volume'];
				cadv.audio[type].connect(cadv.audio['master']);
				
				cadv.audio[type + 'out'] = cadv.audio.context.createBufferSource();
				cadv.audio[type + 'out'].connect(cadv.audio[type]);
			}
			
			return true;
		} else {
			// FORCE to switch back
			cadv.system.useaudio = false;
			return false;
		}
	}
};

// Work In Progress
cadv.playAudio = function(audioType, audioId, isLoop) {
	if (isLoop == undefined) {
		isLoop = false;
	}
	
	// BGM is always loop
	if (audioType == 'bgm') {
		isLoop = true;
	}
	
	if (audioType == 'sfx' && !isLoop) {
		// Non-loop SFX is plainly disposable
		var audioOutput = cadv.audio.context.createBufferSource();
		audioOutput.buffer = resources.audios[audioId];
		audioOutput.connect(cadv.audio.sfx);
		audioOutput.start(0);
	} else {
		cadv.audio[audioType + 'out'].buffer = resources.audios[audioId];
		cadv.audio[audioType + 'out'].loop = isLoop;
		cadv.audio[audioType + 'out'].start(0);
	}
};

cadv.playCrossfadeBGM = function(audioId, crossfadeDuration) {
	var bgmVolume = cadv.audio.context.createGain();
	bgmVolume.gain.value = 0;
	bgmVolume.connect(cadv.audio['master']);
	
	var bgmOutput = cadv.audio.context.createBufferSource();
	bgmOutput.buffer = resources.audios[audioId];
	bgmOutput.loop = true;
	bgmOutput.connect(bgmVolume);
	bgmOutput.start(0);
	
	log('Crossfade begin!');
	$.Animation(bgmVolume.gain, {
		value: cadv.system['bgmvolume']
	}, {
		duration: crossfadeDuration,
		easing: 'linear'
	});
	
	$.Animation(cadv.audio.bgm.gain, {
		value: 0
	}, {
		duration: crossfadeDuration,
		easing: 'linear'
	}).done(function() {
		cadv.audio.bgmout.stop();
		delete cadv.audio.bgm, cadv.audio.bgmout;
		
		cadv.audio.bgm = bgmVolume;
		cadv.audio.bgmout = bgmOutput;
		log('Crossfade complete!');
	});
};

cadv.stopAudio = function(audioType) {
	cadv.audio[audioType + 'out'].stop();
};

// CSS for text output
// (Text on Canvas do not recognize new lines)
cadv.textOut = {
	'position' : 'absolute',
	'font-family' : 'Meiryo UI, Hiragino Maru Gothic ProN',
	'font-size' : '16px',
	'line-height' : '16px',
	'left' : '16px',
	'top' : '16px',
	'color' : '#FFFAFA',
	'overflow' : 'visible',
	'cursor' : 'default'
};

cadv.choiceBox = {
	'width' : '240px',
	'height' : '48px',
	'color' : '#111111',
	'text-align' : 'center',
	'line-height' : '48px',
	'border' : 'solid 1px #999999',
	'border-radius' : '4px',
	'margin' : '12px 0 12px',
	'cursor' : 'default',
	'opacity' : '0'
};

cadv.choiceBoxHover = {
	'font-size' : '1.125em',
	'color' : '#666666',
	'border' : 'solid 1px #7777FF',
	'opacity' : '0.9'
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
	'images' : {}, // Image (From Blob)
	'audios' : {}, // AudioBuffer (From ArrayBuffer)
	'videos' : {}  // Video (From Blob)
};
var loadIndicator = {
	'images' : {}, // Image (From Blob)
	'audios' : {}, // AudioBuffer (From ArrayBuffer)
	'videos' : {}  // Video (From Blob)
};

/**
 * Add resource to preload list
 * 
 * @param string resourceType | image, audio, video
 * @param string resourceID | ID to be use later on manipulating them
 * @param string resourceURL | Source of Resource
 * @return void
 */
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

/**
 * Start the resource loading.
 * 
 * @return void
 */
cadv.startedPreload = false;
cadv.startPreloadResources = function() {
	
	if (cadv.startedPreload) {
		log('Preload started');
		return;
	}
	cadv.startedPreload = true;
	
	initDB();
	var dbInitTimer = setInterval(function() {
		if (iDBInit) {
			clearInterval(dbInitTimer);
			afterInit();
		}
	}, 100);
	
	function storageCallback(resourceType, uid, resourceData) {
		if (resourceData != null) {
			assignToResource(resourceType, uid, resourceData);
		} else {
			loadResourceFromXHR(resourceType, uid, preload[resourceType][uid]);
		}
	}
	
	function loadResourceFromXHR(resourceType, uid, resourceUrl) {
		var xhRequest = new XMLHttpRequest();
		xhRequest.open('GET', resourceUrl, true);
		xhRequest.responseType = 'arraybuffer';
		xhRequest.onload = function(eventObj) {
			var rawArrayBuffer = this.response;
			var contentBlob = new Blob([rawArrayBuffer]);
			
			var useData = contentBlob;
			if (resourceType == 'audios') {
				useData = rawArrayBuffer;
			}
			storeToIndexedDB(resourceType, uid, useData);
			assignToResource(resourceType, uid, useData);
			
			log(resourceUrl + ' loaded!');
		};
		xhRequest.onerror = function(eventObj) {
			var message = resourceUrl + ' error! (Request)';
			loadErrors++;
			log(message);
			if (cadv.system.stoponerror) {
				error(message);
			}
		};
		xhRequest.onprogress = function(eventObj){
			if(eventObj.lengthComputable) {
				// var percentComplete = eventObj.loaded / eventObj.total;
				// do something with this
			}
		};
		xhRequest.send();
	}
	
	function assignToResource(resourceType, uid, resourceData) {
		switch(resourceType) {
			case 'images':
				var newImage = new Image();
				newImage.src = URL.createObjectURL(resourceData);
				resources.images[uid] = newImage;
				break;
			case 'videos':
				var newVideo = document.createElement('video');
				newVideo.src = URL.createObjectURL(resourceData);
				resources.videos[uid] = newVideo;
				break;
			case 'audios':
				cadv.audio.context.decodeAudioData(resourceData, function(buffer) {
					resources.audios[uid] = buffer;
					log(uid + '(' + resourceType + ') decoded!');
				}, function() {
					// Error Callback
					var message = uid + '(' + resourceType + ') error! (Decode)';
					loadErrors++;
					log(message);
					if (cadv.system.stoponerror) {
						error(message);
					}
				});
				break;
		}
	}
	
	function afterInit() {
		// Init Audio related in Preload
		if (!cadv.initAudio()) {
			log('Unable to create audio context. Web Audio API might be not available.');
			log('No audio will be loaded.');
			
			// Empty Audio list
			preload.audios = {};
		}
		
		for (var resourceType in preload) {
			if (!$.isEmptyObject(preload[resourceType])) {
				
				if (resourceType == 'audios' && !cadv.system.useaudio) {
					log('Skipping audio list. (UseAudio disabled)');
					continue;
				}
				
				log('Total of preload ' + resourceType + ': ' + Object.keys(preload[resourceType]).length);
				
				for (var resourceID in preload[resourceType]) {
					// Load Resource
					// Attempt to retrieve from Storage, load from XHR when empty
					getFromIndexedDB(resourceType, resourceID, storageCallback);
				}
				
			} else {
				log('Preload list of ' + resourceType + ' is empty!');
			}
		}
	}
	
};

/**
 * (Deprecated!)
 * Add image source to preload list
 * 
 * @param string imageID | ID to be use later on manipulating them
 * @param string imageURL | Image source
 * @return void
 */
cadv.addPreloadImage = function(imageID, imageURL) {
	log('addPreloadImage is Deprecated, will be removed soon');
	cadv.addPreloadResource('image', imageID, imageURL);
};

/**
 * (Deprecated!)
 * Start the resource(image) loading.
 * 
 * @return void
 */
cadv.startPreloadImages = function() {
	log('startPreloadImages is Deprecated, will be removed soon');
	cadv.startPreloadResources();
};

/**
 * (Deprecated!)
 * Add audio source to preload list
 * 
 * @param string audioID | ID to be use later on manipulating them
 * @param string audioURL | Audio source
 * @return void
 */
cadv.addPreloadAudio = function(audioID, audioURL) {
	log('addPreloadAudio is Deprecated, will be removed soon');
	cadv.addPreloadResource('audio', audioID, audioURL);
};

/**
 * (Deprecated!)
 * Start the resource(audio) loading.
 * 
 * @return void
 */
cadv.startPreloadAudios = function() {
	log('startPreloadAudios is Deprecated, will be removed soon');
	cadv.startPreloadResources();
};

/**
 * (Deprecated!)
 * Add video source to preload list
 * 
 * @param string videoID | ID to be use later on manipulating them
 * @param string videoURL | Video source
 * @return void
 */
cadv.addPreloadVideo = function(videoID, videoURL) {
	log('addPreloadVideo is Deprecated, will be removed soon');
	cadv.addPreloadResource('video', videoID, videoURL);
};

/**
 * (Deprecated!)
 * Start the resource(video) loading.
 * 
 * @return void
 */
cadv.startPreloadVideos = function() {
	log('startPreloadVideos is Deprecated, will be removed soon');
	cadv.startPreloadResources();
};

cadv.startPreload = function() {
	log('startPreload is Deprecated, will be removed soon');
	cadv.startPreloadResources();
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
	if (!canvasRefresh) {
		log('Not running yet. Do nothing.');
		return;
	}
	
	if (detailObjects.messagewindow.base == undefined) {
		log('Message Window not ready!');
		setTimeout(cadv.setPosition, 1000);
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
	
	// CSS for textOut
	var textOutCSS = '';
	for (var key in cadv.textOut) {
		textOutCSS += (key + ':' + cadv.textOut[key] + ';');
	}
	textOutCSS = 'div#textout{' + textOutCSS + '}';
	
	// CSS for choiceBox
	var choiceBoxCSS = '';
	for (var key in cadv.choiceBox) {
		choiceBoxCSS += (key + ':' + cadv.choiceBox[key] + ';');
	}
	choiceBoxCSS = 'div.choice{' + choiceBoxCSS + '}';
	
	// CSS for choiceBoxHover
	var choiceBoxHoverCSS = '';
	for (var key in cadv.choiceBoxHover) {
		choiceBoxHoverCSS += (key + ':' + cadv.choiceBoxHover[key] + ';');
	}
	choiceBoxHoverCSS = 'div.choice.hovered{' + choiceBoxHoverCSS + '}';
	
	// Default CSS settings for all browsers
	$('head').prepend('<style>*{padding:0;margin:0;}::-webkit-scrollbar{display: none;}canvas{vertical-align:top;}.pointer{cursor:pointer;}' + textOutCSS + choiceBoxCSS + choiceBoxHoverCSS + '</style>');
	
	var timer = setInterval(function() {
		if ((Object.keys(preload.images).length + Object.keys(preload.audios).length + Object.keys(preload.videos).length - loadErrors) == (Object.keys(resources.images).length + Object.keys(resources.audios).length + Object.keys(resources.videos).length)) {
			clearTimeout(timer);
			
			// Create Text Output
			var newDiv = document.createElement('div');
			newDiv.id = 'textout';
			
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

////////////////////
// Event Listeners
////////////////////
window.onresize = function(eventObj) {
	eventObj.preventDefault(); // DOM2
	if (cadv.system.autoscale) {
		cadv.performScaling();
	}
	cadv.setPosition();
};

window.onkeydown = function(eventObj) {
	eventObj.preventDefault(); // DOM2
	var keyLocation = eventObj.location;
	var whichKey = eventObj.which;
	
	switch(whichKey) {
		case 27:
			// Escape: Main Menu
			break;
		case 13:
			// Enter Key: Next Script, Decide
			break;
		case 32:
			// Space: Show Hide Message & Window
			break;
		case 17:
			if (keyLocation == KeyboardEvent.DOM_KEY_LOCATION_RIGHT) {
				// Right Control: Skip mode
			}
			break;
		case 38:
			// Arrows(Up): Choose Selection
			break;
		case 40:
			// Arrows(Down): Choose Selection
			break;
			
			// TODO: Log Mode?
			
		default:
			break;
	}
};

window.onkeyup - function(eventObj) {
	eventObj.preventDefault(); // DOM2
	var keyLocation = eventObj.location;
	var whichKey = eventObj.which;
	
	switch(whichKey) {
		case 17:
			if (keyLocation == KeyboardEvent.DOM_KEY_LOCATION_RIGHT) {
				// Right Control: Disable Skip Mode
			}
			break;
		default:
			break;
	}
};

window.onmousedown = function(eventObj) {
	eventObj.preventDefault(); // DOM2
	var whichKey = eventObj.which;
	
	switch(whichKey) {
		case 1:
			// Left Click: Next Script, Decide
			break;
		default:
			break;
	}
};

document.onselectstart = function() {
	// Disable Text Highlight
	return false;
};

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

// END OF FILE

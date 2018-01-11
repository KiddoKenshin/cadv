/*! Thu Jan 11 2018 16:02:07 GMT+0900 (JST) */
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["cadv"] = factory();
	else
		root["cadv"] = factory();
})(typeof self !== 'undefined' ? self : this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*!
 * CADV - HTML5 "C"anvas based "ADV"enture game engine.
 * Just another Visual Novel game engine.
 * Visual Novel games are consider as "Adventure" games in Japan.
 *
 * Migrating to ES6.
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
 * AnimeJS
 * ScreenFull
 *
 * @author KiddoKenshin @ K2-R&D.com
 * @since 2012/04/01, RE: 2013/01/17, TRE: 2013/12/13, C-ADV: 2014/05/26
 * @version -WORK IN PROGRESS-
 *
 * Current Progress: Make it work again!
 *
 * Rough DEMO using CADV: http://furi2purei.com/index.min.html
 */



var _animejs = __webpack_require__(1);

var _animejs2 = _interopRequireDefault(_animejs);

var _screenfull = __webpack_require__(3);

var _screenfull2 = _interopRequireDefault(_screenfull);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = function () {

  ////////////////////
  // Setting & Utils
  ////////////////////
  // System Settings, can be modify to suit user's needs
  var system = {
    debug: false, // Debug mode
    stopOnError: true, // Stop engine when error occured
    title: 'Canvas_Adventure_Engine', // Rename-able
    version: '', // Set by user, to check save files?
    width: 1280, // Game Width
    height: 720, // Game Height
    defaultBgColor: '#000000', // Default background color
    screenScale: 1.0, // Screen Scaling (Game size / Screen size), Renew Scaling whenever Screen size changed
    autoScale: false, // Perform auto scaling (Fit to screen)

    textSelector: undefined, // jQuery Object, Will be occupied after created.
    textSpeed: 30, // fps

    useAudio: false, // Web Audio API and other Audio related stuff
    masterVolume: 1, // MASTER Volume
    bgmVolume: 1, // BGM Volume
    sfxVolume: 1, // SFX Volume
    voiceVolume: 1, // VOICE Volume

    videoVolume: 1 // Video Volume
  };

  /**
   * Get specified system setting.
   *
   * @param string keyName | The name of the setting
   * @return mixed(boolean, int, float, string, null when invalid)
   */
  var getSystemSetting = function getSystemSetting(keyName) {
    if (system[keyName] === undefined) {
      return null;
    }
    return system[keyName];
  };

  /**
   * Set specified system setting.
   *
   * @param string keyName | The name of the setting
   * @param string value | The value for the setting
   * @return mixed(boolean, int, float, string, null when invalid)
   */
  var setSystemSetting = function setSystemSetting(keyName, value) {
    // TODO: Validate value?
    if (system[keyName] === undefined) {
      return null;
    }
    system[keyName] = value;
    return system[keyName];
  };

  /**
   * Detects mobile device via user agent.
   *
   * @return boolean
   */
  var mobile = void 0;
  var isMobile = function isMobile() {
    if (mobile === undefined) {
      mobile = false;
      if (navigator.userAgent.match(/(iPad|iPhone|iPod|Android|android)/g)) {
        mobile = true;
      }
    }
    return mobile;
  };

  /**
   * Acquire current datetime.
   * (For server interactions)
   *
   * @return string
   */
  var getYmdHis = function getYmdHis() {
    var date = new Date();
    return date.getFullYear() + ('0' + (date.getMonth() + 1)).slice(-2) + ('0' + date.getDate()).slice(-2) + ('0' + date.getHours()).slice(-2) + ('0' + date.getMinutes()).slice(-2) + ('0' + date.getSeconds()).slice(-2);
  };

  /**
   * Display logs in console. Mostly for debugging purpose.
   *
   * @param string message | String to be output in console.
   * @param boolean force | Outputs to console despite of not debug mode.
   * @return void
   */
  var log = function log(message, force) {
    if (system.debug || force === true) {
      console.log(message);
    }
  };

  /**
   * Throws an error. Most probably the best way to stop anything moving.
   *
   * @param string message | The error message
   * @return void
   */
  var error = function error(message) {
    alert('Error occured, unable to proceed.');
    throw Error(message);
  };

  ////////////////////
  // States
  ////////////////////
  // Engine's letious states, only to be overwritten by system.
  var states = {
    iDBInit: false,
    startedPreload: false,
    canvasRefresh: false,
    outputingText: false
  };

  ////////////////////
  // Indexed DB
  ////////////////////
  // local storage for contents. Might not work with private mode.
  var iDBObject = null;

  /**
   * Initialize Indexed DB to be used as local content manager. (Async)
   *
   * @returns void
   */
  var iDBInit = function iDBInit() {
    iDBObject = null;
    if (!window.indexedDB) {
      log('Indexed DB not available');
      states.iDBInit = true;
      return;
    }

    var dbRequest = indexedDB.open('CADV_DB', 1); // Doesn't work in FireFox during Private Mode.
    dbRequest.onupgradeneeded = function (event) {
      // createObjectStore only works in OnUpgradeNeeded
      log('Initializing DB...');
      iDBObject = dbRequest.result;
      if (!iDBObject.objectStoreNames.contains('imageStorage')) {
        iDBObject.createObjectStore('imageStorage');
        log('imageStorage Created');
      }
      if (!iDBObject.objectStoreNames.contains('audioStorage')) {
        iDBObject.createObjectStore('audioStorage');
        log('audioStorage Created');
      }
      if (!iDBObject.objectStoreNames.contains('videoStorage')) {
        iDBObject.createObjectStore('videoStorage');
        log('videoStorage Created');
      }
    };
    dbRequest.onsuccess = function (event) {
      iDBObject = dbRequest.result;
      states.iDBInit = true;
      log('DB Opened!');
    };
    dbRequest.onerror = function (event) {
      states.iDBInit = true;
      log('DB Failed!');
    };
  };

  /**
   * Stores data to Indexed DB for later usage. (Async)
   *
   * @param string resourceType | images, audios, videos
   * @param string uid | unique id to be use later
   * @param ArrayBuufer/Blob dataObject | the data to be store
   * @returns void
   */
  var storeToIndexedDB = function storeToIndexedDB(resourceType, uid, dataObject) {
    if (iDBObject == null) {
      log('iDB not available');
      return;
    }

    var useStorage = resourceType.substring(0, resourceType.length - 1) + 'Storage';
    var dbTransactions = iDBObject.transaction([useStorage], 'readwrite');
    var dbStorage = dbTransactions.objectStore(useStorage);
    var storeRequest = dbStorage.put(dataObject, uid);
    storeRequest.onsuccess = function (event) {
      log(uid + '(' + resourceType + ') stored.');
    };
    storeRequest.onerror = function (event) {
      log(uid + '(' + resourceType + ') error while put into DB.');
    };
  };

  /**
   * Retrieves data from Indexed DB. (Async)
   *
   * @param string resourceType | images, audios, videos
   * @param string uid | unique id to be use later
   * @param function callback | refer to storageCallback in cadv.startPreloadResources
   * @returns void
   */
  var getFromIndexedDB = function getFromIndexedDB(resourceType, uid, callback) {
    if (iDBObject == null) {
      log('iDB not available');
      callback(resourceType, uid, null);
      return;
    }

    var useStorage = resourceType.substring(0, resourceType.length - 1) + 'Storage';
    var dbTransactions = iDBObject.transaction([useStorage], 'readonly');
    var dbStorage = dbTransactions.objectStore(useStorage);
    var storeRequest = dbStorage.get(uid);
    storeRequest.onsuccess = function (event) {
      log(uid + '(' + resourceType + ') loaded.');
      callback(resourceType, uid, storeRequest.result);
    };
    storeRequest.onerror = function (event) {
      log(uid + '(' + resourceType + ') failed on retrieving.');
      callback(resourceType, uid, null);
    };
  };

  /**
   * Remove data from Indexed DB. (Async)
   *
   * @param string resourceType | images, audios, videos
   * @param string uid | unique id for data to be removed
   * @return void
   */
  var removeFromIndexedDB = function removeFromIndexedDB(resourceType, uid) {
    if (iDBObject == null) {
      log('iDB not available');
      return;
    }

    var useStorage = resourceType + 'Storage';
    var dbTransactions = iDBObject.transaction([useStorage], 'readwrite');
    var dbStorage = dbTransactions.objectStore(useStorage);
    var storeRequest = dbStorage.delete(uid);
    storeRequest.onsuccess = function (event) {
      log(uid + '(' + resourceType + ') deleted.');
    };
    storeRequest.onerror = function (event) {
      log(uid + '(' + resourceType + ') error on deleting.');
    };
  };

  /**
   * Clear all Indexed DB
   *
   * @return void
   */
  var clearIndexedDB = function clearIndexedDB() {
    var dbRequest = indexedDB.deleteDatabase('CADV_DB');
    dbRequest.onsuccess = function () {
      states.iDBInit = false;
      log('DB deleted successfully');
      iDBInit();
    };
    dbRequest.onerror = function () {
      log('Unable to delete DB');
    };
    dbRequest.onblocked = function () {
      log('Unable to delete DB due to the operation being blocked');
    };
  };

  ////////////////////
  // Resources Util
  ////////////////////
  // Stores resource informations to be used later in game.
  var loadErrors = 0;
  var preload = {
    // Format store: {resourceID: resourceUrl}
    images: {},
    audios: {},
    videos: {}
  };
  var resources = {
    images: {}, // Image (From Blob)
    audios: {}, // AudioBuffer (From ArrayBuffer)
    videos: {} // Video (From Blob)
  };

  ////////////////////
  // Audio Component
  ////////////////////
  // Component that stores audio related settings. (Volume settings, etc)
  var audio = {
    context: null
  };

  var initAudio = function initAudio() {
    if (system.useAudio) {
      if (typeof AudioContext !== 'undefined') {
        // Web Audio API is all unprefixed
        audio.context = new AudioContext();
        audio.master = audio.context.createGain();
        audio.master.gain.value = system.masterVolume;
        audio.master.connect(audio.context.destination);

        var audioType = ['bgm', 'sfx', 'voice'];
        for (var i = 0; i < audioType.length; i++) {
          var type = audioType[i];
          audio[type] = audio.context.createGain();
          audio[type].gain.value = system[type + 'Volume'];
          audio[type].connect(audio.master);

          audio[type + 'out'] = audio.context.createBufferSource();
          audio[type + 'out'].connect(audio[type]);
        }
        return true;
      }
      // FORCE to switch back
      system.useAudio = false;
      return false;
    }
    return false;
  };

  var playAudio = function playAudio(audioType, audioId) {
    var isLoop = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

    // BGM is always loop
    if (audioType === 'bgm') {
      isLoop = true;
    }

    if (audioType === 'sfx' && !isLoop) {
      // Non-loop SFX is plainly disposable
      var audioOutput = audio.context.createBufferSource();
      audioOutput.buffer = resources.audios[audioId];
      audioOutput.connect(audio.sfx);
      audioOutput.start(0);
    } else {
      audio[audioType + 'out'].buffer = resources.audios[audioId];
      audio[audioType + 'out'].loop = isLoop;
      audio[audioType + 'out'].start(0);
    }
  };

  var playCrossfadeBGM = function playCrossfadeBGM(audioId, crossfadeDuration) {
    var bgmVolume = audio.context.createGain();
    bgmVolume.gain.value = 0;
    bgmVolume.connect(audio.master);

    var bgmOutput = audio.context.createBufferSource();
    bgmOutput.buffer = resources.audios[audioId];
    bgmOutput.loop = true;
    bgmOutput.connect(bgmVolume);
    bgmOutput.start(0);

    log('Crossfade begin!');
    cadv.anime({
      targets: bgmVolume.gain,
      value: system.bgmVolume,
      easing: 'linear',
      duration: crossfadeDuration
    });

    cadv.anime({
      targets: audio.bgm.gain,
      value: 0,
      easing: 'linear',
      duration: crossfadeDuration,
      complete: function complete(anim) {
        audio.bgmout.stop();
        delete audio.bgm, audio.bgmout;

        audio.bgm = bgmVolume;
        audio.bgmout = bgmOutput;
        log('Crossfade complete!');
      }
    });
  };

  var stopAudio = function stopAudio(audioType) {
    audio[audioType + 'out'].stop();
  };
  ////////////////////
  // (END) Audio Comp.
  ////////////////////

  /**
   * Add resource to preload list
   *
   * @param string resourceType | image, audio, video
   * @param string resourceID | ID to be use later on manipulating them (Strict no multibyte string)
   * @param string resourceURL | Source of Resource
   * @return void
   */
  var addPreloadResource = function addPreloadResource(resourceType, resourceID, resourceURL) {
    switch (resourceType) {
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
        {
          var message = resourceType + ' is not a valid resource type!';
          log(message);
          if (system.stopOnError) {
            error(message);
          }
          break;
        }
    }
    log(resourceURL + ' is added to preload list!');
  };

  /**
   * Start the resource loading.
   *
   * @return void
   */
  var startPreloadResources = function startPreloadResources() {

    if (states.startedPreload) {
      log('Preload started');
      return;
    }
    states.startedPreload = true;

    var assignToResource = function assignToResource(resourceType, uid, resourceData) {
      switch (resourceType) {
        case 'images':
          {
            var newImage = new Image();
            newImage.src = URL.createObjectURL(resourceData);
            resources.images[uid] = newImage;
            break;
          }
        case 'videos':
          {
            var newVideo = document.createElement('video');
            newVideo.src = URL.createObjectURL(resourceData);
            resources.videos[uid] = newVideo;
            break;
          }
        case 'audios':
          {
            audio.context.decodeAudioData(resourceData, function (buffer) {
              resources.audios[uid] = buffer;
              log(uid + '(' + resourceType + ') decoded!');
            }, function () {
              // Error Callback
              var message = uid + '(' + resourceType + ') error! (Decode)';
              loadErrors += 1;
              log(message);
              if (system.stopOnError) {
                error(message);
              }
            });
            break;
          }
        default:
          break;
      }
    };

    var loadResourceFromXHR = function loadResourceFromXHR(resourceType, uid, resourceUrl) {
      // Simple DRM 1, CORS policy apply to XHR in the new browsers.
      var xhRequest = new XMLHttpRequest();
      xhRequest.open('GET', resourceUrl, true);
      xhRequest.responseType = 'arraybuffer';
      xhRequest.onload = function (eventObj) {
        var rawArrayBuffer = xhRequest.response;
        var contentBlob = new Blob([rawArrayBuffer]);

        var useData = contentBlob;
        if (resourceType === 'audios') {
          useData = rawArrayBuffer;
        }
        storeToIndexedDB(resourceType, uid, useData);
        assignToResource(resourceType, uid, useData);

        log(resourceUrl + ' loaded!');
      };
      xhRequest.onerror = function (eventObj) {
        var message = resourceUrl + ' error! (Request)';
        loadErrors += 1;
        log(message);
        if (system.stopOnError) {
          error(message);
        }
      };
      xhRequest.onprogress = function (eventObj) {
        if (eventObj.lengthComputable) {
          // let percentComplete = eventObj.loaded / eventObj.total;
          // do something with this
        }
      };

      // Simple DRM 2, Only allow access with custom header
      // TODO: Dynamic Header? More Header?
      xhRequest.setRequestHeader('CADV-ENGINE', '1.0');
      xhRequest.send();
    };

    var storageCallback = function storageCallback(resourceType, uid, resourceData) {
      if (resourceData != null) {
        assignToResource(resourceType, uid, resourceData);
      } else {
        loadResourceFromXHR(resourceType, uid, preload[resourceType][uid]);
      }
    };

    var afterInit = function afterInit() {
      // Init Audio related in Preload
      if (!initAudio()) {
        log('Unable to create audio context. Web Audio API might be not available.');
        log('No audio will be loaded.');

        // Empty Audio list
        preload.audios = {};
      }

      for (var i = 0, keys = Object.keys(preload); i < keys.length; i++) {
        var resourceType = keys[i];
        if (Object.keys(preload[resourceType]).length !== 0) {
          if (resourceType === 'audios' && !system.useAudio) {
            log('Skipping audio list. (UseAudio disabled)');
            continue;
          }
          log('Total of preload ' + resourceType + ': ' + Object.keys(preload[resourceType]).length);

          var idKeys = Object.keys(preload[resourceType]);
          for (var j = 0; j < idKeys.length; j++) {
            // Load Resource
            // Attempt to retrieve from Storage, load from XHR when empty
            var resourceID = idKeys[j];
            getFromIndexedDB(resourceType, resourceID, storageCallback);
          }
        } else {
          log('Preload list of ' + resourceType + ' is empty!');
        }
      }
    };

    iDBInit();
    var dbInitTimer = setInterval(function () {
      if (states.iDBInit) {
        clearInterval(dbInitTimer);
        afterInit();
      }
    }, 100);
  };

  ////////////////////
  // Custom variables
  ////////////////////
  // Custom variables that user can add them and manipulate them.
  var customVars = {};

  var getCustomVariable = function getCustomVariable(keyName) {
    if (customVars[keyName] === undefined) {
      return null;
    }
    return customVars[keyName];
  };

  var setCustomVariable = function setCustomVariable(keyName, value) {
    customVars[keyName] = value;
    return customVars[keyName];
  };

  ////////////////////
  // Text Output
  ////////////////////
  // HTML5 Canvas do not recognize new lines, therefore using HTML/CSS features to output text.
  var cssStorages = {
    textOutCSS: {
      position: 'absolute',
      'font-family': 'Meiryo UI, Hiragino Maru Gothic ProN',
      'font-size': '16px',
      'line-height': '16px',
      left: '16px',
      top: '16px',
      color: '#FFFAFA',
      overflow: 'visible',
      cursor: 'default'
    },
    choiceBoxCSS: {
      width: '240px',
      height: '48px',
      color: '#111111',
      'text-align': 'center',
      'line-height': '48px',
      border: 'solid 1px #999999',
      'border-radius': '4px',
      margin: '12px 0 12px',
      cursor: 'default',
      opacity: '0'
    },
    choiceBoxHoverCSS: {
      'font-size': '1.125em',
      color: '#666666',
      border: 'solid 1px #7777FF',
      opacity: '0.9'
    }
  };

  /**
   * Set CSS Value of specified component.
   *
   * @param string componentName | The component you wish to alter it's CSS (textOut, choiceBox, choiceBoxHover)
   * @param string propertyName | The CSS Property name you wish to edit / add
   * @param string propertyValue | The CSS Value you wish to apply (Use undefined, null, or blank string to remove)
   * @return object | All CSS values for the specified component
   */
  var setCSSValue = function setCSSValue(componentName, propertyName, propertyValue) {
    if (componentName !== 'textOut' && componentName !== 'choiceBox' && componentName !== 'choiceBoxHover') {
      log('Invalid componentName!');
      return null;
    }

    if (propertyValue === undefined || propertyValue === null || propertyValue === '') {
      delete cssStorages[componentName + 'CSS'][propertyName];
    } else {
      cssStorages[componentName + 'CSS'][propertyName] = propertyValue;
    }
    return cssStorages[componentName + 'CSS'];
  };

  ////////////////////
  // Core (Draw)
  ////////////////////
  // Draw the canvas, and outputs it to the browser.
  var canvas = void 0;
  var canvasContext = void 0;
  var oldCanvasObjects = {
    backgrounds: {},
    characters: {},
    messagewindow: {}
  };
  var canvasObjects = {
    backgrounds: {},
    characters: {},
    messagewindow: {}
  };

  var performScaling = function performScaling() {
    system.screenScale = window.innerWidth / system.width;
    if (system.height * system.screenScale > window.innerHeight) {
      system.screenScale = window.innerHeight / system.height;
    }

    // No scale below 0.5 (50%)
    if (system.screenScale < 0.5) {
      system.screenScale = 0.5;
    }

    // Adjust canvas height to adapt changes
    if (system.screenScale > 1.0) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    } else {
      canvas.width = system.width;
      canvas.height = system.height;
    }
  };

  var stopScaling = function stopScaling() {
    system.autoScale = false;
    system.screenScale = 1.0;
    canvas.width = system.width;
    canvas.height = system.height;
  };

  var getCanvasObject = function getCanvasObject(imageType, uid) {
    return canvasObjects[imageType][uid];
  };

  var setCanvasObject = function setCanvasObject(imageType, uid, propertyName, propertyValue) {
    if (canvasObjects[imageType][uid] !== undefined) {
      canvasObjects[imageType][uid][propertyName] = propertyValue;
      return canvasObjects[imageType][uid];
    }
    return undefined;
  };

  var createImage = function createImage(imageType, uid, imageID, extraParams) {
    var newImage = resources.images[imageID];
    var newCanvas = document.createElement('canvas');
    var imageProperties = {
      id: uid, // Unique ID
      canvasObject: newCanvas, // Canvas Object Holder
      imageObject: newImage, // Image Object Holder
      type: imageType, //
      percentX: 0,
      percentY: 0,
      x: 0,
      y: 0,
      iWidth: newImage.width,
      iHeight: newImage.height,
      hFlip: 1, // Horizontal Flip
      vFlip: 1, // Vertical Flip
      opac: 1, // Opacity
      originX: '50%', // Transform Origin X
      originY: '50%', // Transform Origin Y
      stretch: false, // Enable stretch (Mainly used in BG)
      stretchScale: 1, // Stretched Scale
      imageScale: 1, // Image Scale
      rotate: 0, // Rotation (Degree, 0 - 360)
      xSlice: 1,
      ySlice: 1,
      xCount: 0,
      yCount: 0
      // Default Offset?
    };

    // Overwrites Parameter above if extra parameters were provided
    if (extraParams !== undefined) {
      for (var i = 0, keys = Object.keys(extraParams); i < keys.length; i++) {
        var key = keys[i];
        if (imageProperties[key] !== undefined) {
          imageProperties[key] = extraParams[key];
        }
      }
    }

    if (extraParams !== undefined && extraParams.parentId !== undefined && extraParams.childType !== undefined) {
      if (canvasObjects[imageType][extraParams.parentId] === undefined) {
        throw new Error('No such parent!');
      }
      if (canvasObjects[imageType][extraParams.parentId][extraParams.childType] === undefined) {
        canvasObjects[imageType][extraParams.parentId][extraParams.childType] = {};
      }
      canvasObjects[imageType][extraParams.parentId][extraParams.childType] = imageProperties;
    } else {
      canvasObjects[imageType][uid] = imageProperties;
    }

    return uid;
  };

  var drawDetail = function drawDetail(imageProperties, parentObject) {
    if (oldCanvasObjects[imageProperties.type][imageProperties.id] === undefined) {
      oldCanvasObjects[imageProperties.type][imageProperties.id] = Object.assign({}, imageProperties);
    }

    imageProperties.canvasObject.width = canvas.width;
    imageProperties.canvasObject.height = canvas.height;
    if (parentObject !== undefined) {
      imageProperties.canvasObject.width = system.width;
      imageProperties.canvasObject.height = system.height;
      // Need calculate both to acquire enough canvas size
    }
    var ncContext = imageProperties.canvasObject.getContext('2d');

    var scale = canvas.width / imageProperties.imageObject.width;
    imageProperties.stretchScale = scale;
    scale *= imageProperties.imageScale;

    if (imageProperties.stretch) {
      imageProperties.iWidth = imageProperties.imageObject.width * imageProperties.imageScale;
      imageProperties.iHeight = imageProperties.imageObject.height * imageProperties.imageScale;
      ncContext.scale(scale * parseInt(imageProperties.hFlip, 10), scale * parseInt(imageProperties.vFlip, 10));
    } else if (parentObject !== undefined) {
      ncContext.scale(imageProperties.hFlip * imageProperties.imageScale, imageProperties.vFlip * imageProperties.imageScale);
    } else {
      // ncContext.scale(imageProperties.hFlip * imageProperties.imageScale * cadv.system.screenscale, imageProperties.vFlip * imageProperties.imageScale * cadv.system.screenscale);
      ncContext.scale(imageProperties.hFlip * imageProperties.imageScale, imageProperties.vFlip * imageProperties.imageScale);
    }

    var useOriginX = imageProperties.originX;
    var useOriginY = imageProperties.originY;
    if (useOriginX.indexOf('%') !== 0) {
      useOriginX = imageProperties.imageObject.width * (parseInt(useOriginX, 10) / 100);
    }
    if (useOriginY.indexOf('%') !== 0) {
      useOriginY = imageProperties.imageObject.height * (parseInt(useOriginY, 10) / 100);
    }

    ncContext.translate(useOriginX, useOriginY);
    if (parseInt(imageProperties.rotate, 10) !== 0) {
      ncContext.rotate(imageProperties.rotate * (Math.PI / 180));
    }
    ncContext.translate(-useOriginX, -useOriginY);

    ncContext.globalAlpha = imageProperties.opac;

    var useX = imageProperties.x;
    var useY = imageProperties.y;
    var prevXPercent = oldCanvasObjects[imageProperties.type][imageProperties.id].percentX;
    var prevYPercent = oldCanvasObjects[imageProperties.type][imageProperties.id].percentY;
    if (imageProperties.percentX !== prevXPercent) {
      useX = (imageProperties.iWidth - imageProperties.imageObject.width) / imageProperties.imageScale * (parseInt(imageProperties.percentX, 10) / 100) * -1; // This Works
      // useX = ((this.iWidth - canvas.width) / this.iScale) * (parseInt(this.percentX) / 100) * -1;
      if (!isFinite(useX)) {
        useX = '0';
      }
      imageProperties.x = useX;
    } else {
      // Renew percent X
      imageProperties.percentX = imageProperties.x / ((imageProperties.iWidth - imageProperties.imageObject.width) / imageProperties.imageScale) * -100;
      if (!isFinite(imageProperties.percentX)) {
        imageProperties.percentX = '0';
      }
    }

    // TODO: Logic for Percent Y differs from Percent X, needs more testing
    if (imageProperties.percentY !== prevYPercent) {
      var useScale = imageProperties.imageScale;
      if (imageProperties.stretch) {
        useScale = imageProperties.stretchScale * imageProperties.imageScale;
      }
      // useY = ((this.iHeight - image.height) / this.iScale) * (parseInt(this.percentY, 10) / 100) * -1; // Not Working
      useY = (imageProperties.imageObject.height - canvas.height / useScale) * (parseInt(imageProperties.percentY, 10) / 100) * -1; // It works!
      if (!isFinite(useY)) {
        useY = '0';
      }
      imageProperties.y = useY;
    } else {
      // Renew percent Y
      imageProperties.percentY = imageProperties.y / ((imageProperties.iHeight - imageProperties.imageObject.height) / imageProperties.imageObject.iScale) * -100;
      if (!isFinite(imageProperties.percentY)) {
        imageProperties.percentY = '0';
      }
    }
    // log(useY);

    if (imageProperties.xSlice === 1 && imageProperties.ySlice === 1) {
      // ncContext.drawImage(imageProperties.imageObject, useX, useY, imageProperties.imageObject.width * cadv.system.screenscale, imageProperties.imageObject.height * cadv.system.screenscale);
      // ncContext.drawImage(imageProperties.imageObject, 0, 0, imageProperties.imageObject.width, imageProperties.imageObject.height, useX, useY, imageProperties.imageObject.width * cadv.system.screenscale, imageProperties.imageObject.height * cadv.system.screenscale);
      ncContext.drawImage(imageProperties.imageObject, 0, 0, imageProperties.imageObject.width, imageProperties.imageObject.height, useX, useY, imageProperties.imageObject.width, imageProperties.imageObject.height);
    } else {
      var xSize = imageProperties.imageObject.width / imageProperties.xSlice;
      var ySize = imageProperties.imageObject.height / imageProperties.ySlice;
      var xOffset = xSize * parseInt(imageProperties.xCount, 10);
      var yOffset = ySize * parseInt(imageProperties.yCount, 10);
      ncContext.drawImage(imageProperties.imageObject, xOffset, yOffset, xSize, ySize, parseFloat(useX) + parseFloat(parentObject.x), parseFloat(useY) + parseFloat(parentObject.y), xSize, ySize);

      // log(ySize);

      // delete xSize, ySize, xOffset, yOffset;
    }

    oldCanvasObjects[imageProperties.type][imageProperties.id] = Object.assign({}, imageProperties);

    if (imageProperties.type === 'characters' && imageProperties.face !== undefined) {
      ncContext.drawImage(drawDetail(imageProperties.face, imageProperties), 0, 0);
    }

    // delete ncContext, useX, useY;
    return imageProperties.canvasObject;
  };

  // TODO: Modify for other uses (Shooter, RPG, etc...)?
  var drawCanvas = function drawCanvas() {

    var widthOffset = 0;
    var heightOffset = 0;
    widthOffset = Math.round(window.innerWidth - system.width * system.screenScale);
    heightOffset = Math.round(window.innerHeight - system.height * system.screenScale);

    // DEV NOTES:
    // http://stackoverflow.com/questions/18565395/why-does-canvas-context-drawimage-fail-on-iphone
    // Explains canvasContext.drawImage (with 9 params) not working on iPhone but the one with 5 params does.

    // Background Layer
    for (var i = 0, keys = Object.keys(canvasObjects.backgrounds); i < keys.length; i++) {
      var uid = keys[i];
      if (isMobile()) {
        // canvasContext.drawImage(this.drawDetail(canvasObjects.backgrounds[uid]), widthOffset, heightOffset, canvas.width, canvas.height);
        canvasContext.drawImage(drawDetail(canvasObjects.backgrounds[uid]), 0, 0, canvas.width, canvas.height);
      } else {
        // canvasContext.drawImage(this.drawDetail(canvasObjects.backgrounds[uid]), 0, 0, cadv.system.width * cadv.system.screenscale, cadv.system.height * cadv.system.screenscale, widthOffset, heightOffset, cadv.system.width * cadv.system.screenscale, cadv.system.height * cadv.system.screenscale);
        // canvasContext.drawImage(this.drawDetail(canvasObjects.backgrounds[uid]), 0, 0, cadv.system.width, cadv.system.height, widthOffset, heightOffset, cadv.system.width, cadv.system.height);
        canvasContext.drawImage(drawDetail(canvasObjects.backgrounds[uid]), 0, 0, system.width, system.height, 0, 0, system.width, system.height);
      }
    }

    for (var _i = 0, _keys = Object.keys(canvasObjects.characters); _i < _keys.length; _i++) {
      var _uid = _keys[_i];
      if (isMobile()) {
        // canvasContext.drawImage(this.drawDetail(canvasObjects.characters[uid]), widthOffset, heightOffset, canvas.width, canvas.height);
        canvasContext.drawImage(drawDetail(canvasObjects.characters[_uid]), 0, 0, canvas.width, canvas.height);
      } else {
        // canvasContext.drawImage(this.drawDetail(canvasObjects.characters[uid]), 0, 0, cadv.system.width * cadv.system.screenscale, cadv.system.height * cadv.system.screenscale, widthOffset, heightOffset, cadv.system.width * cadv.system.screenscale, cadv.system.height * cadv.system.screenscale);
        // canvasContext.drawImage(this.drawDetail(canvasObjects.characters[uid]), 0, 0, cadv.system.width, cadv.system.height, widthOffset, heightOffset, cadv.system.width, cadv.system.height);
        canvasContext.drawImage(drawDetail(canvasObjects.characters[_uid]), 0, 0, system.width, system.height, 0, 0, system.width, system.height);
      }
    }

    for (var _i2 = 0, _keys2 = Object.keys(canvasObjects.messagewindow); _i2 < _keys2.length; _i2++) {
      var _uid2 = _keys2[_i2];
      if (isMobile()) {
        // canvasContext.drawImage(this.drawDetail(canvasObjects.messagewindow[uid]), widthOffset, heightOffset, canvas.width, canvas.height);
        canvasContext.drawImage(drawDetail(canvasObjects.messagewindow[_uid2]), 0, 0, canvas.width, canvas.height);
      } else {
        // canvasContext.drawImage(this.drawDetail(canvasObjects.messagewindow[uid]), 0, 0, cadv.system.width, cadv.system.height, widthOffset, heightOffset, cadv.system.width * cadv.system.screenscale, cadv.system.height * cadv.system.screenscale);
        // canvasContext.drawImage(this.drawDetail(canvasObjects.messagewindow[uid]), 0, 0, cadv.system.width, cadv.system.height, widthOffset, heightOffset, cadv.system.width, cadv.system.height);
        canvasContext.drawImage(drawDetail(canvasObjects.messagewindow[_uid2]), 0, 0, system.width, system.height, 0, 0, system.width, system.height);
      }
    }
  };

  var resetCanvas = function resetCanvas() {
    canvasContext.clearRect(0, 0, canvas.width, canvas.height);
    canvasContext.fillStyle = system.defaultBgColor;
    canvasContext.fillRect(0, 0, canvas.width, canvas.height);

    // Reset fillStyle
    canvasContext.fillStyle = '';

    // Save state
    canvasContext.save();

    // Apply Screen Scaling
    canvasContext.scale(system.screenScale, system.screenScale);

    // Redraw everything & restore state
    drawCanvas();
    canvasContext.restore();

    // return states.canvasRefresh; // For jQuery.fx.timer
    if (states.canvasRefresh) {
      window.requestAnimationFrame(resetCanvas);
    }
  };

  var setPosition = function setPosition() {
    if (!states.canvasRefresh) {
      log('Not running yet. Do nothing.');
      return;
    }

    if (canvasObjects.messagewindow.base === undefined) {
      log('Message Window not ready!');
      setTimeout(setPosition, 1000);
      return;
    }

    var widthOffset = Math.round(window.innerWidth - system.width * system.screenScale) / 2;
    var heightOffset = Math.round(window.innerHeight - system.height * system.screenScale) / 2;

    if (system.screenScale <= 0.5) {
      heightOffset = 0;
    }

    var cadvCV = document.getElementById('cadv');
    cadvCV.style.position = 'fixed'; // absolute?
    cadvCV.style.left = widthOffset + 'px';
    cadvCV.style.top = heightOffset + 'px';

    system.textSelector.style.left = (parseInt(cssStorages.textOutCSS.left, 10) + parseInt(canvasObjects.messagewindow.base.x, 10)) * system.screenScale + widthOffset + 'px';
    system.textSelector.style.top = (parseInt(cssStorages.textOutCSS.top, 10) + parseInt(canvasObjects.messagewindow.base.y, 10)) * system.screenScale + heightOffset + 'px';
    if (system.screenScale !== 1.0) {
      system.textSelector.style.transform = 'scale(' + system.screenScale + ')';
      system.textSelector.style.transformOrigin = '0% 0%';
    } else {
      system.textSelector.style.transform = '';
      system.textSelector.style.transformOrigin = '';
    }
  };

  var start = function start(callback) {
    states.canvasRefresh = true;
    // jQuery.fx.timer(resetCanvas);
    window.requestAnimationFrame(resetCanvas);

    if (callback !== undefined && typeof callback === 'function') {
      callback();
    }

    // Besure to remember to set MessageBox in callback
    setPosition();
  };

  var stop = function stop() {
    states.canvasRefresh = false;
  };

  var canvasInit = function canvasInit(callback) {
    // Initialize Canvas
    canvas = document.createElement('canvas');
    canvas.id = 'cadv';
    canvas.width = system.width;
    canvas.height = system.height;
    canvasContext = canvas.getContext('2d');

    // Append Canvas to HTML Document(Body)
    document.body.innerHTML = '';
    document.body.append(canvas);
    document.body.style.backgroundColor = system.defaultBgColor;

    // CSS for textOut
    var stringTextOutCSS = '';
    for (var i = 0, keys = Object.keys(cssStorages.textOutCSS); i < keys.length; i++) {
      var key = keys[i];
      stringTextOutCSS += key + ':' + cssStorages.textOutCSS[key] + ';';
    }
    stringTextOutCSS = 'div#textout{' + stringTextOutCSS + '}';

    // CSS for choiceBox
    var stringChoiceBoxCSS = '';
    for (var _i3 = 0, _keys3 = Object.keys(cssStorages.choiceBoxCSS); _i3 < _keys3.length; _i3++) {
      var _key = _keys3[_i3];
      stringChoiceBoxCSS += _key + ':' + cssStorages.choiceBoxCSS[_key] + ';';
    }
    stringChoiceBoxCSS = 'div.choice{' + stringChoiceBoxCSS + '}';

    // CSS for choiceBoxHover
    var stringChoiceBoxHoverCSS = '';
    for (var _i4 = 0, _keys4 = Object.keys(cssStorages.choiceBoxHoverCSS); _i4 < _keys4.length; _i4++) {
      var _key2 = _keys4[_i4];
      stringChoiceBoxHoverCSS += _key2 + ':' + cssStorages.choiceBoxHoverCSS[_key2] + ';';
    }
    stringChoiceBoxHoverCSS = 'div.choice.hovered{' + stringChoiceBoxHoverCSS + '}';

    // Default CSS settings for all browsers
    document.head.innerHTML += '<style>*{padding:0;margin:0;}::-webkit-scrollbar{display: none;}canvas{vertical-align:top;}.pointer{cursor:pointer;}' + stringTextOutCSS + stringChoiceBoxCSS + stringChoiceBoxHoverCSS + '</style>';

    var timer = setInterval(function () {
      if (Object.keys(preload.images).length + Object.keys(preload.audios).length + (Object.keys(preload.videos).length - loadErrors) === Object.keys(resources.images).length + Object.keys(resources.audios).length + Object.keys(resources.videos).length) {
        clearInterval(timer);

        // Create Text Output
        var newDiv = document.createElement('div');
        newDiv.id = 'textout';

        document.body.append(newDiv);
        system.textSelector = document.getElementById('textout');

        // If autoscaling enabled
        if (system.autoScale) {
          performScaling();
        }

        if (callback !== undefined && typeof callback === 'function') {
          callback();
        } else {
          // Ladies and Gentlemen, start your engines!
          start();
        }
      }
    }, 500);
  };

  var textWriter = function textWriter(inputString) {
    var inputLength = inputString.length;
    var textPosition = 0;
    var writerTimer = null;

    var outputText = function outputText() {
      // FIXME: Might hang if tag not closed
      switch (inputLength.charAt(textPosition)) {
        case '<':
          // Tag Striper (example: <span>)
          while (inputLength.charAt(textPosition) !== '>') {
            textPosition += 1;
          }
          break;
        case '&':
          // HTML Symbol Skipper (example: &amp;)
          while (inputLength.charAt(textPosition) !== ';') {
            textPosition += 1;
          }
          break;
        default:
          // Add Position Value
          textPosition += 1;
          break;
      }
      // system.textSelector.html(inputString.substring(0, textPosition));
      system.textSelector.innerHTML = inputString.substring(0, textPosition);

      // Break Condition
      if (textPosition === inputLength || !states.outputingText) {
        // system.textSelector.html(inputString.substring(0, inputLength)); // Complete text
        system.textSelector.innerHTML = inputString.substring(0, inputLength); // Complete text
        states.outputingText = false;

        // Show Button?
        // showButton();
      } else {
        // Call again.
        writerTimer = setTimeout(outputText, Math.floor(1000 / system.textSpeed));
      }
    };

    states.outputingText = true;
    writerTimer = setTimeout(outputText, Math.floor(1000 / system.textSpeed));
  };

  ////////////////////
  // Event Listeners
  ////////////////////
  //<< WINDOW / DOCUMENT >>//
  window.onresize = function (eventObj) {
    eventObj.preventDefault(); // DOM2
    if (system.autoScale) {
      performScaling();
    }
    setPosition();
  };

  //<< KEYBOARD >>//
  window.onkeydown = function (eventObj) {
    eventObj.preventDefault(); // DOM2
    var keyLocation = eventObj.location;
    var whichKey = eventObj.which;

    switch (whichKey) {
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
        if (keyLocation === KeyboardEvent.DOM_KEY_LOCATION_RIGHT) {
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

  window.onkeyup = function (eventObj) {
    eventObj.preventDefault(); // DOM2
    var keyLocation = eventObj.location;
    var whichKey = eventObj.which;

    switch (whichKey) {
      case 17:
        if (keyLocation === KeyboardEvent.DOM_KEY_LOCATION_RIGHT) {
          // Right Control: Disable Skip Mode
        }
        break;
      default:
        break;
    }
  };

  //<< MOUSE >>//
  window.onmousedown = function (eventObj) {
    eventObj.preventDefault(); // DOM2
    var whichKey = eventObj.which;

    switch (whichKey) {
      case 1:
        // Left Click: Next Script, Decide
        break;
      default:
        break;
    }
  };

  document.onselectstart = function () {
    // Disable Text Highlight
    return false;
  };

  //<< GAMEPAD API? >>//
  // Work In Progress
  var cadvGamepad = null;
  var gpLoopTimer = void 0;
  window.addEventListener('gamepadconnected', function (eventObj) {
    cadvGamepad = eventObj.gamepad;
    gpLoopTimer = setInterval(function () {

      for (var i = 0, max = cadvGamepad.buttons.length; i < max; i++) {
        console.log('Key ' + i + ' state: ' + cadvGamepad.buttons[i].pressed);
      }
    }, 1000);
  });

  window.addEventListener('gamepaddisconnected', function (eventObj) {
    clearInterval(gpLoopTimer);
    cadvGamepad = null;
  });

  // Some easings to animejs
  _animejs2.default.easings['swing'] = _animejs2.default.easings.easeInOutSine;
  _animejs2.default.easings['swingAlt'] = _animejs2.default.bezier(.02, .01, .47, 1);

  // -- // End Of CADV Functional Stuffs // -- //

  // Only expose variables and functions that are needed(public).
  return {
    // System & Utils
    getSystemSetting: getSystemSetting,
    setSystemSetting: setSystemSetting,
    isMobile: isMobile,

    // Custom variables
    getCustomVariable: getCustomVariable,
    setCustomVariable: setCustomVariable,

    // Resources
    addPreloadResource: addPreloadResource,
    startPreloadResources: startPreloadResources,

    // Text CSS
    setCSSValue: setCSSValue,

    getCanvasObject: getCanvasObject,
    setCanvasObject: setCanvasObject,
    createImage: createImage,

    setPosition: setPosition, // FIXME: Too dangerous to expose?
    canvasInit: canvasInit,
    start: start,

    // Library & Utils
    anime: _animejs2.default // DirectCall to AnimeJS
  };
}();

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*
 2017 Julian Garnier
 Released under the MIT license
*/
var $jscomp={scope:{}};$jscomp.defineProperty="function"==typeof Object.defineProperties?Object.defineProperty:function(e,r,p){if(p.get||p.set)throw new TypeError("ES3 does not support getters and setters.");e!=Array.prototype&&e!=Object.prototype&&(e[r]=p.value)};$jscomp.getGlobal=function(e){return"undefined"!=typeof window&&window===e?e:"undefined"!=typeof global&&null!=global?global:e};$jscomp.global=$jscomp.getGlobal(this);$jscomp.SYMBOL_PREFIX="jscomp_symbol_";
$jscomp.initSymbol=function(){$jscomp.initSymbol=function(){};$jscomp.global.Symbol||($jscomp.global.Symbol=$jscomp.Symbol)};$jscomp.symbolCounter_=0;$jscomp.Symbol=function(e){return $jscomp.SYMBOL_PREFIX+(e||"")+$jscomp.symbolCounter_++};
$jscomp.initSymbolIterator=function(){$jscomp.initSymbol();var e=$jscomp.global.Symbol.iterator;e||(e=$jscomp.global.Symbol.iterator=$jscomp.global.Symbol("iterator"));"function"!=typeof Array.prototype[e]&&$jscomp.defineProperty(Array.prototype,e,{configurable:!0,writable:!0,value:function(){return $jscomp.arrayIterator(this)}});$jscomp.initSymbolIterator=function(){}};$jscomp.arrayIterator=function(e){var r=0;return $jscomp.iteratorPrototype(function(){return r<e.length?{done:!1,value:e[r++]}:{done:!0}})};
$jscomp.iteratorPrototype=function(e){$jscomp.initSymbolIterator();e={next:e};e[$jscomp.global.Symbol.iterator]=function(){return this};return e};$jscomp.array=$jscomp.array||{};$jscomp.iteratorFromArray=function(e,r){$jscomp.initSymbolIterator();e instanceof String&&(e+="");var p=0,m={next:function(){if(p<e.length){var u=p++;return{value:r(u,e[u]),done:!1}}m.next=function(){return{done:!0,value:void 0}};return m.next()}};m[Symbol.iterator]=function(){return m};return m};
$jscomp.polyfill=function(e,r,p,m){if(r){p=$jscomp.global;e=e.split(".");for(m=0;m<e.length-1;m++){var u=e[m];u in p||(p[u]={});p=p[u]}e=e[e.length-1];m=p[e];r=r(m);r!=m&&null!=r&&$jscomp.defineProperty(p,e,{configurable:!0,writable:!0,value:r})}};$jscomp.polyfill("Array.prototype.keys",function(e){return e?e:function(){return $jscomp.iteratorFromArray(this,function(e){return e})}},"es6-impl","es3");var $jscomp$this=this;
(function(e,r){ true?!(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_FACTORY__ = (r),
				__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
				(__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)):"object"===typeof module&&module.exports?module.exports=r():e.anime=r()})(this,function(){function e(a){if(!h.col(a))try{return document.querySelectorAll(a)}catch(c){}}function r(a,c){for(var d=a.length,b=2<=arguments.length?arguments[1]:void 0,f=[],n=0;n<d;n++)if(n in a){var k=a[n];c.call(b,k,n,a)&&f.push(k)}return f}function p(a){return a.reduce(function(a,d){return a.concat(h.arr(d)?p(d):d)},[])}function m(a){if(h.arr(a))return a;
h.str(a)&&(a=e(a)||a);return a instanceof NodeList||a instanceof HTMLCollection?[].slice.call(a):[a]}function u(a,c){return a.some(function(a){return a===c})}function C(a){var c={},d;for(d in a)c[d]=a[d];return c}function D(a,c){var d=C(a),b;for(b in a)d[b]=c.hasOwnProperty(b)?c[b]:a[b];return d}function z(a,c){var d=C(a),b;for(b in c)d[b]=h.und(a[b])?c[b]:a[b];return d}function T(a){a=a.replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i,function(a,c,d,k){return c+c+d+d+k+k});var c=/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(a);
a=parseInt(c[1],16);var d=parseInt(c[2],16),c=parseInt(c[3],16);return"rgba("+a+","+d+","+c+",1)"}function U(a){function c(a,c,b){0>b&&(b+=1);1<b&&--b;return b<1/6?a+6*(c-a)*b:.5>b?c:b<2/3?a+(c-a)*(2/3-b)*6:a}var d=/hsl\((\d+),\s*([\d.]+)%,\s*([\d.]+)%\)/g.exec(a)||/hsla\((\d+),\s*([\d.]+)%,\s*([\d.]+)%,\s*([\d.]+)\)/g.exec(a);a=parseInt(d[1])/360;var b=parseInt(d[2])/100,f=parseInt(d[3])/100,d=d[4]||1;if(0==b)f=b=a=f;else{var n=.5>f?f*(1+b):f+b-f*b,k=2*f-n,f=c(k,n,a+1/3),b=c(k,n,a);a=c(k,n,a-1/3)}return"rgba("+
255*f+","+255*b+","+255*a+","+d+")"}function y(a){if(a=/([\+\-]?[0-9#\.]+)(%|px|pt|em|rem|in|cm|mm|ex|ch|pc|vw|vh|vmin|vmax|deg|rad|turn)?$/.exec(a))return a[2]}function V(a){if(-1<a.indexOf("translate")||"perspective"===a)return"px";if(-1<a.indexOf("rotate")||-1<a.indexOf("skew"))return"deg"}function I(a,c){return h.fnc(a)?a(c.target,c.id,c.total):a}function E(a,c){if(c in a.style)return getComputedStyle(a).getPropertyValue(c.replace(/([a-z])([A-Z])/g,"$1-$2").toLowerCase())||"0"}function J(a,c){if(h.dom(a)&&
u(W,c))return"transform";if(h.dom(a)&&(a.getAttribute(c)||h.svg(a)&&a[c]))return"attribute";if(h.dom(a)&&"transform"!==c&&E(a,c))return"css";if(null!=a[c])return"object"}function X(a,c){var d=V(c),d=-1<c.indexOf("scale")?1:0+d;a=a.style.transform;if(!a)return d;for(var b=[],f=[],n=[],k=/(\w+)\((.+?)\)/g;b=k.exec(a);)f.push(b[1]),n.push(b[2]);a=r(n,function(a,b){return f[b]===c});return a.length?a[0]:d}function K(a,c){switch(J(a,c)){case "transform":return X(a,c);case "css":return E(a,c);case "attribute":return a.getAttribute(c)}return a[c]||
0}function L(a,c){var d=/^(\*=|\+=|-=)/.exec(a);if(!d)return a;var b=y(a)||0;c=parseFloat(c);a=parseFloat(a.replace(d[0],""));switch(d[0][0]){case "+":return c+a+b;case "-":return c-a+b;case "*":return c*a+b}}function F(a,c){return Math.sqrt(Math.pow(c.x-a.x,2)+Math.pow(c.y-a.y,2))}function M(a){a=a.points;for(var c=0,d,b=0;b<a.numberOfItems;b++){var f=a.getItem(b);0<b&&(c+=F(d,f));d=f}return c}function N(a){if(a.getTotalLength)return a.getTotalLength();switch(a.tagName.toLowerCase()){case "circle":return 2*
Math.PI*a.getAttribute("r");case "rect":return 2*a.getAttribute("width")+2*a.getAttribute("height");case "line":return F({x:a.getAttribute("x1"),y:a.getAttribute("y1")},{x:a.getAttribute("x2"),y:a.getAttribute("y2")});case "polyline":return M(a);case "polygon":var c=a.points;return M(a)+F(c.getItem(c.numberOfItems-1),c.getItem(0))}}function Y(a,c){function d(b){b=void 0===b?0:b;return a.el.getPointAtLength(1<=c+b?c+b:0)}var b=d(),f=d(-1),n=d(1);switch(a.property){case "x":return b.x;case "y":return b.y;
case "angle":return 180*Math.atan2(n.y-f.y,n.x-f.x)/Math.PI}}function O(a,c){var d=/-?\d*\.?\d+/g,b;b=h.pth(a)?a.totalLength:a;if(h.col(b))if(h.rgb(b)){var f=/rgb\((\d+,\s*[\d]+,\s*[\d]+)\)/g.exec(b);b=f?"rgba("+f[1]+",1)":b}else b=h.hex(b)?T(b):h.hsl(b)?U(b):void 0;else f=(f=y(b))?b.substr(0,b.length-f.length):b,b=c&&!/\s/g.test(b)?f+c:f;b+="";return{original:b,numbers:b.match(d)?b.match(d).map(Number):[0],strings:h.str(a)||c?b.split(d):[]}}function P(a){a=a?p(h.arr(a)?a.map(m):m(a)):[];return r(a,
function(a,d,b){return b.indexOf(a)===d})}function Z(a){var c=P(a);return c.map(function(a,b){return{target:a,id:b,total:c.length}})}function aa(a,c){var d=C(c);if(h.arr(a)){var b=a.length;2!==b||h.obj(a[0])?h.fnc(c.duration)||(d.duration=c.duration/b):a={value:a}}return m(a).map(function(a,b){b=b?0:c.delay;a=h.obj(a)&&!h.pth(a)?a:{value:a};h.und(a.delay)&&(a.delay=b);return a}).map(function(a){return z(a,d)})}function ba(a,c){var d={},b;for(b in a){var f=I(a[b],c);h.arr(f)&&(f=f.map(function(a){return I(a,
c)}),1===f.length&&(f=f[0]));d[b]=f}d.duration=parseFloat(d.duration);d.delay=parseFloat(d.delay);return d}function ca(a){return h.arr(a)?A.apply(this,a):Q[a]}function da(a,c){var d;return a.tweens.map(function(b){b=ba(b,c);var f=b.value,e=K(c.target,a.name),k=d?d.to.original:e,k=h.arr(f)?f[0]:k,w=L(h.arr(f)?f[1]:f,k),e=y(w)||y(k)||y(e);b.from=O(k,e);b.to=O(w,e);b.start=d?d.end:a.offset;b.end=b.start+b.delay+b.duration;b.easing=ca(b.easing);b.elasticity=(1E3-Math.min(Math.max(b.elasticity,1),999))/
1E3;b.isPath=h.pth(f);b.isColor=h.col(b.from.original);b.isColor&&(b.round=1);return d=b})}function ea(a,c){return r(p(a.map(function(a){return c.map(function(b){var c=J(a.target,b.name);if(c){var d=da(b,a);b={type:c,property:b.name,animatable:a,tweens:d,duration:d[d.length-1].end,delay:d[0].delay}}else b=void 0;return b})})),function(a){return!h.und(a)})}function R(a,c,d,b){var f="delay"===a;return c.length?(f?Math.min:Math.max).apply(Math,c.map(function(b){return b[a]})):f?b.delay:d.offset+b.delay+
b.duration}function fa(a){var c=D(ga,a),d=D(S,a),b=Z(a.targets),f=[],e=z(c,d),k;for(k in a)e.hasOwnProperty(k)||"targets"===k||f.push({name:k,offset:e.offset,tweens:aa(a[k],d)});a=ea(b,f);return z(c,{children:[],animatables:b,animations:a,duration:R("duration",a,c,d),delay:R("delay",a,c,d)})}function q(a){function c(){return window.Promise&&new Promise(function(a){return p=a})}function d(a){return g.reversed?g.duration-a:a}function b(a){for(var b=0,c={},d=g.animations,f=d.length;b<f;){var e=d[b],
k=e.animatable,h=e.tweens,n=h.length-1,l=h[n];n&&(l=r(h,function(b){return a<b.end})[0]||l);for(var h=Math.min(Math.max(a-l.start-l.delay,0),l.duration)/l.duration,w=isNaN(h)?1:l.easing(h,l.elasticity),h=l.to.strings,p=l.round,n=[],m=void 0,m=l.to.numbers.length,t=0;t<m;t++){var x=void 0,x=l.to.numbers[t],q=l.from.numbers[t],x=l.isPath?Y(l.value,w*x):q+w*(x-q);p&&(l.isColor&&2<t||(x=Math.round(x*p)/p));n.push(x)}if(l=h.length)for(m=h[0],w=0;w<l;w++)p=h[w+1],t=n[w],isNaN(t)||(m=p?m+(t+p):m+(t+" "));
else m=n[0];ha[e.type](k.target,e.property,m,c,k.id);e.currentValue=m;b++}if(b=Object.keys(c).length)for(d=0;d<b;d++)H||(H=E(document.body,"transform")?"transform":"-webkit-transform"),g.animatables[d].target.style[H]=c[d].join(" ");g.currentTime=a;g.progress=a/g.duration*100}function f(a){if(g[a])g[a](g)}function e(){g.remaining&&!0!==g.remaining&&g.remaining--}function k(a){var k=g.duration,n=g.offset,w=n+g.delay,r=g.currentTime,x=g.reversed,q=d(a);if(g.children.length){var u=g.children,v=u.length;
if(q>=g.currentTime)for(var G=0;G<v;G++)u[G].seek(q);else for(;v--;)u[v].seek(q)}if(q>=w||!k)g.began||(g.began=!0,f("begin")),f("run");if(q>n&&q<k)b(q);else if(q<=n&&0!==r&&(b(0),x&&e()),q>=k&&r!==k||!k)b(k),x||e();f("update");a>=k&&(g.remaining?(t=h,"alternate"===g.direction&&(g.reversed=!g.reversed)):(g.pause(),g.completed||(g.completed=!0,f("complete"),"Promise"in window&&(p(),m=c()))),l=0)}a=void 0===a?{}:a;var h,t,l=0,p=null,m=c(),g=fa(a);g.reset=function(){var a=g.direction,c=g.loop;g.currentTime=
0;g.progress=0;g.paused=!0;g.began=!1;g.completed=!1;g.reversed="reverse"===a;g.remaining="alternate"===a&&1===c?2:c;b(0);for(a=g.children.length;a--;)g.children[a].reset()};g.tick=function(a){h=a;t||(t=h);k((l+h-t)*q.speed)};g.seek=function(a){k(d(a))};g.pause=function(){var a=v.indexOf(g);-1<a&&v.splice(a,1);g.paused=!0};g.play=function(){g.paused&&(g.paused=!1,t=0,l=d(g.currentTime),v.push(g),B||ia())};g.reverse=function(){g.reversed=!g.reversed;t=0;l=d(g.currentTime)};g.restart=function(){g.pause();
g.reset();g.play()};g.finished=m;g.reset();g.autoplay&&g.play();return g}var ga={update:void 0,begin:void 0,run:void 0,complete:void 0,loop:1,direction:"normal",autoplay:!0,offset:0},S={duration:1E3,delay:0,easing:"easeOutElastic",elasticity:500,round:0},W="translateX translateY translateZ rotate rotateX rotateY rotateZ scale scaleX scaleY scaleZ skewX skewY perspective".split(" "),H,h={arr:function(a){return Array.isArray(a)},obj:function(a){return-1<Object.prototype.toString.call(a).indexOf("Object")},
pth:function(a){return h.obj(a)&&a.hasOwnProperty("totalLength")},svg:function(a){return a instanceof SVGElement},dom:function(a){return a.nodeType||h.svg(a)},str:function(a){return"string"===typeof a},fnc:function(a){return"function"===typeof a},und:function(a){return"undefined"===typeof a},hex:function(a){return/(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(a)},rgb:function(a){return/^rgb/.test(a)},hsl:function(a){return/^hsl/.test(a)},col:function(a){return h.hex(a)||h.rgb(a)||h.hsl(a)}},A=function(){function a(a,
d,b){return(((1-3*b+3*d)*a+(3*b-6*d))*a+3*d)*a}return function(c,d,b,f){if(0<=c&&1>=c&&0<=b&&1>=b){var e=new Float32Array(11);if(c!==d||b!==f)for(var k=0;11>k;++k)e[k]=a(.1*k,c,b);return function(k){if(c===d&&b===f)return k;if(0===k)return 0;if(1===k)return 1;for(var h=0,l=1;10!==l&&e[l]<=k;++l)h+=.1;--l;var l=h+(k-e[l])/(e[l+1]-e[l])*.1,n=3*(1-3*b+3*c)*l*l+2*(3*b-6*c)*l+3*c;if(.001<=n){for(h=0;4>h;++h){n=3*(1-3*b+3*c)*l*l+2*(3*b-6*c)*l+3*c;if(0===n)break;var m=a(l,c,b)-k,l=l-m/n}k=l}else if(0===
n)k=l;else{var l=h,h=h+.1,g=0;do m=l+(h-l)/2,n=a(m,c,b)-k,0<n?h=m:l=m;while(1e-7<Math.abs(n)&&10>++g);k=m}return a(k,d,f)}}}}(),Q=function(){function a(a,b){return 0===a||1===a?a:-Math.pow(2,10*(a-1))*Math.sin(2*(a-1-b/(2*Math.PI)*Math.asin(1))*Math.PI/b)}var c="Quad Cubic Quart Quint Sine Expo Circ Back Elastic".split(" "),d={In:[[.55,.085,.68,.53],[.55,.055,.675,.19],[.895,.03,.685,.22],[.755,.05,.855,.06],[.47,0,.745,.715],[.95,.05,.795,.035],[.6,.04,.98,.335],[.6,-.28,.735,.045],a],Out:[[.25,
.46,.45,.94],[.215,.61,.355,1],[.165,.84,.44,1],[.23,1,.32,1],[.39,.575,.565,1],[.19,1,.22,1],[.075,.82,.165,1],[.175,.885,.32,1.275],function(b,c){return 1-a(1-b,c)}],InOut:[[.455,.03,.515,.955],[.645,.045,.355,1],[.77,0,.175,1],[.86,0,.07,1],[.445,.05,.55,.95],[1,0,0,1],[.785,.135,.15,.86],[.68,-.55,.265,1.55],function(b,c){return.5>b?a(2*b,c)/2:1-a(-2*b+2,c)/2}]},b={linear:A(.25,.25,.75,.75)},f={},e;for(e in d)f.type=e,d[f.type].forEach(function(a){return function(d,f){b["ease"+a.type+c[f]]=h.fnc(d)?
d:A.apply($jscomp$this,d)}}(f)),f={type:f.type};return b}(),ha={css:function(a,c,d){return a.style[c]=d},attribute:function(a,c,d){return a.setAttribute(c,d)},object:function(a,c,d){return a[c]=d},transform:function(a,c,d,b,f){b[f]||(b[f]=[]);b[f].push(c+"("+d+")")}},v=[],B=0,ia=function(){function a(){B=requestAnimationFrame(c)}function c(c){var b=v.length;if(b){for(var d=0;d<b;)v[d]&&v[d].tick(c),d++;a()}else cancelAnimationFrame(B),B=0}return a}();q.version="2.2.0";q.speed=1;q.running=v;q.remove=
function(a){a=P(a);for(var c=v.length;c--;)for(var d=v[c],b=d.animations,f=b.length;f--;)u(a,b[f].animatable.target)&&(b.splice(f,1),b.length||d.pause())};q.getValue=K;q.path=function(a,c){var d=h.str(a)?e(a)[0]:a,b=c||100;return function(a){return{el:d,property:a,totalLength:N(d)*(b/100)}}};q.setDashoffset=function(a){var c=N(a);a.setAttribute("stroke-dasharray",c);return c};q.bezier=A;q.easings=Q;q.timeline=function(a){var c=q(a);c.pause();c.duration=0;c.add=function(d){c.children.forEach(function(a){a.began=
!0;a.completed=!0});m(d).forEach(function(b){var d=z(b,D(S,a||{}));d.targets=d.targets||a.targets;b=c.duration;var e=d.offset;d.autoplay=!1;d.direction=c.direction;d.offset=h.und(e)?b:L(e,b);c.began=!0;c.completed=!0;c.seek(d.offset);d=q(d);d.began=!0;d.completed=!0;d.duration>b&&(c.duration=d.duration);c.children.push(d)});c.seek(0);c.reset();c.autoplay&&c.restart();return c};return c};q.random=function(a,c){return Math.floor(Math.random()*(c-a+1))+a};return q});
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(2)))

/***/ }),
/* 2 */
/***/ (function(module, exports) {

var g;

// This works in non-strict mode
g = (function() {
	return this;
})();

try {
	// This works if eval is allowed (see CSP)
	g = g || Function("return this")() || (1,eval)("this");
} catch(e) {
	// This works if the window reference is available
	if(typeof window === "object")
		g = window;
}

// g can still be undefined, but nothing to do about it...
// We return undefined, instead of nothing here, so it's
// easier to handle this case. if(!global) { ...}

module.exports = g;


/***/ }),
/* 3 */
/***/ (function(module, exports) {

/*!
* screenfull
* v3.3.2 - 2017-10-27
* (c) Sindre Sorhus; MIT License
*/
(function () {
	'use strict';

	var document = typeof window !== 'undefined' && typeof window.document !== 'undefined' ? window.document : {};
	var isCommonjs = typeof module !== 'undefined' && module.exports;
	var keyboardAllowed = typeof Element !== 'undefined' && 'ALLOW_KEYBOARD_INPUT' in Element;

	var fn = (function () {
		var val;

		var fnMap = [
			[
				'requestFullscreen',
				'exitFullscreen',
				'fullscreenElement',
				'fullscreenEnabled',
				'fullscreenchange',
				'fullscreenerror'
			],
			// New WebKit
			[
				'webkitRequestFullscreen',
				'webkitExitFullscreen',
				'webkitFullscreenElement',
				'webkitFullscreenEnabled',
				'webkitfullscreenchange',
				'webkitfullscreenerror'

			],
			// Old WebKit (Safari 5.1)
			[
				'webkitRequestFullScreen',
				'webkitCancelFullScreen',
				'webkitCurrentFullScreenElement',
				'webkitCancelFullScreen',
				'webkitfullscreenchange',
				'webkitfullscreenerror'

			],
			[
				'mozRequestFullScreen',
				'mozCancelFullScreen',
				'mozFullScreenElement',
				'mozFullScreenEnabled',
				'mozfullscreenchange',
				'mozfullscreenerror'
			],
			[
				'msRequestFullscreen',
				'msExitFullscreen',
				'msFullscreenElement',
				'msFullscreenEnabled',
				'MSFullscreenChange',
				'MSFullscreenError'
			]
		];

		var i = 0;
		var l = fnMap.length;
		var ret = {};

		for (; i < l; i++) {
			val = fnMap[i];
			if (val && val[1] in document) {
				for (i = 0; i < val.length; i++) {
					ret[fnMap[0][i]] = val[i];
				}
				return ret;
			}
		}

		return false;
	})();

	var eventNameMap = {
		change: fn.fullscreenchange,
		error: fn.fullscreenerror
	};

	var screenfull = {
		request: function (elem) {
			var request = fn.requestFullscreen;

			elem = elem || document.documentElement;

			// Work around Safari 5.1 bug: reports support for
			// keyboard in fullscreen even though it doesn't.
			// Browser sniffing, since the alternative with
			// setTimeout is even worse.
			if (/ Version\/5\.1(?:\.\d+)? Safari\//.test(navigator.userAgent)) {
				elem[request]();
			} else {
				elem[request](keyboardAllowed && Element.ALLOW_KEYBOARD_INPUT);
			}
		},
		exit: function () {
			document[fn.exitFullscreen]();
		},
		toggle: function (elem) {
			if (this.isFullscreen) {
				this.exit();
			} else {
				this.request(elem);
			}
		},
		onchange: function (callback) {
			this.on('change', callback);
		},
		onerror: function (callback) {
			this.on('error', callback);
		},
		on: function (event, callback) {
			var eventName = eventNameMap[event];
			if (eventName) {
				document.addEventListener(eventName, callback, false);
			}
		},
		off: function (event, callback) {
			var eventName = eventNameMap[event];
			if (eventName) {
				document.removeEventListener(eventName, callback, false);
			}
		},
		raw: fn
	};

	if (!fn) {
		if (isCommonjs) {
			module.exports = false;
		} else {
			window.screenfull = false;
		}

		return;
	}

	Object.defineProperties(screenfull, {
		isFullscreen: {
			get: function () {
				return Boolean(document[fn.fullscreenElement]);
			}
		},
		element: {
			enumerable: true,
			get: function () {
				return document[fn.fullscreenElement];
			}
		},
		enabled: {
			enumerable: true,
			get: function () {
				// Coerce to boolean in case of old WebKit
				return Boolean(document[fn.fullscreenEnabled]);
			}
		}
	});

	if (isCommonjs) {
		module.exports = screenfull;
	} else {
		window.screenfull = screenfull;
	}
})();


/***/ })
/******/ ]);
});
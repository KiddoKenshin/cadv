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

'use strict';

import anime from 'animejs';
import screenfull from 'screenfull';

module.exports = (() => {

  ////////////////////
  // Setting & Utils
  ////////////////////
  // System Settings, can be modify to suit user's needs
  const system = {
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
  const getSystemSetting = (keyName) => {
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
  const setSystemSetting = (keyName, value) => {
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
  let mobile;
  const isMobile = () => {
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
  const getYmdHis = () => {
    const date = new Date();
    return date.getFullYear() +
      ('0' + (date.getMonth() + 1)).slice(-2) +
      ('0' + date.getDate()).slice(-2) +
      ('0' + date.getHours()).slice(-2) +
      ('0' + date.getMinutes()).slice(-2) +
      ('0' + date.getSeconds()).slice(-2);
  };

  /**
   * Display logs in console. Mostly for debugging purpose.
   *
   * @param string message | String to be output in console.
   * @param boolean force | Outputs to console despite of not debug mode.
   * @return void
   */
  const log = (message, force) => {
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
  const error = (message) => {
    alert('Error occured, unable to proceed.');
    throw Error(message);
  };

  ////////////////////
  // States
  ////////////////////
  // Engine's letious states, only to be overwritten by system.
  const states = {
    iDBInit: false,
    startedPreload: false,
    canvasRefresh: false,
    outputingText: false
  };

  ////////////////////
  // Indexed DB
  ////////////////////
  // local storage for contents. Might not work with private mode.
  let iDBObject = null;

  /**
   * Initialize Indexed DB to be used as local content manager. (Async)
   *
   * @returns void
   */
  const iDBInit = () => {
    iDBObject = null;
    if (!window.indexedDB) {
      log('Indexed DB not available');
      states.iDBInit = true;
      return;
    }

    const dbRequest = indexedDB.open('CADV_DB', 1); // Doesn't work in FireFox during Private Mode.
    dbRequest.onupgradeneeded = (event) => {
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
    dbRequest.onsuccess = (event) => {
      iDBObject = dbRequest.result;
      states.iDBInit = true;
      log('DB Opened!');
    };
    dbRequest.onerror = (event) => {
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
  const storeToIndexedDB = (resourceType, uid, dataObject) => {
    if (iDBObject == null) {
      log('iDB not available');
      return;
    }

    const useStorage = resourceType.substring(0, resourceType.length - 1) + 'Storage';
    const dbTransactions = iDBObject.transaction([useStorage], 'readwrite');
    const dbStorage = dbTransactions.objectStore(useStorage);
    const storeRequest = dbStorage.put(dataObject, uid);
    storeRequest.onsuccess = (event) => {
      log(uid + '(' + resourceType + ') stored.');
    };
    storeRequest.onerror = (event) => {
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
  const getFromIndexedDB = (resourceType, uid, callback) => {
    if (iDBObject == null) {
      log('iDB not available');
      callback(resourceType, uid, null);
      return;
    }

    const useStorage = resourceType.substring(0, resourceType.length - 1) + 'Storage';
    const dbTransactions = iDBObject.transaction([useStorage], 'readonly');
    const dbStorage = dbTransactions.objectStore(useStorage);
    const storeRequest = dbStorage.get(uid);
    storeRequest.onsuccess = (event) => {
      log(uid + '(' + resourceType + ') loaded.');
      callback(resourceType, uid, storeRequest.result);
    };
    storeRequest.onerror = (event) => {
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
  const removeFromIndexedDB = (resourceType, uid) => {
    if (iDBObject == null) {
      log('iDB not available');
      return;
    }

    const useStorage = resourceType + 'Storage';
    const dbTransactions = iDBObject.transaction([useStorage], 'readwrite');
    const dbStorage = dbTransactions.objectStore(useStorage);
    const storeRequest = dbStorage.delete(uid);
    storeRequest.onsuccess = (event) => {
      log(uid + '(' + resourceType + ') deleted.');
    };
    storeRequest.onerror = (event) => {
      log(uid + '(' + resourceType + ') error on deleting.');
    };
  };

  /**
   * Clear all Indexed DB
   *
   * @return void
   */
  const clearIndexedDB = () => {
    const dbRequest = indexedDB.deleteDatabase('CADV_DB');
    dbRequest.onsuccess = () => {
      states.iDBInit = false;
      log('DB deleted successfully');
      iDBInit();
    };
    dbRequest.onerror = () => {
      log('Unable to delete DB');
    };
    dbRequest.onblocked = () => {
      log('Unable to delete DB due to the operation being blocked');
    };
  };

  ////////////////////
  // Resources Util
  ////////////////////
  // Stores resource informations to be used later in game.
  let loadErrors = 0;
  const preload = {
    // Format store: {resourceID: resourceUrl}
    images: {},
    audios: {},
    videos: {}
  };
  const resources = {
    images: {}, // Image (From Blob)
    audios: {}, // AudioBuffer (From ArrayBuffer)
    videos: {}  // Video (From Blob)
  };

  ////////////////////
  // Audio Component
  ////////////////////
  // Component that stores audio related settings. (Volume settings, etc)
  const audio = {
    context: null
  };

  const initAudio = () => {
    if (system.useAudio) {
      if (typeof AudioContext !== 'undefined') {
        // Web Audio API is all unprefixed
        audio.context = new AudioContext();
        audio.master = audio.context.createGain();
        audio.master.gain.value = system.masterVolume;
        audio.master.connect(audio.context.destination);

        const audioType = ['bgm', 'sfx', 'voice'];
        for (let i = 0; i < audioType.length; i++) {
          const type = audioType[i];
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

  const playAudio = (audioType, audioId, isLoop = false) => {
    // BGM is always loop
    if (audioType === 'bgm') {
      isLoop = true;
    }

    if (audioType === 'sfx' && !isLoop) {
      // Non-loop SFX is plainly disposable
      const audioOutput = audio.context.createBufferSource();
      audioOutput.buffer = resources.audios[audioId];
      audioOutput.connect(audio.sfx);
      audioOutput.start(0);
    } else {
      audio[audioType + 'out'].buffer = resources.audios[audioId];
      audio[audioType + 'out'].loop = isLoop;
      audio[audioType + 'out'].start(0);
    }
  };

  const playCrossfadeBGM = (audioId, crossfadeDuration) => {
    const bgmVolume = audio.context.createGain();
    bgmVolume.gain.value = 0;
    bgmVolume.connect(audio.master);

    const bgmOutput = audio.context.createBufferSource();
    bgmOutput.buffer = resources.audios[audioId];
    bgmOutput.loop = true;
    bgmOutput.connect(bgmVolume);
    bgmOutput.start(0);

    log('Crossfade begin!');
    /* FIXME: Migrate to AnimeJs
    $.Animation(bgmVolume.gain, {
      value: system.bgmVolume
    }, {
      duration: crossfadeDuration,
      easing: 'linear'
    });

    $.Animation(audio.bgm.gain, {
      value: 0
    }, {
      duration: crossfadeDuration,
      easing: 'linear'
    }).done(function() {
      audio.bgmout.stop();
      delete audio.bgm, audio.bgmout;

      audio.bgm = bgmVolume;
      audio.bgmout = bgmOutput;
      log('Crossfade complete!');
    });
    */
  };

  const stopAudio = (audioType) => {
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
  const addPreloadResource = (resourceType, resourceID, resourceURL) => {
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
      default: {
        const message = resourceType + ' is not a valid resource type!';
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
  const startPreloadResources = () => {

    if (states.startedPreload) {
      log('Preload started');
      return;
    }
    states.startedPreload = true;

    const assignToResource = (resourceType, uid, resourceData) => {
      switch (resourceType) {
        case 'images': {
          const newImage = new Image();
          newImage.src = URL.createObjectURL(resourceData);
          resources.images[uid] = newImage;
          break;
        }
        case 'videos': {
          const newVideo = document.createElement('video');
          newVideo.src = URL.createObjectURL(resourceData);
          resources.videos[uid] = newVideo;
          break;
        }
        case 'audios': {
          audio.context.decodeAudioData(resourceData, (buffer) => {
            resources.audios[uid] = buffer;
            log(uid + '(' + resourceType + ') decoded!');
          }, () => {
            // Error Callback
            const message = uid + '(' + resourceType + ') error! (Decode)';
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

    const loadResourceFromXHR = (resourceType, uid, resourceUrl) => {
      // Simple DRM 1, CORS policy apply to XHR in the new browsers.
      const xhRequest = new XMLHttpRequest();
      xhRequest.open('GET', resourceUrl, true);
      xhRequest.responseType = 'arraybuffer';
      xhRequest.onload = (eventObj) => {
        const rawArrayBuffer = xhRequest.response;
        const contentBlob = new Blob([rawArrayBuffer]);

        let useData = contentBlob;
        if (resourceType === 'audios') {
          useData = rawArrayBuffer;
        }
        storeToIndexedDB(resourceType, uid, useData);
        assignToResource(resourceType, uid, useData);

        log(resourceUrl + ' loaded!');
      };
      xhRequest.onerror = (eventObj) => {
        const message = resourceUrl + ' error! (Request)';
        loadErrors += 1;
        log(message);
        if (system.stopOnError) {
          error(message);
        }
      };
      xhRequest.onprogress = (eventObj) => {
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

    const storageCallback = (resourceType, uid, resourceData) => {
      if (resourceData != null) {
        assignToResource(resourceType, uid, resourceData);
      } else {
        loadResourceFromXHR(resourceType, uid, preload[resourceType][uid]);
      }
    };

    const afterInit = () => {
      // Init Audio related in Preload
      if (!initAudio()) {
        log('Unable to create audio context. Web Audio API might be not available.');
        log('No audio will be loaded.');

        // Empty Audio list
        preload.audios = {};
      }

      for (let i = 0, keys = Object.keys(preload); i < keys.length; i++) {
        const resourceType = keys[i];
        if (Object.keys(preload[resourceType]).length !== 0) {
          if (resourceType === 'audios' && !system.useAudio) {
            log('Skipping audio list. (UseAudio disabled)');
            continue;
          }
          log('Total of preload ' + resourceType + ': ' + Object.keys(preload[resourceType]).length);

          const idKeys = Object.keys(preload[resourceType]);
          for (let j = 0; j < idKeys.length; j++) {
            // Load Resource
            // Attempt to retrieve from Storage, load from XHR when empty
            const resourceID = idKeys[j];
            getFromIndexedDB(resourceType, resourceID, storageCallback);
          }
        } else {
          log('Preload list of ' + resourceType + ' is empty!');
        }
      }
    };

    iDBInit();
    let dbInitTimer = setInterval(() => {
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
  const customVars = {};

  const getCustomVariable = (keyName) => {
    if (customVars[keyName] === undefined) {
      return null;
    }
    return customVars[keyName];
  };

  const setCustomVariable = (keyName, value) => {
    customVars[keyName] = value;
    return customVars[keyName];
  };

  ////////////////////
  // Text Output
  ////////////////////
  // HTML5 Canvas do not recognize new lines, therefore using HTML/CSS features to output text.
  const cssStorages = {
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
  const setCSSValue = (componentName, propertyName, propertyValue) => {
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
  let canvas;
  let canvasContext;
  const oldObjects = {
    backgrounds: {},
    characters: {},
    messagewindow: {}
  };
  const detailObjects = {
    backgrounds: {},
    characters: {},
    messagewindow: {}
  };

  const performScaling = () => {
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

  const stopScaling = () => {
    system.autoScale = false;
    system.screenScale = 1.0;
    canvas.width = system.width;
    canvas.height = system.height;
  };

  const createImage = (imageType, uid, imageID, extraParams) => {
    const newImage = resources.images[imageID];
    const newCanvas = document.createElement('canvas');
    const detailObject = {
      id: uid, // Unique ID
      canvasObject: newCanvas, // Canvas Object Holder
      imageObject: newImage, // Image Object Holder
      type: imageType, //
      percentX: '0',
      percentY: '0',
      x: '0',
      y: '0',
      iWidth: newImage.width,
      iHeight: newImage.height,
      hFlip: '1', // Horizontal Flip
      vFlip: '1', // Vertical Flip
      opac: '1', // Opacity
      originX: '50%', // Transform Origin X
      originY: '50%', // Transform Origin Y
      stretch: false, // Enable stretch (Mainly used in BG)
      stretchScale: '1', // Stretched Scale
      imageScale: '1', // Image Scale
      rotate: '0', // Rotation (Degree, 0 - 360)
      xSlice: '1',
      ySlice: '1',
      xCount: '0',
      yCount: '0'
      // Default Offset?
    };

    // Overwrites Parameter above if extra parameters were provided
    if (extraParams !== undefined) {
      for (let i = 0, keys = Object.keys(extraParams); i < keys.length; i++) {
        const key = keys[i];
        if (detailObject[key] !== undefined) {
          detailObject[key] = extraParams[key];
        }
      }
    }

    if (extraParams !== undefined && extraParams.parentId !== undefined && extraParams.childType !== undefined) {
      if (detailObjects[imageType][extraParams.parentId] === undefined) {
        throw new Error('No such parent!');
      }
      if (detailObjects[imageType][extraParams.parentId][extraParams.childType] === undefined) {
        detailObjects[imageType][extraParams.parentId][extraParams.childType] = {};
      }
      detailObjects[imageType][extraParams.parentId][extraParams.childType] = detailObject;
    } else {
      detailObjects[imageType][uid] = detailObject;
    }

    return uid;
  };

  const drawDetail = (detailObject, parentObject) => {
    if (oldObjects[detailObject.type][detailObject.id] === undefined) {
      oldObjects[detailObject.type][detailObject.id] = Object.assign({}, detailObject);
    }

    detailObject.canvasObject.width = canvas.width;
    detailObject.canvasObject.height = canvas.height;
    if (parentObject !== undefined) {
      detailObject.canvasObject.width = system.width;
      detailObject.canvasObject.height = system.height;
      // Need calculate both to acquire enough canvas size
    }
    const ncContext = detailObject.canvasObject.getContext('2d');

    let scale = canvas.width / detailObject.imageObject.width;
    detailObject.stretchScale = scale;
    scale *= detailObject.imageScale;

    if (detailObject.stretch) {
      detailObject.iWidth = detailObject.imageObject.width * detailObject.imageScale;
      detailObject.iHeight = detailObject.imageObject.height * detailObject.imageScale;
      ncContext.scale(scale * parseInt(detailObject.hFlip, 10), scale * parseInt(detailObject.vFlip, 10));
    } else if (parentObject !== undefined) {
      ncContext.scale(detailObject.hFlip * detailObject.imageScale, detailObject.vFlip * detailObject.imageScale);
    } else {
      // ncContext.scale(detailObject.hFlip * detailObject.imageScale * cadv.system.screenscale, detailObject.vFlip * detailObject.imageScale * cadv.system.screenscale);
      ncContext.scale(detailObject.hFlip * detailObject.imageScale, detailObject.vFlip * detailObject.imageScale);
    }

    let useOriginX = detailObject.originX;
    let useOriginY = detailObject.originY;
    if (useOriginX.indexOf('%') !== 0) {
      useOriginX = detailObject.imageObject.width * (parseInt(useOriginX, 10) / 100);
    }
    if (useOriginY.indexOf('%') !== 0) {
      useOriginY = detailObject.imageObject.height * (parseInt(useOriginY, 10) / 100);
    }

    ncContext.translate(useOriginX, useOriginY);
    if (parseInt(detailObject.rotate, 10) !== 0) {
      ncContext.rotate(detailObject.rotate * (Math.PI / 180));
    }
    ncContext.translate(-useOriginX, -useOriginY);

    ncContext.globalAlpha = detailObject.opac;

    let useX = detailObject.x;
    let useY = detailObject.y;
    const prevXPercent = oldObjects[detailObject.type][detailObject.id].percentX;
    const prevYPercent = oldObjects[detailObject.type][detailObject.id].percentY;
    if (detailObject.percentX !== prevXPercent) {
      useX = ((detailObject.iWidth - detailObject.imageObject.width) / detailObject.imageScale) * (parseInt(detailObject.percentX, 10) / 100) * -1; // This Works
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
    if (detailObject.percentY !== prevYPercent) {
      let useScale = detailObject.imageScale;
      if (detailObject.stretch) {
        useScale = detailObject.stretchScale * detailObject.imageScale;
      }
      // useY = ((this.iHeight - image.height) / this.iScale) * (parseInt(this.percentY, 10) / 100) * -1; // Not Working
      useY = ((detailObject.imageObject.height - (canvas.height / useScale))) * (parseInt(detailObject.percentY, 10) / 100) * -1; // It works!
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

    if (detailObject.xSlice === '1' && detailObject.ySlice === '1') {
      // ncContext.drawImage(detailObject.imageObject, useX, useY, detailObject.imageObject.width * cadv.system.screenscale, detailObject.imageObject.height * cadv.system.screenscale);
      // ncContext.drawImage(detailObject.imageObject, 0, 0, detailObject.imageObject.width, detailObject.imageObject.height, useX, useY, detailObject.imageObject.width * cadv.system.screenscale, detailObject.imageObject.height * cadv.system.screenscale);
      ncContext.drawImage(detailObject.imageObject, 0, 0, detailObject.imageObject.width, detailObject.imageObject.height, useX, useY, detailObject.imageObject.width, detailObject.imageObject.height);
    } else {
      const xSize = detailObject.imageObject.width / detailObject.xSlice;
      const ySize = detailObject.imageObject.height / detailObject.ySlice;
      const xOffset = xSize * parseInt(detailObject.xCount, 10);
      const yOffset = ySize * parseInt(detailObject.yCount, 10);
      ncContext.drawImage(detailObject.imageObject, xOffset, yOffset, xSize, ySize, parseFloat(useX) + parseFloat(parentObject.x), parseFloat(useY) + parseFloat(parentObject.y), xSize, ySize);

      // log(ySize);

      // delete xSize, ySize, xOffset, yOffset;
    }

    oldObjects[detailObject.type][detailObject.id] = Object.assign({}, detailObject);

    if (detailObject.type === 'characters' && detailObject.face !== undefined) {
      ncContext.drawImage(drawDetail(detailObject.face, detailObject), 0, 0);
    }

    // delete ncContext, useX, useY;
    return detailObject.canvasObject;
  };

  // TODO: Modify for other uses (Shooter, RPG, etc...)?
  const drawCanvas = () => {

    let widthOffset = 0;
    let heightOffset = 0;
    widthOffset = Math.round(window.innerWidth - (system.width * system.screenScale));
    heightOffset = Math.round(window.innerHeight - (system.height * system.screenScale));

    // DEV NOTES:
    // http://stackoverflow.com/questions/18565395/why-does-canvas-context-drawimage-fail-on-iphone
    // Explains canvasContext.drawImage (with 9 params) not working on iPhone but the one with 5 params does.

    // Background Layer
    for (let i = 0, keys = Object.keys(detailObjects.backgrounds); i < keys.length; i++) {
      const uid = keys[i];
      if (isMobile()) {
        // canvasContext.drawImage(this.drawDetail(detailObjects.backgrounds[uid]), widthOffset, heightOffset, canvas.width, canvas.height);
        canvasContext.drawImage(drawDetail(detailObjects.backgrounds[uid]), 0, 0, canvas.width, canvas.height);
      } else {
        // canvasContext.drawImage(this.drawDetail(detailObjects.backgrounds[uid]), 0, 0, cadv.system.width * cadv.system.screenscale, cadv.system.height * cadv.system.screenscale, widthOffset, heightOffset, cadv.system.width * cadv.system.screenscale, cadv.system.height * cadv.system.screenscale);
        // canvasContext.drawImage(this.drawDetail(detailObjects.backgrounds[uid]), 0, 0, cadv.system.width, cadv.system.height, widthOffset, heightOffset, cadv.system.width, cadv.system.height);
        canvasContext.drawImage(drawDetail(detailObjects.backgrounds[uid]), 0, 0, system.width, system.height, 0, 0, system.width, system.height);
      }
    }

    for (let i = 0, keys = Object.keys(detailObjects.characters); i < keys.length; i++) {
      const uid = keys[i];
      if (isMobile()) {
        // canvasContext.drawImage(this.drawDetail(detailObjects.characters[uid]), widthOffset, heightOffset, canvas.width, canvas.height);
        canvasContext.drawImage(drawDetail(detailObjects.characters[uid]), 0, 0, canvas.width, canvas.height);
      } else {
        // canvasContext.drawImage(this.drawDetail(detailObjects.characters[uid]), 0, 0, cadv.system.width * cadv.system.screenscale, cadv.system.height * cadv.system.screenscale, widthOffset, heightOffset, cadv.system.width * cadv.system.screenscale, cadv.system.height * cadv.system.screenscale);
        // canvasContext.drawImage(this.drawDetail(detailObjects.characters[uid]), 0, 0, cadv.system.width, cadv.system.height, widthOffset, heightOffset, cadv.system.width, cadv.system.height);
        canvasContext.drawImage(drawDetail(detailObjects.characters[uid]), 0, 0, system.width, system.height, 0, 0, system.width, system.height);
      }
    }

    for (let i = 0, keys = Object.keys(detailObjects.messagewindow); i < keys.length; i++) {
      const uid = keys[i];
      if (isMobile()) {
        // canvasContext.drawImage(this.drawDetail(detailObjects.messagewindow[uid]), widthOffset, heightOffset, canvas.width, canvas.height);
        canvasContext.drawImage(drawDetail(detailObjects.messagewindow[uid]), 0, 0, canvas.width, canvas.height);
      } else {
        // canvasContext.drawImage(this.drawDetail(detailObjects.messagewindow[uid]), 0, 0, cadv.system.width, cadv.system.height, widthOffset, heightOffset, cadv.system.width * cadv.system.screenscale, cadv.system.height * cadv.system.screenscale);
        // canvasContext.drawImage(this.drawDetail(detailObjects.messagewindow[uid]), 0, 0, cadv.system.width, cadv.system.height, widthOffset, heightOffset, cadv.system.width, cadv.system.height);
        canvasContext.drawImage(drawDetail(detailObjects.messagewindow[uid]), 0, 0, system.width, system.height, 0, 0, system.width, system.height);
      }
    }

  };

  const resetCanvas = () => {
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

  const setPosition = () => {
    if (!states.canvasRefresh) {
      log('Not running yet. Do nothing.');
      return;
    }

    if (detailObjects.messagewindow.base === undefined) {
      log('Message Window not ready!');
      setTimeout(setPosition, 1000);
      return;
    }

    let widthOffset = Math.round(window.innerWidth - (system.width * system.screenScale)) / 2;
    let heightOffset = Math.round(window.innerHeight - (system.height * system.screenScale)) / 2;

    if (system.screenScale <= 0.5) {
      heightOffset = 0;
    }

    const cadvCV = document.getElementById('cadv');
    cadvCV.style.position = 'fixed'; // absolute?
    cadvCV.style.left = (widthOffset + 'px');
    cadvCV.style.top = (heightOffset + 'px');

    system.textSelector.style.left = ((parseInt(cssStorages.textOutCSS.left, 10) + parseInt(detailObjects.messagewindow.base.x, 10)) * system.screenScale) + widthOffset + 'px';
    system.textSelector.style.top = ((parseInt(cssStorages.textOutCSS.top, 10) + parseInt(detailObjects.messagewindow.base.y, 10)) * system.screenScale) + heightOffset + 'px';
    if (system.screenScale !== 1.0) {
      system.textSelector.style.transform = 'scale(' + system.screenScale + ')';
      system.textSelector.style.transformOrigin = '0% 0%';
    } else {
      system.textSelector.style.transform = '';
      system.textSelector.style.transformOrigin = '';
    }

  };

  const start = (callback) => {
    states.canvasRefresh = true;
    // jQuery.fx.timer(resetCanvas);
    window.requestAnimationFrame(resetCanvas);

    if (callback !== undefined && typeof callback === 'function') {
      callback();
    }

    // Besure to remember to set MessageBox in callback
    setPosition();
  };

  const stop = () => {
    states.canvasRefresh = false;
  };

  const canvasInit = (callback) => {
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
    let stringTextOutCSS = '';
    for (let i = 0, keys = Object.keys(cssStorages.textOutCSS); i < keys.length; i++) {
      const key = keys[i];
      stringTextOutCSS += (key + ':' + cssStorages.textOutCSS[key] + ';');
    }
    stringTextOutCSS = 'div#textout{' + stringTextOutCSS + '}';

    // CSS for choiceBox
    let stringChoiceBoxCSS = '';
    for (let i = 0, keys = Object.keys(cssStorages.choiceBoxCSS); i < keys.length; i++) {
      const key = keys[i];
      stringChoiceBoxCSS += (key + ':' + cssStorages.choiceBoxCSS[key] + ';');
    }
    stringChoiceBoxCSS = 'div.choice{' + stringChoiceBoxCSS + '}';

    // CSS for choiceBoxHover
    let stringChoiceBoxHoverCSS = '';
    for (let i = 0, keys = Object.keys(cssStorages.choiceBoxHoverCSS); i < keys.length; i++) {
      const key = keys[i];
      stringChoiceBoxHoverCSS += (key + ':' + cssStorages.choiceBoxHoverCSS[key] + ';');
    }
    stringChoiceBoxHoverCSS = 'div.choice.hovered{' + stringChoiceBoxHoverCSS + '}';

    // Default CSS settings for all browsers
    document.head.innerHTML += '<style>*{padding:0;margin:0;}::-webkit-scrollbar{display: none;}canvas{vertical-align:top;}.pointer{cursor:pointer;}' + stringTextOutCSS + stringChoiceBoxCSS + stringChoiceBoxHoverCSS + '</style>';

    let timer = setInterval(() => {
      if ((Object.keys(preload.images).length + Object.keys(preload.audios).length + (Object.keys(preload.videos).length - loadErrors)) === (Object.keys(resources.images).length + Object.keys(resources.audios).length + Object.keys(resources.videos).length)) {
        clearInterval(timer);

        // Create Text Output
        const newDiv = document.createElement('div');
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

  const textWriter = (inputString) => {
    const inputLength = inputString.length;
    let textPosition = 0;
    let writerTimer = null;

    const outputText = () => {
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
  window.onresize = (eventObj) => {
    eventObj.preventDefault(); // DOM2
    if (system.autoScale) {
      performScaling();
    }
    setPosition();
  };

  //<< KEYBOARD >>//
  window.onkeydown = (eventObj) => {
    eventObj.preventDefault(); // DOM2
    const keyLocation = eventObj.location;
    const whichKey = eventObj.which;

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

  window.onkeyup = (eventObj) => {
    eventObj.preventDefault(); // DOM2
    const keyLocation = eventObj.location;
    const whichKey = eventObj.which;

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
  window.onmousedown = (eventObj) => {
    eventObj.preventDefault(); // DOM2
    const whichKey = eventObj.which;

    switch (whichKey) {
      case 1:
        // Left Click: Next Script, Decide
        break;
      default:
        break;
    }
  };

  document.onselectstart = () => {
    // Disable Text Highlight
    return false;
  };

  //<< GAMEPAD API? >>//
  // Work In Progress
  let cadvGamepad = null;
  let gpLoopTimer;
  window.addEventListener('gamepadconnected', (eventObj) => {
    cadvGamepad = eventObj.gamepad;
    gpLoopTimer = setInterval(() => {

      for (let i = 0, max = cadvGamepad.buttons.length; i < max; i++) {
        console.log('Key ' + i + ' state: ' + cadvGamepad.buttons[i].pressed);
      }

    }, 1000);
  });

  window.addEventListener('gamepaddisconnected', (eventObj) => {
    clearInterval(gpLoopTimer);
    cadvGamepad = null;
  });

  // -- // End Of CADV Functional Stuffs // -- //

  // Only expose letiables and functions that are needed(public).
  return {
    // System & Utils
    getSystemSetting,
    setSystemSetting,
    isMobile,

    // Custom variables
    getCustomVariable,
    setCustomVariable,

    // Resources
    addPreloadResource,
    startPreloadResources,

    // Text CSS
    setCSSValue,

    detailObjects, // FIXME: Too dangerous to expose?
    createImage,

    setPosition, // FIXME: Too dangerous to expose?
    canvasInit,
    start,

    // Library & Utils
    anime // DirectCall to AnimeJS
  };
})();

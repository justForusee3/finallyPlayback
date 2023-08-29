/**
 * App version: 1.0.0
 * SDK version: 4.8.1
 * CLI version: 2.12.0
 *
 * Generated: Tue, 29 Aug 2023 13:03:55 GMT
 */

var APP_tv_app = (function () {
  'use strict';

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */

  const settings = {};
  const subscribers = {};
  const initSettings = (appSettings, platformSettings) => {
    settings['app'] = appSettings;
    settings['platform'] = platformSettings;
    settings['user'] = {};
  };
  const publish = (key, value) => {
    subscribers[key] && subscribers[key].forEach(subscriber => subscriber(value));
  };
  const dotGrab = function () {
    let obj = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    let key = arguments.length > 1 ? arguments[1] : undefined;
    if (obj === null) return undefined;
    const keys = key.split('.');
    for (let i = 0; i < keys.length; i++) {
      obj = obj[keys[i]] = obj[keys[i]] !== undefined ? obj[keys[i]] : {};
    }
    return typeof obj === 'object' && obj !== null ? Object.keys(obj).length ? obj : undefined : obj;
  };
  var Settings = {
    get(type, key) {
      let fallback = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : undefined;
      const val = dotGrab(settings[type], key);
      return val !== undefined ? val : fallback;
    },
    has(type, key) {
      return !!this.get(type, key);
    },
    set(key, value) {
      settings['user'][key] = value;
      publish(key, value);
    },
    subscribe(key, callback) {
      subscribers[key] = subscribers[key] || [];
      subscribers[key].push(callback);
    },
    unsubscribe(key, callback) {
      if (callback) {
        const index = subscribers[key] && subscribers[key].findIndex(cb => cb === callback);
        index > -1 && subscribers[key].splice(index, 1);
      } else {
        if (key in subscribers) {
          subscribers[key] = [];
        }
      }
    },
    clearSubscribers() {
      for (const key of Object.getOwnPropertyNames(subscribers)) {
        delete subscribers[key];
      }
    }
  };

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
  const prepLog = (type, args) => {
    const colors = {
      Info: 'green',
      Debug: 'gray',
      Warn: 'orange',
      Error: 'red'
    };
    args = Array.from(args);
    return ['%c' + (args.length > 1 && typeof args[0] === 'string' ? args.shift() : type), 'background-color: ' + colors[type] + '; color: white; padding: 2px 4px; border-radius: 2px', args];
  };
  var Log = {
    info() {
      Settings.get('platform', 'log') && console.log.apply(console, prepLog('Info', arguments));
    },
    debug() {
      Settings.get('platform', 'log') && console.debug.apply(console, prepLog('Debug', arguments));
    },
    error() {
      Settings.get('platform', 'log') && console.error.apply(console, prepLog('Error', arguments));
    },
    warn() {
      Settings.get('platform', 'log') && console.warn.apply(console, prepLog('Warn', arguments));
    }
  };

  var executeAsPromise = (function (method) {
    let args = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
    let context = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
    let result;
    if (method && typeof method === 'function') {
      try {
        result = method.apply(context, args);
      } catch (e) {
        result = e;
      }
    } else {
      result = method;
    }

    // if it looks like a duck .. ehm ... promise and talks like a promise, let's assume it's a promise
    if (result !== null && typeof result === 'object' && result.then && typeof result.then === 'function') {
      return result;
    }
    // otherwise make it into a promise
    else {
      return new Promise((resolve, reject) => {
        if (result instanceof Error) {
          reject(result);
        } else {
          resolve(result);
        }
      });
    }
  });

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
  let sendMetric = (type, event, params) => {
    Log.info('Sending metric', type, event, params);
  };
  const initMetrics = config => {
    sendMetric = config.sendMetric;
  };

  // available metric per category
  const metrics$1 = {
    app: ['launch', 'loaded', 'ready', 'close'],
    page: ['view', 'leave'],
    user: ['click', 'input'],
    media: ['abort', 'canplay', 'ended', 'pause', 'play',
    // with some videos there occur almost constant suspend events ... should investigate
    // 'suspend',
    'volumechange', 'waiting', 'seeking', 'seeked']
  };

  // error metric function (added to each category)
  const errorMetric = function (type, message, code, visible) {
    let params = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {};
    params = {
      params,
      ...{
        message,
        code,
        visible
      }
    };
    sendMetric(type, 'error', params);
  };
  const Metric = function (type, events) {
    let options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    return events.reduce((obj, event) => {
      obj[event] = function (name) {
        let params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        params = {
          ...options,
          ...(name ? {
            name
          } : {}),
          ...params
        };
        sendMetric(type, event, params);
      };
      return obj;
    }, {
      error(message, code, params) {
        errorMetric(type, message, code, params);
      },
      event(name, params) {
        sendMetric(type, name, params);
      }
    });
  };
  const Metrics = types => {
    return Object.keys(types).reduce((obj, type) => {
      // media metric works a bit different!
      // it's a function that accepts a url and returns an object with the available metrics
      // url is automatically passed as a param in every metric
      type === 'media' ? obj[type] = url => Metric(type, types[type], {
        url
      }) : obj[type] = Metric(type, types[type]);
      return obj;
    }, {
      error: errorMetric,
      event: sendMetric
    });
  };
  var Metrics$1 = Metrics(metrics$1);

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */

  var events$1 = {
    abort: 'Abort',
    canplay: 'CanPlay',
    canplaythrough: 'CanPlayThrough',
    durationchange: 'DurationChange',
    emptied: 'Emptied',
    encrypted: 'Encrypted',
    ended: 'Ended',
    error: 'Error',
    interruptbegin: 'InterruptBegin',
    interruptend: 'InterruptEnd',
    loadeddata: 'LoadedData',
    loadedmetadata: 'LoadedMetadata',
    loadstart: 'LoadStart',
    pause: 'Pause',
    play: 'Play',
    playing: 'Playing',
    progress: 'Progress',
    ratechange: 'Ratechange',
    seeked: 'Seeked',
    seeking: 'Seeking',
    stalled: 'Stalled',
    // suspend: 'Suspend', // this one is called a looooot for some videos
    timeupdate: 'TimeUpdate',
    volumechange: 'VolumeChange',
    waiting: 'Waiting'
  };

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */

  var autoSetupMixin = (function (sourceObject) {
    let setup = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : () => {};
    let ready = false;
    const doSetup = () => {
      if (ready === false) {
        setup();
        ready = true;
      }
    };
    return Object.keys(sourceObject).reduce((obj, key) => {
      if (typeof sourceObject[key] === 'function') {
        obj[key] = function () {
          doSetup();
          return sourceObject[key].apply(sourceObject, arguments);
        };
      } else if (typeof Object.getOwnPropertyDescriptor(sourceObject, key).get === 'function') {
        obj.__defineGetter__(key, function () {
          doSetup();
          return Object.getOwnPropertyDescriptor(sourceObject, key).get.apply(sourceObject);
        });
      } else if (typeof Object.getOwnPropertyDescriptor(sourceObject, key).set === 'function') {
        obj.__defineSetter__(key, function () {
          doSetup();
          return Object.getOwnPropertyDescriptor(sourceObject, key).set.sourceObject[key].apply(sourceObject, arguments);
        });
      } else {
        obj[key] = sourceObject[key];
      }
      return obj;
    }, {});
  });

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */

  let timeout = null;
  var easeExecution = ((cb, delay) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      cb();
    }, delay);
  });

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */

  let basePath;
  let proxyUrl;
  const initUtils = config => {
    basePath = ensureUrlWithProtocol(makeFullStaticPath(window.location.pathname, config.path || '/'));
    if (config.proxyUrl) {
      proxyUrl = ensureUrlWithProtocol(config.proxyUrl);
    }
  };
  var Utils = {
    asset(relPath) {
      return basePath + relPath;
    },
    proxyUrl(url) {
      let options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      return proxyUrl ? proxyUrl + '?' + makeQueryString(url, options) : url;
    },
    makeQueryString() {
      return makeQueryString(...arguments);
    },
    // since imageworkers don't work without protocol
    ensureUrlWithProtocol() {
      return ensureUrlWithProtocol(...arguments);
    }
  };
  const ensureUrlWithProtocol = url => {
    if (/^\/\//.test(url)) {
      return window.location.protocol + url;
    }
    if (!/^(?:https?:)/i.test(url)) {
      return window.location.origin + url;
    }
    return url;
  };
  const makeFullStaticPath = function () {
    let pathname = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '/';
    let path = arguments.length > 1 ? arguments[1] : undefined;
    // ensure path has traling slash
    path = path.charAt(path.length - 1) !== '/' ? path + '/' : path;

    // if path is URL, we assume it's already the full static path, so we just return it
    if (/^(?:https?:)?(?:\/\/)/.test(path)) {
      return path;
    }
    if (path.charAt(0) === '/') {
      return path;
    } else {
      // cleanup the pathname (i.e. remove possible index.html)
      pathname = cleanUpPathName(pathname);

      // remove possible leading dot from path
      path = path.charAt(0) === '.' ? path.substr(1) : path;
      // ensure path has leading slash
      path = path.charAt(0) !== '/' ? '/' + path : path;
      return pathname + path;
    }
  };
  const cleanUpPathName = pathname => {
    if (pathname.slice(-1) === '/') return pathname.slice(0, -1);
    const parts = pathname.split('/');
    if (parts[parts.length - 1].indexOf('.') > -1) parts.pop();
    return parts.join('/');
  };
  const makeQueryString = function (url) {
    let options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    let type = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'url';
    // add operator as an option
    options.operator = 'metrological'; // Todo: make this configurable (via url?)
    // add type (= url or qr) as an option, with url as the value
    options[type] = url;
    return Object.keys(options).map(key => {
      return encodeURIComponent(key) + '=' + encodeURIComponent('' + options[key]);
    }).join('&');
  };

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
  const initProfile = config => {
    config.getInfo;
    config.setInfo;
  };

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */

  var Lightning = window.lng;

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
  const events = ['timeupdate', 'error', 'ended', 'loadeddata', 'canplay', 'play', 'playing', 'pause', 'loadstart', 'seeking', 'seeked', 'encrypted'];
  let mediaUrl$1 = url => url;
  const initMediaPlayer = config => {
    if (config.mediaUrl) {
      mediaUrl$1 = config.mediaUrl;
    }
  };
  class Mediaplayer extends Lightning.Component {
    _construct() {
      this._skipRenderToTexture = false;
      this._metrics = null;
      this._textureMode = Settings.get('platform', 'textureMode') || false;
      Log.info('Texture mode: ' + this._textureMode);
      console.warn(["The 'MediaPlayer'-plugin in the Lightning-SDK is deprecated and will be removed in future releases.", "Please consider using the new 'VideoPlayer'-plugin instead.", 'https://rdkcentral.github.io/Lightning-SDK/#/plugins/videoplayer'].join('\n\n'));
    }
    static _template() {
      return {
        Video: {
          VideoWrap: {
            VideoTexture: {
              visible: false,
              pivot: 0.5,
              texture: {
                type: Lightning.textures.StaticTexture,
                options: {}
              }
            }
          }
        }
      };
    }
    set skipRenderToTexture(v) {
      this._skipRenderToTexture = v;
    }
    get textureMode() {
      return this._textureMode;
    }
    get videoView() {
      return this.tag('Video');
    }
    _init() {
      //re-use videotag if already there
      const videoEls = document.getElementsByTagName('video');
      if (videoEls && videoEls.length > 0) this.videoEl = videoEls[0];else {
        this.videoEl = document.createElement('video');
        this.videoEl.setAttribute('id', 'video-player');
        this.videoEl.style.position = 'absolute';
        this.videoEl.style.zIndex = '1';
        this.videoEl.style.display = 'none';
        this.videoEl.setAttribute('width', '100%');
        this.videoEl.setAttribute('height', '100%');
        this.videoEl.style.visibility = this.textureMode ? 'hidden' : 'visible';
        document.body.appendChild(this.videoEl);
      }
      if (this.textureMode && !this._skipRenderToTexture) {
        this._createVideoTexture();
      }
      this.eventHandlers = [];
    }
    _registerListeners() {
      events.forEach(event => {
        const handler = e => {
          if (this._metrics && this._metrics[event] && typeof this._metrics[event] === 'function') {
            this._metrics[event]({
              currentTime: this.videoEl.currentTime
            });
          }
          this.fire(event, {
            videoElement: this.videoEl,
            event: e
          });
        };
        this.eventHandlers.push(handler);
        this.videoEl.addEventListener(event, handler);
      });
    }
    _deregisterListeners() {
      Log.info('Deregistering event listeners MediaPlayer');
      events.forEach((event, index) => {
        this.videoEl.removeEventListener(event, this.eventHandlers[index]);
      });
      this.eventHandlers = [];
    }
    _attach() {
      this._registerListeners();
    }
    _detach() {
      this._deregisterListeners();
      this.close();
    }
    _createVideoTexture() {
      const stage = this.stage;
      const gl = stage.gl;
      const glTexture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, glTexture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      this.videoTexture.options = {
        source: glTexture,
        w: this.videoEl.width,
        h: this.videoEl.height
      };
    }
    _startUpdatingVideoTexture() {
      if (this.textureMode && !this._skipRenderToTexture) {
        const stage = this.stage;
        if (!this._updateVideoTexture) {
          this._updateVideoTexture = () => {
            if (this.videoTexture.options.source && this.videoEl.videoWidth && this.active) {
              const gl = stage.gl;
              const currentTime = new Date().getTime();

              // When BR2_PACKAGE_GST1_PLUGINS_BAD_PLUGIN_DEBUGUTILS is not set in WPE, webkitDecodedFrameCount will not be available.
              // We'll fallback to fixed 30fps in this case.
              const frameCount = this.videoEl.webkitDecodedFrameCount;
              const mustUpdate = frameCount ? this._lastFrame !== frameCount : this._lastTime < currentTime - 30;
              if (mustUpdate) {
                this._lastTime = currentTime;
                this._lastFrame = frameCount;
                try {
                  gl.bindTexture(gl.TEXTURE_2D, this.videoTexture.options.source);
                  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
                  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.videoEl);
                  this._lastFrame = this.videoEl.webkitDecodedFrameCount;
                  this.videoTextureView.visible = true;
                  this.videoTexture.options.w = this.videoEl.videoWidth;
                  this.videoTexture.options.h = this.videoEl.videoHeight;
                  const expectedAspectRatio = this.videoTextureView.w / this.videoTextureView.h;
                  const realAspectRatio = this.videoEl.videoWidth / this.videoEl.videoHeight;
                  if (expectedAspectRatio > realAspectRatio) {
                    this.videoTextureView.scaleX = realAspectRatio / expectedAspectRatio;
                    this.videoTextureView.scaleY = 1;
                  } else {
                    this.videoTextureView.scaleY = expectedAspectRatio / realAspectRatio;
                    this.videoTextureView.scaleX = 1;
                  }
                } catch (e) {
                  Log.error('texImage2d video', e);
                  this._stopUpdatingVideoTexture();
                  this.videoTextureView.visible = false;
                }
                this.videoTexture.source.forceRenderUpdate();
              }
            }
          };
        }
        if (!this._updatingVideoTexture) {
          stage.on('frameStart', this._updateVideoTexture);
          this._updatingVideoTexture = true;
        }
      }
    }
    _stopUpdatingVideoTexture() {
      if (this.textureMode) {
        const stage = this.stage;
        stage.removeListener('frameStart', this._updateVideoTexture);
        this._updatingVideoTexture = false;
        this.videoTextureView.visible = false;
        if (this.videoTexture.options.source) {
          const gl = stage.gl;
          gl.bindTexture(gl.TEXTURE_2D, this.videoTexture.options.source);
          gl.clearColor(0, 0, 0, 1);
          gl.clear(gl.COLOR_BUFFER_BIT);
        }
      }
    }
    updateSettings() {
      let settings = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      // The Component that 'consumes' the media player.
      this._consumer = settings.consumer;
      if (this._consumer && this._consumer.getMediaplayerSettings) {
        // Allow consumer to add settings.
        settings = Object.assign(settings, this._consumer.getMediaplayerSettings());
      }
      if (!Lightning.Utils.equalValues(this._stream, settings.stream)) {
        if (settings.stream && settings.stream.keySystem) {
          navigator.requestMediaKeySystemAccess(settings.stream.keySystem.id, settings.stream.keySystem.config).then(keySystemAccess => {
            return keySystemAccess.createMediaKeys();
          }).then(createdMediaKeys => {
            return this.videoEl.setMediaKeys(createdMediaKeys);
          }).then(() => {
            if (settings.stream && settings.stream.src) this.open(settings.stream.src);
          }).catch(() => {
            console.error('Failed to set up MediaKeys');
          });
        } else if (settings.stream && settings.stream.src) {
          // This is here to be backwards compatible, will be removed
          // in future sdk release
          if (Settings.get('app', 'hls')) {
            if (!window.Hls) {
              window.Hls = class Hls {
                static isSupported() {
                  console.warn('hls-light not included');
                  return false;
                }
              };
            }
            if (window.Hls.isSupported()) {
              if (!this._hls) this._hls = new window.Hls({
                liveDurationInfinity: true
              });
              this._hls.loadSource(settings.stream.src);
              this._hls.attachMedia(this.videoEl);
              this.videoEl.style.display = 'block';
            }
          } else {
            this.open(settings.stream.src);
          }
        } else {
          this.close();
        }
        this._stream = settings.stream;
      }
      this._setHide(settings.hide);
      this._setVideoArea(settings.videoPos);
    }
    _setHide(hide) {
      if (this.textureMode) {
        this.tag('Video').setSmooth('alpha', hide ? 0 : 1);
      } else {
        this.videoEl.style.visibility = hide ? 'hidden' : 'visible';
      }
    }
    open(url) {
      let settings = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {
        hide: false,
        videoPosition: null
      };
      // prep the media url to play depending on platform (mediaPlayerplugin)
      url = mediaUrl$1(url);
      this._metrics = Metrics$1.media(url);
      Log.info('Playing stream', url);
      if (this.application.noVideo) {
        Log.info('noVideo option set, so ignoring: ' + url);
        return;
      }
      // close the video when opening same url as current (effectively reloading)
      if (this.videoEl.getAttribute('src') === url) {
        this.close();
      }
      this.videoEl.setAttribute('src', url);

      // force hide, then force show (in next tick!)
      // (fixes comcast playback rollover issue)
      this.videoEl.style.visibility = 'hidden';
      this.videoEl.style.display = 'none';
      setTimeout(() => {
        this.videoEl.style.display = 'block';
        this.videoEl.style.visibility = 'visible';
      });
      this._setHide(settings.hide);
      this._setVideoArea(settings.videoPosition || [0, 0, 1920, 1080]);
    }
    close() {
      // We need to pause first in order to stop sound.
      this.videoEl.pause();
      this.videoEl.removeAttribute('src');

      // force load to reset everything without errors
      this.videoEl.load();
      this._clearSrc();
      this.videoEl.style.display = 'none';
    }
    playPause() {
      if (this.isPlaying()) {
        this.doPause();
      } else {
        this.doPlay();
      }
    }
    get muted() {
      return this.videoEl.muted;
    }
    set muted(v) {
      this.videoEl.muted = v;
    }
    get loop() {
      return this.videoEl.loop;
    }
    set loop(v) {
      this.videoEl.loop = v;
    }
    isPlaying() {
      return this._getState() === 'Playing';
    }
    doPlay() {
      this.videoEl.play();
    }
    doPause() {
      this.videoEl.pause();
    }
    reload() {
      var url = this.videoEl.getAttribute('src');
      this.close();
      this.videoEl.src = url;
    }
    getPosition() {
      return Promise.resolve(this.videoEl.currentTime);
    }
    setPosition(pos) {
      this.videoEl.currentTime = pos;
    }
    getDuration() {
      return Promise.resolve(this.videoEl.duration);
    }
    seek(time) {
      let absolute = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      if (absolute) {
        this.videoEl.currentTime = time;
      } else {
        this.videoEl.currentTime += time;
      }
    }
    get videoTextureView() {
      return this.tag('Video').tag('VideoTexture');
    }
    get videoTexture() {
      return this.videoTextureView.texture;
    }
    _setVideoArea(videoPos) {
      if (Lightning.Utils.equalValues(this._videoPos, videoPos)) {
        return;
      }
      this._videoPos = videoPos;
      if (this.textureMode) {
        this.videoTextureView.patch({
          smooth: {
            x: videoPos[0],
            y: videoPos[1],
            w: videoPos[2] - videoPos[0],
            h: videoPos[3] - videoPos[1]
          }
        });
      } else {
        const precision = this.stage.getRenderPrecision();
        this.videoEl.style.left = Math.round(videoPos[0] * precision) + 'px';
        this.videoEl.style.top = Math.round(videoPos[1] * precision) + 'px';
        this.videoEl.style.width = Math.round((videoPos[2] - videoPos[0]) * precision) + 'px';
        this.videoEl.style.height = Math.round((videoPos[3] - videoPos[1]) * precision) + 'px';
      }
    }
    _fireConsumer(event, args) {
      if (this._consumer) {
        this._consumer.fire(event, args);
      }
    }
    _equalInitData(buf1, buf2) {
      if (!buf1 || !buf2) return false;
      if (buf1.byteLength != buf2.byteLength) return false;
      const dv1 = new Int8Array(buf1);
      const dv2 = new Int8Array(buf2);
      for (let i = 0; i != buf1.byteLength; i++) if (dv1[i] != dv2[i]) return false;
      return true;
    }
    error(args) {
      this._fireConsumer('$mediaplayerError', args);
      this._setState('');
      return '';
    }
    loadeddata(args) {
      this._fireConsumer('$mediaplayerLoadedData', args);
    }
    play(args) {
      this._fireConsumer('$mediaplayerPlay', args);
    }
    playing(args) {
      this._fireConsumer('$mediaplayerPlaying', args);
      this._setState('Playing');
    }
    canplay(args) {
      this.videoEl.play();
      this._fireConsumer('$mediaplayerStart', args);
    }
    loadstart(args) {
      this._fireConsumer('$mediaplayerLoad', args);
    }
    seeked() {
      this._fireConsumer('$mediaplayerSeeked', {
        currentTime: this.videoEl.currentTime,
        duration: this.videoEl.duration || 1
      });
    }
    seeking() {
      this._fireConsumer('$mediaplayerSeeking', {
        currentTime: this.videoEl.currentTime,
        duration: this.videoEl.duration || 1
      });
    }
    durationchange(args) {
      this._fireConsumer('$mediaplayerDurationChange', args);
    }
    encrypted(args) {
      const video = args.videoElement;
      const event = args.event;
      // FIXME: Double encrypted events need to be properly filtered by Gstreamer
      if (video.mediaKeys && !this._equalInitData(this._previousInitData, event.initData)) {
        this._previousInitData = event.initData;
        this._fireConsumer('$mediaplayerEncrypted', args);
      }
    }
    static _states() {
      return [class Playing extends this {
        $enter() {
          this._startUpdatingVideoTexture();
        }
        $exit() {
          this._stopUpdatingVideoTexture();
        }
        timeupdate() {
          this._fireConsumer('$mediaplayerProgress', {
            currentTime: this.videoEl.currentTime,
            duration: this.videoEl.duration || 1
          });
        }
        ended(args) {
          this._fireConsumer('$mediaplayerEnded', args);
          this._setState('');
        }
        pause(args) {
          this._fireConsumer('$mediaplayerPause', args);
          this._setState('Playing.Paused');
        }
        _clearSrc() {
          this._fireConsumer('$mediaplayerStop', {});
          this._setState('');
        }
        static _states() {
          return [class Paused extends this {}];
        }
      }];
    }
  }

  class localCookie {
    constructor(e) {
      return e = e || {}, this.forceCookies = e.forceCookies || !1, !0 === this._checkIfLocalStorageWorks() && !0 !== e.forceCookies ? {
        getItem: this._getItemLocalStorage,
        setItem: this._setItemLocalStorage,
        removeItem: this._removeItemLocalStorage,
        clear: this._clearLocalStorage
      } : {
        getItem: this._getItemCookie,
        setItem: this._setItemCookie,
        removeItem: this._removeItemCookie,
        clear: this._clearCookies
      };
    }
    _checkIfLocalStorageWorks() {
      if ("undefined" == typeof localStorage) return !1;
      try {
        return localStorage.setItem("feature_test", "yes"), "yes" === localStorage.getItem("feature_test") && (localStorage.removeItem("feature_test"), !0);
      } catch (e) {
        return !1;
      }
    }
    _getItemLocalStorage(e) {
      return window.localStorage.getItem(e);
    }
    _setItemLocalStorage(e, t) {
      return window.localStorage.setItem(e, t);
    }
    _removeItemLocalStorage(e) {
      return window.localStorage.removeItem(e);
    }
    _clearLocalStorage() {
      return window.localStorage.clear();
    }
    _getItemCookie(e) {
      var t = document.cookie.match(RegExp("(?:^|;\\s*)" + function (e) {
        return e.replace(/([.*+?\^${}()|\[\]\/\\])/g, "\\$1");
      }(e) + "=([^;]*)"));
      return t && "" === t[1] && (t[1] = null), t ? t[1] : null;
    }
    _setItemCookie(e, t) {
      var o = new Date(),
        r = new Date(o.getTime() + 15768e7);
      document.cookie = "".concat(e, "=").concat(t, "; expires=").concat(r.toUTCString(), ";");
    }
    _removeItemCookie(e) {
      document.cookie = "".concat(e, "=;Max-Age=-99999999;");
    }
    _clearCookies() {
      document.cookie.split(";").forEach(e => {
        document.cookie = e.replace(/^ +/, "").replace(/=.*/, "=;expires=Max-Age=-99999999");
      });
    }
  }

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
  const initStorage = () => {
    Settings.get('platform', 'id');
    // todo: pass options (for example to force the use of cookies)
    new localCookie();
  };

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */

  const hasRegex = /\{\/(.*?)\/([igm]{0,3})\}/g;
  const isWildcard = /^[!*$]$/;
  const hasLookupId = /\/:\w+?@@([0-9]+?)@@/;
  const isNamedGroup = /^\/:/;

  /**
   * Test if a route is part regular expressed
   * and replace it for a simple character
   * @param route
   * @returns {*}
   */
  const stripRegex = function (route) {
    let char = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'R';
    // if route is part regular expressed we replace
    // the regular expression for a character to
    // simplify floor calculation and backtracking
    if (hasRegex.test(route)) {
      route = route.replace(hasRegex, char);
    }
    return route;
  };

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */

  /**
   * Create a local request register
   * @param flags
   * @returns {Map<any, any>}
   */
  const createRegister = flags => {
    const reg = new Map()
    // store user defined and router
    // defined flags in register
    ;
    [...Object.keys(flags), ...Object.getOwnPropertySymbols(flags)].forEach(key => {
      reg.set(key, flags[key]);
    });
    return reg;
  };

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
  class Request {
    constructor() {
      let hash = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
      let navArgs = arguments.length > 1 ? arguments[1] : undefined;
      let storeCaller = arguments.length > 2 ? arguments[2] : undefined;
      /**
       * Hash we navigate to
       * @type {string}
       * @private
       */
      this._hash = hash;

      /**
       * Do we store previous hash in history
       * @type {boolean}
       * @private
       */
      this._storeCaller = storeCaller;

      /**
       * Request and navigate data
       * @type {Map}
       * @private
       */
      this._register = new Map();

      /**
       * Flag if the instance is created due to
       * this request
       * @type {boolean}
       * @private
       */
      this._isCreated = false;

      /**
       * Flag if the instance is shared between
       * previous and current request
       * @type {boolean}
       * @private
       */
      this._isSharedInstance = false;

      /**
       * Flag if the request has been cancelled
       * @type {boolean}
       * @private
       */
      this._cancelled = false;

      /**
       * if instance is shared between requests we copy state object
       * from instance before the new request overrides state
       * @type {null}
       * @private
       */
      this._copiedHistoryState = null;

      // if there are arguments attached to navigate()
      // we store them in new request
      if (isObject(navArgs)) {
        this._register = createRegister(navArgs);
      } else if (isBoolean(navArgs)) {
        // if second navigate() argument is explicitly
        // set to false we prevent the calling page
        // from ending up in history
        this._storeCaller = navArgs;
      }
      // @todo: remove because we can simply check
      // ._storeCaller property
      this._register.set(symbols.store, this._storeCaller);
    }
    cancel() {
      Log.debug('[router]:', "cancelled ".concat(this._hash));
      this._cancelled = true;
    }
    get url() {
      return this._hash;
    }
    get register() {
      return this._register;
    }
    get hash() {
      return this._hash;
    }
    set hash(args) {
      this._hash = args;
    }
    get route() {
      return this._route;
    }
    set route(args) {
      this._route = args;
    }
    get provider() {
      return this._provider;
    }
    set provider(args) {
      this._provider = args;
    }
    get providerType() {
      return this._providerType;
    }
    set providerType(args) {
      this._providerType = args;
    }
    set page(args) {
      this._page = args;
    }
    get page() {
      return this._page;
    }
    set isCreated(args) {
      this._isCreated = args;
    }
    get isCreated() {
      return this._isCreated;
    }
    get isSharedInstance() {
      return this._isSharedInstance;
    }
    set isSharedInstance(args) {
      this._isSharedInstance = args;
    }
    get isCancelled() {
      return this._cancelled;
    }
    set copiedHistoryState(v) {
      this._copiedHistoryState = v;
    }
    get copiedHistoryState() {
      return this._copiedHistoryState;
    }
  }

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
  class Route {
    constructor() {
      let config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      // keep backwards compatible
      let type = ['on', 'before', 'after'].reduce((acc, type) => {
        return isFunction(config[type]) ? type : acc;
      }, undefined);
      this._cfg = config;
      if (type) {
        this._provider = {
          type,
          request: config[type]
        };
      }
    }
    get path() {
      return this._cfg.path;
    }
    get component() {
      return this._cfg.component;
    }
    get options() {
      return this._cfg.options;
    }
    get widgets() {
      return this._cfg.widgets;
    }
    get cache() {
      return this._cfg.cache;
    }
    get hook() {
      return this._cfg.hook;
    }
    get beforeNavigate() {
      return this._cfg.beforeNavigate;
    }
    get provider() {
      return this._provider;
    }
  }

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */

  /**
   * Simple route length calculation
   * @param route {string}
   * @returns {number} - floor
   */
  const getFloor = route => {
    return stripRegex(route).split('/').length;
  };

  /**
   * return all stored routes that live on the same floor
   * @param floor
   * @returns {Array}
   */
  const getRoutesByFloor = floor => {
    const matches = [];
    // simple filter of level candidates
    for (let [route] of routes.entries()) {
      if (getFloor(route) === floor) {
        matches.push(route);
      }
    }
    return matches;
  };

  /**
   * return a matching route by provided hash
   * hash: home/browse/12 will match:
   * route: home/browse/:categoryId
   * @param hash {string}
   * @returns {boolean|{}} - route
   */
  const getRouteByHash = hash => {
    // @todo: clean up on handleHash
    hash = hash.replace(/^#/, '');
    const getUrlParts = /(\/?:?[^/]+)/g;
    // grab possible candidates from stored routes
    const candidates = getRoutesByFloor(getFloor(hash));
    // break hash down in chunks
    const hashParts = hash.match(getUrlParts) || [];

    // to simplify the route matching and prevent look around
    // in our getUrlParts regex we get the regex part from
    // route candidate and store them so that we can reference
    // them when we perform the actual regex against hash
    let regexStore = [];
    let matches = candidates.filter(route => {
      let isMatching = true;
      // replace regex in route with lookup id => @@{storeId}@@
      if (hasRegex.test(route)) {
        const regMatches = route.match(hasRegex);
        if (regMatches && regMatches.length) {
          route = regMatches.reduce((fullRoute, regex) => {
            const lookupId = regexStore.length;
            fullRoute = fullRoute.replace(regex, "@@".concat(lookupId, "@@"));
            regexStore.push(regex.substring(1, regex.length - 1));
            return fullRoute;
          }, route);
        }
      }
      const routeParts = route.match(getUrlParts) || [];
      for (let i = 0, j = routeParts.length; i < j; i++) {
        const routePart = routeParts[i];
        const hashPart = hashParts[i];

        // Since we support catch-all and regex driven name groups
        // we first test for regex lookup id and see if the regex
        // matches the value from the hash
        if (hasLookupId.test(routePart)) {
          const routeMatches = hasLookupId.exec(routePart);
          const storeId = routeMatches[1];
          const routeRegex = regexStore[storeId];

          // split regex and modifiers so we can use both
          // to create a new RegExp
          // eslint-disable-next-line
          const regMatches = /\/([^\/]+)\/([igm]{0,3})/.exec(routeRegex);
          if (regMatches && regMatches.length) {
            const expression = regMatches[1];
            const modifiers = regMatches[2];
            const regex = new RegExp("^/".concat(expression, "$"), modifiers);
            if (!regex.test(hashPart)) {
              isMatching = false;
            }
          }
        } else if (isNamedGroup.test(routePart)) {
          // we kindly skip namedGroups because this is dynamic
          // we only need to the static and regex drive parts
          continue;
        } else if (hashPart && routePart.toLowerCase() !== hashPart.toLowerCase()) {
          isMatching = false;
        }
      }
      return isMatching;
    });
    if (matches.length) {
      if (matches.indexOf(hash) !== -1) {
        const match = matches[matches.indexOf(hash)];
        return routes.get(match);
      } else {
        // we give prio to static routes over dynamic
        matches = matches.sort(a => {
          return isNamedGroup.test(a) ? -1 : 1;
        });
        // would be strange if this fails
        // but still we test
        if (routeExists(matches[0])) {
          return routes.get(matches[0]);
        }
      }
    }
    return false;
  };
  const getValuesFromHash = function () {
    let hash = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
    let path = arguments.length > 1 ? arguments[1] : undefined;
    // replace the regex definition from the route because
    // we already did the matching part
    path = stripRegex(path, '');
    const getUrlParts = /(\/?:?[\w%\s:.-]+)/g;
    const hashParts = hash.match(getUrlParts) || [];
    const routeParts = path.match(getUrlParts) || [];
    const getNamedGroup = /^\/:([\w-]+)\/?/;
    return routeParts.reduce((storage, value, index) => {
      const match = getNamedGroup.exec(value);
      if (match && match.length) {
        storage.set(match[1], decodeURIComponent(hashParts[index].replace(/^\//, '')));
      }
      return storage;
    }, new Map());
  };
  const getOption = (stack, prop) => {
    // eslint-disable-next-line
    if (stack && stack.hasOwnProperty(prop)) {
      return stack[prop];
    }
    // we explicitly return undefined since we're testing
    // for explicit test values
  };

  /**
   * create and return new Route instance
   * @param config
   */
  const createRoute = config => {
    // we need to provide a bit of additional logic
    // for the bootComponent
    if (config.path === '$') {
      let options = {
        preventStorage: true
      };
      if (isObject(config.options)) {
        options = {
          ...config.options,
          ...options
        };
      }
      config.options = options;
      // if configured add reference to bootRequest
      // as router after provider
      if (bootRequest) {
        config.after = bootRequest;
      }
    }
    return new Route(config);
  };

  /**
   * Create a new Router request object
   * @param url
   * @param args
   * @param store
   * @returns {*}
   */
  const createRequest = (url, args, store) => {
    return new Request(url, args, store);
  };
  const getHashByName = obj => {
    if (!obj.to && !obj.name) {
      return false;
    }
    const route = getRouteByName(obj.to || obj.name);
    const hasDynamicGroup = /\/:([\w-]+)\/?/;
    let hash = route;

    // if route contains dynamic group
    // we replace them with the provided params
    if (hasDynamicGroup.test(route)) {
      if (obj.params) {
        const keys = Object.keys(obj.params);
        hash = keys.reduce((acc, key) => {
          return acc.replace(":".concat(key), obj.params[key]);
        }, route);
      }
      if (obj.query) {
        return "".concat(hash).concat(objectToQueryString(obj.query));
      }
    }
    return hash;
  };
  const getRouteByName = name => {
    for (let [path, route] of routes.entries()) {
      if (route.name === name) {
        return path;
      }
    }
    return false;
  };
  const keepActivePageAlive = (route, request) => {
    if (isString(route)) {
      const routes = getRoutes();
      if (routes.has(route)) {
        route = routes.get(route);
      } else {
        return false;
      }
    }
    const register = request.register;
    const routeOptions = route.options;
    if (register.has('keepAlive')) {
      return register.get('keepAlive');
    } else if (routeOptions && routeOptions.keepAlive) {
      return routeOptions.keepAlive;
    }
    return false;
  };

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
  var emit$1 = (function (page) {
    let events = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
    let params = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    if (!isArray(events)) {
      events = [events];
    }
    events.forEach(e => {
      const event = "_on".concat(ucfirst(e));
      if (isFunction(page[event])) {
        page[event](params);
      }
    });
  });

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
  let activeWidget = null;
  const getReferences = () => {
    if (!widgetsHost) {
      return;
    }
    return widgetsHost.get().reduce((storage, widget) => {
      const key = widget.ref.toLowerCase();
      storage[key] = widget;
      return storage;
    }, {});
  };

  /**
   * update the visibility of the available widgets
   * for the current page / route
   * @param page
   */
  const updateWidgets = (widgets, page) => {
    // force lowercase lookup
    const configured = (widgets || []).map(ref => ref.toLowerCase());
    widgetsHost.forEach(widget => {
      widget.visible = configured.indexOf(widget.ref.toLowerCase()) !== -1;
      if (widget.visible) {
        emit$1(widget, ['activated'], page);
      }
    });
    if (app.state === 'Widgets' && activeWidget && !activeWidget.visible) {
      app._setState('');
    }
  };
  const getWidgetByName = name => {
    name = ucfirst(name);
    return widgetsHost.getByRef(name) || false;
  };

  /**
   * delegate app focus to a on-screen widget
   * @param name - {string}
   */
  const focusWidget = name => {
    const widget = getWidgetByName(name);
    if (widget) {
      setActiveWidget(widget);

      // if app is already in 'Widgets' state we can assume that
      // focus has been delegated from one widget to another so
      // we need to set the new widget reference and trigger a
      // new focus calculation of Lightning's focuspath
      if (app.state === 'Widgets') {
        app.reload(activeWidget);
      } else {
        app._setState('Widgets', [activeWidget]);
      }
    }
  };
  const restoreFocus = () => {
    activeWidget = null;
    app._setState('');
  };
  const getActiveWidget = () => {
    return activeWidget;
  };
  const setActiveWidget = instance => {
    activeWidget = instance;
  };

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
  const createComponent = (stage, type) => {
    return stage.c({
      type,
      visible: false,
      widgets: getReferences()
    });
  };

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */

  /**
   * Simple flat array that holds the visited hashes + state Object
   * so the router can navigate back to them
   * @type {Array}
   */
  let history = [];
  const updateHistory = request => {
    const hash = getActiveHash();
    if (!hash) {
      return;
    }

    // navigate storage flag
    const register = request.register;
    const forceNavigateStore = register.get(symbols.store);

    // test preventStorage on route configuration
    const activeRoute = getRouteByHash(hash);
    const preventStorage = getOption(activeRoute.options, 'preventStorage');

    // we give prio to navigate storage flag
    let store = isBoolean(forceNavigateStore) ? forceNavigateStore : !preventStorage;
    if (store) {
      const toStore = hash.replace(/^\//, '');
      const location = locationInHistory(toStore);
      const stateObject = getStateObject(getActivePage(), request);
      const routerConfig = getRouterConfig();

      // store hash if it's not a part of history or flag for
      // storage of same hash is true
      if (location === -1 || routerConfig.get('storeSameHash')) {
        history.push({
          hash: toStore,
          state: stateObject
        });
      } else {
        // if we visit the same route we want to sync history
        const prev = history.splice(location, 1)[0];
        history.push({
          hash: prev.hash,
          state: stateObject
        });
      }
    }
  };
  const locationInHistory = hash => {
    for (let i = 0; i < history.length; i++) {
      if (history[i].hash === hash) {
        return i;
      }
    }
    return -1;
  };
  const getHistoryState = hash => {
    let state = null;
    if (history.length) {
      // if no hash is provided we get the last
      // pushed history record
      if (!hash) {
        const record = history[history.length - 1];
        // could be null
        state = record.state;
      } else {
        if (locationInHistory(hash) !== -1) {
          const record = history[locationInHistory(hash)];
          state = record.state;
        }
      }
    }
    return state;
  };
  const replaceHistoryState = function () {
    let state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
    let hash = arguments.length > 1 ? arguments[1] : undefined;
    if (!history.length) {
      return;
    }
    const location = hash ? locationInHistory(hash) : history.length - 1;
    if (location !== -1 && isObject(state)) {
      history[location].state = state;
    }
  };
  const getStateObject = (page, request) => {
    // if the new request shared instance with the
    // previous request we used the copied state object
    if (request.isSharedInstance) {
      if (request.copiedHistoryState) {
        return request.copiedHistoryState;
      }
    } else if (page && isFunction(page.historyState)) {
      return page.historyState();
    }
    return null;
  };
  const getHistory = () => {
    return history.slice(0);
  };
  const setHistory = function () {
    let arr = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
    if (isArray(arr)) {
      history = arr;
    }
  };

  var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

  var isMergeableObject = function isMergeableObject(value) {
    return isNonNullObject(value) && !isSpecial(value);
  };
  function isNonNullObject(value) {
    return !!value && typeof value === 'object';
  }
  function isSpecial(value) {
    var stringValue = Object.prototype.toString.call(value);
    return stringValue === '[object RegExp]' || stringValue === '[object Date]' || isReactElement(value);
  }

  // see https://github.com/facebook/react/blob/b5ac963fb791d1298e7f396236383bc955f916c1/src/isomorphic/classic/element/ReactElement.js#L21-L25
  var canUseSymbol = typeof Symbol === 'function' && Symbol.for;
  var REACT_ELEMENT_TYPE = canUseSymbol ? Symbol.for('react.element') : 0xeac7;
  function isReactElement(value) {
    return value.$$typeof === REACT_ELEMENT_TYPE;
  }
  function emptyTarget(val) {
    return Array.isArray(val) ? [] : {};
  }
  function cloneUnlessOtherwiseSpecified(value, options) {
    return options.clone !== false && options.isMergeableObject(value) ? deepmerge(emptyTarget(value), value, options) : value;
  }
  function defaultArrayMerge(target, source, options) {
    return target.concat(source).map(function (element) {
      return cloneUnlessOtherwiseSpecified(element, options);
    });
  }
  function getMergeFunction(key, options) {
    if (!options.customMerge) {
      return deepmerge;
    }
    var customMerge = options.customMerge(key);
    return typeof customMerge === 'function' ? customMerge : deepmerge;
  }
  function getEnumerableOwnPropertySymbols(target) {
    return Object.getOwnPropertySymbols ? Object.getOwnPropertySymbols(target).filter(function (symbol) {
      return target.propertyIsEnumerable(symbol);
    }) : [];
  }
  function getKeys(target) {
    return Object.keys(target).concat(getEnumerableOwnPropertySymbols(target));
  }
  function propertyIsOnObject(object, property) {
    try {
      return property in object;
    } catch (_) {
      return false;
    }
  }

  // Protects from prototype poisoning and unexpected merging up the prototype chain.
  function propertyIsUnsafe(target, key) {
    return propertyIsOnObject(target, key) // Properties are safe to merge if they don't exist in the target yet,
    && !(Object.hasOwnProperty.call(target, key) // unsafe if they exist up the prototype chain,
    && Object.propertyIsEnumerable.call(target, key)); // and also unsafe if they're nonenumerable.
  }

  function mergeObject(target, source, options) {
    var destination = {};
    if (options.isMergeableObject(target)) {
      getKeys(target).forEach(function (key) {
        destination[key] = cloneUnlessOtherwiseSpecified(target[key], options);
      });
    }
    getKeys(source).forEach(function (key) {
      if (propertyIsUnsafe(target, key)) {
        return;
      }
      if (propertyIsOnObject(target, key) && options.isMergeableObject(source[key])) {
        destination[key] = getMergeFunction(key, options)(target[key], source[key], options);
      } else {
        destination[key] = cloneUnlessOtherwiseSpecified(source[key], options);
      }
    });
    return destination;
  }
  function deepmerge(target, source, options) {
    options = options || {};
    options.arrayMerge = options.arrayMerge || defaultArrayMerge;
    options.isMergeableObject = options.isMergeableObject || isMergeableObject;
    // cloneUnlessOtherwiseSpecified is added to `options` so that custom arrayMerge()
    // implementations can use it. The caller may not replace it.
    options.cloneUnlessOtherwiseSpecified = cloneUnlessOtherwiseSpecified;
    var sourceIsArray = Array.isArray(source);
    var targetIsArray = Array.isArray(target);
    var sourceAndTargetTypesMatch = sourceIsArray === targetIsArray;
    if (!sourceAndTargetTypesMatch) {
      return cloneUnlessOtherwiseSpecified(source, options);
    } else if (sourceIsArray) {
      return options.arrayMerge(target, source, options);
    } else {
      return mergeObject(target, source, options);
    }
  }
  deepmerge.all = function deepmergeAll(array, options) {
    if (!Array.isArray(array)) {
      throw new Error('first argument should be an array');
    }
    return array.reduce(function (prev, next) {
      return deepmerge(prev, next, options);
    }, {});
  };
  var deepmerge_1 = deepmerge;
  var cjs = deepmerge_1;

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
  let warned = false;
  const deprecated = function () {
    let force = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
    if (force === true || warned === false) {
      console.warn(["The 'Locale'-plugin in the Lightning-SDK is deprecated and will be removed in future releases.", "Please consider using the new 'Language'-plugin instead.", 'https://rdkcentral.github.io/Lightning-SDK/#/plugins/language'].join('\n\n'));
    }
    warned = true;
  };
  class Locale {
    constructor() {
      this.__enabled = false;
    }

    /**
     * Loads translation object from external json file.
     *
     * @param {String} path Path to resource.
     * @return {Promise}
     */
    async load(path) {
      if (!this.__enabled) {
        return;
      }
      await fetch(path).then(resp => resp.json()).then(resp => {
        this.loadFromObject(resp);
      });
    }

    /**
     * Sets language used by module.
     *
     * @param {String} lang
     */
    setLanguage(lang) {
      deprecated();
      this.__enabled = true;
      this.language = lang;
    }

    /**
     * Returns reference to translation object for current language.
     *
     * @return {Object}
     */
    get tr() {
      deprecated(true);
      return this.__trObj[this.language];
    }

    /**
     * Loads translation object from existing object (binds existing object).
     *
     * @param {Object} trObj
     */
    loadFromObject(trObj) {
      deprecated();
      const fallbackLanguage = 'en';
      if (Object.keys(trObj).indexOf(this.language) === -1) {
        Log.warn('No translations found for: ' + this.language);
        if (Object.keys(trObj).indexOf(fallbackLanguage) > -1) {
          Log.warn('Using fallback language: ' + fallbackLanguage);
          this.language = fallbackLanguage;
        } else {
          const error = 'No translations found for fallback language: ' + fallbackLanguage;
          Log.error(error);
          throw Error(error);
        }
      }
      this.__trObj = trObj;
      for (const lang of Object.values(this.__trObj)) {
        for (const str of Object.keys(lang)) {
          lang[str] = new LocalizedString(lang[str]);
        }
      }
    }
  }

  /**
   * Extended string class used for localization.
   */
  class LocalizedString extends String {
    /**
     * Returns formatted LocalizedString.
     * Replaces each placeholder value (e.g. {0}, {1}) with corresponding argument.
     *
     * E.g.:
     * > new LocalizedString('{0} and {1} and {0}').format('A', 'B');
     * A and B and A
     *
     * @param  {...any} args List of arguments for placeholders.
     */
    format() {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      const sub = args.reduce((string, arg, index) => string.split("{".concat(index, "}")).join(arg), this);
      return new LocalizedString(sub);
    }
  }
  var Locale$1 = new Locale();

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
  class VersionLabel extends Lightning.Component {
    static _template() {
      return {
        rect: true,
        color: 0xbb0078ac,
        h: 40,
        w: 100,
        x: w => w - 50,
        y: h => h - 50,
        mount: 1,
        Text: {
          w: w => w,
          h: h => h,
          y: 5,
          x: 20,
          text: {
            fontSize: 22,
            lineHeight: 26
          }
        }
      };
    }
    _firstActive() {
      this.tag('Text').text = "APP - v".concat(this.version, "\nSDK - v").concat(this.sdkVersion);
      this.tag('Text').loadTexture();
      this.w = this.tag('Text').renderWidth + 40;
      this.h = this.tag('Text').renderHeight + 5;
    }
  }

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
  class FpsIndicator extends Lightning.Component {
    static _template() {
      return {
        rect: true,
        color: 0xffffffff,
        texture: Lightning.Tools.getRoundRect(80, 80, 40),
        h: 80,
        w: 80,
        x: 100,
        y: 100,
        mount: 1,
        Background: {
          x: 3,
          y: 3,
          texture: Lightning.Tools.getRoundRect(72, 72, 36),
          color: 0xff008000
        },
        Counter: {
          w: w => w,
          h: h => h,
          y: 10,
          text: {
            fontSize: 32,
            textAlign: 'center'
          }
        },
        Text: {
          w: w => w,
          h: h => h,
          y: 48,
          text: {
            fontSize: 15,
            textAlign: 'center',
            text: 'FPS'
          }
        }
      };
    }
    _setup() {
      this.config = {
        ...{
          log: false,
          interval: 500,
          threshold: 1
        },
        ...Settings.get('platform', 'showFps')
      };
      this.fps = 0;
      this.lastFps = this.fps - this.config.threshold;
      const fpsCalculator = () => {
        this.fps = ~~(1 / this.stage.dt);
      };
      this.stage.on('frameStart', fpsCalculator);
      this.stage.off('framestart', fpsCalculator);
      this.interval = setInterval(this.showFps.bind(this), this.config.interval);
    }
    _firstActive() {
      this.showFps();
    }
    _detach() {
      clearInterval(this.interval);
    }
    showFps() {
      if (Math.abs(this.lastFps - this.fps) <= this.config.threshold) return;
      this.lastFps = this.fps;
      // green
      let bgColor = 0xff008000;
      // orange
      if (this.fps <= 40 && this.fps > 20) bgColor = 0xffffa500;
      // red
      else if (this.fps <= 20) bgColor = 0xffff0000;
      this.tag('Background').setSmooth('color', bgColor);
      this.tag('Counter').text = "".concat(this.fps);
      this.config.log && Log.info('FPS', this.fps);
    }
  }

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
  let meta = {};
  let translations = {};
  let language = null;
  const initLanguage = function (file) {
    let language = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
    return new Promise((resolve, reject) => {
      fetch(file).then(response => response.json()).then(json => {
        setTranslations(json);
        // set language (directly or in a promise)
        typeof language === 'object' && 'then' in language && typeof language.then === 'function' ? language.then(lang => setLanguage(lang).then(resolve).catch(reject)).catch(e => {
          Log.error(e);
          reject(e);
        }) : setLanguage(language).then(resolve).catch(reject);
      }).catch(() => {
        const error = 'Language file ' + file + ' not found';
        Log.error(error);
        reject(error);
      });
    });
  };
  const setTranslations = obj => {
    if ('meta' in obj) {
      meta = {
        ...obj.meta
      };
      delete obj.meta;
    }
    translations = obj;
  };
  const setLanguage = lng => {
    language = null;
    return new Promise((resolve, reject) => {
      if (lng in translations) {
        language = lng;
      } else {
        if ('map' in meta && lng in meta.map && meta.map[lng] in translations) {
          language = meta.map[lng];
        } else if ('default' in meta && meta.default in translations) {
          const error = 'Translations for Language ' + language + ' not found. Using default language ' + meta.default;
          Log.warn(error);
          language = meta.default;
        } else {
          const error = 'Translations for Language ' + language + ' not found.';
          Log.error(error);
          reject(error);
        }
      }
      if (language) {
        Log.info('Setting language to', language);
        const translationsObj = translations[language];
        if (typeof translationsObj === 'object') {
          resolve();
        } else if (typeof translationsObj === 'string') {
          const url = Utils.asset(translationsObj);
          fetch(url).then(response => response.json()).then(json => {
            // save the translations for this language (to prevent loading twice)
            translations[language] = json;
            resolve();
          }).catch(e => {
            const error = 'Error while fetching ' + url;
            Log.error(error, e);
            reject(error);
          });
        }
      }
    });
  };

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
  const registry = {
    eventListeners: [],
    timeouts: [],
    intervals: [],
    targets: []
  };
  var Registry = {
    // Timeouts
    setTimeout(cb, timeout) {
      for (var _len = arguments.length, params = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
        params[_key - 2] = arguments[_key];
      }
      const timeoutId = setTimeout(() => {
        registry.timeouts = registry.timeouts.filter(id => id !== timeoutId);
        cb.apply(null, params);
      }, timeout, params);
      Log.info('Set Timeout', 'ID: ' + timeoutId);
      registry.timeouts.push(timeoutId);
      return timeoutId;
    },
    clearTimeout(timeoutId) {
      if (registry.timeouts.indexOf(timeoutId) > -1) {
        registry.timeouts = registry.timeouts.filter(id => id !== timeoutId);
        Log.info('Clear Timeout', 'ID: ' + timeoutId);
        clearTimeout(timeoutId);
      } else {
        Log.error('Clear Timeout', 'ID ' + timeoutId + ' not found');
      }
    },
    clearTimeouts() {
      registry.timeouts.forEach(timeoutId => {
        this.clearTimeout(timeoutId);
      });
    },
    // Intervals
    setInterval(cb, interval) {
      for (var _len2 = arguments.length, params = new Array(_len2 > 2 ? _len2 - 2 : 0), _key2 = 2; _key2 < _len2; _key2++) {
        params[_key2 - 2] = arguments[_key2];
      }
      const intervalId = setInterval(() => {
        registry.intervals.filter(id => id !== intervalId);
        cb.apply(null, params);
      }, interval, params);
      Log.info('Set Interval', 'ID: ' + intervalId);
      registry.intervals.push(intervalId);
      return intervalId;
    },
    clearInterval(intervalId) {
      if (registry.intervals.indexOf(intervalId) > -1) {
        registry.intervals = registry.intervals.filter(id => id !== intervalId);
        Log.info('Clear Interval', 'ID: ' + intervalId);
        clearInterval(intervalId);
      } else {
        Log.error('Clear Interval', 'ID ' + intervalId + ' not found');
      }
    },
    clearIntervals() {
      registry.intervals.forEach(intervalId => {
        this.clearInterval(intervalId);
      });
    },
    // Event listeners
    addEventListener(target, event, handler) {
      target.addEventListener(event, handler);
      const targetIndex = registry.targets.indexOf(target) > -1 ? registry.targets.indexOf(target) : registry.targets.push(target) - 1;
      registry.eventListeners[targetIndex] = registry.eventListeners[targetIndex] || {};
      registry.eventListeners[targetIndex][event] = registry.eventListeners[targetIndex][event] || [];
      registry.eventListeners[targetIndex][event].push(handler);
      Log.info('Add eventListener', 'Target:', target, 'Event: ' + event, 'Handler:', handler.toString());
    },
    removeEventListener(target, event, handler) {
      const targetIndex = registry.targets.indexOf(target);
      if (targetIndex > -1 && registry.eventListeners[targetIndex] && registry.eventListeners[targetIndex][event] && registry.eventListeners[targetIndex][event].indexOf(handler) > -1) {
        registry.eventListeners[targetIndex][event] = registry.eventListeners[targetIndex][event].filter(fn => fn !== handler);
        Log.info('Remove eventListener', 'Target:', target, 'Event: ' + event, 'Handler:', handler.toString());
        target.removeEventListener(event, handler);
      } else {
        Log.error('Remove eventListener', 'Not found', 'Target', target, 'Event: ' + event, 'Handler', handler.toString());
      }
    },
    // if `event` is omitted, removes all registered event listeners for target
    // if `target` is also omitted, removes all registered event listeners
    removeEventListeners(target, event) {
      if (target && event) {
        const targetIndex = registry.targets.indexOf(target);
        if (targetIndex > -1) {
          registry.eventListeners[targetIndex][event].forEach(handler => {
            this.removeEventListener(target, event, handler);
          });
        }
      } else if (target) {
        const targetIndex = registry.targets.indexOf(target);
        if (targetIndex > -1) {
          Object.keys(registry.eventListeners[targetIndex]).forEach(_event => {
            this.removeEventListeners(target, _event);
          });
        }
      } else {
        Object.keys(registry.eventListeners).forEach(targetIndex => {
          this.removeEventListeners(registry.targets[targetIndex]);
        });
      }
    },
    // Clear everything (to be called upon app close for proper cleanup)
    clear() {
      this.clearTimeouts();
      this.clearIntervals();
      this.removeEventListeners();
      registry.eventListeners = [];
      registry.timeouts = [];
      registry.intervals = [];
      registry.targets = [];
    }
  };

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */

  const isObject$1 = v => {
    return typeof v === 'object' && v !== null;
  };
  const isString$1 = v => {
    return typeof v === 'string';
  };

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
  let colors = {
    white: '#ffffff',
    black: '#000000',
    red: '#ff0000',
    green: '#00ff00',
    blue: '#0000ff',
    yellow: '#feff00',
    cyan: '#00feff',
    magenta: '#ff00ff'
  };
  const normalizedColors = {
    //store for normalized colors
  };
  const addColors = (colorsToAdd, value) => {
    if (isObject$1(colorsToAdd)) {
      // clean up normalizedColors if they exist in the to be added colors
      Object.keys(colorsToAdd).forEach(color => cleanUpNormalizedColors(color));
      colors = Object.assign({}, colors, colorsToAdd);
    } else if (isString$1(colorsToAdd) && value) {
      cleanUpNormalizedColors(colorsToAdd);
      colors[colorsToAdd] = value;
    }
  };
  const cleanUpNormalizedColors = color => {
    for (let c in normalizedColors) {
      if (c.indexOf(color) > -1) {
        delete normalizedColors[c];
      }
    }
  };
  const initColors = file => {
    return new Promise((resolve, reject) => {
      if (typeof file === 'object') {
        addColors(file);
        resolve();
      }
      fetch(file).then(response => response.json()).then(json => {
        addColors(json);
        resolve();
      }).catch(() => {
        const error = 'Colors file ' + file + ' not found';
        Log.error(error);
        reject(error);
      });
    });
  };

  var name = "@lightningjs/sdk";
  var version = "4.8.1";
  var license = "Apache-2.0";
  var scripts = {
  	postinstall: "node ./scripts/postinstall.js",
  	lint: "eslint '**/*.js'",
  	release: "npm publish --access public"
  };
  var husky = {
  	hooks: {
  		"pre-commit": "lint-staged"
  	}
  };
  var dependencies = {
  	"@babel/polyfill": "^7.11.5",
  	"@lightningjs/core": "*",
  	"@michieljs/execute-as-promise": "^1.0.0",
  	deepmerge: "^4.2.2",
  	localCookie: "github:WebPlatformForEmbedded/localCookie",
  	shelljs: "^0.8.4",
  	"url-polyfill": "^1.1.10",
  	"whatwg-fetch": "^3.0.0"
  };
  var devDependencies = {
  	"@babel/core": "^7.11.6",
  	"@babel/plugin-transform-parameters": "^7.10.5 ",
  	"@babel/plugin-transform-spread": "^7.11.0",
  	"@babel/preset-env": "^7.11.5",
  	"babel-eslint": "^10.1.0",
  	eslint: "^7.10.0",
  	"eslint-config-prettier": "^6.12.0",
  	"eslint-plugin-prettier": "^3.1.4",
  	husky: "^4.3.0",
  	"lint-staged": "^10.4.0",
  	prettier: "^1.19.1",
  	rollup: "^1.32.1",
  	"rollup-plugin-babel": "^4.4.0"
  };
  var repository = {
  	type: "git",
  	url: "git@github.com:rdkcentral/Lightning-SDK.git"
  };
  var bugs = {
  	url: "https://github.com/rdkcentral/Lightning-SDK/issues"
  };
  var packageInfo = {
  	name: name,
  	version: version,
  	license: license,
  	scripts: scripts,
  	"lint-staged": {
  	"*.js": [
  		"eslint --fix"
  	],
  	"src/startApp.js": [
  		"rollup -c ./rollup.config.js"
  	]
  },
  	husky: husky,
  	dependencies: dependencies,
  	devDependencies: devDependencies,
  	repository: repository,
  	bugs: bugs
  };

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
  let AppInstance;
  const defaultOptions = {
    stage: {
      w: 1920,
      h: 1080,
      clearColor: 0x00000000,
      canvas2d: false
    },
    debug: false,
    defaultFontFace: 'RobotoRegular',
    keys: {
      8: 'Back',
      13: 'Enter',
      27: 'Menu',
      37: 'Left',
      38: 'Up',
      39: 'Right',
      40: 'Down',
      174: 'ChannelDown',
      175: 'ChannelUp',
      178: 'Stop',
      250: 'PlayPause',
      191: 'Search',
      // Use "/" for keyboard
      409: 'Search'
    }
  };
  const customFontFaces = [];
  const fontLoader = (fonts, store) => new Promise((resolve, reject) => {
    fonts.map(_ref => {
      let {
        family,
        url,
        urls,
        descriptors
      } = _ref;
      return () => {
        const src = urls ? urls.map(url => {
          return 'url(' + url + ')';
        }) : 'url(' + url + ')';
        const fontFace = new FontFace(family, src, descriptors || {});
        store.push(fontFace);
        Log.info('Loading font', family);
        document.fonts.add(fontFace);
        return fontFace.load();
      };
    }).reduce((promise, method) => {
      return promise.then(() => method());
    }, Promise.resolve(null)).then(resolve).catch(reject);
  });
  function Application (App, appData, platformSettings) {
    const {
      width,
      height
    } = platformSettings;
    if (width && height) {
      defaultOptions.stage['w'] = width;
      defaultOptions.stage['h'] = height;
      defaultOptions.stage['precision'] = width / 1920;
    }

    // support for 720p browser
    if (!width && !height && window.innerHeight === 720) {
      defaultOptions.stage['w'] = 1280;
      defaultOptions.stage['h'] = 720;
      defaultOptions.stage['precision'] = 1280 / 1920;
    }
    return class Application extends Lightning.Application {
      constructor(options) {
        const config = cjs(defaultOptions, options);
        // Deepmerge breaks HTMLCanvasElement, so restore the passed in canvas.
        if (options.stage.canvas) {
          config.stage.canvas = options.stage.canvas;
        }
        super(config);
        this.config = config;
      }
      static _template() {
        return {
          w: 1920,
          h: 1080
        };
      }
      _setup() {
        Promise.all([this.loadFonts(App.config && App.config.fonts || App.getFonts && App.getFonts() || []),
        // to be deprecated
        Locale$1.load(App.config && App.config.locale || App.getLocale && App.getLocale()), App.language && this.loadLanguage(App.language()), App.colors && this.loadColors(App.colors())]).then(() => {
          Metrics$1.app.loaded();
          AppInstance = this.stage.c({
            ref: 'App',
            type: App,
            zIndex: 1,
            forceZIndexContext: !!platformSettings.showVersion || !!platformSettings.showFps
          });
          this.childList.a(AppInstance);
          this._refocus();
          Log.info('App version', this.config.version);
          Log.info('SDK version', packageInfo.version);
          if (platformSettings.showVersion) {
            this.childList.a({
              ref: 'VersionLabel',
              type: VersionLabel,
              version: this.config.version,
              sdkVersion: packageInfo.version,
              zIndex: 1
            });
          }
          if (platformSettings.showFps) {
            this.childList.a({
              ref: 'FpsCounter',
              type: FpsIndicator,
              zIndex: 1
            });
          }
          super._setup();
        }).catch(console.error);
      }
      _handleBack() {
        this.closeApp();
      }
      _handleExit() {
        this.closeApp();
      }
      closeApp() {
        Log.info('Signaling App Close');
        if (platformSettings.onClose && typeof platformSettings.onClose === 'function') {
          platformSettings.onClose(...arguments);
        } else {
          this.close();
        }
      }
      close() {
        Log.info('Closing App');
        Settings.clearSubscribers();
        Registry.clear();
        this.childList.remove(this.tag('App'));
        this.cleanupFonts();
        // force texture garbage collect
        this.stage.gc();
        this.destroy();
      }
      loadFonts(fonts) {
        return platformSettings.fontLoader && typeof platformSettings.fontLoader === 'function' ? platformSettings.fontLoader(fonts, customFontFaces) : fontLoader(fonts, customFontFaces);
      }
      cleanupFonts() {
        if ('delete' in document.fonts) {
          customFontFaces.forEach(fontFace => {
            Log.info('Removing font', fontFace.family);
            document.fonts.delete(fontFace);
          });
        } else {
          Log.info('No support for removing manually-added fonts');
        }
      }
      loadLanguage(config) {
        let file = Utils.asset('translations.json');
        let language = config;
        if (typeof language === 'object') {
          language = config.language || null;
          file = config.file || file;
        }
        return initLanguage(file, language);
      }
      loadColors(config) {
        let file = Utils.asset('colors.json');
        if (config && (typeof config === 'string' || typeof config === 'object')) {
          file = config;
        }
        return initColors(file);
      }
      set focus(v) {
        this._focussed = v;
        this._refocus();
      }
      _getFocused() {
        return this._focussed || this.tag('App');
      }
    };
  }

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */

  /**
   * @type {Lightning.Application}
   */
  let application;

  /**
   * Actual instance of the app
   * @type {Lightning.Component}
   */
  let app;

  /**
   * Component that hosts all routed pages
   * @type {Lightning.Component}
   */
  let pagesHost;

  /**
   * @type {Lightning.Stage}
   */
  let stage;

  /**
   * Platform driven Router configuration
   * @type {Map<string>}
   */
  let routerConfig;

  /**
   * Component that hosts all attached widgets
   * @type {Lightning.Component}
   */
  let widgetsHost;

  /**
   * Hash we point the browser to when we boot the app
   * and there is no deep-link provided
   * @type {string|Function}
   */
  let rootHash;

  /**
   * Boot request will fire before app start
   * can be used to execute some global logic
   * and can be configured
   */
  let bootRequest;

  /**
   * Flag if we need to update the browser location hash.
   * Router can work without.
   * @type {boolean}
   */
  let updateHash = true;

  /**
   * Will be called before a route starts, can be overridden
   * via routes config
   * @param from - route we came from
   * @param to - route we navigate to
   * @returns {Promise<*>}
   */
  // eslint-disable-next-line
  let beforeEachRoute = async (from, to) => {
    return true;
  };

  /**
   *  * Will be called after a navigate successfully resolved,
   * can be overridden via routes config
   */
  let afterEachRoute = () => {};

  /**
   * All configured routes
   * @type {Map<string, object>}
   */
  let routes = new Map();

  /**
   * Store all page components per route
   * @type {Map<string, object>}
   */
  let components = new Map();

  /**
   * Flag if router has been initialised
   * @type {boolean}
   */
  let initialised = false;

  /**
   * Current page being rendered on screen
   * @type {null}
   */
  let activePage = null;
  let activeHash;
  let activeRoute;

  /**
   *  During the process of a navigation request a new
   *  request can start, to prevent unwanted behaviour
   *  the navigate()-method stores the last accepted hash
   *  so we can invalidate any prior requests
   */
  let lastAcceptedHash;

  /**
   * With on()-data providing behaviour the Router forced the App
   * in a Loading state. When the data-provider resolves we want to
   * change the state back to where we came from
   */
  let previousState;
  const mixin = app => {
    // by default the Router Baseclass provides the component
    // reference in which we store our pages
    if (app.pages) {
      pagesHost = app.pages.childList;
    }
    // if the app is using widgets we grab refs
    // and hide all the widgets
    if (app.widgets && app.widgets.children) {
      widgetsHost = app.widgets.childList;
      // hide all widgets on boot
      widgetsHost.forEach(w => w.visible = false);
    }
    app._handleBack = e => {
      step(-1);
      e.preventDefault();
    };
  };
  const bootRouter = (config, instance) => {
    let {
      appInstance,
      routes
    } = config;

    // if instance is provided and it's and Lightning Component instance
    if (instance && isPage(instance)) {
      app = instance;
    }
    if (!app) {
      app = appInstance || AppInstance;
    }
    application = app.application;
    pagesHost = application.childList;
    stage = app.stage;
    routerConfig = getConfigMap();
    mixin(app);
    if (isArray(routes)) {
      setup(config);
    } else if (isFunction(routes)) {
      console.warn('[Router]: Calling Router.route() directly is deprecated.');
      console.warn('Use object config: https://rdkcentral.github.io/Lightning-SDK/#/plugins/router/configuration');
    }
  };
  const setup = config => {
    if (!initialised) {
      init(config);
    }
    config.routes.forEach(r => {
      const path = cleanHash(r.path);
      if (!routeExists(path)) {
        const route = createRoute(r);
        routes.set(path, route);
        // if route has a configured component property
        // we store it in a different map to simplify
        // the creating and destroying per route
        if (route.component) {
          let type = route.component;
          if (isComponentConstructor(type)) {
            if (!routerConfig.get('lazyCreate')) {
              type = createComponent(stage, type);
              pagesHost.a(type);
            }
          }
          components.set(path, type);
        }
      } else {
        console.error("".concat(path, " already exists in routes configuration"));
      }
    });
  };
  const init = config => {
    rootHash = config.root;
    if (isFunction(config.boot)) {
      bootRequest = config.boot;
    }
    if (isBoolean(config.updateHash)) {
      updateHash = config.updateHash;
    }
    if (isFunction(config.beforeEachRoute)) {
      beforeEachRoute = config.beforeEachRoute;
    }
    if (isFunction(config.afterEachRoute)) {
      afterEachRoute = config.afterEachRoute;
    }
    if (config.bootComponent) {
      console.warn('[Router]: Boot Component is now available as a special router: https://rdkcentral.github.io/Lightning-SDK/#/plugins/router/configuration?id=special-routes');
      console.warn('[Router]: setting { bootComponent } property will be deprecated in a future release');
      if (isPage(config.bootComponent)) {
        config.routes.push({
          path: '$',
          component: config.bootComponent,
          // we try to assign the bootRequest as after data-provider
          // so it will behave as any other component
          after: bootRequest || null,
          options: {
            preventStorage: true
          }
        });
      } else {
        console.error("[Router]: ".concat(config.bootComponent, " is not a valid boot component"));
      }
    }
    initialised = true;
  };
  const storeComponent = (route, type) => {
    if (components.has(route)) {
      components.set(route, type);
    }
  };
  const getComponent = route => {
    if (components.has(route)) {
      return components.get(route);
    }
    return null;
  };
  /**
   * Test if router needs to update browser location hash
   * @returns {boolean}
   */
  const mustUpdateLocationHash = () => {
    if (!routerConfig || !routerConfig.size) {
      return false;
    }
    // we need support to either turn change hash off
    // per platform or per app
    const updateConfig = routerConfig.get('updateHash');
    return !(isBoolean(updateConfig) && !updateConfig || isBoolean(updateHash) && !updateHash);
  };

  /**
   * Will be called when a new navigate() request has completed
   * and has not been expired due to it's async nature
   * @param request
   */
  const onRequestResolved = request => {
    const hash = request.hash;
    const route = request.route;
    const register = request.register;
    const page = request.page;

    // clean up history if modifier is set
    if (getOption(route.options, 'clearHistory')) {
      setHistory([]);
    } else if (hash && !isWildcard.test(route.path)) {
      updateHistory(request);
    }

    // we only update the stackLocation if a route
    // is not expired before it resolves
    storeComponent(route.path, page);
    if (request.isSharedInstance || !request.isCreated) {
      emit$1(page, 'changed');
    } else if (request.isCreated) {
      emit$1(page, 'mounted');
    }

    // only update widgets if we have a host
    if (widgetsHost) {
      updateWidgets(route.widgets, page);
    }

    // we want to clean up if there is an
    // active page that is not being shared
    // between current and previous route
    if (getActivePage() && !request.isSharedInstance) {
      cleanUp(activePage, request);
    }

    // provide history object to active page
    if (register.get(symbols.historyState) && isFunction(page.historyState)) {
      page.historyState(register.get(symbols.historyState));
    }
    setActivePage(page);
    activeHash = request.hash;
    activeRoute = route.path;

    // cleanup all cancelled requests
    for (let request of navigateQueue.values()) {
      if (request.isCancelled && request.hash) {
        navigateQueue.delete(request.hash);
      }
    }
    afterEachRoute(request);
    Log.info('[route]:', route.path);
    Log.info('[hash]:', hash);
  };
  const cleanUp = (page, request) => {
    const route = activeRoute;
    const register = request.register;
    const lazyDestroy = routerConfig.get('lazyDestroy');
    const destroyOnBack = routerConfig.get('destroyOnHistoryBack');
    const keepAlive = register.get('keepAlive');
    const isFromHistory = register.get(symbols.backtrack);
    let doCleanup = false;

    // if this request is executed due to a step back in history
    // and we have configured to destroy active page when we go back
    // in history or lazyDestory is enabled
    if (isFromHistory && (destroyOnBack || lazyDestroy)) {
      doCleanup = true;
    }

    // clean up if lazyDestroy is enabled and the keepAlive flag
    // in navigation register is false
    if (lazyDestroy && !keepAlive) {
      doCleanup = true;
    }

    // if the current and new request share the same route blueprint
    if (activeRoute === request.route.path) {
      doCleanup = true;
    }
    if (doCleanup) {
      // grab original class constructor if
      // statemachine routed else store constructor
      storeComponent(route, page._routedType || page.constructor);

      // actual remove of page from memory
      pagesHost.remove(page);

      // force texture gc() if configured
      // so we can cleanup textures in the same tick
      if (routerConfig.get('gcOnUnload')) {
        stage.gc();
      }
    } else {
      // If we're not removing the page we need to
      // reset it's properties
      page.patch({
        x: 0,
        y: 0,
        scale: 1,
        alpha: 1,
        visible: false
      });
    }
  };
  const getActiveHash = () => {
    return activeHash;
  };
  const setActivePage = page => {
    activePage = page;
  };
  const getActivePage = () => {
    return activePage;
  };
  const getActiveRoute = () => {
    return activeRoute;
  };
  const getLastHash = () => {
    return lastAcceptedHash;
  };
  const setLastHash = hash => {
    lastAcceptedHash = hash;
  };
  const getPreviousState = () => {
    return previousState;
  };
  const routeExists = key => {
    return routes.has(key);
  };
  const getRootHash = () => {
    return rootHash;
  };
  const getBootRequest = () => {
    return bootRequest;
  };
  const getRouterConfig = () => {
    return routerConfig;
  };
  const getRoutes = () => {
    return routes;
  };

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
  const isFunction = v => {
    return typeof v === 'function';
  };
  const isObject = v => {
    return typeof v === 'object' && v !== null;
  };
  const isBoolean = v => {
    return typeof v === 'boolean';
  };
  const isPage = v => {
    if (v instanceof Lightning.Element || isComponentConstructor(v)) {
      return true;
    }
    return false;
  };
  const isComponentConstructor = type => {
    return type.prototype && 'isComponent' in type.prototype;
  };
  const isArray = v => {
    return Array.isArray(v);
  };
  const ucfirst = v => {
    return "".concat(v.charAt(0).toUpperCase()).concat(v.slice(1));
  };
  const isString = v => {
    return typeof v === 'string';
  };
  const isPromise = method => {
    let result;
    if (isFunction(method)) {
      try {
        result = method.apply(null);
      } catch (e) {
        result = e;
      }
    } else {
      result = method;
    }
    return isObject(result) && isFunction(result.then);
  };
  const cleanHash = function () {
    let hash = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
    return hash.replace(/^#/, '').replace(/\/+$/, '');
  };
  const getConfigMap = () => {
    const routerSettings = Settings.get('platform', 'router');
    const isObj = isObject(routerSettings);
    return ['backtrack', 'gcOnUnload', 'destroyOnHistoryBack', 'lazyCreate', 'lazyDestroy', 'reuseInstance', 'autoRestoreRemote', 'numberNavigation', 'updateHash', 'storeSameHash'].reduce((config, key) => {
      config.set(key, isObj ? routerSettings[key] : Settings.get('platform', key));
      return config;
    }, new Map());
  };
  const getQueryStringParams = function () {
    let hash = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : getActiveHash();
    const resumeHash = getResumeHash();
    if ((hash === '$' || !hash) && resumeHash) {
      if (isString(resumeHash)) {
        hash = resumeHash;
      }
    }
    let parse = '';
    const getQuery = /([?&].*)/;
    const matches = getQuery.exec(hash);
    const params = {};
    if (document.location && document.location.search) {
      parse = document.location.search;
    }
    if (matches && matches.length) {
      let hashParams = matches[1];
      if (parse) {
        // if location.search is not empty we
        // remove the leading ? to create a
        // valid string
        hashParams = hashParams.replace(/^\?/, '');
        // we parse hash params last so they we can always
        // override search params with hash params
        parse = "".concat(parse, "&").concat(hashParams);
      } else {
        parse = hashParams;
      }
    }
    if (parse) {
      const urlParams = new URLSearchParams(parse);
      for (const [key, value] of urlParams.entries()) {
        params[key] = value;
      }
      return params;
    } else {
      return false;
    }
  };
  const objectToQueryString = obj => {
    if (!isObject(obj)) {
      return '';
    }
    return '?' + Object.keys(obj).map(key => {
      return "".concat(key, "=").concat(obj[key]);
    }).join('&');
  };
  const symbols = {
    route: Symbol('route'),
    hash: Symbol('hash'),
    store: Symbol('store'),
    fromHistory: Symbol('fromHistory'),
    expires: Symbol('expires'),
    resume: Symbol('resume'),
    backtrack: Symbol('backtrack'),
    historyState: Symbol('historyState'),
    queryParams: Symbol('queryParams')
  };

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
  const dataHooks = {
    on: request => {
      app.state || '';
      app._setState('Loading');
      return execProvider(request);
    },
    before: request => {
      return execProvider(request);
    },
    after: request => {
      try {
        execProvider(request, true);
      } catch (e) {
        // for now we fail silently
      }
      return Promise.resolve();
    }
  };
  const execProvider = (request, emitProvided) => {
    const route = request.route;
    const provider = route.provider;
    const expires = route.cache ? route.cache * 1000 : 0;
    const params = addPersistData(request);
    return provider.request(request.page, {
      ...params
    }).then(() => {
      request.page[symbols.expires] = Date.now() + expires;
      if (emitProvided) {
        emit$1(request.page, 'dataProvided');
      }
    });
  };
  const addPersistData = _ref => {
    let {
      page,
      route,
      hash,
      register = new Map()
    } = _ref;
    const urlValues = getValuesFromHash(hash, route.path);
    const queryParams = getQueryStringParams(hash);
    const pageData = new Map([...urlValues, ...register]);
    const params = {};

    // make dynamic url data available to the page
    // as instance properties
    for (let [name, value] of pageData) {
      params[name] = value;
    }
    if (queryParams) {
      params[symbols.queryParams] = queryParams;
    }

    // check navigation register for persistent data
    if (register.size) {
      const obj = {};
      for (let [k, v] of register) {
        obj[k] = v;
      }
      page.persist = obj;
    }

    // make url data and persist data available
    // via params property
    page.params = params;
    emit$1(page, ['urlParams'], params);
    return params;
  };

  /**
   * Test if page passed cache-time
   * @param page
   * @returns {boolean}
   */
  const isPageExpired = page => {
    if (!page[symbols.expires]) {
      return false;
    }
    const expires = page[symbols.expires];
    const now = Date.now();
    return now >= expires;
  };
  const hasProvider = path => {
    if (routeExists(path)) {
      const record = routes.get(path);
      return !!record.provider;
    }
    return false;
  };
  const getProvider = route => {
    // @todo: fix, route already is passed in
    if (routeExists(route.path)) {
      const {
        provider
      } = routes.get(route.path);
      return {
        type: provider.type,
        provider: provider.request
      };
    }
  };

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */

  const fade = (i, o) => {
    return new Promise(resolve => {
      i.patch({
        alpha: 0,
        visible: true,
        smooth: {
          alpha: [1, {
            duration: 0.5,
            delay: 0.1
          }]
        }
      });
      // resolve on y finish
      i.transition('alpha').on('finish', () => {
        if (o) {
          o.visible = false;
        }
        resolve();
      });
    });
  };
  const crossFade = (i, o) => {
    return new Promise(resolve => {
      i.patch({
        alpha: 0,
        visible: true,
        smooth: {
          alpha: [1, {
            duration: 0.5,
            delay: 0.1
          }]
        }
      });
      if (o) {
        o.patch({
          smooth: {
            alpha: [0, {
              duration: 0.5,
              delay: 0.3
            }]
          }
        });
      }
      // resolve on y finish
      i.transition('alpha').on('finish', () => {
        resolve();
      });
    });
  };
  const moveOnAxes = (axis, direction, i, o) => {
    const bounds = axis === 'x' ? 1920 : 1080;
    return new Promise(resolve => {
      i.patch({
        ["".concat(axis)]: direction ? bounds * -1 : bounds,
        visible: true,
        smooth: {
          ["".concat(axis)]: [0, {
            duration: 0.4,
            delay: 0.2
          }]
        }
      });
      // out is optional
      if (o) {
        o.patch({
          ["".concat(axis)]: 0,
          smooth: {
            ["".concat(axis)]: [direction ? bounds : bounds * -1, {
              duration: 0.4,
              delay: 0.2
            }]
          }
        });
      }
      // resolve on y finish
      i.transition(axis).on('finish', () => {
        resolve();
      });
    });
  };
  const up = (i, o) => {
    return moveOnAxes('y', 0, i, o);
  };
  const down = (i, o) => {
    return moveOnAxes('y', 1, i, o);
  };
  const left = (i, o) => {
    return moveOnAxes('x', 0, i, o);
  };
  const right = (i, o) => {
    return moveOnAxes('x', 1, i, o);
  };
  var Transitions = {
    fade,
    crossFade,
    up,
    down,
    left,
    right
  };

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */

  /**
   * execute transition between new / old page and
   * toggle the defined widgets
   * @todo: platform override default transition
   * @param pageIn
   * @param pageOut
   */
  const executeTransition = function (pageIn) {
    let pageOut = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
    const transition = pageIn.pageTransition || pageIn.easing;
    const hasCustomTransitions = !!(pageIn.smoothIn || pageIn.smoothInOut || transition);
    const transitionsDisabled = getRouterConfig().get('disableTransitions');
    if (pageIn.easing) {
      console.warn('easing() method is deprecated and will be removed. Use pageTransition()');
    }

    // default behaviour is a visibility toggle
    if (!hasCustomTransitions || transitionsDisabled) {
      pageIn.visible = true;
      if (pageOut) {
        pageOut.visible = false;
      }
      return Promise.resolve();
    }
    if (transition) {
      let type;
      try {
        type = transition.call(pageIn, pageIn, pageOut);
      } catch (e) {
        type = 'crossFade';
      }
      if (isPromise(type)) {
        return type;
      }
      if (isString(type)) {
        const fn = Transitions[type];
        if (fn) {
          return fn(pageIn, pageOut);
        }
      }

      // keep backwards compatible for now
      if (pageIn.smoothIn) {
        // provide a smooth function that resolves itself
        // on transition finish
        const smooth = function (p, v) {
          let args = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
          return new Promise(resolve => {
            pageIn.visible = true;
            pageIn.setSmooth(p, v, args);
            pageIn.transition(p).on('finish', () => {
              resolve();
            });
          });
        };
        return pageIn.smoothIn({
          pageIn,
          smooth
        });
      }
    }
    return Transitions.crossFade(pageIn, pageOut);
  };

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */

  /**
   * The actual loading of the component
   * */
  const load = async request => {
    let expired = false;
    try {
      request = await loader$1(request);
      if (request && !request.isCancelled) {
        // in case of on() providing we need to reset
        // app state;
        if (app.state === 'Loading') {
          if (getPreviousState() === 'Widgets') ; else {
            app._setState('');
          }
        }
        // Do page transition if instance
        // is not shared between the routes
        if (!request.isSharedInstance && !request.isCancelled) {
          await executeTransition(request.page, getActivePage());
        }
      } else {
        expired = true;
      }
      // on expired we only cleanup
      if (expired || request.isCancelled) {
        Log.debug('[router]:', "Rejected ".concat(request.hash, " because route to ").concat(getLastHash(), " started"));
        if (request.isCreated && !request.isSharedInstance) {
          // remove from render-tree
          pagesHost.remove(request.page);
        }
      } else {
        onRequestResolved(request);
        // resolve promise
        return request.page;
      }
    } catch (request) {
      if (!request.route) {
        console.error(request);
      } else if (!expired) {
        // @todo: revisit
        const {
          route
        } = request;
        // clean up history if modifier is set
        if (getOption(route.options, 'clearHistory')) {
          setHistory([]);
        } else if (!isWildcard.test(route.path)) {
          updateHistory(request);
        }
        if (request.isCreated && !request.isSharedInstance) {
          // remove from render-tree
          pagesHost.remove(request.page);
        }
        handleError(request);
      }
    }
  };
  const loader$1 = async request => {
    const route = request.route;
    const hash = request.hash;
    const register = request.register;

    // todo: grab from Route instance
    let type = getComponent(route.path);
    let isConstruct = isComponentConstructor(type);
    let provide = false;

    // if it's an instance bt we're not coming back from
    // history we test if we can re-use this instance
    if (!isConstruct && !register.get(symbols.backtrack)) {
      if (!mustReuse(route)) {
        type = type.constructor;
        isConstruct = true;
      }
    }

    // If page is Lightning Component instance
    if (!isConstruct) {
      request.page = type;
      // if we have have a data route for current page
      if (hasProvider(route.path)) {
        if (isPageExpired(type) || type[symbols.hash] !== hash) {
          provide = true;
        }
      }
      let currentRoute = getActivePage() && getActivePage()[symbols.route];
      // if the new route is equal to the current route it means that both
      // route share the Component instance and stack location / since this case
      // is conflicting with the way before() and after() loading works we flag it,
      // and check platform settings in we want to re-use instance
      if (route.path === currentRoute) {
        request.isSharedInstance = true;
        // since we're re-using the instance we must attach
        // historyState to the request to prevent it from
        // being overridden.
        if (isFunction(request.page.historyState)) {
          request.copiedHistoryState = request.page.historyState();
        }
      }
    } else {
      request.page = createComponent(stage, type);
      pagesHost.a(request.page);
      // test if need to request data provider
      if (hasProvider(route.path)) {
        provide = true;
      }
      request.isCreated = true;
    }

    // we store hash and route as properties on the page instance
    // that way we can easily calculate new behaviour on page reload
    request.page[symbols.hash] = hash;
    request.page[symbols.route] = route.path;
    try {
      if (provide) {
        // extract attached data-provider for route
        // we're processing
        const {
          type: loadType,
          provider
        } = getProvider(route);

        // update running request
        request.provider = provider;
        request.providerType = loadType;
        await dataHooks[loadType](request);

        // we early exit if the current request is expired
        if (hash !== getLastHash()) {
          return false;
        } else {
          if (request.providerType !== 'after') {
            emit$1(request.page, 'dataProvided');
          }
          // resolve promise
          return request;
        }
      } else {
        addPersistData(request);
        return request;
      }
    } catch (e) {
      request.error = e;
      return Promise.reject(request);
    }
  };
  const handleError = request => {
    if (request && request.error) {
      console.error(request.error);
    } else if (request) {
      Log.error(request);
    }
    if (request.page && routeExists('!')) {
      navigate('!', {
        request
      }, false);
    }
  };
  const mustReuse = route => {
    const opt = getOption(route.options, 'reuseInstance');
    const config = routerConfig.get('reuseInstance');

    // route always has final decision
    if (isBoolean(opt)) {
      return opt;
    }
    return !(isBoolean(config) && config === false);
  };

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
  class RoutedApp extends Lightning.Component {
    static _template() {
      return {
        Pages: {
          forceZIndexContext: true
        },
        /**
         * This is a default Loading page that will be made visible
         * during data-provider on() you CAN override in child-class
         */
        Loading: {
          rect: true,
          w: 1920,
          h: 1080,
          color: 0xff000000,
          visible: false,
          zIndex: 99,
          Label: {
            mount: 0.5,
            x: 960,
            y: 540,
            text: {
              text: 'Loading..'
            }
          }
        }
      };
    }
    static _states() {
      return [class Loading extends this {
        $enter() {
          this.tag('Loading').visible = true;
        }
        $exit() {
          this.tag('Loading').visible = false;
        }
      }, class Widgets extends this {
        $enter(args, widget) {
          // store widget reference
          this._widget = widget;

          // since it's possible that this behaviour
          // is non-remote driven we force a recalculation
          // of the focuspath
          this._refocus();
        }
        _getFocused() {
          // we delegate focus to selected widget
          // so it can consume remotecontrol presses
          return this._widget;
        }

        // if we want to widget to widget focus delegation
        reload(widget) {
          this._widget = widget;
          this._refocus();
        }
        _handleKey() {
          const restoreFocus = routerConfig.get('autoRestoreRemote');
          /**
           * The Router used to delegate focus back to the page instance on
           * every unhandled key. This is barely usefull in any situation
           * so for now we offer the option to explicity turn that behaviour off
           * so we don't don't introduce a breaking change.
           */
          if (!isBoolean(restoreFocus) || restoreFocus === true) {
            Router.focusPage();
          }
        }
      }];
    }

    /**
     * Return location where pages need to be stored
     */
    get pages() {
      return this.tag('Pages');
    }

    /**
     * Tell router where widgets are stored
     */
    get widgets() {
      return this.tag('Widgets');
    }

    /**
     * we MUST register _handleBack method so the Router
     * can override it
     * @private
     */
    _handleBack() {}

    /**
     * We MUST return Router.activePage() so the new Page
     * can listen to the remote-control.
     */
    _getFocused() {
      return Router.getActivePage();
    }
  }

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */

  /*
  rouThor ==[x]
   */
  let navigateQueue = new Map();
  let forcedHash = '';
  let resumeHash = '';

  /**
   * Start routing the app
   * @param config - route config object
   * @param instance - instance of the app
   */
  const startRouter = (config, instance) => {
    bootRouter(config, instance);
    registerListener();
    start();
  };

  // start translating url
  const start = () => {
    let hash = (getHash() || '').replace(/^#/, '');
    const bootKey = '$';
    const params = getQueryStringParams(hash);
    const bootRequest = getBootRequest();
    const rootHash = getRootHash();
    const isDirectLoad = hash.indexOf(bootKey) !== -1;

    // prevent direct reload of wildcard routes
    // expect bootComponent
    if (isWildcard.test(hash) && hash !== bootKey) {
      hash = '';
    }

    // store resume point for manual resume
    resumeHash = isDirectLoad ? rootHash : hash || rootHash;
    const ready = () => {
      if (!hash && rootHash) {
        if (isString(rootHash)) {
          navigate(rootHash);
        } else if (isFunction(rootHash)) {
          rootHash().then(res => {
            if (isObject(res)) {
              navigate(res.path, res.params);
            } else {
              navigate(res);
            }
          });
        }
      } else {
        queue(hash);
        handleHashChange().then(() => {
          app._refocus();
        }).catch(e => {
          console.error(e);
        });
      }
    };
    if (routeExists(bootKey)) {
      if (hash && !isDirectLoad) {
        if (!getRouteByHash(hash)) {
          navigate('*', {
            failedHash: hash
          });
          return;
        }
      }
      navigate(bootKey, {
        resume: resumeHash,
        reload: bootKey === hash
      }, false);
    } else if (isFunction(bootRequest)) {
      bootRequest(params).then(() => {
        ready();
      }).catch(e => {
        handleBootError(e);
      });
    } else {
      ready();
    }
  };
  const handleBootError = e => {
    if (routeExists('!')) {
      navigate('!', {
        request: {
          error: e
        }
      });
    } else {
      console.error(e);
    }
  };

  /**
   * start a new request
   * @param url
   * @param args
   * @param store
   */
  const navigate = function (url) {
    let args = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    let store = arguments.length > 2 ? arguments[2] : undefined;
    if (isObject(url)) {
      url = getHashByName(url);
      if (!url) {
        return;
      }
    }
    let hash = getHash();
    if (!mustUpdateLocationHash() && forcedHash) {
      hash = forcedHash;
    }
    if (hash.replace(/^#/, '') !== url) {
      // push request in the queue
      queue(url, args, store);
      setHash(url);
      if (!mustUpdateLocationHash()) {
        forcedHash = url;
        handleHashChange(url).then(() => {
          app._refocus();
        }).catch(e => {
          console.error(e);
        });
      }
    } else if (args.reload) {
      // push request in the queue
      queue(url, args, store);
      handleHashChange(url).then(() => {
        app._refocus();
      }).catch(e => {
        console.error(e);
      });
    }
  };
  const queue = function (hash) {
    let args = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    let store = arguments.length > 2 ? arguments[2] : undefined;
    hash = cleanHash(hash);
    if (!navigateQueue.has(hash)) {
      for (let request of navigateQueue.values()) {
        request.cancel();
      }
      const request = createRequest(hash, args, store);
      navigateQueue.set(decodeURIComponent(hash), request);
      return request;
    }
    return false;
  };

  /**
   * Handle change of hash
   * @param override
   * @returns {Promise<void>}
   */
  const handleHashChange = async override => {
    const hash = cleanHash(override || getHash());
    const queueId = decodeURIComponent(hash);
    let request = navigateQueue.get(queueId);

    // handle hash updated manually
    if (!request && !navigateQueue.size) {
      request = queue(hash);
    }
    const route = getRouteByHash(hash);
    if (!route) {
      if (routeExists('*')) {
        navigate('*', {
          failedHash: hash
        });
      } else {
        console.error("Unable to navigate to: ".concat(hash));
      }
      return;
    }

    // update current processed request
    request.hash = hash;
    request.route = route;
    let result = await beforeEachRoute(getActiveHash(), request);

    // test if a local hook is configured for the route
    if (route.beforeNavigate) {
      result = await route.beforeNavigate(getActiveHash(), request);
    }
    if (isBoolean(result)) {
      // only if resolve value is explicitly true
      // we continue the current route request
      if (result) {
        return resolveHashChange(request);
      }
    } else {
      // if navigation guard didn't return true
      // we cancel the current request
      request.cancel();
      navigateQueue.delete(queueId);
      if (isString(result)) {
        navigate(result);
      } else if (isObject(result)) {
        let store = true;
        if (isBoolean(result.store)) {
          store = result.store;
        }
        navigate(result.path, result.params, store);
      }
    }
  };

  /**
   * Continue processing the hash change if not blocked
   * by global or local hook
   * @param request - {}
   */
  const resolveHashChange = request => {
    const hash = request.hash;
    const route = request.route;
    const queueId = decodeURIComponent(hash);
    // store last requested hash so we can
    // prevent a route that resolved later
    // from displaying itself
    setLastHash(hash);
    if (route.path) {
      const component = getComponent(route.path);
      // if a hook is provided for the current route
      if (isFunction(route.hook)) {
        const urlParams = getValuesFromHash(hash, route.path);
        const params = {};
        for (const key of urlParams.keys()) {
          params[key] = urlParams.get(key);
        }
        route.hook(app, {
          ...params
        });
      }
      // if there is a component attached to the route
      if (component) {
        // force page to root state to prevent shared state issues
        const activePage = getActivePage();
        if (activePage) {
          const keepAlive = keepActivePageAlive(getActiveRoute(), request);
          if (activePage && route.path === getActiveRoute() && !keepAlive) {
            activePage._setState('');
          }
        }
        if (isPage(component)) {
          load(request).then(() => {
            app._refocus();
            navigateQueue.delete(queueId);
          });
        } else {
          // of the component is not a constructor
          // or a Component instance we can assume
          // that it's a dynamic import
          component().then(contents => {
            return contents.default;
          }).then(module => {
            storeComponent(route.path, module);
            return load(request);
          }).then(() => {
            app._refocus();
            navigateQueue.delete(queueId);
          });
        }
      } else {
        navigateQueue.delete(queueId);
      }
    }
  };

  /**
   * Directional step in history
   * @param direction
   */
  const step = function () {
    let level = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
    if (!level || isNaN(level)) {
      return false;
    }
    const history = getHistory();
    // for now we only support negative numbers
    level = Math.abs(level);

    // we can't step back past the amount
    // of history entries
    if (level > history.length) {
      if (isFunction(app._handleAppClose)) {
        return app._handleAppClose();
      }
      return false;
    } else if (history.length) {
      // for now we only support history back
      const route = history.splice(history.length - level, level)[0];
      // store changed history
      setHistory(history);
      return navigate(route.hash, {
        [symbols.backtrack]: true,
        [symbols.historyState]: route.state
      }, false);
    } else if (routerConfig.get('backtrack')) {
      const hashLastPart = /(\/:?[\w%\s-]+)$/;
      let hash = stripRegex(getHash());
      let floor = getFloor(hash);

      // test if we got deep-linked
      if (floor > 1) {
        while (floor--) {
          // strip of last part
          hash = hash.replace(hashLastPart, '');
          // if we have a configured route
          // we navigate to it
          if (getRouteByHash(hash)) {
            return navigate(hash, {
              [symbols.backtrack]: true
            }, false);
          }
        }
      }
    }
    return false;
  };

  /**
   * Resume Router's page loading process after
   * the BootComponent became visible;
   */
  const resume = () => {
    if (isString(resumeHash)) {
      navigate(resumeHash, false);
      resumeHash = '';
    } else if (isFunction(resumeHash)) {
      resumeHash().then(res => {
        resumeHash = '';
        if (isObject(res)) {
          navigate(res.path, res.params);
        } else {
          navigate(res);
        }
      });
    } else {
      console.warn('[Router]: resume() called but no hash found');
    }
  };

  /**
   * Force reload active hash
   */
  const reload = () => {
    if (!isNavigating()) {
      const hash = getActiveHash();
      navigate(hash, {
        reload: true
      }, false);
    }
  };

  /**
   * Query if the Router is still processing a Request
   * @returns {boolean}
   */
  const isNavigating = () => {
    if (navigateQueue.size) {
      let isProcessing = false;
      for (let request of navigateQueue.values()) {
        if (!request.isCancelled) {
          isProcessing = true;
        }
      }
      return isProcessing;
    }
    return false;
  };
  const getResumeHash = () => {
    return resumeHash;
  };

  /**
   * By default we return the location hash
   * @returns {string}
   */
  let getHash = () => {
    return document.location.hash;
  };

  /**
   * Update location hash
   * @param url
   */
  let setHash = url => {
    document.location.hash = url;
  };

  /**
   * This can be called from the platform / bootstrapper to override
   * the default getting and setting of the hash
   * @param config
   */
  const initRouter = config => {
    if (config.getHash) {
      getHash = config.getHash;
    }
    if (config.setHash) {
      setHash = config.setHash;
    }
  };

  /**
   * On hash change we start processing
   */
  const registerListener = () => {
    Registry.addEventListener(window, 'hashchange', async () => {
      if (mustUpdateLocationHash()) {
        try {
          await handleHashChange();
        } catch (e) {
          console.error(e);
        }
      }
    });
  };

  /**
   * Navigate to root hash
   */
  const root = () => {
    const rootHash = getRootHash();
    if (isString(rootHash)) {
      navigate(rootHash);
    } else if (isFunction(rootHash)) {
      rootHash().then(res => {
        if (isObject(res)) {
          navigate(res.path, res.params);
        } else {
          navigate(res);
        }
      });
    }
  };

  // export API
  var Router = {
    startRouter,
    navigate,
    resume,
    step,
    go: step,
    back: step.bind(null, -1),
    activePage: getActivePage,
    getActivePage() {
      // warning
      return getActivePage();
    },
    getActiveRoute,
    getActiveHash,
    focusWidget,
    getActiveWidget,
    restoreFocus,
    isNavigating,
    getHistory,
    setHistory,
    getHistoryState,
    replaceHistoryState,
    getQueryStringParams,
    reload,
    symbols,
    App: RoutedApp,
    // keep backwards compatible
    focusPage: restoreFocus,
    root: root,
    /**
     * Deprecated api methods
     */
    setupRoutes() {
      console.warn('Router: setupRoutes is deprecated, consolidate your configuration');
      console.warn('https://rdkcentral.github.io/Lightning-SDK/#/plugins/router/configuration');
    },
    on() {
      console.warn('Router.on() is deprecated, consolidate your configuration');
      console.warn('https://rdkcentral.github.io/Lightning-SDK/#/plugins/router/configuration');
    },
    before() {
      console.warn('Router.before() is deprecated, consolidate your configuration');
      console.warn('https://rdkcentral.github.io/Lightning-SDK/#/plugins/router/configuration');
    },
    after() {
      console.warn('Router.after() is deprecated, consolidate your configuration');
      console.warn('https://rdkcentral.github.io/Lightning-SDK/#/plugins/router/configuration');
    }
  };

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
  const defaultChannels = [{
    number: 1,
    name: 'Metro News 1',
    description: 'New York Cable News Channel',
    entitled: true,
    program: {
      title: 'The Morning Show',
      description: "New York's best morning show",
      startTime: new Date(new Date() - 60 * 5 * 1000).toUTCString(),
      // started 5 minutes ago
      duration: 60 * 30,
      // 30 minutes
      ageRating: 0
    }
  }, {
    number: 2,
    name: 'MTV',
    description: 'Music Television',
    entitled: true,
    program: {
      title: 'Beavis and Butthead',
      description: 'American adult animated sitcom created by Mike Judge',
      startTime: new Date(new Date() - 60 * 20 * 1000).toUTCString(),
      // started 20 minutes ago
      duration: 60 * 45,
      // 45 minutes
      ageRating: 18
    }
  }, {
    number: 3,
    name: 'NBC',
    description: 'NBC TV Network',
    entitled: false,
    program: {
      title: 'The Tonight Show Starring Jimmy Fallon',
      description: 'Late-night talk show hosted by Jimmy Fallon on NBC',
      startTime: new Date(new Date() - 60 * 10 * 1000).toUTCString(),
      // started 10 minutes ago
      duration: 60 * 60,
      // 1 hour
      ageRating: 10
    }
  }];
  const channels = () => Settings.get('platform', 'tv', defaultChannels);
  const randomChannel = () => channels()[~~(channels.length * Math.random())];

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
  let currentChannel;
  const callbacks = {};
  const emit = function (event) {
    for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }
    callbacks[event] && callbacks[event].forEach(cb => {
      cb.apply(null, args);
    });
  };

  // local mock methods
  let methods = {
    getChannel() {
      if (!currentChannel) currentChannel = randomChannel();
      return new Promise((resolve, reject) => {
        if (currentChannel) {
          const channel = {
            ...currentChannel
          };
          delete channel.program;
          resolve(channel);
        } else {
          reject('No channel found');
        }
      });
    },
    getProgram() {
      if (!currentChannel) currentChannel = randomChannel();
      return new Promise((resolve, reject) => {
        currentChannel.program ? resolve(currentChannel.program) : reject('No program found');
      });
    },
    setChannel(number) {
      return new Promise((resolve, reject) => {
        if (number) {
          const newChannel = channels().find(c => c.number === number);
          if (newChannel) {
            currentChannel = newChannel;
            const channel = {
              ...currentChannel
            };
            delete channel.program;
            emit('channelChange', channel);
            resolve(channel);
          } else {
            reject('Channel not found');
          }
        } else {
          reject('No channel number supplied');
        }
      });
    }
  };
  const initTV = config => {
    methods = {};
    if (config.getChannel && typeof config.getChannel === 'function') {
      methods.getChannel = config.getChannel;
    }
    if (config.getProgram && typeof config.getProgram === 'function') {
      methods.getProgram = config.getProgram;
    }
    if (config.setChannel && typeof config.setChannel === 'function') {
      methods.setChannel = config.setChannel;
    }
    if (config.emit && typeof config.emit === 'function') {
      config.emit(emit);
    }
  };

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
  const initPurchase = config => {
    if (config.billingUrl) config.billingUrl;
  };

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
  class PinInput extends Lightning.Component {
    static _template() {
      return {
        w: 120,
        h: 150,
        rect: true,
        color: 0xff949393,
        alpha: 0.5,
        shader: {
          type: Lightning.shaders.RoundedRectangle,
          radius: 10
        },
        Nr: {
          w: w => w,
          y: 24,
          text: {
            text: '',
            textColor: 0xff333333,
            fontSize: 80,
            textAlign: 'center',
            verticalAlign: 'middle'
          }
        }
      };
    }
    set index(v) {
      this.x = v * (120 + 24);
    }
    set nr(v) {
      this._timeout && clearTimeout(this._timeout);
      if (v) {
        this.setSmooth('alpha', 1);
      } else {
        this.setSmooth('alpha', 0.5);
      }
      this.tag('Nr').patch({
        text: {
          text: v && v.toString() || '',
          fontSize: v === '*' ? 120 : 80
        }
      });
      if (v && v !== '*') {
        this._timeout = setTimeout(() => {
          this._timeout = null;
          this.nr = '*';
        }, 750);
      }
    }
  }
  class PinDialog extends Lightning.Component {
    static _template() {
      return {
        zIndex: 1,
        w: w => w,
        h: h => h,
        rect: true,
        color: 0xdd000000,
        alpha: 0.000001,
        Dialog: {
          w: 648,
          h: 320,
          y: h => (h - 320) / 2,
          x: w => (w - 648) / 2,
          rect: true,
          color: 0xdd333333,
          shader: {
            type: Lightning.shaders.RoundedRectangle,
            radius: 10
          },
          Info: {
            y: 24,
            x: 48,
            text: {
              text: 'Please enter your PIN',
              fontSize: 32
            }
          },
          Msg: {
            y: 260,
            x: 48,
            text: {
              text: '',
              fontSize: 28,
              textColor: 0xffffffff
            }
          },
          Code: {
            x: 48,
            y: 96
          }
        }
      };
    }
    _init() {
      const children = [];
      for (let i = 0; i < 4; i++) {
        children.push({
          type: PinInput,
          index: i
        });
      }
      this.tag('Code').children = children;
    }
    get pin() {
      if (!this._pin) this._pin = '';
      return this._pin;
    }
    set pin(v) {
      if (v.length <= 4) {
        const maskedPin = new Array(Math.max(v.length - 1, 0)).fill('*', 0, v.length - 1);
        v.length && maskedPin.push(v.length > this._pin.length ? v.slice(-1) : '*');
        for (let i = 0; i < 4; i++) {
          this.tag('Code').children[i].nr = maskedPin[i] || '';
        }
        this._pin = v;
      }
    }
    get msg() {
      if (!this._msg) this._msg = '';
      return this._msg;
    }
    set msg(v) {
      this._timeout && clearTimeout(this._timeout);
      this._msg = v;
      if (this._msg) {
        this.tag('Msg').text = this._msg;
        this.tag('Info').setSmooth('alpha', 0.5);
        this.tag('Code').setSmooth('alpha', 0.5);
      } else {
        this.tag('Msg').text = '';
        this.tag('Info').setSmooth('alpha', 1);
        this.tag('Code').setSmooth('alpha', 1);
      }
      this._timeout = setTimeout(() => {
        this.msg = '';
      }, 2000);
    }
    _firstActive() {
      this.setSmooth('alpha', 1);
    }
    _handleKey(event) {
      if (this.msg) {
        this.msg = false;
      } else {
        const val = parseInt(event.key);
        if (val > -1) {
          this.pin += val;
        }
      }
    }
    _handleBack() {
      if (this.msg) {
        this.msg = false;
      } else {
        if (this.pin.length) {
          this.pin = this.pin.slice(0, this.pin.length - 1);
        } else {
          Pin.hide();
          this.resolve(false);
        }
      }
    }
    _handleEnter() {
      if (this.msg) {
        this.msg = false;
      } else {
        Pin.submit(this.pin).then(val => {
          this.msg = 'Unlocking ...';
          setTimeout(() => {
            Pin.hide();
          }, 1000);
          this.resolve(val);
        }).catch(e => {
          this.msg = e;
          this.reject(e);
        });
      }
    }
  }

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */

  // only used during local development
  let unlocked = false;
  const contextItems = ['purchase', 'parental'];
  let submit = (pin, context) => {
    return new Promise((resolve, reject) => {
      if (pin.toString() === Settings.get('platform', 'pin', '0000').toString()) {
        unlocked = true;
        resolve(unlocked);
      } else {
        reject('Incorrect pin');
      }
    });
  };
  let check = context => {
    return new Promise(resolve => {
      resolve(unlocked);
    });
  };
  const initPin = config => {
    if (config.submit && typeof config.submit === 'function') {
      submit = config.submit;
    }
    if (config.check && typeof config.check === 'function') {
      check = config.check;
    }
  };
  let pinDialog = null;
  const contextCheck = context => {
    if (context === undefined) {
      Log.info('Please provide context explicitly');
      return contextItems[0];
    } else if (!contextItems.includes(context)) {
      Log.warn('Incorrect context provided');
      return false;
    }
    return context;
  };

  // Public API
  var Pin = {
    show() {
      return new Promise((resolve, reject) => {
        pinDialog = ApplicationInstance.stage.c({
          ref: 'PinDialog',
          type: PinDialog,
          resolve,
          reject
        });
        ApplicationInstance.childList.a(pinDialog);
        ApplicationInstance.focus = pinDialog;
      });
    },
    hide() {
      ApplicationInstance.focus = null;
      ApplicationInstance.children = ApplicationInstance.children.map(child => child !== pinDialog && child);
      pinDialog = null;
    },
    submit(pin, context) {
      return new Promise((resolve, reject) => {
        try {
          context = contextCheck(context);
          if (context) {
            submit(pin, context).then(resolve).catch(reject);
          } else {
            reject('Incorrect Context provided');
          }
        } catch (e) {
          reject(e);
        }
      });
    },
    unlocked(context) {
      return new Promise((resolve, reject) => {
        try {
          context = contextCheck(context);
          if (context) {
            check(context).then(resolve).catch(reject);
          } else {
            reject('Incorrect Context provided');
          }
        } catch (e) {
          reject(e);
        }
      });
    },
    locked(context) {
      return new Promise((resolve, reject) => {
        try {
          context = contextCheck(context);
          if (context) {
            check(context).then(unlocked => resolve(!!!unlocked)).catch(reject);
          } else {
            reject('Incorrect Context provided');
          }
        } catch (e) {
          reject(e);
        }
      });
    }
  };

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
  let ApplicationInstance;
  var Launch = ((App, appSettings, platformSettings, appData) => {
    initSettings(appSettings, platformSettings);
    initUtils(platformSettings);
    initStorage();
    // Initialize plugins
    if (platformSettings.plugins) {
      platformSettings.plugins.profile && initProfile(platformSettings.plugins.profile);
      platformSettings.plugins.metrics && initMetrics(platformSettings.plugins.metrics);
      platformSettings.plugins.mediaPlayer && initMediaPlayer(platformSettings.plugins.mediaPlayer);
      platformSettings.plugins.mediaPlayer && initVideoPlayer(platformSettings.plugins.mediaPlayer);
      platformSettings.plugins.ads && initAds(platformSettings.plugins.ads);
      platformSettings.plugins.router && initRouter(platformSettings.plugins.router);
      platformSettings.plugins.tv && initTV(platformSettings.plugins.tv);
      platformSettings.plugins.purchase && initPurchase(platformSettings.plugins.purchase);
      platformSettings.plugins.pin && initPin(platformSettings.plugins.pin);
    }
    const app = Application(App, appData, platformSettings);
    ApplicationInstance = new app(appSettings);
    return ApplicationInstance;
  });

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
  class VideoTexture extends Lightning.Component {
    static _template() {
      return {
        Video: {
          alpha: 1,
          visible: false,
          pivot: 0.5,
          texture: {
            type: Lightning.textures.StaticTexture,
            options: {}
          }
        }
      };
    }
    set videoEl(v) {
      this._videoEl = v;
    }
    get videoEl() {
      return this._videoEl;
    }
    get videoView() {
      return this.tag('Video');
    }
    get videoTexture() {
      return this.videoView.texture;
    }
    get isVisible() {
      return this.videoView.alpha === 1 && this.videoView.visible === true;
    }
    _init() {
      this._createVideoTexture();
    }
    _createVideoTexture() {
      const stage = this.stage;
      const gl = stage.gl;
      const glTexture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, glTexture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      this.videoTexture.options = {
        source: glTexture,
        w: this.videoEl.width,
        h: this.videoEl.height
      };
      this.videoView.w = this.videoEl.width / this.stage.getRenderPrecision();
      this.videoView.h = this.videoEl.height / this.stage.getRenderPrecision();
    }
    start() {
      const stage = this.stage;
      this._lastTime = 0;
      if (!this._updateVideoTexture) {
        this._updateVideoTexture = () => {
          if (this.videoTexture.options.source && this.videoEl.videoWidth && this.active) {
            const gl = stage.gl;
            const currentTime = new Date().getTime();
            const getVideoPlaybackQuality = this.videoEl.getVideoPlaybackQuality();

            // When BR2_PACKAGE_GST1_PLUGINS_BAD_PLUGIN_DEBUGUTILS is not set in WPE, webkitDecodedFrameCount will not be available.
            // We'll fallback to fixed 30fps in this case.
            // As 'webkitDecodedFrameCount' is about to deprecate, check for the 'totalVideoFrames'
            const frameCount = getVideoPlaybackQuality ? getVideoPlaybackQuality.totalVideoFrames : this.videoEl.webkitDecodedFrameCount;
            const mustUpdate = frameCount ? this._lastFrame !== frameCount : this._lastTime < currentTime - 30;
            if (mustUpdate) {
              this._lastTime = currentTime;
              this._lastFrame = frameCount;
              try {
                gl.bindTexture(gl.TEXTURE_2D, this.videoTexture.options.source);
                gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.videoEl);
                this._lastFrame = this.videoEl.webkitDecodedFrameCount;
                this.videoView.visible = true;
                this.videoTexture.options.w = this.videoEl.width;
                this.videoTexture.options.h = this.videoEl.height;
                const expectedAspectRatio = this.videoView.w / this.videoView.h;
                const realAspectRatio = this.videoEl.width / this.videoEl.height;
                if (expectedAspectRatio > realAspectRatio) {
                  this.videoView.scaleX = realAspectRatio / expectedAspectRatio;
                  this.videoView.scaleY = 1;
                } else {
                  this.videoView.scaleY = expectedAspectRatio / realAspectRatio;
                  this.videoView.scaleX = 1;
                }
              } catch (e) {
                Log.error('texImage2d video', e);
                this.stop();
              }
              this.videoTexture.source.forceRenderUpdate();
            }
          }
        };
      }
      if (!this._updatingVideoTexture) {
        stage.on('frameStart', this._updateVideoTexture);
        this._updatingVideoTexture = true;
      }
    }
    stop() {
      const stage = this.stage;
      stage.removeListener('frameStart', this._updateVideoTexture);
      this._updatingVideoTexture = false;
      this.videoView.visible = false;
      if (this.videoTexture.options.source) {
        const gl = stage.gl;
        gl.bindTexture(gl.TEXTURE_2D, this.videoTexture.options.source);
        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);
      }
    }
    position(top, left) {
      this.videoView.patch({
        smooth: {
          x: left,
          y: top
        }
      });
    }
    size(width, height) {
      this.videoView.patch({
        smooth: {
          w: width,
          h: height
        }
      });
    }
    show() {
      this.videoView.setSmooth('alpha', 1);
    }
    hide() {
      this.videoView.setSmooth('alpha', 0);
    }
  }

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
  let mediaUrl = url => url;
  let videoEl;
  let videoTexture;
  let metrics;
  let consumer$1;
  let precision = 1;
  let textureMode = false;
  const initVideoPlayer = config => {
    if (config.mediaUrl) {
      mediaUrl = config.mediaUrl;
    }
  };

  // todo: add this in a 'Registry' plugin
  // to be able to always clean this up on app close
  let eventHandlers = {};
  const state$1 = {
    adsEnabled: false,
    playing: false,
    _playingAds: false,
    get playingAds() {
      return this._playingAds;
    },
    set playingAds(val) {
      if (this._playingAds !== val) {
        this._playingAds = val;
        fireOnConsumer$1(val === true ? 'AdStart' : 'AdEnd');
      }
    },
    skipTime: false,
    playAfterSeek: null
  };
  const hooks = {
    play() {
      state$1.playing = true;
    },
    pause() {
      state$1.playing = false;
    },
    seeked() {
      state$1.playAfterSeek === true && videoPlayerPlugin.play();
      state$1.playAfterSeek = null;
    },
    abort() {
      deregisterEventListeners();
    }
  };
  const withPrecision = val => Math.round(precision * val) + 'px';
  const fireOnConsumer$1 = (event, args) => {
    if (consumer$1) {
      consumer$1.fire('$videoPlayer' + event, args, videoEl.currentTime);
      consumer$1.fire('$videoPlayerEvent', event, args, videoEl.currentTime);
    }
  };
  const fireHook = (event, args) => {
    hooks[event] && typeof hooks[event] === 'function' && hooks[event].call(null, event, args);
  };
  let customLoader = null;
  let customUnloader = null;
  const loader = (url, videoEl, config) => {
    return customLoader && typeof customLoader === 'function' ? customLoader(url, videoEl, config) : new Promise(resolve => {
      url = mediaUrl(url);
      videoEl.setAttribute('src', url);
      videoEl.load();
      resolve();
    });
  };
  const unloader = videoEl => {
    return customUnloader && typeof customUnloader === 'function' ? customUnloader(videoEl) : new Promise(resolve => {
      videoEl.removeAttribute('src');
      videoEl.load();
      resolve();
    });
  };
  const setupVideoTag = () => {
    const videoEls = document.getElementsByTagName('video');
    if (videoEls && videoEls.length) {
      return videoEls[0];
    } else {
      const videoEl = document.createElement('video');
      const platformSettingsWidth = Settings.get('platform', 'width') ? Settings.get('platform', 'width') : 1920;
      const platformSettingsHeight = Settings.get('platform', 'height') ? Settings.get('platform', 'height') : 1080;
      videoEl.setAttribute('id', 'video-player');
      videoEl.setAttribute('width', withPrecision(platformSettingsWidth));
      videoEl.setAttribute('height', withPrecision(platformSettingsHeight));
      videoEl.style.position = 'absolute';
      videoEl.style.zIndex = '1';
      videoEl.style.display = 'none';
      videoEl.style.visibility = 'hidden';
      videoEl.style.top = withPrecision(0);
      videoEl.style.left = withPrecision(0);
      videoEl.style.width = withPrecision(platformSettingsWidth);
      videoEl.style.height = withPrecision(platformSettingsHeight);
      document.body.appendChild(videoEl);
      return videoEl;
    }
  };
  const setUpVideoTexture = () => {
    if (!ApplicationInstance.tag('VideoTexture')) {
      const el = ApplicationInstance.stage.c({
        type: VideoTexture,
        ref: 'VideoTexture',
        zIndex: 0,
        videoEl
      });
      ApplicationInstance.childList.addAt(el, 0);
    }
    return ApplicationInstance.tag('VideoTexture');
  };
  const registerEventListeners = () => {
    Log.info('VideoPlayer', 'Registering event listeners');
    Object.keys(events$1).forEach(event => {
      const handler = e => {
        // Fire a metric for each event (if it exists on the metrics object)
        if (metrics && metrics[event] && typeof metrics[event] === 'function') {
          metrics[event]({
            currentTime: videoEl.currentTime
          });
        }
        // fire an internal hook
        fireHook(event, {
          videoElement: videoEl,
          event: e
        });

        // fire the event (with human friendly event name) to the consumer of the VideoPlayer
        fireOnConsumer$1(events$1[event], {
          videoElement: videoEl,
          event: e
        });
      };
      eventHandlers[event] = handler;
      videoEl.addEventListener(event, handler);
    });
  };
  const deregisterEventListeners = () => {
    Log.info('VideoPlayer', 'Deregistering event listeners');
    Object.keys(eventHandlers).forEach(event => {
      videoEl.removeEventListener(event, eventHandlers[event]);
    });
    eventHandlers = {};
  };
  const videoPlayerPlugin = {
    consumer(component) {
      consumer$1 = component;
    },
    loader(loaderFn) {
      customLoader = loaderFn;
    },
    unloader(unloaderFn) {
      customUnloader = unloaderFn;
    },
    position() {
      let top = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
      let left = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
      videoEl.style.left = withPrecision(left);
      videoEl.style.top = withPrecision(top);
      if (textureMode === true) {
        videoTexture.position(top, left);
      }
    },
    size() {
      let width = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1920;
      let height = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1080;
      videoEl.style.width = withPrecision(width);
      videoEl.style.height = withPrecision(height);
      videoEl.width = parseFloat(videoEl.style.width);
      videoEl.height = parseFloat(videoEl.style.height);
      if (textureMode === true) {
        videoTexture.size(width, height);
      }
    },
    area() {
      let top = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
      let right = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1920;
      let bottom = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1080;
      let left = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;
      this.position(top, left);
      this.size(right - left, bottom - top);
    },
    open(url) {
      let config = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      if (!this.canInteract) return;
      metrics = Metrics$1.media(url);
      this.hide();
      deregisterEventListeners();
      if (this.src == url) {
        this.clear().then(this.open(url, config));
      } else {
        const adConfig = {
          enabled: state$1.adsEnabled,
          duration: 300
        };
        if (config.videoId) {
          adConfig.caid = config.videoId;
        }
        Ads.get(adConfig, consumer$1).then(ads => {
          state$1.playingAds = true;
          ads.prerolls().then(() => {
            state$1.playingAds = false;
            loader(url, videoEl, config).then(() => {
              registerEventListeners();
              this.show();
              this.play();
            }).catch(e => {
              fireOnConsumer$1('error', {
                videoElement: videoEl,
                event: e
              });
            });
          });
        });
      }
    },
    reload() {
      if (!this.canInteract) return;
      const url = videoEl.getAttribute('src');
      this.close();
      this.open(url);
    },
    close() {
      Ads.cancel();
      if (state$1.playingAds) {
        state$1.playingAds = false;
        Ads.stop();
        // call self in next tick
        setTimeout(() => {
          this.close();
        });
      }
      if (!this.canInteract) return;
      this.clear();
      this.hide();
      deregisterEventListeners();
    },
    clear() {
      if (!this.canInteract) return;
      // pause the video first to disable sound
      this.pause();
      if (textureMode === true) videoTexture.stop();
      return unloader(videoEl).then(() => {
        fireOnConsumer$1('Clear', {
          videoElement: videoEl
        });
      });
    },
    play() {
      if (!this.canInteract) return;
      if (textureMode === true) videoTexture.start();
      executeAsPromise(videoEl.play, null, videoEl).catch(e => {
        fireOnConsumer$1('error', {
          videoElement: videoEl,
          event: e
        });
      });
    },
    pause() {
      if (!this.canInteract) return;
      videoEl.pause();
    },
    playPause() {
      if (!this.canInteract) return;
      this.playing === true ? this.pause() : this.play();
    },
    mute() {
      let muted = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
      if (!this.canInteract) return;
      videoEl.muted = muted;
    },
    loop() {
      let looped = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
      videoEl.loop = looped;
    },
    seek(time) {
      if (!this.canInteract) return;
      if (!this.src) return;
      // define whether should continue to play after seek is complete (in seeked hook)
      if (state$1.playAfterSeek === null) {
        state$1.playAfterSeek = !!state$1.playing;
      }
      // pause before actually seeking
      this.pause();
      // currentTime always between 0 and the duration of the video (minus 0.1s to not set to the final frame and stall the video)
      videoEl.currentTime = Math.max(0, Math.min(time, this.duration - 0.1));
    },
    skip(seconds) {
      if (!this.canInteract) return;
      if (!this.src) return;
      state$1.skipTime = (state$1.skipTime || videoEl.currentTime) + seconds;
      easeExecution(() => {
        this.seek(state$1.skipTime);
        state$1.skipTime = false;
      }, 300);
    },
    show() {
      if (!this.canInteract) return;
      if (textureMode === true) {
        videoTexture.show();
      } else {
        videoEl.style.display = 'block';
        videoEl.style.visibility = 'visible';
      }
    },
    hide() {
      if (!this.canInteract) return;
      if (textureMode === true) {
        videoTexture.hide();
      } else {
        videoEl.style.display = 'none';
        videoEl.style.visibility = 'hidden';
      }
    },
    enableAds() {
      let enabled = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
      state$1.adsEnabled = enabled;
    },
    /* Public getters */
    get duration() {
      return videoEl && (isNaN(videoEl.duration) ? Infinity : videoEl.duration);
    },
    get currentTime() {
      return videoEl && videoEl.currentTime;
    },
    get muted() {
      return videoEl && videoEl.muted;
    },
    get looped() {
      return videoEl && videoEl.loop;
    },
    get src() {
      return videoEl && videoEl.getAttribute('src');
    },
    get playing() {
      return state$1.playing;
    },
    get playingAds() {
      return state$1.playingAds;
    },
    get canInteract() {
      // todo: perhaps add an extra flag wether we allow interactions (i.e. pauze, mute, etc.) during ad playback
      return state$1.playingAds === false;
    },
    get top() {
      return videoEl && parseFloat(videoEl.style.top);
    },
    get left() {
      return videoEl && parseFloat(videoEl.style.left);
    },
    get bottom() {
      return videoEl && parseFloat(videoEl.style.top - videoEl.style.height);
    },
    get right() {
      return videoEl && parseFloat(videoEl.style.left - videoEl.style.width);
    },
    get width() {
      return videoEl && parseFloat(videoEl.style.width);
    },
    get height() {
      return videoEl && parseFloat(videoEl.style.height);
    },
    get visible() {
      if (textureMode === true) {
        return videoTexture.isVisible;
      } else {
        return videoEl && videoEl.style.display === 'block';
      }
    },
    get adsEnabled() {
      return state$1.adsEnabled;
    },
    // prefixed with underscore to indicate 'semi-private'
    // because it's not recommended to interact directly with the video element
    get _videoEl() {
      return videoEl;
    },
    get _consumer() {
      return consumer$1;
    }
  };
  var VideoPlayer = autoSetupMixin(videoPlayerPlugin, () => {
    precision = ApplicationInstance && ApplicationInstance.stage && ApplicationInstance.stage.getRenderPrecision() || precision;
    videoEl = setupVideoTag();
    textureMode = Settings.get('platform', 'textureMode', false);
    if (textureMode === true) {
      videoEl.setAttribute('crossorigin', 'anonymous');
      videoTexture = setUpVideoTexture();
    }
  });

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
  let consumer;
  let getAds = () => {
    // todo: enable some default ads during development, maybe from the settings.json
    return Promise.resolve({
      prerolls: [],
      midrolls: [],
      postrolls: []
    });
  };
  const initAds = config => {
    if (config.getAds) {
      getAds = config.getAds;
    }
  };
  const state = {
    active: false
  };
  const playSlot = function () {
    let slot = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
    return slot.reduce((promise, ad) => {
      return promise.then(() => {
        return playAd(ad);
      });
    }, Promise.resolve(null));
  };
  const playAd = ad => {
    return new Promise(resolve => {
      if (state.active === false) {
        Log.info('Ad', 'Skipping add due to inactive state');
        return resolve();
      }
      // is it safe to rely on videoplayer plugin already created the video tag?
      const videoEl = document.getElementsByTagName('video')[0];
      videoEl.style.display = 'block';
      videoEl.style.visibility = 'visible';
      videoEl.src = mediaUrl(ad.url);
      videoEl.load();
      let timeEvents = null;
      let timeout;
      const cleanup = () => {
        // remove all listeners
        Object.keys(handlers).forEach(handler => videoEl.removeEventListener(handler, handlers[handler]));
        resolve();
      };
      const handlers = {
        play() {
          Log.info('Ad', 'Play ad', ad.url);
          fireOnConsumer('Play', ad);
          sendBeacon(ad.callbacks, 'defaultImpression');
        },
        ended() {
          fireOnConsumer('Ended', ad);
          sendBeacon(ad.callbacks, 'complete');
          cleanup();
        },
        timeupdate() {
          if (!timeEvents && videoEl.duration) {
            // calculate when to fire the time based events (now that duration is known)
            timeEvents = {
              firstQuartile: videoEl.duration / 4,
              midPoint: videoEl.duration / 2,
              thirdQuartile: videoEl.duration / 4 * 3
            };
            Log.info('Ad', 'Calculated quartiles times', {
              timeEvents
            });
          }
          if (timeEvents && timeEvents.firstQuartile && videoEl.currentTime >= timeEvents.firstQuartile) {
            fireOnConsumer('FirstQuartile', ad);
            delete timeEvents.firstQuartile;
            sendBeacon(ad.callbacks, 'firstQuartile');
          }
          if (timeEvents && timeEvents.midPoint && videoEl.currentTime >= timeEvents.midPoint) {
            fireOnConsumer('MidPoint', ad);
            delete timeEvents.midPoint;
            sendBeacon(ad.callbacks, 'midPoint');
          }
          if (timeEvents && timeEvents.thirdQuartile && videoEl.currentTime >= timeEvents.thirdQuartile) {
            fireOnConsumer('ThirdQuartile', ad);
            delete timeEvents.thirdQuartile;
            sendBeacon(ad.callbacks, 'thirdQuartile');
          }
        },
        stalled() {
          fireOnConsumer('Stalled', ad);
          timeout = setTimeout(() => {
            cleanup();
          }, 5000); // make timeout configurable
        },

        canplay() {
          timeout && clearTimeout(timeout);
        },
        error() {
          fireOnConsumer('Error', ad);
          cleanup();
        },
        // this doesn't work reliably on sky box, moved logic to timeUpdate event
        // loadedmetadata() {
        //   // calculate when to fire the time based events (now that duration is known)
        //   timeEvents = {
        //     firstQuartile: videoEl.duration / 4,
        //     midPoint: videoEl.duration / 2,
        //     thirdQuartile: (videoEl.duration / 4) * 3,
        //   }
        // },
        abort() {
          cleanup();
        }
        // todo: pause, resume, mute, unmute beacons
      };
      // add all listeners
      Object.keys(handlers).forEach(handler => videoEl.addEventListener(handler, handlers[handler]));
      videoEl.play();
    });
  };
  const sendBeacon = (callbacks, event) => {
    if (callbacks && callbacks[event]) {
      Log.info('Ad', 'Sending beacon', event, callbacks[event]);
      return callbacks[event].reduce((promise, url) => {
        return promise.then(() => fetch(url)
        // always resolve, also in case of a fetch error (so we don't block firing the rest of the beacons for this event)
        // note: for fetch failed http responses don't throw an Error :)
        .then(response => {
          if (response.status === 200) {
            fireOnConsumer('Beacon' + event + 'Sent');
          } else {
            fireOnConsumer('Beacon' + event + 'Failed' + response.status);
          }
          Promise.resolve(null);
        }).catch(() => {
          Promise.resolve(null);
        }));
      }, Promise.resolve(null));
    } else {
      Log.info('Ad', 'No callback found for ' + event);
    }
  };
  const fireOnConsumer = (event, args) => {
    if (consumer) {
      consumer.fire('$ad' + event, args);
      consumer.fire('$adEvent', event, args);
    }
  };
  var Ads = {
    get(config, videoPlayerConsumer) {
      if (config.enabled === false) {
        return Promise.resolve({
          prerolls() {
            return Promise.resolve();
          }
        });
      }
      consumer = videoPlayerConsumer;
      return new Promise(resolve => {
        Log.info('Ad', 'Starting session');
        getAds(config).then(ads => {
          Log.info('Ad', 'API result', ads);
          resolve({
            prerolls() {
              if (ads.preroll) {
                state.active = true;
                fireOnConsumer('PrerollSlotImpression', ads);
                sendBeacon(ads.preroll.callbacks, 'slotImpression');
                return playSlot(ads.preroll.ads).then(() => {
                  fireOnConsumer('PrerollSlotEnd', ads);
                  sendBeacon(ads.preroll.callbacks, 'slotEnd');
                  state.active = false;
                });
              }
              return Promise.resolve();
            },
            midrolls() {
              return Promise.resolve();
            },
            postrolls() {
              return Promise.resolve();
            }
          });
        });
      });
    },
    cancel() {
      Log.info('Ad', 'Cancel Ad');
      state.active = false;
    },
    stop() {
      Log.info('Ad', 'Stop Ad');
      state.active = false;
      // fixme: duplication
      const videoEl = document.getElementsByTagName('video')[0];
      videoEl.pause();
      videoEl.removeAttribute('src');
    }
  };

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
  class ScaledImageTexture extends Lightning.textures.ImageTexture {
    constructor(stage) {
      super(stage);
      this._scalingOptions = undefined;
    }
    set options(options) {
      this.resizeMode = this._scalingOptions = options;
    }
    _getLookupId() {
      return "".concat(this._src, "-").concat(this._scalingOptions.type, "-").concat(this._scalingOptions.w, "-").concat(this._scalingOptions.h);
    }
    getNonDefaults() {
      const obj = super.getNonDefaults();
      if (this._src) {
        obj.src = this._src;
      }
      return obj;
    }
  }

  class HomeButton extends Lightning.Component {
    static _template() {
      return {
        w: 400,
        h: 200,
        flexItem: {
          margin: 10
        },
        rect: true,
        color: 0xff1f1f1f,
        collision: true,
        forceZIndexContext: true,
        Label: {
          x: 75,
          y: 22,
          mount: .5,
          color: 0xffffffff,
          text: {
            fontSize: 25
          }
        },
        Icon: {
          x: 150,
          y: 75,
          src: '',
          w: 100,
          h: 100
        }
      };
    }
    _init() {
      this.tag('Label').patch({
        text: {
          text: this.buttonText
        }
      });
      this.tag('Icon').patch({
        src: Utils.asset(this.iconSrc)
      });
    }
    _focus() {
      this.color = 0xffffffff;
      this.tag('Label').color = 0xff1f1f1f;
    }
    _unfocus() {
      this.color = 0xff1f1f1f;
      this.tag('Label').color = 0xffffffff;
    }
    _handleEnter() {
      // Send a signal to the parent component to open the selected screen
      this.signal('enterScreen', this.screen);
    }
    _handleClick() {
      // Send a signal to the parent component to open the selected screen
      this.signal('enterScreen', this.screen);
    }
  }

  function _defineProperty(obj, key, value) {
    key = _toPropertyKey(key);
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }
    return obj;
  }
  function _toPrimitive(input, hint) {
    if (typeof input !== "object" || input === null) return input;
    var prim = input[Symbol.toPrimitive];
    if (prim !== undefined) {
      var res = prim.call(input, hint || "default");
      if (typeof res !== "object") return res;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return (hint === "string" ? String : Number)(input);
  }
  function _toPropertyKey(arg) {
    var key = _toPrimitive(arg, "string");
    return typeof key === "symbol" ? key : String(key);
  }

  class AssetListItem extends Lightning.Component {
    static _template() {
      return {
        w: 200,
        h: 250,
        alpha: 0.5,
        src: '',
        Label: {
          x: 2,
          y: 150,
          color: 0xffffffff,
          visible: false,
          texture: lng.Tools.getRoundRect(180, 100, 4),
          flex: {
            direction: 'column'
          },
          TitleText: {
            flexItem: {
              margin: 5,
              grow: 1
            },
            color: 0xff1f1f1f,
            text: {
              fontSize: 18,
              wordWrapWidth: 80,
              maxLines: 3
            }
          },
          LengthText: {
            flexItem: {
              margin: 5
            },
            color: 0xff1f1f1f,
            text: {
              fontSize: 15
            }
          }
        }
      };
    }
    _init() {
      this.src = Utils.asset(this.item.poster_path);
      this.tag('Label').patch({
        TitleText: {
          text: {
            text: this.item.title
          }
        }
      });
      this.tag('Label').patch({
        LengthText: {
          text: {
            text: this.item.duration
          }
        }
      });
    }
    _focus() {
      this.patch({
        smooth: {
          alpha: 1,
          scale: 1.2
        }
      });
      this.tag('Label').visible = true;
    }
    _unfocus() {
      this.patch({
        smooth: {
          alpha: 0.5,
          scale: 1
        }
      });
      this.tag('Label').visible = false;
    }
    _handleClick() {
      this.parent.emitPlayVideo();
    }
    _handleHover() {
      this.parent.index = this.index;
      this._refocus();
    }
  }

  class AssetList extends Lightning.Component {
    constructor() {
      super(...arguments);
      _defineProperty(this, "setItems", items => {
        this.children = items.map((item, index) => {
          return {
            flexItem: {
              margin: 10
            },
            ref: 'AssetItem-' + index,
            //optional, for debug purposes
            type: AssetListItem,
            collision: true,
            forceZIndexContext: true,
            // x: index * 150, //item width + 20px margin
            item,
            //passing the item as an attribute
            index //passing the index
          };
        });
      });
    }
    static _template() {
      return {
        w: 1200,
        flex: {
          direction: 'row',
          padding: 20,
          wrap: true
        },
        rect: true,
        color: 0xFF2D2D2D,
        paddingLeft: 200
      };
    }
    _init() {
      this.index = 0;
      // Fetch data based on the current screen
      if (this.screen == 'TvScreenWrapper') {
        this.url = 'data/tv.json';
      } else if (this.screen == 'MoviesScreenWrapper') {
        this.url = 'data/movies.json';
      } else if (this.screen == 'SportsScreenWrapper') {
        this.url = 'data/sports.json';
      }
      // 
      fetch(Utils.asset(this.url)).then(response => response.json()).then(data => this.setItems(data.results)).catch(() => {
        ///Exception occured do something
      });
    }
    emitPlayVideo() {
      // Send a signal to the parent component to play video
      this.signal('playVideo', this.screen);
    }
    _getFocused() {
      return this.children[this.index];
    }
    _handleLeft() {
      if (this.index > 0) {
        this.index--;
      }
    }
    _handleRight() {
      // we don't know exactly how many items the list can have
      // so we test it based on this component's child list
      if (this.index < this.children.length - 1) {
        this.index++;
      }
    }
    _handleUp() {
      if (this.index - 4 > 0) {
        this.index = this.index - 5;
      }
    }
    _handleDown() {
      // we don't know exactly how many items the list can have
      // so we test it based on this component's child list
      if (this.index + 5 < this.children.length) {
        this.index = this.index + 5;
      }
    }
    _handleEsc() {
      // Send a signal to the parent component to exit the current screen
      this.signal('exitScreen', this.screen);
    }
    _handleEnter() {
      this.emitPlayVideo();
    }
  }

  var shakaPlayer_compiled = {};

  /*
   @license
   Shaka Player
   Copyright 2016 Google LLC
   SPDX-License-Identifier: Apache-2.0
  */
  (function (exports) {
    (function () {
      var innerGlobal = typeof window != "undefined" ? window : commonjsGlobal;
      var exportTo = {};
      (function (window, global, module) {
        /*
        @license
        Shaka Player
        Copyright 2016 Google LLC
        SPDX-License-Identifier: Apache-2.0
        */
        /*
        
         Copyright The Closure Library Authors.
         SPDX-License-Identifier: Apache-2.0
        */
        var r;
        function aa(a) {
          var b = 0;
          return function () {
            return b < a.length ? {
              done: !1,
              value: a[b++]
            } : {
              done: !0
            };
          };
        }
        var ca = "function" == typeof Object.defineProperties ? Object.defineProperty : function (a, b, c) {
          if (a == Array.prototype || a == Object.prototype) return a;
          a[b] = c.value;
          return a;
        };
        function da(a) {
          a = ["object" == typeof globalThis && globalThis, a, "object" == typeof window && window, "object" == typeof self && self, "object" == typeof global && global];
          for (var b = 0; b < a.length; ++b) {
            var c = a[b];
            if (c && c.Math == Math) return c;
          }
          throw Error("Cannot find global object");
        }
        var ea = da(this);
        function fa(a, b) {
          if (b) a: {
            var c = ea;
            a = a.split(".");
            for (var d = 0; d < a.length - 1; d++) {
              var e = a[d];
              if (!(e in c)) break a;
              c = c[e];
            }
            a = a[a.length - 1];
            d = c[a];
            b = b(d);
            b != d && null != b && ca(c, a, {
              configurable: !0,
              writable: !0,
              value: b
            });
          }
        }
        fa("Symbol", function (a) {
          function b(f) {
            if (this instanceof b) throw new TypeError("Symbol is not a constructor");
            return new c(d + (f || "") + "_" + e++, f);
          }
          function c(f, g) {
            this.g = f;
            ca(this, "description", {
              configurable: !0,
              writable: !0,
              value: g
            });
          }
          if (a) return a;
          c.prototype.toString = function () {
            return this.g;
          };
          var d = "jscomp_symbol_" + (1E9 * Math.random() >>> 0) + "_",
            e = 0;
          return b;
        });
        fa("Symbol.iterator", function (a) {
          if (a) return a;
          a = Symbol("Symbol.iterator");
          for (var b = "Array Int8Array Uint8Array Uint8ClampedArray Int16Array Uint16Array Int32Array Uint32Array Float32Array Float64Array".split(" "), c = 0; c < b.length; c++) {
            var d = ea[b[c]];
            "function" === typeof d && "function" != typeof d.prototype[a] && ca(d.prototype, a, {
              configurable: !0,
              writable: !0,
              value: function () {
                return ha(aa(this));
              }
            });
          }
          return a;
        });
        function ha(a) {
          a = {
            next: a
          };
          a[Symbol.iterator] = function () {
            return this;
          };
          return a;
        }
        function t(a) {
          var b = "undefined" != typeof Symbol && Symbol.iterator && a[Symbol.iterator];
          return b ? b.call(a) : {
            next: aa(a)
          };
        }
        function ia(a) {
          if (!(a instanceof Array)) {
            a = t(a);
            for (var b, c = []; !(b = a.next()).done;) c.push(b.value);
            a = c;
          }
          return a;
        }
        var ja = "function" == typeof Object.create ? Object.create : function (a) {
            function b() {}
            b.prototype = a;
            return new b();
          },
          la;
        if ("function" == typeof Object.setPrototypeOf) la = Object.setPrototypeOf;else {
          var ma;
          a: {
            var na = {
                a: !0
              },
              oa = {};
            try {
              oa.__proto__ = na;
              ma = oa.a;
              break a;
            } catch (a) {}
            ma = !1;
          }
          la = ma ? function (a, b) {
            a.__proto__ = b;
            if (a.__proto__ !== b) throw new TypeError(a + " is not extensible");
            return a;
          } : null;
        }
        var pa = la;
        function qa(a, b) {
          a.prototype = ja(b.prototype);
          a.prototype.constructor = a;
          if (pa) pa(a, b);else for (var c in b) if ("prototype" != c) if (Object.defineProperties) {
            var d = Object.getOwnPropertyDescriptor(b, c);
            d && Object.defineProperty(a, c, d);
          } else a[c] = b[c];
          a.zh = b.prototype;
        }
        function ra() {
          this.o = !1;
          this.l = null;
          this.h = void 0;
          this.g = 1;
          this.j = this.m = 0;
          this.u = this.i = null;
        }
        function sa(a) {
          if (a.o) throw new TypeError("Generator is already running");
          a.o = !0;
        }
        ra.prototype.s = function (a) {
          this.h = a;
        };
        function ta(a, b) {
          a.i = {
            Fe: b,
            Me: !0
          };
          a.g = a.m || a.j;
        }
        ra.prototype.return = function (a) {
          this.i = {
            return: a
          };
          this.g = this.j;
        };
        function u(a, b, c) {
          a.g = c;
          return {
            value: b
          };
        }
        ra.prototype.B = function (a) {
          this.g = a;
        };
        function A(a) {
          a.g = 0;
        }
        function C(a, b, c) {
          a.m = b;
          void 0 != c && (a.j = c);
        }
        function ua(a) {
          a.m = 0;
          a.j = 2;
        }
        function va(a, b) {
          a.g = b;
          a.m = 0;
        }
        function wa(a) {
          a.m = 0;
          var b = a.i.Fe;
          a.i = null;
          return b;
        }
        function ya(a) {
          a.u = [a.i];
          a.m = 0;
          a.j = 0;
        }
        function za(a, b) {
          var c = a.u.splice(0)[0];
          (c = a.i = a.i || c) ? c.Me ? a.g = a.m || a.j : void 0 != c.B && a.j < c.B ? (a.g = c.B, a.i = null) : a.g = a.j : a.g = b;
        }
        function Aa(a) {
          this.g = new ra();
          this.h = a;
        }
        function Ba(a, b) {
          sa(a.g);
          var c = a.g.l;
          if (c) return Ca(a, "return" in c ? c["return"] : function (d) {
            return {
              value: d,
              done: !0
            };
          }, b, a.g.return);
          a.g.return(b);
          return Da(a);
        }
        function Ca(a, b, c, d) {
          try {
            var e = b.call(a.g.l, c);
            if (!(e instanceof Object)) throw new TypeError("Iterator result " + e + " is not an object");
            if (!e.done) return a.g.o = !1, e;
            var f = e.value;
          } catch (g) {
            return a.g.l = null, ta(a.g, g), Da(a);
          }
          a.g.l = null;
          d.call(a.g, f);
          return Da(a);
        }
        function Da(a) {
          for (; a.g.g;) try {
            var b = a.h(a.g);
            if (b) return a.g.o = !1, {
              value: b.value,
              done: !1
            };
          } catch (c) {
            a.g.h = void 0, ta(a.g, c);
          }
          a.g.o = !1;
          if (a.g.i) {
            b = a.g.i;
            a.g.i = null;
            if (b.Me) throw b.Fe;
            return {
              value: b.return,
              done: !0
            };
          }
          return {
            value: void 0,
            done: !0
          };
        }
        function Ea(a) {
          this.next = function (b) {
            sa(a.g);
            a.g.l ? b = Ca(a, a.g.l.next, b, a.g.s) : (a.g.s(b), b = Da(a));
            return b;
          };
          this.throw = function (b) {
            sa(a.g);
            a.g.l ? b = Ca(a, a.g.l["throw"], b, a.g.s) : (ta(a.g, b), b = Da(a));
            return b;
          };
          this.return = function (b) {
            return Ba(a, b);
          };
          this[Symbol.iterator] = function () {
            return this;
          };
        }
        function Ga(a) {
          function b(d) {
            return a.next(d);
          }
          function c(d) {
            return a.throw(d);
          }
          return new Promise(function (d, e) {
            function f(g) {
              g.done ? d(g.value) : Promise.resolve(g.value).then(b, c).then(f, e);
            }
            f(a.next());
          });
        }
        function G(a) {
          return Ga(new Ea(new Aa(a)));
        }
        function Ia() {
          for (var a = Number(this), b = [], c = a; c < arguments.length; c++) b[c - a] = arguments[c];
          return b;
        }
        fa("Promise", function (a) {
          function b(g) {
            this.h = 0;
            this.i = void 0;
            this.g = [];
            this.o = !1;
            var h = this.j();
            try {
              g(h.resolve, h.reject);
            } catch (k) {
              h.reject(k);
            }
          }
          function c() {
            this.g = null;
          }
          function d(g) {
            return g instanceof b ? g : new b(function (h) {
              h(g);
            });
          }
          if (a) return a;
          c.prototype.h = function (g) {
            if (null == this.g) {
              this.g = [];
              var h = this;
              this.i(function () {
                h.l();
              });
            }
            this.g.push(g);
          };
          var e = ea.setTimeout;
          c.prototype.i = function (g) {
            e(g, 0);
          };
          c.prototype.l = function () {
            for (; this.g && this.g.length;) {
              var g = this.g;
              this.g = [];
              for (var h = 0; h < g.length; ++h) {
                var k = g[h];
                g[h] = null;
                try {
                  k();
                } catch (l) {
                  this.j(l);
                }
              }
            }
            this.g = null;
          };
          c.prototype.j = function (g) {
            this.i(function () {
              throw g;
            });
          };
          b.prototype.j = function () {
            function g(l) {
              return function (m) {
                k || (k = !0, l.call(h, m));
              };
            }
            var h = this,
              k = !1;
            return {
              resolve: g(this.F),
              reject: g(this.l)
            };
          };
          b.prototype.F = function (g) {
            if (g === this) this.l(new TypeError("A Promise cannot resolve to itself"));else if (g instanceof b) this.H(g);else {
              a: switch (typeof g) {
                case "object":
                  var h = null != g;
                  break a;
                case "function":
                  h = !0;
                  break a;
                default:
                  h = !1;
              }
              h ? this.D(g) : this.m(g);
            }
          };
          b.prototype.D = function (g) {
            var h = void 0;
            try {
              h = g.then;
            } catch (k) {
              this.l(k);
              return;
            }
            "function" == typeof h ? this.J(h, g) : this.m(g);
          };
          b.prototype.l = function (g) {
            this.s(2, g);
          };
          b.prototype.m = function (g) {
            this.s(1, g);
          };
          b.prototype.s = function (g, h) {
            if (0 != this.h) throw Error("Cannot settle(" + g + ", " + h + "): Promise already settled in state" + this.h);
            this.h = g;
            this.i = h;
            2 === this.h && this.G();
            this.u();
          };
          b.prototype.G = function () {
            var g = this;
            e(function () {
              if (g.A()) {
                var h = ea.console;
                "undefined" !== typeof h && h.error(g.i);
              }
            }, 1);
          };
          b.prototype.A = function () {
            if (this.o) return !1;
            var g = ea.CustomEvent,
              h = ea.Event,
              k = ea.dispatchEvent;
            if ("undefined" === typeof k) return !0;
            "function" === typeof g ? g = new g("unhandledrejection", {
              cancelable: !0
            }) : "function" === typeof h ? g = new h("unhandledrejection", {
              cancelable: !0
            }) : (g = ea.document.createEvent("CustomEvent"), g.initCustomEvent("unhandledrejection", !1, !0, g));
            g.promise = this;
            g.reason = this.i;
            return k(g);
          };
          b.prototype.u = function () {
            if (null != this.g) {
              for (var g = 0; g < this.g.length; ++g) f.h(this.g[g]);
              this.g = null;
            }
          };
          var f = new c();
          b.prototype.H = function (g) {
            var h = this.j();
            g.Mc(h.resolve, h.reject);
          };
          b.prototype.J = function (g, h) {
            var k = this.j();
            try {
              g.call(h, k.resolve, k.reject);
            } catch (l) {
              k.reject(l);
            }
          };
          b.prototype.then = function (g, h) {
            function k(n, q) {
              return "function" == typeof n ? function (v) {
                try {
                  l(n(v));
                } catch (y) {
                  m(y);
                }
              } : q;
            }
            var l,
              m,
              p = new b(function (n, q) {
                l = n;
                m = q;
              });
            this.Mc(k(g, l), k(h, m));
            return p;
          };
          b.prototype.catch = function (g) {
            return this.then(void 0, g);
          };
          b.prototype.Mc = function (g, h) {
            function k() {
              switch (l.h) {
                case 1:
                  g(l.i);
                  break;
                case 2:
                  h(l.i);
                  break;
                default:
                  throw Error("Unexpected state: " + l.h);
              }
            }
            var l = this;
            null == this.g ? f.h(k) : this.g.push(k);
            this.o = !0;
          };
          b.resolve = d;
          b.reject = function (g) {
            return new b(function (h, k) {
              k(g);
            });
          };
          b.race = function (g) {
            return new b(function (h, k) {
              for (var l = t(g), m = l.next(); !m.done; m = l.next()) d(m.value).Mc(h, k);
            });
          };
          b.all = function (g) {
            var h = t(g),
              k = h.next();
            return k.done ? d([]) : new b(function (l, m) {
              function p(v) {
                return function (y) {
                  n[v] = y;
                  q--;
                  0 == q && l(n);
                };
              }
              var n = [],
                q = 0;
              do n.push(void 0), q++, d(k.value).Mc(p(n.length - 1), m), k = h.next(); while (!k.done);
            });
          };
          return b;
        });
        function Ja(a, b) {
          return Object.prototype.hasOwnProperty.call(a, b);
        }
        fa("WeakMap", function (a) {
          function b(k) {
            this.g = (h += Math.random() + 1).toString();
            if (k) {
              k = t(k);
              for (var l; !(l = k.next()).done;) l = l.value, this.set(l[0], l[1]);
            }
          }
          function c() {}
          function d(k) {
            var l = typeof k;
            return "object" === l && null !== k || "function" === l;
          }
          function e(k) {
            if (!Ja(k, g)) {
              var l = new c();
              ca(k, g, {
                value: l
              });
            }
          }
          function f(k) {
            var l = Object[k];
            l && (Object[k] = function (m) {
              if (m instanceof c) return m;
              Object.isExtensible(m) && e(m);
              return l(m);
            });
          }
          if (function () {
            if (!a || !Object.seal) return !1;
            try {
              var k = Object.seal({}),
                l = Object.seal({}),
                m = new a([[k, 2], [l, 3]]);
              if (2 != m.get(k) || 3 != m.get(l)) return !1;
              m.delete(k);
              m.set(l, 4);
              return !m.has(k) && 4 == m.get(l);
            } catch (p) {
              return !1;
            }
          }()) return a;
          var g = "$jscomp_hidden_" + Math.random();
          f("freeze");
          f("preventExtensions");
          f("seal");
          var h = 0;
          b.prototype.set = function (k, l) {
            if (!d(k)) throw Error("Invalid WeakMap key");
            e(k);
            if (!Ja(k, g)) throw Error("WeakMap key fail: " + k);
            k[g][this.g] = l;
            return this;
          };
          b.prototype.get = function (k) {
            return d(k) && Ja(k, g) ? k[g][this.g] : void 0;
          };
          b.prototype.has = function (k) {
            return d(k) && Ja(k, g) && Ja(k[g], this.g);
          };
          b.prototype.delete = function (k) {
            return d(k) && Ja(k, g) && Ja(k[g], this.g) ? delete k[g][this.g] : !1;
          };
          return b;
        });
        fa("Map", function (a) {
          function b() {
            var h = {};
            return h.Qa = h.next = h.head = h;
          }
          function c(h, k) {
            var l = h.g;
            return ha(function () {
              if (l) {
                for (; l.head != h.g;) l = l.Qa;
                for (; l.next != l.head;) return l = l.next, {
                  done: !1,
                  value: k(l)
                };
                l = null;
              }
              return {
                done: !0,
                value: void 0
              };
            });
          }
          function d(h, k) {
            var l = k && typeof k;
            "object" == l || "function" == l ? f.has(k) ? l = f.get(k) : (l = "" + ++g, f.set(k, l)) : l = "p_" + k;
            var m = h.h[l];
            if (m && Ja(h.h, l)) for (h = 0; h < m.length; h++) {
              var p = m[h];
              if (k !== k && p.key !== p.key || k === p.key) return {
                id: l,
                list: m,
                index: h,
                ga: p
              };
            }
            return {
              id: l,
              list: m,
              index: -1,
              ga: void 0
            };
          }
          function e(h) {
            this.h = {};
            this.g = b();
            this.size = 0;
            if (h) {
              h = t(h);
              for (var k; !(k = h.next()).done;) k = k.value, this.set(k[0], k[1]);
            }
          }
          if (function () {
            if (!a || "function" != typeof a || !a.prototype.entries || "function" != typeof Object.seal) return !1;
            try {
              var h = Object.seal({
                  x: 4
                }),
                k = new a(t([[h, "s"]]));
              if ("s" != k.get(h) || 1 != k.size || k.get({
                x: 4
              }) || k.set({
                x: 4
              }, "t") != k || 2 != k.size) return !1;
              var l = k.entries(),
                m = l.next();
              if (m.done || m.value[0] != h || "s" != m.value[1]) return !1;
              m = l.next();
              return m.done || 4 != m.value[0].x || "t" != m.value[1] || !l.next().done ? !1 : !0;
            } catch (p) {
              return !1;
            }
          }()) return a;
          var f = new WeakMap();
          e.prototype.set = function (h, k) {
            h = 0 === h ? 0 : h;
            var l = d(this, h);
            l.list || (l.list = this.h[l.id] = []);
            l.ga ? l.ga.value = k : (l.ga = {
              next: this.g,
              Qa: this.g.Qa,
              head: this.g,
              key: h,
              value: k
            }, l.list.push(l.ga), this.g.Qa.next = l.ga, this.g.Qa = l.ga, this.size++);
            return this;
          };
          e.prototype.delete = function (h) {
            h = d(this, h);
            return h.ga && h.list ? (h.list.splice(h.index, 1), h.list.length || delete this.h[h.id], h.ga.Qa.next = h.ga.next, h.ga.next.Qa = h.ga.Qa, h.ga.head = null, this.size--, !0) : !1;
          };
          e.prototype.clear = function () {
            this.h = {};
            this.g = this.g.Qa = b();
            this.size = 0;
          };
          e.prototype.has = function (h) {
            return !!d(this, h).ga;
          };
          e.prototype.get = function (h) {
            return (h = d(this, h).ga) && h.value;
          };
          e.prototype.entries = function () {
            return c(this, function (h) {
              return [h.key, h.value];
            });
          };
          e.prototype.keys = function () {
            return c(this, function (h) {
              return h.key;
            });
          };
          e.prototype.values = function () {
            return c(this, function (h) {
              return h.value;
            });
          };
          e.prototype.forEach = function (h, k) {
            for (var l = this.entries(), m; !(m = l.next()).done;) m = m.value, h.call(k, m[1], m[0], this);
          };
          e.prototype[Symbol.iterator] = e.prototype.entries;
          var g = 0;
          return e;
        });
        fa("Set", function (a) {
          function b(c) {
            this.g = new Map();
            if (c) {
              c = t(c);
              for (var d; !(d = c.next()).done;) this.add(d.value);
            }
            this.size = this.g.size;
          }
          if (function () {
            if (!a || "function" != typeof a || !a.prototype.entries || "function" != typeof Object.seal) return !1;
            try {
              var c = Object.seal({
                  x: 4
                }),
                d = new a(t([c]));
              if (!d.has(c) || 1 != d.size || d.add(c) != d || 1 != d.size || d.add({
                x: 4
              }) != d || 2 != d.size) return !1;
              var e = d.entries(),
                f = e.next();
              if (f.done || f.value[0] != c || f.value[1] != c) return !1;
              f = e.next();
              return f.done || f.value[0] == c || 4 != f.value[0].x || f.value[1] != f.value[0] ? !1 : e.next().done;
            } catch (g) {
              return !1;
            }
          }()) return a;
          b.prototype.add = function (c) {
            c = 0 === c ? 0 : c;
            this.g.set(c, c);
            this.size = this.g.size;
            return this;
          };
          b.prototype.delete = function (c) {
            c = this.g.delete(c);
            this.size = this.g.size;
            return c;
          };
          b.prototype.clear = function () {
            this.g.clear();
            this.size = 0;
          };
          b.prototype.has = function (c) {
            return this.g.has(c);
          };
          b.prototype.entries = function () {
            return this.g.entries();
          };
          b.prototype.values = function () {
            return this.g.values();
          };
          b.prototype.keys = b.prototype.values;
          b.prototype[Symbol.iterator] = b.prototype.values;
          b.prototype.forEach = function (c, d) {
            var e = this;
            this.g.forEach(function (f) {
              return c.call(d, f, f, e);
            });
          };
          return b;
        });
        function La(a, b, c) {
          a instanceof String && (a = String(a));
          for (var d = a.length, e = 0; e < d; e++) {
            var f = a[e];
            if (b.call(c, f, e, a)) return {
              Ke: e,
              v: f
            };
          }
          return {
            Ke: -1,
            v: void 0
          };
        }
        fa("Array.prototype.findIndex", function (a) {
          return a ? a : function (b, c) {
            return La(this, b, c).Ke;
          };
        });
        fa("Object.is", function (a) {
          return a ? a : function (b, c) {
            return b === c ? 0 !== b || 1 / b === 1 / c : b !== b && c !== c;
          };
        });
        fa("Array.prototype.includes", function (a) {
          return a ? a : function (b, c) {
            var d = this;
            d instanceof String && (d = String(d));
            var e = d.length;
            c = c || 0;
            for (0 > c && (c = Math.max(c + e, 0)); c < e; c++) {
              var f = d[c];
              if (f === b || Object.is(f, b)) return !0;
            }
            return !1;
          };
        });
        function Ma(a, b, c) {
          if (null == a) throw new TypeError("The 'this' value for String.prototype." + c + " must not be null or undefined");
          if (b instanceof RegExp) throw new TypeError("First argument to String.prototype." + c + " must not be a regular expression");
          return a + "";
        }
        fa("String.prototype.includes", function (a) {
          return a ? a : function (b, c) {
            return -1 !== Ma(this, b, "includes").indexOf(b, c || 0);
          };
        });
        fa("Array.prototype.find", function (a) {
          return a ? a : function (b, c) {
            return La(this, b, c).v;
          };
        });
        fa("String.prototype.startsWith", function (a) {
          return a ? a : function (b, c) {
            var d = Ma(this, b, "startsWith"),
              e = d.length,
              f = b.length;
            c = Math.max(0, Math.min(c | 0, d.length));
            for (var g = 0; g < f && c < e;) if (d[c++] != b[g++]) return !1;
            return g >= f;
          };
        });
        function Oa(a, b) {
          a instanceof String && (a += "");
          var c = 0,
            d = !1,
            e = {
              next: function () {
                if (!d && c < a.length) {
                  var f = c++;
                  return {
                    value: b(f, a[f]),
                    done: !1
                  };
                }
                d = !0;
                return {
                  done: !0,
                  value: void 0
                };
              }
            };
          e[Symbol.iterator] = function () {
            return e;
          };
          return e;
        }
        fa("Array.prototype.keys", function (a) {
          return a ? a : function () {
            return Oa(this, function (b) {
              return b;
            });
          };
        });
        var Pa = "function" == typeof Object.assign ? Object.assign : function (a, b) {
          for (var c = 1; c < arguments.length; c++) {
            var d = arguments[c];
            if (d) for (var e in d) Ja(d, e) && (a[e] = d[e]);
          }
          return a;
        };
        fa("Object.assign", function (a) {
          return a || Pa;
        });
        fa("Array.from", function (a) {
          return a ? a : function (b, c, d) {
            c = null != c ? c : function (h) {
              return h;
            };
            var e = [],
              f = "undefined" != typeof Symbol && Symbol.iterator && b[Symbol.iterator];
            if ("function" == typeof f) {
              b = f.call(b);
              for (var g = 0; !(f = b.next()).done;) e.push(c.call(d, f.value, g++));
            } else for (f = b.length, g = 0; g < f; g++) e.push(c.call(d, b[g], g));
            return e;
          };
        });
        fa("Array.prototype.values", function (a) {
          return a ? a : function () {
            return Oa(this, function (b, c) {
              return c;
            });
          };
        });
        fa("Promise.prototype.finally", function (a) {
          return a ? a : function (b) {
            return this.then(function (c) {
              return Promise.resolve(b()).then(function () {
                return c;
              });
            }, function (c) {
              return Promise.resolve(b()).then(function () {
                throw c;
              });
            });
          };
        });
        fa("Array.prototype.entries", function (a) {
          return a ? a : function () {
            return Oa(this, function (b, c) {
              return [b, c];
            });
          };
        });
        fa("String.prototype.repeat", function (a) {
          return a ? a : function (b) {
            var c = Ma(this, null, "repeat");
            if (0 > b || 1342177279 < b) throw new RangeError("Invalid count value");
            b |= 0;
            for (var d = ""; b;) if (b & 1 && (d += c), b >>>= 1) c += c;
            return d;
          };
        });
        fa("Number.isNaN", function (a) {
          return a ? a : function (b) {
            return "number" === typeof b && isNaN(b);
          };
        });
        fa("Object.values", function (a) {
          return a ? a : function (b) {
            var c = [],
              d;
            for (d in b) Ja(b, d) && c.push(b[d]);
            return c;
          };
        });
        fa("Math.log2", function (a) {
          return a ? a : function (b) {
            return Math.log(b) / Math.LN2;
          };
        });
        fa("Math.trunc", function (a) {
          return a ? a : function (b) {
            b = Number(b);
            if (isNaN(b) || Infinity === b || -Infinity === b || 0 === b) return b;
            var c = Math.floor(Math.abs(b));
            return 0 > b ? -c : c;
          };
        });
        fa("Object.entries", function (a) {
          return a ? a : function (b) {
            var c = [],
              d;
            for (d in b) Ja(b, d) && c.push([d, b[d]]);
            return c;
          };
        });
        var Qa = this || self;
        function K(a, b) {
          a = a.split(".");
          var c = Qa;
          a[0] in c || "undefined" == typeof c.execScript || c.execScript("var " + a[0]);
          for (var d; a.length && (d = a.shift());) a.length || void 0 === b ? c[d] && c[d] !== Object.prototype[d] ? c = c[d] : c = c[d] = {} : c[d] = b;
        }
        function Ra(a) {
          this.g = Math.exp(Math.log(.5) / a);
          this.i = this.h = 0;
        }
        Ra.prototype.sample = function (a, b) {
          var c = Math.pow(this.g, a);
          b = b * (1 - c) + c * this.h;
          isNaN(b) || (this.h = b, this.i += a);
        };
        function Sa(a) {
          return a.h / (1 - Math.pow(a.g, a.i));
        }
        function Ta() {
          this.h = new Ra(2);
          this.j = new Ra(5);
          this.g = 0;
          this.i = 128E3;
          this.l = 16E3;
        }
        Ta.prototype.configure = function (a) {
          this.i = a.minTotalBytes;
          this.l = a.minBytes;
          this.h.g = Math.exp(Math.log(.5) / a.fastHalfLife);
          this.j.g = Math.exp(Math.log(.5) / a.slowHalfLife);
        };
        Ta.prototype.sample = function (a, b) {
          if (!(b < this.l)) {
            var c = 8E3 * b / a;
            a /= 1E3;
            this.g += b;
            this.h.sample(a, c);
            this.j.sample(a, c);
          }
        };
        Ta.prototype.getBandwidthEstimate = function (a) {
          return this.g < this.i ? a : Math.min(Sa(this.h), Sa(this.j));
        };
        function Va() {}
        function Wa() {}
        function Xa() {}
        function Ya(a) {
          var b = Ia.apply(1, arguments);
          Za.has(a) || (Za.add(a), Xa.apply(Va, ia(b)));
        }
        function $a() {}
        function ab() {}
        function bb() {}
        function cb() {}
        var Za = new Set();
        window.console && (Xa = function () {
          return console.warn.apply(console, ia(Ia.apply(0, arguments)));
        }, Wa = function () {
          console.error.apply(console, ia(Ia.apply(0, arguments)));
        });
        function db(a) {
          if (eb.has(a)) return eb.get(a);
          var b = MediaSource.isTypeSupported(a);
          eb.set(a, b);
          return b;
        }
        var eb = new Map();
        function fb(a, b) {
          return "number" === typeof a && "number" === typeof b && isNaN(a) && isNaN(b) ? !0 : a === b;
        }
        function gb(a, b) {
          b = a.indexOf(b);
          -1 < b && a.splice(b, 1);
        }
        function hb(a, b, c) {
          c || (c = fb);
          if (a.length != b.length) return !1;
          b = b.slice();
          var d = {};
          a = t(a);
          for (var e = a.next(); !e.done; d = {
            od: d.od
          }, e = a.next()) {
            d.od = e.value;
            e = b.findIndex(function (f) {
              return function (g) {
                return c(f.od, g);
              };
            }(d));
            if (-1 == e) return !1;
            b[e] = b[b.length - 1];
            b.pop();
          }
          return 0 == b.length;
        }
        function ib(a, b, c) {
          c || (c = fb);
          if (a.length != b.length) return !1;
          for (var d = 0; d < a.length; d++) if (!c(a[d], b[d])) return !1;
          return !0;
        }
        function jb(a, b, c) {
          this.startTime = a;
          this.direction = kb;
          this.endTime = b;
          this.payload = c;
          this.region = new lb();
          this.position = null;
          this.positionAlign = mb;
          this.size = 0;
          this.textAlign = nb;
          this.writingMode = ob;
          this.lineInterpretation = qb;
          this.line = null;
          this.lineHeight = "";
          this.lineAlign = rb;
          this.displayAlign = sb;
          this.fontSize = this.textStrokeWidth = this.textStrokeColor = this.textShadow = this.border = this.backgroundImage = this.backgroundColor = this.color = "";
          this.fontWeight = tb;
          this.fontStyle = ub;
          this.linePadding = this.letterSpacing = this.fontFamily = "";
          this.opacity = 1;
          this.textDecoration = [];
          this.wrapLine = !0;
          this.id = "";
          this.nestedCues = [];
          this.lineBreak = this.isContainer = !1;
          this.cellResolution = {
            columns: 32,
            rows: 15
          };
        }
        jb.prototype.clone = function () {
          var a = new jb(0, 0, ""),
            b;
          for (b in this) a[b] = this[b], a[b] && a[b].constructor == Array && (a[b] = a[b].slice());
          return a;
        };
        function vb(a, b) {
          if (a.startTime != b.startTime || a.endTime != b.endTime || a.payload != b.payload) return !1;
          for (var c in a) if ("startTime" != c && "endTime" != c && "payload" != c) if ("nestedCues" == c) {
            if (!ib(a.nestedCues, b.nestedCues, vb)) return !1;
          } else if ("region" == c || "cellResolution" == c) for (var d in a[c]) {
            if (a[c][d] != b[c][d]) return !1;
          } else if (Array.isArray(a[c])) {
            if (!ib(a[c], b[c])) return !1;
          } else if (a[c] != b[c]) return !1;
          return !0;
        }
        K("shaka.text.Cue", jb);
        var mb = "auto";
        jb.positionAlign = {
          LEFT: "line-left",
          RIGHT: "line-right",
          CENTER: "center",
          AUTO: mb
        };
        var nb = "center",
          wb = {
            LEFT: "left",
            RIGHT: "right",
            CENTER: nb,
            START: "start",
            END: "end"
          };
        jb.textAlign = wb;
        var sb = "after",
          xb = {
            BEFORE: "before",
            CENTER: "center",
            AFTER: sb
          };
        jb.displayAlign = xb;
        var kb = "ltr";
        jb.direction = {
          HORIZONTAL_LEFT_TO_RIGHT: kb,
          HORIZONTAL_RIGHT_TO_LEFT: "rtl"
        };
        var ob = "horizontal-tb";
        jb.writingMode = {
          HORIZONTAL_TOP_TO_BOTTOM: ob,
          VERTICAL_LEFT_TO_RIGHT: "vertical-lr",
          VERTICAL_RIGHT_TO_LEFT: "vertical-rl"
        };
        var qb = 0;
        jb.lineInterpretation = {
          LINE_NUMBER: qb,
          PERCENTAGE: 1
        };
        var rb = "start",
          yb = {
            CENTER: "center",
            START: rb,
            END: "end"
          };
        jb.lineAlign = yb;
        var zb = {
          white: "#FFF",
          lime: "#0F0",
          cyan: "#0FF",
          red: "#F00",
          yellow: "#FF0",
          magenta: "#F0F",
          blue: "#00F",
          black: "#000"
        };
        jb.defaultTextColor = zb;
        var Ab = {
          bg_white: "#FFF",
          bg_lime: "#0F0",
          bg_cyan: "#0FF",
          bg_red: "#F00",
          bg_yellow: "#FF0",
          bg_magenta: "#F0F",
          bg_blue: "#00F",
          bg_black: "#000"
        };
        jb.defaultTextBackgroundColor = Ab;
        var tb = 400;
        jb.fontWeight = {
          NORMAL: tb,
          BOLD: 700
        };
        var ub = "normal",
          Bb = {
            NORMAL: ub,
            ITALIC: "italic",
            OBLIQUE: "oblique"
          };
        jb.fontStyle = Bb;
        jb.textDecoration = {
          UNDERLINE: "underline",
          LINE_THROUGH: "lineThrough",
          OVERLINE: "overline"
        };
        function lb() {
          this.id = "";
          this.regionAnchorY = this.regionAnchorX = this.viewportAnchorY = this.viewportAnchorX = 0;
          this.height = this.width = 100;
          this.viewportAnchorUnits = this.widthUnits = this.heightUnits = Cb;
          this.scroll = Db;
        }
        K("shaka.text.CueRegion", lb);
        var Cb = 1;
        lb.units = {
          PX: 0,
          PERCENTAGE: Cb,
          LINES: 2
        };
        var Db = "";
        lb.scrollMode = {
          NONE: Db,
          UP: "up"
        };
        function Eb() {}
        function Fb(a, b) {
          if (!a && !b) return !0;
          if (!a || !b || a.byteLength != b.byteLength) return !1;
          if (Gb(a) == Gb(b) && (a.byteOffset || 0) == (b.byteOffset || 0)) return !0;
          var c = L(a);
          b = L(b);
          for (var d = 0; d < a.byteLength; d++) if (c[d] != b[d]) return !1;
          return !0;
        }
        function Gb(a) {
          return a instanceof ArrayBuffer ? a : a.buffer;
        }
        function Hb(a) {
          return a instanceof ArrayBuffer ? a : 0 == a.byteOffset && a.byteLength == a.buffer.byteLength ? a.buffer : new Uint8Array(a).buffer;
        }
        function L(a, b, c) {
          c = void 0 === c ? Infinity : c;
          return Ib(a, void 0 === b ? 0 : b, c, Uint8Array);
        }
        function Jb(a, b, c) {
          c = void 0 === c ? Infinity : c;
          return Ib(a, void 0 === b ? 0 : b, c, DataView);
        }
        function Ib(a, b, c, d) {
          var e = (a.byteOffset || 0) + a.byteLength;
          b = Math.max(0, Math.min((a.byteOffset || 0) + b, e));
          return new d(Gb(a), b, Math.min(b + Math.max(c, 0), e) - b);
        }
        K("shaka.util.BufferUtils", Eb);
        Eb.toDataView = Jb;
        Eb.toUint8 = L;
        Eb.toArrayBuffer = Hb;
        Eb.equal = Fb;
        function O(a, b, c) {
          var d = Ia.apply(3, arguments);
          this.severity = a;
          this.category = b;
          this.code = c;
          this.data = d;
          this.handled = !1;
        }
        O.prototype.toString = function () {
          return "shaka.util.Error " + JSON.stringify(this, null, "  ");
        };
        K("shaka.util.Error", O);
        O.Severity = {
          RECOVERABLE: 1,
          CRITICAL: 2
        };
        O.Category = {
          NETWORK: 1,
          TEXT: 2,
          MEDIA: 3,
          MANIFEST: 4,
          STREAMING: 5,
          DRM: 6,
          PLAYER: 7,
          CAST: 8,
          STORAGE: 9,
          ADS: 10
        };
        O.Code = {
          UNSUPPORTED_SCHEME: 1E3,
          BAD_HTTP_STATUS: 1001,
          HTTP_ERROR: 1002,
          TIMEOUT: 1003,
          MALFORMED_DATA_URI: 1004,
          REQUEST_FILTER_ERROR: 1006,
          RESPONSE_FILTER_ERROR: 1007,
          MALFORMED_TEST_URI: 1008,
          UNEXPECTED_TEST_REQUEST: 1009,
          ATTEMPTS_EXHAUSTED: 1010,
          SEGMENT_MISSING: 1011,
          INVALID_TEXT_HEADER: 2E3,
          INVALID_TEXT_CUE: 2001,
          UNABLE_TO_DETECT_ENCODING: 2003,
          BAD_ENCODING: 2004,
          INVALID_XML: 2005,
          INVALID_MP4_TTML: 2007,
          INVALID_MP4_VTT: 2008,
          UNABLE_TO_EXTRACT_CUE_START_TIME: 2009,
          INVALID_MP4_CEA: 2010,
          TEXT_COULD_NOT_GUESS_MIME_TYPE: 2011,
          CANNOT_ADD_EXTERNAL_TEXT_TO_SRC_EQUALS: 2012,
          TEXT_ONLY_WEBVTT_SRC_EQUALS: 2013,
          MISSING_TEXT_PLUGIN: 2014,
          CHAPTERS_TRACK_FAILED: 2015,
          CANNOT_ADD_EXTERNAL_THUMBNAILS_TO_SRC_EQUALS: 2016,
          UNSUPPORTED_EXTERNAL_THUMBNAILS_URI: 2017,
          BUFFER_READ_OUT_OF_BOUNDS: 3E3,
          JS_INTEGER_OVERFLOW: 3001,
          EBML_OVERFLOW: 3002,
          EBML_BAD_FLOATING_POINT_SIZE: 3003,
          MP4_SIDX_WRONG_BOX_TYPE: 3004,
          MP4_SIDX_INVALID_TIMESCALE: 3005,
          MP4_SIDX_TYPE_NOT_SUPPORTED: 3006,
          WEBM_CUES_ELEMENT_MISSING: 3007,
          WEBM_EBML_HEADER_ELEMENT_MISSING: 3008,
          WEBM_SEGMENT_ELEMENT_MISSING: 3009,
          WEBM_INFO_ELEMENT_MISSING: 3010,
          WEBM_DURATION_ELEMENT_MISSING: 3011,
          WEBM_CUE_TRACK_POSITIONS_ELEMENT_MISSING: 3012,
          WEBM_CUE_TIME_ELEMENT_MISSING: 3013,
          MEDIA_SOURCE_OPERATION_FAILED: 3014,
          MEDIA_SOURCE_OPERATION_THREW: 3015,
          VIDEO_ERROR: 3016,
          QUOTA_EXCEEDED_ERROR: 3017,
          TRANSMUXING_FAILED: 3018,
          CONTENT_TRANSFORMATION_FAILED: 3019,
          UNABLE_TO_GUESS_MANIFEST_TYPE: 4E3,
          DASH_INVALID_XML: 4001,
          DASH_NO_SEGMENT_INFO: 4002,
          DASH_EMPTY_ADAPTATION_SET: 4003,
          DASH_EMPTY_PERIOD: 4004,
          DASH_WEBM_MISSING_INIT: 4005,
          DASH_UNSUPPORTED_CONTAINER: 4006,
          DASH_PSSH_BAD_ENCODING: 4007,
          DASH_NO_COMMON_KEY_SYSTEM: 4008,
          DASH_MULTIPLE_KEY_IDS_NOT_SUPPORTED: 4009,
          DASH_CONFLICTING_KEY_IDS: 4010,
          RESTRICTIONS_CANNOT_BE_MET: 4012,
          HLS_PLAYLIST_HEADER_MISSING: 4015,
          INVALID_HLS_TAG: 4016,
          HLS_INVALID_PLAYLIST_HIERARCHY: 4017,
          DASH_DUPLICATE_REPRESENTATION_ID: 4018,
          HLS_MULTIPLE_MEDIA_INIT_SECTIONS_FOUND: 4020,
          HLS_REQUIRED_ATTRIBUTE_MISSING: 4023,
          HLS_REQUIRED_TAG_MISSING: 4024,
          HLS_COULD_NOT_GUESS_CODECS: 4025,
          HLS_KEYFORMATS_NOT_SUPPORTED: 4026,
          DASH_UNSUPPORTED_XLINK_ACTUATE: 4027,
          DASH_XLINK_DEPTH_LIMIT: 4028,
          CONTENT_UNSUPPORTED_BY_BROWSER: 4032,
          CANNOT_ADD_EXTERNAL_TEXT_TO_LIVE_STREAM: 4033,
          NO_VARIANTS: 4036,
          PERIOD_FLATTENING_FAILED: 4037,
          INCONSISTENT_DRM_ACROSS_PERIODS: 4038,
          HLS_VARIABLE_NOT_FOUND: 4039,
          HLS_MSE_ENCRYPTED_MP2T_NOT_SUPPORTED: 4040,
          HLS_MSE_ENCRYPTED_LEGACY_APPLE_MEDIA_KEYS_NOT_SUPPORTED: 4041,
          NO_WEB_CRYPTO_API: 4042,
          HLS_AES_128_INVALID_IV_LENGTH: 4043,
          HLS_AES_128_INVALID_KEY_LENGTH: 4044,
          CANNOT_ADD_EXTERNAL_THUMBNAILS_TO_LIVE_STREAM: 4045,
          STREAMING_ENGINE_STARTUP_INVALID_STATE: 5006,
          NO_RECOGNIZED_KEY_SYSTEMS: 6E3,
          REQUESTED_KEY_SYSTEM_CONFIG_UNAVAILABLE: 6001,
          FAILED_TO_CREATE_CDM: 6002,
          FAILED_TO_ATTACH_TO_VIDEO: 6003,
          INVALID_SERVER_CERTIFICATE: 6004,
          FAILED_TO_CREATE_SESSION: 6005,
          FAILED_TO_GENERATE_LICENSE_REQUEST: 6006,
          LICENSE_REQUEST_FAILED: 6007,
          LICENSE_RESPONSE_REJECTED: 6008,
          ENCRYPTED_CONTENT_WITHOUT_DRM_INFO: 6010,
          NO_LICENSE_SERVER_GIVEN: 6012,
          OFFLINE_SESSION_REMOVED: 6013,
          EXPIRED: 6014,
          SERVER_CERTIFICATE_REQUIRED: 6015,
          INIT_DATA_TRANSFORM_ERROR: 6016,
          SERVER_CERTIFICATE_REQUEST_FAILED: 6017,
          LOAD_INTERRUPTED: 7E3,
          OPERATION_ABORTED: 7001,
          NO_VIDEO_ELEMENT: 7002,
          OBJECT_DESTROYED: 7003,
          CONTENT_NOT_LOADED: 7004,
          CAST_API_UNAVAILABLE: 8E3,
          NO_CAST_RECEIVERS: 8001,
          ALREADY_CASTING: 8002,
          UNEXPECTED_CAST_ERROR: 8003,
          CAST_CANCELED_BY_USER: 8004,
          CAST_CONNECTION_TIMED_OUT: 8005,
          CAST_RECEIVER_APP_UNAVAILABLE: 8006,
          STORAGE_NOT_SUPPORTED: 9E3,
          INDEXED_DB_ERROR: 9001,
          DEPRECATED_OPERATION_ABORTED: 9002,
          REQUESTED_ITEM_NOT_FOUND: 9003,
          MALFORMED_OFFLINE_URI: 9004,
          CANNOT_STORE_LIVE_OFFLINE: 9005,
          NO_INIT_DATA_FOR_OFFLINE: 9007,
          LOCAL_PLAYER_INSTANCE_REQUIRED: 9008,
          NEW_KEY_OPERATION_NOT_SUPPORTED: 9011,
          KEY_NOT_FOUND: 9012,
          MISSING_STORAGE_CELL: 9013,
          STORAGE_LIMIT_REACHED: 9014,
          DOWNLOAD_SIZE_CALLBACK_ERROR: 9015,
          MODIFY_OPERATION_NOT_SUPPORTED: 9016,
          INDEXED_DB_INIT_TIMED_OUT: 9017,
          CS_IMA_SDK_MISSING: 1E4,
          CS_AD_MANAGER_NOT_INITIALIZED: 10001,
          SS_IMA_SDK_MISSING: 10002,
          SS_AD_MANAGER_NOT_INITIALIZED: 10003,
          CURRENT_DAI_REQUEST_NOT_FINISHED: 10004
        }; /*
           @license
           Copyright 2008 The Closure Library Authors
           SPDX-License-Identifier: Apache-2.0
           */
        var Kb = RegExp("^(?:([^:/?#.]+):)?(?://(?:([^/?#]*)@)?([^/#?]*?)(?::([0-9]+))?(?=[/#?]|$))?([^?#]+)?(?:\\?([^#]*))?(?:#(.*))?$"); /*
                                                                                                                                           @license
                                                                                                                                           Copyright 2006 The Closure Library Authors
                                                                                                                                           SPDX-License-Identifier: Apache-2.0
                                                                                                                                           */
        function Mb(a) {
          var b;
          a instanceof Mb ? (Nb(this, a.Ea), this.qb = a.qb, this.Ha = a.Ha, Ob(this, a.Lb), this.ra = a.ra, Pb(this, a.g.clone()), this.fb = a.fb) : a && (b = String(a).match(Kb)) ? (Nb(this, b[1] || "", !0), this.qb = Qb(b[2] || ""), this.Ha = Qb(b[3] || "", !0), Ob(this, b[4]), this.ra = Qb(b[5] || "", !0), Pb(this, b[6] || "", !0), this.fb = Qb(b[7] || "")) : this.g = new Rb(null);
        }
        r = Mb.prototype;
        r.Ea = "";
        r.qb = "";
        r.Ha = "";
        r.Lb = null;
        r.ra = "";
        r.fb = "";
        r.toString = function () {
          var a = [],
            b = this.Ea;
          b && a.push(Sb(b, Tb, !0), ":");
          if (b = this.Ha) {
            a.push("//");
            var c = this.qb;
            c && a.push(Sb(c, Tb, !0), "@");
            a.push(encodeURIComponent(b).replace(/%25([0-9a-fA-F]{2})/g, "%$1"));
            b = this.Lb;
            null != b && a.push(":", String(b));
          }
          if (b = this.ra) this.Ha && "/" != b.charAt(0) && a.push("/"), a.push(Sb(b, "/" == b.charAt(0) ? Ub : Vb, !0));
          (b = this.g.toString()) && a.push("?", b);
          (b = this.fb) && a.push("#", Sb(b, Wb));
          return a.join("");
        };
        r.resolve = function (a) {
          var b = this.clone();
          "data" === b.Ea && (b = new Mb());
          var c = !!a.Ea;
          c ? Nb(b, a.Ea) : c = !!a.qb;
          c ? b.qb = a.qb : c = !!a.Ha;
          c ? b.Ha = a.Ha : c = null != a.Lb;
          var d = a.ra;
          if (c) Ob(b, a.Lb);else if (c = !!a.ra) {
            if ("/" != d.charAt(0)) if (this.Ha && !this.ra) d = "/" + d;else {
              var e = b.ra.lastIndexOf("/");
              -1 != e && (d = b.ra.substr(0, e + 1) + d);
            }
            if (".." == d || "." == d) d = "";else if (-1 != d.indexOf("./") || -1 != d.indexOf("/.")) {
              e = 0 == d.lastIndexOf("/", 0);
              d = d.split("/");
              for (var f = [], g = 0; g < d.length;) {
                var h = d[g++];
                "." == h ? e && g == d.length && f.push("") : ".." == h ? ((1 < f.length || 1 == f.length && "" != f[0]) && f.pop(), e && g == d.length && f.push("")) : (f.push(h), e = !0);
              }
              d = f.join("/");
            }
          }
          c ? b.ra = d : c = "" !== a.g.toString();
          c ? Pb(b, a.g.clone()) : c = !!a.fb;
          c && (b.fb = a.fb);
          return b;
        };
        r.clone = function () {
          return new Mb(this);
        };
        function Nb(a, b, c) {
          a.Ea = c ? Qb(b, !0) : b;
          a.Ea && (a.Ea = a.Ea.replace(/:$/, ""));
        }
        function Ob(a, b) {
          if (b) {
            b = Number(b);
            if (isNaN(b) || 0 > b) throw Error("Bad port number " + b);
            a.Lb = b;
          } else a.Lb = null;
        }
        function Pb(a, b, c) {
          b instanceof Rb ? a.g = b : (c || (b = Sb(b, Xb)), a.g = new Rb(b));
        }
        function Qb(a, b) {
          return a ? b ? decodeURI(a) : decodeURIComponent(a) : "";
        }
        function Sb(a, b, c) {
          return null != a ? (a = encodeURI(a).replace(b, Yb), c && (a = a.replace(/%25([0-9a-fA-F]{2})/g, "%$1")), a) : null;
        }
        function Yb(a) {
          a = a.charCodeAt(0);
          return "%" + (a >> 4 & 15).toString(16) + (a & 15).toString(16);
        }
        var Tb = /[#\/\?@]/g,
          Vb = /[#\?:]/g,
          Ub = /[#\?]/g,
          Xb = /[#\?@]/g,
          Wb = /#/g;
        function Rb(a) {
          this.g = a || null;
        }
        function $b(a) {
          if (!a.na && (a.na = {}, a.Pc = 0, a.g)) for (var b = a.g.split("&"), c = 0; c < b.length; c++) {
            var d = b[c].indexOf("="),
              e = null;
            if (0 <= d) {
              var f = b[c].substring(0, d);
              e = b[c].substring(d + 1);
            } else f = b[c];
            f = decodeURIComponent(f.replace(/\+/g, " "));
            e = e || "";
            a.add(f, decodeURIComponent(e.replace(/\+/g, " ")));
          }
        }
        r = Rb.prototype;
        r.na = null;
        r.Pc = null;
        r.add = function (a, b) {
          $b(this);
          this.g = null;
          var c = this.na.hasOwnProperty(a) ? this.na[a] : null;
          c || (this.na[a] = c = []);
          c.push(b);
          this.Pc++;
          return this;
        };
        r.set = function (a, b) {
          $b(this);
          this.g = null;
          this.na.hasOwnProperty(a) ? this.na[a] = [b] : this.add(a, b);
          return this;
        };
        r.toString = function () {
          if (this.g) return this.g;
          if (!this.na) return "";
          var a = [],
            b;
          for (b in this.na) for (var c = encodeURIComponent(b), d = this.na[b], e = 0; e < d.length; e++) {
            var f = c;
            "" !== d[e] && (f += "=" + encodeURIComponent(d[e]));
            a.push(f);
          }
          return this.g = a.join("&");
        };
        r.clone = function () {
          var a = new Rb();
          a.g = this.g;
          if (this.na) {
            var b = {},
              c;
            for (c in this.na) b[c] = this.na[c].concat();
            a.na = b;
            a.Pc = this.Pc;
          }
          return a;
        };
        function ac(a, b) {
          return a.concat(b);
        }
        function bc() {}
        function cc(a) {
          return null != a;
        }
        function dc(a, b) {
          if (0 == b.length) return a;
          var c = b.map(function (d) {
            return new Mb(d);
          });
          return a.map(function (d) {
            return new Mb(d);
          }).map(function (d) {
            return c.map(function (e) {
              return d.resolve(e);
            });
          }).reduce(ac, []).map(function (d) {
            return d.toString();
          });
        }
        function ec(a, b) {
          return {
            keySystem: a,
            licenseServerUri: "",
            distinctiveIdentifierRequired: !1,
            persistentStateRequired: !1,
            audioRobustness: "",
            videoRobustness: "",
            serverCertificate: null,
            serverCertificateUri: "",
            sessionType: "",
            initData: b || [],
            keyIds: new Set()
          };
        }
        function fc(a, b) {
          if (1 == b.length) return b[0];
          a = gc(a, b);
          if (null != a) return a;
          throw new O(2, 4, 4025, b);
        }
        function gc(a, b) {
          for (var c = t(hc[a]), d = c.next(); !d.done; d = c.next()) {
            d = d.value;
            for (var e = t(b), f = e.next(); !f.done; f = e.next()) if (f = f.value, d.test(f.trim())) return f.trim();
          }
          return a == ic ? "" : null;
        }
        var ic = "text",
          jc = {
            va: "video",
            Ic: "audio",
            X: ic,
            Xb: "image",
            Ig: "application"
          },
          hc = {
            audio: [/^vorbis$/, /^Opus$/, /^opus$/, /^fLaC$/, /^flac$/, /^mp4a/, /^[ae]c-3$/, /^ac-4$/, /^dts[cex]$/],
            video: [/^avc/, /^hev/, /^hvc/, /^vp0?[89]/, /^av01/, /^dvh/],
            text: [/^vtt$/, /^wvtt/, /^stpp/]
          };
        function kc() {
          var a,
            b,
            c = new Promise(function (d, e) {
              a = d;
              b = e;
            });
          c.resolve = a;
          c.reject = b;
          return c;
        }
        kc.prototype.resolve = function () {};
        kc.prototype.reject = function () {};
        function lc(a) {
          this.h = a;
          this.g = void 0;
        }
        lc.prototype.value = function () {
          void 0 == this.g && (this.g = this.h());
          return this.g;
        };
        function mc(a) {
          this.h = a;
          this.g = null;
        }
        mc.prototype.O = function (a) {
          var b = this;
          this.stop();
          var c = !0,
            d = null;
          this.g = function () {
            window.clearTimeout(d);
            c = !1;
          };
          d = window.setTimeout(function () {
            c && b.h();
          }, 1E3 * a);
          return this;
        };
        mc.prototype.stop = function () {
          this.g && (this.g(), this.g = null);
        };
        function P(a) {
          this.h = a;
          this.g = null;
        }
        P.prototype.Nb = function () {
          this.stop();
          this.h();
          return this;
        };
        P.prototype.O = function (a) {
          var b = this;
          this.stop();
          this.g = new mc(function () {
            b.h();
          }).O(a);
          return this;
        };
        P.prototype.Ca = function (a) {
          var b = this;
          this.stop();
          this.g = new mc(function () {
            b.g.O(a);
            b.h();
          }).O(a);
          return this;
        };
        P.prototype.stop = function () {
          this.g && (this.g.stop(), this.g = null);
        };
        K("shaka.util.Timer", P);
        P.prototype.stop = P.prototype.stop;
        P.prototype.tickEvery = P.prototype.Ca;
        P.prototype.tickAfter = P.prototype.O;
        P.prototype.tickNow = P.prototype.Nb;
        function nc() {
          return window.MediaSource && MediaSource.isTypeSupported ? !0 : !1;
        }
        function oc(a) {
          return "" != pc().canPlayType(a);
        }
        function qc() {
          return navigator.userAgent.match(/Edge?\//) ? !0 : !1;
        }
        function rc() {
          return sc("Xbox One");
        }
        function tc() {
          return sc("Tizen");
        }
        function uc() {
          return sc("Web0S") && sc("Chrome/38.0.2125.122 Safari/537.36");
        }
        function vc() {
          return !!navigator.vendor && navigator.vendor.includes("Apple") && !tc() && !sc("PC=EOS") && !sc("VirginMedia") && !wc() && !sc("AFT");
        }
        function wc() {
          return sc("PlayStation 4");
        }
        function xc() {
          if (!vc()) return null;
          var a = navigator.userAgent.match(/Version\/(\d+)/);
          return a ? parseInt(a[1], 10) : (a = navigator.userAgent.match(/OS (\d+)(?:_\d+)?/)) ? parseInt(a[1], 10) : null;
        }
        function sc(a) {
          return (navigator.userAgent || "").includes(a);
        }
        function pc() {
          if (yc) return yc;
          zc || (zc = new P(function () {
            yc = null;
          }));
          (yc = document.getElementsByTagName("video")[0] || document.getElementsByTagName("audio")[0]) || (yc = document.createElement("video"));
          zc.O(1);
          return yc;
        }
        var zc = null,
          yc = null;
        function Ac() {}
        function Bc(a) {
          if (!a) return "";
          a = L(a);
          239 == a[0] && 187 == a[1] && 191 == a[2] && (a = a.subarray(3));
          if (window.TextDecoder && !wc()) return a = new TextDecoder().decode(a), a.includes("\ufffd") && Wa('Decoded string contains an "unknown character" codepoint.  That probably means the UTF8 encoding was incorrect!'), a;
          for (var b = "", c = 0; c < a.length; ++c) {
            var d = 65533;
            0 == (a[c] & 128) ? d = a[c] : a.length >= c + 2 && 192 == (a[c] & 224) && 128 == (a[c + 1] & 192) ? (d = (a[c] & 31) << 6 | a[c + 1] & 63, c += 1) : a.length >= c + 3 && 224 == (a[c] & 240) && 128 == (a[c + 1] & 192) && 128 == (a[c + 2] & 192) ? (d = (a[c] & 15) << 12 | (a[c + 1] & 63) << 6 | a[c + 2] & 63, c += 2) : a.length >= c + 4 && 240 == (a[c] & 241) && 128 == (a[c + 1] & 192) && 128 == (a[c + 2] & 192) && 128 == (a[c + 3] & 192) && (d = (a[c] & 7) << 18 | (a[c + 1] & 63) << 12 | (a[c + 2] & 63) << 6 | a[c + 3] & 63, c += 3);
            if (65535 >= d) b += String.fromCharCode(d);else {
              d -= 65536;
              var e = d & 1023;
              b += String.fromCharCode(55296 + (d >> 10));
              b += String.fromCharCode(56320 + e);
            }
          }
          return b;
        }
        function Cc(a, b, c) {
          if (!a) return "";
          if (!c && 0 != a.byteLength % 2) throw new O(2, 2, 2004);
          c = Math.floor(a.byteLength / 2);
          var d = new Uint16Array(c);
          a = Jb(a);
          for (var e = 0; e < c; e++) d[e] = a.getUint16(2 * e, b);
          return Dc.value()(d);
        }
        function Ec(a) {
          function b(d) {
            return c.byteLength <= d || 32 <= c[d] && 126 >= c[d];
          }
          if (!a) return "";
          var c = L(a);
          if (239 == c[0] && 187 == c[1] && 191 == c[2]) return Bc(c);
          if (254 == c[0] && 255 == c[1]) return Cc(c.subarray(2), !1);
          if (255 == c[0] && 254 == c[1]) return Cc(c.subarray(2), !0);
          if (0 == c[0] && 0 == c[2]) return Cc(a, !1);
          if (0 == c[1] && 0 == c[3]) return Cc(a, !0);
          if (b(0) && b(1) && b(2) && b(3)) return Bc(a);
          throw new O(2, 2, 2003);
        }
        function Fc(a) {
          if (window.TextEncoder && !wc()) {
            var b = new TextEncoder();
            return Hb(b.encode(a));
          }
          a = encodeURIComponent(a);
          a = unescape(a);
          b = new Uint8Array(a.length);
          for (var c = 0; c < a.length; c++) b[c] = a[c].charCodeAt(0);
          return Hb(b);
        }
        function Gc(a, b) {
          for (var c = new ArrayBuffer(2 * a.length), d = new DataView(c), e = 0; e < a.length; ++e) d.setUint16(2 * e, a.charCodeAt(e), b);
          return c;
        }
        K("shaka.util.StringUtils", Ac);
        Ac.resetFromCharCode = function () {
          Dc.g = void 0;
        };
        Ac.toUTF16 = Gc;
        Ac.toUTF8 = Fc;
        Ac.fromBytesAutoDetect = Ec;
        Ac.fromUTF16 = Cc;
        Ac.fromUTF8 = Bc;
        var Dc = new lc(function () {
          function a(c) {
            try {
              var d = new Uint8Array(c);
              return 0 < String.fromCharCode.apply(null, d).length;
            } catch (e) {
              return !1;
            }
          }
          for (var b = {
            Ua: 65536
          }; 0 < b.Ua; b = {
            Ua: b.Ua
          }, b.Ua /= 2) if (a(b.Ua)) return function (c) {
            return function (d) {
              for (var e = "", f = 0; f < d.length; f += c.Ua) e += String.fromCharCode.apply(null, d.subarray(f, f + c.Ua));
              return e;
            };
          }(b);
          return null;
        });
        function Hc() {}
        function Ic(a) {
          a = L(a);
          a = Dc.value()(a);
          return btoa(a);
        }
        function Jc(a, b) {
          b = void 0 == b ? !0 : b;
          a = Ic(a).replace(/\+/g, "-").replace(/\//g, "_");
          return b ? a : a.replace(/[=]*$/, "");
        }
        function Kc(a) {
          a = window.atob(a.replace(/-/g, "+").replace(/_/g, "/"));
          for (var b = new Uint8Array(a.length), c = 0; c < a.length; ++c) b[c] = a.charCodeAt(c);
          return b;
        }
        function Lc(a) {
          for (var b = a.length / 2, c = new Uint8Array(b), d = 0; d < b; d++) c[d] = window.parseInt(a.substr(2 * d, 2), 16);
          return c;
        }
        function Mc(a) {
          var b = L(a);
          a = "";
          b = t(b);
          for (var c = b.next(); !c.done; c = b.next()) c = c.value, c = c.toString(16), 1 == c.length && (c = "0" + c), a += c;
          return a;
        }
        function Nc() {
          for (var a = Ia.apply(0, arguments), b = 0, c = t(a), d = c.next(); !d.done; d = c.next()) b += d.value.byteLength;
          b = new Uint8Array(b);
          c = 0;
          a = t(a);
          for (d = a.next(); !d.done; d = a.next()) d = d.value, b.set(L(d), c), c += d.byteLength;
          return b;
        }
        K("shaka.util.Uint8ArrayUtils", Hc);
        Hc.concat = Nc;
        Hc.toHex = Mc;
        Hc.fromHex = Lc;
        Hc.fromBase64 = Kc;
        Hc.toBase64 = Jc;
        Hc.toStandardBase64 = Ic;
        function Oc() {}
        K("shaka.dependencies", Oc);
        Oc.has = function (a) {
          return Pc.has(a);
        };
        Oc.add = function (a, b) {
          if (!Qc[a]) throw Error(a + " is not supported");
          Pc.set(a, function () {
            return b;
          });
        };
        var Qc = {
          muxjs: "muxjs"
        };
        Oc.Allowed = Qc;
        var Pc = new Map([["muxjs", function () {
          return window.muxjs;
        }]]);
        function Rc(a) {
          var b = this;
          this.o = a;
          this.m = Pc.get("muxjs")();
          this.h = this.g = null;
          this.l = [];
          this.i = [];
          this.j = !1;
          this.m && (this.g = new this.m.mp4.Transmuxer({
            keepOriginalTimestamps: !0
          }), this.g.on("data", function (c) {
            b.i = c.captions;
            b.l.push(Nc(c.initSegment, c.data));
          }), this.g.on("done", function () {
            var c = {
              data: Nc.apply(Hc, ia(b.l)),
              captions: b.i
            };
            b.h.resolve(c);
            b.j = !1;
          }));
        }
        Rc.prototype.destroy = function () {
          this.g && this.g.dispose();
          this.g = null;
          return Promise.resolve();
        };
        function Sc(a, b) {
          var c = Tc(a),
            d = "audio/aac" == a.toLowerCase().split(";")[0];
          if (!Pc.get("muxjs")() || !c && !d) return !1;
          if (d) return db('audio/mp4; codecs="mp4a.40.2"');
          if (b) return db(Uc(b, a));
          b = Uc("audio", a);
          a = Uc("video", a);
          return db(b) || db(a);
        }
        function Tc(a) {
          return "mp2t" == a.toLowerCase().split(";")[0].split("/")[1];
        }
        function Vc(a, b) {
          return "audio/aac" == b.toLowerCase().split(";")[0] ? 'audio/mp4; codecs="mp4a.40.2"' : Tc(b) ? Uc(a, b) : b;
        }
        function Uc(a, b) {
          b = b.replace(/mp2t/i, "mp4");
          "audio" == a && (b = b.replace("video", "audio"));
          if (a = /avc1\.(66|77|100)\.(\d+)/.exec(b)) {
            var c = "avc1.",
              d = a[1],
              e = Number(a[2]);
            c = ("66" == d ? c + "4200" : "77" == d ? c + "4d00" : c + "6400") + (e >> 4).toString(16);
            c += (e & 15).toString(16);
            b = b.replace(a[0], c);
          }
          return b;
        }
        function Wc(a, b) {
          a.j = !0;
          a.h = new kc();
          a.l = [];
          a.i = [];
          b = L(b);
          a.g.push(b);
          a.g.flush();
          a.j && a.h.reject(new O(2, 3, 3018));
          return a.h;
        }
        function Xc() {}
        function Yc(a, b) {
          b && (a += '; codecs="' + b + '"');
          return a;
        }
        function Zc(a, b, c) {
          b = Yc(a, b);
          return Sc(b, c) ? Vc(c, b) : "video/mp2t" != a && "audio" == c ? b.replace("video", "audio") : b;
        }
        function $c(a) {
          var b = ad(a);
          a = b[0];
          b = b[1].toLowerCase();
          switch (!0) {
            case "mp4a" === a && "69" === b:
            case "mp4a" === a && "6b" === b:
              return "mp3";
            case "mp4a" === a && "66" === b:
            case "mp4a" === a && "67" === b:
            case "mp4a" === a && "68" === b:
            case "mp4a" === a && "40.2" === b:
            case "mp4a" === a && "40.02" === b:
            case "mp4a" === a && "40.5" === b:
            case "mp4a" === a && "40.05" === b:
            case "mp4a" === a && "40.29" === b:
            case "mp4a" === a && "40.42" === b:
              return "aac";
            case "mp4a" === a && "a5" === b:
              return "ac-3";
            case "mp4a" === a && "a6" === b:
              return "ec-3";
            case "mp4a" === a && "b2" === b:
              return "dtsx";
            case "mp4a" === a && "a9" === b:
              return "dtsc";
            case "avc1" === a:
            case "avc3" === a:
              return "avc";
            case "hvc1" === a:
            case "hev1" === a:
              return "hevc";
            case "dvh1" === a:
            case "dvhe" === a:
              return "dovi";
          }
          return a;
        }
        function bd(a) {
          a = a.split(/ *; */);
          a.shift();
          return (a = a.find(function (b) {
            return b.startsWith("codecs=");
          })) ? a.split("=")[1].replace(/^"|"$/g, "") : "";
        }
        function ad(a) {
          a = a.split(".");
          var b = a[0];
          a.shift();
          return [b, a.join(".")];
        }
        K("shaka.util.MimeUtils", Xc);
        Xc.getFullType = Yc;
        new Map().set("codecs", "codecs").set("frameRate", "framerate").set("bandwidth", "bitrate").set("width", "width").set("height", "height").set("channelsCount", "channels");
        function cd(a) {
          this.i = null;
          this.j = a;
          this.u = !1;
          this.l = this.s = 0;
          this.m = Infinity;
          this.h = this.g = null;
          this.A = "";
          this.o = new Map();
        }
        function dd(a) {
          return ed[a] || "application/cea-608" == a || "application/cea-708" == a ? !0 : !1;
        }
        cd.prototype.destroy = function () {
          this.j = this.i = null;
          this.o.clear();
          return Promise.resolve();
        };
        function fd(a, b, c, d) {
          var e, f, g, h;
          return G(function (k) {
            if (1 == k.g) return u(k, Promise.resolve(), 2);
            if (!a.i || !a.j) return k.return();
            if (null == c || null == d) return a.i.parseInit(L(b)), k.return();
            e = a.u ? c : a.s;
            f = {
              periodStart: a.s,
              segmentStart: c,
              segmentEnd: d,
              vttOffset: e
            };
            g = a.i.parseMedia(L(b), f);
            h = g.filter(function (l) {
              return l.startTime >= a.l && l.startTime < a.m;
            });
            a.j.append(h);
            null == a.g && (a.g = Math.max(c, a.l));
            a.h = Math.min(d, a.m);
            A(k);
          });
        }
        cd.prototype.remove = function (a, b) {
          var c = this;
          return G(function (d) {
            if (1 == d.g) return u(d, Promise.resolve(), 2);
            !c.j || !c.j.remove(a, b) || null == c.g || b <= c.g || a >= c.h || (a <= c.g && b >= c.h ? c.g = c.h = null : a <= c.g && b < c.h ? c.g = b : a > c.g && b >= c.h && (c.h = a));
            A(d);
          });
        };
        function gd(a, b, c) {
          a.l = b;
          a.m = c;
        }
        function hd(a, b, c) {
          a.A = b;
          if (b = a.o.get(b)) for (var d = t(b.keys()), e = d.next(); !e.done; e = d.next()) (e = b.get(e.value).filter(function (f) {
            return f.endTime <= c;
          })) && a.j.append(e);
        }
        function id(a) {
          var b = [];
          a = t(a);
          for (var c = a.next(); !c.done; c = a.next()) c = c.value, b.push({
            stream: c.stream,
            cue: new jb(c.startTime, c.endTime, c.text)
          });
          return b;
        }
        function jd(a, b, c) {
          b.startTime += c;
          b.endTime += c;
          b = t(b.nestedCues);
          for (var d = b.next(); !d.done; d = b.next()) jd(a, d.value, c);
        }
        function kd(a, b, c, d, e) {
          var f = c + " " + d,
            g = new Map();
          b = t(b);
          for (var h = b.next(); !h.done; h = b.next()) {
            var k = h.value;
            h = k.stream;
            k = k.cue;
            g.has(h) || g.set(h, new Map());
            g.get(h).has(f) || g.get(h).set(f, []);
            jd(a, k, e);
            k.startTime >= a.l && k.startTime < a.m && (g.get(h).get(f).push(k), h == a.A && a.j.append([k]));
          }
          e = t(g.keys());
          for (f = e.next(); !f.done; f = e.next()) for (f = f.value, a.o.has(f) || a.o.set(f, new Map()), b = t(g.get(f).keys()), h = b.next(); !h.done; h = b.next()) h = h.value, k = g.get(f).get(h), a.o.get(f).set(h, k);
          a.g = null == a.g ? Math.max(c, a.l) : Math.min(a.g, Math.max(c, a.l));
          a.h = Math.max(a.h, Math.min(d, a.m));
        }
        K("shaka.text.TextEngine", cd);
        cd.prototype.destroy = cd.prototype.destroy;
        cd.findParser = function (a) {
          return ed[a];
        };
        cd.unregisterParser = function (a) {
          delete ed[a];
        };
        cd.registerParser = function (a, b) {
          ed[a] = b;
        };
        var ed = {};
        function ld() {}
        function md(a, b) {
          a = nd(a);
          b = nd(b);
          return a.split("-")[0] == b.split("-")[0];
        }
        function od(a, b) {
          a = nd(a);
          b = nd(b);
          a = a.split("-");
          b = b.split("-");
          return a[0] == b[0] && 1 == a.length && 2 == b.length;
        }
        function pd(a, b) {
          a = nd(a);
          b = nd(b);
          a = a.split("-");
          b = b.split("-");
          return 2 == a.length && 2 == b.length && a[0] == b[0];
        }
        function nd(a) {
          var b = a.split("-");
          a = b[0] || "";
          b = b[1] || "";
          a = a.toLowerCase();
          a = qd.get(a) || a;
          return (b = b.toUpperCase()) ? a + "-" + b : a;
        }
        function rd(a, b) {
          a = nd(a);
          b = nd(b);
          return b == a ? 4 : od(b, a) ? 3 : pd(b, a) ? 2 : od(a, b) ? 1 : 0;
        }
        function sd(a) {
          var b = a.indexOf("-");
          a = 0 <= b ? a.substring(0, b) : a;
          a = a.toLowerCase();
          return a = qd.get(a) || a;
        }
        function td(a) {
          return a.language ? nd(a.language) : a.audio && a.audio.language ? nd(a.audio.language) : a.video && a.video.language ? nd(a.video.language) : "und";
        }
        function ud(a, b) {
          a = nd(a);
          var c = new Set(),
            d = t(b);
          for (b = d.next(); !b.done; b = d.next()) c.add(nd(b.value));
          d = t(c);
          for (b = d.next(); !b.done; b = d.next()) if (b = b.value, b == a) return b;
          d = t(c);
          for (b = d.next(); !b.done; b = d.next()) if (b = b.value, od(b, a)) return b;
          d = t(c);
          for (b = d.next(); !b.done; b = d.next()) if (b = b.value, pd(b, a)) return b;
          c = t(c);
          for (b = c.next(); !b.done; b = c.next()) if (b = b.value, od(a, b)) return b;
          return null;
        }
        K("shaka.util.LanguageUtils", ld);
        ld.findClosestLocale = ud;
        ld.getLocaleForVariant = td;
        ld.getLocaleForText = function (a) {
          return nd(a.language || "und");
        };
        ld.getBase = sd;
        ld.relatedness = rd;
        ld.areSiblings = function (a, b) {
          var c = sd(a),
            d = sd(b);
          return a != c && b != d && c == d;
        };
        ld.normalize = nd;
        ld.isSiblingOf = pd;
        ld.isParentOf = od;
        ld.areLanguageCompatible = md;
        ld.areLocaleCompatible = function (a, b) {
          a = nd(a);
          b = nd(b);
          return a == b;
        };
        var qd = new Map([["aar", "aa"], ["abk", "ab"], ["afr", "af"], ["aka", "ak"], ["alb", "sq"], ["amh", "am"], ["ara", "ar"], ["arg", "an"], ["arm", "hy"], ["asm", "as"], ["ava", "av"], ["ave", "ae"], ["aym", "ay"], ["aze", "az"], ["bak", "ba"], ["bam", "bm"], ["baq", "eu"], ["bel", "be"], ["ben", "bn"], ["bih", "bh"], ["bis", "bi"], ["bod", "bo"], ["bos", "bs"], ["bre", "br"], ["bul", "bg"], ["bur", "my"], ["cat", "ca"], ["ces", "cs"], ["cha", "ch"], ["che", "ce"], ["chi", "zh"], ["chu", "cu"], ["chv", "cv"], ["cor", "kw"], ["cos", "co"], ["cre", "cr"], ["cym", "cy"], ["cze", "cs"], ["dan", "da"], ["deu", "de"], ["div", "dv"], ["dut", "nl"], ["dzo", "dz"], ["ell", "el"], ["eng", "en"], ["epo", "eo"], ["est", "et"], ["eus", "eu"], ["ewe", "ee"], ["fao", "fo"], ["fas", "fa"], ["fij", "fj"], ["fin", "fi"], ["fra", "fr"], ["fre", "fr"], ["fry", "fy"], ["ful", "ff"], ["geo", "ka"], ["ger", "de"], ["gla", "gd"], ["gle", "ga"], ["glg", "gl"], ["glv", "gv"], ["gre", "el"], ["grn", "gn"], ["guj", "gu"], ["hat", "ht"], ["hau", "ha"], ["heb", "he"], ["her", "hz"], ["hin", "hi"], ["hmo", "ho"], ["hrv", "hr"], ["hun", "hu"], ["hye", "hy"], ["ibo", "ig"], ["ice", "is"], ["ido", "io"], ["iii", "ii"], ["iku", "iu"], ["ile", "ie"], ["ina", "ia"], ["ind", "id"], ["ipk", "ik"], ["isl", "is"], ["ita", "it"], ["jav", "jv"], ["jpn", "ja"], ["kal", "kl"], ["kan", "kn"], ["kas", "ks"], ["kat", "ka"], ["kau", "kr"], ["kaz", "kk"], ["khm", "km"], ["kik", "ki"], ["kin", "rw"], ["kir", "ky"], ["kom", "kv"], ["kon", "kg"], ["kor", "ko"], ["kua", "kj"], ["kur", "ku"], ["lao", "lo"], ["lat", "la"], ["lav", "lv"], ["lim", "li"], ["lin", "ln"], ["lit", "lt"], ["ltz", "lb"], ["lub", "lu"], ["lug", "lg"], ["mac", "mk"], ["mah", "mh"], ["mal", "ml"], ["mao", "mi"], ["mar", "mr"], ["may", "ms"], ["mkd", "mk"], ["mlg", "mg"], ["mlt", "mt"], ["mon", "mn"], ["mri", "mi"], ["msa", "ms"], ["mya", "my"], ["nau", "na"], ["nav", "nv"], ["nbl", "nr"], ["nde", "nd"], ["ndo", "ng"], ["nep", "ne"], ["nld", "nl"], ["nno", "nn"], ["nob", "nb"], ["nor", "no"], ["nya", "ny"], ["oci", "oc"], ["oji", "oj"], ["ori", "or"], ["orm", "om"], ["oss", "os"], ["pan", "pa"], ["per", "fa"], ["pli", "pi"], ["pol", "pl"], ["por", "pt"], ["pus", "ps"], ["que", "qu"], ["roh", "rm"], ["ron", "ro"], ["rum", "ro"], ["run", "rn"], ["rus", "ru"], ["sag", "sg"], ["san", "sa"], ["sin", "si"], ["slk", "sk"], ["slo", "sk"], ["slv", "sl"], ["sme", "se"], ["smo", "sm"], ["sna", "sn"], ["snd", "sd"], ["som", "so"], ["sot", "st"], ["spa", "es"], ["sqi", "sq"], ["srd", "sc"], ["srp", "sr"], ["ssw", "ss"], ["sun", "su"], ["swa", "sw"], ["swe", "sv"], ["tah", "ty"], ["tam", "ta"], ["tat", "tt"], ["tel", "te"], ["tgk", "tg"], ["tgl", "tl"], ["tha", "th"], ["tib", "bo"], ["tir", "ti"], ["ton", "to"], ["tsn", "tn"], ["tso", "ts"], ["tuk", "tk"], ["tur", "tr"], ["twi", "tw"], ["uig", "ug"], ["ukr", "uk"], ["urd", "ur"], ["uzb", "uz"], ["ven", "ve"], ["vie", "vi"], ["vol", "vo"], ["wel", "cy"], ["wln", "wa"], ["wol", "wo"], ["xho", "xh"], ["yid", "yi"], ["yor", "yo"], ["zha", "za"], ["zho", "zh"], ["zul", "zu"]]);
        function vd() {
          this.g = {};
        }
        r = vd.prototype;
        r.push = function (a, b) {
          this.g.hasOwnProperty(a) ? this.g[a].push(b) : this.g[a] = [b];
        };
        r.get = function (a) {
          return (a = this.g[a]) ? a.slice() : null;
        };
        r.remove = function (a, b) {
          a in this.g && (this.g[a] = this.g[a].filter(function (c) {
            return c != b;
          }), 0 == this.g[a].length && delete this.g[a]);
        };
        r.forEach = function (a) {
          for (var b in this.g) a(b, this.g[b]);
        };
        r.size = function () {
          return Object.keys(this.g).length;
        };
        r.keys = function () {
          return Object.keys(this.g);
        };
        function wd(a, b, c, d, e) {
          var f = a.variants;
          if (b.length || c.length) f = xd(f, b, c);
          f = yd(f, d);
          b = zd(f);
          b = Ad(b);
          var g = Bd(b, e);
          a.variants = a.variants.filter(function (h) {
            return Cd(h) == g ? !0 : !1;
          });
        }
        function zd(a) {
          var b = new vd();
          a = t(a);
          for (var c = a.next(); !c.done; c = a.next()) {
            c = c.value;
            var d = Cd(c);
            b.push(d, c);
          }
          return b;
        }
        function Ad(a) {
          var b = 0,
            c = new Map(),
            d = a.size();
          a.forEach(function (e, f) {
            f = t(f);
            for (var g = f.next(); !g.done; g = f.next()) {
              g = g.value;
              var h = g.video;
              if (h && h.width && h.height) {
                h = h.width * h.height * (h.frameRate || 1);
                c.has(h) || c.set(h, new vd());
                var k = c.get(h);
                k.push(e, g);
                k.size() === d && (b = Math.max(b, h));
              }
            }
          });
          return b ? c.get(b) : a;
        }
        function xd(a, b, c) {
          var d = {};
          b = t(b);
          for (var e = b.next(); !e.done; d = {
            zd: d.zd
          }, e = b.next()) if (d.zd = e.value, e = a.filter(function (f) {
            return function (g) {
              return g.video && g.video.codecs.startsWith(f.zd);
            };
          }(d)), e.length) {
            a = e;
            break;
          }
          d = {};
          c = t(c);
          for (b = c.next(); !b.done; d = {
            ld: d.ld
          }, b = c.next()) if (d.ld = b.value, b = a.filter(function (f) {
            return function (g) {
              return g.audio && g.audio.codecs.startsWith(f.ld);
            };
          }(d)), b.length) {
            a = b;
            break;
          }
          return a;
        }
        function Bd(a, b) {
          b = t(b);
          for (var c = b.next(); !c.done; c = b.next()) if (c = c.value, c == Dd || c == Ed) {
            if (a = Fd(a, c), 1 == a.size()) return a.keys()[0];
          } else if (c == Gd) break;
          return Hd(a);
        }
        function Fd(a, b) {
          var c = 0,
            d = new vd();
          a.forEach(function (e, f) {
            for (var g = 0, h = 0, k = t(f), l = k.next(); !l.done; l = k.next()) l = l.value, l.decodingInfos.length && (g += l.decodingInfos[0][b] ? 1 : 0, h++);
            g /= h;
            g > c ? (d.g = {}, d.push(e, f), c = g) : g == c && d.push(e, f);
          });
          return d;
        }
        function Hd(a) {
          var b = "",
            c = Infinity;
          a.forEach(function (d, e) {
            var f = 0,
              g = 0;
            e = t(e);
            for (var h = e.next(); !h.done; h = e.next()) f += h.value.bandwidth || 0, ++g;
            f /= g;
            f < c && (b = d, c = f);
          });
          return b;
        }
        function Cd(a) {
          var b = "";
          a.video && (b = $c(a.video.codecs));
          var c = "";
          a.audio && (c = $c(a.audio.codecs));
          return b + "-" + c;
        }
        function Id(a, b, c) {
          a.variants = a.variants.filter(function (d) {
            return Jd(d, b, c);
          });
        }
        function Jd(a, b, c) {
          function d(f, g, h) {
            return f >= g && f <= h;
          }
          var e = a.video;
          if (0 != a.disabledUntilTime) {
            if (a.disabledUntilTime > Date.now() / 1E3) return !1;
            a.disabledUntilTime = 0;
          }
          return e && e.width && e.height && (!d(e.width, b.minWidth, Math.min(b.maxWidth, c.width)) || !d(e.height, b.minHeight, Math.min(b.maxHeight, c.height)) || !d(e.width * e.height, b.minPixels, b.maxPixels)) || a && a.video && a.video.frameRate && !d(a.video.frameRate, b.minFrameRate, b.maxFrameRate) || !d(a.bandwidth, b.minBandwidth, b.maxBandwidth) ? !1 : !0;
        }
        function Kd(a, b, c) {
          var d = !1;
          a = t(a);
          for (var e = a.next(); !e.done; e = a.next()) {
            e = e.value;
            var f = e.allowedByApplication;
            e.allowedByApplication = Jd(e, b, c);
            f != e.allowedByApplication && (d = !0);
          }
          return d;
        }
        function Ld(a, b) {
          return G(function (c) {
            if (1 == c.g) return u(c, Md(b, 0 < b.offlineSessionIds.length), 2);
            Nd(a, b);
            Od(b);
            return u(c, Pd(b), 0);
          });
        }
        function Md(a, b) {
          return G(function (c) {
            if (1 == c.g) return u(c, Qd(a.variants, b, !1), 2);
            a.variants = a.variants.filter(function (d) {
              var e = d.video;
              if (e) {
                var f = Rd(e.codecs);
                if (e.codecs.includes(",")) {
                  var g = e.codecs.split(",");
                  f = fc("video", g);
                  f = Rd(f);
                  g = fc("audio", g);
                  g = Sd(g);
                  var h = Zc(e.mimeType, g, "audio");
                  if (!db(h)) return !1;
                  f = [f, g].join();
                }
                g = Zc(e.mimeType, f, "video");
                if (!db(g)) return !1;
                e.codecs = f;
              }
              if (f = d.audio) {
                g = Sd(f.codecs);
                h = Zc(f.mimeType, g, "audio");
                if (!db(h)) return !1;
                f.codecs = g;
              }
              if (rc() && e && (e.width && 1920 < e.width || e.height && 1080 < e.height) && (e.codecs.includes("avc1.") || e.codecs.includes("avc3."))) return ab(Td(d)), !1;
              (e = d.decodingInfos.some(function (k) {
                return k.supported;
              })) || ab(Td(d));
              return e;
            });
            A(c);
          });
        }
        function Qd(a, b, c) {
          var e, f, g, h, k, l, m, p, n, q;
          return G(function (v) {
            if (a.some(function (y) {
              return y.decodingInfos.length;
            })) return v.return();
            e = navigator.mediaCapabilities;
            f = [];
            g = function (y, w) {
              var x;
              return G(function (D) {
                if (1 == D.g) return C(D, 2), u(D, e.decodingInfo(w), 4);
                if (2 != D.g) return x = D.h, y.decodingInfos.push(x), va(D, 0);
                wa(D);
                JSON.stringify(w);
                A(D);
              });
            };
            h = t(a);
            for (k = h.next(); !k.done; k = h.next()) for (l = k.value, m = Ud(l, b, c), p = t(m), n = p.next(); !n.done; n = p.next()) q = n.value, f.push(g(l, q));
            return u(v, Promise.all(f), 0);
          });
        }
        function Ud(a, b, c) {
          var d = a.audio,
            e = a.video;
          c = {
            type: c ? "file" : "media-source"
          };
          if (e) {
            var f = e.codecs;
            if (e.codecs.includes(",")) {
              var g = e.codecs.split(",");
              f = fc("video", g);
              f = Rd(f);
              g = fc("audio", g);
              g = Sd(g);
              g = Zc(e.mimeType, g, "audio");
              c.audio = {
                contentType: g,
                channels: 2,
                bitrate: a.bandwidth || 1,
                samplerate: 1,
                spatialRendering: !1
              };
            }
            f = Rd(f);
            f = Zc(e.mimeType, f, "video");
            c.video = {
              contentType: f,
              width: e.width || 64,
              height: e.height || 64,
              bitrate: e.bandwidth || a.bandwidth || 1,
              framerate: e.frameRate || 1
            };
            if (e.hdr) switch (e.hdr) {
              case "SDR":
                c.video.transferFunction = "srgb";
                break;
              case "PQ":
                c.video.transferFunction = "pq";
                break;
              case "HLG":
                c.video.transferFunction = "hlg";
            }
          }
          d && (f = Sd(d.codecs), f = Zc(d.mimeType, f, "audio"), c.audio = {
            contentType: f,
            channels: d.channelsCount || 2,
            bitrate: d.bandwidth || a.bandwidth || 1,
            samplerate: d.audioSamplingRate || 1,
            spatialRendering: d.spatialAudio
          });
          g = (a.video ? a.video.drmInfos : []).concat(a.audio ? a.audio.drmInfos : []);
          if (!g.length) return [c];
          a = [];
          f = new Map();
          g = t(g);
          for (var h = g.next(); !h.done; h = g.next()) {
            var k = h.value;
            f.get(k.keySystem) || f.set(k.keySystem, []);
            f.get(k.keySystem).push(k);
          }
          g = b ? "required" : "optional";
          b = b ? ["persistent-license"] : ["temporary"];
          k = t(f.keys());
          for (var l = k.next(); !l.done; l = k.next()) {
            var m = l.value;
            l = Object.assign({}, c);
            var p = f.get(m);
            m = {
              keySystem: m,
              initDataType: "cenc",
              persistentState: g,
              distinctiveIdentifier: "optional",
              sessionTypes: b
            };
            p = t(p);
            for (h = p.next(); !h.done; h = p.next()) {
              h = h.value;
              if (h.initData && h.initData.length) {
                for (var n = new Set(), q = t(h.initData), v = q.next(); !v.done; v = q.next()) n.add(v.value.initDataType);
                m.initDataType = h.initData[0].initDataType;
              }
              h.distinctiveIdentifierRequired && (m.distinctiveIdentifier = "required");
              h.persistentStateRequired && (m.persistentState = "required");
              h.sessionType && (m.sessionTypes = [h.sessionType]);
              d && ("" != h.audioRobustness ? m.audio ? m.audio.robustness = m.audio.robustness || h.audioRobustness : m.audio = {
                robustness: h.audioRobustness
              } : m.audio || (m.audio = {}));
              e && ("" != h.videoRobustness ? m.video ? m.video.robustness = m.video.robustness || h.videoRobustness : m.video = {
                robustness: h.videoRobustness
              } : m.video || (m.video = {}));
            }
            l.keySystemConfiguration = m;
            a.push(l);
          }
          return a;
        }
        function Sd(a) {
          return "fLaC" === a ? "flac" : "Opus" === a ? "opus" : tc() ? "ac-3" == a.toLowerCase() ? "ec-3" : a : a;
        }
        function Rd(a) {
          if (a.includes("avc1")) {
            var b = a.split(".");
            if (3 == b.length) return a = b.shift() + ".", a += parseInt(b.shift(), 10).toString(16), a += ("000" + parseInt(b.shift(), 10).toString(16)).slice(-4);
          } else if ("vp9" == a) return "vp09.00.41.08";
          return a;
        }
        function Nd(a, b) {
          b.variants = b.variants.filter(function (c) {
            var d = c.audio;
            c = c.video;
            return d && a && a.audio && !Vd(d, a.audio) || c && a && a.video && !Vd(c, a.video) ? !1 : !0;
          });
        }
        function Od(a) {
          a.textStreams = a.textStreams.filter(function (b) {
            return dd(Yc(b.mimeType, b.codecs));
          });
        }
        function Pd(a) {
          var b, c, d, e, f, g, h;
          return G(function (l) {
            switch (l.g) {
              case 1:
                b = [], c = t(a.imageStreams), d = c.next();
              case 2:
                if (d.done) {
                  l.B(4);
                  break;
                }
                e = d.value;
                f = e.mimeType;
                if (Wd.has(f)) {
                  l.B(5);
                  break;
                }
                g = Xd.get(f);
                if (!g) {
                  Wd.set(f, !1);
                  l.B(5);
                  break;
                }
                return u(l, Yd(g), 7);
              case 7:
                h = l.h, Wd.set(f, h);
              case 5:
                (Wd.get(f)) && b.push(e);
                d = c.next();
                l.B(2);
                break;
              case 4:
                a.imageStreams = b, A(l);
            }
          });
        }
        function Yd(a) {
          return new Promise(function (b) {
            var c = new Image();
            c.src = a;
            "decode" in c ? c.decode().then(function () {
              b(!0);
            }).catch(function () {
              b(!1);
            }) : c.onload = c.onerror = function () {
              b(2 === c.height);
            };
          });
        }
        function Vd(a, b) {
          return a.mimeType != b.mimeType || a.codecs.split(".")[0] != b.codecs.split(".")[0] ? !1 : !0;
        }
        function Zd(a) {
          var b = a.audio,
            c = a.video,
            d = b ? b.mimeType : null,
            e = c ? c.mimeType : null,
            f = b ? b.codecs : null,
            g = c ? c.codecs : null,
            h = [];
          g && h.push(g);
          f && h.push(f);
          var k = [];
          c && k.push(c.mimeType);
          b && k.push(b.mimeType);
          k = k[0] || null;
          var l = [];
          b && l.push(b.kind);
          c && l.push(c.kind);
          l = l[0] || null;
          var m = new Set();
          if (b) for (var p = t(b.roles), n = p.next(); !n.done; n = p.next()) m.add(n.value);
          if (c) for (p = t(c.roles), n = p.next(); !n.done; n = p.next()) m.add(n.value);
          a = {
            id: a.id,
            active: !1,
            type: "variant",
            bandwidth: a.bandwidth,
            language: a.language,
            label: null,
            kind: l,
            width: null,
            height: null,
            frameRate: null,
            pixelAspectRatio: null,
            hdr: null,
            mimeType: k,
            audioMimeType: d,
            videoMimeType: e,
            codecs: h.join(", "),
            audioCodec: f,
            videoCodec: g,
            primary: a.primary,
            roles: Array.from(m),
            audioRoles: null,
            forced: !1,
            videoId: null,
            audioId: null,
            channelsCount: null,
            audioSamplingRate: null,
            spatialAudio: !1,
            tilesLayout: null,
            audioBandwidth: null,
            videoBandwidth: null,
            originalVideoId: null,
            originalAudioId: null,
            originalTextId: null,
            originalImageId: null
          };
          c && (a.videoId = c.id, a.originalVideoId = c.originalId, a.width = c.width || null, a.height = c.height || null, a.frameRate = c.frameRate || null, a.pixelAspectRatio = c.pixelAspectRatio || null, a.videoBandwidth = c.bandwidth || null, a.hdr = c.hdr || null);
          b && (a.audioId = b.id, a.originalAudioId = b.originalId, a.channelsCount = b.channelsCount, a.audioSamplingRate = b.audioSamplingRate, a.audioBandwidth = b.bandwidth || null, a.spatialAudio = b.spatialAudio, a.label = b.label, a.audioRoles = b.roles);
          return a;
        }
        function $d(a) {
          return {
            id: a.id,
            active: !1,
            type: ic,
            bandwidth: 0,
            language: a.language,
            label: a.label,
            kind: a.kind || null,
            width: null,
            height: null,
            frameRate: null,
            pixelAspectRatio: null,
            hdr: null,
            mimeType: a.mimeType,
            audioMimeType: null,
            videoMimeType: null,
            codecs: a.codecs || null,
            audioCodec: null,
            videoCodec: null,
            primary: a.primary,
            roles: a.roles,
            audioRoles: null,
            forced: a.forced,
            videoId: null,
            audioId: null,
            channelsCount: null,
            audioSamplingRate: null,
            spatialAudio: !1,
            tilesLayout: null,
            audioBandwidth: null,
            videoBandwidth: null,
            originalVideoId: null,
            originalAudioId: null,
            originalTextId: a.originalId,
            originalImageId: null
          };
        }
        function ae(a) {
          var b = a.width || null,
            c = a.height || null,
            d = null;
          a.segmentIndex && (d = a.segmentIndex.get(0));
          var e = a.tilesLayout;
          d && (e = d.tilesLayout || e);
          e && null != b && (b /= Number(e.split("x")[0]));
          e && null != c && (c /= Number(e.split("x")[1]));
          return {
            id: a.id,
            active: !1,
            type: "image",
            bandwidth: a.bandwidth || 0,
            language: "",
            label: null,
            kind: null,
            width: b,
            height: c,
            frameRate: null,
            pixelAspectRatio: null,
            hdr: null,
            mimeType: a.mimeType,
            audioMimeType: null,
            videoMimeType: null,
            codecs: null,
            audioCodec: null,
            videoCodec: null,
            primary: !1,
            roles: [],
            audioRoles: null,
            forced: !1,
            videoId: null,
            audioId: null,
            channelsCount: null,
            audioSamplingRate: null,
            spatialAudio: !1,
            tilesLayout: e || null,
            audioBandwidth: null,
            videoBandwidth: null,
            originalVideoId: null,
            originalAudioId: null,
            originalTextId: null,
            originalImageId: a.originalId
          };
        }
        function be(a) {
          a.__shaka_id || (a.__shaka_id = ce++);
          return a.__shaka_id;
        }
        function de(a) {
          var b = ee(a);
          b.active = "disabled" != a.mode;
          b.type = "text";
          b.originalTextId = a.id;
          "captions" == a.kind && (b.mimeType = "application/cea-608");
          "subtitles" == a.kind && (b.mimeType = "text/vtt");
          a.kind && (b.roles = [a.kind]);
          "forced" == a.kind && (b.forced = !0);
          return b;
        }
        function fe(a) {
          var b = ee(a);
          b.active = a.enabled;
          b.type = "variant";
          b.originalAudioId = a.id;
          "main" == a.kind && (b.primary = !0);
          a.kind && (b.roles = [a.kind], b.audioRoles = [a.kind], b.label = a.label);
          return b;
        }
        function ee(a) {
          var b = a.language;
          return {
            id: be(a),
            active: !1,
            type: "",
            bandwidth: 0,
            language: nd(b || "und"),
            label: a.label,
            kind: a.kind,
            width: null,
            height: null,
            frameRate: null,
            pixelAspectRatio: null,
            hdr: null,
            mimeType: null,
            audioMimeType: null,
            videoMimeType: null,
            codecs: null,
            audioCodec: null,
            videoCodec: null,
            primary: !1,
            roles: [],
            forced: !1,
            audioRoles: null,
            videoId: null,
            audioId: null,
            channelsCount: null,
            audioSamplingRate: null,
            spatialAudio: !1,
            tilesLayout: null,
            audioBandwidth: null,
            videoBandwidth: null,
            originalVideoId: null,
            originalAudioId: null,
            originalTextId: null,
            originalImageId: null,
            wh: b
          };
        }
        function ge(a) {
          return a.allowedByApplication && a.allowedByKeySystem;
        }
        function he(a) {
          return a.filter(function (b) {
            return ge(b);
          });
        }
        function yd(a, b) {
          var c = a.filter(function (g) {
              return g.audio && g.audio.channelsCount;
            }),
            d = new Map();
          c = t(c);
          for (var e = c.next(); !e.done; e = c.next()) {
            e = e.value;
            var f = e.audio.channelsCount;
            d.has(f) || d.set(f, []);
            d.get(f).push(e);
          }
          c = Array.from(d.keys());
          if (0 == c.length) return a;
          a = c.filter(function (g) {
            return g <= b;
          });
          return a.length ? d.get(Math.max.apply(Math, ia(a))) : d.get(Math.min.apply(Math, ia(c)));
        }
        function ie(a, b, c, d) {
          var e = a,
            f = a.filter(function (k) {
              return k.primary;
            });
          f.length && (e = f);
          var g = e.length ? e[0].language : "";
          e = e.filter(function (k) {
            return k.language == g;
          });
          if (b) {
            var h = ud(nd(b), a.map(function (k) {
              return k.language;
            }));
            h && (e = a.filter(function (k) {
              return nd(k.language) == h;
            }));
          }
          e = e.filter(function (k) {
            return k.forced == d;
          });
          if (c) {
            if (a = je(e, c), a.length) return a;
          } else if (a = e.filter(function (k) {
            return 0 == k.roles.length;
          }), a.length) return a;
          a = e.map(function (k) {
            return k.roles;
          }).reduce(ac, []);
          return a.length ? je(e, a[0]) : e;
        }
        function je(a, b) {
          return a.filter(function (c) {
            return c.roles.includes(b);
          });
        }
        function Td(a) {
          var b = [];
          a.audio && b.push(ke(a.audio));
          a.video && b.push(ke(a.video));
          return b.join(", ");
        }
        function ke(a) {
          return "audio" == a.type ? "type=audio codecs=" + a.codecs + " bandwidth=" + a.bandwidth + " channelsCount=" + a.channelsCount + " audioSamplingRate=" + a.audioSamplingRate : "video" == a.type ? "type=video codecs=" + a.codecs + " bandwidth=" + a.bandwidth + " frameRate=" + a.frameRate + " width=" + a.width + " height=" + a.height : "unexpected stream type";
        }
        var ce = 0,
          Dd = "smooth",
          Ed = "powerEfficient",
          Gd = "bandwidth",
          Wd = new Map().set("image/svg+xml", !0).set("image/png", !0).set("image/jpeg", !0).set("image/jpg", !0),
          Xd = new Map().set("image/webp", "data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA").set("image/avif", "data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgANogQEAwgMg8f8D///8WfhwB8+ErK42A=");
        function le() {
          var a = this;
          this.l = null;
          this.o = !1;
          this.i = new Ta();
          this.u = null;
          navigator.connection && navigator.connection.addEventListener && (this.u = function () {
            if (a.o && a.g.useNetworkInformation) {
              a.i = new Ta();
              a.g && a.i.configure(a.g.advanced);
              var b = a.chooseVariant();
              b && a.l(b);
            }
          }, navigator.connection.addEventListener("change", this.u));
          this.m = [];
          this.A = 1;
          this.F = !1;
          this.h = this.j = this.g = this.s = null;
          this.D = new P(function () {
            if (a.g.restrictToElementSize) {
              var b = a.chooseVariant();
              b && a.l(b);
            }
          });
        }
        r = le.prototype;
        r.stop = function () {
          this.l = null;
          this.o = !1;
          this.m = [];
          this.A = 1;
          this.j = this.s = null;
          this.h && (this.h.disconnect(), this.h = null);
          this.D.stop();
        };
        r.release = function () {
          navigator.connection && navigator.connection.removeEventListener && (navigator.connection.removeEventListener("change", this.u), this.u = null);
          this.D = null;
        };
        r.init = function (a) {
          this.l = a;
        };
        r.chooseVariant = function () {
          var a = Infinity,
            b = Infinity;
          this.g.restrictToScreenSize && (b = this.g.ignoreDevicePixelRatio ? 1 : window.devicePixelRatio, a = window.screen.height * b, b *= window.screen.width);
          this.h && this.g.restrictToElementSize && (b = this.g.ignoreDevicePixelRatio ? 1 : window.devicePixelRatio, a = this.j.clientHeight * b, b *= this.j.clientWidth);
          a = me(this.g.restrictions, this.m, a, b);
          b = this.i.getBandwidthEstimate(ne(this));
          this.m.length && !a.length && (a = me(null, this.m, Infinity, Infinity), a = [a[0]]);
          for (var c = a[0] || null, d = 0; d < a.length; d++) {
            for (var e = a[d], f = isNaN(this.A) ? 1 : Math.abs(this.A), g = f * e.bandwidth / this.g.bandwidthDowngradeTarget, h = {
                bandwidth: Infinity
              }, k = d + 1; k < a.length; k++) if (e.bandwidth != a[k].bandwidth) {
              h = a[k];
              break;
            }
            f = f * h.bandwidth / this.g.bandwidthUpgradeTarget;
            b >= g && b <= f && c.bandwidth != e.bandwidth && (c = e);
          }
          this.s = Date.now();
          return c;
        };
        r.enable = function () {
          this.o = !0;
        };
        r.disable = function () {
          this.o = !1;
        };
        r.segmentDownloaded = function (a, b) {
          this.i.sample(a, b);
          if (null != this.s && this.o) a: {
            if (!this.F) {
              a = this.i;
              if (!(a.g >= a.i)) break a;
              this.F = !0;
            } else if (Date.now() - this.s < 1E3 * this.g.switchInterval) break a;
            a = this.chooseVariant();
            this.i.getBandwidthEstimate(ne(this));
            a && this.l(a);
          }
        };
        r.getBandwidthEstimate = function () {
          return this.i.getBandwidthEstimate(ne(this));
        };
        r.setVariants = function (a) {
          this.m = a;
        };
        r.playbackRateChanged = function (a) {
          this.A = a;
        };
        r.setMediaElement = function (a) {
          var b = this;
          this.j = a;
          this.h && (this.h.disconnect(), this.h = null);
          this.j && "ResizeObserver" in window && (this.h = new ResizeObserver(function () {
            b.D.O(oe);
          }), this.h.observe(this.j));
        };
        r.configure = function (a) {
          this.g = a;
          this.i && this.g && this.i.configure(this.g.advanced);
        };
        function ne(a) {
          var b = a.g.defaultBandwidthEstimate;
          navigator.connection && navigator.connection.downlink && a.g.useNetworkInformation && (b = 1E6 * navigator.connection.downlink);
          return b;
        }
        function me(a, b, c, d) {
          a && (b = b.filter(function (e) {
            return Jd(e, a, {
              width: d,
              height: c
            });
          }));
          return b.sort(function (e, f) {
            return e.bandwidth - f.bandwidth;
          });
        }
        K("shaka.abr.SimpleAbrManager", le);
        le.prototype.configure = le.prototype.configure;
        le.prototype.setMediaElement = le.prototype.setMediaElement;
        le.prototype.playbackRateChanged = le.prototype.playbackRateChanged;
        le.prototype.setVariants = le.prototype.setVariants;
        le.prototype.getBandwidthEstimate = le.prototype.getBandwidthEstimate;
        le.prototype.segmentDownloaded = le.prototype.segmentDownloaded;
        le.prototype.disable = le.prototype.disable;
        le.prototype.enable = le.prototype.enable;
        le.prototype.chooseVariant = le.prototype.chooseVariant;
        le.prototype.init = le.prototype.init;
        le.prototype.release = le.prototype.release;
        le.prototype.stop = le.prototype.stop;
        var oe = 1;
        function pe(a, b) {
          this.g = a;
          this.h = b;
        }
        pe.prototype.toString = function () {
          return "v" + this.g + "." + this.h;
        };
        function qe(a, b) {
          var c = new pe(5, 0),
            d = re,
            e = d.g,
            f = c.h - e.h;
          (0 < (c.g - e.g || f) ? d.i : d.h)(d.g, c, a, b);
        }
        function se(a, b, c, d) {
          Xa([c, "has been deprecated and will be removed in", b, ". We are currently at version", a, ". Additional information:", d].join(" "));
        }
        function te(a, b, c, d) {
          Wa([c, "has been deprecated and has been removed in", b, ". We are now at version", a, ". Additional information:", d].join(""));
        }
        var re = null;
        K("shaka.config.AutoShowText", {
          NEVER: 0,
          ALWAYS: 1,
          IF_PREFERRED_TEXT_LANGUAGE: 2,
          IF_SUBTITLES_MAY_BE_NEEDED: 3
        });
        function ue(a, b) {
          this.h = a;
          this.g = new Set([a]);
          b = b || [];
          a = t(b);
          for (b = a.next(); !b.done; b = a.next()) this.add(b.value);
        }
        ue.prototype.add = function (a) {
          return ve(this.h, a) ? (this.g.add(a), !0) : !1;
        };
        function ve(a, b) {
          var c;
          if (!(c = !!a.audio != !!b.audio || !!a.video != !!b.video || a.language != b.language) && (c = a.audio && b.audio)) {
            c = a.audio;
            var d = b.audio;
            c = !((!(!c.channelsCount || !d.channelsCount || 2 < c.channelsCount || 2 < d.channelsCount) || c.channelsCount == d.channelsCount) && we(c, d) && xe(c.roles, d.roles));
          }
          !c && (c = a.video && b.video) && (a = a.video, b = b.video, c = !(we(a, b) && xe(a.roles, b.roles)));
          return c ? !1 : !0;
        }
        ue.prototype.values = function () {
          return this.g.values();
        };
        function we(a, b) {
          if (a.mimeType != b.mimeType) return !1;
          a = a.codecs.split(",").map(function (d) {
            return ad(d)[0];
          });
          b = b.codecs.split(",").map(function (d) {
            return ad(d)[0];
          });
          if (a.length != b.length) return !1;
          a.sort();
          b.sort();
          for (var c = 0; c < a.length; c++) if (a[c] != b[c]) return !1;
          return !0;
        }
        function xe(a, b) {
          a = new Set(a);
          b = new Set(b);
          a.delete("main");
          b.delete("main");
          if (a.size != b.size) return !1;
          a = t(a);
          for (var c = a.next(); !c.done; c = a.next()) if (!b.has(c.value)) return !1;
          return !0;
        }
        function ye(a) {
          this.g = a;
          this.h = new ze(a.language, "", a.audio && a.audio.channelsCount ? a.audio.channelsCount : 0, "");
        }
        ye.prototype.create = function (a) {
          var b = this,
            c = a.filter(function (d) {
              return ve(b.g, d);
            });
          return c.length ? new ue(c[0], c) : this.h.create(a);
        };
        function ze(a, b, c, d) {
          this.i = a;
          this.j = b;
          this.g = c;
          this.h = void 0 === d ? "" : d;
        }
        ze.prototype.create = function (a) {
          var b = [];
          b = Ae(a, this.i);
          var c = a.filter(function (d) {
            return d.primary;
          });
          b = b.length ? b : c.length ? c : a;
          a = Be(b, this.j);
          a.length && (b = a);
          this.g && (a = yd(b, this.g), a.length && (b = a));
          this.h && (a = Ce(b, this.h), a.length && (b = a));
          a = new ue(b[0]);
          b = t(b);
          for (c = b.next(); !c.done; c = b.next()) c = c.value, ve(a.h, c) && a.add(c);
          return a;
        };
        function Ae(a, b) {
          b = nd(b);
          var c = ud(b, a.map(function (d) {
            return td(d);
          }));
          return c ? a.filter(function (d) {
            return c == td(d);
          }) : [];
        }
        function Be(a, b) {
          return a.filter(function (c) {
            return c.audio ? b ? c.audio.roles.includes(b) : 0 == c.audio.roles.length : !1;
          });
        }
        function Ce(a, b) {
          return a.filter(function (c) {
            return c.audio ? c.audio.label.toLowerCase() == b.toLowerCase() : !1;
          });
        }
        function De() {
          this.g = Ee;
          this.h = new Map().set(Ee, 2).set(Fe, 1);
        }
        function Ge(a, b, c) {
          a.h.set(Ee, c).set(Fe, b);
        }
        var Fe = 0,
          Ee = 1;
        function He(a, b) {
          var c = Ie();
          this.l = null == a.maxAttempts ? c.maxAttempts : a.maxAttempts;
          this.j = null == a.baseDelay ? c.baseDelay : a.baseDelay;
          this.o = null == a.fuzzFactor ? c.fuzzFactor : a.fuzzFactor;
          this.m = null == a.backoffFactor ? c.backoffFactor : a.backoffFactor;
          this.g = 0;
          this.h = this.j;
          if (this.i = void 0 === b ? !1 : b) this.g = 1;
        }
        function Je(a) {
          var b, c;
          return G(function (d) {
            if (1 == d.g) {
              if (a.g >= a.l) if (a.i) a.g = 1, a.h = a.j;else throw new O(2, 7, 1010);
              b = a.g;
              a.g++;
              if (0 == b) return d.return();
              c = a.h * (1 + (2 * Math.random() - 1) * a.o);
              return u(d, new Promise(function (e) {
                new P(e).O(c / 1E3);
              }), 2);
            }
            a.h *= a.m;
            A(d);
          });
        }
        function Ie() {
          return {
            maxAttempts: 2,
            baseDelay: 1E3,
            backoffFactor: 2,
            fuzzFactor: .5,
            timeout: 3E4,
            stallTimeout: 5E3,
            connectionTimeout: 1E4
          };
        }
        function Ke(a, b) {
          this.promise = a;
          this.i = b;
          this.g = !1;
        }
        function Le(a) {
          return new Ke(Promise.reject(a), function () {
            return Promise.resolve();
          });
        }
        function Me() {
          var a = Promise.reject(new O(2, 7, 7001));
          a.catch(function () {});
          return new Ke(a, function () {
            return Promise.resolve();
          });
        }
        function Ne(a) {
          return new Ke(Promise.resolve(a), function () {
            return Promise.resolve();
          });
        }
        function Oe(a) {
          return new Ke(a, function () {
            return a.catch(function () {});
          });
        }
        Ke.prototype.abort = function () {
          this.g = !0;
          return this.i();
        };
        function Pe(a) {
          return new Ke(Promise.all(a.map(function (b) {
            return b.promise;
          })), function () {
            return Promise.all(a.map(function (b) {
              return b.abort();
            }));
          });
        }
        Ke.prototype.finally = function (a) {
          this.promise.then(function () {
            return a(!0);
          }, function () {
            return a(!1);
          });
          return this;
        };
        Ke.prototype.Z = function (a, b) {
          function c(h) {
            return function (k) {
              if (e.g && h) f.reject(g);else {
                var l = h ? a : b;
                l ? d = Qe(l, k, f) : (h ? f.resolve : f.reject)(k);
              }
            };
          }
          function d() {
            f.reject(g);
            return e.abort();
          }
          var e = this,
            f = new kc(),
            g = new O(2, 7, 7001);
          this.promise.then(c(!0), c(!1));
          return new Ke(f, function () {
            return d();
          });
        };
        function Qe(a, b, c) {
          try {
            var d = a(b);
            if (d && d.promise && d.abort) return c.resolve(d.promise), function () {
              return d.abort();
            };
            c.resolve(d);
            return function () {
              return Promise.resolve(d).then(function () {}, function () {});
            };
          } catch (e) {
            return c.reject(e), function () {
              return Promise.resolve();
            };
          }
        }
        K("shaka.util.AbortableOperation", Ke);
        Ke.prototype.chain = Ke.prototype.Z;
        Ke.prototype["finally"] = Ke.prototype.finally;
        Ke.all = Pe;
        Ke.prototype.abort = Ke.prototype.abort;
        Ke.notAbortable = Oe;
        Ke.completed = Ne;
        Ke.aborted = Me;
        Ke.failed = Le;
        function S(a, b) {
          if (b) if (b instanceof Map) for (var c = t(b.keys()), d = c.next(); !d.done; d = c.next()) d = d.value, Object.defineProperty(this, d, {
            value: b.get(d),
            writable: !0,
            enumerable: !0
          });else for (c in b) Object.defineProperty(this, c, {
            value: b[c],
            writable: !0,
            enumerable: !0
          });
          this.defaultPrevented = this.cancelable = this.bubbles = !1;
          this.timeStamp = window.performance && window.performance.now ? window.performance.now() : Date.now();
          this.type = a;
          this.isTrusted = !1;
          this.target = this.currentTarget = null;
          this.g = !1;
        }
        function Re(a) {
          var b = new S(a.type),
            c;
          for (c in a) Object.defineProperty(b, c, {
            value: a[c],
            writable: !0,
            enumerable: !0
          });
          return b;
        }
        S.prototype.preventDefault = function () {
          this.cancelable && (this.defaultPrevented = !0);
        };
        S.prototype.stopImmediatePropagation = function () {
          this.g = !0;
        };
        S.prototype.stopPropagation = function () {};
        K("shaka.util.FakeEvent", S);
        var Se = {
          Kg: "abrstatuschanged",
          Lg: "adaptation",
          Mg: "buffering",
          Ng: "downloadfailed",
          Og: "downloadheadersreceived",
          Pg: "drmsessionupdate",
          Rg: "emsg",
          bh: "prft",
          Error: "error",
          Sg: "expirationupdated",
          Tg: "gapjumped",
          Vg: "loaded",
          Wg: "loading",
          Yg: "manifestparsed",
          Zg: "mediaqualitychanged",
          Metadata: "metadata",
          $g: "onstatechange",
          ah: "onstateidle",
          dh: "ratechange",
          fh: "segmentappended",
          gh: "sessiondata",
          hh: "stalldetected",
          ih: "streaming",
          jh: "textchanged",
          kh: "texttrackvisibility",
          lh: "timelineregionadded",
          mh: "timelineregionenter",
          nh: "timelineregionexit",
          oh: "trackschanged",
          qh: "unloading",
          rh: "variantchanged"
        };
        function Te() {
          this.da = new vd();
          this.Xc = this;
        }
        Te.prototype.addEventListener = function (a, b) {
          this.da && this.da.push(a, b);
        };
        Te.prototype.removeEventListener = function (a, b) {
          this.da && this.da.remove(a, b);
        };
        Te.prototype.dispatchEvent = function (a) {
          if (!this.da) return !0;
          var b = this.da.get(a.type) || [],
            c = this.da.get("All");
          c && (b = b.concat(c));
          b = t(b);
          for (c = b.next(); !c.done; c = b.next()) {
            c = c.value;
            a.target = this.Xc;
            a.currentTarget = this.Xc;
            try {
              c.handleEvent ? c.handleEvent(a) : c.call(this, a);
            } catch (d) {}
            if (a.g) break;
          }
          return a.defaultPrevented;
        };
        Te.prototype.release = function () {
          this.da = null;
        };
        function Ue(a) {
          function b(d) {
            switch (typeof d) {
              case "undefined":
              case "boolean":
              case "number":
              case "string":
              case "symbol":
              case "function":
                return d;
              default:
                if (!d || d.buffer && d.buffer.constructor == ArrayBuffer) return d;
                if (c.has(d)) return null;
                var e = d.constructor == Array;
                if (d.constructor != Object && !e) return null;
                c.add(d);
                var f = e ? [] : {},
                  g;
                for (g in d) f[g] = b(d[g]);
                e && (f.length = d.length);
                return f;
            }
          }
          var c = new Set();
          return b(a);
        }
        function Ve(a) {
          var b = {},
            c;
          for (c in a) b[c] = a[c];
          return b;
        }
        function We() {
          this.g = [];
        }
        function Xe(a, b) {
          a.g.push(b.finally(function () {
            gb(a.g, b);
          }));
        }
        We.prototype.destroy = function () {
          for (var a = [], b = t(this.g), c = b.next(); !c.done; c = b.next()) c = c.value, c.promise.catch(function () {}), a.push(c.abort());
          this.g = [];
          return Promise.all(a);
        };
        function Ye(a, b, c) {
          Te.call(this);
          this.i = !1;
          this.m = new We();
          this.g = new Set();
          this.h = new Set();
          this.l = a || null;
          this.j = b || null;
          this.s = c || null;
          this.o = !1;
        }
        qa(Ye, Te);
        r = Ye.prototype;
        r.le = function (a) {
          this.o = a;
        };
        function Ze(a, b, c, d) {
          c = c || $e;
          var e = af[a];
          if (!e || c >= e.priority) af[a] = {
            priority: c,
            lg: b,
            mg: void 0 === d ? !1 : d
          };
        }
        r.ng = function (a) {
          this.g.add(a);
        };
        r.Dg = function (a) {
          this.g.delete(a);
        };
        r.tf = function () {
          this.g.clear();
        };
        r.og = function (a) {
          this.h.add(a);
        };
        r.Eg = function (a) {
          this.h.delete(a);
        };
        r.uf = function () {
          this.h.clear();
        };
        function bf(a, b, c) {
          return {
            uris: a,
            method: "GET",
            body: null,
            headers: {},
            allowCrossSiteCredentials: !1,
            retryParameters: b,
            licenseRequestType: null,
            sessionId: null,
            drmInfo: null,
            initData: null,
            initDataType: null,
            streamDataCallback: void 0 === c ? null : c
          };
        }
        r.destroy = function () {
          this.i = !0;
          this.g.clear();
          this.h.clear();
          Te.prototype.release.call(this);
          return this.m.destroy();
        };
        r.request = function (a, b) {
          var c = this,
            d = new cf();
          if (this.i) {
            var e = Promise.reject(new O(2, 7, 7001));
            e.catch(function () {});
            return new df(e, function () {
              return Promise.resolve();
            }, d);
          }
          b.method = b.method || "GET";
          b.headers = b.headers || {};
          b.retryParameters = b.retryParameters ? Ue(b.retryParameters) : Ie();
          b.uris = Ue(b.uris);
          e = ef(this, a, b);
          var f = e.Z(function () {
              return ff(c, a, b, new He(b.retryParameters, !1), 0, null, d);
            }),
            g = f.Z(function (p) {
              return gf(c, a, p);
            }),
            h = Date.now(),
            k = 0;
          e.promise.then(function () {
            k = Date.now() - h;
          }, function () {});
          var l = 0;
          f.promise.then(function () {
            l = Date.now();
          }, function () {});
          var m = g.Z(function (p) {
            var n = Date.now() - l,
              q = p.response;
            q.timeMs += k;
            q.timeMs += n;
            p.Zf || !c.l || q.fromCache || "HEAD" == b.method || a != hf || c.l(q.timeMs, q.data.byteLength);
            return q;
          }, function (p) {
            p && (p.severity = 2);
            throw p;
          });
          e = new df(m.promise, function () {
            return m.abort();
          }, d);
          Xe(this.m, e);
          return e;
        };
        function ef(a, b, c) {
          var d = Ne(void 0),
            e = {};
          a = t(a.g);
          for (var f = a.next(); !f.done; e = {
            ud: e.ud
          }, f = a.next()) e.ud = f.value, d = d.Z(function (g) {
            return function () {
              c.body && (c.body = Hb(c.body));
              return g.ud(b, c);
            };
          }(e));
          return d.Z(void 0, function (g) {
            if (g instanceof O && 7001 == g.code) throw g;
            throw new O(2, 1, 1006, g);
          });
        }
        function ff(a, b, c, d, e, f, g) {
          a.o && (c.uris[e] = c.uris[e].replace("http://", "https://"));
          var h = new Mb(c.uris[e]),
            k = h.Ea,
            l = !1;
          k || (k = location.protocol, k = k.slice(0, -1), Nb(h, k), c.uris[e] = h.toString());
          k = k.toLowerCase();
          var m = (k = af[k]) ? k.lg : null;
          if (!m) return Le(new O(2, 1, 1E3, h));
          var p = k.mg,
            n = null,
            q = null,
            v = !1,
            y = !1,
            w;
          return Oe(Je(d)).Z(function () {
            if (a.i) return Me();
            w = Date.now();
            var x = m(c.uris[e], c, b, function (B, E, F) {
              n && n.stop();
              q && q.O(z / 1E3);
              a.l && b == hf && (a.l(B, E), l = !0, g.g = F);
            }, function (B) {
              a.j && a.j(B, c, b);
              y = !0;
            });
            if (!p) return x;
            var D = c.retryParameters.connectionTimeout;
            D && (n = new P(function () {
              v = !0;
              x.abort();
            }), n.O(D / 1E3));
            var z = c.retryParameters.stallTimeout;
            z && (q = new P(function () {
              v = !0;
              x.abort();
            }));
            return x;
          }).Z(function (x) {
            n && n.stop();
            q && q.stop();
            void 0 == x.timeMs && (x.timeMs = Date.now() - w);
            var D = {
              response: x,
              Zf: l
            };
            !y && a.j && a.j(x.headers, c, b);
            return D;
          }, function (x) {
            n && n.stop();
            q && q.stop();
            if (a.s) {
              var D = null,
                z = 0;
              x instanceof O && (D = x, 1001 == x.code && (z = x.data[1]));
              a.s(c, D, z, v);
            }
            if (a.i) return Me();
            v && (x = new O(1, 1, 1003, c.uris[e], b));
            if (x instanceof O) {
              if (7001 == x.code) throw x;
              if (1010 == x.code) throw f;
              if (1 == x.severity) return D = new Map().set("error", x), D = new S("retry", D), a.dispatchEvent(D), e = (e + 1) % c.uris.length, ff(a, b, c, d, e, x, g);
            }
            throw x;
          });
        }
        function gf(a, b, c) {
          var d = Ne(void 0),
            e = {};
          a = t(a.h);
          for (var f = a.next(); !f.done; e = {
            vd: e.vd
          }, f = a.next()) e.vd = f.value, d = d.Z(function (g) {
            return function () {
              var h = c.response;
              h.data && (h.data = Hb(h.data));
              return g.vd(b, h);
            };
          }(e));
          return d.Z(function () {
            return c;
          }, function (g) {
            var h = 2;
            if (g instanceof O) {
              if (7001 == g.code) throw g;
              h = g.severity;
            }
            throw new O(h, 1, 1007, g);
          });
        }
        K("shaka.net.NetworkingEngine", Ye);
        Ye.prototype.request = Ye.prototype.request;
        Ye.prototype.destroy = Ye.prototype.destroy;
        Ye.makeRequest = bf;
        Ye.defaultRetryParameters = function () {
          return Ie();
        };
        Ye.prototype.clearAllResponseFilters = Ye.prototype.uf;
        Ye.prototype.unregisterResponseFilter = Ye.prototype.Eg;
        Ye.prototype.registerResponseFilter = Ye.prototype.og;
        Ye.prototype.clearAllRequestFilters = Ye.prototype.tf;
        Ye.prototype.unregisterRequestFilter = Ye.prototype.Dg;
        Ye.prototype.registerRequestFilter = Ye.prototype.ng;
        Ye.unregisterScheme = function (a) {
          delete af[a];
        };
        Ye.registerScheme = Ze;
        Ye.prototype.setForceHTTPS = Ye.prototype.le;
        function cf() {
          this.g = 0;
        }
        Ye.NumBytesRemainingClass = cf;
        function df(a, b, c) {
          Ke.call(this, a, b);
          this.h = c;
        }
        qa(df, Ke);
        Ye.PendingRequest = df;
        var hf = 1;
        Ye.RequestType = {
          MANIFEST: 0,
          SEGMENT: hf,
          LICENSE: 2,
          APP: 3,
          TIMING: 4,
          SERVER_CERTIFICATE: 5,
          KEY: 6
        };
        var $e = 3;
        Ye.PluginPriority = {
          FALLBACK: 1,
          PREFERRED: 2,
          APPLICATION: $e
        };
        var af = {};
        function jf(a) {
          this.g = !1;
          this.h = new kc();
          this.i = a;
        }
        jf.prototype.destroy = function () {
          var a = this;
          if (this.g) return this.h;
          this.g = !0;
          return this.i().then(function () {
            a.h.resolve();
          }, function () {
            a.h.resolve();
          });
        };
        function kf(a, b) {
          if (a.g) {
            if (b instanceof O && 7003 == b.code) throw b;
            throw new O(2, 7, 7003, b);
          }
        }
        function lf() {
          this.g = new vd();
        }
        r = lf.prototype;
        r.release = function () {
          this.ob();
          this.g = null;
        };
        r.C = function (a, b, c, d) {
          this.g && (a = new mf(a, b, c, d), this.g.push(b, a));
        };
        r.ia = function (a, b, c, d) {
          function e(g) {
            f.Ac(a, b, e);
            c(g);
          }
          var f = this;
          this.C(a, b, e, d);
        };
        r.Ac = function (a, b, c) {
          if (this.g) {
            var d = this.g.get(b) || [];
            d = t(d);
            for (var e = d.next(); !e.done; e = d.next()) e = e.value, e.target != a || c != e.listener && c || (e.Ac(), this.g.remove(b, e));
          }
        };
        r.ob = function () {
          if (this.g) {
            var a = this.g,
              b = [],
              c;
            for (c in a.g) b.push.apply(b, ia(a.g[c]));
            a = t(b);
            for (b = a.next(); !b.done; b = a.next()) b.value.Ac();
            this.g.g = {};
          }
        };
        K("shaka.util.EventManager", lf);
        lf.prototype.removeAll = lf.prototype.ob;
        lf.prototype.unlisten = lf.prototype.Ac;
        lf.prototype.listenOnce = lf.prototype.ia;
        lf.prototype.listen = lf.prototype.C;
        lf.prototype.release = lf.prototype.release;
        function mf(a, b, c, d) {
          this.target = a;
          this.type = b;
          this.listener = c;
          this.g = nf(a, d);
          this.target.addEventListener(b, c, this.g);
        }
        mf.prototype.Ac = function () {
          this.target.removeEventListener(this.type, this.listener, this.g);
          this.listener = this.target = null;
          this.g = !1;
        };
        function nf(a, b) {
          if (void 0 == b) return !1;
          if ("boolean" == typeof b) return b;
          var c = new Set(["passive", "capture"]);
          Object.keys(b).filter(function (d) {
            return !c.has(d);
          });
          return of(a) ? b : b.capture || !1;
        }
        function of(a) {
          var b = pf;
          if (void 0 == b) {
            b = !1;
            try {
              var c = {},
                d = {
                  get: function () {
                    b = !0;
                    return !1;
                  }
                };
              Object.defineProperty(c, "passive", d);
              Object.defineProperty(c, "capture", d);
              d = function () {};
              a.addEventListener("test", d, c);
              a.removeEventListener("test", d, c);
            } catch (e) {
              b = !1;
            }
            pf = b;
          }
          return b || !1;
        }
        var pf = void 0;
        function qf(a, b) {
          var c = [];
          a = t(a);
          for (var d = a.next(); !d.done; d = a.next()) c.push(b(d.value));
          return c;
        }
        function rf(a, b) {
          a = t(a);
          for (var c = a.next(); !c.done; c = a.next()) if (!b(c.value)) return !1;
          return !0;
        }
        function sf(a) {
          for (var b = new Map(), c = t(Object.keys(a)), d = c.next(); !d.done; d = c.next()) d = d.value, b.set(d, a[d]);
          return b;
        }
        function tf(a) {
          var b = {};
          a.forEach(function (c, d) {
            b[d] = c;
          });
          return b;
        }
        function uf(a, b) {
          if (a || b) {
            if (a && !b || b && !a) return !1;
          } else return !0;
          if (a.size != b.size) return !1;
          a = t(a);
          for (var c = a.next(); !c.done; c = a.next()) {
            var d = t(c.value);
            c = d.next().value;
            d = d.next().value;
            if (!b.has(c)) return !1;
            c = b.get(c);
            if (c != d || void 0 == c) return !1;
          }
          return !0;
        }
        function vf(a, b) {
          this.S = Jb(a);
          this.h = b == wf;
          this.g = 0;
        }
        r = vf.prototype;
        r.ha = function () {
          return this.g < this.S.byteLength;
        };
        r.$ = function () {
          return this.g;
        };
        r.Hf = function () {
          return this.S.byteLength;
        };
        r.Ra = function () {
          try {
            var a = this.S.getUint8(this.g);
            this.g += 1;
            return a;
          } catch (b) {
            throw xf();
          }
        };
        r.be = function () {
          try {
            var a = this.S.getUint16(this.g, this.h);
            this.g += 2;
            return a;
          } catch (b) {
            throw xf();
          }
        };
        r.K = function () {
          try {
            var a = this.S.getUint32(this.g, this.h);
            this.g += 4;
            return a;
          } catch (b) {
            throw xf();
          }
        };
        r.Qe = function () {
          try {
            var a = this.S.getInt32(this.g, this.h);
            this.g += 4;
            return a;
          } catch (b) {
            throw xf();
          }
        };
        r.$a = function () {
          try {
            if (this.h) {
              var a = this.S.getUint32(this.g, !0);
              var b = this.S.getUint32(this.g + 4, !0);
            } else b = this.S.getUint32(this.g, !1), a = this.S.getUint32(this.g + 4, !1);
          } catch (c) {
            throw xf();
          }
          if (2097151 < b) throw new O(2, 3, 3001);
          this.g += 8;
          return b * Math.pow(2, 32) + a;
        };
        r.Za = function (a) {
          if (this.g + a > this.S.byteLength) throw xf();
          var b = L(this.S, this.g, a);
          this.g += a;
          return b;
        };
        r.skip = function (a) {
          if (this.g + a > this.S.byteLength) throw xf();
          this.g += a;
        };
        r.ug = function (a) {
          if (this.g < a) throw xf();
          this.g -= a;
        };
        r.seek = function (a) {
          if (0 > a || a > this.S.byteLength) throw xf();
          this.g = a;
        };
        r.tc = function () {
          for (var a = this.g; this.ha() && 0 != this.S.getUint8(this.g);) this.g += 1;
          a = L(this.S, a, this.g - a);
          this.g += 1;
          return Bc(a);
        };
        function xf() {
          return new O(2, 3, 3E3);
        }
        K("shaka.util.DataViewReader", vf);
        vf.prototype.readTerminatedString = vf.prototype.tc;
        vf.prototype.seek = vf.prototype.seek;
        vf.prototype.rewind = vf.prototype.ug;
        vf.prototype.skip = vf.prototype.skip;
        vf.prototype.readBytes = vf.prototype.Za;
        vf.prototype.readUint64 = vf.prototype.$a;
        vf.prototype.readInt32 = vf.prototype.Qe;
        vf.prototype.readUint32 = vf.prototype.K;
        vf.prototype.readUint16 = vf.prototype.be;
        vf.prototype.readUint8 = vf.prototype.Ra;
        vf.prototype.getLength = vf.prototype.Hf;
        vf.prototype.getPosition = vf.prototype.$;
        vf.prototype.hasMoreData = vf.prototype.ha;
        var wf = 1;
        vf.Endianness = {
          BIG_ENDIAN: 0,
          LITTLE_ENDIAN: wf
        };
        function yf() {
          this.i = [];
          this.h = [];
          this.g = !1;
        }
        r = yf.prototype;
        r.box = function (a, b) {
          a = zf(a);
          this.i[a] = Af;
          this.h[a] = b;
          return this;
        };
        r.R = function (a, b) {
          a = zf(a);
          this.i[a] = Bf;
          this.h[a] = b;
          return this;
        };
        r.stop = function () {
          this.g = !0;
        };
        r.parse = function (a, b, c) {
          a = new vf(a, 0);
          for (this.g = !1; a.ha() && !this.g;) this.rc(0, a, b, c);
        };
        r.rc = function (a, b, c, d) {
          var e = b.$();
          if (d && e + 8 > b.S.byteLength) this.g = !0;else {
            var f = b.K(),
              g = b.K(),
              h = Cf(g),
              k = !1;
            switch (f) {
              case 0:
                f = b.S.byteLength - e;
                break;
              case 1:
                if (d && b.$() + 8 > b.S.byteLength) {
                  this.g = !0;
                  return;
                }
                f = b.$a();
                k = !0;
            }
            var l = this.h[g];
            if (l) {
              var m = null,
                p = null;
              if (this.i[g] == Bf) {
                if (d && b.$() + 4 > b.S.byteLength) {
                  this.g = !0;
                  return;
                }
                p = b.K();
                m = p >>> 24;
                p &= 16777215;
              }
              g = e + f;
              c && g > b.S.byteLength && (g = b.S.byteLength);
              d && g > b.S.byteLength ? this.g = !0 : (d = g - b.$(), b = 0 < d ? b.Za(d) : new Uint8Array(0), b = new vf(b, 0), l({
                name: h,
                parser: this,
                partialOkay: c || !1,
                version: m,
                flags: p,
                reader: b,
                size: f,
                start: e + a,
                has64BitSize: k
              }));
            } else b.skip(Math.min(e + f - b.$(), b.S.byteLength - b.$()));
          }
        };
        function Df(a) {
          for (var b = Ef(a); a.reader.ha() && !a.parser.g;) a.parser.rc(a.start + b, a.reader, a.partialOkay);
        }
        function Ff(a) {
          for (var b = Ef(a), c = a.reader.K(), d = 0; d < c && (a.parser.rc(a.start + b, a.reader, a.partialOkay), !a.parser.g); d++);
        }
        function Gf(a) {
          var b = Ef(a);
          for (a.reader.skip(78); a.reader.ha() && !a.parser.g;) a.parser.rc(a.start + b, a.reader, a.partialOkay);
        }
        function Hf(a) {
          return function (b) {
            a(b.reader.Za(b.reader.S.byteLength - b.reader.$()));
          };
        }
        function zf(a) {
          var b = 0;
          a = t(a);
          for (var c = a.next(); !c.done; c = a.next()) b = b << 8 | c.value.charCodeAt(0);
          return b;
        }
        function Cf(a) {
          return String.fromCharCode(a >> 24 & 255, a >> 16 & 255, a >> 8 & 255, a & 255);
        }
        function Ef(a) {
          return 8 + (a.has64BitSize ? 8 : 0) + (null != a.flags ? 4 : 0);
        }
        K("shaka.util.Mp4Parser", yf);
        yf.headerSize = Ef;
        yf.typeToString = Cf;
        yf.allData = Hf;
        yf.visualSampleEntry = Gf;
        yf.sampleDescription = Ff;
        yf.children = Df;
        yf.prototype.parseNext = yf.prototype.rc;
        yf.prototype.parse = yf.prototype.parse;
        yf.prototype.stop = yf.prototype.stop;
        yf.prototype.fullBox = yf.prototype.R;
        yf.prototype.box = yf.prototype.box;
        var Af = 0,
          Bf = 1;
        function If(a) {
          var b = this;
          this.g = [];
          this.h = [];
          this.data = [];
          new yf().box("moov", Df).box("moof", Df).R("pssh", function (c) {
            if (!(1 < c.version)) {
              var d = L(c.reader.S, -12, c.size);
              b.data.push(d);
              b.g.push(Mc(c.reader.Za(16)));
              if (0 < c.version) {
                d = c.reader.K();
                for (var e = 0; e < d; e++) {
                  var f = Mc(c.reader.Za(16));
                  b.h.push(f);
                }
              }
            }
          }).parse(a);
        }
        function Jf(a, b, c, d) {
          var e = a.length,
            f = b.length + 16 + e;
          0 < d && (f += 4 + 16 * c.size);
          var g = new Uint8Array(f),
            h = Jb(g),
            k = 0;
          h.setUint32(k, f);
          k += 4;
          h.setUint32(k, 1886614376);
          k += 4;
          1 > d ? h.setUint32(k, 0) : h.setUint32(k, 16777216);
          k += 4;
          g.set(b, k);
          k += b.length;
          if (0 < d) for (h.setUint32(k, c.size), k += 4, b = t(c), c = b.next(); !c.done; c = b.next()) c = Lc(c.value), g.set(c, k), k += c.length;
          h.setUint32(k, e);
          g.set(a, k + 4);
          return g;
        }
        function Kf(a, b) {
          a = Lf(a, b);
          return 1 != a.length ? null : a[0];
        }
        function Mf(a, b, c) {
          a = Nf(a, b, c);
          return 1 != a.length ? null : a[0];
        }
        function Lf(a, b) {
          var c = [];
          a = t(a.childNodes);
          for (var d = a.next(); !d.done; d = a.next()) d = d.value, d instanceof Element && d.tagName == b && c.push(d);
          return c;
        }
        function Of(a) {
          return Array.from(a.childNodes).filter(function (b) {
            return b instanceof Element;
          });
        }
        function Nf(a, b, c) {
          var d = [];
          a = t(a.childNodes);
          for (var e = a.next(); !e.done; e = a.next()) e = e.value, e instanceof Element && e.localName == c && e.namespaceURI == b && d.push(e);
          return d;
        }
        function Pf(a, b, c) {
          return a.hasAttributeNS(b, c) ? a.getAttributeNS(b, c) : null;
        }
        function Qf(a, b, c) {
          b = t(b);
          for (var d = b.next(); !d.done; d = b.next()) if (d = d.value, a.hasAttributeNS(d, c)) return a.getAttributeNS(d, c);
          return null;
        }
        function Rf(a) {
          return Array.from(a.childNodes).every(Sf) ? a.textContent.trim() : null;
        }
        function Sf(a) {
          return a.nodeType == Node.TEXT_NODE || a.nodeType == Node.CDATA_SECTION_NODE;
        }
        function Tf(a, b, c, d) {
          d = void 0 === d ? null : d;
          var e = null;
          a = a.getAttribute(b);
          null != a && (e = c(a));
          return null == e ? d : e;
        }
        function Uf(a) {
          if (!a) return null;
          /^\d+-\d+-\d+T\d+:\d+:\d+(\.\d+)?$/.test(a) && (a += "Z");
          a = Date.parse(a);
          return isNaN(a) ? null : a / 1E3;
        }
        function Vf(a) {
          if (!a) return null;
          a = RegExp("^P(?:([0-9]*)Y)?(?:([0-9]*)M)?(?:([0-9]*)D)?(?:T(?:([0-9]*)H)?(?:([0-9]*)M)?(?:([0-9.]*)S)?)?$").exec(a);
          if (!a) return null;
          a = 31536E3 * Number(a[1] || null) + 2592E3 * Number(a[2] || null) + 86400 * Number(a[3] || null) + 3600 * Number(a[4] || null) + 60 * Number(a[5] || null) + Number(a[6] || null);
          return isFinite(a) ? a : null;
        }
        function Wf(a) {
          var b = /([0-9]+)-([0-9]+)/.exec(a);
          if (!b) return null;
          a = Number(b[1]);
          if (!isFinite(a)) return null;
          b = Number(b[2]);
          return isFinite(b) ? {
            start: a,
            end: b
          } : null;
        }
        function Xf(a) {
          a = Number(a);
          return 0 === a % 1 ? a : null;
        }
        function Yf(a) {
          a = Number(a);
          return 0 === a % 1 && 0 < a ? a : null;
        }
        function Zf(a) {
          a = Number(a);
          return 0 === a % 1 && 0 <= a ? a : null;
        }
        function $f(a) {
          a = Number(a);
          return isNaN(a) ? null : a;
        }
        function ag(a) {
          var b;
          var c = (b = a.match(/^(\d+)\/(\d+)$/)) ? Number(b[1]) / Number(b[2]) : Number(a);
          return isNaN(c) ? null : c;
        }
        function bg(a, b) {
          var c = new DOMParser(),
            d = cg.value()(a);
          a = null;
          try {
            a = c.parseFromString(d, "text/xml");
          } catch (e) {
            return null;
          }
          c = a.documentElement;
          if (!c || c.getElementsByTagName("parsererror").length || c.tagName != b) return null;
          for (b = document.createNodeIterator(a, NodeFilter.SHOW_ALL); a = b.nextNode();) if (a instanceof HTMLElement || a instanceof SVGElement) return null;
          return c;
        }
        function dg(a, b) {
          try {
            var c = Bc(a);
            return bg(c, b);
          } catch (d) {
            return null;
          }
        }
        var cg = new lc(function () {
          if ("undefined" !== typeof trustedTypes) {
            var a = trustedTypes.createPolicy("shaka-player#xml", {
              createHTML: function (b) {
                return b;
              }
            });
            return function (b) {
              return a.createHTML(b);
            };
          }
          return function (b) {
            return b;
          };
        });
        function eg(a, b) {
          var c = this;
          b = void 0 === b ? 1 : b;
          this.D = a;
          this.G = new Set();
          this.l = this.u = null;
          this.ea = this.ba = !1;
          this.H = 0;
          this.g = null;
          this.s = new lf();
          this.i = new Map();
          this.A = [];
          this.o = new kc();
          this.h = null;
          this.m = function (d) {
            c.o.reject(d);
            a.onError(d);
          };
          this.ka = new Map();
          this.ca = new Map();
          this.V = new P(function () {
            return fg(c);
          });
          this.M = !1;
          this.L = [];
          this.P = !1;
          this.da = new P(function () {
            gg(c);
          }).Ca(b);
          this.o.catch(function () {});
          this.j = new jf(function () {
            return hg(c);
          });
          this.W = !1;
          this.J = this.F = null;
        }
        r = eg.prototype;
        r.destroy = function () {
          return this.j.destroy();
        };
        function hg(a) {
          return G(function (b) {
            switch (b.g) {
              case 1:
                return a.s.release(), a.s = null, a.o.reject(), a.da.stop(), a.da = null, a.V.stop(), a.V = null, u(b, ig(a), 2);
              case 2:
                if (!a.l) {
                  b.B(3);
                  break;
                }
                C(b, 4);
                return u(b, a.l.setMediaKeys(null), 6);
              case 6:
                va(b, 5);
                break;
              case 4:
                wa(b);
              case 5:
                a.l = null;
              case 3:
                a.g = null, a.G.clear(), a.u = null, a.A = [], a.h = null, a.m = function () {}, a.D = null, a.W = !1, a.F = null, A(b);
            }
          });
        }
        r.configure = function (a) {
          this.h = a;
        };
        function jg(a, b, c) {
          a.ea = !0;
          a.A = [];
          a.M = c;
          return kg(a, b);
        }
        function lg(a, b, c) {
          a.A = c;
          a.M = 0 < c.length;
          return kg(a, b);
        }
        function mg(a, b, c, d, e, f) {
          var g = new Map();
          e = {
            audioCapabilities: e,
            videoCapabilities: f,
            distinctiveIdentifier: "optional",
            persistentState: "required",
            sessionTypes: ["persistent-license"],
            label: b
          };
          e.drmInfos = [{
            keySystem: b,
            licenseServerUri: c,
            distinctiveIdentifierRequired: !1,
            persistentStateRequired: !0,
            audioRobustness: "",
            videoRobustness: "",
            serverCertificate: d,
            serverCertificateUri: "",
            initData: null,
            keyIds: null
          }];
          g.set(b, e);
          return ng(a, g, []);
        }
        function kg(a, b) {
          var c, d, e, f, g, h, k, l, m, p, n, q, v, y, w, x, D;
          return G(function (z) {
            if (1 == z.g) {
              if (c = og(a)) for (d = t(b), e = d.next(); !e.done; e = d.next()) f = e.value, f.video && (f.video.drmInfos = [c]), f.audio && (f.audio.drmInfos = [c]);
              g = b.some(function (B) {
                return B.video && B.video.drmInfos.length || B.audio && B.audio.drmInfos.length ? !0 : !1;
              });
              g || (h = sf(a.h.servers), pg(b, h));
              k = new Set();
              l = t(b);
              for (e = l.next(); !e.done; e = l.next()) for (m = e.value, p = qg(m), n = t(p), q = n.next(); !q.done; q = n.next()) v = q.value, k.add(v);
              y = t(k);
              for (q = y.next(); !q.done; q = y.next()) w = q.value, rg(w, sf(a.h.servers), sf(a.h.advanced || {}), a.h.keySystemsMapping);
              return u(z, Qd(b, a.M, a.W), 2);
            }
            x = g || Object.keys(a.h.servers).length;
            if (!x) return a.ba = !0, z.return(Promise.resolve());
            D = ng(a, void 0, b);
            return z.return(g ? D : D.catch(function () {}));
          });
        }
        function sg(a) {
          var b;
          return G(function (c) {
            switch (c.g) {
              case 1:
                if (a.l.mediaKeys) return c.return();
                if (!a.F) {
                  c.B(2);
                  break;
                }
                return u(c, a.F, 3);
              case 3:
                return kf(a.j), c.return();
              case 2:
                return C(c, 4), a.F = a.l.setMediaKeys(a.u), u(c, a.F, 6);
              case 6:
                va(c, 5);
                break;
              case 4:
                b = wa(c), a.m(new O(2, 6, 6003, b.message));
              case 5:
                kf(a.j), A(c);
            }
          });
        }
        function tg(a, b) {
          return G(function (c) {
            if (1 == c.g) return u(c, sg(a), 2);
            ug(a, b.initDataType, L(b.initData));
            A(c);
          });
        }
        r.Zb = function (a) {
          var b = this;
          return G(function (c) {
            if (1 == c.g) {
              if (!b.u) return b.s.ia(a, "encrypted", function () {
                b.m(new O(2, 6, 6010));
              }), c.return();
              b.l = a;
              b.s.ia(b.l, "play", function () {
                for (var d = t(b.L), e = d.next(); !e.done; e = d.next()) vg(b, e.value);
                b.P = !0;
                b.L = [];
              });
              "webkitCurrentPlaybackTargetIsWireless" in b.l && b.s.C(b.l, "webkitcurrentplaybacktargetiswirelesschanged", function () {
                return ig(b);
              });
              b.J = b.g ? b.g.initData.find(function (d) {
                return 0 < d.initData.length;
              }) || null : null;
              return b.J || "com.apple.fps" !== b.g.keySystem || b.A.length ? u(c, sg(b), 2) : c.B(2);
            }
            wg(b);
            b.J || b.A.length || b.h.parseInbandPsshEnabled || b.s.C(b.l, "encrypted", function (d) {
              return tg(b, d);
            });
            A(c);
          });
        };
        function xg(a) {
          var b, c, d, e, f;
          return G(function (g) {
            switch (g.g) {
              case 1:
                if (!a.u || !a.g) return g.return();
                if (!a.g.serverCertificateUri || a.g.serverCertificate && a.g.serverCertificate.length) {
                  g.B(2);
                  break;
                }
                b = bf([a.g.serverCertificateUri], a.h.retryParameters);
                C(g, 3);
                c = a.D.lb.request(5, b);
                return u(g, c.promise, 5);
              case 5:
                d = g.h;
                a.g.serverCertificate = L(d.data);
                va(g, 4);
                break;
              case 3:
                throw e = wa(g), new O(2, 6, 6017, e);
              case 4:
                if (a.j.g) return g.return();
              case 2:
                if (!a.g.serverCertificate || !a.g.serverCertificate.length) return g.return();
                C(g, 6);
                return u(g, a.u.setServerCertificate(a.g.serverCertificate), 8);
              case 8:
                va(g, 0);
                break;
              case 6:
                throw f = wa(g), new O(2, 6, 6004, f.message);
            }
          });
        }
        function yg(a, b) {
          var c, d, e;
          return G(function (f) {
            if (1 == f.g) return u(f, zg(a, b), 2);
            if (3 != f.g) {
              c = f.h;
              if (!c) return f.return();
              d = [];
              if (e = a.i.get(c)) e.Ja = new kc(), d.push(e.Ja);
              d.push(c.remove());
              return u(f, Promise.all(d), 3);
            }
            a.i.delete(c);
            A(f);
          });
        }
        function wg(a) {
          for (var b = (a.g ? a.g.initData : []) || [], c = t(b), d = c.next(); !d.done; d = c.next()) d = d.value, ug(a, d.initDataType, d.initData);
          c = t(a.A);
          for (d = c.next(); !d.done; d = c.next()) zg(a, d.value);
          b.length || a.A.length || a.o.resolve();
          return a.o;
        }
        function ug(a, b, c) {
          if (c.length) {
            var d = a.i.values();
            d = t(d);
            for (var e = d.next(); !e.done; e = d.next()) if (Fb(c, e.value.initData) && !sc("Tizen 2")) return;
            0 < a.i.size && Ag(a) && (a.o.resolve(), a.o = new kc(), a.o.catch(function () {}));
            Bg(a, b, c, a.g.sessionType);
          }
        }
        function Cg(a) {
          return a ? !!a.match(/^com\.(microsoft|chromecast)\.playready/) : !1;
        }
        function Dg(a) {
          a = a.i.keys();
          a = qf(a, function (b) {
            return b.sessionId;
          });
          return Array.from(a);
        }
        r.jc = function () {
          var a = Infinity,
            b = this.i.keys();
          b = t(b);
          for (var c = b.next(); !c.done; c = b.next()) c = c.value, isNaN(c.expiration) || (a = Math.min(a, c.expiration));
          return a;
        };
        r.Rc = function () {
          return tf(this.ca);
        };
        function ng(a, b, c) {
          var d, e, f, g, h, k, l, m, p, n, q, v, y;
          return G(function (w) {
            switch (w.g) {
              case 1:
                d = new Map();
                if (c.length) {
                  e = Eg(a, c, d);
                  w.B(2);
                  break;
                }
                return u(w, Fg(a, b), 3);
              case 3:
                e = w.h;
              case 2:
                f = e;
                if (!f) throw new O(2, 6, 6001);
                kf(a.j);
                C(w, 4);
                a.G.clear();
                g = f.getConfiguration();
                h = g.audioCapabilities || [];
                k = g.videoCapabilities || [];
                l = t(h);
                for (m = l.next(); !m.done; m = l.next()) p = m.value, a.G.add(p.contentType.toLowerCase());
                n = t(k);
                for (m = n.next(); !m.done; m = n.next()) q = m.value, a.G.add(q.contentType.toLowerCase());
                if (c.length) {
                  var x = f.keySystem;
                  var D = d.get(f.keySystem);
                  var z = [],
                    B = [],
                    E = [],
                    F = [],
                    H = new Set();
                  Gg(D, z, E, B, F, H);
                  var I = a.M ? "persistent-license" : "temporary";
                  x = {
                    keySystem: x,
                    licenseServerUri: z[0],
                    distinctiveIdentifierRequired: D[0].distinctiveIdentifierRequired,
                    persistentStateRequired: D[0].persistentStateRequired,
                    sessionType: D[0].sessionType || I,
                    audioRobustness: D[0].audioRobustness || "",
                    videoRobustness: D[0].videoRobustness || "",
                    serverCertificate: E[0],
                    serverCertificateUri: B[0],
                    initData: F,
                    keyIds: H
                  };
                  D = t(D);
                  for (z = D.next(); !z.done; z = D.next()) z = z.value, z.distinctiveIdentifierRequired && (x.distinctiveIdentifierRequired = z.distinctiveIdentifierRequired), z.persistentStateRequired && (x.persistentStateRequired = z.persistentStateRequired);
                  D = x;
                } else D = f.keySystem, x = b.get(f.keySystem), z = [], B = [], E = [], F = [], H = new Set(), Gg(x.drmInfos, z, E, B, F, H), D = {
                  keySystem: D,
                  licenseServerUri: z[0],
                  distinctiveIdentifierRequired: "required" == x.distinctiveIdentifier,
                  persistentStateRequired: "required" == x.persistentState,
                  sessionType: x.sessionTypes[0] || "temporary",
                  audioRobustness: (x.audioCapabilities ? x.audioCapabilities[0].robustness : "") || "",
                  videoRobustness: (x.videoCapabilities ? x.videoCapabilities[0].robustness : "") || "",
                  serverCertificate: E[0],
                  serverCertificateUri: B[0],
                  initData: F,
                  keyIds: H
                };
                a.g = D;
                if (!a.g.licenseServerUri) throw new O(2, 6, 6012, a.g.keySystem);
                return u(w, f.createMediaKeys(), 6);
              case 6:
                return v = w.h, kf(a.j), a.u = v, a.ba = !0, u(w, xg(a), 7);
              case 7:
                kf(a.j);
                va(w, 0);
                break;
              case 4:
                y = wa(w);
                kf(a.j, y);
                a.g = null;
                a.G.clear();
                if (y instanceof O) throw y;
                throw new O(2, 6, 6002, y.message);
            }
          });
        }
        function Eg(a, b, c) {
          for (var d = t(b), e = d.next(); !e.done; e = d.next()) {
            var f = t(qg(e.value));
            for (e = f.next(); !e.done; e = f.next()) e = e.value, c.has(e.keySystem) || c.set(e.keySystem, []), c.get(e.keySystem).push(e);
          }
          if (1 == c.size && c.has("")) throw new O(2, 6, 6E3);
          d = {};
          a = t(a.h.preferredKeySystems);
          for (e = a.next(); !e.done; d = {
            sd: d.sd
          }, e = a.next()) for (d.sd = e.value, f = t(b), e = f.next(); !e.done; e = f.next()) if (e = e.value.decodingInfos.find(function (l) {
            return function (m) {
              return m.supported && null != m.keySystemAccess && m.keySystemAccess.keySystem == l.sd;
            };
          }(d))) return e.keySystemAccess;
          a = t([!0, !1]);
          for (e = a.next(); !e.done; e = a.next()) for (d = e.value, f = t(b), e = f.next(); !e.done; e = f.next()) {
            var g = t(e.value.decodingInfos);
            for (e = g.next(); !e.done; e = g.next()) {
              var h = e.value;
              if (h.supported && h.keySystemAccess) {
                e = c.get(h.keySystemAccess.keySystem);
                var k = t(e);
                for (e = k.next(); !e.done; e = k.next()) if (!!e.value.licenseServerUri == d) return h.keySystemAccess;
              }
            }
          }
          return null;
        }
        function Fg(a, b) {
          var c, d, e, f, g, h, k, l, m, p, n, q, v, y, w;
          return G(function (x) {
            switch (x.g) {
              case 1:
                if (1 == b.size && b.has("")) throw new O(2, 6, 6E3);
                d = t(b.values());
                for (e = d.next(); !e.done; e = d.next()) f = e.value, 0 == f.audioCapabilities.length && delete f.audioCapabilities, 0 == f.videoCapabilities.length && delete f.videoCapabilities;
                g = t(a.h.preferredKeySystems);
                h = g.next();
              case 2:
                if (h.done) {
                  x.B(4);
                  break;
                }
                k = h.value;
                if (!b.has(k)) {
                  x.B(3);
                  break;
                }
                l = b.get(k);
                C(x, 6);
                return u(x, navigator.requestMediaKeySystemAccess(k, [l]), 8);
              case 8:
                return c = x.h, x.return(c);
              case 6:
                wa(x);
              case 7:
                kf(a.j);
              case 3:
                h = g.next();
                x.B(2);
                break;
              case 4:
                m = t([!0, !1]), p = m.next();
              case 9:
                if (p.done) {
                  x.B(11);
                  break;
                }
                n = p.value;
                q = t(b.keys());
                h = q.next();
              case 12:
                if (h.done) {
                  p = m.next();
                  x.B(9);
                  break;
                }
                v = h.value;
                y = b.get(v);
                w = y.drmInfos.some(function (D) {
                  return !!D.licenseServerUri;
                });
                if (w != n) {
                  x.B(13);
                  break;
                }
                C(x, 15);
                return u(x, navigator.requestMediaKeySystemAccess(v, [y]), 17);
              case 17:
                return c = x.h, x.return(c);
              case 15:
                wa(x);
              case 16:
                kf(a.j);
              case 13:
                h = q.next();
                x.B(12);
                break;
              case 11:
                return x.return(c);
            }
          });
        }
        function og(a) {
          a = sf(a.h.clearKeys);
          if (0 == a.size) return null;
          var b = [],
            c = [];
          a.forEach(function (e, f) {
            var g = f;
            22 != g.length && (g = Jc(Lc(f), !1));
            f = e;
            22 != f.length && (f = Jc(Lc(e), !1));
            e = {
              kty: "oct",
              kid: g,
              k: f
            };
            b.push(e);
            c.push(e.kid);
          });
          a = JSON.stringify({
            keys: b
          });
          var d = JSON.stringify({
            kids: c
          });
          d = [{
            initData: L(Fc(d)),
            initDataType: "keyids"
          }];
          return {
            keySystem: "org.w3.clearkey",
            licenseServerUri: "data:application/json;base64," + window.btoa(a),
            distinctiveIdentifierRequired: !1,
            persistentStateRequired: !1,
            audioRobustness: "",
            videoRobustness: "",
            serverCertificate: null,
            serverCertificateUri: "",
            sessionType: "",
            initData: d,
            keyIds: new Set(c)
          };
        }
        function zg(a, b) {
          var c, d, e, f, g;
          return G(function (h) {
            switch (h.g) {
              case 1:
                try {
                  c = a.u.createSession("persistent-license");
                } catch (k) {
                  return d = new O(2, 6, 6005, k.message), a.m(d), h.return(Promise.reject(d));
                }
                a.s.C(c, "message", function (k) {
                  a.l && a.h.delayLicenseRequestUntilPlayed && a.l.paused && !a.P ? a.L.push(k) : vg(a, k);
                });
                a.s.C(c, "keystatuseschange", function (k) {
                  return Hg(a, k);
                });
                e = {
                  initData: null,
                  initDataType: null,
                  loaded: !1,
                  Xd: Infinity,
                  Ja: null,
                  type: "persistent-license"
                };
                a.i.set(c, e);
                C(h, 2);
                return u(h, c.load(b), 4);
              case 4:
                f = h.h;
                kf(a.j);
                if (!f) return a.i.delete(c), a.m(new O(2, 6, 6013)), h.return(Promise.resolve());
                e.loaded = !0;
                Ag(a) && a.o.resolve();
                return h.return(c);
              case 2:
                g = wa(h), kf(a.j, g), a.i.delete(c), a.m(new O(2, 6, 6005, g.message));
              case 3:
                return h.return(Promise.resolve());
            }
          });
        }
        function Bg(a, b, c, d) {
          try {
            var e = a.u.createSession(d);
          } catch (f) {
            a.m(new O(2, 6, 6005, f.message));
            return;
          }
          a.s.C(e, "message", function (f) {
            a.l && a.h.delayLicenseRequestUntilPlayed && a.l.paused && !a.P ? a.L.push(f) : vg(a, f);
          });
          a.s.C(e, "keystatuseschange", function (f) {
            return Hg(a, f);
          });
          a.i.set(e, {
            initData: c,
            initDataType: b,
            loaded: !1,
            Xd: Infinity,
            Ja: null,
            type: d
          });
          try {
            c = a.h.initDataTransform(c, b, a.g);
          } catch (f) {
            b = f;
            f instanceof O || (b = new O(2, 6, 6016, f));
            a.m(b);
            return;
          }
          a.h.logLicenseExchange && Jc(c);
          e.generateRequest(b, c).catch(function (f) {
            if (!a.j.g) {
              a.i.delete(e);
              var g = f.errorCode;
              if (g && g.systemCode) {
                var h = g.systemCode;
                0 > h && (h += Math.pow(2, 32));
                h = "0x" + h.toString(16);
              }
              a.m(new O(2, 6, 6006, f.message, f, h));
            }
          });
        }
        function vg(a, b) {
          var c, d, e, f, g, h, k, l, m, p, n, q, v, y;
          G(function (w) {
            switch (w.g) {
              case 1:
                return c = b.target, a.h.logLicenseExchange && Jc(b.message), d = a.i.get(c), e = a.g.licenseServerUri, f = a.h.advanced[a.g.keySystem], "individualization-request" == b.messageType && f && f.individualizationServer && (e = f.individualizationServer), g = bf([e], a.h.retryParameters), g.body = b.message, g.method = "POST", g.licenseRequestType = b.messageType, g.sessionId = c.sessionId, g.drmInfo = a.g, d && (g.initData = d.initData, g.initDataType = d.initDataType), Cg(a.g.keySystem) && Ig(g), h = Date.now(), C(w, 2), l = a.D.lb.request(2, g), u(w, l.promise, 4);
              case 4:
                k = w.h;
                va(w, 3);
                break;
              case 2:
                return m = wa(w), p = new O(2, 6, 6007, m), a.m(p), d && d.Ja && d.Ja.reject(p), w.return();
              case 3:
                if (a.j.g) return w.return();
                a.H += (Date.now() - h) / 1E3;
                a.h.logLicenseExchange && Jc(k.data);
                C(w, 5);
                return u(w, c.update(k.data), 7);
              case 7:
                va(w, 6);
                break;
              case 5:
                return n = wa(w), q = new O(2, 6, 6008, n.message), a.m(q), d && d.Ja && d.Ja.reject(q), w.return();
              case 6:
                if (a.j.g) return w.return();
                v = new S("drmsessionupdate");
                a.D.onEvent(v);
                d && (d.Ja && d.Ja.resolve(), y = new P(function () {
                  d.loaded = !0;
                  Ag(a) && a.o.resolve();
                }), y.O(Jg));
                A(w);
            }
          });
        }
        function Ig(a) {
          var b = Cc(a.body, !0, !0);
          if (b.includes("PlayReadyKeyMessage")) {
            b = bg(b, "PlayReadyKeyMessage");
            for (var c = t(b.getElementsByTagName("HttpHeader")), d = c.next(); !d.done; d = c.next()) d = d.value, a.headers[d.getElementsByTagName("name")[0].textContent] = d.getElementsByTagName("value")[0].textContent;
            a.body = Kc(b.getElementsByTagName("Challenge")[0].textContent);
          } else a.headers["Content-Type"] = "text/xml; charset=utf-8";
        }
        function Hg(a, b) {
          b = b.target;
          var c = a.i.get(b),
            d = !1;
          b.keyStatuses.forEach(function (f, g) {
            if ("string" == typeof g) {
              var h = g;
              g = f;
              f = h;
            }
            if (Cg(a.g.keySystem) && 16 == g.byteLength && (qc() || wc())) {
              h = Jb(g);
              var k = h.getUint32(0, !0),
                l = h.getUint16(4, !0),
                m = h.getUint16(6, !0);
              h.setUint32(0, k, !1);
              h.setUint16(4, l, !1);
              h.setUint16(6, m, !1);
            }
            "status-pending" != f && (c.loaded = !0);
            "expired" == f && (d = !0);
            g = Mc(g).slice(0, 32);
            a.ka.set(g, f);
          });
          var e = b.expiration - Date.now();
          (0 > e || d && 1E3 > e) && c && !c.Ja && (a.i.delete(b), b.close().catch(function () {}));
          Ag(a) && (a.o.resolve(), a.V.O(Kg));
        }
        function fg(a) {
          var b = a.ka,
            c = a.ca;
          c.clear();
          b.forEach(function (d, e) {
            return c.set(e, d);
          });
          b = Array.from(c.values());
          b.length && b.every(function (d) {
            return "expired" == d;
          }) && a.m(new O(2, 6, 6014));
          a.D.dd(tf(c));
        }
        function Lg() {
          var a, b, c, d, e, f, g, h;
          return G(function (k) {
            return 1 == k.g ? (a = "org.w3.clearkey com.widevine.alpha com.microsoft.playready com.microsoft.playready.recommendation com.apple.fps.1_0 com.apple.fps com.adobe.primetime".split(" "), b = [{
              contentType: 'video/mp4; codecs="avc1.42E01E"'
            }, {
              contentType: 'video/webm; codecs="vp8"'
            }], c = {
              initDataTypes: ["cenc"],
              videoCapabilities: b
            }, d = {
              videoCapabilities: b,
              persistentState: "required",
              sessionTypes: ["persistent-license"]
            }, e = [d, c], f = new Map(), g = function (l) {
              var m, p, n;
              return G(function (q) {
                switch (q.g) {
                  case 1:
                    C(q, 2);
                    if ("org.w3.clearkey" === l && xc()) throw Error("Unsupported keySystem");
                    return u(q, navigator.requestMediaKeySystemAccess(l, e), 4);
                  case 4:
                    return m = q.h, n = (p = m.getConfiguration().sessionTypes) ? p.includes("persistent-license") : !1, sc("Tizen 3") && (n = !1), f.set(l, {
                      persistentState: n
                    }), u(q, m.createMediaKeys(), 5);
                  case 5:
                    va(q, 0);
                    break;
                  case 2:
                    wa(q), f.set(l, null), A(q);
                }
              });
            }, h = a.map(function (l) {
              return g(l);
            }), u(k, Promise.all(h), 2)) : k.return(tf(f));
          });
        }
        function Mg(a) {
          var b;
          return G(function (c) {
            if (1 == c.g) return b = new Promise(function (d, e) {
              new P(e).O(Ng);
            }), C(c, 2), u(c, Promise.race([Promise.all([a.close(), a.closed]), b]), 4);
            if (2 != c.g) return va(c, 0);
            wa(c);
            A(c);
          });
        }
        function ig(a) {
          var b;
          return G(function (c) {
            b = Array.from(a.i.entries());
            a.i.clear();
            return u(c, Promise.all(b.map(function (d) {
              d = t(d);
              var e = d.next().value,
                f = d.next().value;
              return G(function (g) {
                if (1 == g.g) return C(g, 2), a.ea || a.A.includes(e.sessionId) || "persistent-license" !== f.type ? u(g, Mg(e), 5) : u(g, e.remove(), 5);
                if (2 != g.g) return va(g, 0);
                wa(g);
                A(g);
              });
            })), 0);
          });
        }
        function Og(a, b) {
          if (!a.length) return b;
          if (!b.length) return a;
          var c = [];
          a = t(a);
          for (var d = a.next(); !d.done; d = a.next()) {
            d = d.value;
            for (var e = {}, f = t(b), g = f.next(); !g.done; e = {
              Da: e.Da
            }, g = f.next()) if (g = g.value, d.keySystem == g.keySystem) {
              e.Da = [];
              e.Da = e.Da.concat(d.initData || []);
              e.Da = e.Da.concat(g.initData || []);
              e.Da = e.Da.filter(function (h) {
                return function (k, l) {
                  return void 0 === k.keyId || l === h.Da.findIndex(function (m) {
                    return m.keyId === k.keyId;
                  });
                };
              }(e));
              f = d.keyIds && g.keyIds ? new Set([].concat(ia(d.keyIds), ia(g.keyIds))) : d.keyIds || g.keyIds;
              c.push({
                keySystem: d.keySystem,
                licenseServerUri: d.licenseServerUri || g.licenseServerUri,
                distinctiveIdentifierRequired: d.distinctiveIdentifierRequired || g.distinctiveIdentifierRequired,
                persistentStateRequired: d.persistentStateRequired || g.persistentStateRequired,
                videoRobustness: d.videoRobustness || g.videoRobustness,
                audioRobustness: d.audioRobustness || g.audioRobustness,
                serverCertificate: d.serverCertificate || g.serverCertificate,
                serverCertificateUri: d.serverCertificateUri || g.serverCertificateUri,
                initData: e.Da,
                keyIds: f
              });
              break;
            }
          }
          return c;
        }
        function qg(a) {
          return (a.video ? a.video.drmInfos : []).concat(a.audio ? a.audio.drmInfos : []);
        }
        function gg(a) {
          a.i.forEach(function (b, c) {
            var d = b.Xd,
              e = c.expiration;
            isNaN(e) && (e = Infinity);
            e != d && (a.D.onExpirationUpdated(c.sessionId, e), b.Xd = e);
          });
        }
        function Ag(a) {
          a = a.i.values();
          return rf(a, function (b) {
            return b.loaded;
          });
        }
        function pg(a, b) {
          var c = [];
          b.forEach(function (d, e) {
            c.push({
              keySystem: e,
              licenseServerUri: d,
              distinctiveIdentifierRequired: !1,
              persistentStateRequired: !1,
              audioRobustness: "",
              videoRobustness: "",
              serverCertificate: null,
              serverCertificateUri: "",
              initData: [],
              keyIds: new Set()
            });
          });
          a = t(a);
          for (b = a.next(); !b.done; b = a.next()) b = b.value, b.video && (b.video.drmInfos = c), b.audio && (b.audio.drmInfos = c);
        }
        function Gg(a, b, c, d, e, f) {
          var g = {};
          a = t(a);
          for (var h = a.next(); !h.done; g = {
            pa: g.pa
          }, h = a.next()) {
            g.pa = h.value;
            b.includes(g.pa.licenseServerUri) || b.push(g.pa.licenseServerUri);
            d.includes(g.pa.serverCertificateUri) || d.push(g.pa.serverCertificateUri);
            g.pa.serverCertificate && (c.some(function (m) {
              return function (p) {
                return Fb(p, m.pa.serverCertificate);
              };
            }(g)) || c.push(g.pa.serverCertificate));
            if (g.pa.initData) {
              h = {};
              for (var k = t(g.pa.initData), l = k.next(); !l.done; h = {
                Ec: h.Ec
              }, l = k.next()) h.Ec = l.value, e.some(function (m) {
                return function (p) {
                  var n = m.Ec;
                  return p.keyId && p.keyId == n.keyId ? !0 : p.initDataType == n.initDataType && Fb(p.initData, n.initData);
                };
              }(h)) || e.push(h.Ec);
            }
            if (g.pa.keyIds) for (h = t(g.pa.keyIds), k = h.next(); !k.done; k = h.next()) f.add(k.value);
          }
        }
        function rg(a, b, c, d) {
          var e = a.keySystem;
          if (e && ("org.w3.clearkey" != e || !a.licenseServerUri)) {
            b.size && (b = b.get(e) || "", a.licenseServerUri = b);
            a.keyIds || (a.keyIds = new Set());
            if (c = c.get(e)) a.distinctiveIdentifierRequired || (a.distinctiveIdentifierRequired = c.distinctiveIdentifierRequired), a.persistentStateRequired || (a.persistentStateRequired = c.persistentStateRequired), a.videoRobustness || (a.videoRobustness = c.videoRobustness), a.audioRobustness || (a.audioRobustness = c.audioRobustness), a.serverCertificate || (a.serverCertificate = c.serverCertificate), c.sessionType && (a.sessionType = c.sessionType), a.serverCertificateUri || (a.serverCertificateUri = c.serverCertificateUri);
            d[e] && (a.keySystem = d[e]);
            window.cast && window.cast.__platform__ && "com.microsoft.playready" == e && (a.keySystem = "com.chromecast.playready");
          }
        }
        var Ng = 1,
          Jg = 5,
          Kg = .5,
          Pg = new lc(function () {
            return Hb(new Uint8Array([0]));
          });
        function Qg() {}
        function Rg(a, b, c, d) {
          var e, f, g, h;
          return G(function (k) {
            if (1 == k.g) {
              if (d && (e = Sg[d.toLowerCase()])) return k.return(e);
              if (f = Tg(a)) if (g = Ug[f]) return k.return(g);
              return d ? k.B(2) : u(k, Vg(a, b, c), 3);
            }
            if (2 != k.g && (d = k.h) && (h = Sg[d])) return k.return(h);
            throw new O(2, 4, 4E3, a);
          });
        }
        function Vg(a, b, c) {
          var d, e, f;
          return G(function (g) {
            if (1 == g.g) return d = bf([a], c), d.method = "HEAD", u(g, b.request(0, d).promise, 2);
            e = g.h;
            f = e.headers["content-type"];
            return g.return(f ? f.toLowerCase().split(";").shift() : "");
          });
        }
        function Tg(a) {
          a = new Mb(a).ra.split("/").pop().split(".");
          return 1 == a.length ? "" : a.pop().toLowerCase();
        }
        K("shaka.media.ManifestParser", Qg);
        Qg.unregisterParserByMime = function (a) {
          delete Sg[a];
        };
        Qg.registerParserByMime = function (a, b) {
          Sg[a] = b;
        };
        Qg.registerParserByExtension = function (a, b) {
          Ug[a] = b;
        };
        var Sg = {},
          Ug = {};
        function Wg(a) {
          function b() {
            d = !0;
          }
          function c(l) {
            f.push(l);
            Df(l);
          }
          a = L(a);
          var d = !1,
            e,
            f = [],
            g = [];
          new yf().box("moov", c).box("trak", c).box("mdia", c).box("minf", c).box("stbl", c).R("stsd", function (l) {
            e = l;
            f.push(l);
            Ff(l);
          }).R("encv", b).R("enca", b).R("hev1", function (l) {
            g.push({
              box: l,
              mb: 1701733238
            });
          }).R("hvc1", function (l) {
            g.push({
              box: l,
              mb: 1701733238
            });
          }).R("avc1", function (l) {
            g.push({
              box: l,
              mb: 1701733238
            });
          }).R("avc3", function (l) {
            g.push({
              box: l,
              mb: 1701733238
            });
          }).R("ac-3", function (l) {
            g.push({
              box: l,
              mb: 1701733217
            });
          }).R("ec-3", function (l) {
            g.push({
              box: l,
              mb: 1701733217
            });
          }).R("mp4a", function (l) {
            g.push({
              box: l,
              mb: 1701733217
            });
          }).parse(a);
          if (d) return a;
          if (0 == g.length || !e) throw cb(Mc(a)), new O(2, 3, 3019);
          g.reverse();
          for (var h = t(g), k = h.next(); !k.done; k = h.next()) k = k.value, a = Xg(a, e, k.box, f, k.mb);
          return a;
        }
        function Xg(a, b, c, d, e) {
          var f = Yg.value(),
            g = a.subarray(c.start, c.start + c.size),
            h = Jb(g),
            k = new Uint8Array(c.size + f.byteLength);
          k.set(g, 0);
          g = Jb(k);
          g.setUint32(4, e);
          k.set(f, c.size);
          e = h.getUint32(4);
          g.setUint32(c.size + 16, e);
          Zg(k, 0, k.byteLength);
          e = new Uint8Array(a.byteLength + k.byteLength);
          c = rc() ? c.start : c.start + c.size;
          f = a.subarray(c);
          e.set(a.subarray(0, c));
          e.set(k, c);
          e.set(f, c + k.byteLength);
          a = t(d);
          for (d = a.next(); !d.done; d = a.next()) d = d.value, Zg(e, d.start, d.size + k.byteLength);
          k = Jb(e, b.start);
          b = Ef(b);
          a = k.getUint32(b);
          k.setUint32(b, a + 1);
          return e;
        }
        function Zg(a, b, c) {
          a = Jb(a, b);
          b = a.getUint32(0);
          0 != b && (1 == b ? (a.setUint32(8, c >> 32), a.setUint32(12, c & 4294967295)) : a.setUint32(0, c));
        }
        var Yg = new lc(function () {
          return new Uint8Array([0, 0, 0, 80, 115, 105, 110, 102, 0, 0, 0, 12, 102, 114, 109, 97, 0, 0, 0, 0, 0, 0, 0, 20, 115, 99, 104, 109, 0, 0, 0, 0, 99, 101, 110, 99, 0, 1, 0, 0, 0, 0, 0, 40, 115, 99, 104, 105, 0, 0, 0, 32, 116, 101, 110, 99, 0, 0, 0, 0, 0, 0, 1, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
        });
        function $g(a, b, c, d, e) {
          if (d >= e) return null;
          for (var f = -1, g = -1, h = 0; h < c.length; h++) if (c[h].some(function (B) {
            return null != B && "" != B.g.trim();
          })) {
            f = h;
            break;
          }
          for (h = c.length - 1; 0 <= h; h--) if (c[h].some(function (B) {
            return null != B && "" != B.g.trim();
          })) {
            g = h;
            break;
          }
          if (-1 === f || -1 === g) return null;
          for (var k = h = !1, l = "white", m = "black", p = ah(d, e, h, k, l, m); f <= g; f++) {
            for (var n = c[f], q = -1, v = -1, y = 0; y < n.length; y++) if (null != n[y] && "" !== n[y].g.trim()) {
              q = y;
              break;
            }
            for (y = n.length - 1; 0 <= y; y--) if (null != n[y] && "" !== n[y].g.trim()) {
              v = y;
              break;
            }
            if (-1 === q || -1 === v) n = bh(d, e), a.nestedCues.push(n);else {
              for (; q <= v; q++) if (y = n[q]) {
                var w = y.l,
                  x = y.i,
                  D = y.j,
                  z = y.h;
                if (w != h || x != k || D != l || z != m) p.payload && a.nestedCues.push(p), p = ah(d, e, w, x, D, z), h = w, k = x, l = D, m = z;
                p.payload += y.g;
              } else p.payload += " ";
              p.payload && a.nestedCues.push(p);
              f !== g && (p = bh(d, e), a.nestedCues.push(p));
              p = ah(d, e, h, k, l, m);
            }
          }
          return a.nestedCues.length ? {
            cue: a,
            stream: b
          } : null;
        }
        function ah(a, b, c, d, e, f) {
          a = new jb(a, b, "");
          c && a.textDecoration.push("underline");
          d && (a.fontStyle = "italic");
          a.color = e;
          a.backgroundColor = f;
          return a;
        }
        function bh(a, b) {
          a = new jb(a, b, "");
          a.lineBreak = !0;
          return a;
        }
        function ch(a, b, c, d, e) {
          this.g = a;
          this.l = b;
          this.i = c;
          this.h = d;
          this.j = e;
        }
        function dh(a, b) {
          this.i = [];
          this.g = 1;
          this.h = 0;
          this.u = a;
          this.s = b;
          this.j = this.m = !1;
          this.l = "white";
          this.o = "black";
          eh(this);
        }
        function fh(a, b, c) {
          return $g(new jb(b, c, ""), "CC" + (a.u << 1 | a.s + 1), a.i, b, c);
        }
        function eh(a) {
          gh(a, 0, 15);
          a.g = 1;
        }
        function hh(a, b, c) {
          if (!(32 > c || 127 < c)) {
            var d = "";
            switch (b) {
              case ih:
                d = jh.has(c) ? jh.get(c) : String.fromCharCode(c);
                break;
              case kh:
                d = lh.get(c);
                break;
              case mh:
                a.i[a.g].pop();
                d = nh.get(c);
                break;
              case oh:
                a.i[a.g].pop(), d = ph.get(c);
            }
            d && a.i[a.g].push(new ch(d, a.m, a.j, a.o, a.l));
          }
        }
        function qh(a, b, c, d) {
          if (!(0 > c || 0 > b)) if (b >= c) for (--d; 0 <= d; d--) a.i[b + d] = a.i[c + d].map(function (f) {
            return f;
          });else for (var e = 0; e < d; e++) a.i[b + e] = a.i[c + e].map(function (f) {
            return f;
          });
        }
        function gh(a, b, c) {
          for (var d = 0; d <= c; d++) a.i[b + d] = [];
        }
        var ih = 0,
          kh = 1,
          mh = 2,
          oh = 3,
          jh = new Map([[39, "\u2019"], [42, "\u00e1"], [92, "\u00e9"], [92, "\u00e9"], [94, "\u00ed"], [95, "\u00f3"], [96, "\u00fa"], [123, "\u00e7"], [124, "\u00f7"], [125, "\u00d1"], [126, "\u00f1"], [127, "\u2588"]]),
          lh = new Map([[48, "\u00ae"], [49, "\u00b0"], [50, "\u00bd"], [51, "\u00bf"], [52, "\u2122"], [53, "\u00a2"], [54, "\u00a3"], [55, "\u266a"], [56, "\u00e0"], [57, "\u2800"], [58, "\u00e8"], [59, "\u00e2"], [60, "\u00ea"], [61, "\u00ee"], [62, "\u00f4"], [63, "\u00fb"]]),
          nh = new Map([[32, "\u00c1"], [33, "\u00c9"], [34, "\u00d3"], [35, "\u00da"], [36, "\u00dc"], [37, "\u00fc"], [38, "\u2018"], [39, "\u00a1"], [40, "*"], [41, "'"], [42, "\u2500"], [43, "\u00a9"], [44, "\u2120"], [45, "\u00b7"], [46, "\u201c"], [47, "\u201d"], [48, "\u00c0"], [49, "\u00c2"], [50, "\u00c7"], [51, "\u00c8"], [52, "\u00ca"], [53, "\u00cb"], [54, "\u00eb"], [55, "\u00ce"], [56, "\u00cf"], [57, "\u00ef"], [58, "\u00d4"], [59, "\u00d9"], [60, "\u00f9"], [61, "\u00db"], [62, "\u00ab"], [63, "\u00bb"]]),
          ph = new Map([[32, "\u00c3"], [33, "\u00e3"], [34, "\u00cd"], [35, "\u00cc"], [36, "\u00ec"], [37, "\u00d2"], [38, "\u00f2"], [39, "\u00d5"], [40, "\u00f5"], [41, "{"], [42, "}"], [43, "\\"], [44, "^"], [45, "_"], [46, "|"], [47, "~"], [48, "\u00c4"], [49, "\u00e4"], [50, "\u00d6"], [51, "\u00f6"], [52, "\u00df"], [53, "\u00a5"], [54, "\u00a4"], [55, "\u2502"], [56, "\u00c5"], [57, "\u00e5"], [58, "\u00d8"], [59, "\u00f8"], [60, "\u250c"], [61, "\u2510"], [62, "\u2514"], [63, "\u2518"]]);
        function rh(a, b) {
          this.h = sh;
          this.o = new dh(a, b);
          this.i = new dh(a, b);
          this.l = new dh(a, b);
          this.g = this.i;
          this.j = 0;
          this.m = null;
        }
        function th(a, b, c) {
          a.g = a.i;
          var d = a.g,
            e = null;
          a.h !== uh && a.h !== vh && (e = fh(d, a.j, c), c = a.i, c.g = 0 < c.h ? c.h : 0, gh(c, 0, 15), c = a.l, c.g = 0 < c.h ? c.h : 0, gh(c, 0, 15), d.g = 15);
          a.h = uh;
          d.h = b;
          return e;
        }
        function wh(a) {
          a.h = xh;
          a.g = a.l;
          a.g.h = 0;
        }
        function yh(a) {
          Ya("Cea608DataChannel", "CEA-608 text mode entered, but is unsupported");
          a.g = a.o;
          a.h = vh;
        }
        var sh = 0,
          xh = 1,
          uh = 3,
          vh = 4,
          zh = "black green blue cyan red yellow magenta black".split(" "),
          Ah = "white green blue cyan red yellow magenta white_italics".split(" ");
        function Bh() {
          this.l = !1;
          this.A = this.F = 0;
          this.D = Ch;
          this.i = [];
          this.g = this.h = this.j = 0;
          this.u = this.o = !1;
          this.s = "white";
          this.m = "black";
          Dh(this);
        }
        function Dh(a) {
          a.i = [];
          for (var b = 0; 16 > b; b++) a.i.push(Eh());
        }
        function Eh() {
          for (var a = [], b = 0; 42 > b; b++) a.push(null);
          return a;
        }
        function Fh(a, b) {
          Gh(a) && (a.i[a.h][a.g] = new ch(b, a.u, a.o, a.m, a.s), a.g++);
        }
        function Gh(a) {
          var b = a.g < a.A && 0 <= a.g;
          return a.h < a.F && 0 <= a.h && b;
        }
        Bh.prototype.isVisible = function () {
          return this.l;
        };
        function Hh(a, b, c) {
          var d = new jb(a.j, b, "");
          d.textAlign = a.D === Ih ? "left" : a.D === Jh ? "right" : nb;
          if (c = $g(d, "svc" + c, a.i, a.j, b)) a.j = b;
          return c;
        }
        var Ih = 0,
          Jh = 1,
          Ch = 2;
        function Kh() {
          this.i = [];
          this.h = null;
          this.g = 0;
        }
        function Lh(a, b) {
          3 === b.type ? (a.g = 2 * (b.value & 63) - 1, a.h = []) : a.h && (0 < a.g && (a.h.push(b), a.g--), 0 === a.g && (a.i.push(new Mh(a.h)), a.h = null, a.g = 0));
        }
        function Mh(a) {
          this.g = 0;
          this.h = a;
        }
        Mh.prototype.ha = function () {
          return this.g < this.h.length;
        };
        Mh.prototype.$ = function () {
          return this.g;
        };
        function Nh(a) {
          if (!a.ha()) throw new O(2, 2, 3E3);
          return a.h[a.g++];
        }
        Mh.prototype.skip = function (a) {
          if (this.g + a > this.h.length) throw new O(2, 2, 3E3);
          this.g += a;
        };
        function Oh(a) {
          this.i = a;
          this.h = [null, null, null, null, null, null, null, null];
          this.g = null;
        }
        function Ph(a, b, c, d) {
          if (128 <= c && 135 >= c) d = c & 7, a.h[d] && (a.g = a.h[d]);else {
            if (136 === c) {
              c = Nh(b).value;
              b = null;
              c = t(Qh(a, c));
              for (var e = c.next(); !e.done; e = c.next()) e = a.h[e.value], e.isVisible() && (b = Hh(e, d, a.i)), Dh(e);
              return b;
            }
            if (137 === c) for (b = Nh(b).value, b = t(Qh(a, b)), c = b.next(); !c.done; c = b.next()) c = a.h[c.value], c.isVisible() || (c.j = d), c.l = !0;else {
              if (138 === c) {
                c = Nh(b).value;
                b = null;
                c = t(Qh(a, c));
                for (e = c.next(); !e.done; e = c.next()) e = a.h[e.value], e.isVisible() && (b = Hh(e, d, a.i)), e.l = !1;
                return b;
              }
              if (139 === c) {
                c = Nh(b).value;
                b = null;
                c = t(Qh(a, c));
                for (e = c.next(); !e.done; e = c.next()) e = a.h[e.value], e.isVisible() ? b = Hh(e, d, a.i) : e.j = d, e.l = !e.l;
                return b;
              }
              if (140 === c) return b = Nh(b).value, Rh(a, b, d);
              if (143 === c) return d = Rh(a, 255, d), Sh(a), d;
              if (144 === c) b.skip(1), d = Nh(b).value, a.g && (a.g.o = 0 < (d & 128), a.g.u = 0 < (d & 64));else if (145 === c) d = Nh(b).value, c = Nh(b).value, b.skip(1), a.g && (b = Th((c & 48) >> 4, (c & 12) >> 2, c & 3), a.g.s = Th((d & 48) >> 4, (d & 12) >> 2, d & 3), a.g.m = b);else if (146 === c) d = Nh(b).value, b = Nh(b).value, a.g && (a = a.g, a.h = d & 15, a.g = b & 63);else if (151 === c) b.skip(1), b.skip(1), d = Nh(b).value, b.skip(1), a.g && (a.g.D = d & 3);else if (152 <= c && 159 >= c) {
                c = (c & 15) - 8;
                e = null !== a.h[c];
                if (!e) {
                  var f = new Bh();
                  f.j = d;
                  a.h[c] = f;
                }
                d = Nh(b).value;
                Nh(b);
                Nh(b);
                f = Nh(b).value;
                var g = Nh(b).value;
                b = Nh(b).value;
                e && 0 === (b & 7) || (b = a.h[c], b.h = 0, b.g = 0, b.u = !1, b.o = !1, b.s = "white", b.m = "black");
                b = a.h[c];
                b.l = 0 < (d & 32);
                b.F = (f & 15) + 1;
                b.A = (g & 63) + 1;
                a.g = a.h[c];
              }
            }
          }
          return null;
        }
        function Qh(a, b) {
          for (var c = [], d = 0; 8 > d; d++) 1 === (b & 1) && a.h[d] && c.push(d), b >>= 1;
          return c;
        }
        function Rh(a, b, c) {
          var d = null;
          b = t(Qh(a, b));
          for (var e = b.next(); !e.done; e = b.next()) {
            e = e.value;
            var f = a.h[e];
            f.isVisible() && (d = Hh(f, c, a.i));
            a.h[e] = null;
          }
          return d;
        }
        function Sh(a) {
          a.g = null;
          a.h = [null, null, null, null, null, null, null, null];
        }
        function Th(a, b, c) {
          var d = {
            0: 0,
            1: 0,
            2: 1,
            3: 1
          };
          a = d[a];
          b = d[b];
          c = d[c];
          return Uh[a << 2 | b << 1 | c];
        }
        var Vh = new Map([[32, " "], [33, "\u00a0"], [37, "\u2026"], [42, "\u0160"], [44, "\u0152"], [48, "\u2588"], [49, "\u2018"], [50, "\u2019"], [51, "\u201c"], [52, "\u201d"], [53, "\u2022"], [57, "\u2122"], [58, "\u0161"], [60, "\u0153"], [61, "\u2120"], [63, "\u0178"], [118, "\u215b"], [119, "\u215c"], [120, "\u215d"], [121, "\u215e"], [122, "\u2502"], [123, "\u2510"], [124, "\u2514"], [125, "\u2500"], [126, "\u2518"], [127, "\u250c"]]),
          Uh = "black blue green cyan red magenta yellow white".split(" ");
        function Wh() {
          this.h = [];
          this.g = [];
          this.i = new Kh();
          this.l = 0;
          this.s = new Map([["CC1", new rh(0, 0)], ["CC2", new rh(0, 1)], ["CC3", new rh(1, 0)], ["CC4", new rh(1, 1)]]);
          this.o = this.m = 0;
          this.j = new Map();
          Xh(this);
        }
        function Xh(a) {
          a.m = 0;
          a.o = 0;
          a = t(a.s.values());
          for (var b = a.next(); !b.done; b = a.next()) b = b.value, b.h = 2, b.g = b.i, b.m = null, eh(b.i), eh(b.l), eh(b.o);
        }
        function Yh(a) {
          function b(f, g) {
            return f.pts - g.pts || f.order - g.order;
          }
          var c = [];
          a.h.sort(b);
          a.g.sort(b);
          for (var d = t(a.h), e = d.next(); !e.done; e = d.next()) (e = Zh(a, e.value)) && c.push(e);
          d = t(a.g);
          for (e = d.next(); !e.done; e = d.next()) Lh(a.i, e.value);
          d = t(a.i.i);
          for (e = d.next(); !e.done; e = d.next()) e = $h(a, e.value), c.push.apply(c, ia(e));
          a.i.i = [];
          a.h = [];
          a.g = [];
          return c;
        }
        function Zh(a, b) {
          var c = b.type;
          if (16 === (b.xa & 112)) {
            var d = b.xa >> 3 & 1;
            0 === c ? a.m = d : a.o = d;
          }
          c = a.s.get("CC" + (c << 1 | (c ? a.o : a.m) + 1));
          if (255 === b.xa && 255 === b.La || !b.xa && !b.La || !ai(b.xa) || !ai(b.La)) return 45 <= ++a.l && Xh(a), null;
          a.l = 0;
          b.xa &= 127;
          b.La &= 127;
          if (!b.xa && !b.La) return null;
          a = null;
          if (16 === (b.xa & 112)) a: {
            d = b.xa;
            a = b.La;
            if (c.m === (d << 8 | a)) c.m = null;else if (c.m = d << 8 | a, 16 === (d & 240) && 64 === (a & 192)) {
              b = [11, 11, 1, 2, 3, 4, 12, 13, 14, 15, 5, 6, 7, 8, 9, 10][(d & 7) << 1 | a >> 5 & 1];
              var e = (a & 30) >> 1;
              d = "white";
              var f = !1;
              7 > e ? d = Ah[e] : 7 === e && (f = !0);
              a = 1 === (a & 1);
              if (c.h !== vh) {
                e = c.g;
                if (c.h === uh && b !== e.g) {
                  var g = 1 + b - e.h;
                  qh(e, g, 1 + e.g - e.h, e.h);
                  gh(e, 0, g - 1);
                  gh(e, b + 1, 15 - b);
                }
                e.g = b;
                c.g.m = a;
                c.g.j = f;
                c.g.l = d;
                c.g.o = "black";
              }
            } else if (17 === (d & 247) && 32 === (a & 240)) c.g.m = !1, c.g.j = !1, c.g.l = "white", hh(c.g, ih, 32), d = !1, b = Ah[(a & 14) >> 1], "white_italics" === b && (b = "white", d = !0), c.g.m = 1 === (a & 1), c.g.j = d, c.g.l = b;else if (16 === (d & 247) && 32 === (a & 240) || 23 === (d & 247) && 45 === (a & 255)) b = "black", 0 === (d & 7) && (b = zh[(a & 14) >> 1]), c.g.o = b;else if (17 === (d & 247) && 48 === (a & 240)) hh(c.g, kh, a);else if (18 === (d & 246) && 32 === (a & 224)) hh(c.g, d & 1 ? oh : mh, a);else if (20 === (d & 246) && 32 === (a & 240)) {
              a = b.pts;
              d = null;
              switch (b.La) {
                case 32:
                  wh(c);
                  break;
                case 33:
                  c = c.g;
                  c.i[c.g].pop();
                  break;
                case 37:
                  d = th(c, 2, a);
                  break;
                case 38:
                  d = th(c, 3, a);
                  break;
                case 39:
                  d = th(c, 4, a);
                  break;
                case 40:
                  hh(c.g, ih, 32);
                  break;
                case 41:
                  c.h = 2;
                  c.g = c.i;
                  c.g.h = 0;
                  c.j = a;
                  break;
                case 42:
                  eh(c.o);
                  yh(c);
                  break;
                case 43:
                  yh(c);
                  break;
                case 44:
                  b = c.i;
                  d = null;
                  c.h !== vh && (d = fh(b, c.j, a));
                  gh(b, 0, 15);
                  break;
                case 45:
                  b = c.g;
                  c.h !== uh ? d = null : (d = fh(b, c.j, a), f = b.g - b.h + 1, qh(b, f - 1, f, b.h), gh(b, 0, f - 1), gh(b, b.g, 15 - b.g), c.j = a);
                  break;
                case 46:
                  gh(c.l, 0, 15);
                  break;
                case 47:
                  b = null, c.h !== vh && (b = fh(c.i, c.j, a)), d = c.l, c.l = c.i, c.i = d, wh(c), c.j = a, d = b;
              }
              a = d;
              break a;
            }
            a = null;
          } else d = b.La, hh(c.g, ih, b.xa), hh(c.g, ih, d);
          return a;
        }
        function $h(a, b) {
          var c = [];
          try {
            for (; b.ha();) {
              var d = Nh(b).value,
                e = (d & 224) >> 5,
                f = d & 31;
              7 === e && 0 != f && (e = Nh(b).value & 63);
              if (0 != e) {
                a.j.has(e) || a.j.set(e, new Oh(e));
                for (var g = a.j.get(e), h = b.$(); b.$() - h < f;) {
                  e = b;
                  var k = Nh(e),
                    l = k.value,
                    m = k.pts;
                  if (16 === l) {
                    var p = Nh(e);
                    l = l << 16 | p.value;
                  }
                  if (0 <= l && 31 >= l) {
                    var n = m;
                    if (g.g) {
                      var q = g.g;
                      e = null;
                      switch (l) {
                        case 8:
                          !Gh(q) || 0 >= q.g && 0 >= q.h || (0 >= q.g ? (q.g = q.A - 1, q.h--) : q.g--, q.i[q.h][q.g] = null);
                          break;
                        case 13:
                          q.isVisible() && (e = Hh(q, n, g.i));
                          if (q.h + 1 >= q.F) {
                            n = q;
                            for (var v = 0, y = 1; 16 > y; y++, v++) n.i[v] = n.i[y];
                            for (y = 0; 1 > y; y++, v++) n.i[v] = Eh();
                          } else q.h++;
                          q.g = 0;
                          break;
                        case 14:
                          q.isVisible() && (e = Hh(q, n, g.i));
                          q.i[q.h] = Eh();
                          q.g = 0;
                          break;
                        case 12:
                          q.isVisible() && (e = Hh(q, n, g.i)), Dh(q), n = q, n.h = 0, n.g = 0;
                      }
                      var w = e;
                    } else w = null;
                  } else if (128 <= l && 159 >= l) w = Ph(g, e, l, m);else {
                    if (4096 <= l && 4127 >= l) n = l & 255, 8 <= n && 15 >= n ? e.skip(1) : 16 <= n && 23 >= n ? e.skip(2) : 24 <= n && 31 >= n && e.skip(3);else if (4224 <= l && 4255 >= l) n = l & 255, 128 <= n && 135 >= n ? e.skip(4) : 136 <= n && 143 >= n && e.skip(5);else if (32 <= l && 127 >= l) e = l, g.g && (127 === e ? Fh(g.g, "\u266a") : Fh(g.g, String.fromCharCode(e)));else if (160 <= l && 255 >= l) g.g && Fh(g.g, String.fromCharCode(l));else if (4128 <= l && 4223 >= l) {
                      if (e = l & 255, g.g) if (Vh.has(e)) {
                        var x = Vh.get(e);
                        Fh(g.g, x);
                      } else Fh(g.g, "_");
                    } else 4256 <= l && 4351 >= l && g.g && (160 != (l & 255) ? Fh(g.g, "_") : Fh(g.g, "[CC]"));
                    w = null;
                  }
                  (e = w) && c.push(e);
                }
              }
            }
          } catch (D) {
            if (D instanceof O && 3E3 === D.code) Ya("CEA708_INVALID_DATA", "Buffer read out of bounds / invalid CEA-708 Data.");else throw D;
          }
          return c;
        }
        function ai(a) {
          for (var b = 0; a;) b ^= a & 1, a >>= 1;
          return 1 === b;
        }
        function bi() {}
        bi.prototype.init = function () {};
        bi.prototype.parse = function () {
          return [];
        };
        function ci(a) {
          for (var b = [], c = a, d = a = 0; d < c.length;) 2 == a && 3 == c[d] ? (a = 0, c = [].concat(ia(c)), c.splice(d, 1), c = new Uint8Array(c)) : 0 == c[d] ? a++ : a = 0, d++;
          a = c;
          for (d = 0; d < a.length;) {
            for (c = 0; 255 == a[d];) c += 255, d++;
            c += a[d++];
            for (var e = 0; 255 == a[d];) e += 255, d++;
            e += a[d++];
            4 == c && b.push(a.subarray(d, d + e));
            d += e;
          }
          return b;
        }
        function di(a, b) {
          var c = null,
            d = null,
            e = null,
            f = a.K();
          b & 1 && (e = a.$a());
          b & 2 && a.skip(4);
          b & 8 && (c = a.K());
          b & 16 && (d = a.K());
          return {
            trackId: f,
            De: c,
            yf: d,
            sh: e
          };
        }
        function ei(a, b) {
          return {
            xe: 1 == b ? a.$a() : a.K()
          };
        }
        function fi(a, b) {
          1 == b ? (a.skip(8), a.skip(8)) : (a.skip(4), a.skip(4));
          return {
            timescale: a.K()
          };
        }
        function gi(a, b, c) {
          var d = a.K(),
            e = [],
            f = null;
          c & 1 && (f = a.K());
          c & 4 && a.skip(4);
          for (var g = 0; g < d; g++) {
            var h = {
              ge: null,
              sampleSize: null,
              fd: null
            };
            c & 256 && (h.ge = a.K());
            c & 512 && (h.sampleSize = a.K());
            c & 1024 && a.skip(4);
            c & 2048 && (h.fd = 0 == b ? a.K() : a.Qe());
            e.push(h);
          }
          return {
            yh: d,
            Se: e,
            xf: f
          };
        }
        function hi() {
          this.j = new Map();
          this.i = this.h = 0;
          this.g = ii;
        }
        hi.prototype.init = function (a) {
          function b(f) {
            f = f.name;
            f in ji && (c.g = ji[f]);
          }
          var c = this,
            d = [],
            e = [];
          new yf().box("moov", Df).box("mvex", Df).R("trex", function (f) {
            var g = f.reader;
            g.skip(4);
            g.skip(4);
            f = g.K();
            g = g.K();
            c.h = f;
            c.i = g;
          }).box("trak", Df).R("tkhd", function (f) {
            var g = f.reader;
            1 == f.version ? (g.skip(8), g.skip(8)) : (g.skip(4), g.skip(4));
            f = g.K();
            d.push(f);
          }).box("mdia", Df).R("mdhd", function (f) {
            f = fi(f.reader, f.version);
            e.push(f.timescale);
          }).box("minf", Df).box("stbl", Df).R("stsd", Ff).box("avc1", b).box("avc3", b).box("hev1", b).box("hvc1", b).box("dvh1", b).box("dvhe", b).box("encv", Gf).box("sinf", Df).box("frma", function (f) {
            f = f.reader.K();
            f = Cf(f);
            f in ji && (c.g = ji[f]);
          }).parse(a, !0);
          if (!d.length || !e.length || d.length != e.length) throw new O(2, 2, 2010);
          this.g == ii && Xa("Unable to determine bitstream format for CEA parsing!");
          d.forEach(function (f, g) {
            c.j.set(f, e[g]);
          });
        };
        hi.prototype.parse = function (a) {
          var b = this;
          if (this.g == ii) return [];
          var c = [],
            d = this.h,
            e = this.i,
            f = 0,
            g = [],
            h = null,
            k = 9E4;
          new yf().box("moof", function (l) {
            f = l.start;
            g = [];
            Df(l);
          }).box("traf", Df).R("trun", function (l) {
            l = gi(l.reader, l.version, l.flags);
            g.push(l);
          }).R("tfhd", function (l) {
            l = di(l.reader, l.flags);
            d = l.De || b.h;
            e = l.yf || b.i;
            l = l.trackId;
            b.j.has(l) && (k = b.j.get(l));
          }).R("tfdt", function (l) {
            h = ei(l.reader, l.version).xe;
          }).box("mdat", function (l) {
            if (null === h) throw Xa("Unable to find base media decode time for CEA captions!"), new O(2, 2, 2010);
            ki(b, l.reader, h, k, d, e, f - l.start - 8, g, c);
          }).parse(a, !1);
          return c;
        };
        function ki(a, b, c, d, e, f, g, h, k) {
          var l = 0,
            m = f,
            p = h.map(function (v) {
              return v.Se;
            });
          p = [].concat.apply([], ia(p));
          p.length && (m = p[0].sampleSize || f);
          for (b.skip(g + h[0].xf); b.ha();) {
            g = b.K();
            var n = b.Ra(),
              q = null;
            q = !1;
            h = 1;
            switch (a.g) {
              case li:
                q = n & 31;
                q = 6 == q;
                break;
              case mi:
                h = 2;
                b.skip(1);
                q = n >> 1 & 63;
                q = 39 == q || 40 == q;
                break;
              default:
                return;
            }
            if (q) for (n = 0, l < p.length && (n = p[l].fd || 0), n = (c + n) / d, h = t(ci(b.Za(g - h))), q = h.next(); !q.done; q = h.next()) k.push({
              kg: q.value,
              pts: n
            });else try {
              b.skip(g - h);
            } catch (v) {
              break;
            }
            m -= g + 4;
            0 == m && (c = l < p.length ? c + (p[l].ge || e) : c + e, l++, l < p.length ? m = p[l].sampleSize || f : m = f);
          }
        }
        var ii = 0,
          li = 1,
          mi = 2,
          ji = {
            avc1: li,
            avc3: li,
            hev1: mi,
            hvc1: mi,
            dvh1: mi,
            dvhe: mi
          };
        function ni(a) {
          this.h = new bi();
          a.includes("video/mp4") && (this.h = new hi());
          this.g = new Wh();
        }
        ni.prototype.init = function (a) {
          this.h.init(a);
        };
        function oi(a, b) {
          b = a.h.parse(b);
          b = t(b);
          for (var c = b.next(); !c.done; c = b.next()) {
            var d = c.value,
              e = L(d.kg);
            if (0 < e.length && (c = a.g, d = d.pts, e = new vf(e, 0), 181 === e.Ra() && 49 === e.be() && 1195456820 === e.K() && 3 === e.Ra())) {
              var f = e.Ra();
              if (0 !== (f & 64)) {
                f &= 31;
                e.skip(1);
                for (var g = 0; g < f; g++) {
                  var h = e.Ra(),
                    k = (h & 4) >> 2,
                    l = e.Ra(),
                    m = e.Ra();
                  k && (h &= 3, 0 === h || 1 === h ? c.h.push({
                    pts: d,
                    type: h,
                    xa: l,
                    La: m,
                    order: c.h.length
                  }) : (c.g.push({
                    pts: d,
                    type: h,
                    value: l,
                    order: c.g.length
                  }), c.g.push({
                    pts: d,
                    type: 2,
                    value: m,
                    order: c.g.length
                  })));
                }
              }
            }
          }
          return Yh(a.g);
        }
        function pi(a, b, c, d, e) {
          this.ya = a;
          this.Ba = b;
          this.ma = c;
          this.Qd = void 0 === d ? null : d;
          this.timescale = e;
        }
        pi.prototype.mc = function () {
          return this.Ba;
        };
        pi.prototype.ic = function () {
          return this.ma;
        };
        function qi(a, b) {
          return a && b ? a.mc() == b.mc() && a.ic() == b.ic() && ib(a.ya(), b.ya()) : a == b;
        }
        K("shaka.media.InitSegmentReference", pi);
        pi.prototype.getEndByte = pi.prototype.ic;
        pi.prototype.getStartByte = pi.prototype.mc;
        function T(a, b, c, d, e, f, g, h, k, l, m, p, n, q, v) {
          l = void 0 === l ? [] : l;
          q = void 0 === q ? ri : q;
          this.startTime = a;
          this.l = this.endTime = b;
          this.A = c;
          this.Ba = d;
          this.ma = e;
          this.h = f;
          this.timestampOffset = g;
          this.appendWindowStart = h;
          this.appendWindowEnd = k;
          this.i = l;
          this.tilesLayout = void 0 === m ? "" : m;
          this.s = void 0 === p ? null : p;
          this.g = void 0 === n ? null : n;
          this.status = q;
          this.u = !1;
          this.m = void 0 === v ? null : v;
          this.o = null;
          this.j = 0;
        }
        r = T.prototype;
        r.ya = function () {
          return this.A();
        };
        r.getStartTime = function () {
          return this.startTime;
        };
        r.Ff = function () {
          return this.endTime;
        };
        r.mc = function () {
          return this.Ba;
        };
        r.ic = function () {
          return this.ma;
        };
        r.Wf = function () {
          return this.tilesLayout;
        };
        r.Vf = function () {
          return this.s;
        };
        r.Fb = function () {
          return this.status;
        };
        r.dg = function () {
          this.status = si;
        };
        r.Ne = function () {
          this.u = !0;
        };
        r.bg = function () {
          return this.u;
        };
        r.Ze = function (a) {
          this.o = a;
        };
        r.Tf = function () {
          return this.o;
        };
        r.offset = function (a) {
          this.startTime += a;
          this.endTime += a;
          this.l += a;
          for (var b = t(this.i), c = b.next(); !c.done; c = b.next()) c = c.value, c.startTime += a, c.endTime += a, c.l += a;
        };
        r.pe = function (a) {
          null == this.g ? Wa("Sync attempted without sync time!") : (a = this.g - a - this.startTime, .001 <= Math.abs(a) && this.offset(a));
        };
        K("shaka.media.SegmentReference", T);
        T.prototype.syncAgainst = T.prototype.pe;
        T.prototype.offset = T.prototype.offset;
        T.prototype.getThumbnailSprite = T.prototype.Tf;
        T.prototype.setThumbnailSprite = T.prototype.Ze;
        T.prototype.isPreload = T.prototype.bg;
        T.prototype.markAsPreload = T.prototype.Ne;
        T.prototype.markAsUnavailable = T.prototype.dg;
        T.prototype.getStatus = T.prototype.Fb;
        T.prototype.getTileDuration = T.prototype.Vf;
        T.prototype.getTilesLayout = T.prototype.Wf;
        T.prototype.getEndByte = T.prototype.ic;
        T.prototype.getStartByte = T.prototype.mc;
        T.prototype.getEndTime = T.prototype.Ff;
        T.prototype.getStartTime = T.prototype.getStartTime;
        T.prototype.getUris = T.prototype.ya;
        var ri = 0,
          si = 1;
        T.Status = {
          Jg: ri,
          ph: si,
          Xg: 2
        };
        function ti(a) {
          return !a || 1 == a.length && 1E-6 > a.end(0) - a.start(0) ? null : 1 == a.length && 0 > a.start(0) ? 0 : a.length ? a.start(0) : null;
        }
        function ui(a) {
          return !a || 1 == a.length && 1E-6 > a.end(0) - a.start(0) ? null : a.length ? a.end(a.length - 1) : null;
        }
        function vi(a, b) {
          return !a || !a.length || 1 == a.length && 1E-6 > a.end(0) - a.start(0) || b > a.end(a.length - 1) ? !1 : b >= a.start(0);
        }
        function wi(a, b) {
          if (!a || !a.length || 1 == a.length && 1E-6 > a.end(0) - a.start(0)) return 0;
          var c = 0;
          a = t(xi(a));
          for (var d = a.next(); !d.done; d = a.next()) {
            var e = d.value;
            d = e.start;
            e = e.end;
            e > b && (c += e - Math.max(d, b));
          }
          return c;
        }
        function yi(a, b, c) {
          if (!a || !a.length || 1 == a.length && 1E-6 > a.end(0) - a.start(0)) return null;
          a = xi(a).findIndex(function (d, e, f) {
            return d.start > b && (0 == e || f[e - 1].end - b <= c);
          });
          return 0 <= a ? a : null;
        }
        function xi(a) {
          if (!a) return [];
          for (var b = [], c = 0; c < a.length; c++) b.push({
            start: a.start(c),
            end: a.end(c)
          });
          return b;
        }
        function zi() {}
        function Ai(a, b) {
          var c = (a[b] & 127) << 21;
          c |= (a[b + 1] & 127) << 14;
          c |= (a[b + 2] & 127) << 7;
          return c |= a[b + 3] & 127;
        }
        function Bi(a) {
          var b = {
            key: a.type,
            description: "",
            data: ""
          };
          if ("TXXX" === a.type) {
            if (2 > a.size || 3 !== a.data[0]) return null;
            var c = a.data.subarray(1).indexOf(0);
            if (-1 === c) return null;
            var d = Bc(L(a.data, 1, c));
            a = Bc(L(a.data, 2 + c)).replace(/\0*$/, "");
            b.description = d;
            b.data = a;
            return b;
          }
          if ("WXXX" === a.type) {
            if (2 > a.size || 3 !== a.data[0]) return null;
            c = a.data.subarray(1).indexOf(0);
            if (-1 === c) return null;
            d = Bc(L(a.data, 1, c));
            a = Bc(L(a.data, 2 + c)).replace(/\0*$/, "");
            b.description = d;
            b.data = a;
            return b;
          }
          if ("PRIV" === a.type) {
            if (2 > a.size) return null;
            d = a.data.indexOf(0);
            if (-1 === d) return null;
            d = Bc(L(a.data, 0, d));
            a = Hb(a.data.subarray(d.length + 1));
            b.description = d;
            b.data = a;
            return b;
          }
          if ("T" === a.type[0]) {
            if (2 > a.size || 3 !== a.data[0]) return null;
            a = Bc(a.data.subarray(1)).replace(/\0*$/, "");
            b.data = a;
            return b;
          }
          return "W" === a.type[0] ? (a = Bc(a.data).replace(/\0*$/, ""), b.data = a, b) : a.data ? (b.data = Hb(a.data), b) : null;
        }
        function Ci(a) {
          for (var b = 0, c = []; b + 10 <= a.length && 73 === a[b] && 68 === a[b + 1] && 51 === a[b + 2] && 255 > a[b + 3] && 255 > a[b + 4] && 128 > a[b + 6] && 128 > a[b + 7] && 128 > a[b + 8] && 128 > a[b + 9];) {
            var d = Ai(a, b + 6);
            a[b + 5] >> 6 & 1 && (b += 10);
            b += 10;
            for (d = b + d; b + 10 < d;) {
              var e = a.subarray(b),
                f = Ai(e, 4);
              e = {
                type: String.fromCharCode(e[0], e[1], e[2], e[3]),
                size: f,
                data: e.subarray(10, 10 + f)
              };
              (f = Bi(e)) && c.push(f);
              b += e.size + 10;
            }
            b + 10 <= a.length && 51 === a[b] && 68 === a[b + 1] && 73 === a[b + 2] && 255 > a[b + 3] && 255 > a[b + 4] && 128 > a[b + 6] && 128 > a[b + 7] && 128 > a[b + 8] && 128 > a[b + 9] && (b += 10);
          }
          return c;
        }
        K("shaka.util.Id3Utils", zi);
        zi.getID3Frames = Ci;
        function Di() {
          this.o = null;
          this.s = !1;
          this.l = this.m = null;
          this.A = [];
          this.g = this.h = null;
          this.u = [];
          this.j = null;
          this.i = [];
        }
        Di.prototype.parse = function (a) {
          if (564 > a.length) return this;
          for (var b = Math.max(0, Ei(a)), c = a.length - (a.length + b) % 188, d = !1, e = b; e < c; e += 188) if (71 === a[e]) {
            var f = !!(a[e + 1] & 64),
              g = ((a[e + 1] & 31) << 8) + a[e + 2];
            if (1 < (a[e + 3] & 48) >> 4) {
              var h = e + 5 + a[e + 4];
              if (h === e + 188) continue;
            } else h = e + 4;
            switch (g) {
              case 0:
                f && (h += a[h] + 1);
                this.o = (a[h + 10] & 31) << 8 | a[h + 11];
                break;
              case 17:
              case 8191:
                break;
              case this.o:
                f && (h += a[h] + 1);
                f = a;
                g = {
                  audio: -1,
                  video: -1,
                  Gd: -1,
                  audioCodec: "",
                  videoCodec: ""
                };
                var k = h + 3 + ((f[h + 1] & 15) << 8 | f[h + 2]) - 4;
                for (h += 12 + ((f[h + 10] & 15) << 8 | f[h + 11]); h < k;) {
                  var l = (f[h + 1] & 31) << 8 | f[h + 2];
                  switch (f[h]) {
                    case 15:
                      -1 === g.audio && (g.audio = l, g.audioCodec = "aac");
                      break;
                    case 21:
                      -1 === g.Gd && (g.Gd = l);
                      break;
                    case 27:
                      -1 === g.video && (g.video = l, g.videoCodec = "avc");
                      break;
                    case 3:
                    case 4:
                      -1 === g.audio && (g.audio = l, g.audioCodec = "mp3");
                      break;
                    case 36:
                      -1 === g.video && (g.video = l, g.videoCodec = "hvc");
                  }
                  h += ((f[h + 3] & 15) << 8 | f[h + 4]) + 5;
                }
                f = g;
                null == this.l && (this.l = f.video);
                null == this.g && (this.g = f.audio);
                null == this.j && (this.j = f.Gd);
                d && !this.s && (d = !1, e = b - 188);
                this.s = !0;
                break;
              case this.l:
                f = a.subarray(h, e + 188);
                null == this.m && (h = Fi(f)) && null != h.pts && (this.m = h.pts / 9E4);
                this.A.push(f);
                break;
              case this.g:
                f = a.subarray(h, e + 188);
                null == this.h && (h = Fi(f)) && null != h.pts && (this.h = h.pts / 9E4);
                this.u.push(f);
                break;
              case this.j:
                this.i.push(a.subarray(h, e + 188));
                break;
              default:
                d = !0;
            }
          }
          return this;
        };
        function Fi(a) {
          if (1 !== (a[0] << 16 | a[1] << 8 | a[2])) return null;
          var b = {
              data: new Uint8Array(0),
              xh: 6 + (a[4] << 8 | a[5]),
              pts: null,
              dts: null
            },
            c = a[7];
          c & 192 && (b.pts = 536870912 * (a[9] & 14) + 4194304 * (a[10] & 255) + 16384 * (a[11] & 254) + 128 * (a[12] & 255) + (a[13] & 254) / 2, b.dts = b.pts, c & 64 && (b.dts = 536870912 * (a[14] & 14) + 4194304 * (a[15] & 255) + 16384 * (a[16] & 254) + 128 * (a[17] & 255) + (a[18] & 254) / 2));
          b.data = a.subarray(9 + a[8]);
          return b;
        }
        function Gi(a) {
          for (var b = [], c = new Uint8Array(0), d = a.i.length - 1; 0 <= d; d--) {
            c = Nc(a.i[d], c);
            var e = Fi(c);
            e && (b.unshift({
              cueTime: e.pts ? e.pts / 9E4 : null,
              data: e.data,
              frames: Ci(e.data),
              dts: e.dts,
              pts: e.pts
            }), c = new Uint8Array(0));
          }
          return b;
        }
        Di.prototype.getStartTime = function () {
          return {
            audio: this.h,
            video: this.m
          };
        };
        function Ei(a) {
          for (var b = Math.min(1E3, a.length - 564), c = 0; c < b;) {
            if (71 === a[c] && 71 === a[c + 188] && 71 === a[c + 376]) return c;
            c++;
          }
          return -1;
        }
        K("shaka.util.TsParser", Di);
        function Hi(a, b, c) {
          this.g = null;
          this.i = -1;
          this.j = a;
          this.h = b;
          this.l = c;
          "undefined" === typeof libDPIModule && Xa("Could not Find LCEVC Library dependencies on this page");
          "undefined" === typeof LcevcDil ? Xa("Could not Find LCEVC Library on this page") : LcevcDil.SupportObject.SupportStatus || Xa(LcevcDil.SupportObject.SupportError);
          "undefined" !== typeof LcevcDil && "undefined" !== typeof libDPIModule && this.h instanceof HTMLCanvasElement && LcevcDil.SupportObject.SupportStatus && !this.g && LcevcDil.SupportObject.webGLSupport(this.h) && (this.h.classList.remove("shaka-hidden"), this.g = new LcevcDil.LcevcDil(this.j, this.h, this.l));
        }
        Hi.prototype.release = function () {
          this.g && (this.g.close(), this.g = null);
        };
        function Ii(a, b) {
          var c = Ji;
          switch (b.mimeType) {
            case "video/webm":
              c = Ki;
              break;
            case "video/mp4":
              c = Li;
          }
          a.g && (a.i = b.id, a.g.setLevelSwitching(b.id, !0), a.g.setContainerFormat(c));
        }
        K("shaka.lcevc.Dil", Hi);
        Hi.prototype.release = Hi.prototype.release;
        var Ji = 0,
          Ki = 1,
          Li = 2;
        function Mi(a, b, c, d) {
          var e = this;
          this.l = a;
          this.G = null;
          this.m = b;
          this.h = {};
          this.L = {};
          this.P = {};
          this.g = null;
          this.H = !1;
          this.V = c || function () {};
          this.F = d || null;
          this.i = {};
          this.u = new lf();
          this.o = {};
          this.s = null;
          this.J = new kc();
          this.M = "";
          this.j = Ni(this, this.J);
          this.D = new jf(function () {
            return Oi(e);
          });
          this.A = !1;
          this.W = new kc();
        }
        function Ni(a, b) {
          var c = new MediaSource();
          a.u.ia(c, "sourceopen", function () {
            URL.revokeObjectURL(a.M);
            b.resolve();
          });
          a.M = Pi(c);
          a.l.src = a.M;
          return c;
        }
        r = Mi.prototype;
        r.destroy = function () {
          return this.D.destroy();
        };
        function Oi(a) {
          var b, c, d, e, f, g, h, k;
          return G(function (l) {
            if (1 == l.g) {
              b = [];
              for (c in a.i) for (d = a.i[c], e = d[0], a.i[c] = d.slice(0, 1), e && b.push(e.p.catch(bc)), f = t(d.slice(1)), g = f.next(); !g.done; g = f.next()) h = g.value, h.p.reject(new O(2, 7, 7003, void 0));
              a.g && b.push(a.g.destroy());
              a.m && b.push(a.m.destroy());
              for (k in a.o) b.push(a.o[k].destroy());
              return u(l, Promise.all(b), 2);
            }
            a.u && (a.u.release(), a.u = null);
            a.l && (a.l.removeAttribute("src"), a.l.load(), a.l = null);
            a.G = null;
            a.j = null;
            a.g = null;
            a.m = null;
            a.h = {};
            a.o = {};
            a.s = null;
            a.i = {};
            a.F = null;
            A(l);
          });
        }
        r.init = function (a, b, c) {
          c = void 0 === c ? !1 : c;
          var d = this,
            e,
            f,
            g,
            h,
            k,
            l,
            m,
            p;
          return G(function (n) {
            if (1 == n.g) return e = jc, u(n, d.J, 2);
            d.A = c;
            f = {};
            g = t(a.keys());
            for (h = g.next(); !h.done; f = {
              oa: f.oa
            }, h = g.next()) if (f.oa = h.value, k = a.get(f.oa), l = Yc(k.mimeType, k.codecs), f.oa == e.X) Qi(d, l, c, k.external);else {
              !b && db(l) || !Sc(l, f.oa) || (d.o[f.oa] = new Rc(l), l = Vc(f.oa, l));
              m = l + d.G.sourceBufferExtraFeatures;
              kf(d.D);
              p = void 0;
              try {
                p = d.j.addSourceBuffer(m);
              } catch (q) {
                throw new O(2, 3, 3015, q, "The mediaSource_ status was" + d.j.readyState + "expected 'open'");
              }
              d.u.C(p, "error", function (q) {
                return function () {
                  d.i[q.oa][0].p.reject(new O(2, 3, 3014, d.l.error ? d.l.error.code : 0));
                };
              }(f));
              d.u.C(p, "updateend", function (q) {
                return function () {
                  return Ri(d, q.oa);
                };
              }(f));
              d.h[f.oa] = p;
              d.L[f.oa] = l;
              d.i[f.oa] = [];
              d.P[f.oa] = !!k.drmInfos.length;
            }
            A(n);
          });
        };
        r.configure = function (a) {
          this.G = a;
        };
        function Qi(a, b, c, d) {
          a.g || (a.g = new cd(a.m));
          var e = a.g;
          a = d || a.H;
          "application/cea-608" == b || "application/cea-708" == b ? e.i = null : (e.i = (0, ed[b])(), e.i.setSequenceMode ? e.i.setSequenceMode(c) : Xa('Text parsers should have a "setSequenceMode" method!'), e.u = a);
        }
        function Si(a) {
          return a.j ? "ended" == a.j.readyState : !0;
        }
        function Ti(a, b) {
          return b == ic ? a.g.g : ti(Ui(a, b));
        }
        function Vi(a, b) {
          return b == ic ? a.g.h : ui(Ui(a, b));
        }
        function Wi(a, b, c) {
          if (b == ic) return a = a.g, null == a.h || a.h < c ? 0 : a.h - Math.max(c, a.g);
          a = Ui(a, b);
          return wi(a, c);
        }
        r.Ma = function () {
          var a = {
            total: xi(this.l.buffered),
            audio: xi(Ui(this, "audio")),
            video: xi(Ui(this, "video")),
            text: []
          };
          if (this.g) {
            var b = this.g.g,
              c = this.g.h;
            null != b && null != c && a.text.push({
              start: b,
              end: c
            });
          }
          return a;
        };
        function Ui(a, b) {
          try {
            return a.h[b].buffered;
          } catch (c) {
            return null;
          }
        }
        function Xi(a, b, c, d, e, f, g) {
          f = void 0 === f ? !1 : f;
          g = void 0 === g ? !1 : g;
          var h, k, l, m, p, n, q, v, y, w, x, D, z, B, E, F, H, I, J, N, R, Q, ba;
          return G(function (M) {
            switch (M.g) {
              case 1:
                h = jc;
                if (b != h.X) {
                  M.B(2);
                  break;
                }
                if (!a.A) {
                  M.B(3);
                  break;
                }
                return u(M, a.W, 4);
              case 4:
                k = M.h, a.g.s = k;
              case 3:
                return u(M, fd(a.g, c, d ? d.startTime : null, d ? d.endTime : null), 5);
              case 5:
                return M.return();
              case 2:
                l = L(c);
                m = a.L[b];
                a.o[b] && (m = a.o[b].o);
                0 > Ei(l) ? Yi.includes(m) && (v = Ci(l), v.length && d && (y = {
                  cueTime: d.startTime,
                  data: l,
                  frames: v,
                  dts: d.startTime,
                  pts: d.startTime
                }, a.V([y], 0, d.endTime))) : (p = new Di().parse(l), n = d.startTime - (p.getStartTime()[b] || 0), q = Gi(p), q.length && a.V(q, n, d ? d.endTime : null));
                if (!a.o[b]) {
                  e && b == h.va && (a.g || Qi(a, "application/cea-608", a.A, !1), a.s || (a.s = new ni(m)), d ? (w = oi(a.s, c), w.length && (x = a.h[h.va].timestampOffset, kd(a.g, w, d.startTime, d.endTime, x))) : a.s.init(c));
                  M.B(6);
                  break;
                }
                f && a.o[b].g.resetCaptions();
                return u(M, Wc(a.o[b], c), 7);
              case 7:
                D = M.h, a.g || Qi(a, "application/cea-608", a.A, !1), D.captions && D.captions.length && (z = a.h[h.va].timestampOffset, B = id(D.captions), kd(a.g, B, d ? d.startTime : null, d ? d.endTime : null, z)), c = D.data;
              case 6:
                c = Zi(a, c, d ? d.startTime : null, b);
                E = a.h[b];
                F = $i;
                if (!a.A || E.mode == F || !d) {
                  M.B(8);
                  break;
                }
                H = a.j.duration;
                I = b == h.va || !(h.va in a.h);
                if (!I) {
                  M.B(9);
                  break;
                }
                J = [E.appendWindowStart, E.appendWindowEnd];
                E.appendWindowStart = 0;
                E.appendWindowEnd = Infinity;
                N = E.timestampOffset;
                E.timestampOffset = 0;
                return u(M, aj(a, b, function () {
                  return bj(a, b, c);
                }), 10);
              case 10:
                return u(M, aj(a, b, function () {
                  return cj(a, b);
                }), 11);
              case 11:
                return E.timestampOffset = N, E.appendWindowStart = J[0], E.appendWindowEnd = J[1], R = ti(Ui(a, b)), Q = (d.startTime || 0) - (R || 0), a.W.resolve(Q), u(M, aj(a, b, function () {
                  return dj(a, b, 0, H);
                }), 12);
              case 12:
                if (b != h.va) {
                  M.B(9);
                  break;
                }
                return u(M, aj(a, b, function () {
                  a.l.currentTime -= .001;
                  Ri(a, b);
                }), 9);
              case 9:
                return E.mode = F, u(M, a.Aa(H), 8);
              case 8:
                return d && a.A && b != h.X && (f || g) && (ba = d.startTime, aj(a, b, function () {
                  return cj(a, b);
                }), aj(a, b, function () {
                  return ej(a, b, ba);
                })), u(M, aj(a, b, function () {
                  bj(a, b, c);
                }), 16);
              case 16:
                A(M);
            }
          });
        }
        function fj(a, b) {
          var c = Vi(a, "video") || 0;
          hd(a.g, b, c);
        }
        function gj(a) {
          a.g && hd(a.g, "", 0);
        }
        r.remove = function (a, b, c) {
          var d = this,
            e;
          return G(function (f) {
            e = jc;
            return a == e.X ? u(f, d.g.remove(b, c), 0) : u(f, aj(d, a, function () {
              return dj(d, a, b, c);
            }), 0);
          });
        };
        function hj(a, b) {
          var c;
          return G(function (d) {
            c = jc;
            return b == c.X ? a.g ? u(d, a.g.remove(0, Infinity), 0) : d.return() : u(d, aj(a, b, function () {
              return dj(a, b, 0, a.j.duration);
            }), 0);
          });
        }
        r.flush = function (a) {
          var b = this,
            c;
          return G(function (d) {
            c = jc;
            return a == c.X ? d.return() : u(d, aj(b, a, function () {
              b.l.currentTime -= .001;
              Ri(b, a);
            }), 0);
          });
        };
        function ij(a, b, c, d, e, f) {
          var g;
          return G(function (h) {
            g = jc;
            return b == g.X ? (f || (a.g.s = c), gd(a.g, d, e), h.return()) : u(h, Promise.all([aj(a, b, function () {
              return cj(a, b);
            }), f ? Promise.resolve() : aj(a, b, function () {
              return ej(a, b, c);
            }), aj(a, b, function () {
              a.h[b].appendWindowStart = 0;
              a.h[b].appendWindowEnd = e;
              a.h[b].appendWindowStart = d;
              Ri(a, b);
            })]), 0);
          });
        }
        function jj(a, b, c) {
          var d;
          return G(function (e) {
            d = jc;
            if (b == d.X) return e.return();
            aj(a, b, function () {
              return cj(a, b);
            });
            return u(e, aj(a, b, function () {
              return ej(a, b, c);
            }), 0);
          });
        }
        r.endOfStream = function (a) {
          var b = this;
          return G(function (c) {
            return u(c, kj(b, function () {
              Si(b) || "closed" === b.j.readyState || (a ? b.j.endOfStream(a) : b.j.endOfStream());
            }), 0);
          });
        };
        r.Aa = function (a) {
          var b = this;
          return G(function (c) {
            return u(c, kj(b, function () {
              if (a < b.j.duration) for (var d in b.h) {
                var e = {
                  start: function () {},
                  p: new kc()
                };
                b.i[d].unshift(e);
              }
              b.j.duration = a;
            }), 0);
          });
        };
        r.getDuration = function () {
          return this.j.duration;
        };
        function bj(a, b, c) {
          if ("video" == b && a.F) {
            var d = a.F;
            d.g && d.g.appendBuffer(c, "video", d.i);
          }
          a.h[b].appendBuffer(c);
        }
        function dj(a, b, c, d) {
          d <= c ? Ri(a, b) : a.h[b].remove(c, d);
        }
        function cj(a, b) {
          var c = a.h[b].appendWindowStart,
            d = a.h[b].appendWindowEnd;
          a.h[b].abort();
          a.h[b].appendWindowStart = c;
          a.h[b].appendWindowEnd = d;
          Ri(a, b);
        }
        function ej(a, b, c) {
          0 > c && (c += .001);
          a.h[b].timestampOffset = c;
          Ri(a, b);
        }
        function Ri(a, b) {
          var c = a.i[b][0];
          c && (c.p.resolve(), lj(a, b));
        }
        function aj(a, b, c) {
          kf(a.D);
          c = {
            start: c,
            p: new kc()
          };
          a.i[b].push(c);
          1 == a.i[b].length && mj(a, b);
          return c.p;
        }
        function kj(a, b) {
          var c, d, e, f, g, h;
          return G(function (k) {
            switch (k.g) {
              case 1:
                kf(a.D);
                c = [];
                d = {};
                for (e in a.h) d.Vb = new kc(), f = {
                  start: function (l) {
                    return function () {
                      return l.Vb.resolve();
                    };
                  }(d),
                  p: d.Vb
                }, a.i[e].push(f), c.push(d.Vb), 1 == a.i[e].length && f.start(), d = {
                  Vb: d.Vb
                };
                C(k, 2);
                return u(k, Promise.all(c), 4);
              case 4:
                va(k, 3);
                break;
              case 2:
                throw g = wa(k), g;
              case 3:
                try {
                  b();
                } catch (l) {
                  throw new O(2, 3, 3015, l);
                } finally {
                  for (h in a.h) lj(a, h);
                }
                A(k);
            }
          });
        }
        function lj(a, b) {
          a.i[b].shift();
          mj(a, b);
        }
        function mj(a, b) {
          var c = a.i[b][0];
          if (c) try {
            c.start();
          } catch (d) {
            "QuotaExceededError" == d.name ? c.p.reject(new O(2, 3, 3017, b)) : c.p.reject(new O(2, 3, 3015, d)), lj(a, b);
          }
        }
        function Zi(a, b, c, d) {
          var e = a.P[d];
          null == c && e && (tc() || rc()) && "mp4" == a.L[d].split(";")[0].split("/")[1] && (b = Wg(b));
          return b;
        }
        var Pi = window.URL.createObjectURL,
          $i = "sequence",
          Yi = ["audio/aac", "audio/ac3", "audio/ec3", "audio/mpeg"];
        function U(a, b, c) {
          this.i = a;
          this.m = b;
          this.o = this.j = Infinity;
          this.g = 1;
          this.h = this.l = null;
          this.s = 0;
          this.u = !0;
          this.A = 0;
          this.D = void 0 === c ? !0 : c;
          this.F = 0;
          this.G = !1;
        }
        r = U.prototype;
        r.getDuration = function () {
          return this.j;
        };
        r.Lf = function () {
          return this.g;
        };
        r.Ye = function (a) {
          this.i = a;
        };
        r.Aa = function (a) {
          this.j = a;
        };
        r.Qf = function () {
          return this.i;
        };
        r.We = function (a) {
          this.s = a;
        };
        r.zc = function (a) {
          this.u = a;
        };
        r.oe = function (a) {
          this.o = a;
        };
        r.Xe = function (a) {
          this.m = a;
        };
        r.Ef = function () {
          return this.m;
        };
        r.Jb = function (a) {
          if (0 != a.length) {
            var b = a[0].startTime,
              c = a[0].endTime,
              d = (Date.now() + this.s) / 1E3;
            a = t(a);
            for (var e = a.next(); !e.done; e = a.next()) e = e.value, d < e.startTime || (b = Math.min(b, e.startTime), c = Math.max(c, e.endTime), this.g = Math.max(this.g, e.endTime - e.startTime));
            this.Vd(b);
            this.h = Math.max(this.h, c);
            null != this.i && this.D && !this.G && (this.i = d - this.h - this.g);
          }
        };
        r.Od = function () {
          this.G = !0;
        };
        r.Vd = function (a) {
          this.l = null == this.l ? a : Math.min(this.l, a);
        };
        r.Ud = function (a) {
          this.g = Math.max(this.g, a);
        };
        r.offset = function (a) {
          null != this.l && (this.l += a);
          null != this.h && (this.h += a);
        };
        r.T = function () {
          return Infinity == this.j && !this.u;
        };
        r.jb = function () {
          return Infinity != this.j && !this.u;
        };
        r.Oa = function () {
          return Math.max(this.A, this.gb() - this.o);
        };
        r.$e = function (a) {
          this.A = a;
        };
        r.gb = function () {
          return this.T() || this.jb() ? Math.min(Math.max(0, (Date.now() + this.s) / 1E3 - this.g - this.i) + this.F, this.j) : this.h ? Math.min(this.h, this.j) : this.j;
        };
        r.lc = function (a) {
          var b = Math.max(this.l, this.A);
          return Infinity == this.o ? Math.ceil(1E3 * b) / 1E3 : Math.max(b, Math.min(this.gb() - this.o + a, this.Na()));
        };
        r.Eb = function () {
          return this.lc(0);
        };
        r.Na = function () {
          return Math.max(0, this.gb() - (this.T() || this.jb() ? this.m : 0));
        };
        r.ef = function () {
          return null == this.i || null != this.h && this.D ? !1 : !0;
        };
        r.Ve = function (a) {
          this.F = a;
        };
        K("shaka.media.PresentationTimeline", U);
        U.prototype.setAvailabilityTimeOffset = U.prototype.Ve;
        U.prototype.usingPresentationStartTime = U.prototype.ef;
        U.prototype.getSeekRangeEnd = U.prototype.Na;
        U.prototype.getSeekRangeStart = U.prototype.Eb;
        U.prototype.getSafeSeekRangeStart = U.prototype.lc;
        U.prototype.getSegmentAvailabilityEnd = U.prototype.gb;
        U.prototype.setUserSeekStart = U.prototype.$e;
        U.prototype.getSegmentAvailabilityStart = U.prototype.Oa;
        U.prototype.isInProgress = U.prototype.jb;
        U.prototype.isLive = U.prototype.T;
        U.prototype.offset = U.prototype.offset;
        U.prototype.notifyMaxSegmentDuration = U.prototype.Ud;
        U.prototype.notifyMinSegmentStartTime = U.prototype.Vd;
        U.prototype.lockStartTime = U.prototype.Od;
        U.prototype.notifySegments = U.prototype.Jb;
        U.prototype.getDelay = U.prototype.Ef;
        U.prototype.setDelay = U.prototype.Xe;
        U.prototype.setSegmentAvailabilityDuration = U.prototype.oe;
        U.prototype.setStatic = U.prototype.zc;
        U.prototype.setClockOffset = U.prototype.We;
        U.prototype.getPresentationStartTime = U.prototype.Qf;
        U.prototype.setDuration = U.prototype.Aa;
        U.prototype.setPresentationStartTime = U.prototype.Ye;
        U.prototype.getMaxSegmentDuration = U.prototype.Lf;
        U.prototype.getDuration = U.prototype.getDuration;
        function nj(a, b, c) {
          this.l = c;
          this.j = a;
          this.s = oj(a);
          this.g = a.g.currentTime;
          this.m = Date.now() / 1E3;
          this.h = !1;
          this.o = 0;
          this.u = b;
          this.i = function () {};
        }
        nj.prototype.release = function () {
          this.l = this.j = null;
          this.i = function () {};
        };
        function pj(a, b) {
          a.i = b;
        }
        function qj(a) {
          this.g = a;
        }
        function oj(a) {
          if (a.g.paused || 0 == a.g.playbackRate || 0 == a.g.buffered.length) var b = !1;else a: {
            b = a.g.currentTime;
            a = t(xi(a.g.buffered));
            for (var c = a.next(); !c.done; c = a.next()) if (c = c.value, !(b < c.start - .1 || b > c.end - .5)) {
              b = !0;
              break a;
            }
            b = !1;
          }
          return b;
        }
        function rj(a, b, c, d, e) {
          var f = this;
          this.s = e;
          this.g = a;
          this.u = b;
          this.F = c;
          this.l = new lf();
          this.j = !1;
          this.D = a.readyState;
          this.A = this.i = 0;
          this.h = d;
          this.o = !1;
          this.l.C(a, "waiting", function () {
            return sj(f);
          });
          this.m = new P(function () {
            sj(f);
          }).Ca(.25);
        }
        rj.prototype.release = function () {
          this.l && (this.l.release(), this.l = null);
          null != this.m && (this.m.stop(), this.m = null);
          this.h && (this.h.release(), this.h = null);
          this.g = this.u = this.s = null;
        };
        rj.prototype.Yd = function () {
          this.o = !0;
          sj(this);
        };
        function sj(a) {
          if (0 != a.g.readyState) {
            if (a.g.seeking) {
              if (!a.j) return;
            } else a.j = !1;
            if (!a.g.paused || a.g.currentTime == a.i && (a.g.autoplay || a.g.currentTime != a.i)) {
              a.g.readyState != a.D && (a.D = a.g.readyState);
              var b;
              if (!(b = !a.h)) {
                b = a.h;
                var c = b.j,
                  d = oj(c),
                  e = c.g.currentTime,
                  f = Date.now() / 1E3;
                if (b.g != e || b.s != d) b.m = f, b.g = e, b.s = d, b.h = !1;
                e = f - b.m;
                if (d = e >= b.u && d && !b.h) b.i(b.g, e), b.h = !0, b.g = c.g.currentTime, b.o++, b.l(new S("stalldetected"));
                b = !d;
              }
              b && (b = a.g.currentTime, c = a.g.buffered, d = yi(c, b, a.F.gapDetectionThreshold), null == d || 0 == d && !a.o || (e = c.start(d), e >= a.u.Na() || .001 > e - b || (0 != d && c.end(d - 1), a.g.currentTime = e, b == a.i && (a.i = e), a.A++, a.s(new S("gapjumped")))));
            }
          }
        }
        function tj(a, b, c, d) {
          b == HTMLMediaElement.HAVE_NOTHING || a.readyState >= b ? d() : (b = uj.value().get(b), c.ia(a, b, d));
        }
        var uj = new lc(function () {
          return new Map([[HTMLMediaElement.HAVE_METADATA, "loadedmetadata"], [HTMLMediaElement.HAVE_CURRENT_DATA, "loadeddata"], [HTMLMediaElement.HAVE_FUTURE_DATA, "canplay"], [HTMLMediaElement.HAVE_ENOUGH_DATA, "canplaythrough"]]);
        });
        function vj(a, b, c, d) {
          var e = this;
          this.g = a;
          this.l = b;
          this.o = c;
          this.j = d;
          this.m = !1;
          this.h = new lf();
          this.i = new wj(a);
          tj(this.g, HTMLMediaElement.HAVE_METADATA, this.h, function () {
            xj(e, e.j);
          });
        }
        vj.prototype.release = function () {
          this.h && (this.h.release(), this.h = null);
          null != this.i && (this.i.release(), this.i = null);
          this.l = function () {};
          this.g = null;
        };
        function yj(a) {
          return a.m ? a.g.currentTime : a.j;
        }
        function zj(a, b) {
          0 < a.g.readyState ? Aj(a.i, b) : tj(a.g, HTMLMediaElement.HAVE_METADATA, a.h, function () {
            xj(a, a.j);
          });
        }
        function xj(a, b) {
          .001 > Math.abs(a.g.currentTime - b) ? Bj(a) : (a.h.ia(a.g, "seeking", function () {
            Bj(a);
          }), Aj(a.i, a.g.currentTime && 0 != a.g.currentTime ? a.g.currentTime : b));
        }
        function Bj(a) {
          a.m = !0;
          a.h.C(a.g, "seeking", function () {
            return a.l();
          });
          a.o(a.g.currentTime);
        }
        function wj(a) {
          var b = this;
          this.h = a;
          this.m = 10;
          this.l = this.j = this.i = 0;
          this.g = new P(function () {
            0 >= b.i ? b.g.stop() : b.h.currentTime != b.j ? b.g.stop() : (b.h.currentTime = b.l, b.i--);
          });
        }
        wj.prototype.release = function () {
          this.g && (this.g.stop(), this.g = null);
          this.h = null;
        };
        function Aj(a, b) {
          a.j = a.h.currentTime;
          a.l = b;
          a.i = a.m;
          a.h.currentTime = b;
          a.g.Ca(.1);
        }
        function Cj(a) {
          this.g = a;
          this.j = !1;
          this.h = null;
          this.i = new lf();
        }
        r = Cj.prototype;
        r.Bd = function () {
          function a() {
            null == b.h || 0 == b.h ? b.j = !0 : (b.i.ia(b.g, "seeking", function () {
              b.j = !0;
            }), b.g.currentTime = Math.max(0, b.g.currentTime + b.h));
          }
          var b = this;
          tj(this.g, HTMLMediaElement.HAVE_CURRENT_DATA, this.i, function () {
            a();
          });
        };
        r.release = function () {
          this.i && (this.i.release(), this.i = null);
          this.g = null;
        };
        r.Cd = function (a) {
          this.h = this.j ? this.h : a;
        };
        r.Jc = function () {
          return (this.j ? this.g.currentTime : this.h) || 0;
        };
        r.ve = function () {
          return 0;
        };
        r.ue = function () {
          return 0;
        };
        r.Pe = function () {};
        function Dj(a, b, c, d, e, f) {
          var g = this;
          this.i = a;
          this.g = b.presentationTimeline;
          this.A = b.minBufferTime || 0;
          this.l = c;
          this.u = e;
          this.s = null;
          this.o = Ej(a, c, f);
          this.j = new rj(a, b.presentationTimeline, c, this.o, f);
          this.h = new vj(a, function () {
            a: {
              var h = g.j;
              h.j = !0;
              h.o = !1;
              var k = yj(g.h);
              h = Fj(g, k);
              if (.001 < Math.abs(h - k) && (k = Date.now() / 1E3, !g.s || g.s < k - 1)) {
                g.s = k;
                zj(g.h, h);
                h = void 0;
                break a;
              }
              g.u();
              h = void 0;
            }
            return h;
          }, function (h) {
            var k = g.j;
            k.g.seeking && !k.j && (k.j = !0, k.i = h);
          }, Gj(this, d));
          this.m = new P(function () {
            if (0 != g.i.readyState && !g.i.paused) {
              var h = yj(g.h),
                k = g.g.Eb(),
                l = g.g.Na();
              3 > l - k && (k = l - 3);
              h < k && (h = Fj(g, h), g.i.currentTime = h);
            }
          });
        }
        r = Dj.prototype;
        r.Bd = function () {
          this.m.Ca(.25);
        };
        r.release = function () {
          this.h && (this.h.release(), this.h = null);
          this.j && (this.j.release(), this.j = null);
          this.m && (this.m.stop(), this.m = null);
          this.i = this.h = this.g = this.l = null;
          this.u = function () {};
        };
        r.Cd = function (a) {
          zj(this.h, a);
        };
        r.Jc = function () {
          var a = yj(this.h);
          return 0 < this.i.readyState && !this.i.paused ? Hj(this, a) : a;
        };
        r.ve = function () {
          return this.o ? this.o.o : 0;
        };
        r.ue = function () {
          return this.j.A;
        };
        function Gj(a, b) {
          null == b ? b = Infinity > a.g.getDuration() ? a.g.Eb() : a.g.Na() : 0 > b && (b = a.g.Na() + b);
          return Ij(a, Hj(a, b));
        }
        r.Pe = function () {
          this.j.Yd();
        };
        function Ij(a, b) {
          var c = a.g.getDuration();
          return b >= c ? c - a.l.durationBackoff : b;
        }
        function Fj(a, b) {
          var c = Math.max(a.A, a.l.rebufferingGoal),
            d = a.l.safeSeekOffset,
            e = a.g.Eb(),
            f = a.g.Na(),
            g = a.g.getDuration();
          3 > f - e && (e = f - 3);
          var h = a.g.lc(c),
            k = a.g.lc(d);
          c = a.g.lc(c + d);
          return b >= g ? Ij(a, b) : b > f ? f : b < e ? vi(a.i.buffered, k) ? k : c : b >= h || vi(a.i.buffered, b) ? b : c;
        }
        function Hj(a, b) {
          var c = a.g.Eb();
          if (b < c) return c;
          a = a.g.Na();
          return b > a ? a : b;
        }
        function Ej(a, b, c) {
          if (!b.stallEnabled) return null;
          var d = b.stallSkip;
          b = new nj(new qj(a), b.stallThreshold, c);
          pj(b, function () {
            d ? a.currentTime += d : (a.pause(), a.play());
          });
          return b;
        }
        function Jj(a) {
          this.g = a;
          this.h = null;
          this.i = 0;
          this.j = !1;
        }
        r = Jj.prototype;
        r.release = function () {
          this.j || (this.g = [], this.h && this.h.stop(), this.h = null);
        };
        r.eg = function () {
          this.j = !0;
        };
        function Kj(a, b) {
          a = t(a.g);
          for (var c = a.next(); !c.done; c = a.next()) b(c.value);
        }
        r.find = function (a) {
          for (var b = this.g.length - 1, c = b; 0 <= c; --c) {
            var d = this.g[c],
              e = c < b ? this.g[c + 1].startTime : d.endTime;
            if (a >= d.startTime && a < e) return c + this.i;
          }
          return this.g.length && a < this.g[0].startTime ? this.i : null;
        };
        r.get = function (a) {
          if (0 == this.g.length) return null;
          a -= this.i;
          return 0 > a || a >= this.g.length ? null : this.g[a];
        };
        r.offset = function (a) {
          if (!this.j) for (var b = t(this.g), c = b.next(); !c.done; c = b.next()) c.value.offset(a);
        };
        r.qc = function (a) {
          if (!this.j && a.length) {
            var b = Math.round(1E3 * a[0].startTime) / 1E3;
            this.g = this.g.filter(function (c) {
              return Math.round(1E3 * c.startTime) / 1E3 < b;
            });
            this.g.push.apply(this.g, ia(a));
          }
        };
        r.Ib = function (a, b) {
          var c = this;
          a = a.filter(function (d) {
            return d.endTime > b && (0 == c.g.length || d.endTime > c.g[0].startTime);
          });
          this.qc(a);
          this.eb(b);
        };
        r.eb = function (a) {
          if (!this.j) {
            var b = this.g.length;
            this.g = this.g.filter(function (c) {
              return c.endTime > a;
            });
            this.i += b - this.g.length;
          }
        };
        r.Xa = function (a, b, c) {
          c = void 0 === c ? !1 : c;
          if (!this.j) {
            for (; this.g.length;) if (this.g[this.g.length - 1].startTime >= b) this.g.pop();else break;
            for (; this.g.length;) if (this.g[0].endTime <= a) this.g.shift(), c || this.i++;else break;
            0 != this.g.length && (a = this.g[this.g.length - 1], this.g[this.g.length - 1] = new T(a.startTime, b, a.A, a.Ba, a.ma, a.h, a.timestampOffset, a.appendWindowStart, a.appendWindowEnd, a.i, a.tilesLayout, a.s, a.g, a.status, a.m), this.g[this.g.length - 1].j = a.j);
          }
        };
        r.hd = function (a, b) {
          var c = this;
          this.j || (this.h && this.h.stop(), this.h = new P(function () {
            var d = b();
            d ? c.g.push.apply(c.g, ia(d)) : (c.h.stop(), c.h = null);
          }), this.h.Ca(a));
        };
        Jj.prototype[Symbol.iterator] = function () {
          return this.Db(0);
        };
        Jj.prototype.Db = function (a) {
          var b = this.find(a);
          if (null == b) return null;
          b--;
          var c = this.get(b + 1),
            d = -1;
          if (c && 0 < c.i.length) for (var e = c.i.length - 1; 0 <= e; --e) {
            var f = c.i[e];
            if (a >= f.startTime && a < f.endTime) {
              b++;
              d = e - 1;
              break;
            }
          }
          return new Lj(this, b, d);
        };
        function Mj(a, b, c) {
          return new Jj([new T(a, a + b, function () {
            return c;
          }, 0, null, null, a, a, a + b)]);
        }
        K("shaka.media.SegmentIndex", Jj);
        Jj.forSingleSegment = Mj;
        Jj.prototype.getIteratorForTime = Jj.prototype.Db;
        Jj.prototype.updateEvery = Jj.prototype.hd;
        Jj.prototype.fit = Jj.prototype.Xa;
        Jj.prototype.evict = Jj.prototype.eb;
        Jj.prototype.mergeAndEvict = Jj.prototype.Ib;
        Jj.prototype.offset = Jj.prototype.offset;
        Jj.prototype.get = Jj.prototype.get;
        Jj.prototype.find = Jj.prototype.find;
        Jj.prototype.markImmutable = Jj.prototype.eg;
        Jj.prototype.release = Jj.prototype.release;
        function Lj(a, b, c) {
          this.i = a;
          this.g = b;
          this.h = c;
        }
        Lj.prototype.wf = function () {
          return this.g;
        };
        Lj.prototype.current = function () {
          var a = this.i.get(this.g);
          a && 0 < a.i.length && a.ya().length && this.h >= a.i.length && (this.g++, this.h = 0, a = this.i.get(this.g));
          return a && 0 < a.i.length ? a.i[this.h] : a;
        };
        Lj.prototype.next = function () {
          var a = this.i.get(this.g);
          a && 0 < a.i.length ? (this.h++, a.ya().length && this.h == a.i.length && (this.g++, this.h = 0)) : (this.g++, this.h = 0);
          a = this.current();
          return {
            value: a,
            done: !a
          };
        };
        K("shaka.media.SegmentIterator", Lj);
        Lj.prototype.next = Lj.prototype.next;
        Lj.prototype.current = Lj.prototype.current;
        Lj.prototype.currentPosition = Lj.prototype.wf;
        function Nj() {
          Jj.call(this, []);
          this.l = [];
        }
        qa(Nj, Jj);
        r = Nj.prototype;
        r.clone = function () {
          var a = new Nj();
          a.l = this.l.slice();
          return a;
        };
        r.release = function () {
          for (var a = t(this.l), b = a.next(); !b.done; b = a.next()) b.value.release();
          this.l = [];
        };
        r.find = function (a) {
          for (var b = 0, c = t(this.l), d = c.next(); !d.done; d = c.next()) {
            d = d.value;
            var e = d.find(a);
            if (null != e) return e + b;
            b += d.i + d.g.length;
          }
          return null;
        };
        r.get = function (a) {
          for (var b = 0, c = t(this.l), d = c.next(); !d.done; d = c.next()) {
            d = d.value;
            var e = d.get(a - b);
            if (e) return e;
            b += d.i + d.g.length;
          }
          return null;
        };
        r.offset = function () {};
        r.qc = function () {};
        r.eb = function () {};
        r.Ib = function () {};
        r.Xa = function () {};
        r.hd = function () {};
        K("shaka.media.MetaSegmentIndex", Nj);
        Nj.prototype.updateEvery = Nj.prototype.hd;
        Nj.prototype.fit = Nj.prototype.Xa;
        Nj.prototype.mergeAndEvict = Nj.prototype.Ib;
        Nj.prototype.evict = Nj.prototype.eb;
        Nj.prototype.merge = Nj.prototype.qc;
        Nj.prototype.offset = Nj.prototype.offset;
        Nj.prototype.get = Nj.prototype.get;
        Nj.prototype.find = Nj.prototype.find;
        Nj.prototype.release = Nj.prototype.release;
        function Oj(a) {
          var b = this;
          this.g = a;
          this.j = !1;
          this.i = this.g.Uc();
          this.h = new P(function () {
            b.g.Oe(.25 * b.i);
          });
        }
        Oj.prototype.release = function () {
          this.h && (this.h.stop(), this.h = null);
          this.g = null;
        };
        Oj.prototype.set = function (a) {
          this.i = a;
          Pj(this);
        };
        Oj.prototype.Qc = function () {
          return this.g.Qc();
        };
        function Pj(a) {
          a.h.stop();
          var b = a.j ? 0 : a.i;
          if (0 <= b) try {
            a.g.Uc() != b && a.g.ne(b);
            return;
          } catch (c) {}
          a.h.Ca(.25);
          0 != a.g.Uc() && a.g.ne(0);
        }
        function Qj(a) {
          var b = this;
          this.h = a;
          this.g = new Set();
          this.i = new P(function () {
            Rj(b, !1);
          }).Ca(.25);
        }
        Qj.prototype.release = function () {
          this.i.stop();
          for (var a = t(this.g), b = a.next(); !b.done; b = a.next()) b.value.release();
          this.g.clear();
        };
        function Rj(a, b) {
          for (var c = t(a.g), d = c.next(); !d.done; d = c.next()) d.value.j(a.h.currentTime, b);
        }
        function Sj(a) {
          Te.call(this);
          this.g = new Map();
          this.h = a;
        }
        qa(Sj, Te);
        Sj.prototype.release = function () {
          this.g.clear();
          Te.prototype.release.call(this);
        };
        function Tj(a, b) {
          var c = a.g.get(b);
          c || (c = {
            sc: [],
            Be: null,
            contentType: b
          }, a.g.set(b, c));
          return c;
        }
        function Uj(a, b, c) {
          var d = Tj(a, b.contentType);
          Vj(a, d);
          a = {
            Qd: b,
            position: c
          };
          d = d.sc;
          b = d.findIndex(function (e) {
            return e.position >= c;
          });
          0 <= b ? d.splice(b, d[b].position == c ? 1 : 0, a) : d.push(a);
        }
        Sj.prototype.j = function (a) {
          for (var b = t(this.g.values()), c = b.next(); !c.done; c = b.next()) {
            c = c.value;
            a: {
              var d = c.sc;
              for (var e = d.length - 1; 0 <= e; e--) {
                var f = d[e];
                if (f.position <= a) {
                  d = f.Qd;
                  break a;
                }
              }
              d = null;
            }
            if (e = d) e = c.Be, e = !(e === d || e && d && e.bandwidth == d.bandwidth && e.audioSamplingRate == d.audioSamplingRate && e.codecs == d.codecs && e.contentType == d.contentType && e.frameRate == d.frameRate && e.height == d.height && e.mimeType == d.mimeType && e.channelsCount == d.channelsCount && e.pixelAspectRatio == d.pixelAspectRatio && e.width == d.width);
            if (e) a: {
              e = a;
              f = d.contentType;
              if ((f = this.h()[f]) && 0 < f.length) {
                var g = f[f.length - 1].end;
                if (e >= f[0].start && e < g) {
                  e = !0;
                  break a;
                }
              }
              e = !1;
            }
            e && (c.Be = d, JSON.stringify(d), c = new S("qualitychange", new Map([["quality", d], ["position", a]])), this.dispatchEvent(c));
          }
        };
        function Vj(a, b) {
          if ((a = a.h()[b.contentType]) && 0 < a.length) {
            var c = a[0].start,
              d = a[a.length - 1].end,
              e = b.sc;
            b.sc = e.filter(function (f, g) {
              return f.position <= c && g + 1 < e.length && e[g + 1].position <= c || f.position >= d ? !1 : !0;
            });
          } else b.sc = [];
        }
        function Wj(a) {
          Te.call(this);
          var b = this;
          this.g = new Set();
          this.i = a;
          this.h = new P(function () {
            for (var c = b.i(), d = t(b.g), e = d.next(); !e.done; e = d.next()) e = e.value, e.endTime < c.start && (b.g.delete(e), e = new S("regionremove", new Map([["region", e]])), b.dispatchEvent(e));
          }).Ca(2);
        }
        qa(Wj, Te);
        Wj.prototype.release = function () {
          this.g.clear();
          this.h.stop();
          Te.prototype.release.call(this);
        };
        function Xj(a, b) {
          Te.call(this);
          var c = this;
          this.i = a;
          this.l = b;
          this.g = new Map();
          this.m = [{
            sb: null,
            rb: Yj,
            ib: function (d, e) {
              return Zj(c, "enter", d, e);
            }
          }, {
            sb: ak,
            rb: Yj,
            ib: function (d, e) {
              return Zj(c, "enter", d, e);
            }
          }, {
            sb: bk,
            rb: Yj,
            ib: function (d, e) {
              return Zj(c, "enter", d, e);
            }
          }, {
            sb: Yj,
            rb: ak,
            ib: function (d, e) {
              return Zj(c, "exit", d, e);
            }
          }, {
            sb: Yj,
            rb: bk,
            ib: function (d, e) {
              return Zj(c, "exit", d, e);
            }
          }, {
            sb: ak,
            rb: bk,
            ib: function (d, e) {
              return Zj(c, "skip", d, e);
            }
          }, {
            sb: bk,
            rb: ak,
            ib: function (d, e) {
              return Zj(c, "skip", d, e);
            }
          }];
          this.h = new lf();
          this.h.C(this.i, "regionremove", function (d) {
            c.g.delete(d.region);
          });
        }
        qa(Xj, Te);
        Xj.prototype.release = function () {
          this.i = null;
          this.g.clear();
          this.h.release();
          this.h = null;
          Te.prototype.release.call(this);
        };
        Xj.prototype.j = function (a, b) {
          if (!this.l || 0 != a) {
            this.l = !1;
            for (var c = t(this.i.g), d = c.next(); !d.done; d = c.next()) {
              d = d.value;
              var e = this.g.get(d),
                f = a < d.startTime ? ak : a > d.endTime ? bk : Yj;
              this.g.set(d, f);
              for (var g = t(this.m), h = g.next(); !h.done; h = g.next()) h = h.value, h.sb == e && h.rb == f && h.ib(d, b);
            }
          }
        };
        function Zj(a, b, c, d) {
          b = new S(b, new Map([["region", c], ["seeking", d]]));
          a.dispatchEvent(b);
        }
        var ak = 1,
          Yj = 2,
          bk = 3;
        function ck(a, b, c, d, e) {
          a = bf(a, d, e);
          if (0 != b || null != c) a.headers.Range = c ? "bytes=" + b + "-" + c : "bytes=" + b + "-";
          return a;
        }
        function dk(a, b) {
          var c = this;
          this.g = b;
          this.m = a;
          this.i = null;
          this.u = 1;
          this.o = this.l = null;
          this.F = 0;
          this.D = !1;
          this.j = new Map();
          this.A = !1;
          this.G = null;
          this.s = !1;
          this.h = new jf(function () {
            return ek(c);
          });
        }
        r = dk.prototype;
        r.destroy = function () {
          return this.h.destroy();
        };
        function ek(a) {
          var b, c, d, e;
          return G(function (f) {
            if (1 == f.g) {
              b = [];
              c = t(a.j.values());
              for (d = c.next(); !d.done; d = c.next()) e = d.value, fk(e), b.push(gk(e));
              return u(f, Promise.all(b), 2);
            }
            a.j.clear();
            a.g = null;
            a.m = null;
            a.i = null;
            A(f);
          });
        }
        r.configure = function (a) {
          this.i = a;
          this.G = new He({
            maxAttempts: Math.max(a.retryParameters.maxAttempts, 2),
            baseDelay: a.retryParameters.baseDelay,
            backoffFactor: a.retryParameters.backoffFactor,
            fuzzFactor: a.retryParameters.fuzzFactor,
            timeout: 0,
            stallTimeout: 0,
            connectionTimeout: 0
          }, !0);
        };
        r.start = function () {
          var a = this;
          return G(function (b) {
            if (1 == b.g) return u(b, hk(a), 2);
            kf(a.h);
            a.A = !0;
            A(b);
          });
        };
        function ik(a, b) {
          var c, d, e, f, g, k;
          G(function (l) {
            switch (l.g) {
              case 1:
                return c = jc, a.F++, d = a.F, C(l, 2), u(l, hj(a.g.N, c.X), 4);
              case 4:
                va(l, 3);
                break;
              case 2:
                if (e = wa(l), a.g) a.g.onError(e);
              case 3:
                f = Yc(b.mimeType, b.codecs), Qi(a.g.N, f, a.m.sequenceMode, b.external), g = a.g.N.m, (g.isTextVisible() || a.i.alwaysStreamText) && a.F == d && (k = jk(b), a.j.set(c.X, k), kk(a, k, 0)), A(l);
            }
          });
        }
        function lk(a) {
          var b = a.j.get(ic);
          b && (fk(b), gk(b).catch(function () {}), a.j.delete(ic));
          a.o = null;
        }
        function mk(a, b) {
          var c = a.j.get("video");
          if (c) {
            var d = c.stream;
            if (d) if (b) (b = d.trickModeVideo) && !c.pb && (nk(a, b, !1, 0, !1), c.pb = d);else if (d = c.pb) c.pb = null, nk(a, d, !0, 0, !1);
          }
        }
        function ok(a, b, c, d, e, f) {
          c = void 0 === c ? !1 : c;
          d = void 0 === d ? 0 : d;
          e = void 0 === e ? !1 : e;
          f = void 0 === f ? !1 : f;
          a.l = b;
          a.A && (b.video && nk(a, b.video, c, d, e, f), b.audio && nk(a, b.audio, c, d, e, f));
        }
        function pk(a, b) {
          G(function (c) {
            if (1 == c.g) return a.o = b, a.A ? b.segmentIndex ? c.B(2) : u(c, b.createSegmentIndex(), 2) : c.return();
            nk(a, b, !0, 0, !1);
            A(c);
          });
        }
        function nk(a, b, c, d, e, f) {
          var g = a.j.get(b.type);
          g || b.type != ic ? g && (g.pb && (b.trickModeVideo ? (g.pb = b, b = b.trickModeVideo) : g.pb = null), g.stream != b || e) && (b.type == ic && Qi(a.g.N, Yc(b.mimeType, b.codecs), a.m.sequenceMode, b.external), g.stream.closeSegmentIndex && g.stream.closeSegmentIndex(), g.stream = b, g.Y = null, g.we = !!f, c && (g.bc ? g.kd = !0 : g.sa ? (g.bb = !0, g.Oc = d, g.kd = !0) : (fk(g), qk(a, g, !0, d).catch(function (h) {
            if (a.g) a.g.onError(h);
          }))), rk(a, g).catch(function (h) {
            if (a.g) a.g.onError(h);
          })) : ik(a, b);
        }
        function rk(a, b) {
          var c, d;
          return G(function (e) {
            if (1 == e.g) {
              if (!b.ua) return e.return();
              c = b.stream;
              d = b.ua;
              return c.segmentIndex ? e.B(2) : u(e, c.createSegmentIndex(), 2);
            }
            if (b.ua != d || b.stream != c) return e.return();
            var f = a.g.Tc();
            var g = Vi(a.g.N, b.type),
              h = b.stream.segmentIndex.find(b.qa ? b.qa.endTime : f),
              k = null == h ? null : b.stream.segmentIndex.get(h);
            h = k ? k.ma ? k.ma - k.Ba : null : null;
            k && !h && (h = (k.endTime - k.getStartTime()) * (b.stream.bandwidth || 0) / 8);
            h ? ((k = k.h) && (h += (k.ma ? k.ma - k.Ba : null) || 0), k = a.g.getBandwidthEstimate(), f = 8 * h / k < (g || 0) - f - Math.max(a.m.minBufferTime || 0, a.i.rebufferingGoal) || b.ua.h.g > h ? !0 : !1) : f = !1;
            f && b.ua.abort();
            A(e);
          });
        }
        r.wc = function () {
          if (this.g) for (var a = this.g.Tc(), b = t(this.j.keys()), c = b.next(); !c.done; c = b.next()) {
            var d = c.value;
            c = this.j.get(d);
            var e = null;
            c.Y && (e = c.Y.current());
            if (!e || e.startTime > a || e.endTime < a) c.Y = null;
            e = this.g.N;
            d == ic ? (e = e.g, e = null == e.g || null == e.h ? !1 : a >= e.g && a < e.h) : (e = Ui(e, d), e = vi(e, a));
            if (!e) {
              (null != Vi(this.g.N, d) || c.sa) && sk(this, c);
              c.ua && (c.ua.abort(), c.ua = null);
              if (d === ic && (d = this.g.N, d.s)) for (d = d.s.g, d.l = 0, d.h = [], d.g = [], e = d.i, e.i = [], e.h = [], e.g = 0, Xh(d), d = t(d.j.values()), e = d.next(); !e.done; e = d.next()) Sh(e.value);
              c.wc = !0;
            }
          }
        };
        function sk(a, b) {
          b.bc || b.bb || (b.sa ? (b.bb = !0, b.Oc = 0) : null == Ti(a.g.N, b.type) ? null == b.Ka && kk(a, b, 0) : (fk(b), qk(a, b, !1, 0).catch(function (c) {
            if (a.g) a.g.onError(c);
          })));
        }
        function hk(a) {
          var b, c, d, e, f, g, h, k, l, m;
          return G(function (p) {
            if (1 == p.g) {
              b = jc;
              if (!a.l) throw new O(2, 5, 5006);
              c = new Map();
              d = new Set();
              a.l.audio && (c.set(b.Ic, a.l.audio), d.add(a.l.audio));
              a.l.video && (c.set(b.va, a.l.video), d.add(a.l.video));
              a.o && (c.set(b.X, a.o), d.add(a.o));
              e = a.g.N;
              f = a.i.forceTransmux;
              return u(p, e.init(c, f, a.m.sequenceMode), 2);
            }
            kf(a.h);
            a.updateDuration();
            g = t(c.keys());
            for (h = g.next(); !h.done; h = g.next()) k = h.value, l = c.get(k), a.j.has(k) || (m = jk(l), a.j.set(k, m), kk(a, m, 0));
            A(p);
          });
        }
        function jk(a) {
          return {
            stream: a,
            type: a.type,
            Y: null,
            qa: null,
            $c: null,
            Md: null,
            Ld: null,
            Kd: null,
            pb: null,
            endOfStream: !1,
            sa: !1,
            Ka: null,
            bb: !1,
            Oc: 0,
            kd: !1,
            bc: !1,
            wc: !0,
            Td: !1,
            de: !1,
            oc: !1,
            ua: null
          };
        }
        r.updateDuration = function () {
          var a = this.m.presentationTimeline.getDuration();
          Infinity > a ? this.g.N.Aa(a) : this.g.N.Aa(Math.pow(2, 32));
        };
        function tk(a, b) {
          var c, d, e, f, g;
          return G(function (h) {
            switch (h.g) {
              case 1:
                kf(a.h);
                if (b.sa || null == b.Ka || b.bc) return h.return();
                b.Ka = null;
                if (!b.bb) {
                  h.B(2);
                  break;
                }
                return u(h, qk(a, b, b.kd, b.Oc), 3);
              case 3:
                return h.return();
              case 2:
                if (b.stream.segmentIndex) {
                  h.B(4);
                  break;
                }
                c = b.stream;
                return u(h, b.stream.createSegmentIndex(), 5);
              case 5:
                if (c != b.stream) return c.closeSegmentIndex && c.closeSegmentIndex(), b.sa || b.Ka || kk(a, b, 0), h.return();
              case 4:
                C(h, 6);
                d = uk(a, b);
                null != d && (kk(a, b, d), b.oc = !1);
                va(h, 7);
                break;
              case 6:
                return e = wa(h), u(h, vk(a, e), 8);
              case 8:
                return h.return();
              case 7:
                f = Array.from(a.j.values());
                if (!a.A || !f.every(function (k) {
                  return k.endOfStream;
                })) {
                  h.B(0);
                  break;
                }
                return u(h, a.g.N.endOfStream(), 10);
              case 10:
                kf(a.h), g = a.g.N.getDuration(), 0 != g && g < a.m.presentationTimeline.getDuration() && a.m.presentationTimeline.Aa(g), A(h);
            }
          });
        }
        function uk(a, b) {
          if (wk(b)) return fj(a.g.N, b.stream.originalId || ""), null;
          b.type == ic && gj(a.g.N);
          var c = a.g.Tc(),
            d = b.qa ? b.qa.endTime : c,
            e = Wi(a.g.N, b.type, c),
            f = Math.max(a.m.minBufferTime || 0, a.i.rebufferingGoal, a.i.bufferingGoal) * a.u,
            g = a.m.presentationTimeline.getDuration() - d,
            h = Vi(a.g.N, b.type);
          if (1E-6 > g && h) return b.endOfStream = !0, "video" == b.type && (a = a.j.get(ic)) && wk(a) && (a.endOfStream = !0), null;
          b.endOfStream = !1;
          if (e >= f) return a.i.updateIntervalSeconds / 2;
          e = xk(a, b, c, h);
          if (!e) return a.i.updateIntervalSeconds;
          f = Infinity;
          g = Array.from(a.j.values());
          g = t(g);
          for (h = g.next(); !h.done; h = g.next()) h = h.value, wk(h) || h.Y && !h.Y.current() || (f = Math.min(f, h.qa ? h.qa.endTime : c));
          if (d >= f + a.m.presentationTimeline.g) return a.i.updateIntervalSeconds;
          yk(a, b, c, e).catch(function () {});
          return null;
        }
        function xk(a, b, c, d) {
          if (b.Y) return b.Y.current();
          if (b.qa || d) return c = b.qa ? b.qa.endTime : d, b.Td = !0, b.Y = b.stream.segmentIndex.Db(c), b.Y && b.Y.next().value;
          a = a.i.inaccurateManifestTolerance;
          d = Math.max(c - a, 0);
          var e = null;
          a && (b.Y = b.stream.segmentIndex.Db(d), e = b.Y && b.Y.next().value);
          e || (b.Y = b.stream.segmentIndex.Db(c), e = b.Y && b.Y.next().value);
          return e;
        }
        function yk(a, b, c, d) {
          var e, f, g, h, k, l, m, p, n, q, v, y, w, x, D;
          return G(function (z) {
            switch (z.g) {
              case 1:
                e = jc;
                f = b.stream;
                g = b.Y;
                b.sa = !0;
                C(z, 2);
                if (2 == d.Fb()) throw new O(1, 1, 1011);
                return u(z, zk(a, b, d), 4);
              case 4:
                kf(a.h);
                if (a.s) return z.return();
                h = "video/mp4" == f.mimeType || "audio/mp4" == f.mimeType;
                k = window.ReadableStream;
                if (a.i.lowLatencyMode && k && h && !d.m) return p = new Uint8Array(0), q = n = !1, v = function (B) {
                  var E, F, H;
                  return G(function (I) {
                    if (n) return I.return();
                    q = !0;
                    kf(a.h);
                    if (a.s) return I.return();
                    p = Ak(p, B);
                    E = !1;
                    F = 0;
                    new yf().box("mdat", function (J) {
                      F = J.size + J.start;
                      E = !0;
                    }).parse(p, !1, !0);
                    if (!E) return I.B(0);
                    H = p.subarray(0, F);
                    p = p.subarray(F);
                    return u(I, Bk(a, b, c, f, d, H), 0);
                  });
                }, u(z, Ck(a, b, d, v), 11);
                l = Ck(a, b, d);
                return u(z, l, 7);
              case 7:
                m = z.h;
                kf(a.h);
                if (a.s) return z.return();
                if (!d.m) {
                  z.B(8);
                  break;
                }
                return u(z, Dk(m, d, g), 9);
              case 9:
                m = z.h;
              case 8:
                return kf(a.h), b.bb ? (b.sa = !1, kk(a, b, 0), z.return()) : u(z, Bk(a, b, c, f, d, m), 6);
              case 11:
                y = z.h;
                if (q) {
                  z.B(6);
                  break;
                }
                n = !0;
                kf(a.h);
                return a.s ? z.return() : b.bb ? (b.sa = !1, kk(a, b, 0), z.return()) : u(z, Bk(a, b, c, f, d, y), 6);
              case 6:
                kf(a.h);
                if (a.s) return z.return();
                b.qa = d;
                g.next();
                b.sa = !1;
                b.de = !1;
                w = a.g.N.Ma();
                x = w[b.type];
                bb(JSON.stringify(x));
                b.bb || a.g.Yd(d.startTime, d.endTime, b.type);
                kk(a, b, 0);
                va(z, 0);
                break;
              case 2:
                D = wa(z);
                kf(a.h, D);
                if (a.s) return z.return();
                b.sa = !1;
                if (7001 == D.code) b.sa = !1, fk(b), kk(a, b, 0), z.B(0);else if (b.type == e.X && a.i.ignoreTextStreamFailures) a.j.delete(e.X), z.B(0);else if (3017 == D.code) Ek(a, b, D), z.B(0);else return b.oc = !0, D.severity = 2, u(z, vk(a, D), 0);
            }
          });
        }
        function Dk(a, b, c) {
          var d, e, f, g;
          return G(function (h) {
            if (1 == h.g) return d = b.m, d.cryptoKey ? h.B(2) : u(h, d.fetchKey(), 3);
            e = d.iv;
            if (!e) for (e = L(new ArrayBuffer(16)), f = d.firstMediaSequenceNumber + c.g, g = e.byteLength - 1; 0 <= g; g--) e[g] = f & 255, f >>= 8;
            return h.return(window.crypto.subtle.decrypt({
              name: "AES-CBC",
              iv: e
            }, d.cryptoKey, a));
          });
        }
        function Ak(a, b) {
          var c = new Uint8Array(a.length + b.length);
          c.set(a);
          c.set(b, a.length);
          return c;
        }
        function Ek(a, b, c) {
          if (!Array.from(a.j.values()).some(function (e) {
            return e != b && e.de;
          })) {
            var d = Math.round(100 * a.u);
            if (20 < d) a.u -= .2;else if (4 < d) a.u -= .04;else {
              b.oc = !0;
              a.s = !0;
              a.g.onError(c);
              return;
            }
            b.de = !0;
          }
          kk(a, b, 4);
        }
        function zk(a, b, c) {
          var d, e, f, g, h, k, l, m;
          return G(function (p) {
            d = [];
            e = Math.max(0, c.appendWindowStart - .1);
            f = c.appendWindowEnd + .01;
            g = c.timestampOffset;
            if (g != b.Md || e != b.Ld || f != b.Kd) h = function () {
              var n;
              return G(function (q) {
                if (1 == q.g) return C(q, 2), b.Ld = e, b.Kd = f, b.Md = g, u(q, ij(a.g.N, b.type, g, e, f, a.m.sequenceMode), 4);
                if (2 != q.g) return va(q, 0);
                n = wa(q);
                b.Ld = null;
                b.Kd = null;
                b.Md = null;
                throw n;
              });
            }, d.push(h());
            !qi(c.h, b.$c) && (b.$c = c.h) && (k = Ck(a, b, c.h), l = function () {
              var n, q, v, y;
              return G(function (w) {
                switch (w.g) {
                  case 1:
                    return C(w, 2), u(w, k, 4);
                  case 4:
                    return n = w.h, kf(a.h), q = new yf(), q.box("moov", Df).box("trak", Df).box("mdia", Df).R("mdhd", function (x) {
                      x = fi(x.reader || 0, x.version || 0);
                      c.h.timescale = x.timescale;
                    }).parse(n), v = b.stream.closedCaptions && 0 < b.stream.closedCaptions.size, u(w, a.g.ye(b.type, n), 5);
                  case 5:
                    return u(w, Xi(a.g.N, b.type, n, null, v), 6);
                  case 6:
                    va(w, 0);
                    break;
                  case 2:
                    throw y = wa(w), b.$c = null, y;
                }
              });
            }, a.g.hg(c.startTime, c.h), d.push(l()));
            m = b.qa ? b.qa.j : null;
            if (a.m.sequenceMode) {
              if (c.j != m || b.Td) b.Td = !1, d.push(jj(a.g.N, b.type, c.startTime));
            } else c.j != m && d.push(jj(a.g.N, b.type, c.timestampOffset));
            return u(p, Promise.all(d), 0);
          });
        }
        function Bk(a, b, c, d, e, f) {
          var g, h, k, l, m, p;
          return G(function (n) {
            switch (n.g) {
              case 1:
                g = d.closedCaptions && 0 < d.closedCaptions.size;
                k = null != d.emsgSchemeIdUris && 0 < d.emsgSchemeIdUris.length || a.i.dispatchAllEmsgBoxes;
                l = a.i.parsePrftBox && !a.D;
                if (k || l) h = new yf();
                k && h.R("emsg", function (q) {
                  var v = d.emsgSchemeIdUris;
                  if (0 === q.version) {
                    var y = q.reader.tc();
                    var w = q.reader.tc();
                    var x = q.reader.K();
                    var D = q.reader.K();
                    var z = q.reader.K();
                    var B = q.reader.K();
                    var E = e.startTime + D / x;
                  } else x = q.reader.K(), E = q.reader.$a() / x + e.timestampOffset, D = E - e.startTime, z = q.reader.K(), B = q.reader.K(), y = q.reader.tc(), w = q.reader.tc();
                  q = q.reader.Za(q.reader.S.byteLength - q.reader.$());
                  if (v && v.includes(y) || a.i.dispatchAllEmsgBoxes) "urn:mpeg:dash:event:2012" == y ? a.g.ig() : (v = new Map().set("detail", {
                    startTime: E,
                    endTime: E + z / x,
                    schemeIdUri: y,
                    value: w,
                    timescale: x,
                    presentationTimeDelta: D,
                    eventDuration: z,
                    id: B,
                    messageData: q
                  }), v = new S("emsg", v), v.cancelable = !0, a.g.onEvent(v), v.defaultPrevented || "https://aomedia.org/emsg/ID3" != y && "https://developer.apple.com/streaming/emsg-id3" != y || (y = Ci(q), y.length && e && a.g.jg([{
                    cueTime: e.startTime,
                    data: q,
                    frames: y,
                    dts: e.startTime,
                    pts: e.startTime
                  }], 0, e.endTime)));
                });
                l && h.R("prft", function (q) {
                  a: {
                    if (!a.D && e.h.timescale) {
                      q.reader.K();
                      var v = q.reader.K(),
                        y = q.reader.K();
                      v = 1E3 * v + y / Math.pow(2, 32) * 1E3;
                      if (0 === q.version) var w = q.reader.K();else try {
                        w = q.reader.$a();
                      } catch (x) {
                        a.D = !0;
                        w = void 0;
                        break a;
                      }
                      q = new Date(new Date(Date.UTC(1900, 0, 1, 0, 0, 0)).getTime() + v).getTime();
                      w = new Map().set("detail", {
                        wallClockTime: q,
                        programStartDate: new Date(q - w / e.h.timescale * 1E3)
                      });
                      w = new S("prft", w);
                      a.g.onEvent(w);
                      a.D = !0;
                    }
                    w = void 0;
                  }
                  return w;
                });
                (k || l) && h.parse(f);
                return u(n, Fk(a, b, c), 2);
              case 2:
                return kf(a.h), m = b.wc, b.wc = !1, p = b.we, b.we = !1, u(n, a.g.ye(b.type, f), 3);
              case 3:
                return u(n, Xi(a.g.N, b.type, f, e, g, m, p), 4);
              case 4:
                kf(a.h), A(n);
            }
          });
        }
        function Fk(a, b, c) {
          var d, e, f, g;
          return G(function (h) {
            if (1 == h.g) {
              d = Math.max(a.i.bufferBehind, a.m.presentationTimeline.g);
              e = Ti(a.g.N, b.type);
              if (null == e) return h.return();
              f = c - e;
              g = f - d;
              return .01 >= g ? h.return() : u(h, a.g.N.remove(b.type, e, e + g), 2);
            }
            kf(a.h);
            A(h);
          });
        }
        function wk(a) {
          return a && a.type == ic && ("application/cea-608" == a.stream.mimeType || "application/cea-708" == a.stream.mimeType);
        }
        function Ck(a, b, c, d) {
          var e, f, g, h, k;
          return G(function (l) {
            if (1 == l.g) return e = hf, f = ck(c.ya(), c.Ba, c.ma, a.i.retryParameters, d), g = b.stream, a.g.modifySegmentRequest(f, {
              type: g.type,
              init: c instanceof pi,
              duration: c.endTime - c.startTime,
              mimeType: g.mimeType,
              codecs: g.codecs,
              bandwidth: g.bandwidth
            }), h = a.g.lb.request(e, f), b.ua = h, u(l, h.promise, 2);
            k = l.h;
            b.ua = null;
            return l.return(k.data);
          });
        }
        function qk(a, b, c, d) {
          var e, f;
          return G(function (g) {
            if (1 == g.g) return b.bb = !1, b.kd = !1, b.Oc = 0, b.bc = !0, b.qa = null, b.$c = null, b.Y = null, d ? (e = a.g.Tc(), f = a.g.N.getDuration(), u(g, a.g.N.remove(b.type, e + d, f), 3)) : u(g, hj(a.g.N, b.type), 4);
            if (3 != g.g) return kf(a.h), c ? u(g, a.g.N.flush(b.type), 3) : g.B(3);
            kf(a.h);
            b.bc = !1;
            b.endOfStream = !1;
            b.sa || b.Ka || kk(a, b, 0);
            A(g);
          });
        }
        function kk(a, b, c) {
          var d = b.type;
          if (d != ic || a.j.has(d)) b.Ka = new mc(function () {
            var e;
            return G(function (f) {
              if (1 == f.g) return C(f, 2), u(f, tk(a, b), 4);
              if (2 != f.g) return va(f, 0);
              e = wa(f);
              if (a.g) a.g.onError(e);
              A(f);
            });
          }).O(c);
        }
        function fk(a) {
          null != a.Ka && (a.Ka.stop(), a.Ka = null);
        }
        function gk(a) {
          return G(function (b) {
            return a.ua ? u(b, a.ua.abort(), 0) : b.B(0);
          });
        }
        function vk(a, b) {
          return G(function (c) {
            if (1 == c.g) return u(c, Je(a.G), 2);
            kf(a.h);
            a.g.onError(b);
            b.handled || a.i.failureCallback(b);
            A(c);
          });
        }
        function Gk(a, b) {
          var c = Hk(),
            d = this;
          this.j = b;
          this.i = a;
          this.l = c;
          this.o = null;
          this.m = [];
          this.h = this.g = null;
          this.u = Promise.resolve().then(function () {
            return Ik(d);
          });
          this.s = new jf(function () {
            return Jk(d);
          });
        }
        Gk.prototype.destroy = function () {
          return this.s.destroy();
        };
        function Jk(a) {
          var b, c, d;
          return G(function (e) {
            if (1 == e.g) return a.h && a.h.abort(), Kk(a), u(e, a.u, 2);
            a.g && a.g.Ia.nb();
            b = t(a.m);
            for (c = b.next(); !c.done; c = b.next()) d = c.value, d.Ia.nb();
            a.g = null;
            a.m = [];
            a.j = null;
            A(e);
          });
        }
        function Lk(a, b) {
          var c = {
            Kb: function () {},
            cd: function () {},
            nb: function () {},
            onError: function () {},
            ed: function () {},
            vh: function () {}
          };
          a.m.push({
            create: b,
            Ia: c
          });
          a.h && a.h.abort();
          Kk(a);
          return c;
        }
        function Ik(a) {
          return G(function (b) {
            if (a.s.g) b = b.B(0);else {
              if (0 == a.m.length || a.g && !a.g.hb) var c = !1;else {
                a.g && (a.g.Ia.nb(), a.g = null);
                c = a.m.shift();
                var d = c.create(a.l);
                d ? (c.Ia.Kb(), a.g = {
                  node: d.node,
                  payload: d.payload,
                  hb: d.hb,
                  Ia: c.Ia
                }) : c.Ia.ed();
                c = !0;
              }
              c ? c = Promise.resolve() : a.g ? c = Mk(a) : (a.j.gg(a.i), a.o = new kc(), c = a.o);
              b = u(b, c, 1);
            }
            return b;
          });
        }
        function Mk(a) {
          var b, c;
          return G(function (d) {
            switch (d.g) {
              case 1:
                return a.i = a.j.Nf(a.i, a.l, a.g.node, a.g.payload), C(d, 2), a.h = a.j.zf(a.i, a.l, a.g.payload), u(d, a.h.promise, 4);
              case 4:
                a.h = null;
                a.i == a.g.node && (a.g.Ia.cd(), a.g = null);
                va(d, 0);
                break;
              case 2:
                b = wa(d);
                if (7001 == b.code) a.g.Ia.nb();else a.g.Ia.onError(b);
                a.g = null;
                a.h = null;
                c = a;
                return u(d, a.j.handleError(a.l, b), 5);
              case 5:
                c.i = d.h, A(d);
            }
          });
        }
        function Kk(a) {
          a.o && (a.o.resolve(), a.o = null);
        }
        function Nk(a) {
          var b = [],
            c = 700 <= a.fontWeight,
            d = "italic" == a.fontStyle,
            e = a.textDecoration.includes("underline");
          c && b.push("b");
          d && b.push("i");
          e && b.push("u");
          c = b.reduce(function (f, g) {
            return f + "<" + g + ">";
          }, "");
          b = b.reduceRight(function (f, g) {
            return f + "</" + g + ">";
          }, "");
          return a.lineBreak ? "\n" : a.nestedCues.length ? a.nestedCues.map(Nk).join("") : c + a.payload + b;
        }
        function Ok(a, b) {
          a = t(a);
          for (var c = a.next(); !c.done; c = a.next()) if (c = c.value, c.isContainer) Ok(c.nestedCues, b);else {
            var d = c.clone();
            d.nestedCues = [];
            d.payload = Nk(c);
            b.push(d);
          }
          return b;
        }
        function Pk(a) {
          this.g = null;
          for (var b = t(Array.from(a.textTracks)), c = b.next(); !c.done; c = b.next()) c = c.value, c.mode = "disabled", "Shaka Player TextTrack" == c.label && (this.g = c);
          this.g || (this.g = a.addTextTrack("subtitles", "Shaka Player TextTrack"));
          this.g.mode = "hidden";
        }
        r = Pk.prototype;
        r.remove = function (a, b) {
          if (!this.g) return !1;
          Qk(this.g, function (c) {
            return c.startTime < b && c.endTime > a;
          });
          return !0;
        };
        r.append = function (a) {
          var b = Ok(a, []),
            c = [];
          a = this.g.cues ? Array.from(this.g.cues) : [];
          var d = {};
          b = t(b);
          for (var e = b.next(); !e.done; d = {
            ub: d.ub
          }, e = b.next()) d.ub = e.value, a.some(function (f) {
            return function (g) {
              return g.startTime == f.ub.startTime && g.endTime == f.ub.endTime && g.text == f.ub.payload ? !0 : !1;
            };
          }(d)) || (e = Rk(d.ub)) && c.push(e);
          a = c.slice().sort(function (f, g) {
            return f.startTime != g.startTime ? f.startTime - g.startTime : f.endTime != g.endTime ? f.endTime - g.startTime : "line" in VTTCue.prototype ? c.indexOf(g) - c.indexOf(f) : c.indexOf(f) - c.indexOf(g);
          });
          a = t(a);
          for (d = a.next(); !d.done; d = a.next()) this.g.addCue(d.value);
        };
        r.destroy = function () {
          this.g && (Qk(this.g, function () {
            return !0;
          }), this.g.mode = "disabled");
          this.g = null;
          return Promise.resolve();
        };
        r.isTextVisible = function () {
          return "showing" == this.g.mode;
        };
        r.setTextVisibility = function (a) {
          this.g.mode = a ? "showing" : "hidden";
        };
        function Rk(a) {
          if (a.startTime >= a.endTime) return null;
          var b = new VTTCue(a.startTime, a.endTime, a.payload);
          b.lineAlign = a.lineAlign;
          b.positionAlign = a.positionAlign;
          a.size && (b.size = a.size);
          try {
            b.align = a.textAlign;
          } catch (c) {}
          "center" == a.textAlign && "center" != b.align && (b.align = "middle");
          "vertical-lr" == a.writingMode ? b.vertical = "lr" : "vertical-rl" == a.writingMode && (b.vertical = "rl");
          1 == a.lineInterpretation && (b.snapToLines = !1);
          null != a.line && (b.line = a.line);
          null != a.position && (b.position = a.position);
          return b;
        }
        function Qk(a, b) {
          var c = a.mode;
          a.mode = "showing" == c ? "showing" : "hidden";
          for (var d = t(Array.from(a.cues)), e = d.next(); !e.done; e = d.next()) (e = e.value) && b(e) && a.removeCue(e);
          a.mode = c;
        }
        K("shaka.text.SimpleTextDisplayer", Pk);
        Pk.prototype.setTextVisibility = Pk.prototype.setTextVisibility;
        Pk.prototype.isTextVisible = Pk.prototype.isTextVisible;
        Pk.prototype.destroy = Pk.prototype.destroy;
        Pk.prototype.append = Pk.prototype.append;
        Pk.prototype.remove = Pk.prototype.remove;
        function Sk() {}
        function Tk(a) {
          for (; a.firstChild;) a.removeChild(a.firstChild);
        }
        K("shaka.util.Dom", Sk);
        Sk.removeAllChildren = Tk;
        function Uk(a, b) {
          var c = this;
          this.j = !1;
          this.i = [];
          this.A = a;
          this.m = b;
          this.g = document.createElement("div");
          this.g.classList.add("shaka-text-container");
          this.g.style.textAlign = "center";
          this.g.style.display = "flex";
          this.g.style.flexDirection = "column";
          this.g.style.alignItems = "center";
          this.g.style.justifyContent = "flex-end";
          this.m.appendChild(this.g);
          this.u = new P(function () {
            Vk(c);
          }).Ca(.25);
          this.h = new Map();
          this.s = new lf();
          this.s.C(document, "fullscreenchange", function () {
            Vk(c, !0);
          });
          this.l = null;
          "ResizeObserver" in window && (this.l = new ResizeObserver(function () {
            Vk(c, !0);
          }), this.l.observe(this.g));
          this.o = new Map();
        }
        r = Uk.prototype;
        r.append = function (a) {
          var b = [].concat(ia(this.i)),
            c = {};
          a = t(a);
          for (var d = a.next(); !d.done; c = {
            Dc: c.Dc
          }, d = a.next()) c.Dc = d.value, b.some(function (e) {
            return function (f) {
              return vb(f, e.Dc);
            };
          }(c)) || this.i.push(c.Dc);
          Vk(this);
        };
        r.destroy = function () {
          this.m.removeChild(this.g);
          this.g = null;
          this.j = !1;
          this.i = [];
          this.u && this.u.stop();
          this.h.clear();
          this.s && (this.s.release(), this.s = null);
          this.l && (this.l.disconnect(), this.l = null);
        };
        r.remove = function (a, b) {
          if (!this.g) return !1;
          var c = this.i.length;
          this.i = this.i.filter(function (d) {
            return d.startTime < a || d.endTime >= b;
          });
          Vk(this, c > this.i.length);
          return !0;
        };
        r.isTextVisible = function () {
          return this.j;
        };
        r.setTextVisibility = function (a) {
          this.j = a;
        };
        function Wk(a, b) {
          for (; null != b;) {
            if (b == a.g) return !0;
            b = b.parentElement;
          }
          return !1;
        }
        function Xk(a, b, c, d, e) {
          var f = !1,
            g = [],
            h = [];
          b = t(b);
          for (var k = b.next(); !k.done; k = b.next()) {
            k = k.value;
            e.push(k);
            var l = a.h.get(k),
              m = k.startTime <= d && k.endTime > d,
              p = l ? l.ff : null;
            l && (g.push(l.Dd), l.uc && g.push(l.uc), m || (f = !0, a.h.delete(k), l = null));
            m && (h.push(k), l ? Wk(a, p) || (f = !0) : (Yk(a, k, e), l = a.h.get(k), p = l.ff, f = !0));
            0 < k.nestedCues.length && p && Xk(a, k.nestedCues, p, d, e);
            e.pop();
          }
          if (f) {
            d = t(g);
            for (e = d.next(); !e.done; e = d.next()) e = e.value, e.parentElement && e.parentElement.removeChild(e);
            h.sort(function (n, q) {
              return n.startTime != q.startTime ? n.startTime - q.startTime : n.endTime - q.endTime;
            });
            h = t(h);
            for (k = h.next(); !k.done; k = h.next()) d = a.h.get(k.value), d.uc ? (c.appendChild(d.uc), d.uc.appendChild(d.Dd)) : c.appendChild(d.Dd);
          }
        }
        function Vk(a, b) {
          if (a.g) {
            var c = a.A.currentTime;
            if (!a.j || (void 0 === b ? 0 : b)) {
              b = t(a.o.values());
              for (var d = b.next(); !d.done; d = b.next()) Tk(d.value);
              Tk(a.g);
              a.h.clear();
              a.o.clear();
            }
            if (a.j) {
              b = new Map();
              d = t(a.h.keys());
              for (var e = d.next(); !e.done; e = d.next()) e = e.value, b.set(e, a.h.get(e));
              Xk(a, a.i, a.g, c, []);
            }
          }
        }
        function Yk(a, b, c) {
          var d = 1 < c.length,
            e = d ? "span" : "div";
          b.lineBreak && (e = "br");
          d = !d && 0 < b.nestedCues.length;
          var f = document.createElement(e);
          "br" != e && Zk(a, f, b, c, d);
          c = null;
          if (b.region && b.region.id) if (c = b.region, e = c.id + "_" + c.width + "x" + c.height + (c.heightUnits == Cb ? "%" : "px") + "-" + c.viewportAnchorX + "x" + c.viewportAnchorY + (c.viewportAnchorUnits == Cb ? "%" : "px"), a.o.has(e)) c = a.o.get(e);else {
            var g = document.createElement("span"),
              h = c.heightUnits == Cb ? "%" : "px",
              k = c.widthUnits == Cb ? "%" : "px",
              l = c.viewportAnchorUnits == Cb ? "%" : "px";
            g.id = "shaka-text-region---" + e;
            g.classList.add("shaka-text-region");
            g.style.height = c.height + h;
            g.style.width = c.width + k;
            g.style.position = "absolute";
            g.style.top = c.viewportAnchorY + l;
            g.style.left = c.viewportAnchorX + l;
            g.style.display = "flex";
            g.style.flexDirection = "column";
            g.style.alignItems = "center";
            g.style.justifyContent = "before" == b.displayAlign ? "flex-start" : "center" == b.displayAlign ? "center" : "flex-end";
            a.o.set(e, g);
            c = g;
          }
          e = f;
          d && (e = document.createElement("span"), e.classList.add("shaka-text-wrapper"), e.style.backgroundColor = b.backgroundColor, e.style.lineHeight = "normal", f.appendChild(e));
          a.h.set(b, {
            Dd: f,
            ff: e,
            uc: c
          });
        }
        function Zk(a, b, c, d, e) {
          var f = b.style,
            g = 0 == c.nestedCues.length,
            h = 1 < d.length;
          f.whiteSpace = "pre-wrap";
          var k = c.payload.replace(/\s+$/g, function (m) {
            return "\u00a0".repeat(m.length);
          });
          f.webkitTextStrokeColor = c.textStrokeColor;
          f.webkitTextStrokeWidth = c.textStrokeWidth;
          f.color = c.color;
          f.direction = c.direction;
          f.opacity = c.opacity;
          f.paddingLeft = $k(c.linePadding, c, a.m);
          f.paddingRight = $k(c.linePadding, c, a.m);
          f.textShadow = c.textShadow;
          if (c.backgroundImage) f.backgroundImage = "url('" + c.backgroundImage + "')", f.backgroundRepeat = "no-repeat", f.backgroundSize = "contain", f.backgroundPosition = "center", f.width = "100%", f.height = "100%";else {
            if (c.nestedCues.length) var l = b;else l = document.createElement("span"), b.appendChild(l);
            c.border && (l.style.border = c.border);
            e || ((b = al(d, function (m) {
              return m.backgroundColor;
            })) ? l.style.backgroundColor = b : k && (l.style.backgroundColor = "rgba(0, 0, 0, 0.8)"));
            k && (l.textContent = k);
          }
          h && !d[d.length - 1].isContainer ? f.display = "inline" : (f.display = "flex", f.flexDirection = "column", f.alignItems = "center", f.justifyContent = "before" == c.displayAlign ? "flex-start" : "center" == c.displayAlign ? "center" : "flex-end");
          g || (f.margin = "0");
          f.fontFamily = c.fontFamily;
          f.fontWeight = c.fontWeight.toString();
          f.fontStyle = c.fontStyle;
          f.letterSpacing = c.letterSpacing;
          f.fontSize = $k(c.fontSize, c, a.m);
          null != c.line && 1 == c.lineInterpretation && (f.position = "absolute", c.writingMode == ob ? (f.width = "100%", c.lineAlign == rb ? f.top = c.line + "%" : "end" == c.lineAlign && (f.bottom = 100 - c.line + "%")) : "vertical-lr" == c.writingMode ? (f.height = "100%", c.lineAlign == rb ? f.left = c.line + "%" : "end" == c.lineAlign && (f.right = 100 - c.line + "%")) : (f.height = "100%", c.lineAlign == rb ? f.right = c.line + "%" : "end" == c.lineAlign && (f.left = 100 - c.line + "%")));
          f.lineHeight = c.lineHeight;
          null != c.position && (c.writingMode == ob ? f.paddingLeft = c.position : f.paddingTop = c.position);
          "line-left" == c.positionAlign ? f.cssFloat = "left" : "line-right" == c.positionAlign && (f.cssFloat = "right");
          f.textAlign = c.textAlign;
          f.textDecoration = c.textDecoration.join(" ");
          f.writingMode = c.writingMode;
          "writingMode" in document.documentElement.style && f.writingMode == c.writingMode || (f.webkitWritingMode = c.writingMode);
          c.size && (c.writingMode == ob ? f.width = c.size + "%" : f.height = c.size + "%");
        }
        function $k(a, b, c) {
          var d = (d = new RegExp(/(\d*\.?\d+)([a-z]+|%+)/).exec(a)) ? {
            value: Number(d[1]),
            unit: d[2]
          } : null;
          if (!d) return a;
          var e = d.value;
          switch (d.unit) {
            case "%":
              return e / 100 * c.clientHeight / b.cellResolution.rows + "px";
            case "c":
              return c.clientHeight * e / b.cellResolution.rows + "px";
            default:
              return a;
          }
        }
        function al(a, b) {
          for (var c = a.length - 1; 0 <= c; c--) {
            var d = b(a[c]);
            if (d || 0 === d) return d;
          }
          return null;
        }
        K("shaka.text.UITextDisplayer", Uk);
        Uk.prototype.setTextVisibility = Uk.prototype.setTextVisibility;
        Uk.prototype.isTextVisible = Uk.prototype.isTextVisible;
        Uk.prototype.remove = Uk.prototype.remove;
        Uk.prototype.destroy = Uk.prototype.destroy;
        Uk.prototype.append = Uk.prototype.append;
        function bl(a, b) {
          function c(f) {
            for (var g = f, h = t(b), k = h.next(); !k.done; k = h.next()) k = k.value, k.end && k.start < f && (g += k.end - k.start);
            f = Math.floor(g / 3600);
            h = Math.floor(g / 60 % 60);
            k = Math.floor(g % 60);
            g = Math.floor(1E3 * g % 1E3);
            return (10 > f ? "0" : "") + f + ":" + (10 > h ? "0" : "") + h + ":" + (10 > k ? "0" : "") + k + "." + (100 > g ? 10 > g ? "00" : "0" : "") + g;
          }
          var d = Ok(a, []);
          a = "WEBVTT\n\n";
          d = t(d);
          for (var e = d.next(); !e.done; e = d.next()) e = e.value, a += c(e.startTime) + " --\x3e " + c(e.endTime) + function (f) {
            var g = [];
            switch (f.textAlign) {
              case "left":
                g.push("align:left");
                break;
              case "right":
                g.push("align:right");
                break;
              case nb:
                g.push("align:middle");
                break;
              case "start":
                g.push("align:start");
                break;
              case "end":
                g.push("align:end");
            }
            switch (f.writingMode) {
              case "vertical-lr":
                g.push("vertical:lr");
                break;
              case "vertical-rl":
                g.push("vertical:rl");
            }
            return g.length ? " " + g.join(" ") : "";
          }(e) + "\n", a += e.payload + "\n\n";
          return a;
        }
        K("shaka.text.WebVttGenerator", function () {});
        function cl(a, b) {
          this.h = a;
          this.g = b;
          this.j = "";
          this.o = void 0;
          this.i = !1;
          this.m = !0;
          this.l = !1;
        }
        function dl(a, b, c) {
          try {
            if (a.g.enabled) {
              var d = {
                d: 1E3 * c.duration,
                st: a.h.T() ? el : fl
              };
              d.ot = gl(c);
              var e = d.ot === hl || d.ot === il || d.ot === jl || d.ot === kl;
              e && (d.bl = ll(a, c.type));
              c.bandwidth && (d.br = c.bandwidth / 1E3);
              e && d.ot !== kl && (d.tb = ml(a, d.ot) / 1E3);
              nl(a, b, d);
            }
          } catch (f) {
            Ya("CMCD_SEGMENT_ERROR", "Could not generate segment CMCD data.", f);
          }
        }
        function ol(a, b, c) {
          try {
            if (!a.g.enabled) return b;
            var d = pl(a);
            a: {
              switch (c) {
                case "video/webm":
                case "video/mp4":
                  var e = jl;
                  break a;
                case "application/x-mpegurl":
                  e = ql;
                  break a;
              }
              e = void 0;
            }
            d.ot = e;
            d.su = !0;
            var f = rl(d);
            return sl(b, f);
          } catch (g) {
            return Ya("CMCD_SRC_ERROR", "Could not generate src CMCD data.", g), b;
          }
        }
        function pl(a) {
          a.j || (a.j = a.g.sessionId || window.crypto.randomUUID());
          return {
            v: 1,
            sf: a.o,
            sid: a.j,
            cid: a.g.contentId,
            mtp: a.h.getBandwidthEstimate() / 1E3
          };
        }
        function nl(a, b, c) {
          c = void 0 === c ? {} : c;
          var d = void 0 === d ? a.g.useHeaders : d;
          if (a.g.enabled) {
            Object.assign(c, pl(a));
            c.pr = a.h.Sc();
            var e = c.ot === hl || c.ot === jl;
            a.l && e && (c.bs = !0, c.su = !0, a.l = !1);
            null == c.su && (c.su = a.m);
            if (d) a = tl(c), Object.keys(a).length && Object.assign(b.headers, a);else {
              var f = rl(c);
              f && (b.uris = b.uris.map(function (g) {
                return sl(g, f);
              }));
            }
          }
        }
        function gl(a) {
          var b = a.type;
          if (a.init) return ul;
          if ("video" == b) return a.codecs.includes(",") ? jl : hl;
          if ("audio" == b) return il;
          if ("text" == b) return "application/mp4" === a.mimeType ? kl : vl;
        }
        function ll(a, b) {
          b = a.h.Ma()[b];
          if (!b.length) return NaN;
          var c = a.h.getCurrentTime();
          return (a = b.find(function (d) {
            return d.start <= c && d.end >= c;
          })) ? 1E3 * (a.end - c) : NaN;
        }
        function ml(a, b) {
          var c = a.h.Ya();
          if (!c.length) return NaN;
          a = c[0];
          c = t(c);
          for (var d = c.next(); !d.done; d = c.next()) d = d.value, "variant" === d.type && d.bandwidth > a.bandwidth && (a = d);
          switch (b) {
            case hl:
              return a.videoBandwidth || NaN;
            case il:
              return a.audioBandwidth || NaN;
            default:
              return a.bandwidth;
          }
        }
        function rl(a) {
          function b(p) {
            return 100 * c(p / 100);
          }
          function c(p) {
            return Math.round(p);
          }
          function d(p) {
            return !Number.isNaN(p) && null != p && "" !== p && !1 !== p;
          }
          var e = [],
            f = {
              br: c,
              d: c,
              bl: b,
              dl: b,
              mtp: b,
              nor: function (p) {
                return encodeURIComponent(p);
              },
              rtp: b,
              tb: c
            },
            g = Object.keys(a || {}).sort();
          g = t(g);
          for (var h = g.next(); !h.done; h = g.next()) {
            h = h.value;
            var k = a[h];
            if (d(k) && ("v" !== h || 1 !== k) && ("pr" != h || 1 !== k)) {
              var l = f[h];
              l && (k = l(k));
              l = typeof k;
              var m = void 0;
              m = "string" === l && "ot" !== h && "sf" !== h && "st" !== h ? h + "=" + JSON.stringify(k) : "boolean" === l ? h : "symbol" === l ? h + "=" + k.description : h + "=" + k;
              e.push(m);
            }
          }
          return e.join(",");
        }
        function tl(a) {
          var b = Object.keys(a),
            c = {},
            d = ["Object", "Request", "Session", "Status"],
            e = [{}, {}, {}, {}],
            f = {
              br: 0,
              d: 0,
              ot: 0,
              tb: 0,
              bl: 1,
              dl: 1,
              mtp: 1,
              nor: 1,
              nrr: 1,
              su: 1,
              cid: 2,
              pr: 2,
              sf: 2,
              sid: 2,
              st: 2,
              v: 2,
              bs: 3,
              rtp: 3
            };
          b = t(b);
          for (var g = b.next(); !g.done; g = b.next()) g = g.value, e[null != f[g] ? f[g] : 1][g] = a[g];
          for (a = 0; a < e.length; a++) (f = rl(e[a])) && (c["CMCD-" + d[a]] = f);
          return c;
        }
        function sl(a, b) {
          if (!b || a.includes("offline:")) return a;
          a = new Mb(a);
          a.g.set("CMCD", b);
          return a.toString();
        }
        var ql = "m",
          il = "a",
          hl = "v",
          jl = "av",
          ul = "i",
          vl = "c",
          kl = "tt",
          fl = "v",
          el = "l";
        K("shaka.util.CmcdManager.StreamingFormat", {
          DASH: "d",
          HLS: "h",
          eh: "s",
          OTHER: "o"
        });
        function wl() {}
        function xl(a, b, c, d, e) {
          var f = (e in d),
            g = !0,
            h;
          for (h in b) {
            var k = e + "." + h,
              l = f ? d[e] : c[h];
            f || h in c ? void 0 === b[h] ? void 0 === l || f ? delete a[h] : a[h] = Ue(l) : l.constructor == Object && b[h] && b[h].constructor == Object ? (a[h] || (a[h] = Ue(l)), k = xl(a[h], b[h], l, d, k), g = g && k) : typeof b[h] != typeof l || null == b[h] || "function" != typeof b[h] && b[h].constructor != l.constructor ? (Wa("Invalid config, wrong type for " + k), g = !1) : ("function" == typeof c[h] && c[h].length != b[h].length && Xa("Unexpected number of arguments for " + k), a[h] = b[h]) : (Wa("Invalid config, unrecognized key " + k), g = !1);
          }
          return g;
        }
        function yl(a, b) {
          for (var c = {}, d = c, e = 0, f = 0;;) {
            e = a.indexOf(".", e);
            if (0 > e) break;
            if (0 == e || "\\" != a[e - 1]) f = a.substring(f, e).replace(/\\\./g, "."), d[f] = {}, d = d[f], f = e + 1;
            e += 1;
          }
          d[a.substring(f).replace(/\\\./g, ".")] = b;
          return c;
        }
        function zl(a, b) {
          return a && b;
        }
        K("shaka.util.ConfigUtils", wl);
        wl.convertToConfigObject = yl;
        wl.mergeConfigObjects = xl;
        function Al() {}
        function Bl(a) {
          a = Ec(a);
          return new Mb(a).Ha;
        }
        function Cl(a, b, c) {
          function d(h) {
            Jb(f).setUint32(g, h.byteLength, !0);
            g += 4;
            f.set(L(h), g);
            g += h.byteLength;
          }
          if (!c || !c.byteLength) throw new O(2, 6, 6015);
          var e;
          "string" == typeof b ? e = Gc(b, !0) : e = b;
          a = Ec(a);
          a = Gc(a, !0);
          var f = new Uint8Array(12 + a.byteLength + e.byteLength + c.byteLength),
            g = 0;
          d(a);
          d(e);
          d(c);
          return f;
        }
        K("shaka.util.FairPlayUtils", Al);
        Al.commonFairPlayResponse = function (a, b) {
          if (2 === a) {
            try {
              var c = Bc(b.data);
            } catch (e) {
              return;
            }
            a = !1;
            c = c.trim();
            "<ckc>" === c.substr(0, 5) && "</ckc>" === c.substr(-6) && (c = c.slice(5, -6), a = !0);
            try {
              var d = JSON.parse(c);
              d.ckc && (c = d.ckc, a = !0);
              d.CkcMessage && (c = d.CkcMessage, a = !0);
              d.License && (c = d.License, a = !0);
            } catch (e) {}
            a && (b.data = Hb(Kc(c)));
          }
        };
        Al.conaxFairPlayRequest = function (a, b) {
          2 === a && (b.headers["Content-Type"] = "application/octet-stream");
        };
        Al.ezdrmFairPlayRequest = function (a, b) {
          2 === a && (b.headers["Content-Type"] = "application/octet-stream");
        };
        Al.verimatrixFairPlayRequest = function (a, b) {
          2 === a && (a = L(b.body), a = Jc(a), b.headers["Content-Type"] = "application/x-www-form-urlencoded", b.body = Fc("spc=" + a));
        };
        Al.conaxInitDataTransform = function (a, b, c) {
          if ("skd" !== b) return a;
          b = c.serverCertificate;
          c = Ec(a).split("skd://").pop().split("?").shift();
          c = window.atob(c);
          var d = new ArrayBuffer(2 * c.length);
          d = new Uint16Array(d);
          for (var e = 0, f = c.length; e < f; e++) d[e] = c.charCodeAt(e);
          return Cl(a, d, b);
        };
        Al.ezdrmInitDataTransform = function (a, b, c) {
          if ("skd" !== b) return a;
          b = c.serverCertificate;
          c = Ec(a).split(";").pop();
          return Cl(a, c, b);
        };
        Al.verimatrixInitDataTransform = function (a, b, c) {
          if ("skd" !== b) return a;
          b = c.serverCertificate;
          c = Ec(a).split("skd://").pop();
          return Cl(a, c, b);
        };
        Al.initDataTransform = Cl;
        Al.defaultGetContentId = Bl;
        Al.isFairPlaySupported = function () {
          var a;
          return G(function (b) {
            if (1 == b.g) return a = {
              initDataTypes: ["cenc", "sinf", "skd"],
              videoCapabilities: [{
                contentType: 'video/mp4; codecs="avc1.42E01E"'
              }]
            }, C(b, 2), u(b, navigator.requestMediaKeySystemAccess("com.apple.fps", [a]), 4);
            if (2 != b.g) return b.return(!0);
            wa(b);
            return b.return(!1);
          });
        };
        function Dl() {}
        function El() {
          var a = Infinity;
          navigator.connection && navigator.connection.saveData && (a = 360);
          var b = {
              retryParameters: Ie(),
              servers: {},
              clearKeys: {},
              advanced: {},
              delayLicenseRequestUntilPlayed: !1,
              initDataTransform: function (g, h, k) {
                "com.apple.fps.1_0" == k.keySystem && "skd" == h && (h = k.serverCertificate, k = Bl(g), g = Cl(g, k, h));
                return g;
              },
              logLicenseExchange: !1,
              updateExpirationTime: 1,
              preferredKeySystems: [],
              keySystemsMapping: {},
              parseInbandPsshEnabled: rc()
            },
            c = {
              retryParameters: Ie(),
              availabilityWindowOverride: NaN,
              disableAudio: !1,
              disableVideo: !1,
              disableText: !1,
              disableThumbnails: !1,
              defaultPresentationDelay: 0,
              segmentRelativeVttTiming: !1,
              dash: {
                clockSyncUri: "",
                ignoreDrmInfo: !1,
                disableXlinkProcessing: !1,
                xlinkFailGracefully: !1,
                ignoreMinBufferTime: !1,
                autoCorrectDrift: !0,
                initialSegmentLimit: 1E3,
                ignoreSuggestedPresentationDelay: !1,
                ignoreEmptyAdaptationSet: !1,
                ignoreMaxSegmentDuration: !1,
                keySystemsByURI: {
                  "urn:uuid:1077efec-c0b2-4d02-ace3-3c1e52e2fb4b": "org.w3.clearkey",
                  "urn:uuid:e2719d58-a985-b3c9-781a-b030af78d30e": "org.w3.clearkey",
                  "urn:uuid:edef8ba9-79d6-4ace-a3c8-27dcd51d21ed": "com.widevine.alpha",
                  "urn:uuid:9a04f079-9840-4286-ab92-e65be0885f95": "com.microsoft.playready",
                  "urn:uuid:79f0049a-4098-8642-ab92-e65be0885f95": "com.microsoft.playready",
                  "urn:uuid:f239e769-efa3-4850-9c16-a903c6932efb": "com.adobe.primetime"
                },
                manifestPreprocessor: function (g) {
                  return zl([g], g);
                },
                sequenceMode: !1
              },
              hls: {
                ignoreTextStreamFailures: !1,
                ignoreImageStreamFailures: !1,
                defaultAudioCodec: "mp4a.40.2",
                defaultVideoCodec: "avc1.42E01E",
                ignoreManifestProgramDateTime: !1,
                mediaPlaylistFullMimeType: 'video/mp2t; codecs="avc1.42E01E, mp4a.40.2"',
                useSafariBehaviorForLive: !0,
                liveSegmentsDelay: 3
              }
            },
            d = {
              retryParameters: Ie(),
              failureCallback: function (g) {
                return zl([g]);
              },
              rebufferingGoal: 2,
              bufferingGoal: 10,
              bufferBehind: 30,
              ignoreTextStreamFailures: !1,
              alwaysStreamText: !1,
              startAtSegmentBoundary: !1,
              gapDetectionThreshold: .5,
              durationBackoff: 1,
              forceTransmux: !1,
              safeSeekOffset: 5,
              stallEnabled: !0,
              stallThreshold: 1,
              stallSkip: .1,
              useNativeHlsOnSafari: !0,
              inaccurateManifestTolerance: 2,
              lowLatencyMode: !1,
              autoLowLatencyMode: !1,
              forceHTTPS: !1,
              preferNativeHls: !1,
              updateIntervalSeconds: 1,
              dispatchAllEmsgBoxes: !1,
              observeQualityChanges: !1,
              maxDisabledTime: 30,
              parsePrftBox: !1
            };
          if (sc("Web0S") || tc() || sc("CrKey")) d.stallSkip = 0;
          var e = {
              trackSelectionCallback: function (g) {
                return G(function (h) {
                  return h.return(g);
                });
              },
              downloadSizeCallback: function (g) {
                var h;
                return G(function (k) {
                  if (1 == k.g) return navigator.storage && navigator.storage.estimate ? u(k, navigator.storage.estimate(), 3) : k.return(!0);
                  h = k.h;
                  return k.return(h.usage + g < .95 * h.quota);
                });
              },
              progressCallback: function (g, h) {
                return zl([g, h]);
              },
              usePersistentLicense: !0,
              numberOfParallelDownloads: 5
            },
            f = {
              drm: b,
              manifest: c,
              streaming: d,
              mediaSource: {
                sourceBufferExtraFeatures: ""
              },
              offline: e,
              abrFactory: function () {
                return new le();
              },
              abr: {
                enabled: !0,
                useNetworkInformation: !0,
                defaultBandwidthEstimate: 1E6,
                switchInterval: 8,
                bandwidthUpgradeTarget: .85,
                bandwidthDowngradeTarget: .95,
                restrictions: {
                  minWidth: 0,
                  maxWidth: Infinity,
                  minHeight: 0,
                  maxHeight: a,
                  minPixels: 0,
                  maxPixels: Infinity,
                  minFrameRate: 0,
                  maxFrameRate: Infinity,
                  minBandwidth: 0,
                  maxBandwidth: Infinity
                },
                advanced: {
                  minTotalBytes: 128E3,
                  minBytes: 16E3,
                  fastHalfLife: 2,
                  slowHalfLife: 5
                },
                restrictToElementSize: !1,
                restrictToScreenSize: !1,
                ignoreDevicePixelRatio: !1
              },
              autoShowText: 3,
              preferredAudioLanguage: "",
              preferredTextLanguage: "",
              preferredVariantRole: "",
              preferredTextRole: "",
              preferredAudioChannelCount: 2,
              preferredVideoCodecs: [],
              preferredAudioCodecs: [],
              preferForcedSubs: !1,
              preferredDecodingAttributes: [],
              restrictions: {
                minWidth: 0,
                maxWidth: Infinity,
                minHeight: 0,
                maxHeight: Infinity,
                minPixels: 0,
                maxPixels: Infinity,
                minFrameRate: 0,
                maxFrameRate: Infinity,
                minBandwidth: 0,
                maxBandwidth: Infinity
              },
              playRangeStart: 0,
              playRangeEnd: Infinity,
              textDisplayFactory: function () {
                return null;
              },
              cmcd: {
                enabled: !1,
                sessionId: "",
                contentId: "",
                useHeaders: !1
              },
              lcevc: {
                enabled: !1,
                dynamicPerformanceScaling: !0,
                logLevel: 0,
                drawLogo: !1
              }
            };
          e.trackSelectionCallback = function (g) {
            return G(function (h) {
              return h.return(Fl(g, f.preferredAudioLanguage));
            });
          };
          return f;
        }
        function Gl(a, b, c) {
          var d = {
            ".drm.keySystemsMapping": "",
            ".drm.servers": "",
            ".drm.clearKeys": "",
            ".drm.advanced": {
              distinctiveIdentifierRequired: !1,
              persistentStateRequired: !1,
              videoRobustness: "",
              audioRobustness: "",
              sessionType: "",
              serverCertificate: new Uint8Array(0),
              serverCertificateUri: "",
              individualizationServer: ""
            }
          };
          return xl(a, b, c || El(), d, "");
        }
        function Fl(a, b) {
          var c = a.filter(function (g) {
              return "variant" == g.type;
            }),
            d = [],
            e = ud(b, c.map(function (g) {
              return g.language;
            }));
          e && (d = c.filter(function (g) {
            return nd(g.language) == e;
          }));
          0 == d.length && (d = c.filter(function (g) {
            return g.primary;
          }));
          0 == d.length && (c.map(function (g) {
            return g.language;
          }), d = c);
          var f = d.filter(function (g) {
            return g.height && 480 >= g.height;
          });
          f.length && (f.sort(function (g, h) {
            return h.height - g.height;
          }), d = f.filter(function (g) {
            return g.height == f[0].height;
          }));
          b = [];
          d.length && (c = Math.floor(d.length / 2), d.sort(function (g, h) {
            return g.bandwidth - h.bandwidth;
          }), b.push(d[c]));
          a = t(a);
          for (d = a.next(); !d.done; d = a.next()) d = d.value, d.type != ic && "image" != d.type || b.push(d);
          return b;
        }
        K("shaka.util.PlayerConfiguration", Dl);
        Dl.mergeConfigObjects = Gl;
        Dl.createDefault = El;
        function Hl() {
          this.g = null;
          this.h = [];
        }
        function Il(a, b) {
          if (null == a.g) a.g = {
            timestamp: Date.now() / 1E3,
            state: b,
            duration: 0
          };else {
            var c = Date.now() / 1E3;
            a.g.duration = c - a.g.timestamp;
            a.g.state != b && (a.h.push(a.g), a.g = {
              timestamp: c,
              state: b,
              duration: 0
            });
          }
        }
        function Jl(a, b) {
          var c = 0;
          a.g && a.g.state == b && (c += a.g.duration);
          a = t(a.h);
          for (var d = a.next(); !d.done; d = a.next()) d = d.value, c += d.state == b ? d.duration : 0;
          return c;
        }
        function Kl(a) {
          function b(f) {
            return {
              timestamp: f.timestamp,
              state: f.state,
              duration: f.duration
            };
          }
          for (var c = [], d = t(a.h), e = d.next(); !e.done; e = d.next()) c.push(b(e.value));
          a.g && c.push(b(a.g));
          return c;
        }
        function Ll() {
          this.i = this.h = null;
          this.g = [];
        }
        function Ml(a, b, c) {
          a.i != b && (a.i = b, a.g.push({
            timestamp: Date.now() / 1E3,
            id: b.id,
            type: "text",
            fromAdaptation: c,
            bandwidth: null
          }));
        }
        function Nl() {
          this.u = this.A = this.G = this.D = this.s = this.j = this.F = this.m = this.i = this.M = this.P = this.H = this.J = this.L = this.l = this.o = NaN;
          this.g = new Hl();
          this.h = new Ll();
        }
        function V(a, b) {
          Te.call(this);
          var c = this;
          this.l = Ol;
          this.Vc = this.g = null;
          this.ca = !1;
          this.Yc = new lf();
          this.Yb = new lf();
          this.u = new lf();
          this.Ob = this.i = this.Zc = this.J = this.j = this.ka = this.L = this.df = this.V = this.Fa = this.M = this.Wc = this.H = this.yb = this.A = this.G = this.m = this.D = null;
          this.ec = !1;
          this.Pd = this.s = null;
          this.$d = 1E9;
          this.h = Pl(this);
          this.fc = {
            width: Infinity,
            height: Infinity
          };
          this.o = null;
          this.vb = new ze(this.h.preferredAudioLanguage, this.h.preferredVariantRole, this.h.preferredAudioChannelCount);
          this.wb = this.h.preferredTextLanguage;
          this.dc = this.h.preferredTextRole;
          this.ac = this.h.preferForcedSubs;
          this.$b = [];
          this.hc = null;
          b && b(this);
          this.D = Ql(this);
          this.D.le(this.h.streaming.forceHTTPS);
          this.F = null;
          Rl && (this.F = Rl());
          this.Yc.C(window, "online", function () {
            c.ee();
          });
          this.P = {
            name: "detach"
          };
          this.W = {
            name: "attach"
          };
          this.ea = {
            name: "unload"
          };
          this.ae = {
            name: "manifest-parser"
          };
          this.Zd = {
            name: "manifest"
          };
          this.xb = {
            name: "media-source"
          };
          this.Sd = {
            name: "drm-engine"
          };
          this.ba = {
            name: "load"
          };
          this.fe = {
            name: "src-equals-drm-engine"
          };
          this.zb = {
            name: "src-equals"
          };
          var d = new Map();
          d.set(this.W, function (e, f) {
            return Oe(Sl(c, e, f));
          });
          d.set(this.P, function (e) {
            e.mediaElement && (c.Yb.ob(), e.mediaElement = null);
            c.F && c.F.release();
            c.g = null;
            e = Promise.resolve();
            return Oe(e);
          });
          d.set(this.ea, function (e) {
            return Oe(Tl(c, e));
          });
          d.set(this.xb, function (e) {
            e = Ul(c, e);
            return Oe(e);
          });
          d.set(this.ae, function (e, f) {
            e = Vl(c, e, f);
            return Oe(e);
          });
          d.set(this.Zd, function (e) {
            return Wl(c, e);
          });
          d.set(this.Sd, function (e) {
            e = Xl(c, e);
            return Oe(e);
          });
          d.set(this.ba, function (e, f) {
            return Oe(Yl(c, e, f));
          });
          d.set(this.fe, function (e, f) {
            e = Zl(c, e, f);
            return Oe(e);
          });
          d.set(this.zb, function (e, f) {
            return $l(c, e, f);
          });
          this.Ga = new Gk(this.P, {
            Nf: function (e, f, g, h) {
              var k = null;
              e == c.P && (k = g == c.P ? c.P : c.W);
              e == c.W && (k = g == c.P || f.mediaElement != h.mediaElement ? c.P : g == c.W ? c.W : g == c.xb || g == c.ba ? c.xb : g == c.zb ? c.fe : null);
              e == c.xb && (k = g == c.ba && f.mediaElement == h.mediaElement ? c.ae : c.ea);
              e == c.ae && (k = am(c.ba, c.Zd, c.ea, g, f, h));
              e == c.Zd && (k = am(c.ba, c.Sd, c.ea, g, f, h));
              e == c.Sd && (k = am(c.ba, c.ba, c.ea, g, f, h));
              e == c.fe && (k = g == c.zb && f.mediaElement == h.mediaElement ? c.zb : c.ea);
              if (e == c.ba || e == c.zb) k = c.ea;
              e == c.ea && (k = h.mediaElement && f.mediaElement == h.mediaElement ? c.W : c.P);
              return k;
            },
            zf: function (e, f, g) {
              c.dispatchEvent(bm("onstatechange", new Map().set("state", e.name)));
              return d.get(e)(f, g);
            },
            handleError: function (e) {
              return G(function (f) {
                return 1 == f.g ? u(f, Tl(c, e), 2) : f.return(e.mediaElement ? c.W : c.P);
              });
            },
            gg: function (e) {
              c.dispatchEvent(bm("onstateidle", new Map().set("state", e.name)));
            }
          });
          this.bf = new P(function () {
            Kd(c.i.variants, c.h.restrictions, c.fc) && cm(c);
          });
          a && this.Zb(a, !0);
        }
        qa(V, Te);
        function dm(a) {
          null != a.L && (a.L.release(), a.L = null);
        }
        function em(a, b) {
          if (b.lcevc.enabled) {
            var c = a.Ya();
            c && c[0] && c[0].videoMimeType == fm.ts && (qc() || navigator.userAgent.match(/Edge\//)) && (b.streaming.forceTransmux || Xa("LCEVC Warning: For MPEG-2 TS decoding the config.streaming.forceTransmux must be enabled."));
            dm(a);
            null == a.L && (a.L = new Hi(a.g, a.df, b.lcevc), a.G && (a.G.F = a.L));
          } else dm(a);
        }
        function bm(a, b) {
          return new S(a, b);
        }
        r = V.prototype;
        r.destroy = function () {
          var a = this,
            b;
          return G(function (c) {
            switch (c.g) {
              case 1:
                if (a.l == gm) return c.return();
                dm(a);
                a.l = gm;
                b = Lk(a.Ga, function () {
                  return {
                    node: a.P,
                    payload: Hk(),
                    hb: !1
                  };
                });
                return u(c, new Promise(function (d) {
                  b.Kb = function () {};
                  b.cd = function () {
                    d();
                  };
                  b.nb = function () {
                    d();
                  };
                  b.onError = function () {
                    d();
                  };
                  b.ed = function () {
                    d();
                  };
                }), 2);
              case 2:
                return u(c, a.Ga.destroy(), 3);
              case 3:
                a.Yc && (a.Yc.release(), a.Yc = null);
                a.Yb && (a.Yb.release(), a.Yb = null);
                a.u && (a.u.release(), a.u = null);
                a.Pd = null;
                a.h = null;
                a.o = null;
                a.Vc = null;
                a.V = null;
                if (!a.D) {
                  c.B(4);
                  break;
                }
                return u(c, a.D.destroy(), 5);
              case 5:
                a.D = null;
              case 4:
                a.s && (a.s.release(), a.s = null), Te.prototype.release.call(a), A(c);
            }
          });
        };
        r.Zb = function (a, b) {
          b = void 0 === b ? !0 : b;
          if (this.l == gm) return Promise.reject(hm());
          var c = Hk();
          c.mediaElement = a;
          nc() || (b = !1);
          var d = b ? this.xb : this.W;
          a = Lk(this.Ga, function () {
            return {
              node: d,
              payload: c,
              hb: !1
            };
          });
          a.Kb = function () {};
          return im(a);
        };
        r.mf = function (a) {
          this.df = a;
        };
        r.detach = function () {
          var a = this;
          if (this.l == gm) return Promise.reject(hm());
          var b = Lk(this.Ga, function () {
            return {
              node: a.P,
              payload: Hk(),
              hb: !1
            };
          });
          b.Kb = function () {};
          return im(b);
        };
        r.se = function (a) {
          var b = this;
          a = void 0 === a ? !0 : a;
          if (this.l == gm) return Promise.reject(hm());
          this.ec = !1;
          nc() || (a = !1);
          dm(this);
          var c = Hk(),
            d = Lk(this.Ga, function (e) {
              var f = e.mediaElement && a ? b.xb : e.mediaElement ? b.W : b.P;
              c.mediaElement = e.mediaElement;
              return {
                node: f,
                payload: c,
                hb: !1
              };
            });
          d.Kb = function () {};
          return im(d);
        };
        r.Hg = function (a) {
          this.hc = a;
        };
        r.load = function (a, b, c) {
          var d = this;
          this.hc = null;
          this.ec = !1;
          if (this.l == gm) return Promise.reject(hm());
          this.dispatchEvent(bm("loading"));
          var e = Hk();
          e.uri = a;
          e.gd = Date.now() / 1E3;
          c && (e.mimeType = c);
          void 0 !== b && (e.startTime = b);
          var f = jm(this, e) ? this.zb : this.ba,
            g = Lk(this.Ga, function (h) {
              if (null == h.mediaElement) return null;
              e.mediaElement = h.mediaElement;
              return {
                node: f,
                payload: e,
                hb: !0
              };
            });
          this.o = new Nl();
          this.V = km(this);
          g.Kb = function () {};
          return new Promise(function (h, k) {
            g.ed = function () {
              return k(new O(2, 7, 7002));
            };
            g.cd = function () {
              h();
              d.dispatchEvent(bm("loaded"));
            };
            g.nb = function () {
              return k(hm());
            };
            g.onError = function (l) {
              return k(l);
            };
          });
        };
        function jm(a, b) {
          if (!nc()) return !0;
          var c = b.mimeType,
            d = b.uri || "";
          c || (c = Tg(d), c = fm[c]);
          if (c) {
            if ("" == (b.mediaElement || pc()).canPlayType(c)) return !1;
            if (!nc() || !(c in Sg || Tg(d) in Ug) || ("application/x-mpegurl" === c || "application/vnd.apple.mpegurl" === c) && a.h.streaming.preferNativeHls) return !0;
            if (vc()) return a.h.streaming.useNativeHlsOnSafari;
          }
          return !1;
        }
        function Sl(a, b, c) {
          null == b.mediaElement && (b.mediaElement = c.mediaElement, a.Yb.C(b.mediaElement, "error", function () {
            var d = lm(a);
            d && mm(a, d);
          }));
          a.g = b.mediaElement;
          return Promise.resolve();
        }
        function Tl(a, b) {
          var c, d, e, f, g, h, k, l, m;
          return G(function (p) {
            switch (p.g) {
              case 1:
                return a.l != gm && (a.l = Ol), c = a.$b.map(function (n) {
                  return n();
                }), a.$b = [], u(p, Promise.all(c), 2);
              case 2:
                a.dispatchEvent(bm("unloading"));
                b.mimeType = null;
                b.startTime = null;
                b.uri = null;
                a.Fa && (a.Fa.release(), a.Fa = null);
                b.mediaElement && a.u.ob();
                a.bf.stop();
                a.yb && (a.yb.release(), a.yb = null);
                a.Wc && (a.Wc.stop(), a.Wc = null);
                if (!a.J) {
                  p.B(3);
                  break;
                }
                return u(p, a.J.stop(), 4);
              case 4:
                a.J = null, a.Zc = null;
              case 3:
                if (!a.s) {
                  p.B(5);
                  break;
                }
                return u(p, a.s.stop(), 5);
              case 5:
                if (!a.j) {
                  p.B(7);
                  break;
                }
                return u(p, a.j.destroy(), 8);
              case 8:
                a.j = null;
              case 7:
                a.H && (a.H.release(), a.H = null);
                a.A && (a.A.release(), a.A = null);
                if (!a.G) {
                  p.B(9);
                  break;
                }
                return u(p, a.G.destroy(), 10);
              case 10:
                a.G = null;
              case 9:
                if (a.F) a.F.onAssetUnload();
                if (!b.mediaElement || !b.mediaElement.src) {
                  p.B(11);
                  break;
                }
                return u(p, new Promise(function (n) {
                  return new P(n).O(.1);
                }), 12);
              case 12:
                for (b.mediaElement.removeAttribute("src"), b.mediaElement.load(); b.mediaElement.lastChild;) b.mediaElement.removeChild(b.mediaElement.firstChild);
              case 11:
                if (!a.m) {
                  p.B(13);
                  break;
                }
                return u(p, a.m.destroy(), 14);
              case 14:
                a.m = null;
              case 13:
                a.Ob = null;
                a.M = null;
                if (a.i) {
                  d = t(a.i.variants);
                  for (e = d.next(); !e.done; e = d.next()) for (f = e.value, g = t([f.audio, f.video]), h = g.next(); !h.done; h = g.next()) (k = h.value) && k.segmentIndex && k.segmentIndex.release();
                  l = t(a.i.textStreams);
                  for (h = l.next(); !h.done; h = l.next()) m = h.value, m.segmentIndex && m.segmentIndex.release();
                }
                a.i = null;
                a.o = new Nl();
                a.Wd = null;
                nm(a);
                A(p);
            }
          });
        }
        function Ul(a, b) {
          var c, d, e, f, g;
          return G(function (h) {
            if (1 == h.g) return c = a.h.textDisplayFactory, d = c(), a.Wd = c, e = om(b.mediaElement, d, function (k, l, m) {
              pm(a, k, l, m);
            }, a.L), e.configure(a.h.mediaSource), f = a.h.manifest, g = f.segmentRelativeVttTiming, e.H = g, u(h, e.J, 2);
            a.G = e;
            A(h);
          });
        }
        function Vl(a, b, c) {
          var d, e, f, g;
          return G(function (h) {
            if (1 == h.g) return b.mimeType = c.mimeType, b.uri = c.uri, d = b.uri, e = a.D, a.Ob = d, f = a, u(h, Rg(d, e, a.h.manifest.retryParameters, b.mimeType), 2);
            f.Zc = h.h;
            a.J = a.Zc();
            g = Ue(a.h.manifest);
            c.mediaElement && "AUDIO" === c.mediaElement.nodeName && (g.disableVideo = !0);
            a.J.configure(g);
            A(h);
          });
        }
        function Wl(a, b) {
          var c = b.uri;
          b = a.D;
          a.Fa = new Wj(function () {
            return a.vc();
          });
          a.Fa.addEventListener("regionadd", function (f) {
            f = f.region;
            qm(a, "timelineregionadded", f);
            if (a.F) a.F.onDashTimedMetadata(f);
          });
          a.ka = null;
          a.h.streaming.observeQualityChanges && (a.ka = new Sj(function () {
            return a.Ma();
          }), a.ka.addEventListener("qualitychange", function (f) {
            var g = f.quality;
            f = f.position;
            g = new Map().set("mediaQuality", {
              bandwidth: g.bandwidth,
              audioSamplingRate: g.audioSamplingRate,
              codecs: g.codecs,
              contentType: g.contentType,
              frameRate: g.frameRate,
              height: g.height,
              mimeType: g.mimeType,
              channelsCount: g.channelsCount,
              pixelAspectRatio: g.pixelAspectRatio,
              width: g.width
            }).set("position", f);
            a.dispatchEvent(bm("mediaqualitychanged", g));
          }));
          var d = {
              networkingEngine: b,
              modifyManifestRequest: function (f, g) {
                var h = a.V;
                try {
                  h.g.enabled && (h.o = g.format, nl(h, f, {
                    ot: ql,
                    su: !h.i
                  }));
                } catch (k) {
                  Ya("CMCD_MANIFEST_ERROR", "Could not generate manifest CMCD data.", k);
                }
              },
              modifySegmentRequest: function (f, g) {
                dl(a.V, f, g);
              },
              filter: function (f) {
                return rm(a, f);
              },
              makeTextStreamsForClosedCaptions: function (f) {
                return sm(a, f);
              },
              onTimelineRegionAdded: function (f) {
                var g = a.Fa;
                a: {
                  var h = t(g.g);
                  for (var k = h.next(); !k.done; k = h.next()) if (k = k.value, k.schemeIdUri == f.schemeIdUri && k.id == f.id && k.startTime == f.startTime && k.endTime == f.endTime) {
                    h = k;
                    break a;
                  }
                  h = null;
                }
                null == h && (g.g.add(f), f = new S("regionadd", new Map([["region", f]])), g.dispatchEvent(f));
              },
              onEvent: function (f) {
                return a.dispatchEvent(f);
              },
              onError: function (f) {
                return mm(a, f);
              },
              isLowLatencyMode: function () {
                return a.h.streaming.lowLatencyMode;
              },
              isAutoLowLatencyMode: function () {
                return a.h.streaming.autoLowLatencyMode;
              },
              enableLowLatencyMode: function () {
                a.configure("streaming.lowLatencyMode", !0);
              },
              updateDuration: function () {
                a.j && a.j.updateDuration();
              },
              newDrmInfo: function (f) {
                var g = a.m ? a.m.g : null;
                g && a.m.u && tm(a, g.keySystem, f);
              }
            },
            e = Date.now() / 1E3;
          return new Ke(function () {
            var f, g, h, k;
            return G(function (l) {
              if (1 == l.g) return f = a, u(l, a.J.start(c, d), 2);
              f.i = l.h;
              g = bm("manifestparsed");
              a.dispatchEvent(g);
              if (0 == a.i.variants.length) throw new O(2, 4, 4036);
              um(a.i);
              h = Date.now() / 1E3;
              k = h - e;
              a.o.F = k;
              A(l);
            });
          }(), function () {
            return a.J.stop();
          });
        }
        function Xl(a, b) {
          var c, d;
          return G(function (e) {
            return 1 == e.g ? (c = Date.now() / 1E3, d = !0, a.m = vm(a, {
              lb: a.D,
              onError: function (f) {
                mm(a, f);
              },
              dd: function (f) {
                wm(a, f);
              },
              onExpirationUpdated: function (f, g) {
                xm(a, f, g);
              },
              onEvent: function (f) {
                a.dispatchEvent(f);
                "drmsessionupdate" == f.type && d && (d = !1, a.o.j = Date.now() / 1E3 - c, a.L && (f = a.L, f.g && f.h.classList.add("shaka-hidden")));
              }
            }), a.m.configure(a.h.drm), u(e, lg(a.m, a.i.variants, a.i.offlineSessionIds), 2)) : 3 != e.g ? u(e, a.m.Zb(b.mediaElement), 3) : u(e, rm(a, a.i), 0);
          });
        }
        function Yl(a, b, c) {
          var d, e, f, g, h, k, l, m, p, n, q, v, y, w, x, D, z;
          return G(function (B) {
            switch (B.g) {
              case 1:
                b.startTime = c.startTime;
                null != a.hc && (b.startTime = a.hc, a.hc = null);
                d = b.mediaElement;
                e = b.uri;
                a.Ob = e;
                a.H = new Oj({
                  Uc: function () {
                    return d.playbackRate;
                  },
                  Qc: function () {
                    return d.defaultPlaybackRate;
                  },
                  ne: function (E) {
                    d.playbackRate = E;
                  },
                  Oe: function (E) {
                    d.currentTime += E;
                  }
                });
                f = function () {
                  return ym(a);
                };
                g = function () {
                  return zm(a);
                };
                a.u.C(d, "playing", f);
                a.u.C(d, "pause", f);
                a.u.C(d, "ended", f);
                a.u.C(d, "ratechange", g);
                em(a, a.h);
                h = a.h.abrFactory;
                a.s && a.Pd == h || (a.Pd = h, a.s = h(), "function" != typeof a.s.setMediaElement && (qe("AbrManager", "Please use an AbrManager with setMediaElement function."), a.s.setMediaElement = function () {}), a.s.configure(a.h.abr));
                a.vb = new ze(a.h.preferredAudioLanguage, a.h.preferredVariantRole, a.h.preferredAudioChannelCount);
                a.wb = a.h.preferredTextLanguage;
                a.dc = a.h.preferredTextRole;
                a.ac = a.h.preferForcedSubs;
                Am(a.i.presentationTimeline, a.h.playRangeStart, a.h.playRangeEnd);
                a.s.init(function (E, F, H) {
                  a.j && E != a.j.l && Bm(a, E, !0, void 0 === F ? !1 : F, void 0 === H ? 0 : H);
                });
                a.s.setMediaElement(d);
                wd(a.i, a.h.preferredVideoCodecs, a.h.preferredAudioCodecs, a.h.preferredAudioChannelCount, a.h.preferredDecodingAttributes);
                a.j = Cm(a);
                a.j.configure(a.h.streaming);
                a.l = Dm;
                d.textTracks && a.u.C(d.textTracks, "addtrack", function (E) {
                  if (E.track) switch (E = E.track, E.kind) {
                    case "chapters":
                      Em(a, E);
                  }
                });
                a.dispatchEvent(bm("streaming"));
                k = null;
                (l = a.j.l) || (k = cm(a));
                m = [];
                p = l || k;
                n = t([p.video, p.audio]);
                for (q = n.next(); !q.done; q = n.next()) (v = q.value) && !v.segmentIndex && m.push(v.createSegmentIndex());
                if (!(0 < m.length)) {
                  B.B(2);
                  break;
                }
                return u(B, Promise.all(m), 2);
              case 2:
                Am(a.i.presentationTimeline, a.h.playRangeStart, a.h.playRangeEnd);
                a.A = Fm(a, b.startTime);
                a.yb = Gm(a, b.gd);
                y = Math.max(a.i.minBufferTime, a.h.streaming.rebufferingGoal);
                Hm(a, y);
                if (l) {
                  B.B(4);
                  break;
                }
                Bm(a, k, !0, !1, 0);
                if (!a.h.streaming.startAtSegmentBoundary) {
                  B.B(4);
                  break;
                }
                w = a.A.Jc();
                return u(B, Im(k, w), 6);
              case 6:
                x = B.h, a.A.Cd(x);
              case 4:
                return a.A.Bd(), D = a.Gb().find(function (E) {
                  return E.active;
                }), D || ((z = ie(a.i.textStreams, a.wb, a.dc, a.ac)[0] || null) && Ml(a.o.h, z, !0), k && (z ? (k.audio && Jm(a, k.audio, z) && (a.ca = !0), a.ca && a.G.m.setTextVisibility(!0), Km(a)) : a.ca = !1), z && (a.h.streaming.alwaysStreamText || a.Jd()) && pk(a.j, z)), u(B, a.j.start(), 7);
              case 7:
                a.h.abr.enabled && (a.s.enable(), Lm(a)), Nd(a.j ? a.j.l : null, a.i), Mm(a.i), Nm(a), Om(a), a.i.variants.some(function (E) {
                  return E.primary;
                }), a.ec = !0, a.u.ia(d, "loadedmetadata", function () {
                  a.o.m = Date.now() / 1E3 - c.gd;
                }), A(B);
            }
          });
        }
        function Zl(a, b, c) {
          var d, e, f, g, h, k, l;
          return G(function (m) {
            return 1 == m.g ? (d = jc, e = Date.now() / 1E3, f = !0, a.m = vm(a, {
              lb: a.D,
              onError: function (p) {
                mm(a, p);
              },
              dd: function (p) {
                wm(a, p);
              },
              onExpirationUpdated: function (p, n) {
                xm(a, p, n);
              },
              onEvent: function (p) {
                a.dispatchEvent(p);
                "drmsessionupdate" == p.type && f && (f = !1, a.o.j = Date.now() / 1E3 - e);
              }
            }), a.m.configure(a.h.drm), g = c.uri || "", h = Tg(g), k = fm[h], "application/x-mpegurl" == k && vc() && (k = "application/vnd.apple.mpegurl"), k || (k = "video/mp4"), l = {
              id: 0,
              language: "und",
              disabledUntilTime: 0,
              primary: !1,
              audio: null,
              video: {
                id: 0,
                originalId: null,
                createSegmentIndex: function () {
                  return Promise.resolve();
                },
                segmentIndex: null,
                mimeType: c.mimeType ? c.mimeType.split(";")[0] : k,
                codecs: c.mimeType ? bd(c.mimeType) : "",
                encrypted: !0,
                drmInfos: [],
                keyIds: new Set(),
                language: "und",
                label: null,
                type: d.va,
                primary: !1,
                trickModeVideo: null,
                emsgSchemeIdUris: null,
                roles: [],
                forced: !1,
                channelsCount: null,
                audioSamplingRate: null,
                spatialAudio: !1,
                closedCaptions: null,
                external: !1
              },
              bandwidth: 100,
              allowedByApplication: !0,
              allowedByKeySystem: !0,
              decodingInfos: []
            }, a.m.W = !0, u(m, lg(a.m, [l], []), 2)) : u(m, a.m.Zb(b.mediaElement), 0);
          });
        }
        function $l(a, b, c) {
          function d() {
            return ym(a);
          }
          b.uri = c.uri;
          b.startTime = c.startTime;
          a.Ob = b.uri;
          var e = b.mediaElement;
          a.A = new Cj(e);
          var f = !1;
          a.$b.push(function () {
            f = !0;
          });
          null != b.startTime && a.A.Cd(b.startTime);
          a.H = new Oj({
            Uc: function () {
              return e.playbackRate;
            },
            Qc: function () {
              return e.defaultPlaybackRate;
            },
            ne: function (k) {
              e.playbackRate = k;
            },
            Oe: function (k) {
              e.currentTime += k;
            }
          });
          Hm(a, a.h.streaming.rebufferingGoal);
          a.u.C(e, "playing", d);
          a.u.C(e, "pause", d);
          a.u.C(e, "ended", d);
          a.u.C(e, "ratechange", function () {
            return zm(a);
          });
          "none" != e.preload && a.u.ia(e, "loadedmetadata", function () {
            a.o.m = Date.now() / 1E3 - c.gd;
          });
          e.audioTracks && (a.u.C(e.audioTracks, "addtrack", function () {
            return Nm(a);
          }), a.u.C(e.audioTracks, "removetrack", function () {
            return Nm(a);
          }), a.u.C(e.audioTracks, "change", function () {
            return Nm(a);
          }));
          e.textTracks && (a.u.C(e.textTracks, "addtrack", function (k) {
            if (k.track) switch (k = k.track, k.kind) {
              case "metadata":
                Pm(a, k);
                break;
              case "chapters":
                Em(a, k);
                break;
              default:
                Nm(a);
            }
          }), a.u.C(e.textTracks, "removetrack", function () {
            return Nm(a);
          }), a.u.C(e.textTracks, "change", function () {
            return Nm(a);
          }));
          var g = Tg(b.uri);
          e.src = ol(a.V, b.uri, fm[g]);
          (tc() || sc("Web0S")) && e.load();
          a.l = Qm;
          a.dispatchEvent(bm("streaming"));
          var h = new kc();
          tj(e, HTMLMediaElement.HAVE_METADATA, a.u, function () {
            a.A.Bd();
            h.resolve();
          });
          tj(e, HTMLMediaElement.HAVE_CURRENT_DATA, a.u, function () {
            var k;
            return G(function (l) {
              if (1 == l.g) return Rm(a), k = Sm(a), k.find(function (m) {
                return "disabled" != m.mode;
              }) ? (0 < k.length && (a.ca = !0), l.B(2)) : u(l, new Promise(function (m) {
                a.u.ia(e.textTracks, "change", m);
                new P(m).O(1);
              }), 2);
              if (f) return l.return();
              Tm(a);
              A(l);
            });
          });
          e.error ? h.reject(lm(a)) : "none" == e.preload && (Xa('With <video preload="none">, the browser will not load anything until play() is called. We are unable to measure load latency in a meaningful way, and we cannot provide track info yet. Please do not use preload="none" with Shaka Player.'), h.resolve());
          a.u.ia(e, "error", function () {
            h.reject(lm(a));
          });
          return new Ke(h, function () {
            h.reject(new O(2, 7, 7001));
            return Promise.resolve();
          }).Z(function () {
            a.ec = !0;
          });
        }
        function Rm(a) {
          var b = a.h.preferredAudioLanguage;
          if ("" != b) {
            a.ie(b);
            var c = a.h.preferredVariantRole;
            "" != c && a.ie(b, c);
          }
        }
        function Tm(a) {
          var b = a.h.preferredTextLanguage,
            c = a.h.preferForcedSubs;
          if ("" != b) {
            a.je(b, "", c);
            var d = a.h.preferredTextRole;
            "" != d && a.je(b, d, c);
          }
        }
        function Pm(a, b) {
          if ("metadata" == b.kind) {
            b.mode = "hidden";
            a.u.C(b, "cuechange", function () {
              if (b.activeCues) for (var d = t(b.activeCues), e = d.next(); !e.done; e = d.next()) if (e = e.value, Um(a, e.startTime, e.endTime, e.type, e.value), a.F) a.F.onCueMetadataChange(e.value);
            });
            var c = new P(function () {
              var d = Vm(a);
              d = t(d);
              for (var e = d.next(); !e.done; e = d.next()) e.value.mode = "hidden";
            }).Nb().O(.5);
            a.$b.push(function () {
              c.stop();
            });
          }
        }
        function pm(a, b, c, d) {
          b = t(b);
          for (var e = b.next(); !e.done; e = b.next()) if (e = e.value, e.data && e.cueTime && e.frames) {
            var f = e.cueTime + c,
              g = d;
            g && f > g && (g = f);
            for (var h = t(e.frames), k = h.next(); !k.done; k = h.next()) Um(a, f, g, "org.id3", k.value);
            if (a.F) a.F.onHlsTimedMetadata(e, f);
          }
        }
        function Um(a, b, c, d, e) {
          b = new Map().set("startTime", b).set("endTime", c).set("metadataType", d).set("payload", e);
          a.dispatchEvent(bm("metadata", b));
        }
        function Em(a, b) {
          if (b && "chapters" == b.kind) {
            b.mode = "hidden";
            var c = new P(function () {
              b.mode = "hidden";
            }).Nb().O(.5);
            a.$b.push(function () {
              c.stop();
            });
          }
        }
        function um(a) {
          function b(c) {
            return c.video && c.audio || c.video && c.video.codecs.includes(",");
          }
          a.variants.some(b) && (a.variants = a.variants.filter(b));
        }
        function vm(a, b) {
          return new eg(b, a.h.drm.updateExpirationTime);
        }
        function Ql(a) {
          return new Ye(function (b, c) {
            a.s && a.s.segmentDownloaded(b, c);
          }, function (b, c, d) {
            b = new Map().set("headers", b).set("request", c).set("requestType", d);
            a.dispatchEvent(bm("downloadheadersreceived", b));
          }, function (b, c, d, e) {
            b = new Map().set("request", b).set("error", c).set("httpResponseCode", d).set("aborted", e);
            a.dispatchEvent(bm("downloadfailed", b));
          });
        }
        function Fm(a, b) {
          return new Dj(a.g, a.i, a.h.streaming, b, function () {
            a.yb && Rj(a.yb, !0);
            a.j && a.j.wc();
            a.M && Wm(a);
          }, function (c) {
            return a.dispatchEvent(c);
          });
        }
        function Gm(a, b) {
          b = new Xj(a.Fa, a.T() || 0 < b);
          b.addEventListener("enter", function (d) {
            qm(a, "timelineregionenter", d.region);
          });
          b.addEventListener("exit", function (d) {
            qm(a, "timelineregionexit", d.region);
          });
          b.addEventListener("skip", function (d) {
            var e = d.region;
            d.seeking || (qm(a, "timelineregionenter", e), qm(a, "timelineregionexit", e));
          });
          var c = new Qj(a.g);
          c.g.add(b);
          a.ka && c.g.add(a.ka);
          return c;
        }
        function Hm(a, b) {
          a.M = new De();
          a.M.g = Fe;
          Ge(a.M, b, Math.min(.5, b / 2));
          nm(a);
          a.Wc = new P(function () {
            Wm(a);
          }).Ca(.25);
        }
        function Wm(a) {
          switch (a.l) {
            case Qm:
              if (a.g.ended) var b = !0;else {
                var c = ui(a.g.buffered);
                b = null != c && c >= a.g.duration - 1;
              }
              break;
            case Dm:
              a: if (a.g.ended || Si(a.G)) b = !0;else {
                if (a.i.presentationTimeline.T()) {
                  c = a.i.presentationTimeline.gb();
                  var d = ui(a.g.buffered);
                  if (null != d && d >= c) {
                    b = !0;
                    break a;
                  }
                }
                b = !1;
              }
              break;
            default:
              b = !1;
          }
          d = wi(a.g.buffered, a.g.currentTime);
          c = a.M;
          var e = b,
            f = c.h.get(c.g);
          b = c.g;
          d = e || d >= f ? Ee : Fe;
          c.g = d;
          b != d && nm(a);
        }
        function om(a, b, c, d) {
          return new Mi(a, b, c, d);
        }
        function km(a) {
          return new cl({
            getBandwidthEstimate: function () {
              return a.s ? a.s.getBandwidthEstimate() : NaN;
            },
            Ma: function () {
              return a.Ma();
            },
            getCurrentTime: function () {
              return a.g ? a.g.currentTime : 0;
            },
            Ya: function () {
              return a.Ya();
            },
            Sc: function () {
              return a.Sc();
            },
            T: function () {
              return a.T();
            }
          }, a.h.cmcd);
        }
        function Cm(a) {
          return new dk(a.i, {
            Tc: function () {
              return a.A ? a.A.Jc() : 0;
            },
            getBandwidthEstimate: function () {
              return a.s.getBandwidthEstimate();
            },
            modifySegmentRequest: function (b, c) {
              dl(a.V, b, c);
            },
            N: a.G,
            lb: a.D,
            onError: function (b) {
              return mm(a, b);
            },
            onEvent: function (b) {
              return a.dispatchEvent(b);
            },
            ig: function () {
              a.J && a.J.update && a.J.update();
            },
            Yd: function (b, c, d) {
              a.A && a.A.Pe();
              Wm(a);
              b = new Map().set("start", b).set("end", c).set("contentType", d);
              a.dispatchEvent(bm("segmentappended", b));
            },
            hg: function (b, c) {
              (c = c.Qd) && a.ka && Uj(a.ka, c, b);
            },
            ye: function (b, c) {
              var d = a.m;
              if (d.h.parseInbandPsshEnabled && !d.J && ["audio", "video"].includes(b)) {
                c = new If(L(c));
                var e = 0,
                  f = t(c.data);
                for (b = f.next(); !b.done; b = f.next()) e += b.value.length;
                if (0 == e) d = Promise.resolve();else {
                  e = new Uint8Array(e);
                  f = 0;
                  c = t(c.data);
                  for (b = c.next(); !b.done; b = c.next()) b = b.value, e.set(b, f), f += b.length;
                  ug(d, "cenc", e);
                  d = d.o;
                }
              } else d = Promise.resolve();
              return d;
            },
            jg: function (b, c, d) {
              pm(a, b, c, d);
            }
          });
        }
        r.configure = function (a, b) {
          2 == arguments.length && "string" == typeof a && (a = yl(a, b));
          a.streaming && "forceTransmuxTS" in a.streaming && (qe("streaming.forceTransmuxTS configuration", "Please Use streaming.forceTransmux instead."), a.streaming.forceTransmux = a.streaming.forceTransmuxTS, delete a.streaming.forceTransmuxTS);
          a.streaming && a.streaming.lowLatencyMode && (void 0 == a.streaming.inaccurateManifestTolerance && (a.streaming.inaccurateManifestTolerance = 0), void 0 == a.streaming.rebufferingGoal && (a.streaming.rebufferingGoal = .01));
          var c = Gl(this.h, a, Pl(this));
          Xm(this);
          return c;
        };
        function Xm(a) {
          if (a.J) {
            var b = Ue(a.h.manifest);
            a.g && "AUDIO" === a.g.nodeName && (b.disableVideo = !0);
            a.J.configure(b);
          }
          a.m && a.m.configure(a.h.drm);
          if (a.j) {
            a.j.configure(a.h.streaming);
            try {
              Ym(a, a.i);
            } catch (f) {
              mm(a, f);
            }
            a.s && Om(a);
            b = a.j.l;
            !b || b.allowedByApplication && b.allowedByKeySystem || Zm(a);
          }
          a.D && a.D.le(a.h.streaming.forceHTTPS);
          if (a.G && (a.G.configure(a.h.mediaSource), a.G.H = a.h.manifest.segmentRelativeVttTiming, b = a.h.textDisplayFactory, a.Wd != b)) {
            var c = b(),
              d = a.G,
              e = d.m;
            d.m = c;
            e && (c.setTextVisibility(e.isTextVisible()), e.destroy());
            d.g && (d.g.j = c);
            a.Wd = b;
            a.j && (b = a.j, (c = b.j.get(ic)) && nk(b, c.stream, !0, 0, !0));
          }
          a.s && (a.s.configure(a.h.abr), a.h.abr.enabled ? a.s.enable() : a.s.disable(), Lm(a));
          a.M && (b = a.h.streaming.rebufferingGoal, a.i && (b = Math.max(b, a.i.minBufferTime)), Ge(a.M, b, Math.min(.5, b / 2)));
          a.i && Am(a.i.presentationTimeline, a.h.playRangeStart, a.h.playRangeEnd);
        }
        r.getConfiguration = function () {
          var a = Pl(this);
          Gl(a, this.h, Pl(this));
          return a;
        };
        r.Cf = function () {
          if (this.g) {
            var a = this.g.buffered.length;
            a = a ? this.g.buffered.end(a - 1) : 0;
            var b = this.getConfiguration().streaming.bufferingGoal;
            b = Math.min(this.g.currentTime + b, this.vc().end);
            if (a >= b) return 1;
            if (!(a <= this.g.currentTime) && a < b) return (a - this.g.currentTime) / (b - this.g.currentTime);
          }
          return 0;
        };
        r.tg = function () {
          for (var a in this.h) delete this.h[a];
          Gl(this.h, Pl(this), Pl(this));
          Xm(this);
        };
        r.If = function () {
          return this.l;
        };
        r.Mf = function () {
          return this.g;
        };
        r.kc = function () {
          return this.D;
        };
        r.Fd = function () {
          return this.Ob;
        };
        r.He = function () {
          return this.F ? this.F : null;
        };
        r.T = function () {
          return this.i ? this.i.presentationTimeline.T() : this.g && this.g.src ? Infinity == this.g.duration : !1;
        };
        r.jb = function () {
          return this.i ? this.i.presentationTimeline.jb() : !1;
        };
        r.$f = function () {
          if (this.i) {
            var a = this.i.variants;
            return a.length ? !a[0].video : !1;
          }
          return this.g && this.g.src ? this.g.videoTracks ? 0 == this.g.videoTracks.length : 0 == this.g.videoHeight : !1;
        };
        r.vc = function () {
          if (!this.ec) return {
            start: 0,
            end: 0
          };
          if (this.i) {
            var a = this.i.presentationTimeline;
            return {
              start: a.Eb(),
              end: a.Na()
            };
          }
          return this.g && this.g.src && (a = this.g.seekable, a.length) ? {
            start: a.start(0),
            end: a.end(a.length - 1)
          } : {
            start: 0,
            end: 0
          };
        };
        r.Yf = function () {
          this.T() && (this.g.currentTime = this.vc().end);
        };
        r.keySystem = function () {
          var a = this.drmInfo();
          return a ? a.keySystem : "";
        };
        r.drmInfo = function () {
          return this.m ? this.m.g : null;
        };
        r.jc = function () {
          return this.m ? this.m.jc() : Infinity;
        };
        r.Rc = function () {
          return this.m ? this.m.Rc() : {};
        };
        r.Hd = function () {
          return this.M ? this.M.g == Fe : !1;
        };
        r.Sc = function () {
          return this.g ? this.H ? this.H.i : 1 : 0;
        };
        r.Cg = function (a) {
          0 == a ? Xa("A trick play rate of 0 is unsupported!") : (this.g.paused && this.g.play(), this.H.set(a), this.l == Dm && (this.s.playbackRateChanged(a), mk(this.j, 1 < Math.abs(a))));
        };
        r.qf = function () {
          var a = this.H.Qc();
          this.l == Qm && this.H.set(a);
          this.l == Dm && (this.H.set(a), this.s.playbackRateChanged(a), mk(this.j, !1));
        };
        r.Ya = function () {
          if (this.i) {
            for (var a = this.j ? this.j.l : null, b = [], c = 0, d = t(this.i.variants), e = d.next(); !e.done; e = d.next()) if (e = e.value, ge(e)) {
              var f = Zd(e);
              f.active = e == a;
              f.active || 1 == c || null == a || e.video != a.video || e.audio != a.audio || (f.active = !0);
              f.active && c++;
              b.push(f);
            }
            return b;
          }
          return this.g && this.g.audioTracks ? Array.from(this.g.audioTracks).map(function (g) {
            return fe(g);
          }) : [];
        };
        r.Gb = function () {
          if (this.i) {
            for (var a = this.j ? this.j.o : null, b = [], c = t(this.i.textStreams), d = c.next(); !d.done; d = c.next()) {
              d = d.value;
              var e = $d(d);
              e.active = d == a;
              b.push(e);
            }
            return b;
          }
          return this.g && this.g.src && this.g.textTracks ? Sm(this).map(function (f) {
            return de(f);
          }) : [];
        };
        r.Gf = function () {
          return this.i ? this.i.imageStreams.map(function (a) {
            return ae(a);
          }) : [];
        };
        r.Uf = function (a, b) {
          var c = this,
            d,
            e,
            f,
            g,
            h,
            k,
            l,
            m,
            p,
            n,
            q,
            v,
            y,
            w,
            x,
            D,
            z,
            B,
            E,
            F;
          return G(function (H) {
            if (1 == H.g) return c.i ? (d = c.i.imageStreams.find(function (I) {
              return I.id == a;
            })) ? d.segmentIndex ? H.B(3) : u(H, d.createSegmentIndex(), 3) : H.return(null) : H.B(2);
            if (2 != H.g) {
              e = d.segmentIndex.find(b);
              if (null == e) return H.return(null);
              f = d.segmentIndex.get(e);
              g = f.tilesLayout || d.tilesLayout;
              h = /(\d+)x(\d+)/.exec(g);
              if (!h) return H.return(null);
              k = d.width || 0;
              l = d.height || 0;
              m = parseInt(h[1], 10);
              p = parseInt(h[2], 10);
              n = k / m;
              q = l / p;
              v = m * p;
              y = f.l - f.startTime;
              w = f.s || y / v;
              x = f.startTime;
              z = D = 0;
              1 < v && (B = Math.floor((b - f.startTime) / w), x = f.startTime + B * w, D = B % m * n, z = Math.floor(B / m) * q);
              E = !1;
              if (F = f.o) E = !0, q = F.height, D = F.positionX, z = F.positionY, n = F.width;
              return H.return({
                imageHeight: l,
                imageWidth: k,
                height: q,
                positionX: D,
                positionY: z,
                startTime: x,
                duration: w,
                uris: f.ya(),
                width: n,
                sprite: E
              });
            }
            return H.return(null);
          });
        };
        r.Te = function (a) {
          if (this.i && this.j) {
            var b = this.i.textStreams.find(function (d) {
              return d.id == a.id;
            });
            b && b != this.j.o && (Ml(this.o.h, b, !1), pk(this.j, b), $m(this), this.wb = b.language);
          } else if (this.g && this.g.src && this.g.textTracks) {
            b = Sm(this);
            b = t(b);
            for (var c = b.next(); !c.done; c = b.next()) c = c.value, be(c) == a.id ? c.mode = this.ca ? "showing" : "hidden" : c.mode = "disabled";
            $m(this);
          }
        };
        r.Ue = function (a, b, c) {
          b = void 0 === b ? !1 : b;
          c = void 0 === c ? 0 : c;
          if (this.i && this.j) {
            this.h.abr.enabled && Xa("Changing tracks while abr manager is enabled will likely result in the selected track being overriden. Consider disabling abr before calling selectVariantTrack().");
            var d = this.i.variants.find(function (e) {
              return e.id == a.id;
            });
            d && ge(d) && (Bm(this, d, !1, b, c), this.vb = new ye(d), Om(this));
          } else if (this.g && this.g.audioTracks) for (b = Array.from(this.g.audioTracks), b = t(b), c = b.next(); !c.done; c = b.next()) if (c = c.value, be(c) == a.id) {
            an(this, c);
            break;
          }
        };
        r.Bf = function () {
          return bn(this.Ya());
        };
        r.Sf = function () {
          return bn(this.Gb());
        };
        r.Af = function () {
          return Array.from(cn(this.Ya()));
        };
        r.Rf = function () {
          return Array.from(cn(this.Gb()));
        };
        r.ie = function (a, b, c) {
          c = void 0 === c ? 0 : c;
          if (this.i && this.A) {
            this.vb = new ze(a, b || "", c, "");
            b = function (h, k) {
              return h.video || k.video ? h.video && k.video ? Math.abs((h.video.height || 0) - (k.video.height || 0)) + Math.abs((h.video.width || 0) - (k.video.width || 0)) : Infinity : 0;
            };
            a = this.j.l;
            var d = this.vb.create(this.i.variants);
            c = null;
            d = t(d.values());
            for (var e = d.next(); !e.done; e = d.next()) if (e = e.value, !c || b(c, a) > b(e, a)) c = e;
            c ? (b = Zd(c), this.Ue(b, !0)) : Zm(this);
          } else if (this.g && this.g.audioTracks) {
            e = Array.from(this.g.audioTracks);
            a = nd(a);
            d = c = null;
            e = t(e);
            for (var f = e.next(); !f.done; f = e.next()) {
              f = f.value;
              var g = fe(f);
              nd(g.language) == a && (c = f, b ? g.roles.includes(b) && (d = f) : 0 == g.roles.length && (d = f));
            }
            d ? an(this, d) : c && an(this, c);
          }
        };
        r.je = function (a, b, c) {
          c = void 0 === c ? !1 : c;
          if (this.i && this.A) {
            if (this.wb = a, this.dc = b || "", this.ac = c, (a = ie(this.i.textStreams, this.wb, this.dc, this.ac)[0] || null) && a != this.j.o && (Ml(this.o.h, a, !1), this.h.streaming.alwaysStreamText || this.Jd())) pk(this.j, a), $m(this);
          } else {
            var d = nd(a);
            (a = this.Gb().find(function (e) {
              return nd(e.language) == d && (!b || e.roles.includes(b)) && e.forced == c;
            })) && this.Te(a);
          }
        };
        r.vg = function (a) {
          if (this.i && this.A) {
            for (var b = null, c = t(this.i.variants), d = c.next(); !d.done; d = c.next()) if (d = d.value, d.audio.label == a) {
              b = d;
              break;
            }
            null != b && (this.vb = new ze(b.language, "", 0, a), Zm(this));
          } else if (this.g && this.g.audioTracks) {
            c = Array.from(this.g.audioTracks);
            b = null;
            c = t(c);
            for (d = c.next(); !d.done; d = c.next()) d = d.value, d.label == a && (b = d);
            b && an(this, b);
          }
        };
        r.Jd = function () {
          var a = this.ca;
          return this.G ? this.G.m.isTextVisible() : this.g && this.g.src && this.g.textTracks ? Sm(this).some(function (b) {
            return "showing" == b.mode;
          }) : a;
        };
        r.Ie = function () {
          return this.g && this.g.src && this.g.textTracks ? dn(this).map(function (a) {
            return de(a);
          }) : [];
        };
        r.Df = function (a) {
          var b = nd(a),
            c = dn(this).filter(function (h) {
              return nd(h.language) == b;
            });
          if (!c || !c.length) return [];
          a = [];
          var d = new Set();
          c = t(c);
          for (var e = c.next(); !e.done; e = c.next()) if ((e = e.value) && e.cues) {
            e = t(e.cues);
            for (var f = e.next(); !f.done; f = e.next()) {
              var g = f.value;
              (f = g.id) && "" != f || (f = g.startTime + "-" + g.endTime + "-" + g.text);
              g = {
                id: f,
                title: g.text,
                startTime: g.startTime,
                endTime: g.endTime
              };
              d.has(f) || (a.push(g), d.add(f));
            }
          }
          return a;
        };
        function Sm(a) {
          return Array.from(a.g.textTracks).filter(function (b) {
            return "metadata" != b.kind && "chapters" != b.kind && "Shaka Player TextTrack" != b.label;
          });
        }
        function Vm(a) {
          return Array.from(a.g.textTracks).filter(function (b) {
            return "metadata" == b.kind;
          });
        }
        function dn(a) {
          return Array.from(a.g.textTracks).filter(function (b) {
            return "chapters" == b.kind;
          });
        }
        r.Ag = function (a) {
          a = !!a;
          if (this.ca != a) {
            this.ca = a;
            if (this.l == Dm) this.G.m.setTextVisibility(a), this.h.streaming.alwaysStreamText || (a ? this.j.o || (a = ie(this.i.textStreams, this.wb, this.dc, this.ac), 0 < a.length && (pk(this.j, a[0]), $m(this))) : lk(this.j));else if (this.g && this.g.src && this.g.textTracks) {
              var b = Sm(this);
              b = t(b);
              for (var c = b.next(); !c.done; c = b.next()) c = c.value, "disabled" != c.mode && (c.mode = a ? "showing" : "hidden");
            }
            Km(this);
          }
        };
        r.Pf = function () {
          if (!this.T()) return null;
          var a = this.Ga.l,
            b = 0;
          if (this.A) b = this.A.Jc();else if (a) {
            if (null == a.startTime) return new Date();
            b = a.startTime;
          }
          return this.i ? new Date(1E3 * (this.i.presentationTimeline.i + b)) : this.g && this.g.getStartDate ? (a = this.g.getStartDate(), isNaN(a.getTime()) ? null : new Date(a.getTime() + 1E3 * b)) : null;
        };
        r.Je = function () {
          if (!this.T()) return null;
          if (this.i) return new Date(1E3 * this.i.presentationTimeline.i);
          if (this.g && this.g.getStartDate) {
            var a = this.g.getStartDate();
            return isNaN(a.getTime()) ? null : a;
          }
          return null;
        };
        r.Ma = function () {
          if (this.l == Dm) return this.G.Ma();
          var a = {
            total: [],
            audio: [],
            video: [],
            text: []
          };
          this.l == Qm && (a.total = xi(this.g.buffered));
          return a;
        };
        r.getStats = function () {
          if (this.l != Dm && this.l != Qm) return {
            width: NaN,
            height: NaN,
            streamBandwidth: NaN,
            decodedFrames: NaN,
            droppedFrames: NaN,
            corruptedFrames: NaN,
            stallsDetected: NaN,
            gapsJumped: NaN,
            estimatedBandwidth: NaN,
            completionPercent: NaN,
            loadLatency: NaN,
            manifestTimeSeconds: NaN,
            drmTimeSeconds: NaN,
            playTime: NaN,
            pauseTime: NaN,
            bufferingTime: NaN,
            licenseTime: NaN,
            liveLatency: NaN,
            maxSegmentDuration: NaN,
            switchHistory: [],
            stateHistory: []
          };
          ym(this);
          var a = this.g,
            b = a.currentTime / a.duration;
          if (!isNaN(b)) {
            var c = this.o;
            b = Math.round(100 * b);
            c.i = isNaN(c.i) ? b : Math.max(c.i, b);
          }
          this.A && (this.o.M = this.A.ue(), this.o.P = this.A.ve());
          if (a.getVideoPlaybackQuality) {
            c = a.getVideoPlaybackQuality();
            b = this.o;
            var d = Number(c.totalVideoFrames);
            b.L = Number(c.droppedVideoFrames);
            b.J = d;
            this.o.H = Number(c.corruptedVideoFrames);
          }
          this.m ? (c = this.m, c = c.H ? c.H : NaN) : c = NaN;
          this.o.s = c;
          if (this.l == Dm) {
            if (c = this.j.l) this.o.A = (this.H ? this.H.i : 1) * c.bandwidth;
            c && c.video && (b = this.o, d = c.video.height || NaN, b.o = c.video.width || NaN, b.l = d);
            this.T() && (c = this.Je().valueOf() + 1E3 * this.vc().end, this.o.D = (Date.now() - c) / 1E3);
            this.i && this.i.presentationTimeline && (this.o.G = this.i.presentationTimeline.g);
            c = this.s.getBandwidthEstimate();
            this.o.u = c;
          }
          this.l == Qm && (c = this.o, b = a.videoHeight || NaN, c.o = a.videoWidth || NaN, c.l = b);
          var e = this.o;
          a = e.o;
          c = e.l;
          b = e.A;
          d = e.J;
          var f = e.L,
            g = e.H,
            h = e.P,
            k = e.M,
            l = e.u,
            m = e.i,
            p = e.m,
            n = e.F,
            q = e.j,
            v = Jl(e.g, "playing"),
            y = Jl(e.g, "paused"),
            w = Jl(e.g, "buffering"),
            x = e.s,
            D = e.D,
            z = e.G,
            B = Kl(e.g),
            E = [];
          e = t(e.h.g);
          for (var F = e.next(); !F.done; F = e.next()) F = F.value, E.push({
            timestamp: F.timestamp,
            id: F.id,
            type: F.type,
            fromAdaptation: F.fromAdaptation,
            bandwidth: F.bandwidth
          });
          return {
            width: a,
            height: c,
            streamBandwidth: b,
            decodedFrames: d,
            droppedFrames: f,
            corruptedFrames: g,
            stallsDetected: h,
            gapsJumped: k,
            estimatedBandwidth: l,
            completionPercent: m,
            loadLatency: p,
            manifestTimeSeconds: n,
            drmTimeSeconds: q,
            playTime: v,
            pauseTime: y,
            bufferingTime: w,
            licenseTime: x,
            liveLatency: D,
            maxSegmentDuration: z,
            stateHistory: B,
            switchHistory: E
          };
        };
        r.jf = function (a, b, c, d, e, f, g) {
          g = void 0 === g ? !1 : g;
          var h = this,
            k,
            l,
            m,
            p,
            n,
            q,
            v,
            y,
            w,
            x,
            D;
          return G(function (z) {
            switch (z.g) {
              case 1:
                if (h.l != Dm && h.l != Qm) throw new O(1, 7, 7004);
                if (d) {
                  z.B(2);
                  break;
                }
                return u(z, en(h, a), 3);
              case 3:
                d = z.h;
              case 2:
                k = [];
                if (h.F) try {
                  k = h.F.getServerSideCuePoints();
                } catch (B) {}
                if (h.l != Qm) {
                  z.B(4);
                  break;
                }
                g && (c = "forced");
                return u(z, fn(h, a, b, c, d, f || "", k), 5);
              case 5:
                l = h.Gb();
                if (m = l.find(function (B) {
                  return B.language == b && B.label == (f || "") && B.kind == c;
                })) return Nm(h), z.return(m);
                throw new O(1, 2, 2012);
              case 4:
                p = jc;
                n = h.i.presentationTimeline.getDuration();
                if (Infinity == n) throw new O(1, 4, 4033);
                if (!k.length) {
                  z.B(6);
                  break;
                }
                return u(z, gn(h, a, h.D, h.h.streaming.retryParameters), 7);
              case 7:
                q = z.h, v = hn(h, q, d, k), y = new Blob([v], {
                  type: "text/vtt"
                }), a = Pi(y), d = "text/vtt";
              case 6:
                w = {
                  id: h.$d++,
                  originalId: null,
                  createSegmentIndex: function () {
                    return Promise.resolve();
                  },
                  segmentIndex: Mj(0, n, [a]),
                  mimeType: d || "",
                  codecs: e || "",
                  kind: c,
                  encrypted: !1,
                  drmInfos: [],
                  keyIds: new Set(),
                  language: b,
                  label: f || null,
                  type: p.X,
                  primary: !1,
                  trickModeVideo: null,
                  emsgSchemeIdUris: null,
                  roles: [],
                  forced: !!g,
                  channelsCount: null,
                  audioSamplingRate: null,
                  spatialAudio: !1,
                  closedCaptions: null,
                  external: !0
                };
                x = Yc(w.mimeType, w.codecs);
                D = dd(x);
                if (!D) throw new O(2, 2, 2014, d);
                h.i.textStreams.push(w);
                Nm(h);
                return z.return($d(w));
            }
          });
        };
        r.kf = function (a, b) {
          var c = this,
            d,
            e,
            f,
            g,
            h,
            k,
            l,
            m,
            p,
            n,
            q,
            v,
            y,
            w,
            x,
            D;
          return G(function (z) {
            switch (z.g) {
              case 1:
                if (c.l != Dm && c.l != Qm) throw new O(1, 7, 7004);
                if (c.l == Qm) throw new O(1, 2, 2016);
                if (b) {
                  z.B(2);
                  break;
                }
                return u(z, en(c, a), 3);
              case 3:
                b = z.h;
              case 2:
                if ("text/vtt" != b) throw new O(1, 2, 2017, a);
                d = jc;
                e = c.i.presentationTimeline.getDuration();
                if (Infinity == e) throw new O(1, 4, 4045);
                return u(z, gn(c, a, c.D, c.h.streaming.retryParameters), 4);
              case 4:
                f = z.h;
                g = ed[b];
                if (!g) throw new O(2, 2, 2014, b);
                h = g();
                k = {
                  periodStart: 0,
                  segmentStart: 0,
                  segmentEnd: e,
                  vttOffset: 0
                };
                l = L(f);
                m = h.parseMedia(l, k);
                p = [];
                n = {};
                q = t(m);
                for (v = q.next(); !v.done; n = {
                  Sb: n.Sb
                }, v = q.next()) y = v.value, n.Sb = dc([a], [y.payload])[0], w = new T(y.startTime, y.endTime, function (B) {
                  return function () {
                    return [B.Sb];
                  };
                }(n), 0, null, null, 0, 0, Infinity), n.Sb.includes("#xywh") && (x = n.Sb.split("#xywh=")[1].split(","), 4 === x.length && w.Ze({
                  height: parseInt(x[3], 10),
                  positionX: parseInt(x[0], 10),
                  positionY: parseInt(x[1], 10),
                  width: parseInt(x[2], 10)
                })), p.push(w);
                D = {
                  id: c.$d++,
                  originalId: null,
                  createSegmentIndex: function () {
                    return Promise.resolve();
                  },
                  segmentIndex: new Jj(p),
                  mimeType: b || "",
                  codecs: "",
                  kind: "",
                  encrypted: !1,
                  drmInfos: [],
                  keyIds: new Set(),
                  language: "und",
                  label: null,
                  type: d.Xb,
                  primary: !1,
                  trickModeVideo: null,
                  emsgSchemeIdUris: null,
                  roles: [],
                  forced: !1,
                  channelsCount: null,
                  audioSamplingRate: null,
                  spatialAudio: !1,
                  closedCaptions: null,
                  tilesLayout: "1x1",
                  external: !0
                };
                c.i.imageStreams.push(D);
                Nm(c);
                return z.return(ae(D));
            }
          });
        };
        r.hf = function (a, b, c) {
          var d = this,
            e,
            f,
            g,
            h;
          return G(function (k) {
            switch (k.g) {
              case 1:
                if (d.l != Dm && d.l != Qm) throw new O(1, 7, 7004);
                if (c) {
                  k.B(2);
                  break;
                }
                return u(k, en(d, a), 3);
              case 3:
                c = k.h;
              case 2:
                e = [];
                if (d.F) try {
                  e = d.F.getServerSideCuePoints();
                } catch (l) {}
                return u(k, fn(d, a, b, "chapters", c, "", e), 4);
              case 4:
                f = k.h;
                g = d.Ie();
                h = g.find(function (l) {
                  return l.language == b;
                });
                if (!h) {
                  k.B(5);
                  break;
                }
                return u(k, new Promise(function (l, m) {
                  d.u.ia(f, "load", l);
                  d.u.ia(f, "error", function () {
                    m(new O(1, 2, 2015));
                  });
                }), 6);
              case 6:
                return k.return(h);
              case 5:
                throw new O(1, 2, 2012);
            }
          });
        };
        function en(a, b) {
          var c, d;
          return G(function (e) {
            switch (e.g) {
              case 1:
                c = Tg(b);
                if (d = jn[c]) return e.return(d);
                C(e, 2);
                return u(e, Vg(b, a.D, a.h.streaming.retryParameters), 4);
              case 4:
                d = e.h;
                va(e, 3);
                break;
              case 2:
                wa(e);
              case 3:
                if (d) return e.return(d);
                throw new O(1, 2, 2011, c);
            }
          });
        }
        function fn(a, b, c, d, e, f, g) {
          var h, k, l, m;
          return G(function (p) {
            if (1 == p.g) return "text/vtt" != e || g.length ? u(p, gn(a, b, a.D, a.h.streaming.retryParameters), 3) : p.B(2);
            2 != p.g && (h = p.h, k = hn(a, h, e, g), l = new Blob([k], {
              type: "text/vtt"
            }), b = Pi(l), e = "text/vtt");
            m = document.createElement("track");
            var n = a.V,
              q = b;
            try {
              if (n.g.enabled) {
                var v = pl(n);
                v.ot = vl;
                v.su = !0;
                var y = rl(v);
                var w = sl(q, y);
              } else w = q;
            } catch (x) {
              Ya("CMCD_TEXT_TRACK_ERROR", "Could not generate text track CMCD data.", x), w = q;
            }
            m.src = w;
            m.label = f;
            m.kind = d;
            m.srclang = c;
            a.g.getAttribute("crossorigin") || a.g.setAttribute("crossorigin", "anonymous");
            a.g.appendChild(m);
            return p.return(m);
          });
        }
        function gn(a, b, c, d) {
          var e, f, g;
          return G(function (h) {
            if (1 == h.g) {
              e = hf;
              f = bf([b], d);
              f.method = "GET";
              var k = a.V;
              try {
                k.g.enabled && nl(k, f, {
                  ot: vl,
                  su: !0
                });
              } catch (l) {
                Ya("CMCD_TEXT_ERROR", "Could not generate text CMCD data.", l);
              }
              return u(h, c.request(e, f).promise, 2);
            }
            g = h.h;
            return h.return(g.data);
          });
        }
        function hn(a, b, c, d) {
          var e = ed[c];
          if (e) return c = e(), a = {
            periodStart: 0,
            segmentStart: 0,
            segmentEnd: a.g.duration,
            vttOffset: 0
          }, b = L(b), b = c.parseMedia(b, a), bl(b, d);
          throw new O(2, 2, 2014, c);
        }
        r.me = function (a, b) {
          this.fc.width = a;
          this.fc.height = b;
        };
        r.ee = function (a) {
          if (this.l == Dm) {
            var b = this.j;
            a = void 0 === a ? .1 : a;
            if (b.h.g) b = !1;else if (b.s) b = !1;else {
              for (var c = t(b.j.values()), d = c.next(); !d.done; d = c.next()) d = d.value, !d.oc || d.sa || d.Ka || (d.oc = !1, kk(b, d, a));
              b = !0;
            }
          } else b = !1;
          return b;
        };
        r.Jf = function () {
          Xa("Shaka Player's internal Manifest structure is NOT covered by semantic versioning compatibility guarantees.  It may change at any time!  Please consider filing a feature request for whatever you use getManifest() for.");
          return this.i;
        };
        r.Kf = function () {
          return this.Zc;
        };
        function Pl(a) {
          var b = El();
          b.streaming.failureCallback = function (c) {
            if (a.T()) {
              var d = null;
              1001 == c.code || 1002 == c.code ? d = 1 : 1003 == c.code && (d = .1);
              null != d && (c.severity = 1, a.ee(d));
            }
          };
          b.textDisplayFactory = function () {
            return a.Vc ? new Uk(a.g, a.Vc) : new Pk(a.g);
          };
          return b;
        }
        r.af = function (a) {
          this.Vc = a;
        };
        function sm(a, b) {
          for (var c = new Set(), d = t(b.textStreams), e = d.next(); !e.done; e = d.next()) e = e.value, "application/cea-608" != e.mimeType && "application/cea-708" != e.mimeType || c.add(e.originalId);
          d = t(b.variants);
          for (e = d.next(); !e.done; e = d.next()) if ((e = e.value.video) && e.closedCaptions) for (var f = t(e.closedCaptions.keys()), g = f.next(); !g.done; g = f.next()) if (g = g.value, !c.has(g)) {
            var h = g.startsWith("CC") ? "application/cea-608" : "application/cea-708",
              k = new Nj();
            h = {
              id: a.$d++,
              originalId: g,
              createSegmentIndex: function () {
                return Promise.resolve();
              },
              segmentIndex: k,
              mimeType: h,
              codecs: "",
              kind: "caption",
              encrypted: !1,
              drmInfos: [],
              keyIds: new Set(),
              language: e.closedCaptions.get(g),
              label: null,
              type: ic,
              primary: !1,
              trickModeVideo: null,
              emsgSchemeIdUris: null,
              roles: e.roles,
              forced: !1,
              channelsCount: null,
              audioSamplingRate: null,
              spatialAudio: !1,
              closedCaptions: null,
              external: !1
            };
            b.textStreams.push(h);
            c.add(g);
          }
        }
        function rm(a, b) {
          return G(function (c) {
            if (1 == c.g) return u(c, kn(a, b), 2);
            Ym(a, b);
            A(c);
          });
        }
        function kn(a, b) {
          var c;
          return G(function (d) {
            if (1 == d.g) return c = a.j ? a.j.l : null, u(d, Ld(c, b), 2);
            Mm(b);
            A(d);
          });
        }
        function Ym(a, b) {
          if (a.l != gm) {
            Kd(b.variants, a.h.restrictions, a.fc) && a.j && Nm(a);
            var c = a.m ? a.m.g : null;
            if (c && a.m.u) for (var d = t(b.variants), e = d.next(); !e.done; e = d.next()) e = e.value, tm(a, c.keySystem, e.video), tm(a, c.keySystem, e.audio);
            ln(a, b);
          }
        }
        function tm(a, b, c) {
          if (c) {
            c = t(c.drmInfos);
            for (var d = c.next(); !d.done; d = c.next()) if (d = d.value, d.keySystem == b) {
              d = t(d.initData || []);
              for (var e = d.next(); !e.done; e = d.next()) e = e.value, ug(a.m, e.initDataType, e.initData);
            }
          }
        }
        function Im(a, b) {
          var c, d, e, f, g;
          return G(function (h) {
            if (1 == h.g) return c = a.audio, d = a.video, e = function (k, l) {
              var m, p, n;
              return G(function (q) {
                if (1 == q.g) return k ? u(q, k.createSegmentIndex(), 2) : q.return(null);
                p = (m = k.segmentIndex.Db(l)) ? m.next().value : null;
                if (!p) return q.return(null);
                n = p.startTime;
                return q.return(n);
              });
            }, u(h, e(c, b), 2);
            if (3 != h.g) return f = h.h, u(h, e(d, b), 3);
            g = h.h;
            return null != g && null != f ? h.return(Math.max(g, f)) : null != g ? h.return(g) : null != f ? h.return(f) : h.return(b);
          });
        }
        function nm(a) {
          var b = a.Hd();
          if (a.o && a.M && a.A) {
            var c = a.H;
            c.j = b;
            Pj(c);
            a.V && (c = a.V, b || c.i || (c.i = !0), c.i && b && (c.l = !0), c.m = b);
            ym(a);
          }
          b = new Map().set("buffering", b);
          a.dispatchEvent(bm("buffering", b));
        }
        function zm(a) {
          var b = a.g.playbackRate;
          0 != b && (a.H && a.H.set(b), b = bm("ratechange"), a.dispatchEvent(b));
        }
        function ym(a) {
          if (a.o && a.M) {
            var b = a.o.g;
            a.M.g == Fe ? Il(b, "buffering") : a.g.paused ? Il(b, "paused") : a.g.ended ? Il(b, "ended") : Il(b, "playing");
          }
        }
        function Om(a) {
          try {
            ln(a, a.i);
          } catch (c) {
            return mm(a, c), !1;
          }
          var b = a.i.variants.filter(function (c) {
            return ge(c);
          });
          b = a.vb.create(b);
          a.s.setVariants(Array.from(b.values()));
          return !0;
        }
        function cm(a) {
          return Om(a) ? a.s.chooseVariant() : null;
        }
        function Zm(a) {
          var b = cm(a);
          b && Bm(a, b, !0, !0, 0);
        }
        function Bm(a, b, c, d, e) {
          var f = a.j.l;
          if (b == f) d && ok(a.j, b, d, e, !0);else {
            var g = a.o.h;
            g.h != b && (g.h = b, g.g.push({
              timestamp: Date.now() / 1E3,
              id: b.id,
              type: "variant",
              fromAdaptation: c,
              bandwidth: b.bandwidth
            }));
            ok(a.j, b, d, e, void 0, c);
            d = null;
            f && (d = Zd(f));
            b = Zd(b);
            c ? (c = new Map().set("oldTrack", d).set("newTrack", b), a.L && Ii(a.L, b), c = bm("adaptation", c), mn(a, c)) : nn(a, d, b);
          }
        }
        function an(a, b) {
          var c = Array.from(a.g.audioTracks).find(function (d) {
            return d.enabled;
          });
          b.enabled = !0;
          b.id !== c.id && (c.enabled = !1);
          c = fe(c);
          b = fe(b);
          nn(a, c, b);
        }
        function Jm(a, b, c) {
          if (0 == a.h.autoShowText) return !1;
          if (1 == a.h.autoShowText) return !0;
          var d = nd(a.h.preferredTextLanguage);
          c = nd(c.language);
          if (2 == a.h.autoShowText) return md(c, d);
          if (3 == a.h.autoShowText) return a = nd(b.language), md(c, d) && !md(a, c);
          Xa("Invalid autoShowText setting!");
          return !1;
        }
        function Nm(a) {
          var b = bm("trackschanged");
          mn(a, b);
        }
        function nn(a, b, c) {
          b = new Map().set("oldTrack", b).set("newTrack", c);
          a.L && Ii(a.L, c);
          c = bm("variantchanged", b);
          mn(a, c);
        }
        function $m(a) {
          var b = bm("textchanged");
          mn(a, b);
        }
        function Km(a) {
          var b = bm("texttrackvisibility");
          mn(a, b);
        }
        function Lm(a) {
          var b = new Map().set("newStatus", a.h.abr.enabled);
          mn(a, bm("abrstatuschanged", b));
        }
        function on(a, b) {
          if (1002 != b.code && 1011 != b.code || 1 != b.category || a.l != Dm || !navigator.onLine) return !1;
          var c = a.h.streaming.maxDisabledTime;
          if (0 == c) if (1011 == b.code) c = 1;else return !1;
          b = a.Ya().find(function (g) {
            return g.active;
          });
          for (var d = a.i, e = t(d.variants), f = e.next(); !f.done; f = e.next()) f = f.value, f.id === b.id && (f.disabledUntilTime = Date.now() / 1E3 + c);
          Kd(d.variants, a.h.restrictions, a.fc);
          b = cm(a);
          if (!b) return !1;
          d = a.Ma().video.reduce(function (g, h) {
            return g + h.end - h.start;
          }, 0);
          Bm(a, b, !1, !0, d);
          a.bf.O(c);
          return !0;
        }
        function mm(a, b) {
          if (a.l != gm) if (on(a, b)) b.handled = !0;else {
            var c = bm("error", new Map().set("detail", b));
            a.dispatchEvent(c);
            c.defaultPrevented && (b.handled = !0);
          }
        }
        function qm(a, b, c) {
          c = new Map().set("detail", {
            schemeIdUri: c.schemeIdUri,
            value: c.value,
            startTime: c.startTime,
            endTime: c.endTime,
            id: c.id,
            eventElement: c.eventElement
          });
          a.dispatchEvent(bm(b, c));
        }
        function lm(a) {
          if (!a.g.error) return null;
          var b = a.g.error.code;
          if (1 == b) return null;
          var c = a.g.error.msExtendedCode;
          c && (0 > c && (c += Math.pow(2, 32)), c = c.toString(16));
          return new O(2, 3, 3016, b, c, a.g.error.message);
        }
        function wm(a, b) {
          if (a.j) {
            var c = Object.keys(b),
              d = 1 == c.length && "00" == c[0],
              e = !1;
            if (c.length) {
              c = t(a.i.variants);
              for (var f = c.next(); !f.done; f = c.next()) {
                f = f.value;
                var g = [];
                f.audio && g.push(f.audio);
                f.video && g.push(f.video);
                g = t(g);
                for (var h = g.next(); !h.done; h = g.next()) {
                  var k = h.value;
                  h = f.allowedByKeySystem;
                  if (k.keyIds.size) {
                    f.allowedByKeySystem = !0;
                    k = t(k.keyIds);
                    for (var l = k.next(); !l.done; l = k.next()) l = l.value, l = b[d ? "00" : l], f.allowedByKeySystem = f.allowedByKeySystem && !!l && !pn.includes(l);
                  }
                  h != f.allowedByKeySystem && (e = !0);
                }
              }
            }
            if (!e || Om(a)) (b = a.j.l) && !b.allowedByKeySystem && Zm(a), e && Nm(a);
          }
        }
        function xm(a, b, c) {
          if (a.J && a.J.onExpirationUpdated) a.J.onExpirationUpdated(b, c);
          b = bm("expirationupdated");
          a.dispatchEvent(b);
        }
        function Am(a, b, c) {
          0 < b && (a.T() || a.$e(b));
          b = a.getDuration();
          c < b && (a.T() || a.Aa(c));
        }
        function ln(a, b) {
          a = a.m ? a.m.Rc() : {};
          var c = Object.keys(a);
          c = c.length && "00" == c[0];
          var d = !1,
            e = !1,
            f = new Set(),
            g = new Set();
          b = t(b.variants);
          for (var h = b.next(); !h.done; h = b.next()) {
            h = h.value;
            var k = [];
            h.audio && k.push(h.audio);
            h.video && k.push(h.video);
            k = t(k);
            for (var l = k.next(); !l.done; l = k.next()) if (l = l.value, l.keyIds.size) {
              l = t(l.keyIds);
              for (var m = l.next(); !m.done; m = l.next()) {
                m = m.value;
                var p = a[c ? "00" : m];
                p ? pn.includes(p) && g.add(p) : f.add(m);
              }
            }
            h.allowedByApplication ? h.allowedByKeySystem && (d = !0) : e = !0;
          }
          if (!d) throw a = {
            hasAppRestrictions: e,
            missingKeys: Array.from(f),
            restrictedKeyStatuses: Array.from(g)
          }, new O(2, 4, 4012, a);
        }
        function Mm(a) {
          if (!a.variants.some(ge)) throw new O(2, 4, 4032);
        }
        function mn(a, b) {
          G(function (c) {
            if (1 == c.g) return u(c, Promise.resolve(), 2);
            a.l != gm && a.dispatchEvent(b);
            A(c);
          });
        }
        function cn(a) {
          var b = new Set();
          a = t(a);
          for (var c = a.next(); !c.done; c = a.next()) c = c.value, c.language ? b.add(nd(c.language)) : b.add("und");
          return b;
        }
        function bn(a) {
          var b = new Map(),
            c = new Map();
          a = t(a);
          for (var d = a.next(); !d.done; d = a.next()) {
            d = d.value;
            var e = "und",
              f = [];
            d.language && (e = nd(d.language));
            "variant" == d.type ? f = d.audioRoles : f = d.roles;
            f && f.length || (f = [""]);
            b.has(e) || b.set(e, new Set());
            f = t(f);
            for (var g = f.next(); !g.done; g = f.next()) g = g.value, b.get(e).add(g), d.label && (c.has(e) || c.set(e, new Map()), c.get(e).set(g, d.label));
          }
          var h = [];
          b.forEach(function (k, l) {
            k = t(k);
            for (var m = k.next(); !m.done; m = k.next()) {
              m = m.value;
              var p = null;
              c.has(l) && c.get(l).has(m) && (p = c.get(l).get(m));
              h.push({
                language: l,
                role: m,
                label: p
              });
            }
          });
          return h;
        }
        function hm() {
          return new O(2, 7, 7E3);
        }
        function am(a, b, c, d, e, f) {
          return d == a && e.mediaElement == f.mediaElement && e.uri == f.uri && e.mimeType == f.mimeType ? b : c;
        }
        function Hk() {
          return {
            mediaElement: null,
            mimeType: null,
            startTime: null,
            gd: NaN,
            uri: null
          };
        }
        function im(a) {
          return new Promise(function (b, c) {
            a.nb = function () {
              return c(hm());
            };
            a.cd = function () {
              return b();
            };
            a.onError = function (d) {
              return c(d);
            };
            a.ed = function () {
              return c(hm());
            };
          });
        }
        K("shaka.Player", V);
        V.prototype.setVideoContainer = V.prototype.af;
        V.prototype.getManifestParserFactory = V.prototype.Kf;
        V.prototype.getManifest = V.prototype.Jf;
        V.prototype.retryStreaming = V.prototype.ee;
        V.prototype.setMaxHardwareResolution = V.prototype.me;
        V.prototype.addChaptersTrack = V.prototype.hf;
        V.prototype.addThumbnailsTrack = V.prototype.kf;
        V.prototype.addTextTrackAsync = V.prototype.jf;
        V.prototype.getStats = V.prototype.getStats;
        V.prototype.getBufferedInfo = V.prototype.Ma;
        V.prototype.getPresentationStartTimeAsDate = V.prototype.Je;
        V.prototype.getPlayheadTimeAsDate = V.prototype.Pf;
        V.prototype.setTextTrackVisibility = V.prototype.Ag;
        V.prototype.getChapters = V.prototype.Df;
        V.prototype.getChaptersTracks = V.prototype.Ie;
        V.prototype.isTextTrackVisible = V.prototype.Jd;
        V.prototype.selectVariantsByLabel = V.prototype.vg;
        V.prototype.selectTextLanguage = V.prototype.je;
        V.prototype.selectAudioLanguage = V.prototype.ie;
        V.prototype.getTextLanguages = V.prototype.Rf;
        V.prototype.getAudioLanguages = V.prototype.Af;
        V.prototype.getTextLanguagesAndRoles = V.prototype.Sf;
        V.prototype.getAudioLanguagesAndRoles = V.prototype.Bf;
        V.prototype.selectVariantTrack = V.prototype.Ue;
        V.prototype.selectTextTrack = V.prototype.Te;
        V.prototype.getThumbnails = V.prototype.Uf;
        V.prototype.getImageTracks = V.prototype.Gf;
        V.prototype.getTextTracks = V.prototype.Gb;
        V.prototype.getVariantTracks = V.prototype.Ya;
        V.prototype.cancelTrickPlay = V.prototype.qf;
        V.prototype.trickPlay = V.prototype.Cg;
        V.prototype.getPlaybackRate = V.prototype.Sc;
        V.prototype.isBuffering = V.prototype.Hd;
        V.prototype.getKeyStatuses = V.prototype.Rc;
        V.prototype.getExpiration = V.prototype.jc;
        V.prototype.drmInfo = V.prototype.drmInfo;
        V.prototype.keySystem = V.prototype.keySystem;
        V.prototype.goToLive = V.prototype.Yf;
        V.prototype.seekRange = V.prototype.vc;
        V.prototype.isAudioOnly = V.prototype.$f;
        V.prototype.isInProgress = V.prototype.jb;
        V.prototype.isLive = V.prototype.T;
        V.prototype.getAdManager = V.prototype.He;
        V.prototype.getAssetUri = V.prototype.Fd;
        V.prototype.getNetworkingEngine = V.prototype.kc;
        V.prototype.getMediaElement = V.prototype.Mf;
        V.prototype.getLoadMode = V.prototype.If;
        V.prototype.resetConfiguration = V.prototype.tg;
        V.prototype.getBufferFullness = V.prototype.Cf;
        V.prototype.getConfiguration = V.prototype.getConfiguration;
        V.prototype.configure = V.prototype.configure;
        V.prototype.load = V.prototype.load;
        V.prototype.updateStartTime = V.prototype.Hg;
        V.prototype.unload = V.prototype.se;
        V.prototype.detach = V.prototype.detach;
        V.prototype.attachCanvas = V.prototype.mf;
        V.prototype.attach = V.prototype.Zb;
        V.probeSupport = function (a) {
          a = void 0 === a ? !0 : a;
          var b, c, d, e, f, g;
          return G(function (h) {
            if (1 == h.g) return b = {}, a ? u(h, Lg(), 3) : h.B(2);
            2 != h.g && (b = h.h);
            var k = {};
            if (nc()) {
              for (var l in Sg) k[l] = !0;
              for (var m in Ug) k[m] = !0;
            }
            l = {
              mpd: "application/dash+xml",
              m3u8: "application/x-mpegurl",
              ism: "application/vnd.ms-sstr+xml"
            };
            m = t(["application/dash+xml", "application/x-mpegurl", "application/vnd.apple.mpegurl", "application/vnd.ms-sstr+xml"]);
            for (var p = m.next(); !p.done; p = m.next()) p = p.value, k[p] = nc() ? !!Sg[p] : oc(p);
            for (var n in l) k[n] = nc() ? !!Ug[n] : oc(l[n]);
            c = k;
            n = 'video/mp4; codecs="avc1.42E01E",video/mp4; codecs="avc3.42E01E",video/mp4; codecs="hev1.1.6.L93.90",video/mp4; codecs="hvc1.1.6.L93.90",video/mp4; codecs="hev1.2.4.L153.B0"; eotf="smpte2084",video/mp4; codecs="hvc1.2.4.L153.B0"; eotf="smpte2084",video/mp4; codecs="vp9",video/mp4; codecs="vp09.00.10.08",video/mp4; codecs="av01.0.01M.08",audio/mp4; codecs="mp4a.40.2",audio/mp4; codecs="ac-3",audio/mp4; codecs="ec-3",audio/mp4; codecs="opus",audio/mp4; codecs="flac",audio/mp4; codecs="dtsc",audio/mp4; codecs="dtse",audio/mp4; codecs="dtsx",video/webm; codecs="vp8",video/webm; codecs="vp9",video/webm; codecs="vp09.00.10.08",audio/webm; codecs="vorbis",audio/webm; codecs="opus",video/mp2t; codecs="avc1.42E01E",video/mp2t; codecs="avc3.42E01E",video/mp2t; codecs="hvc1.1.6.L93.90",video/mp2t; codecs="mp4a.40.2",video/mp2t; codecs="ac-3",video/mp2t; codecs="ec-3",text/vtt,application/mp4; codecs="wvtt",application/ttml+xml,application/mp4; codecs="stpp"'.split(",").concat(ia(Yi));
            k = {};
            n = t(n);
            for (l = n.next(); !l.done; l = n.next()) l = l.value, k[l] = nc() ? dd(l) ? !0 : db(l) || Sc(l) : oc(l), m = l.split(";")[0], k[m] = k[m] || k[l];
            d = k;
            e = {
              manifest: c,
              media: d,
              drm: b
            };
            f = qn;
            for (g in f) e[g] = f[g]();
            return h.return(e);
          });
        };
        V.isBrowserSupported = function () {
          window.Promise || Xa("A Promise implementation or polyfill is required");
          if (!(window.Promise && window.Uint8Array && Array.prototype.forEach) || sc("Trident/")) return !1;
          var a = xc();
          return a && 13 > a || !(window.MediaKeys && window.navigator && window.navigator.requestMediaKeySystemAccess && window.MediaKeySystemAccess && window.MediaKeySystemAccess.prototype.getConfiguration) ? !1 : nc() ? !0 : oc("application/x-mpegurl");
        };
        V.setAdManagerFactory = function (a) {
          Rl = a;
        };
        V.registerSupportPlugin = function (a, b) {
          qn[a] = b;
        };
        V.prototype.destroy = V.prototype.destroy;
        var gm = 0,
          Ol = 1,
          Dm = 2,
          Qm = 3;
        V.LoadMode = {
          DESTROYED: gm,
          NOT_LOADED: Ol,
          MEDIA_SOURCE: Dm,
          SRC_EQUALS: Qm
        };
        V.version = "v4.3.9";
        var rn = ["4", "3"];
        re = new function (a) {
          this.g = a;
          this.i = se;
          this.h = te;
        }(new pe(Number(rn[0]), Number(rn[1])));
        var pn = ["output-restricted", "internal-error"],
          qn = {},
          Rl = null,
          fm = {
            mp4: "video/mp4",
            m4v: "video/mp4",
            m4a: "audio/mp4",
            webm: "video/webm",
            weba: "audio/webm",
            mkv: "video/webm",
            ts: "video/mp2t",
            ogv: "video/ogg",
            ogg: "audio/ogg",
            mpg: "video/mpeg",
            mpeg: "video/mpeg",
            m3u8: "application/x-mpegurl",
            mpd: "application/dash+xml",
            mp3: "audio/mpeg",
            aac: "audio/aac",
            flac: "audio/flac",
            wav: "audio/wav"
          },
          jn = {
            sbv: "text/x-subviewer",
            srt: "text/srt",
            vtt: "text/vtt",
            webvtt: "text/vtt",
            ttml: "application/ttml+xml",
            lrc: "application/x-subtitle-lrc",
            ssa: "text/x-ssa",
            ass: "text/x-ssa"
          };
        function sn() {
          this.h = [];
          this.j = this.i = this.g = 0;
        }
        function W(a, b, c) {
          var d = this;
          this.h = a;
          this.g = b;
          this.m = c;
          this.i = !1;
          this.l = this.g.getVolume();
          this.j = new lf();
          this.j.C(this.g, google.ima.AdEvent.Type.PAUSED, function () {
            d.i = !0;
          });
          this.j.C(this.g, google.ima.AdEvent.Type.RESUMED, function () {
            d.i = !1;
          });
        }
        r = W.prototype;
        r.getDuration = function () {
          return this.h.getDuration();
        };
        r.getMinSuggestedDuration = function () {
          return this.h.getMinSuggestedDuration();
        };
        r.getRemainingTime = function () {
          return this.g.getRemainingTime();
        };
        r.isPaused = function () {
          return this.i;
        };
        r.isSkippable = function () {
          return 0 <= this.h.getSkipTimeOffset();
        };
        r.getTimeUntilSkippable = function () {
          var a = this.h.getSkipTimeOffset();
          a = this.getRemainingTime() - a;
          return Math.max(a, 0);
        };
        r.canSkipNow = function () {
          return this.g.getAdSkippableState();
        };
        r.skip = function () {
          return this.g.skip();
        };
        r.pause = function () {
          return this.g.pause();
        };
        r.play = function () {
          return this.g.resume();
        };
        r.getVolume = function () {
          return this.g.getVolume();
        };
        r.setVolume = function (a) {
          return this.g.setVolume(a);
        };
        r.isMuted = function () {
          return 0 == this.g.getVolume();
        };
        r.isLinear = function () {
          return this.h.isLinear();
        };
        r.resize = function (a, b) {
          var c = !1,
            d = this.m;
          document.fullscreenEnabled ? c = !!document.fullscreenElement : d.webkitSupportsFullscreen && (c = d.webkitDisplayingFullscreen);
          this.g.resize(a, b, c ? google.ima.ViewMode.FULLSCREEN : google.ima.ViewMode.NORMAL);
        };
        r.setMuted = function (a) {
          a ? (this.l = this.getVolume(), this.setVolume(0)) : this.setVolume(this.l);
        };
        r.getSequenceLength = function () {
          var a = this.h.getAdPodInfo();
          return null == a ? 1 : a.getTotalAds();
        };
        r.getPositionInSequence = function () {
          var a = this.h.getAdPodInfo();
          return null == a ? 1 : a.getAdPosition();
        };
        r.getTitle = function () {
          return this.h.getTitle();
        };
        r.getDescription = function () {
          return this.h.getDescription();
        };
        r.release = function () {
          this.g = this.h = null;
        };
        K("shaka.ads.ClientSideAd", W);
        W.prototype.release = W.prototype.release;
        W.prototype.getDescription = W.prototype.getDescription;
        W.prototype.getTitle = W.prototype.getTitle;
        W.prototype.getPositionInSequence = W.prototype.getPositionInSequence;
        W.prototype.getSequenceLength = W.prototype.getSequenceLength;
        W.prototype.setMuted = W.prototype.setMuted;
        W.prototype.resize = W.prototype.resize;
        W.prototype.isLinear = W.prototype.isLinear;
        W.prototype.isMuted = W.prototype.isMuted;
        W.prototype.setVolume = W.prototype.setVolume;
        W.prototype.getVolume = W.prototype.getVolume;
        W.prototype.play = W.prototype.play;
        W.prototype.pause = W.prototype.pause;
        W.prototype.skip = W.prototype.skip;
        W.prototype.canSkipNow = W.prototype.canSkipNow;
        W.prototype.getTimeUntilSkippable = W.prototype.getTimeUntilSkippable;
        W.prototype.isSkippable = W.prototype.isSkippable;
        W.prototype.isPaused = W.prototype.isPaused;
        W.prototype.getRemainingTime = W.prototype.getRemainingTime;
        W.prototype.getMinSuggestedDuration = W.prototype.getMinSuggestedDuration;
        W.prototype.getDuration = W.prototype.getDuration;
        function tn(a, b, c, d) {
          var e = this;
          this.o = a;
          this.i = b;
          this.s = null;
          this.u = NaN;
          this.l = d;
          this.j = null;
          this.h = new lf();
          google.ima.settings.setLocale(c);
          a = new google.ima.AdDisplayContainer(this.o, this.i);
          a.initialize();
          this.m = new google.ima.AdsLoader(a);
          this.m.getSettings().setPlayerType("shaka-player");
          this.m.getSettings().setPlayerVersion("v4.3.9");
          this.g = null;
          this.h.ia(this.m, google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED, function (f) {
            un(e, f);
          });
          this.h.C(this.m, google.ima.AdErrorEvent.Type.AD_ERROR, function (f) {
            vn(e, f);
          });
          this.h.C(this.i, "ended", function () {
            e.m.contentComplete();
          });
        }
        tn.prototype.stop = function () {
          this.g && this.g.stop();
          this.o && Tk(this.o);
        };
        tn.prototype.release = function () {
          this.stop();
          this.s && this.s.disconnect();
          this.h && this.h.release();
          this.g && this.g.destroy();
          this.m.destroy();
        };
        function vn(a, b) {
          b.getError();
          wn(a, null);
          a.l(new S("ad-cue-points-changed", new Map().set("cuepoints", [])));
        }
        function un(a, b) {
          a.l(new S("ads-loaded", new Map().set("loadTime", Date.now() / 1E3 - a.u)));
          a.g = b.getAdsManager(a.i);
          a.l(new S("ima-ad-manager-loaded", new Map().set("imaAdManager", a.g)));
          var c = a.g.getCuePoints();
          if (c.length) {
            b = [];
            c = t(c);
            for (var d = c.next(); !d.done; d = c.next()) b.push({
              start: d.value,
              end: null
            });
            a.l(new S("ad-cue-points-changed", new Map().set("cuepoints", b)));
          }
          xn(a);
          try {
            a.g.init(a.i.offsetWidth, a.i.offsetHeight, yn(a) ? google.ima.ViewMode.FULLSCREEN : google.ima.ViewMode.NORMAL), a.h.C(a.i, "loadeddata", function () {
              a.g.resize(a.i.offsetWidth, a.i.offsetHeight, yn(a) ? google.ima.ViewMode.FULLSCREEN : google.ima.ViewMode.NORMAL);
            }), "ResizeObserver" in window ? (a.s = new ResizeObserver(function () {
              a.g.resize(a.i.offsetWidth, a.i.offsetHeight, yn(a) ? google.ima.ViewMode.FULLSCREEN : google.ima.ViewMode.NORMAL);
            }), a.s.observe(a.i)) : a.h.C(document, "fullscreenchange", function () {
              a.g.resize(a.i.offsetWidth, a.i.offsetHeight, yn(a) ? google.ima.ViewMode.FULLSCREEN : google.ima.ViewMode.NORMAL);
            }), a.h.ia(a.i, "play", function () {
              a.g.start();
            });
          } catch (e) {
            wn(a, null);
          }
        }
        function yn(a) {
          if (document.fullscreenEnabled) return !!document.fullscreenElement;
          a = a.i;
          return a.webkitSupportsFullscreen ? a.webkitDisplayingFullscreen : !1;
        }
        function xn(a) {
          function b(c, d) {
            c = new Map().set("originalEvent", c);
            a.l(new S(d, c));
          }
          a.h.C(a.g, google.ima.AdErrorEvent.Type.AD_ERROR, function (c) {
            vn(a, c);
          });
          a.h.C(a.g, google.ima.AdEvent.Type.CONTENT_PAUSE_REQUESTED, function (c) {
            zn(a, c);
          });
          a.h.C(a.g, google.ima.AdEvent.Type.STARTED, function (c) {
            zn(a, c);
          });
          a.h.C(a.g, google.ima.AdEvent.Type.FIRST_QUARTILE, function (c) {
            b(c, "ad-first-quartile");
          });
          a.h.C(a.g, google.ima.AdEvent.Type.MIDPOINT, function (c) {
            b(c, "ad-midpoint");
          });
          a.h.C(a.g, google.ima.AdEvent.Type.THIRD_QUARTILE, function (c) {
            b(c, "ad-third-quartile");
          });
          a.h.C(a.g, google.ima.AdEvent.Type.COMPLETE, function (c) {
            b(c, "ad-complete");
          });
          a.h.C(a.g, google.ima.AdEvent.Type.CONTENT_RESUME_REQUESTED, function (c) {
            wn(a, c);
          });
          a.h.C(a.g, google.ima.AdEvent.Type.ALL_ADS_COMPLETED, function (c) {
            wn(a, c);
          });
          a.h.C(a.g, google.ima.AdEvent.Type.SKIPPED, function (c) {
            b(c, "ad-skipped");
          });
          a.h.C(a.g, google.ima.AdEvent.Type.VOLUME_CHANGED, function (c) {
            b(c, "ad-volume-changed");
          });
          a.h.C(a.g, google.ima.AdEvent.Type.VOLUME_MUTED, function (c) {
            b(c, "ad-muted");
          });
          a.h.C(a.g, google.ima.AdEvent.Type.PAUSED, function (c) {
            a.j && (a.j.i = !0, b(c, "ad-paused"));
          });
          a.h.C(a.g, google.ima.AdEvent.Type.RESUMED, function (c) {
            a.j && (a.j.i = !1, b(c, "ad-resumed"));
          });
          a.h.C(a.g, google.ima.AdEvent.Type.SKIPPABLE_STATE_CHANGED, function (c) {
            a.j && b(c, "ad-skip-state-changed");
          });
          a.h.C(a.g, google.ima.AdEvent.Type.CLICK, function (c) {
            b(c, "ad-clicked");
          });
          a.h.C(a.g, google.ima.AdEvent.Type.AD_PROGRESS, function (c) {
            b(c, "ad-progress");
          });
          a.h.C(a.g, google.ima.AdEvent.Type.AD_BUFFERING, function (c) {
            b(c, "ad-buffering");
          });
          a.h.C(a.g, google.ima.AdEvent.Type.IMPRESSION, function (c) {
            b(c, "ad-impression");
          });
          a.h.C(a.g, google.ima.AdEvent.Type.DURATION_CHANGE, function (c) {
            b(c, "ad-duration-changed");
          });
          a.h.C(a.g, google.ima.AdEvent.Type.USER_CLOSE, function (c) {
            b(c, "ad-closed");
          });
          a.h.C(a.g, google.ima.AdEvent.Type.LOADED, function (c) {
            b(c, "ad-loaded");
          });
          a.h.C(a.g, google.ima.AdEvent.Type.ALL_ADS_COMPLETED, function (c) {
            b(c, "all-ads-completed");
          });
          a.h.C(a.g, google.ima.AdEvent.Type.LINEAR_CHANGED, function (c) {
            b(c, "ad-linear-changed");
          });
          a.h.C(a.g, google.ima.AdEvent.Type.AD_METADATA, function (c) {
            b(c, "ad-metadata");
          });
          a.h.C(a.g, google.ima.AdEvent.Type.LOG, function (c) {
            b(c, "ad-recoverable-error");
          });
          a.h.C(a.g, google.ima.AdEvent.Type.AD_BREAK_READY, function (c) {
            b(c, "ad-break-ready");
          });
          a.h.C(a.g, google.ima.AdEvent.Type.INTERACTION, function (c) {
            b(c, "ad-interaction");
          });
        }
        function zn(a, b) {
          var c = b.getAd();
          c ? (a.j = new W(c, a.g, a.i), b = new Map().set("ad", a.j).set("sdkAdObject", c).set("originalEvent", b), a.l(new S("ad-started", b)), a.j.isLinear() && (a.o.setAttribute("ad-active", "true"), a.i.pause(), a.j.setVolume(a.i.volume), a.i.muted && a.j.setMuted(!0))) : Xa("The IMA SDK fired a " + b.type + " event with no associated ad. Unable to play ad!");
        }
        function wn(a, b) {
          a.l(new S("ad-stopped", new Map().set("originalEvent", b)));
          a.j && a.j.isLinear() && (a.o.removeAttribute("ad-active"), a.i.ended || a.i.play());
        }
        function X(a, b) {
          this.i = a;
          this.h = null;
          this.g = b;
        }
        r = X.prototype;
        r.getDuration = function () {
          return this.h ? this.h.duration : -1;
        };
        r.getMinSuggestedDuration = function () {
          return this.getDuration();
        };
        r.getRemainingTime = function () {
          return this.h ? this.h.duration - this.h.currentTime : -1;
        };
        r.isPaused = function () {
          return this.g.paused;
        };
        r.isSkippable = function () {
          return this.i.isSkippable();
        };
        r.getTimeUntilSkippable = function () {
          var a = this.i.getSkipTimeOffset();
          a = this.getRemainingTime() - a;
          return Math.max(a, 0);
        };
        r.canSkipNow = function () {
          return 0 == this.getTimeUntilSkippable();
        };
        r.skip = function () {
          this.g.currentTime += this.getRemainingTime();
        };
        r.pause = function () {
          return this.g.pause();
        };
        r.play = function () {
          return this.g.play();
        };
        r.getVolume = function () {
          return this.g.volume;
        };
        r.setVolume = function (a) {
          this.g.volume = a;
        };
        r.isMuted = function () {
          return this.g.muted;
        };
        r.isLinear = function () {
          return !0;
        };
        r.resize = function () {};
        r.setMuted = function (a) {
          this.g.muted = a;
        };
        r.getSequenceLength = function () {
          var a = this.i.getAdPodInfo();
          return null == a ? 1 : a.getTotalAds();
        };
        r.getPositionInSequence = function () {
          var a = this.i.getAdPodInfo();
          return null == a ? 1 : a.getAdPosition();
        };
        r.getTitle = function () {
          return this.i.getTitle();
        };
        r.getDescription = function () {
          return this.i.getDescription();
        };
        r.release = function () {
          this.g = this.h = this.i = null;
        };
        K("shaka.ads.ServerSideAd", X);
        X.prototype.release = X.prototype.release;
        X.prototype.getDescription = X.prototype.getDescription;
        X.prototype.getTitle = X.prototype.getTitle;
        X.prototype.getPositionInSequence = X.prototype.getPositionInSequence;
        X.prototype.getSequenceLength = X.prototype.getSequenceLength;
        X.prototype.setMuted = X.prototype.setMuted;
        X.prototype.resize = X.prototype.resize;
        X.prototype.isLinear = X.prototype.isLinear;
        X.prototype.isMuted = X.prototype.isMuted;
        X.prototype.setVolume = X.prototype.setVolume;
        X.prototype.getVolume = X.prototype.getVolume;
        X.prototype.play = X.prototype.play;
        X.prototype.pause = X.prototype.pause;
        X.prototype.skip = X.prototype.skip;
        X.prototype.canSkipNow = X.prototype.canSkipNow;
        X.prototype.getTimeUntilSkippable = X.prototype.getTimeUntilSkippable;
        X.prototype.isSkippable = X.prototype.isSkippable;
        X.prototype.isPaused = X.prototype.isPaused;
        X.prototype.getRemainingTime = X.prototype.getRemainingTime;
        X.prototype.getMinSuggestedDuration = X.prototype.getMinSuggestedDuration;
        X.prototype.getDuration = X.prototype.getDuration;
        function An(a, b, c, d) {
          var e = this;
          this.s = a;
          this.l = b;
          this.j = null;
          this.G = NaN;
          this.i = d;
          this.F = !1;
          this.u = this.m = this.o = null;
          this.A = "";
          this.D = [];
          this.h = new lf();
          a = new google.ima.dai.api.UiSettings();
          a.setLocale(c);
          this.g = new google.ima.dai.api.StreamManager(this.l, this.s, a);
          this.i(new S("ima-stream-manager-loaded", new Map().set("imaStreamManager", this.g)));
          this.h.C(this.g, google.ima.dai.api.StreamEvent.Type.LOADED, function (f) {
            Bn(e, f);
          });
          this.h.C(this.g, google.ima.dai.api.StreamEvent.Type.ERROR, function () {
            e.A.length ? e.j.resolve(e.A) : e.j.reject("IMA Stream request returned an error and there was no backup asset uri provided.");
            e.j = null;
          });
          this.h.C(this.g, google.ima.dai.api.StreamEvent.Type.AD_BREAK_STARTED, function () {});
          this.h.C(this.g, google.ima.dai.api.StreamEvent.Type.STARTED, function (f) {
            f = f.getAd();
            e.m = new X(f, e.l);
            e.u && (e.m.h = e.u);
            e.i(new S("ad-started", new Map().set("ad", e.m)));
            e.s.setAttribute("ad-active", "true");
          });
          this.h.C(this.g, google.ima.dai.api.StreamEvent.Type.AD_BREAK_ENDED, function () {
            e.s.removeAttribute("ad-active");
            var f = e.l.currentTime;
            e.o && e.o > f && (e.l.currentTime = e.o, e.o = null);
          });
          this.h.C(this.g, google.ima.dai.api.StreamEvent.Type.AD_PROGRESS, function (f) {
            e.u = f.getStreamData().adProgressData;
            e.m && (e.m.h = e.u);
          });
          this.h.C(this.g, google.ima.dai.api.StreamEvent.Type.FIRST_QUARTILE, function () {
            e.i(new S("ad-first-quartile"));
          });
          this.h.C(this.g, google.ima.dai.api.StreamEvent.Type.MIDPOINT, function () {
            e.i(new S("ad-midpoint"));
          });
          this.h.C(this.g, google.ima.dai.api.StreamEvent.Type.THIRD_QUARTILE, function () {
            e.i(new S("ad-third-quartile"));
          });
          this.h.C(this.g, google.ima.dai.api.StreamEvent.Type.COMPLETE, function () {
            e.i(new S("ad-complete"));
            e.i(new S("ad-stopped"));
            e.s.removeAttribute("ad-active");
            e.m = null;
          });
          this.h.C(this.g, google.ima.dai.api.StreamEvent.Type.SKIPPED, function () {
            e.i(new S("ad-skipped"));
            e.i(new S("ad-stopped"));
          });
          this.h.C(this.g, google.ima.dai.api.StreamEvent.Type.CUEPOINTS_CHANGED, function (f) {
            var g = f.getStreamData();
            f = [];
            g = t(g.cuepoints);
            for (var h = g.next(); !h.done; h = g.next()) h = h.value, f.push({
              start: h.start,
              end: h.end
            });
            e.D = f;
            e.i(new S("ad-cue-points-changed", new Map().set("cuepoints", f)));
          });
        }
        An.prototype.stop = function () {
          this.A = "";
          this.o = null;
          this.D = [];
        };
        An.prototype.release = function () {
          this.stop();
          this.h && this.h.release();
        };
        An.prototype.onCueMetadataChange = function (a) {
          if (a.key && a.data) {
            var b = {};
            b[a.key] = a.data;
            this.g.onTimedMetadata(b);
          }
        };
        function Bn(a, b) {
          a.i(new S("ads-loaded", new Map().set("loadTime", Date.now() / 1E3 - a.G)));
          b = b.getStreamData().url;
          a.j.resolve(b);
          a.j = null;
          a.F || a.h.C(a.l, "seeked", function () {
            var c = a.l.currentTime;
            if (0 != c) {
              a.g.streamTimeForContentTime(c);
              var d = a.g.previousCuePointForStreamTime(c);
              d && !d.played && (a.o = c, a.l.currentTime = d.start);
            }
          });
        }
        function Y() {
          Te.call(this);
          this.g = this.i = null;
          this.h = new sn();
          this.j = navigator.language;
        }
        qa(Y, Te);
        r = Y.prototype;
        r.setLocale = function (a) {
          this.j = a;
        };
        r.initClientSide = function (a, b) {
          var c = this;
          if (!window.google || !google.ima || !google.ima.AdsLoader) throw new O(2, 10, 1E4);
          this.i && this.i.release();
          this.i = new tn(a, b, this.j, function (d) {
            if (d && d.type) switch (d.type) {
              case "ads-loaded":
                c.h.h.push(d.loadTime);
                break;
              case "ad-started":
                c.h.g++;
                break;
              case "ad-complete":
                c.h.i++;
                break;
              case "ad-skipped":
                c.h.j++;
            }
            c.dispatchEvent(d);
          });
        };
        r.release = function () {
          this.i && (this.i.release(), this.i = null);
          this.g && (this.g.release(), this.g = null);
          Te.prototype.release.call(this);
        };
        r.onAssetUnload = function () {
          this.i && this.i.stop();
          this.g && this.g.stop();
          this.dispatchEvent(new S("ad-stopped"));
          this.h = new sn();
        };
        r.requestClientSideAds = function (a) {
          if (!this.i) throw new O(1, 10, 10001);
          var b = this.i;
          b.u = Date.now() / 1E3;
          b.m.requestAds(a);
        };
        r.initServerSide = function (a, b) {
          var c = this;
          if (!window.google || !google.ima || !google.ima.dai) throw new O(2, 10, 10002);
          this.g && this.g.release();
          this.g = new An(a, b, this.j, function (d) {
            if (d && d.type) switch (d.type) {
              case "ads-loaded":
                c.h.h.push(d.loadTime);
                break;
              case "ad-started":
                c.h.g++;
                break;
              case "ad-complete":
                c.h.i++;
                break;
              case "ad-skipped":
                c.h.j++;
            }
            c.dispatchEvent(d);
          });
        };
        r.requestServerSideStream = function (a, b) {
          b = void 0 === b ? "" : b;
          if (!this.g) throw new O(1, 10, 10003);
          a.adTagParameters || (a.adTagParameters = {});
          var c = a.adTagParameters;
          (c.mpt || c.mpv) && Xa('You have attempted to set "mpt" and/or "mpv" parameters of the ad tag. Please note that those parameters are used for Shaka adoption tracking and will be overriden.');
          a.adTagParameters.mpt = "shaka-player";
          a.adTagParameters.mpv = "v4.3.9";
          c = this.g;
          c.j ? a = Promise.reject(new O(1, 10, 10004)) : (a instanceof google.ima.dai.api.LiveStreamRequest && (c.F = !0), c.j = new kc(), c.g.requestStream(a), c.A = b || "", c.G = Date.now() / 1E3, a = c.j);
          return a;
        };
        r.replaceServerSideAdTagParameters = function (a) {
          if (!this.g) throw new O(1, 10, 10003);
          (a.mpt || a.mpv) && Xa('You have attempted to set "mpt" and/or "mpv" parameters of the ad tag. Please note that those parameters are used for Shaka adoption tracking and will be overriden.');
          a.mpt = "Shaka Player";
          a.mpv = "v4.3.9";
          this.g.g.replaceAdTagParameters(a);
        };
        r.getServerSideCuePoints = function () {
          if (!this.g) throw new O(1, 10, 10003);
          return this.g.D;
        };
        r.getStats = function () {
          var a = this.h;
          return {
            loadTimes: a.h,
            started: a.g,
            playedCompletely: a.i,
            skipped: a.j
          };
        };
        r.onDashTimedMetadata = function (a) {
          if (this.g && "urn:google:dai:2018" == a.schemeIdUri) {
            var b = a.schemeIdUri,
              c = a.eventElement ? a.eventElement.getAttribute("messageData") : null;
            this.g.g.processMetadata(b, c, a.startTime);
          }
        };
        r.onHlsTimedMetadata = function (a, b) {
          this.g && this.g.g.processMetadata("ID3", a.data, b);
        };
        r.onCueMetadataChange = function (a) {
          if (this.g) this.g.onCueMetadataChange(a);
        };
        K("shaka.ads.AdManager", Y);
        Y.prototype.onCueMetadataChange = Y.prototype.onCueMetadataChange;
        Y.prototype.onHlsTimedMetadata = Y.prototype.onHlsTimedMetadata;
        Y.prototype.onDashTimedMetadata = Y.prototype.onDashTimedMetadata;
        Y.prototype.getStats = Y.prototype.getStats;
        Y.prototype.getServerSideCuePoints = Y.prototype.getServerSideCuePoints;
        Y.prototype.replaceServerSideAdTagParameters = Y.prototype.replaceServerSideAdTagParameters;
        Y.prototype.requestServerSideStream = Y.prototype.requestServerSideStream;
        Y.prototype.initServerSide = Y.prototype.initServerSide;
        Y.prototype.requestClientSideAds = Y.prototype.requestClientSideAds;
        Y.prototype.onAssetUnload = Y.prototype.onAssetUnload;
        Y.prototype.release = Y.prototype.release;
        Y.prototype.initClientSide = Y.prototype.initClientSide;
        Y.prototype.setLocale = Y.prototype.setLocale;
        Y.ADS_LOADED = "ads-loaded";
        Y.AD_STARTED = "ad-started";
        Y.AD_FIRST_QUARTILE = "ad-first-quartile";
        Y.AD_MIDPOINT = "ad-midpoint";
        Y.AD_THIRD_QUARTILE = "ad-third-quartile";
        Y.AD_COMPLETE = "ad-complete";
        Y.AD_STOPPED = "ad-stopped";
        Y.AD_SKIPPED = "ad-skipped";
        Y.AD_VOLUME_CHANGED = "ad-volume-changed";
        Y.AD_MUTED = "ad-muted";
        Y.AD_PAUSED = "ad-paused";
        Y.AD_RESUMED = "ad-resumed";
        Y.AD_SKIP_STATE_CHANGED = "ad-skip-state-changed";
        Y.CUEPOINTS_CHANGED = "ad-cue-points-changed";
        Y.IMA_AD_MANAGER_LOADED = "ima-ad-manager-loaded";
        Y.IMA_STREAM_MANAGER_LOADED = "ima-stream-manager-loaded";
        Y.AD_CLICKED = "ad-clicked";
        Y.AD_PROGRESS = "ad-progress";
        Y.AD_BUFFERING = "ad-buffering";
        Y.AD_IMPRESSION = "ad-impression";
        Y.AD_DURATION_CHANGED = "ad-duration-changed";
        Y.AD_CLOSED = "ad-closed";
        Y.AD_LOADED = "ad-loaded";
        Y.ALL_ADS_COMPLETED = "all-ads-completed";
        Y.AD_LINEAR_CHANGED = "ad-linear-changed";
        Y.AD_METADATA = "ad-metadata";
        Y.AD_RECOVERABLE_ERROR = "ad-recoverable-error";
        Y.AD_BREAK_READY = "ad-break-ready";
        Y.AD_INTERACTION = "ad-interaction";
        Rl = function () {
          return new Y();
        };
        function Cn(a) {
          return JSON.stringify(a, function (b, c) {
            if ("function" != typeof c) {
              if (c instanceof Event || c instanceof S) {
                var d = {};
                for (e in c) (b = c[e]) && "object" == typeof b ? "detail" == e && (d[e] = b) : e in Event || (d[e] = b);
                return d;
              }
              if (c instanceof Error) {
                var e = new Set(["name", "message", "stack"]);
                for (d in c) e.add(d);
                b = t(Object.getOwnPropertyNames(c));
                for (d = b.next(); !d.done; d = b.next()) e.add(d.value);
                b = {};
                e = t(e);
                for (d = e.next(); !d.done; d = e.next()) d = d.value, b[d] = c[d];
                c = {
                  __type__: "Error",
                  contents: b
                };
              } else if (c instanceof TimeRanges) {
                e = {
                  __type__: "TimeRanges",
                  length: c.length,
                  start: [],
                  end: []
                };
                c = t(xi(c));
                for (d = c.next(); !d.done; d = c.next()) d = d.value, b = d.end, e.start.push(d.start), e.end.push(b);
                c = e;
              } else c = c instanceof Uint8Array ? {
                __type__: "Uint8Array",
                entries: Array.from(c)
              } : "number" == typeof c ? isNaN(c) ? "NaN" : isFinite(c) ? c : 0 > c ? "-Infinity" : "Infinity" : c;
              return c;
            }
          });
        }
        function Dn(a) {
          return JSON.parse(a, function (b, c) {
            if ("NaN" == c) var d = NaN;else if ("-Infinity" == c) d = -Infinity;else if ("Infinity" == c) d = Infinity;else if (c && "object" == typeof c && "TimeRanges" == c.__type__) d = En(c);else if (c && "object" == typeof c && "Uint8Array" == c.__type__) d = new Uint8Array(c.entries);else if (c && "object" == typeof c && "Error" == c.__type__) {
              b = c.contents;
              c = Error(b.message);
              for (d in b) c[d] = b[d];
              d = c;
            } else d = c;
            return d;
          });
        }
        function En(a) {
          return {
            length: a.length,
            start: function (b) {
              return a.start[b];
            },
            end: function (b) {
              return a.end[b];
            }
          };
        }
        var Fn = "ended play playing pause pausing ratechange seeked seeking timeupdate volumechange".split(" "),
          Gn = "buffered currentTime duration ended loop muted paused playbackRate seeking videoHeight videoWidth volume".split(" "),
          Hn = ["loop", "playbackRate"],
          In = ["pause", "play"],
          Jn = {
            getAssetUri: 2,
            getAudioLanguages: 4,
            getAudioLanguagesAndRoles: 4,
            getBufferFullness: 1,
            getBufferedInfo: 2,
            getExpiration: 2,
            getKeyStatuses: 2,
            getPlaybackRate: 2,
            getTextLanguages: 4,
            getTextLanguagesAndRoles: 4,
            getImageTracks: 2,
            getThumbnails: 2,
            isAudioOnly: 10,
            isBuffering: 1,
            isInProgress: 1,
            isLive: 10,
            isTextTrackVisible: 1,
            keySystem: 10,
            seekRange: 1,
            getLoadMode: 10
          },
          Kn = {
            getConfiguration: 4,
            getStats: 5,
            getTextTracks: 2,
            getVariantTracks: 2
          },
          Ln = {
            getPlayheadTimeAsDate: 1,
            getPresentationStartTimeAsDate: 20
          },
          Mn = [["getConfiguration", "configure"]],
          Nn = [["isTextTrackVisible", "setTextTrackVisibility"]],
          On = "addChaptersTrack addTextTrackAsync addThumbnailsTrack cancelTrickPlay configure getChapters getChaptersTracks resetConfiguration retryStreaming selectAudioLanguage selectTextLanguage selectTextTrack selectVariantTrack selectVariantsByLabel setTextTrackVisibility trickPlay updateStartTime goToLive".split(" "),
          Pn = ["attach", "attachCanvas", "detach", "load", "unload"];
        function Qn(a, b, c, d, e, f, g) {
          var h = this;
          this.G = a;
          this.M = g;
          this.j = new P(b);
          this.P = c;
          this.u = !1;
          this.s = d;
          this.F = e;
          this.J = f;
          this.h = this.m = !1;
          this.L = "";
          this.o = null;
          this.A = function () {
            return Rn(h);
          };
          this.D = function (k, l) {
            k = Dn(l);
            switch (k.type) {
              case "event":
                var m = k.targetName,
                  p = Re(k.event);
                h.s(m, p);
                break;
              case "update":
                m = k.update;
                for (p in m) {
                  k = h.g[p] || {};
                  for (var n in m[p]) k[n] = m[p][n];
                }
                h.u && (h.P(), h.u = !1);
                break;
              case "asyncComplete":
                if (p = k.id, n = k.error, k = h.i[p], delete h.i[p], k) if (n) {
                  p = new O(n.severity, n.category, n.code);
                  for (m in n) p[m] = n[m];
                  k.reject(p);
                } else k.resolve();
            }
          };
          this.g = {
            video: {},
            player: {}
          };
          this.H = 0;
          this.i = {};
          this.l = null;
          Sn.add(this);
        }
        r = Qn.prototype;
        r.destroy = function () {
          Sn.delete(this);
          Tn(this);
          Vn && Wn(this);
          this.j && (this.j.stop(), this.j = null);
          this.F = this.s = null;
          this.h = this.m = !1;
          this.D = this.A = this.l = this.i = this.g = this.o = null;
          return Promise.resolve();
        };
        r.ta = function () {
          return this.h;
        };
        r.ce = function () {
          return this.L;
        };
        r.init = function () {
          if (this.G.length) if (window.chrome && chrome.cast && chrome.cast.isAvailable) {
            this.m = !0;
            this.j.Nb();
            var a = new chrome.cast.SessionRequest(this.G, [], null, this.M, null);
            a = new chrome.cast.ApiConfig(a, function (b) {
              for (var c = t(Sn), d = c.next(); !d.done; d = c.next()) Xn(d.value, b);
            }, function (b) {
              for (var c = t(Sn), d = c.next(); !d.done; d = c.next()) d = d.value, Yn = "available" == b, d.j.Nb();
            }, "origin_scoped");
            chrome.cast.initialize(a, function () {}, function () {});
            Yn && this.j.O(Zn);
            (a = Vn) && a.status != chrome.cast.SessionStatus.STOPPED ? Xn(this, a) : Vn = null;
          } else window.__onGCastApiAvailable !== $n && (ao = window.__onGCastApiAvailable || null, window.__onGCastApiAvailable = $n);
        };
        r.ke = function (a) {
          this.o = a;
          this.h && bo(this, {
            type: "appData",
            appData: this.o
          });
        };
        r.cast = function (a) {
          var b = this;
          return G(function (c) {
            if (!b.m) throw new O(1, 8, 8E3);
            if (!Yn) throw new O(1, 8, 8001);
            if (b.h) throw new O(1, 8, 8002);
            b.l = new kc();
            chrome.cast.requestSession(function (d) {
              return co(b, a, d);
            }, function (d) {
              return eo(b, d);
            });
            return u(c, b.l, 0);
          });
        };
        function fo(a) {
          if (a.h) {
            var b = a.J();
            chrome.cast.requestSession(function (c) {
              return co(a, b, c);
            }, function (c) {
              return eo(a, c);
            });
          }
        }
        r.Bb = function () {
          if (this.h) {
            Tn(this);
            if (Vn) {
              Wn(this);
              try {
                Vn.stop(function () {}, function () {});
              } catch (a) {}
              Vn = null;
            }
            Rn(this);
          }
        };
        r.get = function (a, b) {
          var c = this;
          if ("video" == a) {
            if (In.includes(b)) return function () {
              return c.Re.apply(c, [a, b].concat(ia(Ia.apply(0, arguments))));
            };
          } else if ("player" == a) {
            if (Ln[b] && !this.get("player", "isLive")()) return function () {};
            if (On.includes(b)) return function () {
              return c.Re.apply(c, [a, b].concat(ia(Ia.apply(0, arguments))));
            };
            if (Pn.includes(b)) return function () {
              return c.qg.apply(c, [a, b].concat(ia(Ia.apply(0, arguments))));
            };
            if (Jn[b] || Kn[b]) return function () {
              return c.g[a][b];
            };
          }
          return this.g[a][b];
        };
        r.set = function (a, b, c) {
          this.g[a][b] = c;
          bo(this, {
            type: "set",
            targetName: a,
            property: b,
            value: c
          });
        };
        function co(a, b, c) {
          Vn = c;
          c.addUpdateListener(a.A);
          c.addMessageListener("urn:x-cast:com.google.shaka.v2", a.D);
          Rn(a);
          bo(a, {
            type: "init",
            initState: b,
            appData: a.o
          });
          a.l.resolve();
        }
        function eo(a, b) {
          var c = 8003;
          switch (b.code) {
            case "cancel":
              c = 8004;
              break;
            case "timeout":
              c = 8005;
              break;
            case "receiver_unavailable":
              c = 8006;
          }
          a.l.reject(new O(2, 8, c, b));
        }
        r.Re = function (a, b) {
          bo(this, {
            type: "call",
            targetName: a,
            methodName: b,
            args: Ia.apply(2, arguments)
          });
        };
        r.qg = function (a, b) {
          var c = Ia.apply(2, arguments),
            d = new kc(),
            e = this.H.toString();
          this.H++;
          this.i[e] = d;
          try {
            bo(this, {
              type: "asyncCall",
              targetName: a,
              methodName: b,
              args: c,
              id: e
            });
          } catch (f) {
            d.reject(f);
          }
          return d;
        };
        function Xn(a, b) {
          var c = a.J();
          a.l = new kc();
          a.u = !0;
          co(a, c, b);
        }
        function Wn(a) {
          var b = Vn;
          b.removeUpdateListener(a.A);
          b.removeMessageListener("urn:x-cast:com.google.shaka.v2", a.D);
        }
        function Rn(a) {
          var b = Vn ? "connected" == Vn.status : !1;
          if (a.h && !b) {
            a.F();
            for (var c in a.g) a.g[c] = {};
            Tn(a);
          }
          a.h = b;
          a.L = b ? Vn.receiver.friendlyName : "";
          a.j.Nb();
        }
        function Tn(a) {
          for (var b in a.i) {
            var c = a.i[b];
            delete a.i[b];
            c.reject(new O(1, 7, 7E3));
          }
        }
        function bo(a, b) {
          b = Cn(b);
          var c = Vn;
          try {
            c.sendMessage("urn:x-cast:com.google.shaka.v2", b, function () {}, $a);
          } catch (d) {
            throw b = new O(2, 8, 8005, d), c = new S("error", new Map().set("detail", b)), a.s("player", c), a.Bb(), b;
          }
        }
        var Zn = .02,
          Yn = !1,
          Vn = null,
          ao = null,
          Sn = new Set();
        function $n(a) {
          ao ? window.__onGCastApiAvailable = ao : delete window.__onGCastApiAvailable;
          ao = null;
          if (a) for (var b = t(Sn), c = b.next(); !c.done; c = b.next()) c.value.init();
          "function" === typeof window.__onGCastApiAvailable && window.__onGCastApiAvailable(a);
        }
        function go(a, b, c, d) {
          d = void 0 === d ? !1 : d;
          Te.call(this);
          var e = this;
          this.i = a;
          this.h = b;
          this.m = this.o = this.j = this.s = this.l = null;
          this.D = c;
          this.A = d;
          this.u = new Map();
          this.g = new Qn(c, function () {
            return ho(e);
          }, function () {
            return io(e);
          }, function (f, g) {
            return jo(e, f, g);
          }, function () {
            return ko(e);
          }, function () {
            return lo(e);
          }, d);
          mo(this);
        }
        qa(go, Te);
        r = go.prototype;
        r.destroy = function (a) {
          a && this.g.Bb();
          this.m && (this.m.release(), this.m = null);
          a = [];
          this.h && (a.push(this.h.destroy()), this.h = null);
          this.g && (a.push(this.g.destroy()), this.g = null);
          this.s = this.l = this.i = null;
          Te.prototype.release.call(this);
          return Promise.all(a);
        };
        r.Xf = function () {
          return this.l;
        };
        r.Of = function () {
          return this.s;
        };
        r.pf = function () {
          return this.g.m && Yn;
        };
        r.ta = function () {
          return this.g.ta();
        };
        r.ce = function () {
          return this.g.ce();
        };
        r.cast = function () {
          var a = this,
            b;
          return G(function (c) {
            return 1 == c.g ? (b = lo(a), u(c, a.g.cast(b), 2)) : a.h ? u(c, a.h.se(), 0) : c.return();
          });
        };
        r.ke = function (a) {
          this.g.ke(a);
        };
        r.Bg = function () {
          fo(this.g);
        };
        r.Bb = function () {
          this.g.Bb();
        };
        r.rf = function (a, b) {
          b = void 0 === b ? !1 : b;
          var c = this;
          return G(function (d) {
            if (1 == d.g) {
              if (a == c.D && b == c.A) return d.return();
              c.D = a;
              c.A = b;
              c.g.Bb();
              return u(d, c.g.destroy(), 2);
            }
            c.g = null;
            c.g = new Qn(a, function () {
              return ho(c);
            }, function () {
              return io(c);
            }, function (e, f) {
              return jo(c, e, f);
            }, function () {
              return ko(c);
            }, function () {
              return lo(c);
            }, b);
            c.g.init();
            A(d);
          });
        };
        function mo(a) {
          a.g.init();
          a.m = new lf();
          for (var b = t(Fn), c = b.next(); !c.done; c = b.next()) a.m.C(a.i, c.value, function (f) {
            a.g.ta() || (f = Re(f), a.j.dispatchEvent(f));
          });
          for (var d in Se) a.m.C(a.h, Se[d], function (f) {
            a.g.ta() || a.o.dispatchEvent(f);
          });
          a.l = {};
          b = {};
          for (var e in a.i) b.Tb = e, Object.defineProperty(a.l, b.Tb, {
            configurable: !1,
            enumerable: !0,
            get: function (f) {
              return function () {
                return no(a, f.Tb);
              };
            }(b),
            set: function (f) {
              return function (g) {
                var h = f.Tb;
                a.g.ta() ? a.g.set("video", h, g) : a.i[h] = g;
              };
            }(b)
          }), b = {
            Tb: b.Tb
          };
          a.s = {};
          oo(a, function (f) {
            Object.defineProperty(a.s, f, {
              configurable: !1,
              enumerable: !0,
              get: function () {
                return po(a, f);
              }
            });
          });
          qo(a);
          a.j = new Te();
          a.j.Xc = a.l;
          a.o = new Te();
          a.o.Xc = a.s;
        }
        function qo(a) {
          var b = new Map();
          oo(a, function (c, d) {
            b.has(d) ? (d = b.get(d), c.length < d.length ? a.u.set(c, d) : a.u.set(d, c)) : b.set(d, c);
          });
        }
        function oo(a, b) {
          function c(k) {
            return "constructor" == k || "function" != typeof d[k] ? !1 : !e.has(k);
          }
          var d = a.h,
            e = new Set(),
            f;
          for (f in d) c(f) && (e.add(f), b(f, d[f]));
          a = Object.getPrototypeOf(d);
          for (f = Object.getPrototypeOf({}); a && a != f;) {
            for (var g = t(Object.getOwnPropertyNames(a)), h = g.next(); !h.done; h = g.next()) h = h.value, c(h) && (e.add(h), b(h, d[h]));
            a = Object.getPrototypeOf(a);
          }
        }
        function lo(a) {
          var b = {
            video: {},
            player: {},
            playerAfterLoad: {},
            manifest: a.h.Fd(),
            startTime: null
          };
          a.i.pause();
          for (var c = t(Hn), d = c.next(); !d.done; d = c.next()) d = d.value, b.video[d] = a.i[d];
          a.i.ended || (b.startTime = a.i.currentTime);
          c = t(Mn);
          for (d = c.next(); !d.done; d = c.next()) {
            var e = d.value;
            d = e[1];
            e = a.h[e[0]]();
            b.player[d] = e;
          }
          c = t(Nn);
          for (d = c.next(); !d.done; d = c.next()) e = d.value, d = e[1], e = a.h[e[0]](), b.playerAfterLoad[d] = e;
          return b;
        }
        function ho(a) {
          var b = new S("caststatuschanged");
          a.dispatchEvent(b);
        }
        function io(a) {
          var b = new S(a.l.paused ? "pause" : "play");
          a.j.dispatchEvent(b);
        }
        function ko(a) {
          for (var b = t(Mn), c = b.next(); !c.done; c = b.next()) {
            var d = c.value;
            c = d[1];
            d = a.g.get("player", d[0])();
            a.h[c](d);
          }
          var e = a.g.get("player", "getAssetUri")();
          c = a.g.get("video", "ended");
          b = Promise.resolve();
          var f = a.i.autoplay;
          d = null;
          c || (d = a.g.get("video", "currentTime"));
          e && (a.i.autoplay = !1, b = a.h.load(e, d));
          var g = {};
          c = t(Hn);
          for (d = c.next(); !d.done; d = c.next()) d = d.value, g[d] = a.g.get("video", d);
          b.then(function () {
            if (a.i) {
              for (var h = t(Hn), k = h.next(); !k.done; k = h.next()) k = k.value, a.i[k] = g[k];
              h = t(Nn);
              for (k = h.next(); !k.done; k = h.next()) {
                var l = k.value;
                k = l[1];
                l = a.g.get("player", l[0])();
                a.h[k](l);
              }
              a.i.autoplay = f;
              e && a.i.play();
            }
          }, function (h) {
            h = new Map().set("detail", h);
            h = new S("error", h);
            a.h.dispatchEvent(h);
          });
        }
        function no(a, b) {
          if ("addEventListener" == b) return function (d, e, f) {
            return a.j.addEventListener(d, e, f);
          };
          if ("removeEventListener" == b) return function (d, e, f) {
            return a.j.removeEventListener(d, e, f);
          };
          if (a.g.ta() && 0 == Object.keys(a.g.g.video).length) {
            var c = a.i[b];
            if ("function" != typeof c) return c;
          }
          return a.g.ta() ? a.g.get("video", b) : (b = a.i[b], "function" == typeof b && (b = b.bind(a.i)), b);
        }
        function po(a, b) {
          a.u.has(b) && (b = a.u.get(b));
          if ("addEventListener" == b) return function (c, d, e) {
            return a.o.addEventListener(c, d, e);
          };
          if ("removeEventListener" == b) return function (c, d, e) {
            return a.o.removeEventListener(c, d, e);
          };
          if ("getMediaElement" == b) return function () {
            return a.l;
          };
          if ("getSharedConfiguration" == b) return a.g.get("player", "getConfiguration");
          if ("getNetworkingEngine" == b) return function () {
            return a.h.kc();
          };
          if ("getDrmEngine" == b) return function () {
            return a.h.m;
          };
          if ("getAdManager" == b) return function () {
            return a.h.He();
          };
          if ("setVideoContainer" == b) return function (c) {
            return a.h.af(c);
          };
          if (a.g.ta()) {
            if ("getManifest" == b || "drmInfo" == b) return function () {
              Xa(b + "() does not work while casting!");
              return null;
            };
            if ("attach" == b || "detach" == b) return function () {
              Xa(b + "() does not work while casting!");
              return Promise.resolve();
            };
          }
          return a.g.ta() && 0 == Object.keys(a.g.g.video).length && (Jn[b] || Kn[b]) || !a.g.ta() ? a.h[b].bind(a.h) : a.g.get("player", b);
        }
        function jo(a, b, c) {
          a.g.ta() && ("video" == b ? a.j.dispatchEvent(c) : "player" == b && a.o.dispatchEvent(c));
        }
        K("shaka.cast.CastProxy", go);
        go.prototype.changeReceiverId = go.prototype.rf;
        go.prototype.forceDisconnect = go.prototype.Bb;
        go.prototype.suggestDisconnect = go.prototype.Bg;
        go.prototype.setAppData = go.prototype.ke;
        go.prototype.cast = go.prototype.cast;
        go.prototype.receiverName = go.prototype.ce;
        go.prototype.isCasting = go.prototype.ta;
        go.prototype.canCast = go.prototype.pf;
        go.prototype.getPlayer = go.prototype.Of;
        go.prototype.getVideo = go.prototype.Xf;
        go.prototype.destroy = go.prototype.destroy;
        function ro(a, b, c, d) {
          Te.call(this);
          var e = this;
          this.g = a;
          this.h = b;
          this.j = new lf();
          this.H = {
            video: a,
            player: b
          };
          this.D = c || function () {};
          this.J = d || function (f) {
            return f;
          };
          this.i = null;
          this.F = !1;
          this.o = !0;
          this.m = 0;
          this.A = !1;
          this.u = !0;
          this.s = this.l = null;
          this.G = new P(function () {
            so(e);
          });
          to(this);
        }
        qa(ro, Te);
        r = ro.prototype;
        r.isConnected = function () {
          return this.F;
        };
        r.ag = function () {
          return this.o;
        };
        r.yg = function (a) {
          this.i = a;
        };
        r.vf = function () {
          this.i = null;
        };
        r.zg = function (a) {
          this.i || (this.i = {
            metadataType: cast.receiver.media.MetadataType.GENERIC
          });
          this.i.title = a;
        };
        r.xg = function (a) {
          this.i || (this.i = {
            metadataType: cast.receiver.media.MetadataType.GENERIC
          });
          this.i.images = [{
            url: a
          }];
        };
        r.wg = function (a) {
          this.i || (this.i = {});
          this.i.artist = a;
          this.i.metadataType = cast.receiver.media.MetadataType.MUSIC_TRACK;
        };
        r.destroy = function () {
          var a = this,
            b,
            c;
          return G(function (d) {
            if (1 == d.g) return a.j && (a.j.release(), a.j = null), b = [], a.h && (b.push(a.h.destroy()), a.h = null), a.G && (a.G.stop(), a.G = null), a.g = null, a.H = null, a.D = null, a.F = !1, a.o = !0, a.l = null, a.s = null, Te.prototype.release.call(a), u(d, Promise.all(b), 2);
            c = cast.receiver.CastReceiverManager.getInstance();
            c.stop();
            A(d);
          });
        };
        function to(a) {
          var b = cast.receiver.CastReceiverManager.getInstance();
          b.onSenderConnected = function () {
            return uo(a);
          };
          b.onSenderDisconnected = function () {
            return uo(a);
          };
          b.onSystemVolumeChanged = function () {
            var e = cast.receiver.CastReceiverManager.getInstance().getSystemVolume();
            e && vo(a, {
              type: "update",
              update: {
                video: {
                  volume: e.level,
                  muted: e.muted
                }
              }
            }, a.l);
            vo(a, {
              type: "event",
              targetName: "video",
              event: {
                type: "volumechange"
              }
            }, a.l);
          };
          a.s = b.getCastMessageBus("urn:x-cast:com.google.cast.media");
          a.s.onMessage = function (e) {
            return wo(a, e);
          };
          a.l = b.getCastMessageBus("urn:x-cast:com.google.shaka.v2");
          a.l.onMessage = function (e) {
            return xo(a, e);
          };
          b.start();
          b = t(Fn);
          for (var c = b.next(); !c.done; c = b.next()) a.j.C(a.g, c.value, function (e) {
            return yo(a, "video", e);
          });
          for (var d in Se) a.j.C(a.h, Se[d], function (e) {
            return yo(a, "player", e);
          });
          cast.__platform__ && cast.__platform__.canDisplayType('video/mp4; codecs="avc1.640028"; width=3840; height=2160') ? a.h.me(3840, 2160) : a.h.me(1920, 1080);
          a.j.C(a.g, "loadeddata", function () {
            a.A = !0;
          });
          a.j.C(a.h, "loading", function () {
            a.o = !1;
            zo(a);
          });
          a.j.C(a.g, "playing", function () {
            a.o = !1;
            zo(a);
          });
          a.j.C(a.g, "pause", function () {
            zo(a);
          });
          a.j.C(a.h, "unloading", function () {
            a.o = !0;
            zo(a);
          });
          a.j.C(a.g, "ended", function () {
            new P(function () {
              a.g && a.g.ended && (a.o = !0, zo(a));
            }).O(Ao);
          });
        }
        function uo(a) {
          a.m = 0;
          a.u = !0;
          a.F = 0 != cast.receiver.CastReceiverManager.getInstance().getSenders().length;
          zo(a);
        }
        function zo(a) {
          var b;
          G(function (c) {
            if (1 == c.g) return u(c, Promise.resolve(), 2);
            if (!a.h) return c.return();
            b = new S("caststatuschanged");
            a.dispatchEvent(b);
            Bo(a) || Co(a);
            A(c);
          });
        }
        function Do(a, b, c) {
          var d, e, f, g, h, k, l, m, p, n;
          G(function (q) {
            switch (q.g) {
              case 1:
                for (d in b.player) e = b.player[d], a.h[d](e);
                a.D(c);
                f = a.g.autoplay;
                return b.manifest ? (a.g.autoplay = !1, C(q, 5), u(q, a.h.load(b.manifest, b.startTime), 7)) : u(q, Promise.resolve(), 3);
              case 7:
                va(q, 3);
                break;
              case 5:
                return g = wa(q), h = new Map().set("detail", g), k = new S("error", h), a.h && a.h.dispatchEvent(k), q.return();
              case 3:
                if (!a.h) return q.return();
                for (l in b.video) m = b.video[l], a.g[l] = m;
                for (p in b.playerAfterLoad) n = b.playerAfterLoad[p], a.h[p](n);
                a.g.autoplay = f;
                b.manifest && (a.g.play(), Co(a));
                A(q);
            }
          });
        }
        function yo(a, b, c) {
          a.h && (so(a), vo(a, {
            type: "event",
            targetName: b,
            event: c
          }, a.l));
        }
        function so(a) {
          a.G.O(Eo);
          for (var b = {
              video: {},
              player: {}
            }, c = t(Gn), d = c.next(); !d.done; d = c.next()) d = d.value, b.video[d] = a.g[d];
          if (a.h.T()) for (var e in Ln) 0 == a.m % Ln[e] && (b.player[e] = a.h[e]());
          for (var f in Jn) 0 == a.m % Jn[f] && (b.player[f] = a.h[f]());
          if (c = cast.receiver.CastReceiverManager.getInstance().getSystemVolume()) b.video.volume = c.level, b.video.muted = c.muted;
          vo(a, {
            type: "update",
            update: b
          }, a.l);
          for (var g in Kn) 0 == a.m % Kn[g] && (b = {
            player: {}
          }, b.player[g] = a.h[g](), vo(a, {
            type: "update",
            update: b
          }, a.l));
          a.A && (a.m += 1);
          Bo(a);
        }
        function Bo(a) {
          return a.u && (a.g.duration || a.h.T()) ? (Fo(a), a.u = !1, !0) : !1;
        }
        function Fo(a, b) {
          var c = {
            contentId: a.h.Fd(),
            streamType: a.h.T() ? "LIVE" : "BUFFERED",
            contentType: ""
          };
          a.h.T() || (c.duration = a.g.duration);
          a.i && (c.metadata = a.i);
          Co(a, void 0 === b ? 0 : b, c);
        }
        function xo(a, b) {
          var c = Dn(b.data);
          switch (c.type) {
            case "init":
              a.m = 0;
              a.A = !1;
              a.u = !0;
              Do(a, c.initState, c.appData);
              so(a);
              break;
            case "appData":
              a.D(c.appData);
              break;
            case "set":
              var d = c.targetName,
                e = c.property;
              c = c.value;
              if ("video" == d) if (b = cast.receiver.CastReceiverManager.getInstance(), "volume" == e) {
                b.setSystemVolumeLevel(c);
                break;
              } else if ("muted" == e) {
                b.setSystemVolumeMuted(c);
                break;
              }
              a.H[d][e] = c;
              break;
            case "call":
              d = a.H[c.targetName];
              d[c.methodName].apply(d, c.args);
              break;
            case "asyncCall":
              d = c.targetName;
              e = c.methodName;
              "player" == d && "load" == e && (a.m = 0, a.A = !1);
              var f = c.id,
                g = b.senderId;
              b = a.H[d];
              c = b[e].apply(b, c.args);
              "player" == d && "load" == e && (c = c.then(function () {
                a.u = !0;
              }));
              c.then(function () {
                return Go(a, g, f, null);
              }, function (h) {
                return Go(a, g, f, h);
              });
          }
        }
        function wo(a, b) {
          var c = Dn(b.data);
          switch (c.type) {
            case "PLAY":
              a.g.play();
              Co(a);
              break;
            case "PAUSE":
              a.g.pause();
              Co(a);
              break;
            case "SEEK":
              b = c.currentTime;
              var d = c.resumeState;
              null != b && (a.g.currentTime = Number(b));
              d && "PLAYBACK_START" == d ? (a.g.play(), Co(a)) : d && "PLAYBACK_PAUSE" == d && (a.g.pause(), Co(a));
              break;
            case "STOP":
              a.h.se().then(function () {
                a.h && Co(a);
              });
              break;
            case "GET_STATUS":
              Fo(a, Number(c.requestId));
              break;
            case "VOLUME":
              d = c.volume;
              b = d.level;
              d = d.muted;
              var e = a.g.volume,
                f = a.g.muted;
              null != b && (a.g.volume = Number(b));
              null != d && (a.g.muted = d);
              e == a.g.volume && f == a.g.muted || Co(a);
              break;
            case "LOAD":
              a.m = 0;
              a.A = !1;
              a.u = !1;
              b = c.media;
              d = c.currentTime;
              e = a.J(b.contentId);
              f = c.autoplay || !0;
              a.D(b.customData);
              f && (a.g.autoplay = !0);
              a.h.load(e, d).then(function () {
                a.h && Fo(a);
              }).catch(function (g) {
                var h = "LOAD_FAILED";
                7 == g.category && 7E3 == g.code && (h = "LOAD_CANCELLED");
                vo(a, {
                  requestId: Number(c.requestId),
                  type: h
                }, a.s);
              });
              break;
            default:
              vo(a, {
                requestId: Number(c.requestId),
                type: "INVALID_REQUEST",
                reason: "INVALID_COMMAND"
              }, a.s);
          }
        }
        function Go(a, b, c, d) {
          a.h && vo(a, {
            type: "asyncComplete",
            id: c,
            error: d
          }, a.l, b);
        }
        function vo(a, b, c, d) {
          a.F && (a = Cn(b), d ? c.getCastChannel(d).send(a) : c.broadcast(a));
        }
        function Co(a, b, c) {
          c = void 0 === c ? null : c;
          var d = {
            mediaSessionId: 0,
            playbackRate: a.g.playbackRate,
            playerState: a.o ? Ho : a.h.Hd() ? Io : a.g.paused ? Jo : Ko,
            currentTime: a.g.currentTime,
            supportedMediaCommands: 63,
            volume: {
              level: a.g.volume,
              muted: a.g.muted
            }
          };
          c && (d.media = c);
          vo(a, {
            requestId: void 0 === b ? 0 : b,
            type: "MEDIA_STATUS",
            status: [d]
          }, a.s);
        }
        K("shaka.cast.CastReceiver", ro);
        ro.prototype.destroy = ro.prototype.destroy;
        ro.prototype.setContentArtist = ro.prototype.wg;
        ro.prototype.setContentImage = ro.prototype.xg;
        ro.prototype.setContentTitle = ro.prototype.zg;
        ro.prototype.clearContentMetadata = ro.prototype.vf;
        ro.prototype.setContentMetadata = ro.prototype.yg;
        ro.prototype.isIdle = ro.prototype.ag;
        ro.prototype.isConnected = ro.prototype.isConnected;
        var Eo = .5,
          Ao = 5,
          Ho = "IDLE",
          Ko = "PLAYING",
          Io = "BUFFERING",
          Jo = "PAUSED";
        function Lo(a, b, c) {
          var d = Mo(a),
            e = null;
          a = [];
          var f = [],
            g = new Set(d.map(function (h) {
              return h.keyId;
            }));
          g.delete(null);
          if (1 < g.size) throw new O(2, 4, 4010);
          b || (f = d.filter(function (h) {
            return "urn:mpeg:dash:mp4protection:2011" == h.he ? (e = h.init || e, !1) : !0;
          }), f.length && (a = No(e, f, c, g), 0 == a.length && (a = [ec("", e)])));
          if (d.length && (b || !f.length)) for (a = [], b = t(Object.values(c)), c = b.next(); !c.done; c = b.next()) c = c.value, "org.w3.clearkey" != c && a.push(ec(c, e));
          if (g = Array.from(g)[0] || null) for (b = t(a), c = b.next(); !c.done; c = b.next()) for (c = t(c.value.initData), d = c.next(); !d.done; d = c.next()) d.value.keyId = g;
          return {
            Ce: g,
            th: e,
            drmInfos: a,
            Ge: !0
          };
        }
        function Oo(a, b, c, d) {
          var e = Lo(a, c, d);
          if (b.Ge) {
            a = 1 == b.drmInfos.length && !b.drmInfos[0].keySystem;
            c = 0 == e.drmInfos.length;
            if (0 == b.drmInfos.length || a && !c) b.drmInfos = e.drmInfos;
            b.Ge = !1;
          } else if (0 < e.drmInfos.length && (b.drmInfos = b.drmInfos.filter(function (f) {
            return e.drmInfos.some(function (g) {
              return g.keySystem == f.keySystem;
            });
          }), 0 == b.drmInfos.length)) throw new O(2, 4, 4008);
          return e.Ce || b.Ce;
        }
        function Po(a) {
          var b = 0,
            c = Jb(a),
            d = c.getUint32(b, !0);
          if (d != a.byteLength) return [];
          a: {
            a = b + 6;
            for (b = []; a < c.byteLength - 1;) {
              d = c.getUint16(a, !0);
              a += 2;
              var e = c.getUint16(a, !0);
              a += 2;
              if (0 != (e & 1) || e + a > c.byteLength) {
                c = [];
                break a;
              }
              var f = L(c, a, e);
              b.push({
                type: d,
                value: f
              });
              a += e;
            }
            c = b;
          }
          return c;
        }
        function Qo(a) {
          a = t(a.getElementsByTagName("DATA"));
          for (var b = a.next(); !b.done; b = a.next()) {
            b = t(b.value.childNodes);
            for (var c = b.next(); !c.done; c = b.next()) if (c = c.value, c instanceof Element && "LA_URL" == c.tagName) return c.textContent;
          }
          return "";
        }
        function Ro(a) {
          a = Mf(a.node, "urn:microsoft:playready", "pro");
          if (!a) return "";
          a = Kc(a.textContent);
          a = Po(a).filter(function (b) {
            return b.type === So;
          })[0];
          if (!a) return "";
          a = Cc(a.value, !0);
          return (a = bg(a, "WRMHEADER")) ? Qo(a) : "";
        }
        function No(a, b, c, d) {
          var e = [];
          b = t(b);
          for (var f = b.next(); !f.done; f = b.next()) {
            f = f.value;
            var g = c[f.he];
            if (g) {
              var h;
              if (h = Mf(f.node, "urn:microsoft:playready", "pro")) {
                h = Kc(h.textContent);
                var k = new Uint8Array([154, 4, 240, 121, 152, 64, 66, 134, 171, 146, 230, 91, 224, 136, 95, 149]);
                h = [{
                  initData: Jf(h, k, new Set(), 0),
                  initDataType: "cenc",
                  keyId: f.keyId
                }];
              } else h = null;
              k = null;
              if ("urn:uuid:e2719d58-a985-b3c9-781a-b030af78d30e" === f.he) if (k = d, 0 == k.size) k = null;else {
                var l = new Uint8Array([16, 119, 239, 236, 192, 178, 77, 2, 172, 227, 60, 30, 82, 226, 251, 75]),
                  m = new Uint8Array([]);
                k = [{
                  initData: Jf(m, l, k, 1),
                  initDataType: "cenc",
                  keyId: f.keyId
                }];
              }
              h = ec(g, f.init || a || h || k);
              if (g = To.get(g)) h.licenseServerUri = g(f);
              e.push(h);
            }
          }
          return e;
        }
        function Mo(a) {
          var b = [];
          a = t(a);
          for (var c = a.next(); !c.done; c = a.next()) (c = Uo(c.value)) && b.push(c);
          return b;
        }
        function Uo(a) {
          var b = a.getAttribute("schemeIdUri"),
            c = Pf(a, "urn:mpeg:cenc:2013", "default_KID"),
            d = Nf(a, "urn:mpeg:cenc:2013", "pssh").map(Rf);
          if (!b) return null;
          b = b.toLowerCase();
          if (c && (c = c.replace(/-/g, "").toLowerCase(), c.includes(" "))) throw new O(2, 4, 4009);
          var e = [];
          try {
            e = d.map(function (f) {
              return {
                initDataType: "cenc",
                initData: Kc(f),
                keyId: null
              };
            });
          } catch (f) {
            throw new O(2, 4, 4007);
          }
          return {
            node: a,
            he: b,
            keyId: c,
            init: 0 < e.length ? e : null
          };
        }
        var So = 1,
          To = new Map().set("com.widevine.alpha", function (a) {
            return (a = Mf(a.node, "urn:microsoft", "laurl")) ? a.getAttribute("licenseUrl") || "" : "";
          }).set("com.microsoft.playready", Ro).set("com.microsoft.playready.recommendation", Ro).set("com.microsoft.playready.software", Ro).set("com.microsoft.playready.hardware", Ro).set("org.w3.clearkey", function (a) {
            return (a = Mf(a.node, "http://dashif.org/guidelines/clearKey", "Laurl")) && "EME-1.0" === a.getAttribute("Lic_type") && a.textContent ? a.textContent : "";
          });
        function Vo(a, b, c, d, e) {
          var f = {
            RepresentationID: b,
            Number: c,
            Bandwidth: d,
            Time: e
          };
          return a.replace(/\$(RepresentationID|Number|Bandwidth|Time)?(?:%0([0-9]+)([diouxX]))?\$/g, function (g, h, k, l) {
            if ("$$" == g) return "$";
            var m = f[h];
            if (null == m) return g;
            "RepresentationID" == h && k && (k = void 0);
            "Time" == h && (m = Math.round(m));
            switch (l) {
              case void 0:
              case "d":
              case "i":
              case "u":
                g = m.toString();
                break;
              case "o":
                g = m.toString(8);
                break;
              case "x":
                g = m.toString(16);
                break;
              case "X":
                g = m.toString(16).toUpperCase();
                break;
              default:
                g = m.toString();
            }
            k = window.parseInt(k, 10) || 1;
            return Array(Math.max(0, k - g.length) + 1).join("0") + g;
          });
        }
        function Wo(a, b) {
          var c = Xo(a, b, "timescale"),
            d = 1;
          c && (d = Yf(c) || 1);
          var e = Xo(a, b, "duration");
          c = Yf(e || "");
          "image" == a.I.contentType && (c = $f(e || ""));
          c && (c /= d);
          var f = Xo(a, b, "startNumber");
          e = Number(Xo(a, b, "presentationTimeOffset")) || 0;
          var g = Zf(f || "");
          if (null == f || null == g) g = 1;
          f = Yo(a, b, "SegmentTimeline");
          b = null;
          if (f) {
            b = d;
            a = a.U.duration || Infinity;
            f = Lf(f, "S");
            for (var h = [], k = -e, l = 0; l < f.length; ++l) {
              var m = f[l],
                p = f[l + 1],
                n = Tf(m, "t", Zf),
                q = Tf(m, "d", Zf);
              m = Tf(m, "r", Xf);
              null != n && (n -= e);
              if (!q) break;
              n = null != n ? n : k;
              m = m || 0;
              if (0 > m) if (p) {
                p = Tf(p, "t", Zf);
                if (null == p) break;else if (n >= p) break;
                m = Math.ceil((p - n) / q) - 1;
              } else {
                if (Infinity == a) break;else if (n / b >= a) break;
                m = Math.ceil((a * b - n) / q) - 1;
              }
              0 < h.length && n != k && (h[h.length - 1].end = n / b);
              for (p = 0; p <= m; ++p) k = n + q, h.push({
                start: n / b,
                end: k / b,
                Fg: n
              }), n = k;
            }
            b = h;
          }
          return {
            timescale: d,
            ja: c,
            Mb: g,
            Sa: e / d || 0,
            te: e,
            timeline: b
          };
        }
        function Xo(a, b, c) {
          return [b(a.I), b(a.fa), b(a.aa)].filter(cc).map(function (d) {
            return d.getAttribute(c);
          }).reduce(function (d, e) {
            return d || e;
          });
        }
        function Yo(a, b, c) {
          return [b(a.I), b(a.fa), b(a.aa)].filter(cc).map(function (d) {
            return Kf(d, c);
          }).reduce(function (d, e) {
            return d || e;
          });
        }
        function Zo(a, b, c, d, e, f) {
          for (var g = Pf(a, "http://www.w3.org/1999/xlink", "href"), h = Pf(a, "http://www.w3.org/1999/xlink", "actuate") || "onRequest", k = t(Array.from(a.attributes)), l = k.next(); !l.done; l = k.next()) l = l.value, "http://www.w3.org/1999/xlink" == l.namespaceURI && a.removeAttributeNS(l.namespaceURI, l.localName);
          if (5 <= f) return Le(new O(2, 4, 4028));
          if ("onLoad" != h) return Le(new O(2, 4, 4027));
          var m = dc([d], [g]);
          return e.request(0, bf(m, b)).Z(function (p) {
            p = dg(p.data, a.tagName);
            if (!p) return Le(new O(2, 4, 4001, g));
            for (; a.childNodes.length;) a.removeChild(a.childNodes[0]);
            for (; p.childNodes.length;) {
              var n = p.childNodes[0];
              p.removeChild(n);
              a.appendChild(n);
            }
            p = t(Array.from(p.attributes));
            for (n = p.next(); !n.done; n = p.next()) a.setAttributeNode(n.value.cloneNode(!1));
            return $o(a, b, c, m[0], e, f + 1);
          });
        }
        function $o(a, b, c, d, e, f) {
          f = void 0 === f ? 0 : f;
          if (Pf(a, "http://www.w3.org/1999/xlink", "href")) {
            var g = Zo(a, b, c, d, e, f);
            c && (g = g.Z(void 0, function () {
              return $o(a, b, c, d, e, f);
            }));
            return g;
          }
          g = [];
          for (var h = t(Array.from(a.childNodes)), k = h.next(); !k.done; k = h.next()) k = k.value, k instanceof Element && ("urn:mpeg:dash:resolve-to-zero:2013" == Pf(k, "http://www.w3.org/1999/xlink", "href") ? a.removeChild(k) : "SegmentTimeline" != k.tagName && g.push($o(k, b, c, d, e, f)));
          return Pe(g).Z(function () {
            return a;
          });
        }
        function ap(a, b, c, d, e, f, g) {
          var h,
            k = new yf().R("sidx", function (l) {
              h = bp(b, d, e, f, g, c, l);
            });
          a && k.parse(a);
          if (h) return h;
          throw new O(2, 3, 3004);
        }
        function bp(a, b, c, d, e, f, g) {
          var h = [];
          g.reader.skip(4);
          var k = g.reader.K();
          if (0 == k) throw new O(2, 3, 3005);
          if (0 == g.version) {
            var l = g.reader.K();
            var m = g.reader.K();
          } else l = g.reader.$a(), m = g.reader.$a();
          g.reader.skip(2);
          var p = g.reader.be();
          a = a + g.size + m;
          for (m = 0; m < p; m++) {
            var n = g.reader.K(),
              q = (n & 2147483648) >>> 31;
            n &= 2147483647;
            var v = g.reader.K();
            g.reader.skip(4);
            if (1 == q) throw new O(2, 3, 3006);
            h.push(new T(l / k + c, (l + v) / k + c, function () {
              return f;
            }, a, a + n - 1, b, c, d, e));
            l += v;
            a += n;
          }
          g.parser.stop();
          return h;
        }
        function cp(a) {
          this.h = Jb(a);
          this.g = new vf(this.h, 0);
        }
        cp.prototype.ha = function () {
          return this.g.ha();
        };
        function dp(a) {
          var b = ep(a);
          if (7 < b.length) throw new O(2, 3, 3002);
          var c = 0;
          b = t(b);
          for (var d = b.next(); !d.done; d = b.next()) c = 256 * c + d.value;
          b = ep(a);
          a: {
            d = t(fp);
            for (var e = d.next(); !e.done; e = d.next()) if (Fb(b, new Uint8Array(e.value))) {
              d = !0;
              break a;
            }
            d = !1;
          }
          if (d) b = a.h.byteLength - a.g.$();else {
            if (8 == b.length && b[1] & 224) throw new O(2, 3, 3001);
            for (e = d = 0; e < b.length; e++) {
              var f = b[e];
              d = 0 == e ? f & (1 << 8 - b.length) - 1 : 256 * d + f;
            }
            b = d;
          }
          b = a.g.$() + b <= a.h.byteLength ? b : a.h.byteLength - a.g.$();
          d = Jb(a.h, a.g.$(), b);
          a.g.skip(b);
          return new gp(c, d);
        }
        function ep(a) {
          var b = a.g.$(),
            c = a.g.Ra();
          if (0 == c) throw new O(2, 3, 3002);
          c = 8 - Math.floor(Math.log2(c));
          a.g.skip(c - 1);
          return L(a.h, b, c);
        }
        var fp = [[255], [127, 255], [63, 255, 255], [31, 255, 255, 255], [15, 255, 255, 255, 255], [7, 255, 255, 255, 255, 255], [3, 255, 255, 255, 255, 255, 255], [1, 255, 255, 255, 255, 255, 255, 255]];
        function gp(a, b) {
          this.id = a;
          this.g = b;
        }
        function hp(a) {
          if (8 < a.g.byteLength) throw new O(2, 3, 3002);
          if (8 == a.g.byteLength && a.g.getUint8(0) & 224) throw new O(2, 3, 3001);
          for (var b = 0, c = 0; c < a.g.byteLength; c++) {
            var d = a.g.getUint8(c);
            b = 256 * b + d;
          }
          return b;
        }
        function ip(a, b, c, d, e, f, g, h, k) {
          function l() {
            return e;
          }
          var m = [];
          a = new cp(a.g);
          for (var p = null, n = null; a.ha();) {
            var q = dp(a);
            if (187 == q.id) {
              var v = jp(q);
              v && (q = c * v.Gg, v = b + v.pg, null != p && m.push(new T(p + g, q + g, l, n, v - 1, f, g, h, k)), p = q, n = v);
            }
          }
          null != p && m.push(new T(p + g, d + g, l, n, null, f, g, h, k));
          return m;
        }
        function jp(a) {
          var b = new cp(a.g);
          a = dp(b);
          if (179 != a.id) throw new O(2, 3, 3013);
          a = hp(a);
          b = dp(b);
          if (183 != b.id) throw new O(2, 3, 3012);
          b = new cp(b.g);
          for (var c = 0; b.ha();) {
            var d = dp(b);
            if (241 == d.id) {
              c = hp(d);
              break;
            }
          }
          return {
            Gg: a,
            pg: c
          };
        }
        function kp(a, b) {
          b = Yo(a, b, "Initialization");
          if (!b) return null;
          var c = a.I.wa,
            d = b.getAttribute("sourceURL");
          d && (c = dc(a.I.wa, [d]));
          d = 0;
          var e = null;
          if (b = Tf(b, "range", Wf)) d = b.start, e = b.end;
          return new pi(function () {
            return c;
          }, d, e, lp(a));
        }
        function mp(a, b) {
          var c = Number(Xo(a, np, "presentationTimeOffset")) || 0,
            d = Xo(a, np, "timescale"),
            e = 1;
          d && (e = Yf(d) || 1);
          var f = c / e || 0,
            g = kp(a, np);
          op(a, g);
          var h = Ve(a);
          return {
            Cb: function () {
              var k = Yo(h, np, "RepresentationIndex");
              var l = h.I.wa;
              k && (k = k.getAttribute("sourceURL")) && (l = dc(h.I.wa, [k]));
              k = pp(h);
              return qp(h, b, g, l, k.start, k.end, f);
            }
          };
        }
        function qp(a, b, c, d, e, f, g) {
          var h, k, l, m, p, n, q, v, y, w, x, D, z, B, E;
          return G(function (F) {
            if (1 == F.g) return h = a.presentationTimeline, k = !a.Wa || !a.U.Id, l = a.U.start, m = a.U.duration, p = a.I.mimeType.split("/")[1], n = b, q = null, v = [n(d, e, f), "webm" == p ? n(c.ya(), c.Ba, c.ma) : null], n = null, u(F, Promise.all(v), 2);
            y = F.h;
            w = y[0];
            x = y[1] || null;
            D = null;
            z = l - g;
            B = l;
            E = m ? l + m : Infinity;
            if ("mp4" == p) var H = ap(w, e, d, c, z, B, E);else {
              H = new cp(x);
              if (440786851 != dp(H).id) throw new O(2, 3, 3008);
              var I = dp(H);
              if (408125543 != I.id) throw new O(2, 3, 3009);
              H = I.g.byteOffset;
              I = new cp(I.g);
              for (var J = null; I.ha();) {
                var N = dp(I);
                if (357149030 == N.id) {
                  J = N;
                  break;
                }
              }
              if (!J) throw new O(2, 3, 3010);
              J = new cp(J.g);
              N = 1E6;
              for (I = null; J.ha();) {
                var R = dp(J);
                if (2807729 == R.id) N = hp(R);else if (17545 == R.id) if (4 == R.g.byteLength) I = R.g.getFloat32(0);else if (8 == R.g.byteLength) I = R.g.getFloat64(0);else throw new O(2, 3, 3003);
              }
              if (null == I) throw new O(2, 3, 3011);
              J = N / 1E9;
              I *= J;
              N = dp(new cp(w));
              if (475249515 != N.id) throw new O(2, 3, 3007);
              H = ip(N, H, J, I, d, c, z, B, E);
            }
            D = H;
            h.Jb(D);
            q = new Jj(D);
            k && q.Xa(B, E, !0);
            return F.return(q);
          });
        }
        function np(a) {
          return a.xc;
        }
        function pp(a) {
          var b = Yo(a, np, "RepresentationIndex");
          a = Xo(a, np, "indexRange");
          a = Wf(a || "");
          b && (a = Tf(b, "range", Wf, a));
          return a;
        }
        function op(a, b) {
          rp(a, b);
          if (!pp(a)) throw new O(2, 4, 4002);
        }
        function rp(a, b) {
          var c = a.I.mimeType.split("/")[1];
          if (a.I.contentType != ic && "mp4" != c && "webm" != c) throw new O(2, 4, 4006);
          if ("webm" == c && !b) throw new O(2, 4, 4005);
        }
        function lp(a) {
          var b = a.I;
          return {
            bandwidth: a.bandwidth,
            audioSamplingRate: b.audioSamplingRate,
            codecs: b.codecs,
            contentType: b.contentType,
            frameRate: b.frameRate || null,
            height: b.height || null,
            mimeType: b.mimeType,
            channelsCount: b.bd,
            pixelAspectRatio: b.pixelAspectRatio || null,
            width: b.width || null
          };
        }
        function sp(a, b) {
          var c = kp(a, tp),
            d = up(a);
          if (!d.ja && !d.timeline && 1 < d.Hb.length) throw new O(2, 4, 4002);
          if (!d.ja && !a.U.duration && !d.timeline && 1 == d.Hb.length) throw new O(2, 4, 4002);
          if (d.timeline && 0 == d.timeline.length) throw new O(2, 4, 4002);
          var e = null,
            f = null;
          a.aa.id && a.I.id && (f = b[a.aa.id + "," + a.I.id]) && (e = f.segmentIndex);
          var g = vp(a.U.start, a.U.duration, a.I.wa, d, c);
          b = !e;
          e ? e.Ib(g, a.presentationTimeline.Oa()) : e = new Jj(g);
          a.presentationTimeline.Jb(g);
          a.Wa && a.U.Id || e.Xa(a.U.start, a.U.duration ? a.U.start + a.U.duration : Infinity, b);
          f && (f.segmentIndex = e);
          return {
            Cb: function () {
              e && 0 != e.g.length || e.qc(g);
              return Promise.resolve(e);
            }
          };
        }
        function tp(a) {
          return a.ab;
        }
        function up(a) {
          var b = wp(a);
          a = Wo(a, tp);
          var c = a.Mb;
          0 == c && (c = 1);
          var d = 0;
          a.ja ? d = a.ja * (c - 1) : a.timeline && 0 < a.timeline.length && (d = a.timeline[0].start);
          return {
            ja: a.ja,
            startTime: d,
            Mb: c,
            Sa: a.Sa,
            timeline: a.timeline,
            Hb: b
          };
        }
        function vp(a, b, c, d, e) {
          var f = d.Hb.length;
          d.timeline && d.timeline.length != d.Hb.length && (f = Math.min(d.timeline.length, d.Hb.length));
          for (var g = a - d.Sa, h = b ? a + b : Infinity, k = [], l = d.startTime, m = {}, p = 0; p < f; m = {
            qd: m.qd
          }, p++) {
            var n = d.Hb[p];
            m.qd = dc(c, [n.fg]);
            var q = void 0;
            q = null != d.ja ? l + d.ja : d.timeline ? d.timeline[p].end : l + b;
            k.push(new T(a + l, a + q, function (v) {
              return function () {
                return v.qd;
              };
            }(m), n.start, n.end, e, g, a, h));
            l = q;
          }
          return k;
        }
        function wp(a) {
          return [a.I.ab, a.fa.ab, a.aa.ab].filter(cc).map(function (b) {
            return Lf(b, "SegmentURL");
          }).reduce(function (b, c) {
            return 0 < b.length ? b : c;
          }).map(function (b) {
            b.getAttribute("indexRange") && !a.Le && (a.Le = !0);
            var c = b.getAttribute("media");
            b = Tf(b, "mediaRange", Wf, {
              start: 0,
              end: null
            });
            return {
              fg: c,
              start: b.start,
              end: b.end
            };
          });
        }
        function xp(a, b, c, d, e, f) {
          var g = yp(a),
            h = zp(a);
          Ap(h);
          var k = Ve(a);
          if (h.pc) return rp(a, g), {
            Cb: function () {
              var q = Vo(h.pc, k.I.id, null, k.bandwidth || null, null);
              q = dc(k.I.wa, [q]);
              return qp(k, b, g, q, 0, null, h.Sa);
            }
          };
          if (h.ja) return d || "image" === a.fa.contentType || (a.presentationTimeline.Ud(h.ja), a.presentationTimeline.Vd(a.U.start)), {
            Cb: function () {
              return Bp(k, h, e, g, f);
            }
          };
          var l = null;
          d = d = null;
          a.aa.id && a.I.id && (d = a.aa.id + "," + a.I.id, d = c[d]) && (l = d.segmentIndex);
          var m = Cp(k, h, g);
          c = a.U.start;
          var p = a.U.duration ? a.U.start + a.U.duration : Infinity,
            n = !(a.Wa && a.U.Id);
          l ? (n && new Jj(m).Xa(c, p, !0), l.Ib(m, a.presentationTimeline.Oa())) : l = new Jj(m);
          a.presentationTimeline.Jb(m);
          n && l.Xa(c, p);
          d && a.Wa && (d.segmentIndex = l);
          return {
            Cb: function () {
              l && 0 != l.g.length || l.qc(m);
              return Promise.resolve(l);
            }
          };
        }
        function Dp(a) {
          return a.yc;
        }
        function zp(a) {
          var b = Wo(a, Dp),
            c = Xo(a, Dp, "media");
          a = Xo(a, Dp, "index");
          return {
            ja: b.ja,
            timescale: b.timescale,
            Mb: b.Mb,
            Sa: b.Sa,
            te: b.te,
            timeline: b.timeline,
            Rd: c,
            pc: a
          };
        }
        function Ap(a) {
          var b = a.pc ? 1 : 0;
          b += a.timeline ? 1 : 0;
          b += a.ja ? 1 : 0;
          if (0 == b) throw new O(2, 4, 4002);
          1 != b && (a.pc && (a.timeline = null), a.ja = null);
          if (!a.pc && !a.Rd) throw new O(2, 4, 4002);
        }
        function Bp(a, b, c, d, e) {
          function f(J) {
            var N = (J - q) * n,
              R = N + b.Sa,
              Q = N + l;
            N = Q + n;
            var ba = Math.min(N, h());
            Q = new T(Q, ba, function () {
              var M = Vo(y, x, J, w, R * v);
              return dc(D, [M]);
            }, 0, null, d, z, l, h());
            Q.l = N;
            return Q;
          }
          function g() {
            var J = [Math.max(k.Oa(), l), Math.min(k.gb(), h())].map(function (N) {
              return N - l;
            });
            return [Math.ceil(J[0] / n), Math.ceil(J[1] / n) - 1].map(function (N) {
              return N + q;
            });
          }
          function h() {
            var J = null != m && e[m] || p;
            return J ? l + J : Infinity;
          }
          var k = a.presentationTimeline,
            l = a.U.start,
            m = a.aa.id,
            p = a.U.duration,
            n = b.ja,
            q = b.Mb,
            v = b.timescale,
            y = b.Rd,
            w = a.bandwidth || null,
            x = a.I.id,
            D = a.I.wa,
            z = l - b.Sa,
            B = g();
          a = a.Wa ? Math.max(B[0], B[1] - c + 1) : B[0];
          B = B[1];
          c = [];
          for (var E = a; E <= B; ++E) {
            var F = f(E);
            c.push(F);
          }
          var H = new Jj(c);
          c = k.gb() < h();
          E = k.T();
          if (c || E) {
            var I = Math.max(a, B + 1);
            H.hd(n, function () {
              var J = k.Oa();
              H.eb(J);
              var N = t(g());
              N.next();
              N = N.next().value;
              for (var R = []; I <= N;) {
                var Q = f(I);
                R.push(Q);
                I++;
              }
              return J > h() && !R.length ? null : R;
            });
          }
          return Promise.resolve(H);
        }
        function Cp(a, b, c) {
          var d = a.U.start,
            e = a.U.duration,
            f = d - b.Sa;
          e = e ? d + e : Infinity;
          for (var g = [], h = {}, k = 0; k < b.timeline.length; h = {
            pd: h.pd,
            td: h.td,
            wd: h.wd,
            md: h.md,
            yd: h.yd,
            nd: h.nd
          }, k++) {
            var l = b.timeline[k],
              m = l.start,
              p = l.Fg;
            l = l.end;
            h.wd = k + b.Mb;
            h.yd = p + b.te;
            h.td = a.I.id;
            h.md = a.bandwidth || null;
            h.pd = b.Rd;
            h.nd = a.I.wa;
            g.push(new T(d + m, d + l, function (n) {
              return function () {
                var q = Vo(n.pd, n.td, n.wd, n.md || null, n.yd);
                return dc(n.nd, [q]).map(function (v) {
                  return v.toString();
                });
              };
            }(h), 0, null, c, f, d, e));
          }
          return g;
        }
        function yp(a) {
          var b = Xo(a, Dp, "initialization");
          if (!b) return null;
          var c = a.I.id,
            d = a.bandwidth || null,
            e = a.I.wa;
          return new pi(function () {
            var f = Vo(b, c, null, d, null);
            return dc(e, [f]);
          }, 0, null, lp(a));
        }
        function Ep() {
          this.l = [];
          this.g = [];
          this.h = [];
          this.j = [];
          this.i = [];
          this.m = new Set();
        }
        Ep.prototype.release = function () {
          for (var a = t(this.g.concat(this.h, this.j, this.i)), b = a.next(); !b.done; b = a.next()) b = b.value, b.segmentIndex && b.segmentIndex.release();
          this.g = [];
          this.h = [];
          this.j = [];
          this.i = [];
          this.l = [];
        };
        function Fp(a, b, c) {
          var d, e, f, g, h, k, l, m, p, n, q, v, y, w, x, D, z, B, E, F, H, I, J, N, R, Q, ba, M, ka, Fa;
          return G(function (xa) {
            switch (xa.g) {
              case 1:
                d = jc;
                Gp(b);
                Hp(b);
                Ip(b);
                Jp(b);
                if (!c && 1 == b.length) {
                  e = b[0];
                  a.g = e.Lc;
                  a.h = e.jd;
                  a.j = e.textStreams;
                  a.i = e.imageStreams;
                  xa.B(2);
                  break;
                }
                f = -1;
                for (g = 0; g < b.length; g++) h = b[g], a.m.has(h.id) || (a.m.add(h.id), -1 == f && (f = g));
                if (-1 == f) return xa.return();
                k = b.map(function (Na) {
                  return Na.Lc;
                });
                l = b.map(function (Na) {
                  return Na.jd;
                });
                m = b.map(function (Na) {
                  return Na.textStreams;
                });
                p = b.map(function (Na) {
                  return Na.imageStreams;
                });
                n = t(m);
                for (q = n.next(); !q.done; q = n.next()) v = q.value, v.push(Kp(d.X));
                y = t(p);
                for (w = y.next(); !w.done; w = y.next()) x = w.value, x.push(Kp(d.Xb));
                return u(xa, Lp(a.g, k, f, Mp, Np), 3);
              case 3:
                return u(xa, Lp(a.h, l, f, Mp, Np), 4);
              case 4:
                return u(xa, Lp(a.j, m, f, Mp, Np), 5);
              case 5:
                return u(xa, Lp(a.i, p, f, Mp, Np), 2);
              case 2:
                D = 0;
                z = [];
                if (a.h.length && a.g.length) for (J = t(a.g), N = J.next(); !N.done; N = J.next()) for (R = N.value, Q = t(a.h), ba = Q.next(); !ba.done; ba = Q.next()) M = ba.value, ka = Og(R.drmInfos, M.drmInfos), R.drmInfos.length && M.drmInfos.length && !ka.length || (Fa = D++, z.push({
                  id: Fa,
                  language: R.language,
                  primary: R.primary,
                  audio: R,
                  video: M,
                  bandwidth: (R.bandwidth || 0) + (M.bandwidth || 0),
                  drmInfos: ka,
                  allowedByApplication: !0,
                  allowedByKeySystem: !0,
                  decodingInfos: []
                }));else for (B = a.h.concat(a.g), E = t(B), F = E.next(); !F.done; F = E.next()) H = F.value, I = D++, z.push({
                  id: I,
                  language: H.language,
                  primary: H.primary,
                  audio: H.type == d.Ic ? H : null,
                  video: H.type == d.va ? H : null,
                  bandwidth: H.bandwidth || 0,
                  drmInfos: H.drmInfos,
                  allowedByApplication: !0,
                  allowedByKeySystem: !0,
                  decodingInfos: []
                });
                a.l = z;
                A(xa);
            }
          });
        }
        function Gp(a) {
          a = t(a);
          for (var b = a.next(); !b.done; b = a.next()) {
            b = b.value;
            for (var c = [], d = t(b.Lc), e = d.next(); !e.done; e = d.next()) {
              e = e.value;
              for (var f = !1, g = t(c), h = g.next(); !h.done; h = g.next()) h = h.value, e.id != h.id && e.channelsCount == h.channelsCount && e.language == h.language && e.bandwidth == h.bandwidth && e.label == h.label && e.codecs == h.codecs && e.mimeType == h.mimeType && hb(e.roles, h.roles) && e.audioSamplingRate == h.audioSamplingRate && e.primary == h.primary && (f = !0);
              f || c.push(e);
            }
            b.Lc = c;
          }
        }
        function Ip(a) {
          a = t(a);
          for (var b = a.next(); !b.done; b = a.next()) {
            b = b.value;
            for (var c = [], d = t(b.textStreams), e = d.next(); !e.done; e = d.next()) {
              e = e.value;
              for (var f = !1, g = t(c), h = g.next(); !h.done; h = g.next()) h = h.value, e.id != h.id && e.language == h.language && e.label == h.label && e.codecs == h.codecs && e.mimeType == h.mimeType && e.bandwidth == h.bandwidth && hb(e.roles, h.roles) && (f = !0);
              f || c.push(e);
            }
            b.textStreams = c;
          }
        }
        function Hp(a) {
          a = t(a);
          for (var b = a.next(); !b.done; b = a.next()) {
            b = b.value;
            for (var c = [], d = t(b.jd), e = d.next(); !e.done; e = d.next()) {
              e = e.value;
              for (var f = !1, g = t(c), h = g.next(); !h.done; h = g.next()) h = h.value, e.id != h.id && e.width == h.width && e.frameRate == h.frameRate && e.codecs == h.codecs && e.mimeType == h.mimeType && e.label == h.label && hb(e.roles, h.roles) && uf(e.closedCaptions, h.closedCaptions) && e.bandwidth == h.bandwidth && (f = !0);
              f || c.push(e);
            }
            b.jd = c;
          }
        }
        function Jp(a) {
          a = t(a);
          for (var b = a.next(); !b.done; b = a.next()) {
            b = b.value;
            for (var c = [], d = t(b.imageStreams), e = d.next(); !e.done; e = d.next()) {
              e = e.value;
              for (var f = !1, g = t(c), h = g.next(); !h.done; h = g.next()) h = h.value, e.id != h.id && e.width == h.width && e.codecs == h.codecs && e.mimeType == h.mimeType && (f = !0);
              f || c.push(e);
            }
            b.imageStreams = c;
          }
        }
        function Op(a) {
          var b, c, d, e, f, g, h, k, l, m, p, n, q, v, y, w, x, D, z, B, E, F, H, I, J, N, R;
          return G(function (Q) {
            switch (Q.g) {
              case 1:
                b = jc;
                if (1 == a.length) return Q.return(a[0]);
                c = a.map(function (ba) {
                  return ba.filter(function (M) {
                    return M.type == b.Ic;
                  });
                });
                d = a.map(function (ba) {
                  return ba.filter(function (M) {
                    return M.type == b.va;
                  });
                });
                e = a.map(function (ba) {
                  return ba.filter(function (M) {
                    return M.type == b.X;
                  });
                });
                f = a.map(function (ba) {
                  return ba.filter(function (M) {
                    return M.type == b.Xb;
                  });
                });
                g = t(e);
                for (h = g.next(); !h.done; h = g.next()) k = h.value, k.push(Pp(b.X));
                l = t(f);
                for (m = l.next(); !m.done; m = l.next()) p = m.value, p.push(Pp(b.Xb));
                return u(Q, Lp([], c, 0, Qp, Rp), 2);
              case 2:
                return n = Q.h, u(Q, Lp([], d, 0, Qp, Rp), 3);
              case 3:
                return q = Q.h, u(Q, Lp([], e, 0, Qp, Rp), 4);
              case 4:
                return v = Q.h, u(Q, Lp([], f, 0, Qp, Rp), 5);
              case 5:
                y = Q.h;
                w = 0;
                if (q.length && n.length) for (E = t(n), F = E.next(); !F.done; F = E.next()) for (H = F.value, I = t(q), J = I.next(); !J.done; J = I.next()) N = J.value, R = w++, N.variantIds.push(R), H.variantIds.push(R);else for (x = q.concat(n), D = t(x), z = D.next(); !z.done; z = D.next()) B = z.value, B.variantIds = [w++];
                return Q.return(q.concat(n).concat(v).concat(y));
            }
          });
        }
        function Lp(a, b, c, d, e) {
          var f, g, h, k, l, m, p, n, q, v, y, w, x, D, z, B, E, F, H, I;
          return G(function (N) {
            switch (N.g) {
              case 1:
                f = jc;
                g = [];
                for (h = 0; h < b.length; h++) h >= c ? g.push(new Set(b[h])) : g.push(new Set());
                k = t(a);
                l = k.next();
              case 2:
                if (l.done) {
                  N.B(4);
                  break;
                }
                m = l.value;
                return u(N, Sp(m, b, c, e, g), 5);
              case 5:
                p = N.h;
                if (!p) throw new O(2, 4, 4037);
                l = k.next();
                N.B(2);
                break;
              case 4:
                n = t(g);
                for (q = n.next(); !q.done; q = n.next()) for (v = q.value, y = t(v), w = y.next(); !w.done; w = y.next()) x = w.value, (D = Tp(x, b, d, e, g)) && a.push(D);
                z = t(g);
                for (q = z.next(); !q.done; q = z.next()) for (B = q.value, E = {}, F = t(B), w = F.next(); !w.done; E = {
                  Va: E.Va
                }, w = F.next()) if (E.Va = w.value, H = E.Va.type == f.X && !E.Va.language, I = E.Va.type == f.Xb && !E.Va.tilesLayout, !H && !I && (a.some(function (R) {
                  return function (Q) {
                    return Q.mimeType == R.Va.mimeType && $c(Q.codecs) == $c(R.Va.codecs);
                  };
                }(E)))) throw new O(2, 4, 4037);
                return N.return(a);
            }
          });
        }
        function Sp(a, b, c, d, e) {
          return G(function (f) {
            if (1 == f.g) return Up(b, a), a.matchedStreams ? a.segmentIndex ? u(f, Vp(a, c), 2) : f.B(2) : f.return(!1);
            Wp(a, c, d, e);
            return f.return(!0);
          });
        }
        function Vp(a, b) {
          var c, d, e, f, g, h, k;
          return G(function (l) {
            if (1 == l.g) {
              c = [];
              d = a.matchedStreams;
              e = t(d);
              for (f = e.next(); !f.done; f = e.next()) g = f.value, c.push(g.createSegmentIndex()), g.trickModeVideo && !g.trickModeVideo.segmentIndex && c.push(g.trickModeVideo.createSegmentIndex());
              return u(l, Promise.all(c), 2);
            }
            if (a.segmentIndex instanceof Nj) for (h = b; h < d.length; h++) k = d[h], k.segmentIndex && a.segmentIndex.l.push(k.segmentIndex);
            A(l);
          });
        }
        function Tp(a, b, c, d, e) {
          var f = c(a);
          Up(b, f);
          f.createSegmentIndex && (f.createSegmentIndex = function () {
            return G(function (g) {
              if (f.segmentIndex) return g.B(0);
              f.segmentIndex = new Nj();
              return u(g, Vp(f, 0), 0);
            });
          });
          if (!f.matchedStreams || !f.matchedStreams.length) return null;
          Wp(f, 0, d, e);
          return f;
        }
        function Wp(a, b, c, d) {
          for (var e = a.matchedStreams, f = 0; f < e.length; f++) if (f >= b) {
            var g = e[f];
            c(a, g);
            var h = !0;
            "audio" == a.type && 0 == rd(a.language, g.language) && (h = !1);
            h && d[f].delete(g);
          }
        }
        function Mp(a) {
          var b = Object.assign({}, a);
          b.originalId = null;
          b.createSegmentIndex = function () {
            return Promise.resolve();
          };
          b.closeSegmentIndex = function () {
            b.segmentIndex && (b.segmentIndex.release(), b.segmentIndex = null);
            if (b.matchedStreams) for (var c = t(b.matchedStreams), d = c.next(); !d.done; d = c.next()) d = d.value, d.segmentIndex && (d.segmentIndex.release(), d.segmentIndex = null);
          };
          b.segmentIndex = null;
          b.emsgSchemeIdUris = [];
          b.keyIds = new Set();
          b.closedCaptions = null;
          b.trickModeVideo = null;
          return b;
        }
        function Qp(a) {
          a = Object.assign({}, a);
          a.keyIds = new Set();
          a.segments = [];
          a.variantIds = [];
          a.closedCaptions = null;
          return a;
        }
        function Np(a, b) {
          a.roles = Array.from(new Set(a.roles.concat(b.roles)));
          b.emsgSchemeIdUris && (a.emsgSchemeIdUris = Array.from(new Set(a.emsgSchemeIdUris.concat(b.emsgSchemeIdUris))));
          a.keyIds = function (f, g) {
            return new Set([].concat(ia(f), ia(g)));
          }(a.keyIds, b.keyIds);
          null == a.originalId ? a.originalId = b.originalId : a.originalId += "," + (b.originalId || "");
          var c = Og(a.drmInfos, b.drmInfos);
          if (b.drmInfos.length && a.drmInfos.length && !c.length) throw new O(2, 4, 4038);
          a.drmInfos = c;
          a.encrypted = a.encrypted || b.encrypted;
          if (b.closedCaptions) {
            a.closedCaptions || (a.closedCaptions = new Map());
            c = t(b.closedCaptions);
            for (var d = c.next(); !d.done; d = c.next()) {
              var e = t(d.value);
              d = e.next().value;
              e = e.next().value;
              a.closedCaptions.set(d, e);
            }
          }
          b.trickModeVideo ? (a.trickModeVideo || (a.trickModeVideo = Mp(b.trickModeVideo), a.trickModeVideo.createSegmentIndex = function () {
            a.trickModeVideo.segmentIndex = a.segmentIndex.clone();
            return Promise.resolve();
          }), Np(a.trickModeVideo, b.trickModeVideo)) : a.trickModeVideo && Np(a.trickModeVideo, b);
        }
        function Rp(a, b) {
          a.roles = Array.from(new Set(a.roles.concat(b.roles)));
          var c = b.keyIds;
          c = new Set([].concat(ia(a.keyIds), ia(c)));
          a.keyIds = c;
          a.encrypted = a.encrypted && b.encrypted;
          a.segments.push.apply(a.segments, ia(b.segments));
          if (b.closedCaptions) for (a.closedCaptions || (a.closedCaptions = new Map()), b = t(b.closedCaptions), c = b.next(); !c.done; c = b.next()) {
            var d = t(c.value);
            c = d.next().value;
            d = d.next().value;
            a.closedCaptions.set(c, d);
          }
        }
        function Up(a, b) {
          var c = [];
          a = t(a);
          for (var d = a.next(); !d.done; d = a.next()) {
            var e = b,
              f = {
                audio: Xp,
                video: Xp,
                text: Yp,
                image: Zp
              }[e.type],
              g = {
                audio: $p,
                video: aq,
                text: bq,
                image: cq
              }[e.type],
              h = null;
            d = t(d.value);
            for (var k = d.next(); !k.done; k = d.next()) k = k.value, !f(e, k) || h && !g(e, h, k) || (h = k);
            e = h;
            if (!e) return;
            c.push(e);
          }
          b.matchedStreams = c;
        }
        function Xp(a, b) {
          var c;
          !(c = b.mimeType != a.mimeType || $c(b.codecs) != $c(a.codecs)) && (c = a.drmInfos) && (a = a.drmInfos, b = b.drmInfos, c = !(a.length && b.length ? 0 < Og(a, b).length : 1));
          return c ? !1 : !0;
        }
        function Yp(a, b) {
          return a.language ? b.language ? 0 == rd(a.language, b.language) || b.kind != a.kind ? !1 : !0 : !0 : !1;
        }
        function Zp(a) {
          return a.tilesLayout ? !0 : !1;
        }
        function $p(a, b, c) {
          if (a.id == c.id) return !0;
          var d = rd(a.language, b.language),
            e = rd(a.language, c.language);
          if (e > d) return !0;
          if (e < d) return !1;
          if (a.roles.length) return d = b.roles.filter(function (f) {
            return a.roles.includes(f);
          }), e = c.roles.filter(function (f) {
            return a.roles.includes(f);
          }), e.length > d.length ? !0 : e.length < d.length ? !1 : c.roles.length < b.roles.length;
          if (!c.roles.length && b.roles.length) return !0;
          if (c.roles.length && !b.roles.length) return !1;
          if (!b.primary && c.primary) return !0;
          if (b.primary && !c.primary) return !1;
          d = dq(a.channelsCount, b.channelsCount, c.channelsCount);
          if (d == eq) return !0;
          if (d == fq) return !1;
          d = dq(a.audioSamplingRate, b.audioSamplingRate, c.audioSamplingRate);
          return d == eq ? !0 : d == fq ? !1 : a.bandwidth && gq(a.bandwidth, b.bandwidth, c.bandwidth) == eq ? !0 : !1;
        }
        function aq(a, b, c) {
          if (a.id == c.id) return !0;
          var d = dq(a.width * a.height, b.width * b.height, c.width * c.height);
          if (d == eq) return !0;
          if (d == fq) return !1;
          if (a.frameRate) {
            d = dq(a.frameRate, b.frameRate, c.frameRate);
            if (d == eq) return !0;
            if (d == fq) return !1;
          }
          return a.bandwidth && gq(a.bandwidth, b.bandwidth, c.bandwidth) == eq ? !0 : !1;
        }
        function bq(a, b, c) {
          if (a.id == c.id) return !0;
          var d = rd(a.language, b.language),
            e = rd(a.language, c.language);
          if (e > d) return !0;
          if (e < d) return !1;
          if (!b.primary && c.primary) return !0;
          if (b.primary && !c.primary) return !1;
          if (a.roles.length) {
            d = b.roles.filter(function (f) {
              return a.roles.includes(f);
            });
            e = c.roles.filter(function (f) {
              return a.roles.includes(f);
            });
            if (e.length > d.length) return !0;
            if (e.length < d.length) return !1;
          } else {
            if (!c.roles.length && b.roles.length) return !0;
            if (c.roles.length && !b.roles.length) return !1;
          }
          return c.mimeType != a.mimeType || c.codecs != a.codecs || b.mimeType == a.mimeType && b.codecs == a.codecs ? !1 : !0;
        }
        function cq(a, b, c) {
          return a.id == c.id ? !0 : dq(a.width * a.height, b.width * b.height, c.width * c.height) == eq ? !0 : !1;
        }
        function Pp(a) {
          return {
            id: 0,
            originalId: "",
            primary: !1,
            type: a,
            mimeType: "",
            codecs: "",
            language: "",
            label: null,
            width: null,
            height: null,
            encrypted: !1,
            keyIds: new Set(),
            segments: [],
            variantIds: [],
            roles: [],
            forced: !1,
            channelsCount: null,
            audioSamplingRate: null,
            spatialAudio: !1,
            closedCaptions: null,
            external: !1
          };
        }
        function Kp(a) {
          return {
            id: 0,
            originalId: "",
            createSegmentIndex: function () {
              return Promise.resolve();
            },
            segmentIndex: new Jj([]),
            mimeType: "",
            codecs: "",
            encrypted: !1,
            drmInfos: [],
            keyIds: new Set(),
            language: "",
            label: null,
            type: a,
            primary: !1,
            trickModeVideo: null,
            emsgSchemeIdUris: null,
            roles: [],
            forced: !1,
            channelsCount: null,
            audioSamplingRate: null,
            spatialAudio: !1,
            closedCaptions: null,
            external: !1
          };
        }
        function dq(a, b, c) {
          if (b == a && a != c) return fq;
          if (c == a && a != b) return eq;
          if (b > a) {
            if (c <= a || c - a < b - a) return eq;
            if (c - a > b - a) return fq;
          } else {
            if (c > a) return fq;
            if (a - c < a - b) return eq;
            if (a - c > a - b) return fq;
          }
          return hq;
        }
        function gq(a, b, c) {
          b = Math.abs(a - b);
          a = Math.abs(a - c);
          return a < b ? eq : b < a ? fq : hq;
        }
        var eq = 1,
          hq = 0,
          fq = -1;
        function iq() {
          var a = this;
          this.h = this.g = null;
          this.m = [];
          this.i = null;
          this.G = 1;
          this.l = {};
          this.L = {};
          this.j = new Ep();
          this.F = 0;
          this.H = new Ra(5);
          this.D = new P(function () {
            jq(a);
          });
          this.o = new We();
          this.s = null;
          this.J = [];
          this.u = Infinity;
          this.A = !1;
        }
        r = iq.prototype;
        r.configure = function (a) {
          this.g = a;
        };
        r.start = function (a, b) {
          var c = this,
            d;
          return G(function (e) {
            if (1 == e.g) return c.A = b.isLowLatencyMode(), c.m = [a], c.h = b, u(e, kq(c), 2);
            d = e.h;
            c.h && lq(c, d);
            if (!c.h) throw new O(2, 7, 7001);
            return e.return(c.i);
          });
        };
        r.stop = function () {
          for (var a = t(Object.values(this.l)), b = a.next(); !b.done; b = a.next()) b = b.value, b.segmentIndex && b.segmentIndex.release();
          this.j && this.j.release();
          this.g = this.h = null;
          this.m = [];
          this.i = null;
          this.l = {};
          this.j = null;
          null != this.D && (this.D.stop(), this.D = null);
          return this.o.destroy();
        };
        r.update = function () {
          var a = this,
            b;
          return G(function (c) {
            if (1 == c.g) return C(c, 2), u(c, kq(a), 4);
            if (2 != c.g) return va(c, 0);
            b = wa(c);
            if (!a.h || !b) return c.return();
            a.h.onError(b);
            A(c);
          });
        };
        r.onExpirationUpdated = function () {};
        function kq(a) {
          var b, c, d, e, f, g, h;
          return G(function (k) {
            if (1 == k.g) return b = bf(a.m, a.g.retryParameters), c = a.h.networkingEngine, a.h.modifyManifestRequest(b, {
              format: "d"
            }), d = Date.now(), e = c.request(0, b), Xe(a.o, e), u(k, e.promise, 2);
            if (3 != k.g) {
              f = k.h;
              if (!a.h) return k.return(0);
              f.uri && !a.m.includes(f.uri) && a.m.unshift(f.uri);
              return u(k, mq(a, f.data, f.uri), 3);
            }
            g = Date.now();
            h = (g - d) / 1E3;
            a.H.sample(1, h);
            return k.return(h);
          });
        }
        function mq(a, b, c) {
          var d, f, g, h;
          return G(function (k) {
            if (1 == k.g) {
              d = dg(b, "MPD");
              if (!d) throw new O(2, 4, 4001, c);
              if (a.g.dash.disableXlinkProcessing) return k.return(nq(a, d, c));
              f = a.g.dash.xlinkFailGracefully;
              g = $o(d, a.g.retryParameters, f, c, a.h.networkingEngine);
              Xe(a.o, g);
              return u(k, g.promise, 2);
            }
            h = k.h;
            return k.return(nq(a, h, c));
          });
        }
        function nq(a, b, c) {
          var d, e, f, g, h, k, l, m, p, n, q, v, y, w, x, D, z, B, E, F, H, I, J, R, Q, ba, M, ka, xa, Na;
          return G(function (Ha) {
            switch (Ha.g) {
              case 1:
                (d = a.g.dash.manifestPreprocessor) && d(b);
                e = [c];
                f = Lf(b, "Location").map(Rf).filter(cc);
                0 < f.length && (g = dc(e, f), e = a.m = g);
                h = Lf(b, "BaseURL");
                k = h.map(Rf);
                l = dc(e, k);
                m = 0;
                h && h.length && (m = Tf(h[0], "availabilityTimeOffset", $f) || 0);
                p = a.g.dash.ignoreMinBufferTime;
                n = 0;
                p || (n = Tf(b, "minBufferTime", Vf) || 0);
                a.F = Tf(b, "minimumUpdatePeriod", Vf, -1);
                q = Tf(b, "availabilityStartTime", Uf);
                v = Tf(b, "timeShiftBufferDepth", Vf);
                y = a.g.dash.ignoreSuggestedPresentationDelay;
                w = null;
                y || (w = Tf(b, "suggestedPresentationDelay", Vf));
                x = a.g.dash.ignoreMaxSegmentDuration;
                D = null;
                x || (D = Tf(b, "maxSegmentDuration", Vf));
                z = b.getAttribute("type") || "static";
                if (a.i) for (B = a.i.presentationTimeline, E = t(Object.values(a.l)), F = E.next(); !F.done; F = E.next()) H = F.value, H.segmentIndex && H.segmentIndex.eb(B.Oa());else I = a.g.defaultPresentationDelay || 1.5 * n, J = null != w ? w : I, B = new U(q, J, a.g.dash.autoCorrectDrift);
                B.zc("static" == z);
                (B.T()) && !isNaN(a.g.availabilityWindowOverride) && (v = a.g.availabilityWindowOverride);
                null == v && (v = Infinity);
                B.oe(v);
                R = b.getAttribute("profiles") || "";
                Q = {
                  Wa: "static" != z,
                  presentationTimeline: B,
                  aa: null,
                  U: null,
                  fa: null,
                  I: null,
                  bandwidth: 0,
                  Le: !1,
                  Ab: m,
                  profiles: R.split(",")
                };
                ba = oq(a, Q, l, b);
                M = ba.duration;
                ka = ba.periods;
                "static" != z && ba.Ee || B.Aa(M || Infinity);
                a.u && !a.A && (a.h.isAutoLowLatencyMode()) && (a.h.enableLowLatencyMode(), a.A = a.h.isLowLatencyMode());
                a.A ? B.Ve(a.u) : a.u && Xa("Low-latency DASH live stream detected, but low-latency streaming mode is not enabled in Shaka Player. Set streaming.lowLatencyMode configuration to true, and see https://bit.ly/3clctcj for details.");
                B.Ud(D || 1);
                return u(Ha, Fp(a.j, ka, Q.Wa), 2);
              case 2:
                if (a.i) {
                  a.i.variants = a.j.l;
                  a.i.textStreams = a.j.j.slice();
                  a.i.imageStreams = a.j.i;
                  a.h.filter(a.i);
                  Ha.B(3);
                  break;
                }
                a.i = {
                  presentationTimeline: B,
                  variants: a.j.l,
                  textStreams: a.j.j.slice(),
                  imageStreams: a.j.i,
                  offlineSessionIds: [],
                  minBufferTime: n || 0,
                  sequenceMode: a.g.dash.sequenceMode
                };
                if (!B.ef()) {
                  Ha.B(4);
                  break;
                }
                xa = Lf(b, "UTCTiming");
                return u(Ha, pq(a, l, xa), 5);
              case 5:
                Na = Ha.h;
                if (!a.h) return Ha.return();
                B.We(Na);
              case 4:
                B.Od();
              case 3:
                a.h.makeTextStreamsForClosedCaptions(a.i), A(Ha);
            }
          });
        }
        function oq(a, b, c, d) {
          var e = Tf(d, "mediaPresentationDuration", Vf),
            f = [],
            g = 0;
          d = Lf(d, "Period");
          for (var h = 0; h < d.length; h++) {
            var k = d[h],
              l = d[h + 1],
              m = Tf(k, "start", Vf, g),
              p = k.id,
              n = Tf(k, "duration", Vf),
              q = null;
            if (l) {
              var v = Tf(l, "start", Vf);
              null != v && (q = v - m);
            } else null != e && (q = e - m);
            null == q && (q = n);
            if (!(null !== a.s && null !== p && null !== m && m < a.s) || a.J.includes(p) || h + 1 == d.length) {
              null !== m && (null === a.s || m > a.s) && (a.s = m);
              g = qq(a, b, c, {
                start: m,
                duration: q,
                node: k,
                Id: null == q || !l
              });
              f.push(g);
              b.aa.id && q && (a.L[b.aa.id] = q);
              if (null == q) {
                g = null;
                break;
              }
              g = m + q;
            }
          }
          a.J = f.map(function (y) {
            return y.id;
          });
          return null != e ? {
            periods: f,
            duration: e,
            Ee: !1
          } : {
            periods: f,
            duration: g,
            Ee: !0
          };
        }
        function qq(a, b, c, d) {
          b.aa = rq(d.node, null, c);
          b.U = d;
          b.aa.Ab = b.Ab;
          b.aa.id || (b.aa.id = "__shaka_period_" + d.start);
          var e = Lf(d.node, "EventStream");
          c = b.presentationTimeline.Oa();
          e = t(e);
          for (var f = e.next(); !f.done; f = e.next()) sq(a, d.start, d.duration, f.value, c);
          c = Lf(d.node, "AdaptationSet").map(function (m) {
            return tq(a, b, m);
          }).filter(cc);
          if (b.Wa) {
            d = [];
            e = t(c);
            for (f = e.next(); !f.done; f = e.next()) {
              f = t(f.value.sg);
              for (var g = f.next(); !g.done; g = f.next()) d.push(g.value);
            }
            if (d.length != new Set(d).size) throw new O(2, 4, 4018);
          }
          d = c.filter(function (m) {
            return !m.re;
          });
          c = c.filter(function (m) {
            return m.re;
          });
          c = t(c);
          for (e = c.next(); !e.done; e = c.next()) {
            e = e.value;
            f = e.re.split(" ");
            g = t(d);
            for (var h = g.next(); !h.done; h = g.next()) {
              var k = h.value;
              if (f.includes(k.id)) {
                h = {};
                k = t(k.streams);
                for (var l = k.next(); !l.done; h = {
                  Hc: h.Hc
                }, l = k.next()) h.Hc = l.value, h.Hc.trickModeVideo = e.streams.find(function (m) {
                  return function (p) {
                    return $c(m.Hc.codecs) == $c(p.codecs);
                  };
                }(h));
              }
            }
          }
          e = a.g.disableAudio ? [] : uq(d, "audio");
          g = a.g.disableVideo ? [] : uq(d, "video");
          f = a.g.disableText ? [] : uq(d, ic);
          c = a.g.disableThumbnails ? [] : uq(d, "image");
          if (!g.length && !e.length) throw new O(2, 4, 4004);
          d = [];
          e = t(e);
          for (h = e.next(); !h.done; h = e.next()) d.push.apply(d, ia(h.value.streams));
          e = [];
          g = t(g);
          for (h = g.next(); !h.done; h = g.next()) e.push.apply(e, ia(h.value.streams));
          g = [];
          f = t(f);
          for (h = f.next(); !h.done; h = f.next()) g.push.apply(g, ia(h.value.streams));
          f = [];
          c = t(c);
          for (h = c.next(); !h.done; h = c.next()) f.push.apply(f, ia(h.value.streams));
          return {
            id: b.aa.id,
            Lc: d,
            jd: e,
            textStreams: g,
            imageStreams: f
          };
        }
        function uq(a, b) {
          return a.filter(function (c) {
            return c.contentType == b;
          });
        }
        function tq(a, b, c) {
          function d(F) {
            switch (F) {
              case 1:
              case 6:
              case 13:
              case 14:
              case 15:
                return "SDR";
              case 16:
                return "PQ";
              case 18:
                return "HLG";
            }
          }
          b.fa = rq(c, b.aa, null);
          var e = !1,
            f = Lf(c, "Role"),
            g = f.map(function (F) {
              return F.getAttribute("value");
            }).filter(cc),
            h = void 0,
            k = b.fa.contentType == ic;
          k && (h = "subtitle");
          f = t(f);
          for (var l = f.next(); !l.done; l = f.next()) {
            l = l.value;
            var m = l.getAttribute("schemeIdUri");
            if (null == m || "urn:mpeg:dash:role:2011" == m) switch (l = l.getAttribute("value"), l) {
              case "main":
                e = !0;
                break;
              case "caption":
              case "subtitle":
                h = l;
            }
          }
          var p;
          m = Lf(c, "EssentialProperty");
          f = null;
          l = !1;
          m = t(m);
          for (var n = m.next(); !n.done; n = m.next()) {
            n = n.value;
            var q = n.getAttribute("schemeIdUri");
            "http://dashif.org/guidelines/trickmode" == q ? f = n.getAttribute("value") : "urn:mpeg:mpegB:cicp:TransferCharacteristics" == q ? p = d(parseInt(n.getAttribute("value"), 10)) : "urn:mpeg:mpegB:cicp:ColourPrimaries" != q && "urn:mpeg:mpegB:cicp:MatrixCoefficients" != q && (l = !0);
          }
          m = Lf(c, "SupplementalProperty");
          m = t(m);
          for (n = m.next(); !n.done; n = m.next()) n = n.value, "urn:mpeg:mpegB:cicp:TransferCharacteristics" == n.getAttribute("schemeIdUri") && (p = d(parseInt(n.getAttribute("value"), 10)));
          m = Lf(c, "Accessibility");
          var v = new Map();
          m = t(m);
          for (n = m.next(); !n.done; n = m.next()) if (q = n.value, n = q.getAttribute("schemeIdUri"), q = q.getAttribute("value"), "urn:scte:dash:cc:cea-608:2015" == n) {
            if (n = 1, null != q) {
              q = q.split(";");
              for (var y = t(q), w = y.next(); !w.done; w = y.next()) {
                var x = w.value,
                  D = w = void 0;
                x.includes("=") ? (x = x.split("="), w = x[0].startsWith("CC") ? x[0] : "CC" + x[0], D = x[1] || "und") : (w = "CC" + n, 2 == q.length ? n += 2 : n++, D = x);
                v.set(w, nd(D));
              }
            } else v.set("CC1", "und");
          } else if ("urn:scte:dash:cc:cea-708:2015" == n) {
            if (n = 1, null != q) for (q = t(q.split(";")), w = q.next(); !w.done; w = q.next()) w = w.value, x = y = void 0, w.includes("=") ? (w = w.split("="), y = "svc" + w[0], x = w[1].split(",")[0].split(":").pop()) : (y = "svc" + n, n++, x = w), v.set(y, nd(x));else v.set("svc1", "und");
          } else "urn:mpeg:dash:role:2011" == n && null != q && (g.push(q), "captions" == q && (h = "caption"));
          if (l) return null;
          l = Lf(c, "ContentProtection");
          var z = Lo(l, a.g.dash.ignoreDrmInfo, a.g.dash.keySystemsByURI),
            B = nd(c.getAttribute("lang") || "und"),
            E = c.getAttribute("label");
          (l = Lf(c, "Label")) && l.length && (l = l[0], l.textContent && (E = l.textContent));
          l = Lf(c, "Representation");
          c = l.map(function (F) {
            if (F = vq(a, b, z, h, B, E, e, g, v, F)) F.hdr = F.hdr || p;
            return F;
          }).filter(function (F) {
            return !!F;
          });
          if (0 == c.length) {
            f = "image" == b.fa.contentType;
            if (a.g.dash.ignoreEmptyAdaptationSet || k || f) return null;
            throw new O(2, 4, 4003);
          }
          if (!b.fa.contentType || "application" == b.fa.contentType) for (b.fa.contentType = wq(c[0].mimeType, c[0].codecs), k = t(c), m = k.next(); !m.done; m = k.next()) m.value.type = b.fa.contentType;
          k = t(c);
          for (m = k.next(); !m.done; m = k.next()) for (m = m.value, n = t(z.drmInfos), q = n.next(); !q.done; q = n.next()) q = q.value, q.keyIds = q.keyIds && m.keyIds ? new Set([].concat(ia(q.keyIds), ia(m.keyIds))) : q.keyIds || m.keyIds;
          k = l.map(function (F) {
            return F.getAttribute("id");
          }).filter(cc);
          return {
            id: b.fa.id || "__fake__" + a.G++,
            contentType: b.fa.contentType,
            language: B,
            uh: e,
            streams: c,
            drmInfos: z.drmInfos,
            re: f,
            sg: k
          };
        }
        function vq(a, b, c, d, e, f, g, h, k, l) {
          b.I = rq(l, b.fa, null);
          a.u = Math.min(a.u, b.I.Ab);
          if (!xq(b.I)) return null;
          var m = b.U.start;
          b.bandwidth = Tf(l, "bandwidth", Yf) || 0;
          var p = b.I.contentType,
            n = p == ic || "application" == p;
          p = "image" == p;
          try {
            var q = function (F, H, I) {
              return yq(a, F, H, I);
            };
            if (b.I.xc) var v = mp(b, q);else if (b.I.ab) v = sp(b, a.l);else if (b.I.yc) v = xp(b, q, a.l, !!a.i, a.g.dash.initialSegmentLimit, a.L);else {
              var y = b.I.wa,
                w = b.U.duration || 0;
              v = {
                Cb: function () {
                  return Promise.resolve(Mj(m, w, y));
                }
              };
            }
          } catch (F) {
            if ((n || p) && 4002 == F.code) return null;
            throw F;
          }
          q = Lf(l, "ContentProtection");
          q = Oo(q, c, a.g.dash.ignoreDrmInfo, a.g.dash.keySystemsByURI);
          q = new Set(q ? [q] : []);
          var x = !1;
          Lf(l, "SupplementalProperty").some(function (F) {
            return "tag:dolby.com,2018:dash:EC3_ExtensionType:2018" == F.getAttribute("schemeIdUri") && "JOC" == F.getAttribute("value");
          }) && (x = !0);
          var D = !1;
          n && (D = h.includes("forced_subtitle") || h.includes("forced-subtitle"));
          var z;
          if (p && ((l = Lf(l, "EssentialProperty").find(function (F) {
            return ["http://dashif.org/thumbnail_tile", "http://dashif.org/guidelines/thumbnail_tile"].includes(F.getAttribute("schemeIdUri"));
          })) && (z = l.getAttribute("value")), !z)) return null;
          var B;
          l = b.I.codecs;
          b.profiles.includes("http://dashif.org/guidelines/dash-if-uhd#hevc-hdr-pq10") && (l.includes("hvc1.2.4.L153.B0") || l.includes("hev1.2.4.L153.B0")) && (B = "PQ");
          l = b.I.id ? b.aa.id + "," + b.I.id : "";
          var E = l && a.l[l] ? a.l[l] : {
            id: a.G++,
            originalId: b.I.id,
            createSegmentIndex: function () {
              return Promise.resolve();
            },
            closeSegmentIndex: function () {
              E.segmentIndex && (E.segmentIndex.release(), E.segmentIndex = null);
            },
            segmentIndex: null,
            mimeType: b.I.mimeType,
            codecs: b.I.codecs,
            frameRate: b.I.frameRate,
            pixelAspectRatio: b.I.pixelAspectRatio,
            bandwidth: b.bandwidth,
            width: b.I.width,
            height: b.I.height,
            kind: d,
            encrypted: 0 < c.drmInfos.length,
            drmInfos: c.drmInfos,
            keyIds: q,
            language: e,
            label: f,
            type: b.fa.contentType,
            primary: g,
            trickModeVideo: null,
            emsgSchemeIdUris: b.I.emsgSchemeIdUris,
            roles: h,
            forced: D,
            channelsCount: b.I.bd,
            audioSamplingRate: b.I.audioSamplingRate,
            spatialAudio: x,
            closedCaptions: k,
            hdr: B,
            tilesLayout: z,
            matchedStreams: [],
            external: !1
          };
          E.createSegmentIndex = function () {
            var F;
            return G(function (H) {
              if (1 == H.g) {
                if (E.segmentIndex) return H.B(0);
                F = E;
                return u(H, v.Cb(), 3);
              }
              F.segmentIndex = H.h;
              A(H);
            });
          };
          l && b.Wa && !a.l[l] && (a.l[l] = E);
          return E;
        }
        function jq(a) {
          var b, c;
          G(function (d) {
            switch (d.g) {
              case 1:
                return b = 0, C(d, 2), u(d, kq(a), 4);
              case 4:
                b = d.h;
                va(d, 3);
                break;
              case 2:
                c = wa(d), a.h && (c.severity = 1, a.h.onError(c));
              case 3:
                if (!a.h) return d.return();
                lq(a, b);
                A(d);
            }
          });
        }
        function lq(a, b) {
          0 > a.F || a.D.O(Math.max(3, a.F - b, Sa(a.H)));
        }
        function rq(a, b, c) {
          b = b || {
            contentType: "",
            mimeType: "",
            codecs: "",
            emsgSchemeIdUris: [],
            frameRate: void 0,
            pixelAspectRatio: void 0,
            bd: null,
            audioSamplingRate: null,
            Ab: 0
          };
          c = c || b.wa;
          var d = Lf(a, "BaseURL"),
            e = d.map(Rf),
            f = a.getAttribute("contentType") || b.contentType,
            g = a.getAttribute("mimeType") || b.mimeType,
            h = a.getAttribute("codecs") || b.codecs,
            k = Tf(a, "frameRate", ag) || b.frameRate,
            l = a.getAttribute("sar") || b.pixelAspectRatio,
            m = Lf(a, "InbandEventStream"),
            p = b.emsgSchemeIdUris.slice();
          m = t(m);
          for (var n = m.next(); !n.done; n = m.next()) n = n.value.getAttribute("schemeIdUri"), p.includes(n) || p.push(n);
          m = Lf(a, "AudioChannelConfiguration");
          m = zq(m) || b.bd;
          n = Tf(a, "audioSamplingRate", Zf) || b.audioSamplingRate;
          f || (f = wq(g, h));
          var q = Kf(a, "SegmentBase"),
            v = Kf(a, "SegmentTemplate"),
            y = q ? Tf(q, "availabilityTimeOffset", $f) || 0 : 0,
            w = v ? Tf(v, "availabilityTimeOffset", $f) || 0 : 0;
          d = d && d.length ? Tf(d[0], "availabilityTimeOffset", $f) || 0 : 0;
          d = b.Ab + d + y + w;
          return {
            wa: dc(c, e),
            xc: q || b.xc,
            ab: Kf(a, "SegmentList") || b.ab,
            yc: v || b.yc,
            width: Tf(a, "width", Zf) || b.width,
            height: Tf(a, "height", Zf) || b.height,
            contentType: f,
            mimeType: g,
            codecs: h,
            frameRate: k,
            pixelAspectRatio: l,
            emsgSchemeIdUris: p,
            id: a.getAttribute("id"),
            bd: m,
            audioSamplingRate: n,
            Ab: d
          };
        }
        function zq(a) {
          a = t(a);
          for (var b = a.next(); !b.done; b = a.next()) {
            var c = b.value;
            if (b = c.getAttribute("schemeIdUri")) if (c = c.getAttribute("value")) switch (b) {
              case "urn:mpeg:dash:outputChannelPositionList:2012":
                return c.trim().split(/ +/).length;
              case "urn:mpeg:dash:23003:3:audio_channel_configuration:2011":
              case "urn:dts:dash:audio_channel_configuration:2012":
                b = parseInt(c, 10);
                if (!b) continue;
                return b;
              case "tag:dolby.com,2014:dash:audio_channel_configuration:2011":
              case "urn:dolby:dash:audio_channel_configuration:2011":
                b = parseInt(c, 16);
                if (!b) continue;
                for (a = 0; b;) b & 1 && ++a, b >>= 1;
                return a;
              case "urn:mpeg:mpegB:cicp:ChannelConfiguration":
                if (b = [0, 1, 2, 3, 4, 5, 6, 8, 2, 3, 4, 7, 8, 24, 8, 12, 10, 12, 14, 12, 14], (c = parseInt(c, 10)) && 0 < c && c < b.length) return b[c];
            }
          }
          return null;
        }
        function xq(a) {
          var b = a.xc ? 1 : 0;
          b += a.ab ? 1 : 0;
          b += a.yc ? 1 : 0;
          if (0 == b) return a.contentType == ic || "application" == a.contentType ? !0 : !1;
          1 != b && (a.xc && (a.ab = null), a.yc = null);
          return !0;
        }
        function Aq(a, b, c, d) {
          var e, f, g, h, k, l;
          return G(function (m) {
            if (1 == m.g) return e = dc(b, [c]), f = bf(e, a.g.retryParameters), f.method = d, g = a.h.networkingEngine.request(4, f), Xe(a.o, g), u(m, g.promise, 2);
            h = m.h;
            if ("HEAD" == d) {
              if (!h.headers || !h.headers.date) return m.return(0);
              k = h.headers.date;
            } else k = Bc(h.data);
            l = Date.parse(k);
            return isNaN(l) ? m.return(0) : m.return(l - Date.now());
          });
        }
        function pq(a, b, c) {
          var d, e, f, g, h, k, l, m;
          return G(function (p) {
            switch (p.g) {
              case 1:
                d = c.map(function (n) {
                  return {
                    scheme: n.getAttribute("schemeIdUri"),
                    value: n.getAttribute("value")
                  };
                }), e = a.g.dash.clockSyncUri, !d.length && e && d.push({
                  scheme: "urn:mpeg:dash:utc:http-head:2014",
                  value: e
                }), f = t(d), g = f.next();
              case 2:
                if (g.done) {
                  p.B(4);
                  break;
                }
                h = g.value;
                C(p, 5);
                k = h.scheme;
                l = h.value;
                switch (k) {
                  case "urn:mpeg:dash:utc:http-head:2014":
                  case "urn:mpeg:dash:utc:http-head:2012":
                    return p.B(7);
                  case "urn:mpeg:dash:utc:http-xsdate:2014":
                  case "urn:mpeg:dash:utc:http-iso:2014":
                  case "urn:mpeg:dash:utc:http-xsdate:2012":
                  case "urn:mpeg:dash:utc:http-iso:2012":
                    return p.B(8);
                  case "urn:mpeg:dash:utc:direct:2014":
                  case "urn:mpeg:dash:utc:direct:2012":
                    return m = Date.parse(l), p.return(isNaN(m) ? 0 : m - Date.now());
                  case "urn:mpeg:dash:utc:http-ntp:2014":
                  case "urn:mpeg:dash:utc:ntp:2014":
                  case "urn:mpeg:dash:utc:sntp:2014":
                    Xa("NTP UTCTiming scheme is not supported");
                    break;
                  default:
                    Xa("Unrecognized scheme in UTCTiming element", k);
                }
                p.B(9);
                break;
              case 7:
                return u(p, Aq(a, b, l, "HEAD"), 10);
              case 10:
                return p.return(p.h);
              case 8:
                return u(p, Aq(a, b, l, "GET"), 11);
              case 11:
                return p.return(p.h);
              case 9:
                va(p, 3);
                break;
              case 5:
                wa(p);
              case 3:
                g = f.next();
                p.B(2);
                break;
              case 4:
                return Xa("A UTCTiming element should always be given in live manifests! This content may not play on clients with bad clocks!"), p.return(0);
            }
          });
        }
        function sq(a, b, c, d, e) {
          var f = d.getAttribute("schemeIdUri") || "",
            g = d.getAttribute("value") || "",
            h = Tf(d, "timescale", Zf) || 1;
          d = t(Lf(d, "Event"));
          for (var k = d.next(); !k.done; k = d.next()) {
            k = k.value;
            var l = Tf(k, "presentationTime", Zf) || 0,
              m = Tf(k, "duration", Zf) || 0;
            l = l / h + b;
            m = l + m / h;
            null != c && (l = Math.min(l, b + c), m = Math.min(m, b + c));
            m < e || (k = {
              schemeIdUri: f,
              value: g,
              startTime: l,
              endTime: m,
              id: k.getAttribute("id") || "",
              eventElement: k
            }, a.h.onTimelineRegionAdded(k));
          }
        }
        function yq(a, b, c, d) {
          var e, f, g, h, k;
          return G(function (l) {
            if (1 == l.g) return e = hf, f = ck(b, c, d, a.g.retryParameters), g = a.h.networkingEngine, h = g.request(e, f), Xe(a.o, h), u(l, h.promise, 2);
            k = l.h;
            return l.return(k.data);
          });
        }
        function wq(a, b) {
          return dd(Yc(a, b)) ? ic : a.split("/")[0];
        }
        K("shaka.dash.DashParser", iq);
        Ug.mpd = function () {
          return new iq();
        };
        Sg["application/dash+xml"] = function () {
          return new iq();
        };
        Sg["video/vnd.mpeg.dash.mpd"] = function () {
          return new iq();
        };
        function Bq(a, b, c, d) {
          this.h = a;
          this.type = b;
          this.g = c;
          this.segments = d || null;
        }
        function Cq(a, b, c, d) {
          this.id = a;
          this.name = b;
          this.g = c;
          this.value = void 0 === d ? null : d;
        }
        Cq.prototype.toString = function () {
          function a(d) {
            return d.name + "=" + (isNaN(Number(d.value)) ? '"' + d.value + '"' : d.value);
          }
          var b = "#" + this.name,
            c = this.g ? this.g.map(a) : [];
          this.value && c.unshift(this.value);
          0 < c.length && (b += ":" + c.join(","));
          return b;
        };
        Cq.prototype.getAttribute = function (a) {
          var b = this.g.filter(function (c) {
            return c.name == a;
          });
          return b.length ? b[0] : null;
        };
        function Z(a, b, c) {
          return (a = a.getAttribute(b)) ? a.value : c || null;
        }
        function Dq(a, b) {
          a = a.getAttribute(b);
          if (!a) throw new O(2, 4, 4023, b);
          return a.value;
        }
        function Eq(a, b, c) {
          c = void 0 === c ? [] : c;
          this.g = b;
          this.i = a;
          this.h = c;
        }
        function Fq(a, b) {
          this.name = a;
          this.value = b;
        }
        function Gq(a, b) {
          return a.filter(function (c) {
            return c.name == b;
          });
        }
        function Hq(a, b) {
          return a.filter(function (c) {
            return Dq(c, "TYPE") == b;
          });
        }
        function Iq(a, b) {
          a = Gq(a, b);
          return a.length ? a[0] : null;
        }
        function Jq(a, b) {
          var c = 0;
          c = void 0 === c ? 0 : c;
          return (a = Iq(a, b)) ? Number(a.value) : c;
        }
        function Kq(a, b) {
          return dc([a], [b])[0];
        }
        function Lq(a) {
          this.h = a;
          this.g = 0;
        }
        function Mq(a) {
          Nq(a, /[ \t]+/gm);
        }
        function Nq(a, b) {
          b.lastIndex = a.g;
          b = b.exec(a.h);
          b = null == b ? null : {
            position: b.index,
            length: b[0].length,
            results: b
          };
          if (a.g == a.h.length || null == b || b.position != a.g) return null;
          a.g += b.length;
          return b.results;
        }
        function Oq(a) {
          return a.g == a.h.length ? null : (a = Nq(a, /[^ \t\n]*/gm)) ? a[0] : null;
        }
        function Pq() {
          this.g = 0;
        }
        function Qq(a, b, c) {
          b = Bc(b);
          b = b.replace(/\r\n|\r(?=[^\n]|$)/gm, "\n").trim();
          var d = b.split(/\n+/m);
          if (!/^#EXTM3U($|[ \t\n])/m.test(d[0])) throw new O(2, 4, 4015);
          b = 0;
          for (var e = !0, f = t(d), g = f.next(); !g.done; g = f.next()) if (g = g.value, /^#(?!EXT)/m.test(g) || e) e = !1;else if (g = Rq(a, g), --a.g, Sq.includes(g.name)) {
            b = 1;
            break;
          } else "EXT-X-STREAM-INF" == g.name && (e = !0);
          f = [];
          e = !0;
          for (g = 0; g < d.length; g++) {
            var h = d[g],
              k = d[g + 1];
            if (/^#(?!EXT)/m.test(h) || e) e = !1;else {
              h = Rq(a, h);
              if (Tq.includes(h.name)) {
                if (1 != b) throw new O(2, 4, 4017);
                var l = d.splice(g, d.length - g);
                d = c;
                e = [];
                g = [];
                k = [];
                h = null;
                l = t(l);
                for (var m = l.next(); !m.done; m = l.next()) m = m.value, /^(#EXT)/.test(m) ? (m = Rq(a, m), Sq.includes(m.name) ? f.push(m) : "EXT-X-MAP" == m.name ? h = m : "EXT-X-PART" == m.name ? k.push(m) : "EXT-X-PRELOAD-HINT" == m.name ? "PART" == Z(m, "TYPE") ? null != Z(m, "BYTERANGE-START") ? null != Z(m, "BYTERANGE-LENGTH") && k.push(m) : k.push(m) : "MAP" == Z(m, "TYPE") && (m.name = "EXT-X-MAP", h = m) : g.push(m)) : /^#(?!EXT)/m.test(m) || (m = Kq(d, m.trim()), h && g.push(h), e.push(new Eq(m, g, k)), g = [], k = []);
                k.length && (h && g.push(h), e.push(new Eq("", g, k)));
                return new Bq(c, b, f, e);
              }
              f.push(h);
              "EXT-X-STREAM-INF" == h.name && (h.g.push(new Fq("URI", k)), e = !0);
            }
          }
          return new Bq(c, b, f);
        }
        function Rq(a, b) {
          a = a.g++;
          var c = b.match(/^#(EXT[^:]*)(?::(.*))?$/);
          if (!c) throw new O(2, 4, 4016, b);
          b = c[1];
          var d = c[2];
          c = [];
          var e;
          if (d) {
            d = new Lq(d);
            var f;
            (f = Nq(d, /^([^,=]+)(?:,|$)/g)) && (e = f[1]);
            for (var g = /([^=]+)=(?:"([^"]*)"|([^",]*))(?:,|$)/g; f = Nq(d, g);) c.push(new Fq(f[1], f[2] || f[3])), Mq(d);
          }
          return new Cq(a, b, c, e);
        }
        var Sq = "EXT-X-TARGETDURATION EXT-X-MEDIA-SEQUENCE EXT-X-DISCONTINUITY-SEQUENCE EXT-X-PLAYLIST-TYPE EXT-X-I-FRAMES-ONLY EXT-X-ENDLIST EXT-X-SERVER-CONTROL EXT-X-SKIP EXT-X-PART-INF".split(" "),
          Tq = "EXTINF EXT-X-BYTERANGE EXT-X-DISCONTINUITY EXT-X-PROGRAM-DATE-TIME EXT-X-KEY EXT-X-DATERANGE EXT-X-MAP".split(" ");
        function Uq() {}
        function Vq(a) {
          try {
            var b = Wq(a);
            return Ne({
              uri: a,
              originalUri: a,
              data: b.data,
              headers: {
                "content-type": b.contentType
              }
            });
          } catch (c) {
            return Le(c);
          }
        }
        function Wq(a) {
          var b = a.split(":");
          if (2 > b.length || "data" != b[0]) throw new O(2, 1, 1004, a);
          b = b.slice(1).join(":").split(",");
          if (2 > b.length) throw new O(2, 1, 1004, a);
          var c = b[0];
          a = window.decodeURIComponent(b.slice(1).join(","));
          b = c.split(";");
          c = b[0];
          var d = !1;
          1 < b.length && "base64" == b[b.length - 1] && (d = !0, b.pop());
          var e;
          d ? e = Kc(a) : e = Fc(a);
          return {
            data: e,
            contentType: c
          };
        }
        K("shaka.net.DataUriPlugin", Uq);
        Uq.parse = Vq;
        Ze("data", Vq);
        function Xq() {
          var a = this;
          this.g = this.i = null;
          this.Fa = 1;
          this.o = new Map();
          this.u = new Map();
          this.F = new Map();
          this.F.set("video", new Map());
          this.F.set("audio", new Map());
          this.F.set(ic, new Map());
          this.F.set("image", new Map());
          this.ka = new Set();
          this.h = new Map();
          this.j = null;
          this.M = "";
          this.W = new Pq();
          this.P = 0;
          this.A = -1;
          this.H = Infinity;
          this.Ga = !1;
          this.m = new P(function () {
            Yq(a);
          });
          this.ea = Zq;
          this.D = null;
          this.ca = 0;
          this.J = Infinity;
          this.V = this.da = 0;
          this.G = new We();
          this.L = new Map();
          this.s = new Map();
          this.ba = new Map();
          this.l = !1;
        }
        r = Xq.prototype;
        r.configure = function (a) {
          this.g = a;
        };
        r.start = function (a, b) {
          var c = this,
            d;
          return G(function (e) {
            return 1 == e.g ? (c.i = b, c.l = b.isLowLatencyMode(), u(e, $q(c, a), 2)) : 3 != e.g ? (d = e.h, c.M = d.uri, u(e, ar(c, d.data, a), 3)) : e.return(c.D);
          });
        };
        r.stop = function () {
          this.m && (this.m.stop(), this.m = null);
          var a = [];
          this.G && (a.push(this.G.destroy()), this.G = null);
          this.g = this.i = null;
          this.ka.clear();
          this.D = null;
          this.h.clear();
          this.u.clear();
          this.s.clear();
          this.o.clear();
          return Promise.all(a);
        };
        r.update = function () {
          var a = this,
            b,
            c,
            d,
            e,
            f,
            g,
            h,
            k,
            l;
          return G(function (m) {
            if (1 == m.g) {
              if (!br(a)) return m.return();
              b = [];
              c = Array.from(a.h.values());
              d = c.filter(function (p) {
                return p.stream.segmentIndex;
              });
              e = t(d);
              for (f = e.next(); !f.done; f = e.next()) g = f.value, b.push(cr(a, g));
              return u(m, Promise.all(b), 2);
            }
            dr(a, d.map(function (p) {
              return p.stream;
            }));
            h = d.some(function (p) {
              return 0 == p.nc;
            });
            d.length && !h && (k = er, fr(a, k.gf), l = d.map(function (p) {
              return p.Pa;
            }), a.j.Aa(Math.min.apply(Math, ia(l))), a.i.updateDuration());
            h && gr(a);
            A(m);
          });
        };
        function hr(a, b) {
          return br(a) ? a.F.get(b.type) : b.ad;
        }
        function cr(a, b) {
          var c, d, e, f, g, h, k, l, m, p, n, q, v, y, w, x, D;
          return G(function (B) {
            if (1 == B.g) return c = b.Kc, d = new Mb(c), a.l && b.Nc && Pb(d, new Rb("_HLS_skip=YES")), u(B, $q(a, d.toString()), 2);
            e = B.h;
            if (!b.stream.segmentIndex) return B.return();
            f = Qq(a.W, e.data, e.uri);
            if (1 != f.type) throw new O(2, 4, 4017);
            g = Gq(f.g, "EXT-X-DEFINE");
            h = ir(a, g);
            k = b.stream;
            l = hr(a, b);
            m = jr(f, k.mimeType);
            p = m.keyIds;
            n = m.drmInfos;
            q = function (E, F) {
              return E.size === F.size && [].concat(ia(E)).every(function (H) {
                return F.has(H);
              });
            };
            q(k.keyIds, p) || (k.keyIds = p, k.drmInfos = n, a.i.newDrmInfo(k));
            v = kr(a, f, k.type, l, h);
            k.segmentIndex.Ib(v, a.j.Oa());
            v.length && (y = Jq(f.g, "EXT-X-MEDIA-SEQUENCE"), w = l.get(y), k.segmentIndex.eb(w));
            x = v[0];
            b.kb = x.startTime;
            D = v[v.length - 1];
            b.Pa = D.endTime;
            if (Iq(f.g, "EXT-X-ENDLIST")) b.nc = !0;
            A(B);
          });
        }
        r.onExpirationUpdated = function () {};
        function lr(a, b) {
          for (var c = -1 == a.A, d = t(b), e = d.next(); !e.done; e = d.next()) {
            e = e.value;
            var f = e.stream.segmentIndex,
              g = hr(a, e);
            if (f = f.g[0] || null) {
              g = t(g);
              for (var h = g.next(); !h.done; h = g.next()) {
                h = t(h.value);
                var k = h.next().value;
                if (h.next().value == f.startTime) {
                  c && (a.A = Math.max(a.A, k));
                  e.Ed = k;
                  break;
                }
              }
            }
          }
          if (!(0 > a.A)) for (b = t(b), e = b.next(); !e.done; e = b.next()) if (c = e.value, d = c.stream.segmentIndex) if (d.g.splice(0, a.A - c.Ed), d = d.g[0] || null) d = -d.startTime, c.stream.segmentIndex.offset(d), mr(a, c, d);
        }
        function nr(a, b) {
          if (Infinity == a.H) {
            b = t(b);
            for (var c = b.next(); !c.done; c = b.next()) {
              var d = c.value.stream.segmentIndex.g[0] || null;
              null != d && null != d.g && (a.H = Math.min(a.H, d.g));
            }
          }
          b = a.H;
          if (Infinity != b) for (d = t(a.h.values()), c = d.next(); !c.done; c = d.next()) {
            c = c.value;
            var e = c.stream.segmentIndex;
            if (null != e) {
              var f = e.g[0] || null;
              if (null == f.g) Wa("Missing EXT-X-PROGRAM-DATE-TIME for stream", c.Bc, "Expect AV sync issues!");else for (mr(a, c, f.g - b - f.startTime), c = t(e), e = c.next(); !e.done; e = c.next()) e.value.pe(b);
            }
          }
        }
        function mr(a, b, c) {
          b.kb += c;
          b.Pa += c;
          a = hr(a, b);
          b = t(a);
          for (var d = b.next(); !d.done; d = b.next()) {
            var e = t(d.value);
            d = e.next().value;
            e = e.next().value;
            a.set(d, e + c);
          }
        }
        function ar(a, b, c) {
          var d, e, f, g, h, k, l, m, p, n, q, v, y, w, x, D, z, B, E, F, H, I, J, N, R, Q, ba, M, ka, Fa, xa, Na;
          return G(function (Ha) {
            switch (Ha.g) {
              case 1:
                d = Qq(a.W, b, a.M);
                e = Gq(d.g, "EXT-X-DEFINE");
                for (var Lb = t(e), Ka = Lb.next(); !Ka.done; Ka = Lb.next()) {
                  var Ua = Ka.value;
                  Ka = Z(Ua, "NAME");
                  Ua = Z(Ua, "VALUE");
                  Ka && Ua && (a.o.has(Ka) || a.o.set(Ka, Ua));
                }
                f = [];
                g = [];
                h = [];
                if (1 == d.type) return F = a.g.hls.mediaPlaylistFullMimeType, d.segments.length && (H = new Mb(d.segments[0].i), I = H.ra.split(".").pop(), (J = or[I]) ? F = J : "ts" !== I && "mp4" !== I && (pr[I] ? (J = pr[I], N = a.g.hls.defaultAudioCodec, F = J + '; codecs="' + N + '"') : qr[I] && (J = qr[I], R = a.g.hls.defaultVideoCodec, F = J + '; codecs="' + R + '"'))), Q = F.split(";")[0], ba = Q.split("/")[0], M = bd(F), ka = new Map(), u(Ha, rr(a, d, c, c, M, ba, "", !0, "Media Playlist", null, ka, null, !1, !1, Q), 5);
                k = Gq(d.g, "EXT-X-MEDIA");
                l = Gq(d.g, "EXT-X-STREAM-INF");
                m = Gq(d.g, "EXT-X-IMAGE-STREAM-INF");
                p = Gq(d.g, "EXT-X-SESSION-KEY");
                Lb = t(l);
                for (Ka = Lb.next(); !Ka.done; Ka = Lb.next()) {
                  var Zb = Ka.value;
                  Ua = Z(Zb, "AUDIO");
                  Ka = Z(Zb, "VIDEO");
                  var pb = Z(Zb, "SUBTITLES");
                  Zb = sr(a, Zb);
                  if (pb) {
                    var Un = gc(ic, Zb);
                    a.s.set(pb, Un);
                    gb(Zb, Un);
                  }
                  Ua && (pb = gc("audio", Zb), pb || (pb = a.g.hls.defaultAudioCodec), a.s.set(Ua, pb));
                  Ka && (Ua = gc("video", Zb), Ua || (Ua = a.g.hls.defaultVideoCodec), a.s.set(Ka, Ua));
                }
                n = Gq(d.g, "EXT-X-SESSION-DATA");
                q = t(n);
                for (v = q.next(); !v.done; v = q.next()) if (y = v.value, w = Z(y, "DATA-ID"), x = Z(y, "URI"), D = Z(y, "LANGUAGE"), z = Z(y, "VALUE"), B = new Map().set("id", w), x && B.set("uri", Kq(a.M, x)), D && B.set("language", D), z && B.set("value", z), E = new S("sessiondata", B), a.i) a.i.onEvent(E);
                tr(a, k);
                Lb = Hq(k, "CLOSED-CAPTIONS");
                Lb = t(Lb);
                for (Ka = Lb.next(); !Ka.done; Ka = Lb.next()) pb = Ka.value, Ka = ur(pb), Ua = Dq(pb, "GROUP-ID"), pb = Dq(pb, "INSTREAM-ID"), a.L.get(Ua) || a.L.set(Ua, new Map()), a.L.get(Ua).set(pb, Ka);
                f = vr(a, l, p);
                g = wr(a, k);
                return u(Ha, xr(a, m), 4);
              case 4:
                h = Ha.h;
                Ha.B(3);
                break;
              case 5:
                Fa = Ha.h, a.h.set(c, Fa), f.push({
                  id: 0,
                  language: "und",
                  disabledUntilTime: 0,
                  primary: !0,
                  audio: "audio" == ba ? Fa.stream : null,
                  video: "video" == ba ? Fa.stream : null,
                  bandwidth: 0,
                  allowedByApplication: !0,
                  allowedByKeySystem: !0,
                  decodingInfos: []
                });
              case 3:
                if (!a.i) throw new O(2, 7, 7001);
                a.j = new U(null, 0);
                a.j.zc(!0);
                1 == d.type && (br(a) && (yr(a), xa = a.P, a.m.O(xa)), Na = Array.from(a.h.values()), zr(a, Na), gr(a));
                a.D = {
                  presentationTimeline: a.j,
                  variants: f,
                  textStreams: g,
                  imageStreams: h,
                  offlineSessionIds: [],
                  minBufferTime: 0,
                  sequenceMode: !0
                };
                a.i.makeTextStreamsForClosedCaptions(a.D);
                A(Ha);
            }
          });
        }
        function gr(a) {
          if (br(a)) {
            if (a.P = a.J, a.ea == Ar) {
              for (var b, c = b = Infinity, d = t(a.h.values()), e = d.next(); !e.done; e = d.next()) e = e.value, e.stream.segmentIndex && "text" != e.stream.type && (b = Math.min(b, e.Pa), c = Math.min(c, e.kb));
              b -= c;
              a.g.hls.useSafariBehaviorForLive && (b = a.j.m);
              isNaN(a.g.availabilityWindowOverride) || (b = a.g.availabilityWindowOverride);
              a.j.oe(b);
            }
          } else a.j.Aa(Br(a));
          a.j.Od();
        }
        function ir(a, b) {
          var c = new Map();
          b = t(b);
          for (var d = b.next(); !d.done; d = b.next()) {
            var e = d.value;
            d = Z(e, "NAME");
            var f = Z(e, "VALUE");
            e = Z(e, "IMPORT");
            d && f && c.set(d, f);
            e && (d = a.o.get(e)) && c.set(e, d);
          }
          return c;
        }
        function wr(a, b) {
          var c = Hq(b, "SUBTITLES");
          b = c.map(function (g) {
            if (a.g.disableText) return null;
            try {
              return Cr(a, g).stream;
            } catch (h) {
              if (a.g.hls.ignoreTextStreamFailures) return null;
              throw h;
            }
          });
          c = t(c);
          for (var d = c.next(); !d.done; d = c.next()) {
            var e = Dq(d.value, "GROUP-ID");
            if (d = a.s.get(e)) if (e = a.u.get(e)) {
              e = t(e);
              for (var f = e.next(); !f.done; f = e.next()) f = f.value, f.stream.codecs = d, f.stream.mimeType = Dr(ic, d) || Er(ic);
            }
          }
          return b.filter(function (g) {
            return g;
          });
        }
        function xr(a, b) {
          var c, d;
          return G(function (e) {
            if (1 == e.g) return c = b.map(function (f) {
              var h, k;
              return G(function (l) {
                if (1 == l.g) {
                  if (a.g.disableThumbnails) return l.return(null);
                  C(l, 2);
                  return u(l, Fr(a, f), 4);
                }
                if (2 != l.g) return h = l.h, l.return(h.stream);
                k = wa(l);
                if (a.g.hls.ignoreImageStreamFailures) return l.return(null);
                throw k;
              });
            }), u(e, Promise.all(c), 2);
            d = e.h;
            return e.return(d.filter(function (f) {
              return f;
            }));
          });
        }
        function tr(a, b) {
          b = b.filter(function (d) {
            var e = Z(d, "URI") || "";
            return "SUBTITLES" != Z(d, "TYPE") && "" != e;
          });
          b = t(b);
          for (var c = b.next(); !c.done; c = b.next()) Cr(a, c.value);
        }
        function vr(a, b, c) {
          var d = [],
            e = new Set();
          if (0 < c.length) {
            c = t(c);
            for (var f = c.next(); !f.done; f = c.next()) {
              f = f.value;
              var g = Dq(f, "METHOD");
              if ("NONE" != g && "AES-128" != g && (g = Z(f, "KEYFORMAT") || "identity", f = (g = Gr[g]) ? g(f, "") : null)) {
                if (f.keyIds) {
                  g = t(f.keyIds);
                  for (var h = g.next(); !h.done; h = g.next()) e.add(h.value);
                }
                d.push(f);
              }
            }
          }
          b = b.map(function (k) {
            var l = Z(k, "FRAME-RATE"),
              m = Number(Z(k, "AVERAGE-BANDWIDTH")) || Number(Dq(k, "BANDWIDTH")),
              p = Z(k, "RESOLUTION");
            p = t(p ? p.split("x") : [null, null]);
            var n = p.next().value,
              q = p.next().value,
              v = Z(k, "VIDEO-RANGE");
            k = Hr(a, k);
            p = k.audio;
            k = k.video;
            for (var y = t(k), w = y.next(); !w.done; w = y.next()) if (w = w.value.stream) w.width = Number(n) || void 0, w.height = Number(q) || void 0, w.frameRate = Number(l) || void 0, w.hdr = v || void 0;
            l = a.g.disableAudio;
            if (!p.length || l) p = [null];
            l = a.g.disableVideo;
            if (!k.length || l) k = [null];
            l = [];
            p = t(p);
            for (n = p.next(); !n.done; n = p.next()) for (n = n.value, q = t(k), v = q.next(); !v.done; v = q.next()) {
              var x = v.value;
              if (v = n ? n.stream : null) v.drmInfos = d, v.keyIds = e;
              if (y = x ? x.stream : null) y.drmInfos = d, y.keyIds = e;
              w = n ? n.stream.drmInfos : null;
              var D = x ? x.stream.drmInfos : null;
              x = (x ? x.Bc : "") + " - " + (n ? n.Bc : "");
              v && y && w.length && D.length && !(0 < Og(w, D).length) || a.ka.has(x) || (v = {
                id: a.Fa++,
                language: v ? v.language : "und",
                primary: !!v && v.primary || !!y && y.primary,
                audio: v,
                video: y,
                bandwidth: m,
                allowedByApplication: !0,
                allowedByKeySystem: !0,
                decodingInfos: []
              }, l.push(v), a.ka.add(x));
            }
            return l;
          }).reduce(ac, []);
          return b = b.filter(function (k) {
            return null != k;
          });
        }
        function Hr(a, b) {
          var c = sr(a, b),
            d = Z(b, "AUDIO"),
            e = Z(b, "VIDEO"),
            f = d || e;
          f = f && a.u.has(f) ? a.u.get(f) : [];
          d = {
            audio: d ? f : [],
            video: e ? f : []
          };
          e = !1;
          var g = Dq(b, "URI"),
            h = d.audio.find(function (m) {
              return m && m.Bc == g;
            }),
            k = gc("video", c),
            l = gc("audio", c);
          l && !k ? f = "audio" : !f.length && l && k ? (f = "video", c = [[k, l].join()]) : d.audio.length && h ? (f = "audio", e = !0) : f = d.video.length && !d.audio.length ? "audio" : "video";
          e || (a = Ir(a, b, c, f), d[a.stream.type] = [a]);
          return d;
        }
        function sr(a, b) {
          var c = [];
          a.g.disableVideo || c.push(a.g.hls.defaultVideoCodec);
          a.g.disableAudio || c.push(a.g.hls.defaultAudioCodec);
          c = Z(b, "CODECS", c.join(",")).split(/\s*,\s*/);
          a = new Set();
          b = [];
          c = t(c);
          for (var d = c.next(); !d.done; d = c.next()) {
            d = d.value;
            var e = ad(d)[0];
            a.has(e) || (b.push(d), a.add(e));
          }
          return b;
        }
        function ur(a) {
          a = Z(a, "LANGUAGE") || "und";
          return nd(a);
        }
        function Cr(a, b) {
          var c = Dq(b, "GROUP-ID"),
            d = "",
            e = Dq(b, "TYPE").toLowerCase();
          "subtitles" == e && (e = ic);
          var f = e;
          f == ic ? d = Z(b, "CODECS") || "" : c && a.s.has(c) && (d = a.s.get(c));
          e = Jr(Dq(b, "URI"), a.o);
          if (a.h.has(e)) return a.h.get(e);
          var g = ur(b),
            h = Z(b, "NAME"),
            k = "YES" == Z(b, "DEFAULT");
          var l = "audio" == f ? (l = Z(b, "CHANNELS")) ? parseInt(l.split("/")[0], 10) : null : null;
          var m = "audio" == f ? (m = Z(b, "CHANNELS")) ? m.includes("/JOC") : !1 : !1;
          var p = Z(b, "CHARACTERISTICS");
          b = "YES" == Z(b, "FORCED");
          d = Kr(a, e, d, f, g, k, h, l, null, p, b, m);
          a.u.has(c) ? a.u.get(c).push(d) : a.u.set(c, [d]);
          if (a.h.has(e)) return a.h.get(e);
          a.h.set(e, d);
          return d;
        }
        function Fr(a, b) {
          var c, d, e, f, g, h, k, l, m, p;
          return G(function (n) {
            if (1 == n.g) {
              c = Jr(Dq(b, "URI"), a.o);
              d = Z(b, "CODECS", "jpeg") || "";
              if (a.h.has(c)) return n.return(a.h.get(c));
              e = ur(b);
              f = Z(b, "NAME");
              g = Z(b, "CHARACTERISTICS");
              h = Kr(a, c, d, "image", e, !1, f, null, null, g, !1, !1);
              return a.h.has(c) ? n.return(a.h.get(c)) : (k = Z(b, "RESOLUTION")) ? u(n, h.stream.createSegmentIndex(), 3) : n.B(2);
            }
            2 != n.g && (l = h.stream.segmentIndex.get(0), m = l.tilesLayout) && (h.stream.width = Number(k.split("x")[0]) * Number(m.split("x")[0]), h.stream.height = Number(k.split("x")[1]) * Number(m.split("x")[1]));
            if (p = Z(b, "BANDWIDTH")) h.stream.bandwidth = Number(p);
            a.h.set(c, h);
            return n.return(h);
          });
        }
        function Ir(a, b, c, d) {
          var e = Jr(Dq(b, "URI"), a.o);
          if (a.h.has(e)) return a.h.get(e);
          b = Z(b, "CLOSED-CAPTIONS");
          b = "video" == d && b && "NONE" != b ? a.L.get(b) : null;
          c = fc(d, c);
          d = Kr(a, e, c, d, "und", !1, null, null, b, null, !1, !1);
          if (a.h.has(e)) return a.h.get(e);
          a.h.set(e, d);
          return d;
        }
        function Kr(a, b, c, d, e, f, g, h, k, l, m, p) {
          function n(D) {
            var z, B, E, F, H, I, J, N, R, Q, ba, M, ka, Fa;
            return G(function (xa) {
              if (1 == xa.g) return u(xa, $q(a, y.Kc), 2);
              if (3 != xa.g) {
                z = xa.h;
                if (D.aborted) return xa.return();
                B = z.uri;
                E = Qq(a.W, z.data, B);
                F = br(a);
                return u(xa, rr(a, E, b, B, c, d, e, f, g, h, k, l, m, p), 3);
              }
              H = xa.h;
              if (D.aborted) return xa.return();
              I = H.stream;
              br(a) && !F && yr(a);
              y.Kc = B;
              y.kb = H.kb;
              y.Pa = H.Pa;
              y.Nc = H.Nc;
              y.nc = H.nc;
              y.ad = H.ad;
              y.Nd = !0;
              v.segmentIndex = I.segmentIndex;
              v.encrypted = I.encrypted;
              v.drmInfos = I.drmInfos;
              v.keyIds = I.keyIds;
              v.mimeType = I.mimeType;
              Yi.includes(v.mimeType) && (v.codecs = "");
              v.drmInfos.length && a.i.newDrmInfo(v);
              J = jc;
              if (d == J.va || d == J.Ic) for (N = t(a.h.values()), R = N.next(); !R.done; R = N.next()) Q = R.value, Q.Nd || Q.type != d || (Q.stream.mimeType = I.mimeType, Yi.includes(Q.stream.mimeType) && (Q.stream.codecs = ""));
              d == J.X && (ba = I.segmentIndex.get(0)) && ba.h && (v.mimeType = "application/mp4");
              Lr(a) && (a.Ga ? zr(a, [y]) : (a.Ga = !0, M = Array.from(a.h.values()), ka = M.filter(function (Na) {
                return Na.stream.segmentIndex;
              }), zr(a, ka), gr(a), Fa = a.P, 0 < Fa && a.m.O(Fa)));
              A(xa);
            });
          }
          var q = Kq(a.M, b),
            v = Mr(a, c, d, e, f, g, h, k, l, m, p);
          Yi.includes(v.mimeType) && (v.codecs = "");
          var y = {
              stream: v,
              type: d,
              Bc: b,
              Kc: q,
              kb: 0,
              Pa: 0,
              ad: new Map(),
              Nc: !1,
              nc: !1,
              Ed: -1,
              Nd: !1
            },
            w = null,
            x = new AbortController();
          v.createSegmentIndex = function () {
            if (w) return w;
            x = new AbortController();
            return w = new Promise(function (D) {
              D(n(x.signal));
            });
          };
          v.closeSegmentIndex = function () {
            w && !v.segmentIndex && x.abort();
            v.segmentIndex && (v.segmentIndex.release(), v.segmentIndex = null);
            w = null;
          };
          return y;
        }
        function Br(a) {
          var b = Infinity;
          a = t(a.h.values());
          for (var c = a.next(); !c.done; c = a.next()) c = c.value, c.stream.segmentIndex && "text" != c.stream.type && (b = Math.min(b, c.Pa));
          return b;
        }
        function dr(a, b) {
          var c = [];
          b = t(b);
          for (var d = b.next(); !d.done; d = b.next()) d = d.value, d.segmentIndex && Kj(d.segmentIndex, function (e) {
            c.push(e);
          });
          a.j.Jb(c);
        }
        function zr(a, b) {
          if (!br(a)) for (var c = Br(a), d = t(b), e = d.next(); !e.done; e = d.next()) e.value.stream.segmentIndex.Xa(0, c);
          c = t(b);
          for (e = c.next(); !e.done; e = c.next()) e = e.value.stream, Yi.includes(e.mimeType) && (e.codecs = "");
          dr(a, b.map(function (f) {
            return f.stream;
          }));
          a.g.hls.ignoreManifestProgramDateTime ? lr(a, b) : nr(a, b);
        }
        function Lr(a) {
          if (!a.D) return !1;
          var b = [],
            c = [];
          a = t(a.D.variants);
          for (var d = a.next(); !d.done; d = a.next()) d = d.value, d.video && b.push(d.video), d.audio && c.push(d.audio);
          return 0 < b.length && !b.some(function (e) {
            return e.segmentIndex;
          }) || 0 < c.length && !c.some(function (e) {
            return e.segmentIndex;
          }) ? !1 : !0;
        }
        function rr(a, b, c, d, e, f, g, h, k, l, m, p, n, q, v) {
          var y, w, x, D, z, B, E, F, H, I, J, N, R, Q, ba, M;
          return G(function (ka) {
            if (1 == ka.g) {
              if (1 != b.type) throw new O(2, 4, 4017);
              y = Gq(b.g, "EXT-X-DEFINE");
              w = ir(a, y);
              Nr(a, b);
              return v ? ka.B(2) : u(ka, Or(a, f, e, b, w), 3);
            }
            2 != ka.g && (v = ka.h);
            x = jr(b, v);
            D = x.drmInfos;
            z = x.keyIds;
            B = x.encrypted;
            E = x.lf;
            if (B && !D.length && !E) throw new O(2, 4, 4026);
            F = br(a) ? a.F.get(f) : new Map();
            H = a.l;
            I = kr(a, b, f, F, w);
            H != a.l && Nr(a, b);
            J = I[0].startTime;
            N = I[I.length - 1].endTime;
            R = new Jj(I);
            ba = (Q = Iq(b.g, "EXT-X-SERVER-CONTROL")) ? null != Q.getAttribute("CAN-SKIP-UNTIL") : !1;
            M = Mr(a, e, f, g, h, k, l, m, p, n, q);
            M.segmentIndex = R;
            M.encrypted = B;
            M.drmInfos = D;
            M.keyIds = z;
            M.mimeType = v;
            return ka.return({
              stream: M,
              type: f,
              Bc: c,
              Kc: d,
              kb: J,
              Pa: N,
              Nc: ba,
              nc: !1,
              Ed: -1,
              ad: F,
              Nd: !1
            });
          });
        }
        function Mr(a, b, c, d, e, f, g, h, k, l, m) {
          var p = Dr(c, b) || Er(c),
            n = [];
          if (k) {
            k = t(k.split(","));
            for (var q = k.next(); !q.done; q = k.next()) n.push(q.value);
          }
          k = c == ic ? "subtitle" : void 0;
          n.length || "subtitle" !== k || n.push("subtitle");
          return {
            id: a.Fa++,
            originalId: f,
            createSegmentIndex: function () {
              return Promise.resolve();
            },
            segmentIndex: null,
            mimeType: p,
            codecs: b,
            kind: k,
            encrypted: !1,
            drmInfos: [],
            keyIds: new Set(),
            language: d,
            label: f,
            type: c,
            primary: e,
            trickModeVideo: null,
            emsgSchemeIdUris: null,
            frameRate: void 0,
            pixelAspectRatio: void 0,
            width: void 0,
            height: void 0,
            bandwidth: void 0,
            roles: n,
            forced: l,
            channelsCount: g,
            audioSamplingRate: null,
            spatialAudio: m,
            closedCaptions: h,
            hdr: void 0,
            tilesLayout: void 0,
            external: !1
          };
        }
        function jr(a, b) {
          var c = [];
          if (a.segments) {
            a = t(a.segments);
            for (var d = a.next(); !d.done; d = a.next()) d = Gq(d.value.g, "EXT-X-KEY"), c.push.apply(c, ia(d));
          }
          d = a = !1;
          var e = [],
            f = new Set();
          c = t(c);
          for (var g = c.next(); !g.done; g = c.next()) {
            g = g.value;
            var h = Dq(g, "METHOD");
            if ("NONE" != h) if (a = !0, "AES-128" == h) d = !0;else if (h = Z(g, "KEYFORMAT") || "identity", g = (h = Gr[h]) ? h(g, b) : null) {
              if (g.keyIds) {
                h = t(g.keyIds);
                for (var k = h.next(); !k.done; k = h.next()) f.add(k.value);
              }
              e.push(g);
            }
          }
          return {
            drmInfos: e,
            keyIds: f,
            encrypted: a,
            lf: d
          };
        }
        function Pr(a, b, c) {
          if (!window.crypto || !window.crypto.subtle) throw Xa("Web Crypto API is not available to decrypt AES-128. (Web Crypto only exists in secure origins like https)"), new O(2, 4, 4042);
          var d = 0,
            e = Z(b, "IV", "");
          if (e) {
            var f = Lc(e.substr(2));
            if (16 != f.byteLength) throw new O(2, 4, 4043);
          } else d = Jq(c.g, "EXT-X-MEDIA-SEQUENCE");
          b = Kq(c.h, Dq(b, "URI"));
          var g = bf([b], a.g.retryParameters),
            h = {
              method: "AES-128",
              iv: f,
              firstMediaSequenceNumber: d,
              fetchKey: function () {
                var k, l, m;
                return G(function (p) {
                  if (1 == p.g) return u(p, Qr(a, g, 6), 2);
                  if (3 != p.g) {
                    k = p.h;
                    if (!k.data || 16 != k.data.byteLength) throw new O(2, 4, 4044);
                    l = {
                      name: "AES-CBC"
                    };
                    m = h;
                    return u(p, window.crypto.subtle.importKey("raw", k.data, l, !0, ["decrypt"]), 3);
                  }
                  m.cryptoKey = p.h;
                  h.fetchKey = void 0;
                  A(p);
                });
              }
            };
          return h;
        }
        function Nr(a, b) {
          var c = Iq(b.g, "EXT-X-PLAYLIST-TYPE"),
            d = Iq(b.g, "EXT-X-ENDLIST");
          d = c && "VOD" == c.value || d;
          c = c && "EVENT" == c.value && !d;
          c = !d && !c;
          if (d) fr(a, Zq);else {
            c ? fr(a, Ar) : fr(a, Rr);
            d = Iq(b.g, "EXT-X-TARGETDURATION");
            if (!d) throw new O(2, 4, 4024, "EXT-X-TARGETDURATION");
            d = Number(d.value);
            c = Iq(b.g, "EXT-X-PART-INF");
            a.l && c ? (a.da = Number(Dq(c, "PART-TARGET")), a.J = Math.min(a.da, a.J), b = Iq(b.g, "EXT-X-SERVER-CONTROL"), a.V = b ? Number(Dq(b, "PART-HOLD-BACK")) : 0) : a.J = Math.min(d, a.J);
            a.ca = Math.max(d, a.ca);
          }
        }
        function yr(a) {
          var b = a.g.defaultPresentationDelay ? a.g.defaultPresentationDelay : a.V ? a.V : a.ca * a.g.hls.liveSegmentsDelay;
          a.j.Ye(0);
          a.j.Xe(b);
          a.j.zc(!1);
        }
        function Sr(a, b, c, d) {
          c = Iq(c, "EXT-X-MAP");
          if (!c) return null;
          var e = Dq(c, "URI");
          d = Jr(Kq(b, e), d);
          b = [d, Z(c, "BYTERANGE", "")].join("-");
          a.ba.has(b) || (c = Tr(d, c), a.ba.set(b, c));
          return a.ba.get(b);
        }
        function Tr(a, b) {
          var c = 0,
            d = null;
          if (b = Z(b, "BYTERANGE")) c = b.split("@"), d = Number(c[0]), c = Number(c[1]), d = c + d - 1;
          return new pi(function () {
            return [a];
          }, c, d);
        }
        function Ur(a, b, c, d, e, f, g, h, k, l) {
          var m = d.g,
            p = Jr(d.i, f),
            n = Iq(m, "EXTINF"),
            q = 0;
          f = 0;
          var v = null;
          d.h.length && !a.l && Xa("Low-latency HLS live stream detected, but low-latency streaming mode is not enabled in Shaka Player. Set streaming.lowLatencyMode configuration to true, and see https://bit.ly/3clctcj for details.");
          var y = null;
          if (!a.g.hls.ignoreManifestProgramDateTime) {
            var w = Iq(m, "EXT-X-PROGRAM-DATE-TIME");
            w && w.value && (y = Uf(w.value));
          }
          w = ri;
          Iq(m, "EXT-X-GAP") && (w = 2);
          if (!n) {
            if (0 == d.h.length) throw new O(2, 4, 4024, "EXTINF");
            if (!a.l) return null;
          }
          var x = [];
          if (a.l) {
            q = {};
            for (var D = 0; D < d.h.length; q = {
              rd: q.rd
            }, D++) {
              var z = d.h[D],
                B = 0 == D ? c : x[x.length - 1],
                E = 0 == D ? e : B.endTime,
                F = Number(Z(z, "DURATION")) || a.da;
              if (F) {
                F = E + F;
                var H = 0,
                  I = null;
                "EXT-X-PRELOAD-HINT" == z.name ? H = (H = Z(z, "BYTERANGE-START")) ? Number(H) : 0 : (H = Z(z, "BYTERANGE"), I = t(Vr(B, H)), H = I.next().value, I = I.next().value);
                if (B = Z(z, "URI")) q.rd = Kq(g, B), B = ri, "YES" == Z(z, "GAP") && (B = 2), E = new T(E, F, function (J) {
                  return function () {
                    return [J.rd];
                  };
                }(q), H, I, b, 0, 0, Infinity, [], "", null, null, B), "EXT-X-PRELOAD-HINT" == z.name && E.Ne(), x.push(E);
              }
            }
          }
          if (n) {
            a = Number(n.value.split(",")[0]);
            if (0 == a) return null;
            q = e + a;
          } else q = x[x.length - 1].endTime;
          (a = Iq(m, "EXT-X-BYTERANGE")) ? (v = t(Vr(c, a.value)), f = v.next().value, v = v.next().value) : x.length && (f = x[0].Ba, v = x[x.length - 1].ma);
          c = "";
          a = null;
          "image" == h && (c = "1x1", h = Iq(m, "EXT-X-TILES")) && (c = Dq(h, "LAYOUT"), (h = Z(h, "DURATION")) && (a = Number(h)));
          return new T(e, q, function () {
            return p.length ? [p] : [];
          }, f, v, b, k, 0, Infinity, x, c, a, y, w, l);
        }
        function Vr(a, b) {
          var c = 0,
            d = null;
          b && (c = b.split("@"), b = Number(c[0]), c = c[1] ? Number(c[1]) : a.ma + 1, d = c + b - 1);
          return [c, d];
        }
        function kr(a, b, c, d, e) {
          var f = b.segments,
            g = void 0,
            h = Jq(b.g, "EXT-X-DISCONTINUITY-SEQUENCE"),
            k = Jq(b.g, "EXT-X-MEDIA-SEQUENCE"),
            l = Iq(b.g, "EXT-X-SKIP");
          l = l ? Number(Z(l, "SKIPPED-SEGMENTS")) : 0;
          var m = k + l,
            p = 0;
          br(a) && d.has(m) && (p = d.get(m));
          for (var n = [], q = null, v = p, y = 0; y < f.length; y++) {
            var w = f[y],
              x = 0 == y ? p : q.endTime;
            m = k + l + y;
            Iq(w.g, "EXT-X-DISCONTINUITY") && (h++, v = x);
            var D = t(w.g);
            for (var z = D.next(); !z.done; z = D.next()) z = z.value, "EXT-X-KEY" == z.name && ("AES-128" == Dq(z, "METHOD") ? g = Pr(a, z, b) : g = void 0);
            d.set(m, x);
            D = Sr(a, b.h, w.g, e);
            !a.l && a.i.isAutoLowLatencyMode() && (a.i.enableLowLatencyMode(), a.l = a.i.isLowLatencyMode());
            if (w = Ur(a, D, q, w, x, e, b.h, c, v, g)) q = w, w.j = h, a.g.hls.ignoreManifestProgramDateTime && null != a.A && m < a.A || n.push(w);
          }
          if (b = n.some(function (B) {
            return null != B.g;
          })) for (c = {}, d = 0; d < n.length; c = {
            Rb: c.Rb,
            Qb: c.Qb,
            Cc: c.Cc,
            Ta: c.Ta,
            Pb: c.Pb
          }, d++) if (c.Ta = n[d], null == c.Ta.g) for (c.Qb = 0, c.Rb = d, e = function (B) {
            return function () {
              var E = n[B.Rb];
              if (E) {
                if (null != E.g) return E.g + B.Qb;
                B.Qb -= E.endTime - E.startTime;
                B.Rb += 1;
              }
              return null;
            };
          }(c), c.Pb = 0, c.Cc = d, f = function (B) {
            return function () {
              var E = n[B.Cc];
              if (E) {
                E != B.Ta && (B.Pb += E.endTime - E.startTime);
                if (null != E.g) return E.g + B.Pb;
                --B.Cc;
              }
              return null;
            };
          }(c); null == c.Ta.g;) c.Ta.g = f(), null == c.Ta.g && (c.Ta.g = e());
          if (b) for (c = t(n), d = c.next(); !d.done; d = c.next()) for (e = d.value, d = e.g, e = t(e.i), f = e.next(); !f.done; f = e.next()) f = f.value, f.g = d, d += f.endTime - f.startTime;
          a = a.H;
          if (b && Infinity != a) for (b = t(n), d = b.next(); !d.done; d = b.next()) d.value.pe(a);
          return n;
        }
        function Jr(a, b) {
          if (!b.size) return a;
          a = String(a).replace(/%7B/g, "{").replace(/%7D/g, "}");
          var c = a.match(/{\$\w*}/g);
          if (c) {
            c = t(c);
            for (var d = c.next(); !d.done; d = c.next()) {
              d = d.value;
              var e = d.slice(2, d.length - 1),
                f = b.get(e);
              if (f) a = a.replace(d, f);else throw new O(2, 4, 4039, e);
            }
          }
          return a;
        }
        function Dr(a, b) {
          if (a == ic) {
            if ("vtt" == b || "wvtt" == b) return "text/vtt";
            if (b && "" !== b) return "application/mp4";
          }
          return "image" != a || b && "jpeg" != b ? "audio" == a && "mp4a.40.34" == b ? "audio/mpeg" : null : "image/jpeg";
        }
        function Er(a) {
          return a == ic ? "text/vtt" : Wr[a].mp4;
        }
        function Or(a, b, c, d, e) {
          var f, g, h, k, l, m, p, n, q, v;
          return G(function (y) {
            if (1 == y.g) {
              f = hf;
              g = Math.trunc((d.segments.length - 1) / 2);
              h = Jr(d.segments[g].i, e);
              k = new Mb(h);
              l = k.ra.split(".").pop();
              m = Wr[b];
              if ((p = m[l]) || (p = or[l]) || (p = Dr(b, c))) return y.return(p);
              n = bf([h], a.g.retryParameters);
              n.method = "HEAD";
              return u(y, Qr(a, n, f), 2);
            }
            q = y.h;
            return (v = q.headers["content-type"]) ? y.return(v.split(";")[0]) : y.return(Er(b));
          });
        }
        function $q(a, b) {
          b = bf([b], a.g.retryParameters);
          a.i.modifyManifestRequest(b, {
            format: "h"
          });
          return Qr(a, b, 0);
        }
        function Yq(a) {
          var b, c;
          G(function (d) {
            if (1 == d.g) {
              if (!a.i) return d.return();
              C(d, 2);
              return u(d, a.update(), 4);
            }
            if (2 != d.g) return br(a) && (b = a.P, a.m.O(b)), va(d, 0);
            c = wa(d);
            if (!a.i) return d.return();
            c.severity = 1;
            a.i.onError(c);
            a.m.O(.1);
            A(d);
          });
        }
        function br(a) {
          return a.ea != Zq;
        }
        function fr(a, b) {
          a.ea = b;
          a.j && a.j.zc(!br(a));
          br(a) || a.m.stop();
        }
        function Qr(a, b, c) {
          if (!a.G) throw new O(2, 7, 7001);
          b = a.i.networkingEngine.request(c, b);
          Xe(a.G, b);
          return b.promise;
        }
        K("shaka.hls.HlsParser", Xq);
        var or = {
            aac: "audio/aac",
            ac3: "audio/ac3",
            ec3: "audio/ec3",
            mp3: "audio/mpeg"
          },
          pr = {
            mp4: "audio/mp4",
            mp4a: "audio/mp4",
            m4s: "audio/mp4",
            m4i: "audio/mp4",
            m4a: "audio/mp4",
            m4f: "audio/mp4",
            cmfa: "audio/mp4",
            ts: "video/mp2t",
            tsa: "video/mp2t"
          },
          qr = {
            mp4: "video/mp4",
            mp4v: "video/mp4",
            m4s: "video/mp4",
            m4i: "video/mp4",
            m4v: "video/mp4",
            m4f: "video/mp4",
            cmfv: "video/mp4",
            ts: "video/mp2t",
            tsv: "video/mp2t"
          },
          Wr = {
            audio: pr,
            video: qr,
            text: {
              mp4: "application/mp4",
              m4s: "application/mp4",
              m4i: "application/mp4",
              m4f: "application/mp4",
              cmft: "application/mp4",
              vtt: "text/vtt",
              webvtt: "text/vtt",
              ttml: "application/ttml+xml"
            },
            image: {
              jpg: "image/jpeg",
              png: "image/png",
              svg: "image/svg+xml",
              webp: "image/webp",
              avif: "image/avif"
            }
          },
          Gr = {
            "com.apple.streamingkeydelivery": function (a, b) {
              if ("video/mp2t" == b) throw new O(2, 4, 4040);
              if (window.shakaMediaKeysPolyfill) throw new O(2, 4, 4041);
              return ec("com.apple.fps", [{
                initDataType: "sinf",
                initData: new Uint8Array(0),
                keyId: null
              }]);
            },
            "urn:uuid:edef8ba9-79d6-4ace-a3c8-27dcd51d21ed": function (a) {
              var b = Dq(a, "METHOD");
              if (!["SAMPLE-AES", "SAMPLE-AES-CTR"].includes(b)) return null;
              b = Dq(a, "URI");
              b = Wq(b);
              b = L(b.data);
              b = ec("com.widevine.alpha", [{
                initDataType: "cenc",
                initData: b
              }]);
              if (a = Z(a, "KEYID")) b.keyIds = new Set([a.toLowerCase().substr(2)]);
              return b;
            },
            "com.microsoft.playready": function (a) {
              var b = Dq(a, "METHOD");
              if (!["SAMPLE-AES", "SAMPLE-AES-CTR"].includes(b)) return null;
              a = Dq(a, "URI");
              a = Wq(a);
              a = L(a.data);
              b = new Uint8Array([154, 4, 240, 121, 152, 64, 66, 134, 171, 146, 230, 91, 224, 136, 95, 149]);
              a = Jf(a, b, new Set(), 0);
              return ec("com.microsoft.playready", [{
                initDataType: "cenc",
                initData: a
              }]);
            },
            identity: function (a) {
              a = Dq(a, "METHOD");
              return ["SAMPLE-AES", "SAMPLE-AES-CTR"].includes(a) ? ec("org.w3.clearkey", null) : null;
            }
          },
          Zq = "VOD",
          Rr = "EVENT",
          Ar = "LIVE",
          er = {
            gf: Zq,
            Qg: Rr,
            Ug: Ar
          };
        sc("Tizen 3") || sc("Tizen 2") || uc() || (Ug.m3u8 = function () {
          return new Xq();
        }, Sg["application/x-mpegurl"] = function () {
          return new Xq();
        }, Sg["application/vnd.apple.mpegurl"] = function () {
          return new Xq();
        });
        function Xr(a, b, c, d, e, f) {
          if (200 <= c && 299 >= c && 202 != c) return {
            uri: e || d,
            originalUri: d,
            data: b,
            status: c,
            headers: a,
            fromCache: !!a["x-shaka-from-cache"]
          };
          e = null;
          try {
            e = Ec(b);
          } catch (g) {}
          throw new O(401 == c || 403 == c ? 2 : 1, 1, 1001, d, c, e, a, f);
        }
        function Yr() {}
        function Zr(a, b, c, d, e) {
          var f = new $r();
          sf(b.headers).forEach(function (l, m) {
            f.append(m, l);
          });
          var g = new as(),
            h = {
              ze: !1,
              cf: !1
            };
          a = bs(a, c, {
            body: b.body || void 0,
            headers: f,
            method: b.method,
            signal: g.signal,
            credentials: b.allowCrossSiteCredentials ? "include" : void 0
          }, h, d, e, b.streamDataCallback);
          a = new Ke(a, function () {
            h.ze = !0;
            g.abort();
            return Promise.resolve();
          });
          if (b = b.retryParameters.timeout) {
            var k = new P(function () {
              h.cf = !0;
              g.abort();
            });
            k.O(b / 1E3);
            a.finally(function () {
              k.stop();
            });
          }
          return a;
        }
        function bs(a, b, c, d, e, f, g) {
          var h, k, l, m, p, n, q, v, y, w, x, D, z;
          return G(function (B) {
            switch (B.g) {
              case 1:
                return h = cs, k = ds, n = p = 0, q = Date.now(), C(B, 2), u(B, h(a, c), 4);
              case 4:
                l = B.h;
                f(es(l.headers));
                if ("HEAD" == c.method) {
                  B.B(5);
                  break;
                }
                v = l.clone().body.getReader();
                w = (y = l.headers.get("Content-Length")) ? parseInt(y, 10) : 0;
                x = function (E) {
                  function F() {
                    var H, I;
                    return G(function (J) {
                      switch (J.g) {
                        case 1:
                          return C(J, 2), u(J, v.read(), 4);
                        case 4:
                          H = J.h;
                          va(J, 3);
                          break;
                        case 2:
                          return wa(J), J.return();
                        case 3:
                          if (H.done) {
                            J.B(5);
                            break;
                          }
                          p += H.value.byteLength;
                          if (!g) {
                            J.B(5);
                            break;
                          }
                          return u(J, g(H.value), 5);
                        case 5:
                          I = Date.now();
                          if (100 < I - q || H.done) e(I - q, p - n, w - p), n = p, q = I;
                          H.done ? E.close() : (E.enqueue(H.value), F());
                          A(J);
                      }
                    });
                  }
                  F();
                };
                new k({
                  start: x
                });
                return u(B, l.arrayBuffer(), 6);
              case 6:
                m = B.h;
              case 5:
                va(B, 3);
                break;
              case 2:
                D = wa(B);
                if (d.ze) throw new O(1, 1, 7001, a, b);
                if (d.cf) throw new O(1, 1, 1003, a, b);
                throw new O(1, 1, 1002, a, D, b);
              case 3:
                return z = es(l.headers), B.return(Xr(z, m, l.status, a, l.url, b));
            }
          });
        }
        function es(a) {
          var b = {};
          a.forEach(function (c, d) {
            b[d.trim()] = c;
          });
          return b;
        }
        function fs() {
          if (window.ReadableStream) try {
            new ReadableStream({});
          } catch (a) {
            return !1;
          } else return !1;
          if (window.Response) {
            if (!new Response("").body) return !1;
          } else return !1;
          return !(!window.fetch || !window.AbortController);
        }
        K("shaka.net.HttpFetchPlugin", Yr);
        Yr.isSupported = fs;
        Yr.parse = Zr;
        var cs = window.fetch,
          as = window.AbortController,
          ds = window.ReadableStream,
          $r = window.Headers;
        fs() && (Ze("http", Zr, 2, !0), Ze("https", Zr, 2, !0), Ze("blob", Zr, 2, !0));
        function gs() {}
        function hs(a, b, c, d, e) {
          var f = new is(),
            g = Date.now(),
            h = 0,
            k = new Promise(function (l, m) {
              f.open(b.method, a, !0);
              f.responseType = "arraybuffer";
              f.timeout = b.retryParameters.timeout;
              f.withCredentials = b.allowCrossSiteCredentials;
              f.onabort = function () {
                m(new O(1, 1, 7001, a, c));
              };
              var p = !1;
              f.onreadystatechange = function () {
                if (2 == f.readyState && !p) {
                  var q = js(f);
                  e(q);
                  p = !0;
                }
              };
              f.onload = function () {
                var q = js(f),
                  v = f.response;
                try {
                  var y = Xr(q, v, f.status, a, f.responseURL, c);
                  l(y);
                } catch (w) {
                  m(w);
                }
              };
              f.onerror = function (q) {
                m(new O(1, 1, 1002, a, q, c));
              };
              f.ontimeout = function () {
                m(new O(1, 1, 1003, a, c));
              };
              f.onprogress = function (q) {
                var v = Date.now();
                if (100 < v - g || q.lengthComputable && q.loaded == q.total) d(v - g, q.loaded - h, q.total - q.loaded), h = q.loaded, g = v;
              };
              for (var n in b.headers) f.setRequestHeader(n.toLowerCase(), b.headers[n]);
              f.send(b.body);
            });
          return new Ke(k, function () {
            f.abort();
            return Promise.resolve();
          });
        }
        function js(a) {
          var b = a.getAllResponseHeaders().trim().split("\r\n");
          a = {};
          b = t(b);
          for (var c = b.next(); !c.done; c = b.next()) c = c.value.split(": "), a[c[0].toLowerCase()] = c.slice(1).join(": ");
          return a;
        }
        K("shaka.net.HttpXHRPlugin", gs);
        gs.parse = hs;
        var is = window.XMLHttpRequest;
        Ze("http", hs, 1, !0);
        Ze("https", hs, 1, !0);
        Ze("blob", hs, 1, !0);
        function ks(a, b, c, d) {
          this.g = a;
          this.i = b;
          this.groupId = c;
          this.h = d;
        }
        function ls(a) {
          return a.ya().map(function (b) {
            return "{" + encodeURI(b) + "}";
          }).join("") + ":" + a.Ba + ":" + a.ma;
        }
        function ms(a, b) {
          return ck(a.g.ya(), a.g.Ba, a.g.ma, b.streaming.retryParameters);
        }
        function ns() {
          this.h = this.j = this.i = 0;
          this.g = new Map();
          this.l = 0;
        }
        function os(a, b) {
          a.i += b;
          var c = a.l;
          a.l++;
          a.g.set(c, b);
          return c;
        }
        ns.prototype.close = function (a, b) {
          if (this.g.has(a)) {
            var c = this.g.get(a);
            this.g.delete(a);
            this.j += c;
            this.h += b;
          }
        };
        function ps(a) {
          var b = this;
          this.o = a;
          this.j = new Map();
          this.i = new jf(function () {
            return qs(b).catch(function () {});
          });
          this.h = [];
          this.m = function () {};
          this.l = function () {};
          this.g = new ns();
        }
        ps.prototype.destroy = function () {
          return this.i.destroy();
        };
        function rs(a, b, c) {
          a.m = b;
          a.l = c;
        }
        function qs(a) {
          var b = a.h.map(function (c) {
            return c();
          });
          a.h = [];
          return Promise.all(b);
        }
        function ss(a, b, c, d, e, f) {
          kf(a.i);
          var g = (a.j.get(b) || Promise.resolve()).then(function () {
            var h, k, l, m, p, n, q;
            return G(function (v) {
              if (1 == v.g) return u(v, ts(a, c), 2);
              h = v.h;
              if (a.i.g) throw new O(2, 9, 7001);
              if (e) for (m in k = L(h), l = new If(k), l.data) p = Number(m), n = l.data[p], q = l.g[p], a.l(n, q);
              a.g.close(d, h.byteLength);
              var y = a.g;
              a.m(0 == y.i ? 0 : y.j / y.i, a.g.h);
              return v.return(f(h));
            });
          });
          a.j.set(b, g);
        }
        function us(a) {
          return G(function (b) {
            return 1 == b.g ? u(b, Promise.all(a.j.values()), 2) : b.return(a.g.h);
          });
        }
        function ts(a, b) {
          var c, d, e, f;
          return G(function (g) {
            if (1 == g.g) return c = hf, d = a.o.request(c, b), e = function () {
              return d.abort();
            }, a.h.push(e), u(g, d.promise, 2);
            f = g.h;
            gb(a.h, e);
            return g.return(f.data);
          });
        }
        function vs(a, b) {
          var c = this;
          this.i = a;
          this.h = a.objectStore(b);
          this.g = new kc();
          a.onabort = function (d) {
            d.preventDefault();
            c.g.reject();
          };
          a.onerror = function (d) {
            d.preventDefault();
            c.g.reject();
          };
          a.oncomplete = function () {
            c.g.resolve();
          };
        }
        vs.prototype.abort = function () {
          var a = this;
          return G(function (b) {
            if (1 == b.g) {
              try {
                a.i.abort();
              } catch (c) {}
              C(b, 2);
              return u(b, a.g, 4);
            }
            if (2 != b.g) return va(b, 0);
            wa(b);
            A(b);
          });
        };
        function ws(a, b) {
          return new Promise(function (c, d) {
            var e = a.h.openCursor();
            e.onerror = d;
            e.onsuccess = function () {
              var f;
              return G(function (g) {
                if (1 == g.g) {
                  if (null == e.result) return c(), g.return();
                  f = e.result;
                  return u(g, b(f.key, f.value, f), 2);
                }
                f.continue();
                A(g);
              });
            };
          });
        }
        vs.prototype.store = function () {
          return this.h;
        };
        vs.prototype.promise = function () {
          return this.g;
        };
        function xs(a) {
          this.h = a;
          this.g = [];
        }
        xs.prototype.destroy = function () {
          return Promise.all(this.g.map(function (a) {
            return a.abort();
          }));
        };
        function ys(a, b) {
          return zs(a, b, "readwrite");
        }
        function zs(a, b, c) {
          c = a.h.transaction([b], c);
          var d = new vs(c, b);
          a.g.push(d);
          d.promise().then(function () {
            gb(a.g, d);
          }, function () {
            gb(a.g, d);
          });
          return d;
        }
        function As(a, b, c) {
          this.h = new xs(a);
          this.i = b;
          this.g = c;
        }
        r = As.prototype;
        r.destroy = function () {
          return this.h.destroy();
        };
        r.hasFixedKeySpace = function () {
          return !0;
        };
        r.addSegments = function () {
          return Bs(this.i);
        };
        r.removeSegments = function (a, b) {
          return Cs(this, this.i, a, b);
        };
        r.getSegments = function (a) {
          var b = this,
            c;
          return G(function (d) {
            if (1 == d.g) return u(d, Ds(b, b.i, a), 2);
            c = d.h;
            return d.return(c.map(function (e) {
              return b.Ae(e);
            }));
          });
        };
        r.addManifests = function () {
          return Bs(this.g);
        };
        r.updateManifest = function () {
          return Promise.reject(new O(2, 9, 9016, "Cannot modify values in " + this.g));
        };
        function Es(a, b, c) {
          a = ys(a.h, a.g);
          var d = a.store();
          d.get(b).onsuccess = function () {
            d.put(c, b);
          };
          return a.promise();
        }
        r.updateManifestExpiration = function (a, b) {
          var c = ys(this.h, this.g),
            d = c.store();
          d.get(a).onsuccess = function (e) {
            if (e = e.target.result) e.expiration = b, d.put(e, a);
          };
          return c.promise();
        };
        r.removeManifests = function (a, b) {
          return Cs(this, this.g, a, b);
        };
        r.getManifests = function (a) {
          var b = this,
            c;
          return G(function (d) {
            if (1 == d.g) return u(d, Ds(b, b.g, a), 2);
            c = d.h;
            return d.return(Promise.all(c.map(function (e) {
              return b.cc(e);
            })));
          });
        };
        r.getAllManifests = function () {
          var a = this,
            b,
            c;
          return G(function (d) {
            return 1 == d.g ? (b = zs(a.h, a.g, "readonly"), c = new Map(), u(d, ws(b, function (e, f) {
              var g;
              return G(function (h) {
                if (1 == h.g) return u(h, a.cc(f), 2);
                g = h.h;
                c.set(e, g);
                A(h);
              });
            }), 2)) : 3 != d.g ? u(d, b.promise(), 3) : d.return(c);
          });
        };
        r.Ae = function (a) {
          return a;
        };
        r.cc = function (a) {
          return Promise.resolve(a);
        };
        function Bs(a) {
          return Promise.reject(new O(2, 9, 9011, "Cannot add new value to " + a));
        }
        r.add = function (a, b) {
          var c = this,
            d,
            e,
            f,
            g,
            h,
            k,
            l;
          return G(function (m) {
            if (1 == m.g) {
              d = ys(c.h, a);
              e = d.store();
              f = [];
              g = {};
              h = t(b);
              for (k = h.next(); !k.done; g = {
                Gc: g.Gc
              }, k = h.next()) l = k.value, g.Gc = e.add(l), g.Gc.onsuccess = function (p) {
                return function () {
                  f.push(p.Gc.result);
                };
              }(g);
              return u(m, d.promise(), 2);
            }
            return m.return(f);
          });
        };
        function Cs(a, b, c, d) {
          a = ys(a.h, b);
          b = a.store();
          var e = {};
          c = t(c);
          for (var f = c.next(); !f.done; e = {
            Fc: e.Fc
          }, f = c.next()) e.Fc = f.value, b.delete(e.Fc).onsuccess = function (g) {
            return function () {
              return d(g.Fc);
            };
          }(e);
          return a.promise();
        }
        function Ds(a, b, c) {
          var d, e, f, g, h, k, l;
          return G(function (m) {
            if (1 == m.g) {
              d = zs(a.h, b, "readonly");
              e = d.store();
              f = {};
              g = [];
              h = {};
              k = t(c);
              for (l = k.next(); !l.done; h = {
                Wb: h.Wb,
                Ub: h.Ub
              }, l = k.next()) h.Ub = l.value, h.Wb = e.get(h.Ub), h.Wb.onsuccess = function (p) {
                return function () {
                  void 0 == p.Wb.result && g.push(p.Ub);
                  f[p.Ub] = p.Wb.result;
                };
              }(h);
              return u(m, d.promise(), 2);
            }
            if (g.length) throw new O(2, 9, 9012, "Could not find values for " + g);
            return m.return(c.map(function (p) {
              return f[p];
            }));
          });
        }
        function Fs(a) {
          this.g = new xs(a);
        }
        Fs.prototype.destroy = function () {
          return this.g.destroy();
        };
        Fs.prototype.getAll = function () {
          var a = this,
            b,
            c;
          return G(function (d) {
            return 1 == d.g ? (b = zs(a.g, "session-ids", "readonly"), c = [], u(d, ws(b, function (e, f) {
              c.push(f);
            }), 2)) : 3 != d.g ? u(d, b.promise(), 3) : d.return(c);
          });
        };
        Fs.prototype.add = function (a) {
          var b = ys(this.g, "session-ids"),
            c = b.store();
          a = t(a);
          for (var d = a.next(); !d.done; d = a.next()) c.add(d.value);
          return b.promise();
        };
        Fs.prototype.remove = function (a) {
          var b = this,
            c;
          return G(function (d) {
            return 1 == d.g ? (c = ys(b.g, "session-ids"), u(d, ws(c, function (e, f, g) {
              a.includes(f.sessionId) && g.delete();
            }), 2)) : u(d, c.promise(), 0);
          });
        };
        function Gs() {
          this.g = new Map();
        }
        Gs.prototype.destroy = function () {
          for (var a = [], b = t(this.g.values()), c = b.next(); !c.done; c = b.next()) a.push(c.value.destroy());
          this.g.clear();
          return Promise.all(a);
        };
        Gs.prototype.init = function () {
          var a = this;
          Hs.forEach(function (e, f) {
            (e = e()) && a.g.set(f, e);
          });
          for (var b = [], c = t(this.g.values()), d = c.next(); !d.done; d = c.next()) b.push(d.value.init());
          return Promise.all(b);
        };
        function Is(a) {
          var b = null;
          a.g.forEach(function (c, d) {
            c.getCells().forEach(function (e, f) {
              e.hasFixedKeySpace() || b || (b = {
                path: {
                  za: d,
                  la: f
                },
                la: e
              });
            });
          });
          if (b) return b;
          throw new O(2, 9, 9013, "Could not find a cell that supports add-operations");
        }
        function Js(a, b) {
          a.g.forEach(function (c, d) {
            c.getCells().forEach(function (e, f) {
              b({
                za: d,
                la: f
              }, e);
            });
          });
        }
        function Ks(a, b, c) {
          a = a.g.get(b);
          if (!a) throw new O(2, 9, 9013, "Could not find mechanism with name " + b);
          b = a.getCells().get(c);
          if (!b) throw new O(2, 9, 9013, "Could not find cell with name " + c);
          return b;
        }
        function Ls(a, b) {
          a.g.forEach(function (c) {
            b(c.getEmeSessionCell());
          });
        }
        function Ms(a) {
          var b = Array.from(a.g.keys());
          if (!b.length) throw new O(2, 9, 9E3, "No supported storage mechanisms found");
          return a.g.get(b[0]).getEmeSessionCell();
        }
        function Ns(a) {
          var b, c, d;
          return G(function (e) {
            return 1 == e.g ? (b = Array.from(a.g.values()), c = 0 < b.length, c || (d = Hs, d.forEach(function (f) {
              (f = f()) && b.push(f);
            })), u(e, Promise.all(b.map(function (f) {
              return f.erase();
            })), 2)) : c ? e.B(0) : u(e, Promise.all(b.map(function (f) {
              return f.destroy();
            })), 0);
          });
        }
        function Os(a, b) {
          Hs.set(a, b);
        }
        K("shaka.offline.StorageMuxer", Gs);
        Gs.unregister = function (a) {
          Hs.delete(a);
        };
        Gs.register = Os;
        Gs.prototype.destroy = Gs.prototype.destroy;
        var Hs = new Map();
        function Ps() {
          As.apply(this, arguments);
        }
        qa(Ps, As);
        Ps.prototype.updateManifestExpiration = function (a, b) {
          var c = this,
            d,
            e,
            f;
          return G(function (g) {
            d = ys(c.h, c.g);
            e = d.store();
            f = new kc();
            e.get(a).onsuccess = function (h) {
              (h = h.target.result) ? (h.expiration = b, e.put(h), f.resolve()) : f.reject(new O(2, 9, 9012, "Could not find values for " + a));
            };
            return u(g, Promise.all([d.promise(), f]), 0);
          });
        };
        Ps.prototype.cc = function (a) {
          var b, c, d, e, f, g;
          return G(function (h) {
            if (1 == h.g) {
              b = [];
              for (c = 0; c < a.periods.length; ++c) d = c == a.periods.length - 1 ? a.duration : a.periods[c + 1].startTime, e = d - a.periods[c].startTime, f = Qs(a.periods[c], e), b.push(f);
              return u(h, Op(b), 2);
            }
            g = h.h;
            return h.return({
              creationTime: 0,
              originalManifestUri: a.originalManifestUri,
              duration: a.duration,
              size: a.size,
              expiration: null == a.expiration ? Infinity : a.expiration,
              streams: g,
              sessionIds: a.sessionIds,
              drmInfo: a.drmInfo,
              appMetadata: a.appMetadata,
              sequenceMode: !1
            });
          });
        };
        function Qs(a, b) {
          Rs(a);
          for (var c = t(a.streams), d = c.next(); !d.done; d = c.next());
          return a.streams.map(function (e) {
            return Ss(e, a.startTime, b);
          });
        }
        function Ss(a, b, c) {
          var d = a.initSegmentUri ? Ts(a.initSegmentUri) : null,
            e = b + a.presentationTimeOffset,
            f = b + c;
          return {
            id: a.id,
            originalId: null,
            primary: a.primary,
            type: a.contentType,
            mimeType: a.mimeType,
            codecs: a.codecs,
            frameRate: a.frameRate,
            pixelAspectRatio: void 0,
            hdr: void 0,
            kind: a.kind,
            language: a.language,
            label: a.label,
            width: a.width,
            height: a.height,
            initSegmentKey: d,
            encrypted: a.encrypted,
            keyIds: new Set([a.keyId]),
            segments: a.segments.map(function (g) {
              var h = Ts(g.uri);
              return {
                startTime: b + g.startTime,
                endTime: b + g.endTime,
                dataKey: h,
                initSegmentKey: d,
                appendWindowStart: b,
                appendWindowEnd: f,
                timestampOffset: e,
                tilesLayout: ""
              };
            }),
            variantIds: a.variantIds,
            roles: [],
            forced: !1,
            audioSamplingRate: null,
            channelsCount: null,
            spatialAudio: !1,
            closedCaptions: null,
            tilesLayout: void 0,
            external: !1
          };
        }
        Ps.prototype.Ae = function (a) {
          return {
            data: a.data
          };
        };
        function Ts(a) {
          var b;
          if ((b = /^offline:[0-9]+\/[0-9]+\/([0-9]+)$/.exec(a)) || (b = /^offline:segment\/([0-9]+)$/.exec(a))) return Number(b[1]);
          throw new O(2, 9, 9004, "Could not parse uri " + a);
        }
        function Rs(a) {
          var b = a.streams.filter(function (h) {
            return "audio" == h.contentType;
          });
          a = a.streams.filter(function (h) {
            return "video" == h.contentType;
          });
          if (!b.every(function (h) {
            return h.variantIds;
          }) || !a.every(function (h) {
            return h.variantIds;
          })) {
            for (var c = t(b), d = c.next(); !d.done; d = c.next()) d.value.variantIds = [];
            c = t(a);
            for (d = c.next(); !d.done; d = c.next()) d.value.variantIds = [];
            c = 0;
            if (a.length && !b.length) {
              var e = c++,
                f = t(a);
              for (d = f.next(); !d.done; d = f.next()) d.value.variantIds.push(e);
            }
            if (!a.length && b.length) for (e = c++, f = t(b), d = f.next(); !d.done; d = f.next()) d.value.variantIds.push(e);
            if (a.length && b.length) for (b = t(b), d = b.next(); !d.done; d = b.next()) for (d = d.value, e = t(a), f = e.next(); !f.done; f = e.next()) {
              f = f.value;
              var g = c++;
              d.variantIds.push(g);
              f.variantIds.push(g);
            }
          }
        }
        function Us() {
          As.apply(this, arguments);
        }
        qa(Us, As);
        Us.prototype.cc = function (a) {
          var b, c, d, e, f, g;
          return G(function (h) {
            if (1 == h.g) {
              b = [];
              for (c = 0; c < a.periods.length; ++c) {
                d = c == a.periods.length - 1 ? a.duration : a.periods[c + 1].startTime;
                e = d - a.periods[c].startTime;
                for (var k = a.periods[c], l = [], m = t(k.streams), p = m.next(); !p.done; p = m.next()) p = p.value, 0 != p.variantIds.length && l.push(Vs(p, k.startTime, k.startTime + e));
                f = l;
                b.push(f);
              }
              return u(h, Op(b), 2);
            }
            g = h.h;
            return h.return({
              appMetadata: a.appMetadata,
              creationTime: 0,
              drmInfo: a.drmInfo,
              duration: a.duration,
              expiration: null == a.expiration ? Infinity : a.expiration,
              originalManifestUri: a.originalManifestUri,
              sessionIds: a.sessionIds,
              size: a.size,
              streams: g,
              sequenceMode: !1
            });
          });
        };
        function Vs(a, b, c) {
          return {
            id: a.id,
            originalId: a.originalId,
            primary: a.primary,
            type: a.contentType,
            mimeType: a.mimeType,
            codecs: a.codecs,
            frameRate: a.frameRate,
            pixelAspectRatio: a.pixelAspectRatio,
            hdr: void 0,
            kind: a.kind,
            language: a.language,
            label: a.label,
            width: a.width,
            height: a.height,
            encrypted: a.encrypted,
            keyIds: new Set([a.keyId]),
            segments: a.segments.map(function (d) {
              return {
                startTime: b + d.startTime,
                endTime: b + d.endTime,
                initSegmentKey: a.initSegmentKey,
                appendWindowStart: b,
                appendWindowEnd: c,
                timestampOffset: b - a.presentationTimeOffset,
                dataKey: d.dataKey,
                tilesLayout: ""
              };
            }),
            variantIds: a.variantIds,
            roles: [],
            forced: !1,
            audioSamplingRate: null,
            channelsCount: null,
            spatialAudio: !1,
            closedCaptions: null,
            tilesLayout: void 0,
            external: !1
          };
        }
        function Ws() {
          As.apply(this, arguments);
        }
        qa(Ws, As);
        r = Ws.prototype;
        r.hasFixedKeySpace = function () {
          return !1;
        };
        r.addSegments = function (a) {
          return this.add(this.i, a);
        };
        r.addManifests = function (a) {
          return this.add(this.g, a);
        };
        r.updateManifest = function (a, b) {
          return Es(this, a, b);
        };
        r.cc = function (a) {
          null == a.expiration && (a.expiration = Infinity);
          return Promise.resolve(a);
        };
        function Xs() {
          this.m = this.j = this.i = this.h = this.g = this.l = null;
        }
        r = Xs.prototype;
        r.init = function () {
          var a = this,
            b = new kc(),
            c = !1,
            d = new P(function () {
              c = !0;
              b.reject(new O(2, 9, 9017));
            });
          d.O(5);
          var e = window.indexedDB.open("shaka_offline_db", 5);
          e.onsuccess = function () {
            if (!c) {
              var f = e.result;
              a.l = f;
              var g = f.objectStoreNames;
              g = g.contains("manifest") && g.contains("segment") ? new Ps(f, "segment", "manifest") : null;
              a.g = g;
              g = f.objectStoreNames;
              g = g.contains("manifest-v2") && g.contains("segment-v2") ? new Us(f, "segment-v2", "manifest-v2") : null;
              a.h = g;
              g = f.objectStoreNames;
              g = g.contains("manifest-v3") && g.contains("segment-v3") ? new Us(f, "segment-v3", "manifest-v3") : null;
              a.i = g;
              g = f.objectStoreNames;
              g = g.contains("manifest-v5") && g.contains("segment-v5") ? new Ws(f, "segment-v5", "manifest-v5") : null;
              a.j = g;
              f = f.objectStoreNames.contains("session-ids") ? new Fs(f) : null;
              a.m = f;
              d.stop();
              b.resolve();
            }
          };
          e.onupgradeneeded = function () {
            for (var f = e.result, g = t(["segment-v5", "manifest-v5", "session-ids"]), h = g.next(); !h.done; h = g.next()) h = h.value, f.objectStoreNames.contains(h) || f.createObjectStore(h, {
              autoIncrement: !0
            });
          };
          e.onerror = function (f) {
            c || (b.reject(new O(2, 9, 9001, e.error)), d.stop(), f.preventDefault());
          };
          return b;
        };
        r.destroy = function () {
          var a = this;
          return G(function (b) {
            switch (b.g) {
              case 1:
                if (!a.g) {
                  b.B(2);
                  break;
                }
                return u(b, a.g.destroy(), 2);
              case 2:
                if (!a.h) {
                  b.B(4);
                  break;
                }
                return u(b, a.h.destroy(), 4);
              case 4:
                if (!a.i) {
                  b.B(6);
                  break;
                }
                return u(b, a.i.destroy(), 6);
              case 6:
                if (!a.j) {
                  b.B(8);
                  break;
                }
                return u(b, a.j.destroy(), 8);
              case 8:
                if (!a.m) {
                  b.B(10);
                  break;
                }
                return u(b, a.m.destroy(), 10);
              case 10:
                a.l && a.l.close(), A(b);
            }
          });
        };
        r.getCells = function () {
          var a = new Map();
          this.g && a.set("v1", this.g);
          this.h && a.set("v2", this.h);
          this.i && a.set("v3", this.i);
          this.j && a.set("v5", this.j);
          return a;
        };
        r.getEmeSessionCell = function () {
          return this.m;
        };
        r.erase = function () {
          var a = this;
          return G(function (b) {
            switch (b.g) {
              case 1:
                if (!a.g) {
                  b.B(2);
                  break;
                }
                return u(b, a.g.destroy(), 2);
              case 2:
                if (!a.h) {
                  b.B(4);
                  break;
                }
                return u(b, a.h.destroy(), 4);
              case 4:
                if (!a.i) {
                  b.B(6);
                  break;
                }
                return u(b, a.i.destroy(), 6);
              case 6:
                if (!a.j) {
                  b.B(8);
                  break;
                }
                return u(b, a.j.destroy(), 8);
              case 8:
                return a.l && a.l.close(), u(b, Ys(), 10);
              case 10:
                return a.l = null, a.g = null, a.h = null, a.i = null, a.j = null, u(b, a.init(), 0);
            }
          });
        };
        function Ys() {
          var a = new kc(),
            b = window.indexedDB.deleteDatabase("shaka_offline_db");
          b.onblocked = function () {};
          b.onsuccess = function () {
            a.resolve();
          };
          b.onerror = function (c) {
            a.reject(new O(2, 9, 9001, b.error));
            c.preventDefault();
          };
          return a;
        }
        Os("idb", function () {
          return sc("CrKey") || rc() || !window.indexedDB ? null : new Xs();
        });
        function Zs(a, b, c, d) {
          this.g = a;
          this.i = b;
          this.h = c;
          this.l = d;
          this.j = ["offline:", a, "/", b, "/", c, "/", d].join("");
        }
        Zs.prototype.za = function () {
          return this.i;
        };
        Zs.prototype.la = function () {
          return this.h;
        };
        Zs.prototype.key = function () {
          return this.l;
        };
        Zs.prototype.toString = function () {
          return this.j;
        };
        function $s(a) {
          a = /^offline:([a-z]+)\/([^/]+)\/([^/]+)\/([0-9]+)$/.exec(a);
          if (null == a) return null;
          var b = a[1];
          if ("manifest" != b && "segment" != b) return null;
          var c = a[2];
          if (!c) return null;
          var d = a[3];
          return d && null != b ? new Zs(b, c, d, Number(a[4])) : null;
        }
        function at(a, b) {
          this.h = a;
          this.g = b;
        }
        function bt(a, b) {
          var c = new U(null, 0);
          c.Aa(b.duration);
          var d = b.streams.filter(function (l) {
              return "audio" == l.type;
            }),
            e = b.streams.filter(function (l) {
              return "video" == l.type;
            });
          d = ct(a, d, e, c);
          e = b.streams.filter(function (l) {
            return l.type == ic;
          }).map(function (l) {
            return dt(a, l, c);
          });
          var f = b.streams.filter(function (l) {
              return "image" == l.type;
            }).map(function (l) {
              return dt(a, l, c);
            }),
            g = b.drmInfo ? [b.drmInfo] : [];
          if (b.drmInfo) for (var h = t(d.values()), k = h.next(); !k.done; k = h.next()) k = k.value, k.audio && k.audio.encrypted && (k.audio.drmInfos = g), k.video && k.video.encrypted && (k.video.drmInfos = g);
          return {
            presentationTimeline: c,
            minBufferTime: 2,
            offlineSessionIds: b.sessionIds,
            variants: Array.from(d.values()),
            textStreams: e,
            imageStreams: f,
            sequenceMode: b.sequenceMode || !1
          };
        }
        function ct(a, b, c, d) {
          for (var e = new Set(), f = t(b), g = f.next(); !g.done; g = f.next()) {
            var h = t(g.value.variantIds);
            for (g = h.next(); !g.done; g = h.next()) e.add(g.value);
          }
          f = t(c);
          for (g = f.next(); !g.done; g = f.next()) for (h = t(g.value.variantIds), g = h.next(); !g.done; g = h.next()) e.add(g.value);
          f = new Map();
          e = t(e);
          for (g = e.next(); !g.done; g = e.next()) g = g.value, f.set(g, {
            id: g,
            language: "",
            disabledUntilTime: 0,
            primary: !1,
            audio: null,
            video: null,
            bandwidth: 0,
            allowedByApplication: !0,
            allowedByKeySystem: !0,
            decodingInfos: []
          });
          b = t(b);
          for (e = b.next(); !e.done; e = b.next()) for (e = e.value, g = dt(a, e, d), h = t(e.variantIds), e = h.next(); !e.done; e = h.next()) e = f.get(e.value), e.language = g.language, e.primary = e.primary || g.primary, e.audio = g;
          c = t(c);
          for (b = c.next(); !b.done; b = c.next()) for (e = b.value, b = dt(a, e, d), g = t(e.variantIds), e = g.next(); !e.done; e = g.next()) e = f.get(e.value), e.primary = e.primary || b.primary, e.video = b;
          return f;
        }
        function dt(a, b, c) {
          var d = b.segments.map(function (e) {
            return et(a, e);
          });
          c.Jb(d);
          return {
            id: b.id,
            originalId: b.originalId,
            createSegmentIndex: function () {
              return Promise.resolve();
            },
            segmentIndex: new Jj(d),
            mimeType: b.mimeType,
            codecs: b.codecs,
            width: b.width || void 0,
            height: b.height || void 0,
            frameRate: b.frameRate,
            pixelAspectRatio: b.pixelAspectRatio,
            hdr: b.hdr,
            kind: b.kind,
            encrypted: b.encrypted,
            drmInfos: [],
            keyIds: b.keyIds,
            language: b.language,
            label: b.label,
            type: b.type,
            primary: b.primary,
            trickModeVideo: null,
            emsgSchemeIdUris: null,
            roles: b.roles,
            forced: b.forced,
            channelsCount: b.channelsCount,
            audioSamplingRate: b.audioSamplingRate,
            spatialAudio: b.spatialAudio,
            closedCaptions: b.closedCaptions,
            tilesLayout: b.tilesLayout,
            external: b.external
          };
        }
        function et(a, b) {
          var c = new Zs("segment", a.h, a.g, b.dataKey);
          return new T(b.startTime, b.endTime, function () {
            return [c.toString()];
          }, 0, null, null != b.initSegmentKey ? ft(a, b.initSegmentKey) : null, b.timestampOffset, b.appendWindowStart, b.appendWindowEnd, [], b.tilesLayout || "");
        }
        function ft(a, b) {
          var c = new Zs("segment", a.h, a.g, b);
          return new pi(function () {
            return [c.toString()];
          }, 0, null);
        }
        function gt() {
          this.g = null;
        }
        r = gt.prototype;
        r.configure = function () {};
        r.start = function (a, b) {
          var c = this,
            d,
            e,
            f,
            g,
            h,
            k,
            l;
          return G(function (m) {
            switch (m.g) {
              case 1:
                d = $s(a);
                c.g = d;
                if (null == d || "manifest" != d.g) throw new O(2, 1, 9004, a);
                e = new Gs();
                ua(m);
                return u(m, e.init(), 4);
              case 4:
                return u(m, Ks(e, d.za(), d.la()), 5);
              case 5:
                return f = m.h, u(m, f.getManifests([d.key()]), 6);
              case 6:
                return g = m.h, h = g[0], k = new at(d.za(), d.la()), l = bt(k, h), b.makeTextStreamsForClosedCaptions(l), m.return(l);
              case 2:
                return ya(m), u(m, e.destroy(), 7);
              case 7:
                za(m, 0);
            }
          });
        };
        r.stop = function () {
          return Promise.resolve();
        };
        r.update = function () {};
        r.onExpirationUpdated = function (a, b) {
          var c = this,
            d,
            e,
            f,
            g,
            h,
            k,
            l;
          return G(function (m) {
            switch (m.g) {
              case 1:
                return d = c.g, e = new Gs(), C(m, 2, 3), u(m, e.init(), 5);
              case 5:
                return u(m, Ks(e, d.za(), d.la()), 6);
              case 6:
                return f = m.h, u(m, f.getManifests([d.key()]), 7);
              case 7:
                g = m.h;
                h = g[0];
                k = h.sessionIds.includes(a);
                l = void 0 == h.expiration || h.expiration > b;
                if (!k || !l) {
                  m.B(3);
                  break;
                }
                return u(m, f.updateManifestExpiration(d.key(), b), 3);
              case 3:
                return ya(m), u(m, e.destroy(), 10);
              case 10:
                za(m, 0);
                break;
              case 2:
                wa(m), m.B(3);
            }
          });
        };
        Sg["application/x-offline-manifest"] = function () {
          return new gt();
        };
        function ht() {}
        function it(a) {
          var b = $s(a);
          b && "manifest" == b.g ? (a = {
            uri: a,
            originalUri: a,
            data: new ArrayBuffer(0),
            headers: {
              "content-type": "application/x-offline-manifest"
            }
          }, a = Ne(a)) : a = b && "segment" == b.g ? jt(b.key(), b) : Le(new O(2, 1, 9004, a));
          return a;
        }
        function jt(a, b) {
          var c = new Gs();
          return Ne(void 0).Z(function () {
            return c.init();
          }).Z(function () {
            return Ks(c, b.za(), b.la());
          }).Z(function (d) {
            return d.getSegments([b.key()]);
          }).Z(function (d) {
            return {
              uri: b,
              data: d[0].data,
              headers: {}
            };
          }).finally(function () {
            return c.destroy();
          });
        }
        K("shaka.offline.OfflineScheme", ht);
        ht.plugin = it;
        Ze("offline", it);
        function kt(a, b, c) {
          var d, e, f, g, h, k;
          return G(function (l) {
            switch (l.g) {
              case 1:
                d = [];
                for (var m = [], p = t(c), n = p.next(); !n.done; n = p.next()) {
                  n = n.value;
                  for (var q = !1, v = t(m), y = v.next(); !y.done; y = v.next()) if (y = y.value, lt(y.info, n)) {
                    y.sessionIds.push(n.sessionId);
                    q = !0;
                    break;
                  }
                  q || m.push({
                    info: n,
                    sessionIds: [n.sessionId]
                  });
                }
                e = t(m);
                f = e.next();
              case 2:
                if (f.done) {
                  l.B(4);
                  break;
                }
                g = f.value;
                h = mt(a, b, g);
                return u(l, h, 5);
              case 5:
                k = l.h;
                d = d.concat(k);
                f = e.next();
                l.B(2);
                break;
              case 4:
                return l.return(d);
            }
          });
        }
        function mt(a, b, c) {
          var d, e;
          return G(function (f) {
            switch (f.g) {
              case 1:
                return d = new eg({
                  lb: b,
                  onError: function () {},
                  dd: function () {},
                  onExpirationUpdated: function () {},
                  onEvent: function () {}
                }), C(f, 2), d.configure(a), u(f, mg(d, c.info.keySystem, c.info.licenseUri, c.info.serverCertificate, c.info.audioCapabilities, c.info.videoCapabilities), 4);
              case 4:
                va(f, 3);
                break;
              case 2:
                return wa(f), u(f, d.destroy(), 5);
              case 5:
                return f.return([]);
              case 3:
                return C(f, 6), u(f, xg(d), 8);
              case 8:
                va(f, 7);
                break;
              case 6:
                return wa(f), u(f, d.destroy(), 9);
              case 9:
                return f.return([]);
              case 7:
                return e = [], u(f, Promise.all(c.sessionIds.map(function (g) {
                  return G(function (h) {
                    if (1 == h.g) return C(h, 2), u(h, yg(d, g), 4);
                    if (2 != h.g) return e.push(g), va(h, 0);
                    wa(h);
                    A(h);
                  });
                })), 10);
              case 10:
                return u(f, d.destroy(), 11);
              case 11:
                return f.return(e);
            }
          });
        }
        function lt(a, b) {
          function c(d, e) {
            return d.robustness == e.robustness && d.contentType == e.contentType;
          }
          return a.keySystem == b.keySystem && a.licenseUri == b.licenseUri && hb(a.audioCapabilities, b.audioCapabilities, c) && hb(a.videoCapabilities, b.videoCapabilities, c);
        }
        function nt(a, b, c) {
          var d = b.presentationTimeline.getDuration();
          b = ot(b);
          return {
            offlineUri: null,
            originalManifestUri: a,
            duration: d,
            size: 0,
            expiration: Infinity,
            tracks: b,
            appMetadata: c,
            isIncomplete: !1
          };
        }
        function pt(a, b) {
          var c = bt(new at(a.za(), a.la()), b),
            d = b.appMetadata || {};
          c = ot(c);
          return {
            offlineUri: a.toString(),
            originalManifestUri: b.originalManifestUri,
            duration: b.duration,
            size: b.size,
            expiration: b.expiration,
            tracks: c,
            appMetadata: d,
            isIncomplete: b.isIncomplete || !1
          };
        }
        function ot(a) {
          var b = [],
            c = he(a.variants);
          c = t(c);
          for (var d = c.next(); !d.done; d = c.next()) b.push(Zd(d.value));
          a = t(a.textStreams);
          for (c = a.next(); !c.done; c = a.next()) b.push($d(c.value));
          return b;
        }
        function qt() {
          this.g = {};
        }
        function rt(a, b) {
          var c = b.audio,
            d = b.video;
          c && !d && (a.g[c.id] = c.bandwidth || b.bandwidth);
          !c && d && (a.g[d.id] = d.bandwidth || b.bandwidth);
          if (c && d) {
            var e = c.bandwidth || 393216,
              f = d.bandwidth || b.bandwidth - e;
            0 >= f && (f = b.bandwidth);
            a.g[c.id] = e;
            a.g[d.id] = f;
          }
        }
        function st(a, b) {
          a.g[b.id] = b.bandwidth || 2048;
        }
        function tt(a, b) {
          a = a.g[b];
          null == a && (a = 0);
          return a;
        }
        function ut(a) {
          var b = this;
          if (a && a.constructor != V) throw new O(2, 9, 9008);
          this.g = this.h = null;
          a ? (this.h = a.h, this.g = a.kc()) : (this.h = El(), this.g = new Ye());
          this.i = [];
          this.j = [];
          var c = !a;
          this.l = new jf(function () {
            var d, e, f, g, h;
            return G(function (k) {
              switch (k.g) {
                case 1:
                  return u(k, Promise.all(b.j.map(function (l) {
                    return qs(l);
                  })), 2);
                case 2:
                  d = function () {};
                  e = [];
                  f = t(b.i);
                  for (g = f.next(); !g.done; g = f.next()) h = g.value, e.push(h.then(d, d));
                  return u(k, Promise.all(e), 3);
                case 3:
                  if (!c) {
                    k.B(4);
                    break;
                  }
                  return u(k, b.g.destroy(), 4);
                case 4:
                  b.h = null, b.g = null, A(k);
              }
            });
          });
        }
        function vt() {
          if (nc()) a: {
            var a = t(Hs.values());
            for (var b = a.next(); !b.done; b = a.next()) if (b = b.value, b = b()) {
              b.destroy();
              a = !0;
              break a;
            }
            a = !1;
          } else a = !1;
          return a;
        }
        r = ut.prototype;
        r.destroy = function () {
          return this.l.destroy();
        };
        r.configure = function (a, b) {
          2 == arguments.length && "string" == typeof a && (a = yl(a, b));
          return Gl(this.h, a);
        };
        r.getConfiguration = function () {
          var a = El();
          Gl(a, this.h, El());
          return a;
        };
        r.kc = function () {
          return this.g;
        };
        r.store = function (a, b, c) {
          var d = this,
            e = this.getConfiguration(),
            f = new ps(this.g);
          this.j.push(f);
          b = wt(this, a, b || {}, function () {
            var g;
            return G(function (h) {
              if (1 == h.g) return u(h, Rg(a, d.g, e.manifest.retryParameters, c || null), 2);
              g = h.h;
              return h.return(g());
            });
          }, e, f);
          b = new Ke(b, function () {
            return qs(f);
          });
          b.finally(function () {
            gb(d.j, f);
          });
          return xt(this, b);
        };
        function wt(a, b, c, d, e, f) {
          var g, h, k, l, m, p, n, q, v, y, w, x, D, z;
          return G(function (B) {
            switch (B.g) {
              case 1:
                return yt(), h = g = null, k = new Gs(), p = m = l = null, C(B, 2, 3), u(B, d(), 5);
              case 5:
                return g = B.h, u(B, zt(a, b, g, e), 6);
              case 6:
                n = B.h;
                At(a);
                q = !n.presentationTimeline.T() && !n.presentationTimeline.jb();
                if (!q) throw new O(2, 9, 9005, b);
                return u(B, Bt(a, n, function (E) {
                  p = p || E;
                }, e), 7);
              case 7:
                h = B.h;
                At(a);
                if (p) throw p;
                return u(B, Ct(n, e), 8);
              case 8:
                return u(B, k.init(), 9);
              case 9:
                return At(a), u(B, Is(k), 10);
              case 10:
                return l = B.h, At(a), v = Dt(h, n, b, c, e, f), y = v.cg, w = v.qe, u(B, l.la.addManifests([y]), 11);
              case 11:
                x = B.h;
                At(a);
                m = x[0];
                At(a);
                if (p) throw p;
                return u(B, Et(a, w, m, y, f, e, l.la, n, h), 12);
              case 12:
                return At(a), D = new Zs("manifest", l.path.za, l.path.la, m), B.return(pt(D, y));
              case 3:
                return ya(B), u(B, k.destroy(), 13);
              case 13:
                if (!g) {
                  B.B(14);
                  break;
                }
                return u(B, g.stop(), 14);
              case 14:
                if (!h) {
                  B.B(16);
                  break;
                }
                return u(B, h.destroy(), 16);
              case 16:
                za(B, 0);
                break;
              case 2:
                z = wa(B);
                if (null == m) {
                  B.B(18);
                  break;
                }
                return u(B, Ft(m), 18);
              case 18:
                throw p || z;
            }
          });
        }
        function Et(a, b, c, d, e, f, g, h, k) {
          var l, m, p, n, q, v, y, w, x, D;
          return G(function (z) {
            switch (z.g) {
              case 1:
                l = {};
                m = 0;
                p = function (B, E) {
                  var F, H, I, J, N, R, Q;
                  return G(function (ba) {
                    if (1 == ba.g) {
                      F = {};
                      H = t(B);
                      for (I = H.next(); !I.done; F = {
                        cb: F.cb
                      }, I = H.next()) F.cb = I.value, J = ms(F.cb, f), N = F.cb.i, R = F.cb.h, Q = function (M) {
                        return function (ka) {
                          var Fa, xa, Na;
                          return G(function (Ha) {
                            if (1 == Ha.g) return u(Ha, g.addSegments([{
                              data: ka
                            }]), 2);
                            Fa = Ha.h;
                            At(a);
                            xa = M.cb.g;
                            Na = ls(xa);
                            l[Na] = Fa[0];
                            m += ka.byteLength;
                            A(Ha);
                          });
                        };
                      }(F), ss(e, F.cb.groupId, J, N, R, Q);
                      return u(ba, us(e), 2);
                    }
                    if (!E) return ba.B(0);
                    At(a);
                    Gt(h, d, k, f);
                    return u(ba, g.updateManifest(c, d), 0);
                  });
                };
                n = !1;
                C(z, 2);
                if (!Ht(h) || !n || It(h)) {
                  z.B(4);
                  break;
                }
                return u(z, p(b.filter(function (B) {
                  return B.h;
                }), !0), 5);
              case 5:
                return At(a), b = b.filter(function (B) {
                  return !B.h;
                }), q = l, v = m, l = {}, m = 0, u(z, Jt(g, c, d, q, v, function () {
                  return At(a);
                }), 6);
              case 6:
                At(a);
              case 4:
                if (n) {
                  z.B(7);
                  break;
                }
                return u(z, p(b, !1), 8);
              case 8:
                return At(a), y = l, w = m, l = {}, m = 0, u(z, Jt(g, c, d, y, w, function () {
                  return At(a);
                }), 9);
              case 9:
                At(a);
              case 7:
                va(z, 0);
                break;
              case 2:
                return x = wa(z), D = Object.values(l), u(z, g.removeSegments(D, function () {}), 10);
              case 10:
                throw x;
            }
          });
        }
        function Ft(a) {
          var b, c, d, e;
          return G(function (f) {
            switch (f.g) {
              case 1:
                return b = new Gs(), u(f, b.init(), 2);
              case 2:
                return u(f, Is(b), 3);
              case 3:
                return c = f.h, d = new Zs("manifest", c.path.za, c.path.la, a), u(f, b.destroy(), 4);
              case 4:
                return e = new ut(), u(f, e.remove(d.toString()), 0);
            }
          });
        }
        function Jt(a, b, c, d, e, f) {
          var g, h, k, l, m, p, n, q, v, y, w;
          return G(function (x) {
            switch (x.g) {
              case 1:
                g = !1;
                C(x, 2);
                h = !0;
                k = t(c.streams);
                for (l = k.next(); !l.done; l = k.next()) for (m = l.value, p = t(m.segments), n = p.next(); !n.done; n = p.next()) q = n.value, v = q.pendingSegmentRefId ? d[q.pendingSegmentRefId] : null, null != v && (q.dataKey = v, q.pendingSegmentRefId = void 0), v = q.pendingInitSegmentRefId ? d[q.pendingInitSegmentRefId] : null, null != v && (q.initSegmentKey = v, q.pendingInitSegmentRefId = void 0), q.pendingSegmentRefId && (h = !1), q.pendingInitSegmentRefId && (h = !1);
                c.size += e;
                h && (c.isIncomplete = !1);
                return u(x, a.updateManifest(b, c), 4);
              case 4:
                g = !0;
                f();
                va(x, 0);
                break;
              case 2:
                return y = wa(x), u(x, Ft(b), 5);
              case 5:
                if (g) {
                  x.B(6);
                  break;
                }
                w = Object.values(d);
                return u(x, a.removeSegments(w, function () {}), 6);
              case 6:
                throw y;
            }
          });
        }
        function Ct(a, b) {
          var c, d, e, f, g, h, k, l, m, p, n, q, v, y, w, x, D, z, B, E, F, H, I, J, N, R, Q, ba, M;
          return G(function (ka) {
            switch (ka.g) {
              case 1:
                return c = {
                  width: Infinity,
                  height: Infinity
                }, Id(a, b.restrictions, c), u(ka, Md(a, b.offline.usePersistentLicense), 2);
              case 2:
                d = [];
                e = b.preferredAudioChannelCount;
                f = b.preferredDecodingAttributes;
                g = b.preferredVideoCodecs;
                h = b.preferredAudioCodecs;
                wd(a, g, h, e, f);
                k = t(a.variants);
                for (l = k.next(); !l.done; l = k.next()) m = l.value, d.push(Zd(m));
                p = t(a.textStreams);
                for (n = p.next(); !n.done; n = p.next()) q = n.value, d.push($d(q));
                v = t(a.imageStreams);
                for (y = v.next(); !y.done; y = v.next()) w = y.value, d.push(ae(w));
                return u(ka, b.offline.trackSelectionCallback(d), 3);
              case 3:
                x = ka.h;
                D = a.presentationTimeline.getDuration();
                z = 0;
                B = t(x);
                for (E = B.next(); !E.done; E = B.next()) F = E.value, H = F.bandwidth * D / 8, z += H;
                C(ka, 4);
                return u(ka, b.offline.downloadSizeCallback(z), 6);
              case 6:
                I = ka.h;
                if (!I) throw new O(2, 9, 9014);
                va(ka, 5);
                break;
              case 4:
                J = wa(ka);
                if (J instanceof O) throw J;
                throw new O(2, 9, 9015);
              case 5:
                N = new Set();
                R = new Set();
                Q = new Set();
                ba = t(x);
                for (E = ba.next(); !E.done; E = ba.next()) M = E.value, "variant" == M.type && N.add(M.id), "text" == M.type && R.add(M.id), "image" == M.type && Q.add(M.id);
                a.variants = a.variants.filter(function (Fa) {
                  return N.has(Fa.id);
                });
                a.textStreams = a.textStreams.filter(function (Fa) {
                  return R.has(Fa.id);
                });
                a.imageStreams = a.imageStreams.filter(function (Fa) {
                  return Q.has(Fa.id);
                });
                Kt(a);
                A(ka);
            }
          });
        }
        function Dt(a, b, c, d, e, f) {
          var g = nt(c, b, d),
            h = e.offline.progressCallback;
          rs(f, function (q, v) {
            g.size = v;
            h(g, q);
          }, function (q, v) {
            k && e.offline.usePersistentLicense && l == v && ug(a, "cenc", q);
          });
          var k = Ht(b) && !It(b),
            l = null;
          k && (l = Lt.get(a.g.keySystem));
          for (var m = new qt(), p = t(b.textStreams), n = p.next(); !n.done; n = p.next()) m.g[n.value.id] = 52;
          p = t(b.imageStreams);
          for (n = p.next(); !n.done; n = p.next()) st(m, n.value);
          n = t(b.variants);
          for (p = n.next(); !p.done; p = n.next()) rt(m, p.value);
          m = Mt(f, m, b, e);
          f = m.streams;
          m = m.qe;
          n = a.g;
          p = e.offline.usePersistentLicense;
          n && p && (n.initData = []);
          return {
            cg: {
              creationTime: Date.now(),
              originalManifestUri: c,
              duration: b.presentationTimeline.getDuration(),
              size: 0,
              expiration: a.jc(),
              streams: f,
              sessionIds: p ? Dg(a) : [],
              drmInfo: n,
              appMetadata: d,
              isIncomplete: !0,
              sequenceMode: b.sequenceMode
            },
            qe: m
          };
        }
        function Ht(a) {
          return a.variants.some(function (b) {
            var c = b.audio && b.audio.encrypted;
            return b.video && b.video.encrypted || c;
          });
        }
        function It(a) {
          return a.variants.some(function (b) {
            return (b.video ? b.video.drmInfos : []).concat(b.audio ? b.audio.drmInfos : []).some(function (c) {
              return c.initData && c.initData.length;
            });
          });
        }
        function Gt(a, b, c, d) {
          b.expiration = c.jc();
          c = Dg(c);
          b.sessionIds = d.offline.usePersistentLicense ? c : [];
          if (Ht(a) && d.offline.usePersistentLicense && !c.length) throw new O(2, 9, 9007);
        }
        r.remove = function (a) {
          return Nt(this, Ot(this, a));
        };
        function Ot(a, b) {
          var c, d, e, f, g, h;
          return G(function (k) {
            switch (k.g) {
              case 1:
                yt();
                c = $s(b);
                if (null == c || "manifest" != c.g) throw new O(2, 9, 9004, b);
                d = c;
                e = new Gs();
                ua(k);
                return u(k, e.init(), 4);
              case 4:
                return u(k, Ks(e, d.za(), d.la()), 5);
              case 5:
                return f = k.h, u(k, f.getManifests([d.key()]), 6);
              case 6:
                return g = k.h, h = g[0], u(k, Promise.all([Pt(a, h, e), Qt(f, d, h)]), 2);
              case 2:
                return ya(k), u(k, e.destroy(), 8);
              case 8:
                za(k, 0);
            }
          });
        }
        function Rt(a, b) {
          for (var c = [], d = t(a.streams), e = d.next(); !e.done; e = d.next()) e = e.value, b && "video" == e.type ? c.push({
            contentType: Yc(e.mimeType, e.codecs),
            robustness: a.drmInfo.videoRobustness
          }) : b || "audio" != e.type || c.push({
            contentType: Yc(e.mimeType, e.codecs),
            robustness: a.drmInfo.audioRobustness
          });
          return c;
        }
        function Pt(a, b, c) {
          return G(function (d) {
            return u(d, St(a.g, a.h.drm, c, b), 0);
          });
        }
        function Qt(a, b, c) {
          function d() {}
          var e = Tt(c);
          pt(b, c);
          return Promise.all([a.removeSegments(e, d), a.removeManifests([b.key()], d)]);
        }
        r.rg = function () {
          return Nt(this, Ut(this));
        };
        function Ut(a) {
          var b, c, d, e, f, g, h, k, l, m;
          return G(function (p) {
            switch (p.g) {
              case 1:
                return yt(), b = a.g, c = a.h.drm, d = new Gs(), e = !1, ua(p), u(p, d.init(), 4);
              case 4:
                f = [], Ls(d, function (n) {
                  return f.push(n);
                }), g = t(f), h = g.next();
              case 5:
                if (h.done) {
                  p.B(2);
                  break;
                }
                k = h.value;
                return u(p, k.getAll(), 8);
              case 8:
                return l = p.h, u(p, kt(c, b, l), 9);
              case 9:
                return m = p.h, u(p, k.remove(m), 10);
              case 10:
                m.length != l.length && (e = !0);
                h = g.next();
                p.B(5);
                break;
              case 2:
                return ya(p), u(p, d.destroy(), 11);
              case 11:
                za(p, 3);
                break;
              case 3:
                return p.return(!e);
            }
          });
        }
        r.list = function () {
          return Nt(this, Vt());
        };
        function Vt() {
          var a, b, c;
          return G(function (d) {
            switch (d.g) {
              case 1:
                return yt(), a = [], b = new Gs(), ua(d), u(d, b.init(), 4);
              case 4:
                return c = Promise.resolve(), Js(b, function (e, f) {
                  c = c.then(function () {
                    var g;
                    return G(function (h) {
                      if (1 == h.g) return u(h, f.getAllManifests(), 2);
                      g = h.h;
                      g.forEach(function (k, l) {
                        k = pt(new Zs("manifest", e.za, e.la, l), k);
                        a.push(k);
                      });
                      A(h);
                    });
                  });
                }), u(d, c, 2);
              case 2:
                return ya(d), u(d, b.destroy(), 6);
              case 6:
                za(d, 3);
                break;
              case 3:
                return d.return(a);
            }
          });
        }
        function zt(a, b, c, d) {
          var e, f, g, h, k;
          return G(function (l) {
            if (1 == l.g) return e = null, f = a.g, g = {
              networkingEngine: f,
              modifyManifestRequest: function () {},
              modifySegmentRequest: function () {},
              filter: function () {
                return Promise.resolve();
              },
              makeTextStreamsForClosedCaptions: function () {},
              onTimelineRegionAdded: function () {},
              onEvent: function () {},
              onError: function (m) {
                e = m;
              },
              isLowLatencyMode: function () {
                return !1;
              },
              isAutoLowLatencyMode: function () {
                return !1;
              },
              enableLowLatencyMode: function () {},
              updateDuration: function () {},
              newDrmInfo: function () {}
            }, c.configure(d.manifest), At(a), u(l, c.start(b, g), 2);
            if (3 != l.g) return h = l.h, At(a), k = Wt(h), u(l, Promise.all(qf(k, function (m) {
              return m.createSegmentIndex();
            })), 3);
            At(a);
            if (e) throw e;
            return l.return(h);
          });
        }
        function Bt(a, b, c, d) {
          var e;
          return G(function (f) {
            switch (f.g) {
              case 1:
                return e = new eg({
                  lb: a.g,
                  onError: c,
                  dd: function () {},
                  onExpirationUpdated: function () {},
                  onEvent: function () {}
                }), e.configure(d.drm), u(f, jg(e, b.variants, d.offline.usePersistentLicense), 2);
              case 2:
                return u(f, xg(e), 3);
              case 3:
                return u(f, wg(e), 4);
              case 4:
                return f.return(e);
            }
          });
        }
        function Mt(a, b, c, d) {
          var e = new Map(),
            f = Wt(c),
            g = new Map();
          f = t(f);
          for (var h = f.next(); !h.done; h = f.next()) {
            h = h.value;
            var k = Xt(a, b, c, h, d, e);
            g.set(h.id, k);
          }
          a = t(c.variants);
          for (b = a.next(); !b.done; b = a.next()) b = b.value, b.audio && g.get(b.audio.id).variantIds.push(b.id), b.video && g.get(b.video.id).variantIds.push(b.id);
          return {
            streams: Array.from(g.values()),
            qe: Array.from(e.values())
          };
        }
        function Xt(a, b, c, d, e, f) {
          var g = {
              id: d.id,
              originalId: d.originalId,
              primary: d.primary,
              type: d.type,
              mimeType: d.mimeType,
              codecs: d.codecs,
              frameRate: d.frameRate,
              pixelAspectRatio: d.pixelAspectRatio,
              hdr: d.hdr,
              kind: d.kind,
              language: d.language,
              label: d.label,
              width: d.width || null,
              height: d.height || null,
              encrypted: d.encrypted,
              keyIds: d.keyIds,
              segments: [],
              variantIds: [],
              roles: d.roles,
              forced: d.forced,
              channelsCount: d.channelsCount,
              audioSamplingRate: d.audioSamplingRate,
              spatialAudio: d.spatialAudio,
              closedCaptions: d.closedCaptions,
              tilesLayout: d.tilesLayout,
              external: d.external
            },
            h = e.offline.numberOfParallelDownloads,
            k = 0;
          Yt(d, c.presentationTimeline.Oa(), function (l) {
            var m = ls(l),
              p = void 0;
            if (!f.has(m)) {
              var n = l.endTime - l.startTime;
              n = tt(b, d.id) * n;
              n = os(a.g, n);
              f.set(m, new ks(l, n, k, !1));
            }
            l.h && (p = ls(l.h), f.has(p) || (n = .5 * tt(b, d.id), n = os(a.g, n), f.set(p, new ks(l.h, n, k, !0))));
            g.segments.push({
              pendingInitSegmentRefId: p,
              initSegmentKey: p ? 0 : null,
              startTime: l.startTime,
              endTime: l.endTime,
              appendWindowStart: l.appendWindowStart,
              appendWindowEnd: l.appendWindowEnd,
              timestampOffset: l.timestampOffset,
              tilesLayout: l.tilesLayout,
              pendingSegmentRefId: m,
              dataKey: 0
            });
            k = (k + 1) % h;
          });
          return g;
        }
        function Yt(a, b, c) {
          b = a.segmentIndex.find(b);
          if (null != b) for (var d = a.segmentIndex.get(b); d;) c(d), d = a.segmentIndex.get(++b);
        }
        function At(a) {
          if (a.l.g) throw new O(2, 9, 7001);
        }
        function yt() {
          if (!vt()) throw new O(2, 9, 9E3);
        }
        function Nt(a, b) {
          return G(function (c) {
            if (1 == c.g) return a.i.push(b), ua(c), u(c, b, 4);
            if (2 != c.g) return c.return(c.h);
            ya(c);
            gb(a.i, b);
            return za(c, 0);
          });
        }
        function xt(a, b) {
          var c = b.promise;
          a.i.push(c);
          return b.finally(function () {
            gb(a.i, c);
          });
        }
        function Tt(a) {
          var b = new Set();
          a = t(a.streams);
          for (var c = a.next(); !c.done; c = a.next()) {
            c = t(c.value.segments);
            for (var d = c.next(); !d.done; d = c.next()) d = d.value, null != d.initSegmentKey && b.add(d.initSegmentKey), b.add(d.dataKey);
          }
          return Array.from(b);
        }
        function St(a, b, c, d) {
          var e, f, g;
          return G(function (h) {
            if (1 == h.g) {
              if (!d.drmInfo) return h.return();
              e = Ms(c);
              f = d.sessionIds.map(function (k) {
                return {
                  sessionId: k,
                  keySystem: d.drmInfo.keySystem,
                  licenseUri: d.drmInfo.licenseServerUri,
                  serverCertificate: d.drmInfo.serverCertificate,
                  audioCapabilities: Rt(d, !1),
                  videoCapabilities: Rt(d, !0)
                };
              });
              return u(h, kt(b, a, f), 2);
            }
            return 3 != h.g ? (g = h.h, u(h, e.remove(g), 3)) : u(h, e.add(f.filter(function (k) {
              return !g.includes(k.sessionId);
            })), 0);
          });
        }
        function Wt(a) {
          for (var b = new Set(), c = t(a.textStreams), d = c.next(); !d.done; d = c.next()) b.add(d.value);
          c = t(a.imageStreams);
          for (d = c.next(); !d.done; d = c.next()) b.add(d.value);
          a = t(a.variants);
          for (c = a.next(); !c.done; c = a.next()) c = c.value, c.audio && b.add(c.audio), c.video && b.add(c.video);
          return b;
        }
        function Kt(a) {
          a.variants.map(function (f) {
            return f.video;
          });
          var b = new Set(a.variants.map(function (f) {
            return f.audio;
          }));
          a = a.textStreams;
          for (var c = t(b), d = c.next(); !d.done; d = c.next()) {
            d = t(b);
            for (var e = d.next(); !e.done; e = d.next());
          }
          b = t(a);
          for (c = b.next(); !c.done; c = b.next()) for (c = t(a), d = c.next(); !d.done; d = c.next());
        }
        K("shaka.offline.Storage", ut);
        ut.deleteAll = function () {
          var a;
          return G(function (b) {
            return 1 == b.g ? (a = new Gs(), ua(b), u(b, Ns(a), 2)) : 5 != b.g ? (ya(b), u(b, a.destroy(), 5)) : za(b, 0);
          });
        };
        ut.prototype.list = ut.prototype.list;
        ut.prototype.removeEmeSessions = ut.prototype.rg;
        ut.prototype.remove = ut.prototype.remove;
        ut.prototype.store = ut.prototype.store;
        ut.prototype.getNetworkingEngine = ut.prototype.kc;
        ut.prototype.getConfiguration = ut.prototype.getConfiguration;
        ut.prototype.configure = ut.prototype.configure;
        ut.prototype.destroy = ut.prototype.destroy;
        ut.support = vt;
        var Lt = new Map().set("org.w3.clearkey", "1077efecc0b24d02ace33c1e52e2fb4b").set("com.widevine.alpha", "edef8ba979d64acea3c827dcd51d21ed").set("com.microsoft.playready", "9a04f07998404286ab92e65be0885f95").set("com.microsoft.playready.recommendation", "9a04f07998404286ab92e65be0885f95").set("com.microsoft.playready.software", "9a04f07998404286ab92e65be0885f95").set("com.microsoft.playready.hardware", "9a04f07998404286ab92e65be0885f95").set("com.adobe.primetime", "f239e769efa348509c16a903c6932efb");
        qn.offline = vt;
        function Zt() {}
        function $t(a, b) {
          a = {
            priority: b || 0,
            nf: a
          };
          for (b = 0; b < au.length; b++) if (au[b].priority < a.priority) {
            au.splice(b, 0, a);
            return;
          }
          au.push(a);
        }
        K("shaka.polyfill", Zt);
        Zt.register = $t;
        Zt.installAll = function () {
          for (var a = t(au), b = a.next(); !b.done; b = a.next()) {
            b = b.value;
            try {
              b.nf();
            } catch (c) {
              Xa("Error installing polyfill!", c);
            }
          }
        };
        var au = [];
        function bu() {
          this.g = new cu();
        }
        function du() {
          window.AbortController || (window.AbortController = bu, window.AbortSignal = cu);
        }
        bu.prototype.abort = function (a) {
          var b = this.g;
          if (!b.h) {
            b.h = !0;
            b.g = a;
            void 0 === b.g && (b.g = new DOMException("signal is aborted without reason", "AbortError"));
            a = new S("abort");
            if (b.onabort) b.onabort(a);
            b.dispatchEvent(a);
          }
        };
        ea.Object.defineProperties(bu.prototype, {
          signal: {
            configurable: !0,
            enumerable: !0,
            get: function () {
              return this.g;
            }
          }
        });
        Zt.AbortController = bu;
        bu.install = du;
        function cu() {
          Te.call(this);
          this.h = !1;
          this.g = void 0;
          this.onabort = null;
        }
        qa(cu, Te);
        ea.Object.defineProperties(cu.prototype, {
          aborted: {
            configurable: !0,
            enumerable: !0,
            get: function () {
              return this.h;
            }
          },
          reason: {
            configurable: !0,
            enumerable: !0,
            get: function () {
              return this.g;
            }
          }
        });
        $t(du);
        function eu() {}
        function fu() {
          if (!Object.getOwnPropertyDescriptor(Element.prototype, "ariaHidden")) for (var a = t(["ariaHidden", "ariaLabel", "ariaPressed", "ariaSelected"]), b = a.next(); !b.done; b = a.next()) gu(b.value);
        }
        function gu(a) {
          var b = "aria-" + a.toLowerCase().replace(/^aria/, "");
          Object.defineProperty(Element.prototype, a, {
            get: function () {
              return this.getAttribute(b);
            },
            set: function (c) {
              null == c || void 0 == c ? this.removeAttribute(b) : this.setAttribute(b, c);
            }
          });
        }
        Zt.Aria = eu;
        eu.install = fu;
        $t(fu);
        function hu() {}
        function iu() {
          ju();
        }
        Zt.EncryptionScheme = hu;
        hu.install = iu;
        $t(iu, -2);
        function ku() {}
        function lu() {
          if (window.Document) {
            var a = Element.prototype;
            a.requestFullscreen = a.requestFullscreen || a.mozRequestFullScreen || a.msRequestFullscreen || a.webkitRequestFullscreen;
            a = Document.prototype;
            a.exitFullscreen = a.exitFullscreen || a.mozCancelFullScreen || a.msExitFullscreen || a.webkitCancelFullScreen;
            "fullscreenElement" in document || (Object.defineProperty(document, "fullscreenElement", {
              get: function () {
                return document.mozFullScreenElement || document.msFullscreenElement || document.webkitCurrentFullScreenElement || document.webkitFullscreenElement;
              }
            }), Object.defineProperty(document, "fullscreenEnabled", {
              get: function () {
                return document.mozFullScreenEnabled || document.msFullscreenEnabled || document.webkitFullscreenEnabled;
              }
            }));
            document.addEventListener("webkitfullscreenchange", mu);
            document.addEventListener("webkitfullscreenerror", mu);
            document.addEventListener("mozfullscreenchange", mu);
            document.addEventListener("mozfullscreenerror", mu);
            document.addEventListener("MSFullscreenChange", mu);
            document.addEventListener("MSFullscreenError", mu);
          }
        }
        function mu(a) {
          var b = a.type.replace(/^(webkit|moz|MS)/, "").toLowerCase(),
            c = document.createEvent("Event");
          c.initEvent(b, a.bubbles, a.cancelable);
          a.target.dispatchEvent(c);
        }
        Zt.Fullscreen = ku;
        ku.install = lu;
        $t(lu);
        function nu() {}
        function ou() {
          var a = !0;
          if (vc() || sc("PlayStation 5") || wc() || sc("Web0S") || tc() || sc("CrKey") || sc("PC=EOS") || sc("Hisense") || sc("VIDAA")) a = !1;
          a && navigator.mediaCapabilities || (navigator.mediaCapabilities || (navigator.mediaCapabilities = {}), pu = navigator.mediaCapabilities, navigator.mediaCapabilities.decodingInfo = qu);
        }
        function qu(a) {
          var b, c, d, e, f, g, h, k, l, m, p, n, q, v, y, w, x, D;
          return G(function (z) {
            switch (z.g) {
              case 1:
                b = {
                  supported: !1,
                  powerEfficient: !0,
                  smooth: !0,
                  keySystemAccess: null,
                  configuration: a
                };
                if (!a) return z.return(b);
                c = a.video;
                d = a.audio;
                if ("media-source" == a.type) {
                  if (!nc()) return z.return(b);
                  if (c) {
                    if (sc("CrKey")) {
                      if (window.cast && cast.__platform__ && cast.__platform__.canDisplayType) {
                        var B = c.contentType;
                        c.width && c.height && (B += "; width=" + c.width + "; height=" + c.height);
                        c.framerate && (B += "; framerate=" + c.framerate);
                        "pq" === c.transferFunction && (B += "; eotf=smpte2084");
                        e = cast.__platform__.canDisplayType(B);
                      } else e = db(c.contentType);
                    } else tc() ? (f = c.contentType, c.width && c.height && (f += "; width=" + c.width, f += "; height=" + c.height), c.framerate && (f += "; framerate=" + c.framerate), c.bitrate && (f += "; bitrate=" + c.bitrate), e = db(f)) : e = db(c.contentType);
                    if (!e) return z.return(b);
                  }
                  if (d && (g = d.contentType, h = db(g), !h)) return z.return(b);
                } else if ("file" == a.type) {
                  if (c && (k = c.contentType, l = oc(k), !l) || d && (m = d.contentType, p = oc(m), !p)) return z.return(b);
                } else return z.return(b);
                if (!a.keySystemConfiguration) return b.supported = !0, z.return(Promise.resolve(b));
                n = a.keySystemConfiguration;
                q = [];
                v = [];
                n.audio && (y = {
                  robustness: n.audio.robustness || "",
                  contentType: a.audio.contentType
                }, q.push(y));
                n.video && (w = {
                  robustness: n.video.robustness || "",
                  contentType: a.video.contentType
                }, v.push(w));
                x = {
                  initDataTypes: [n.initDataType],
                  distinctiveIdentifier: n.distinctiveIdentifier,
                  persistentState: n.persistentState,
                  sessionTypes: n.sessionTypes
                };
                q.length && (x.audioCapabilities = q);
                v.length && (x.videoCapabilities = v);
                C(z, 3);
                return u(z, navigator.requestMediaKeySystemAccess(n.keySystem, [x]), 5);
              case 5:
                D = z.h;
                va(z, 4);
                break;
              case 3:
                wa(z);
              case 4:
                D && (b.supported = !0, b.keySystemAccess = D);
              case 2:
                return z.return(b);
            }
          });
        }
        Zt.MediaCapabilities = nu;
        nu.install = ou;
        var pu = null;
        nu.originalMcap = pu;
        $t(ou, -1);
        function ru() {}
        function su() {
          var a = xc();
          window.MediaSource && (window.cast && cast.__platform__ && cast.__platform__.canDisplayType ? tu() : a ? 12 >= a ? (uu(), vu()) : 15 >= a && uu() : qc() ? wu() : (sc("Tizen 2") || sc("Tizen 3") || sc("Tizen 4")) && xu());
          window.MediaSource && MediaSource.isTypeSupported('video/webm; codecs="vp9"') && !MediaSource.isTypeSupported('video/webm; codecs="vp09.00.10.08"') && yu();
        }
        function uu() {
          var a = MediaSource.prototype.addSourceBuffer;
          MediaSource.prototype.addSourceBuffer = function () {
            var b = a.apply(this, Ia.apply(0, arguments));
            b.abort = function () {};
            return b;
          };
        }
        function vu() {
          var a = SourceBuffer.prototype.remove;
          SourceBuffer.prototype.remove = function (b, c) {
            return a.call(this, b, c - .001);
          };
        }
        function wu() {
          var a = MediaSource.isTypeSupported;
          MediaSource.isTypeSupported = function (b) {
            return "mp2t" != b.split(";")[0].split("/")[1] && a(b);
          };
        }
        function xu() {
          var a = MediaSource.isTypeSupported;
          MediaSource.isTypeSupported = function (b) {
            return "opus" != ad(b)[0] && a(b);
          };
        }
        function tu() {
          var a = MediaSource.isTypeSupported;
          MediaSource.isTypeSupported = function (b) {
            var c = b.split(/ *; */);
            c.shift();
            return c.some(function (d) {
              return d.startsWith("codecs=");
            }) ? cast.__platform__.canDisplayType(b) : a(b);
          };
        }
        function yu() {
          var a = MediaSource.isTypeSupported;
          sc("Web0S") || (MediaSource.isTypeSupported = function (b) {
            var c = b.split(/ *; */),
              d = c.findIndex(function (g) {
                return g.startsWith("codecs=");
              });
            if (0 > d) return a(b);
            var e = c[d].replace("codecs=", "").replace(/"/g, "").split(/\s*,\s*/),
              f = e.findIndex(function (g) {
                return g.startsWith("vp09");
              });
            0 <= f && (e[f] = "vp9", c[d] = 'codecs="' + e.join(",") + '"', b = c.join("; "));
            return a(b);
          });
        }
        Zt.MediaSource = ru;
        ru.install = su;
        $t(su);
        function zu() {}
        function Au() {
          screen.orientation && screen.orientation.unlock || (void 0 != screen.orientation ? Bu() : void 0 != window.orientation && Cu());
        }
        function Bu() {
          void 0 === screen.orientation.lock && (screen.orientation.lock = function () {
            return Promise.resolve();
          });
          void 0 === screen.orientation.unlock && (screen.orientation.unlock = function () {});
        }
        function Cu() {
          function a() {
            switch (window.orientation) {
              case -90:
                b.type = "landscape-secondary";
                b.angle = 270;
                break;
              case 0:
                b.type = "portrait-primary";
                b.angle = 0;
                break;
              case 90:
                b.type = "landscape-primary";
                b.angle = 90;
                break;
              case 180:
                b.type = "portrait-secondary", b.angle = 180;
            }
          }
          var b = new Du();
          screen.orientation = b;
          a();
          window.addEventListener("orientationchange", function () {
            a();
            var c = new S("change");
            b.dispatchEvent(c);
          });
        }
        Zt.Orientation = zu;
        zu.install = Au;
        function Du() {
          Te.call(this);
          this.type = "";
          this.angle = 0;
        }
        qa(Du, Te);
        Du.prototype.lock = function (a) {
          function b(d) {
            return screen.lockOrientation ? screen.lockOrientation(d) : screen.mozLockOrientation ? screen.mozLockOrientation(d) : screen.msLockOrientation ? screen.msLockOrientation(d) : !1;
          }
          var c = !1;
          switch (a) {
            case "natural":
              c = b("default");
              break;
            case "any":
              c = !0;
              this.unlock();
              break;
            default:
              c = b(a);
          }
          if (c) return Promise.resolve();
          a = Error("screen.orientation.lock() is not available on this device");
          a.name = "NotSupportedError";
          a.code = DOMException.NOT_SUPPORTED_ERR;
          return Promise.reject(a);
        };
        Du.prototype.unlock = function () {
          screen.unlockOrientation ? screen.unlockOrientation() : screen.mozUnlockOrientation ? screen.mozUnlockOrientation() : screen.msUnlockOrientation && screen.msUnlockOrientation();
        };
        $t(Au);
        function Eu() {}
        var Fu, Gu, Hu, Iu, Ju, Ku;
        function Lu(a, b) {
          try {
            var c = new Mu(a, b);
            return Promise.resolve(c);
          } catch (d) {
            return Promise.reject(d);
          }
        }
        function Nu(a) {
          var b = this.mediaKeys;
          b && b != a && Ou(b, null);
          delete this.mediaKeys;
          return (this.mediaKeys = a) ? Ou(a, this) : Promise.resolve();
        }
        function Pu(a) {
          a = L(a.initData);
          if (Jb(a).getUint32(0, !0) + 4 != a.byteLength) throw new RangeError("Malformed FairPlay init data");
          a = Cc(a.subarray(4), !0);
          a = Fc(a);
          var b = new Event("encrypted");
          b.initDataType = "skd";
          b.initData = Hb(a);
          this.dispatchEvent(b);
        }
        Zt.PatchedMediaKeysApple = Eu;
        Eu.uninstall = function () {
          Fu && (Fu = !1, Object.defineProperty(HTMLMediaElement.prototype, "mediaKeys", Gu), HTMLMediaElement.prototype.setMediaKeys = Hu, window.MediaKeys = Iu, window.MediaKeySystemAccess = Ju, navigator.requestMediaKeySystemAccess = Ku, Gu = Ku = Hu = Ju = Iu = null, window.shakaMediaKeysPolyfill = !1);
        };
        Eu.install = function (a) {
          if (window.HTMLVideoElement && window.WebKitMediaKeys) {
            if (void 0 === a ? 0 : a) Fu = !0, Gu = Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype, "mediaKeys"), Hu = HTMLMediaElement.prototype.setMediaKeys, Iu = window.MediaKeys, Ju = window.MediaKeySystemAccess, Ku = navigator.requestMediaKeySystemAccess;
            delete HTMLMediaElement.prototype.mediaKeys;
            HTMLMediaElement.prototype.mediaKeys = null;
            HTMLMediaElement.prototype.setMediaKeys = Nu;
            window.MediaKeys = Qu;
            window.MediaKeySystemAccess = Mu;
            navigator.requestMediaKeySystemAccess = Lu;
            window.shakaMediaKeysPolyfill = !0;
          }
        };
        function Mu(a, b) {
          this.keySystem = a;
          if (a.startsWith("com.apple.fps")) for (a = t(b), b = a.next(); !b.done; b = a.next()) {
            var c = b.value;
            if ("required" == c.persistentState) b = null;else {
              b = {
                audioCapabilities: [],
                videoCapabilities: [],
                persistentState: "optional",
                distinctiveIdentifier: "optional",
                initDataTypes: c.initDataTypes,
                sessionTypes: ["temporary"],
                label: c.label
              };
              var d = !1,
                e = !1;
              if (c.audioCapabilities) for (var f = t(c.audioCapabilities), g = f.next(); !g.done; g = f.next()) g = g.value, g.contentType && (d = !0, WebKitMediaKeys.isTypeSupported(this.keySystem, g.contentType.split(";")[0]) && (b.audioCapabilities.push(g), e = !0));
              if (c.videoCapabilities) for (c = t(c.videoCapabilities), g = c.next(); !g.done; g = c.next()) f = g.value, f.contentType && (d = !0, WebKitMediaKeys.isTypeSupported(this.keySystem, f.contentType.split(";")[0]) && (b.videoCapabilities.push(f), e = !0));
              d || (e = WebKitMediaKeys.isTypeSupported(this.keySystem, "video/mp4"));
              b = e ? b : null;
            }
            if (b) {
              this.g = b;
              return;
            }
          }
          a = Error("Unsupported keySystem");
          a.name = "NotSupportedError";
          a.code = DOMException.NOT_SUPPORTED_ERR;
          throw a;
        }
        Mu.prototype.createMediaKeys = function () {
          var a = new Qu(this.keySystem);
          return Promise.resolve(a);
        };
        Mu.prototype.getConfiguration = function () {
          return this.g;
        };
        function Qu(a) {
          this.h = new WebKitMediaKeys(a);
          this.g = new lf();
        }
        Qu.prototype.createSession = function (a) {
          a = a || "temporary";
          if ("temporary" != a) throw new TypeError("Session type " + a + " is unsupported on this platform.");
          return new Ru(this.h);
        };
        Qu.prototype.setServerCertificate = function () {
          return Promise.resolve(!1);
        };
        function Ou(a, b) {
          a.g.ob();
          if (!b) return Promise.resolve();
          a.g.C(b, "webkitneedkey", Pu);
          try {
            return tj(b, HTMLMediaElement.HAVE_METADATA, a.g, function () {
              b.webkitSetMediaKeys(a.h);
            }), Promise.resolve();
          } catch (c) {
            return Promise.reject(c);
          }
        }
        function Ru(a) {
          Te.call(this);
          this.i = null;
          this.l = a;
          this.g = this.h = null;
          this.j = new lf();
          this.sessionId = "";
          this.expiration = NaN;
          this.closed = new kc();
          this.keyStatuses = new Su();
        }
        qa(Ru, Te);
        r = Ru.prototype;
        r.generateRequest = function (a, b) {
          var c = this;
          this.h = new kc();
          try {
            var d = this.l.createSession("video/mp4", L(b));
            this.i = d;
            this.sessionId = d.sessionId || "";
            this.j.C(this.i, "webkitkeymessage", function (e) {
              c.h && (c.h.resolve(), c.h = null);
              e = new Map().set("messageType", void 0 == c.keyStatuses.Fb() ? "license-request" : "license-renewal").set("message", Hb(e.message));
              e = new S("message", e);
              c.dispatchEvent(e);
            });
            this.j.C(d, "webkitkeyadded", function () {
              c.g && (Tu(c, "usable"), c.g.resolve(), c.g = null);
            });
            this.j.C(d, "webkitkeyerror", function () {
              var e = Error("EME PatchedMediaKeysApple key error");
              e.errorCode = c.i.error;
              if (null != c.h) c.h.reject(e), c.h = null;else if (null != c.g) c.g.reject(e), c.g = null;else switch (c.i.error.code) {
                case WebKitMediaKeyError.MEDIA_KEYERR_OUTPUT:
                case WebKitMediaKeyError.MEDIA_KEYERR_HARDWARECHANGE:
                  Tu(c, "output-not-allowed");
                  break;
                default:
                  Tu(c, "internal-error");
              }
            });
            Tu(this, "status-pending");
          } catch (e) {
            this.h.reject(e);
          }
          return this.h;
        };
        r.load = function () {
          return Promise.reject(Error("MediaKeySession.load not yet supported"));
        };
        r.update = function (a) {
          this.g = new kc();
          try {
            this.i.update(L(a));
          } catch (b) {
            this.g.reject(b);
          }
          return this.g;
        };
        r.close = function () {
          try {
            this.i.close(), this.closed.resolve(), this.j.ob();
          } catch (a) {
            this.closed.reject(a);
          }
          return this.closed;
        };
        r.remove = function () {
          return Promise.reject(Error("MediaKeySession.remove is only applicable for persistent licenses, which are not supported on this platform"));
        };
        function Tu(a, b) {
          var c = a.keyStatuses;
          c.size = void 0 == b ? 0 : 1;
          c.g = b;
          b = new S("keystatuseschange");
          a.dispatchEvent(b);
        }
        function Su() {
          this.size = 0;
          this.g = void 0;
        }
        r = Su.prototype;
        r.Fb = function () {
          return this.g;
        };
        r.forEach = function (a) {
          this.g && a(this.g, Pg.value());
        };
        r.get = function (a) {
          if (this.has(a)) return this.g;
        };
        r.has = function (a) {
          var b = Pg.value();
          return this.g && Fb(a, b) ? !0 : !1;
        };
        r.entries = function () {};
        r.keys = function () {};
        r.values = function () {};
        function Uu() {}
        function Vu() {
          !window.HTMLVideoElement || navigator.requestMediaKeySystemAccess && MediaKeySystemAccess.prototype.getConfiguration || (navigator.requestMediaKeySystemAccess = Wu, delete HTMLMediaElement.prototype.mediaKeys, HTMLMediaElement.prototype.mediaKeys = null, HTMLMediaElement.prototype.setMediaKeys = Xu, window.MediaKeys = Yu, window.MediaKeySystemAccess = Zu, window.shakaMediaKeysPolyfill = !0);
        }
        function Wu() {
          return Promise.reject(Error("The key system specified is not supported."));
        }
        function Xu(a) {
          return null == a ? Promise.resolve() : Promise.reject(Error("MediaKeys not supported."));
        }
        Zt.PatchedMediaKeysNop = Uu;
        Uu.install = Vu;
        function Yu() {
          throw new TypeError("Illegal constructor.");
        }
        Yu.prototype.createSession = function () {};
        Yu.prototype.setServerCertificate = function () {};
        function Zu() {
          this.keySystem = "";
          throw new TypeError("Illegal constructor.");
        }
        Zu.prototype.getConfiguration = function () {};
        Zu.prototype.createMediaKeys = function () {};
        $t(Vu, -10);
        function $u() {}
        function av() {
          if (!(!window.HTMLVideoElement || navigator.requestMediaKeySystemAccess && MediaKeySystemAccess.prototype.getConfiguration)) {
            if (HTMLMediaElement.prototype.webkitGenerateKeyRequest) bv = "webkit";else if (!HTMLMediaElement.prototype.generateKeyRequest) return;
            navigator.requestMediaKeySystemAccess = cv;
            delete HTMLMediaElement.prototype.mediaKeys;
            HTMLMediaElement.prototype.mediaKeys = null;
            HTMLMediaElement.prototype.setMediaKeys = dv;
            window.MediaKeys = ev;
            window.MediaKeySystemAccess = fv;
            window.shakaMediaKeysPolyfill = !0;
          }
        }
        function gv(a) {
          var b = bv;
          return b ? b + a.charAt(0).toUpperCase() + a.slice(1) : a;
        }
        function cv(a, b) {
          try {
            var c = new fv(a, b);
            return Promise.resolve(c);
          } catch (d) {
            return Promise.reject(d);
          }
        }
        function dv(a) {
          var b = this.mediaKeys;
          b && b != a && hv(b, null);
          delete this.mediaKeys;
          (this.mediaKeys = a) && hv(a, this);
          return Promise.resolve();
        }
        Zt.PatchedMediaKeysWebkit = $u;
        $u.install = av;
        function fv(a, b) {
          this.g = this.keySystem = a;
          var c = !1;
          "org.w3.clearkey" == a && (this.g = "webkit-org.w3.clearkey", c = !1);
          var d = !1;
          var e = document.getElementsByTagName("video");
          e = e.length ? e[0] : document.createElement("video");
          b = t(b);
          for (var f = b.next(); !f.done; f = b.next()) {
            f = f.value;
            var g = {
                audioCapabilities: [],
                videoCapabilities: [],
                persistentState: "optional",
                distinctiveIdentifier: "optional",
                initDataTypes: f.initDataTypes,
                sessionTypes: ["temporary"],
                label: f.label
              },
              h = !1;
            if (f.audioCapabilities) for (var k = t(f.audioCapabilities), l = k.next(); !l.done; l = k.next()) l = l.value, l.contentType && (h = !0, e.canPlayType(l.contentType.split(";")[0], this.g) && (g.audioCapabilities.push(l), d = !0));
            if (f.videoCapabilities) for (k = t(f.videoCapabilities), l = k.next(); !l.done; l = k.next()) l = l.value, l.contentType && (h = !0, e.canPlayType(l.contentType, this.g) && (g.videoCapabilities.push(l), d = !0));
            h || (d = e.canPlayType("video/mp4", this.g) || e.canPlayType("video/webm", this.g));
            "required" == f.persistentState && (c ? (g.persistentState = "required", g.sessionTypes = ["persistent-license"]) : d = !1);
            if (d) {
              this.h = g;
              return;
            }
          }
          c = "Unsupported keySystem";
          if ("org.w3.clearkey" == a || "com.widevine.alpha" == a) c = "None of the requested configurations were supported.";
          a = Error(c);
          a.name = "NotSupportedError";
          a.code = DOMException.NOT_SUPPORTED_ERR;
          throw a;
        }
        fv.prototype.createMediaKeys = function () {
          var a = new ev(this.g);
          return Promise.resolve(a);
        };
        fv.prototype.getConfiguration = function () {
          return this.h;
        };
        function ev(a) {
          this.l = a;
          this.h = null;
          this.g = new lf();
          this.i = [];
          this.j = new Map();
        }
        function hv(a, b) {
          a.h = b;
          a.g.ob();
          var c = bv;
          b && (a.g.C(b, c + "needkey", function (d) {
            var e = new CustomEvent("encrypted");
            e.initDataType = "cenc";
            e.initData = Hb(d.initData);
            a.h.dispatchEvent(e);
          }), a.g.C(b, c + "keymessage", function (d) {
            var e = iv(a, d.sessionId);
            e && (d = new Map().set("messageType", void 0 == e.keyStatuses.Fb() ? "licenserequest" : "licenserenewal").set("message", d.message), d = new S("message", d), e.h && (e.h.resolve(), e.h = null), e.dispatchEvent(d));
          }), a.g.C(b, c + "keyadded", function (d) {
            if (d = iv(a, d.sessionId)) jv(d, "usable"), d.g && d.g.resolve(), d.g = null;
          }), a.g.C(b, c + "keyerror", function (d) {
            var e = iv(a, d.sessionId);
            e && e.handleError(d);
          }));
        }
        ev.prototype.createSession = function (a) {
          a = a || "temporary";
          if ("temporary" != a && "persistent-license" != a) throw new TypeError("Session type " + a + " is unsupported on this platform.");
          var b = this.h || document.createElement("video");
          b.src || (b.src = "about:blank");
          a = new kv(b, this.l, a);
          this.i.push(a);
          return a;
        };
        ev.prototype.setServerCertificate = function () {
          return Promise.resolve(!1);
        };
        function iv(a, b) {
          var c = a.j.get(b);
          return c ? c : (c = a.i.shift()) ? (c.sessionId = b, a.j.set(b, c), c) : null;
        }
        function kv(a, b, c) {
          Te.call(this);
          this.j = a;
          this.m = !1;
          this.g = this.h = null;
          this.i = b;
          this.l = c;
          this.sessionId = "";
          this.expiration = NaN;
          this.closed = new kc();
          this.keyStatuses = new lv();
        }
        qa(kv, Te);
        r = kv.prototype;
        r.handleError = function (a) {
          var b = Error("EME v0.1b key error"),
            c = a.errorCode;
          c.systemCode = a.systemCode;
          b.errorCode = c;
          !a.sessionId && this.h ? (45 == a.systemCode && (b.message = "Unsupported session type."), this.h.reject(b), this.h = null) : a.sessionId && this.g ? (this.g.reject(b), this.g = null) : (b = a.systemCode, a.errorCode.code == MediaKeyError.MEDIA_KEYERR_OUTPUT ? jv(this, "output-restricted") : 1 == b ? jv(this, "expired") : jv(this, "internal-error"));
        };
        function mv(a, b, c) {
          if (a.m) return Promise.reject(Error("The session is already initialized."));
          a.m = !0;
          try {
            if ("persistent-license" == a.l) {
              if (c) var d = L(Fc("LOAD_SESSION|" + c));else {
                var e = Fc("PERSISTENT|");
                d = Nc(e, b);
              }
            } else d = L(b);
          } catch (g) {
            return Promise.reject(g);
          }
          a.h = new kc();
          var f = gv("generateKeyRequest");
          try {
            a.j[f](a.i, d);
          } catch (g) {
            if ("InvalidStateError" != g.name) return a.h = null, Promise.reject(g);
            new P(function () {
              try {
                a.j[f](a.i, d);
              } catch (h) {
                a.h.reject(h), a.h = null;
              }
            }).O(.01);
          }
          return a.h;
        }
        function nv(a, b, c) {
          if (a.g) a.g.then(function () {
            return nv(a, b, c);
          }).catch(function () {
            return nv(a, b, c);
          });else {
            a.g = b;
            if ("webkit-org.w3.clearkey" == a.i) {
              var d = Bc(c);
              var e = JSON.parse(d);
              "oct" != e.keys[0].kty && (a.g.reject(Error("Response is not a valid JSON Web Key Set.")), a.g = null);
              d = Kc(e.keys[0].k);
              e = Kc(e.keys[0].kid);
            } else d = L(c), e = null;
            var f = gv("addKey");
            try {
              a.j[f](a.i, d, e, a.sessionId);
            } catch (g) {
              a.g.reject(g), a.g = null;
            }
          }
        }
        function jv(a, b) {
          var c = a.keyStatuses;
          c.size = void 0 == b ? 0 : 1;
          c.g = b;
          b = new S("keystatuseschange");
          a.dispatchEvent(b);
        }
        r.generateRequest = function (a, b) {
          return mv(this, b, null);
        };
        r.load = function (a) {
          return "persistent-license" == this.l ? mv(this, null, a) : Promise.reject(Error("Not a persistent session."));
        };
        r.update = function (a) {
          var b = new kc();
          nv(this, b, a);
          return b;
        };
        r.close = function () {
          if ("persistent-license" != this.l) {
            if (!this.sessionId) return this.closed.reject(Error("The session is not callable.")), this.closed;
            var a = gv("cancelKeyRequest");
            try {
              this.j[a](this.i, this.sessionId);
            } catch (b) {}
          }
          this.closed.resolve();
          return this.closed;
        };
        r.remove = function () {
          return "persistent-license" != this.l ? Promise.reject(Error("Not a persistent session.")) : this.close();
        };
        function lv() {
          this.size = 0;
          this.g = void 0;
        }
        r = lv.prototype;
        r.Fb = function () {
          return this.g;
        };
        r.forEach = function (a) {
          this.g && a(this.g, Pg.value());
        };
        r.get = function (a) {
          if (this.has(a)) return this.g;
        };
        r.has = function (a) {
          var b = Pg.value();
          return this.g && Fb(a, b) ? !0 : !1;
        };
        r.entries = function () {};
        r.keys = function () {};
        r.values = function () {};
        var bv = "";
        $t(av);
        function ov() {}
        function pv() {
          if (window.HTMLVideoElement) {
            var a = HTMLVideoElement.prototype;
            a.requestPictureInPicture && document.exitPictureInPicture || !a.webkitSupportsPresentationMode || (document.pictureInPictureEnabled = !0, document.pictureInPictureElement = null, a.requestPictureInPicture = qv, Object.defineProperty(a, "disablePictureInPicture", {
              get: rv,
              set: sv,
              enumerable: !0,
              configurable: !0
            }), document.exitPictureInPicture = tv, document.addEventListener("webkitpresentationmodechanged", uv, !0));
          }
        }
        function uv(a) {
          a = a.target;
          if ("picture-in-picture" == a.webkitPresentationMode) {
            document.pictureInPictureElement = a;
            var b = new Event("enterpictureinpicture");
            a.dispatchEvent(b);
          } else document.pictureInPictureElement == a && (document.pictureInPictureElement = null), b = new Event("leavepictureinpicture"), a.dispatchEvent(b);
        }
        function qv() {
          return this.webkitSupportsPresentationMode("picture-in-picture") ? (this.webkitSetPresentationMode("picture-in-picture"), document.pictureInPictureElement = this, Promise.resolve()) : Promise.reject(Error("PiP not allowed by video element"));
        }
        function tv() {
          var a = document.pictureInPictureElement;
          return a ? (a.webkitSetPresentationMode("inline"), document.pictureInPictureElement = null, Promise.resolve()) : Promise.reject(Error("No picture in picture element found"));
        }
        function rv() {
          return this.hasAttribute("disablePictureInPicture") ? !0 : !this.webkitSupportsPresentationMode("picture-in-picture");
        }
        function sv(a) {
          a ? this.setAttribute("disablePictureInPicture", "") : this.removeAttribute("disablePictureInPicture");
        }
        Zt.PiPWebkit = ov;
        ov.install = pv;
        $t(pv);
        function vv() {}
        function wv() {
          window.crypto && ("randomUUID" in window.crypto || (window.crypto.randomUUID = xv));
        }
        function xv() {
          var a = URL.createObjectURL(new Blob()),
            b = a.toString();
          URL.revokeObjectURL(a);
          return b.substr(b.lastIndexOf("/") + 1);
        }
        Zt.RandomUUID = vv;
        vv.install = wv;
        $t(wv);
        function yv() {}
        function zv() {
          navigator.storage && navigator.storage.estimate || !navigator.webkitTemporaryStorage || !navigator.webkitTemporaryStorage.queryUsageAndQuota || ("storage" in navigator || (navigator.storage = {}), navigator.storage.estimate = Av);
        }
        function Av() {
          return new Promise(function (a, b) {
            navigator.webkitTemporaryStorage.queryUsageAndQuota(function (c, d) {
              a({
                usage: c,
                quota: d
              });
            }, b);
          });
        }
        Zt.StorageEstimate = yv;
        yv.install = zv;
        $t(zv);
        function Bv() {}
        function Cv() {
          var a = Symbol.prototype;
          "description" in a || Object.defineProperty(a, "description", {
            get: Dv
          });
        }
        function Dv() {
          var a = /\((.*)\)/.exec(this.toString());
          return a ? a[1] : void 0;
        }
        Zt.Symbol = Bv;
        Bv.install = Cv;
        $t(Cv);
        function Ev() {}
        function Fv() {
          if (window.HTMLMediaElement) {
            var a = HTMLMediaElement.prototype.play;
            HTMLMediaElement.prototype.play = function () {
              var b = a.apply(this);
              b && b.catch(function () {});
              return b;
            };
          }
        }
        Zt.VideoPlayPromise = Ev;
        Ev.install = Fv;
        $t(Fv);
        function Gv() {}
        function Hv() {
          if (window.HTMLVideoElement) {
            var a = HTMLVideoElement.prototype;
            !a.getVideoPlaybackQuality && ("webkitDroppedFrameCount" in a || uc()) && (a.getVideoPlaybackQuality = Iv);
          }
        }
        function Iv() {
          return {
            droppedVideoFrames: this.webkitDroppedFrameCount,
            totalVideoFrames: this.webkitDecodedFrameCount,
            corruptedVideoFrames: 0,
            creationTime: NaN,
            totalFrameDelay: 0
          };
        }
        Zt.VideoPlaybackQuality = Gv;
        Gv.install = Hv;
        $t(Hv);
        function Jv() {}
        function Kv() {
          if (!window.VTTCue && window.TextTrackCue) {
            var a = null,
              b = TextTrackCue.length;
            if (3 == b) a = Lv;else if (6 == b) a = Mv;else {
              try {
                var c = !!Lv(1, 2, "");
              } catch (d) {
                c = !1;
              }
              c && (a = Lv);
            }
            a && (window.VTTCue = function (d, e, f) {
              return a(d, e, f);
            });
          }
        }
        function Lv(a, b, c) {
          return new window.TextTrackCue(a, b, c);
        }
        function Mv(a, b, c) {
          return new window.TextTrackCue(a + "-" + b + "-" + c, a, b, c);
        }
        Zt.VTTCue = Jv;
        Jv.install = Kv;
        $t(Kv);
        function Nv() {}
        Nv.prototype.parseInit = function () {};
        Nv.prototype.setSequenceMode = function () {};
        Nv.prototype.parseMedia = function (a, b) {
          var c = null,
            d = [];
          a = Bc(a).split(/\r?\n/);
          a = t(a);
          for (var e = a.next(); !e.done; e = a.next()) if ((e = e.value) && !/^\s+$/.test(e) && (e = Ov.exec(e))) {
            var f = Pv.exec(e[1]);
            f = 60 * parseInt(f[1], 10) + parseFloat(f[2].replace(",", "."));
            e = new jb(f, b.segmentEnd ? b.segmentEnd : f + 2, e[2]);
            c && (c.endTime = f, d.push(c));
            c = e;
          }
          c && d.push(c);
          return d;
        };
        K("shaka.text.LrcTextParser", Nv);
        Nv.prototype.parseMedia = Nv.prototype.parseMedia;
        Nv.prototype.setSequenceMode = Nv.prototype.setSequenceMode;
        Nv.prototype.parseInit = Nv.prototype.parseInit;
        var Ov = /^\[(\d{1,2}:\d{1,2}(?:[.,]\d{1,3})?)\](.*)/,
          Pv = /^(\d+):(\d{1,2}(?:[.,]\d{1,3})?)$/;
        ed["application/x-subtitle-lrc"] = function () {
          return new Nv();
        };
        function Qv() {}
        Qv.prototype.parseInit = function () {};
        Qv.prototype.setSequenceMode = function () {};
        Qv.prototype.parseMedia = function (a, b) {
          var c = Bc(a);
          a = [];
          if ("" == c) return a;
          var d = bg(c, "tt");
          if (!d) throw new O(2, 2, 2005, "Failed to parse TTML.");
          c = d.getElementsByTagName("body")[0];
          if (!c) return [];
          var e = Qf(d, Rv, "frameRate"),
            f = Qf(d, Rv, "subFrameRate"),
            g = Qf(d, Rv, "frameRateMultiplier"),
            h = Qf(d, Rv, "tickRate"),
            k = Qf(d, Rv, "cellResolution"),
            l = d.getAttribute("xml:space") || "default",
            m = Qf(d, Sv, "extent");
          if ("default" != l && "preserve" != l) throw new O(2, 2, 2005, "Invalid xml:space value: " + l);
          l = "default" == l;
          e = new Tv(e, f, g, h);
          k = k ? (k = /^(\d+) (\d+)$/.exec(k)) ? {
            columns: parseInt(k[1], 10),
            rows: parseInt(k[2], 10)
          } : null : null;
          f = (f = d.getElementsByTagName("metadata")[0]) ? Of(f) : [];
          g = Array.from(d.getElementsByTagName("style"));
          d = Array.from(d.getElementsByTagName("region"));
          h = [];
          for (var p = t(d), n = p.next(); !n.done; n = p.next()) {
            var q = n.value;
            n = new lb();
            var v = q.getAttribute("xml:id");
            if (v) {
              n.id = v;
              var y = null;
              m && (y = Uv.exec(m) || Vv.exec(m));
              v = y ? Number(y[1]) : null;
              y = y ? Number(y[2]) : null;
              var w, x;
              if (w = Wv(q, g, "extent")) w = (x = Uv.exec(w)) || Vv.exec(w), null != w && (n.width = Number(w[1]), n.height = Number(w[2]), x || (null != v && (n.width = 100 * n.width / v), null != y && (n.height = 100 * n.height / y)), n.widthUnits = x || null != v ? Cb : 0, n.heightUnits = x || null != y ? Cb : 0);
              if (q = Wv(q, g, "origin")) w = (x = Uv.exec(q)) || Vv.exec(q), null != w && (n.viewportAnchorX = Number(w[1]), n.viewportAnchorY = Number(w[2]), x || (null != y && (n.viewportAnchorY = 100 * n.viewportAnchorY / y), null != v && (n.viewportAnchorX = 100 * n.viewportAnchorX / v)), n.viewportAnchorUnits = x || null != v ? Cb : 0);
            } else n = null;
            n && h.push(n);
          }
          if (Lf(c, "p").length) throw new O(2, 2, 2001, "<p> can only be inside <div> in TTML");
          m = t(Lf(c, "div"));
          for (p = m.next(); !p.done; p = m.next()) if (Lf(p.value, "span").length) throw new O(2, 2, 2001, "<span> can only be inside <p> in TTML");
          if (b = Xv(c, b, e, f, g, d, h, l, k, null, !1)) b.backgroundColor || (b.backgroundColor = "transparent"), a.push(b);
          return a;
        };
        function Xv(a, b, c, d, e, f, g, h, k, l, m) {
          var p = a.parentNode;
          if (a.nodeType == Node.COMMENT_NODE) return null;
          if (a.nodeType == Node.TEXT_NODE) {
            if (!m) return null;
            var n = document.createElement("span");
            n.textContent = a.textContent;
          } else n = a;
          for (var q = null, v = t(Yv), y = v.next(); !y.done && !(q = Zv(n, "backgroundImage", d, "#", y.value)[0]); y = v.next());
          v = m;
          if ("p" == a.nodeName || q) m = !0;
          h = "default" == (n.getAttribute("xml:space") || (h ? "default" : "preserve"));
          y = Array.from(n.childNodes).every(function (B) {
            return B.nodeType == Node.TEXT_NODE;
          });
          a = [];
          if (!y) for (var w = t(n.childNodes), x = w.next(); !x.done; x = w.next()) (x = Xv(x.value, b, c, d, e, f, g, h, k, n, m)) && a.push(x);
          d = null != l;
          w = /\S/.test(n.textContent);
          var D = n.hasAttribute("begin") || n.hasAttribute("end") || n.hasAttribute("dur");
          if (!(D || w || "br" == n.tagName || 0 != a.length || d && !h)) return null;
          x = $v(n, c);
          w = x.start;
          for (x = x.end; p && p.nodeType == Node.ELEMENT_NODE && "tt" != p.tagName;) x = aw(p, c, w, x), w = x.start, x = x.end, p = p.parentNode;
          null == w && (w = 0);
          w += b.periodStart;
          x = null == x ? Infinity : x + b.periodStart;
          w = Math.max(w, b.segmentStart);
          x = Math.min(x, b.segmentEnd);
          if (!D && 0 < a.length) for (w = Infinity, x = 0, b = t(a), c = b.next(); !c.done; c = b.next()) c = c.value, w = Math.min(w, c.startTime), x = Math.max(x, c.endTime);
          if ("br" == n.tagName) return e = new jb(w, x, ""), e.lineBreak = !0, e;
          b = "";
          y && (b = n.textContent, h && (b = b.trim(), b = b.replace(/\s+/g, " ")));
          b = new jb(w, x, b);
          b.nestedCues = a;
          m || (b.isContainer = !0);
          k && (b.cellResolution = k);
          k = Zv(n, "region", f, "")[0];
          if (n.hasAttribute("region") && k && k.getAttribute("xml:id")) {
            var z = k.getAttribute("xml:id");
            b.region = g.filter(function (B) {
              return B.id == z;
            })[0];
          }
          g = k;
          l && d && !n.getAttribute("region") && !n.getAttribute("style") && (g = Zv(l, "region", f, "")[0]);
          bw(b, n, g, q, e, v, 0 == a.length);
          return b;
        }
        function bw(a, b, c, d, e, f, g) {
          f = f || g;
          "rtl" == cw(b, c, e, "direction", f) && (a.direction = "rtl");
          g = cw(b, c, e, "writingMode", f);
          "tb" == g || "tblr" == g ? a.writingMode = "vertical-lr" : "tbrl" == g ? a.writingMode = "vertical-rl" : "rltb" == g || "rl" == g ? a.direction = "rtl" : g && (a.direction = kb);
          (g = cw(b, c, e, "textAlign", !0)) ? (a.positionAlign = dw[g], a.lineAlign = ew[g], a.textAlign = wb[g.toUpperCase()]) : a.textAlign = nb;
          if (g = cw(b, c, e, "displayAlign", !0)) a.displayAlign = xb[g.toUpperCase()];
          if (g = cw(b, c, e, "color", f)) a.color = g;
          if (g = cw(b, c, e, "backgroundColor", f)) a.backgroundColor = g;
          if (g = cw(b, c, e, "border", f)) a.border = g;
          if (g = cw(b, c, e, "fontFamily", f)) switch (g) {
            case "monospaceSerif":
              a.fontFamily = "Courier New,Liberation Mono,Courier,monospace";
              break;
            case "proportionalSansSerif":
              a.fontFamily = "Arial,Helvetica,Liberation Sans,sans-serif";
              break;
            case "sansSerif":
              a.fontFamily = "sans-serif";
              break;
            case "monospaceSansSerif":
              a.fontFamily = "Consolas,monospace";
              break;
            case "proportionalSerif":
              a.fontFamily = "serif";
              break;
            default:
              a.fontFamily = g;
          }
          (g = cw(b, c, e, "fontWeight", f)) && "bold" == g && (a.fontWeight = 700);
          g = cw(b, c, e, "wrapOption", f);
          a.wrapLine = g && "noWrap" == g ? !1 : !0;
          (g = cw(b, c, e, "lineHeight", f)) && g.match(fw) && (a.lineHeight = g);
          (g = cw(b, c, e, "fontSize", f)) && (g.match(fw) || g.match(gw)) && (a.fontSize = g);
          if (g = cw(b, c, e, "fontStyle", f)) a.fontStyle = Bb[g.toUpperCase()];
          if (d) {
            g = d.getAttribute("imageType") || d.getAttribute("imagetype");
            var h = d.getAttribute("encoding");
            d = d.textContent.trim();
            "PNG" == g && "Base64" == h && d && (a.backgroundImage = "data:image/png;base64," + d);
          }
          if (d = cw(b, c, e, "textOutline", f)) d = d.split(" "), d[0].match(fw) ? a.textStrokeColor = a.color : (a.textStrokeColor = d[0], d.shift()), d[0] && d[0].match(fw) ? a.textStrokeWidth = d[0] : a.textStrokeColor = "";
          (d = cw(b, c, e, "letterSpacing", f)) && d.match(fw) && (a.letterSpacing = d);
          (d = cw(b, c, e, "linePadding", f)) && d.match(fw) && (a.linePadding = d);
          if (f = cw(b, c, e, "opacity", f)) a.opacity = parseFloat(f);
          (c = Wv(c, e, "textDecoration")) && hw(a, c);
          (b = iw(b, e, "textDecoration")) && hw(a, b);
        }
        function hw(a, b) {
          b = t(b.split(" "));
          for (var c = b.next(); !c.done; c = b.next()) switch (c.value) {
            case "underline":
              a.textDecoration.includes("underline") || a.textDecoration.push("underline");
              break;
            case "noUnderline":
              a.textDecoration.includes("underline") && gb(a.textDecoration, "underline");
              break;
            case "lineThrough":
              a.textDecoration.includes("lineThrough") || a.textDecoration.push("lineThrough");
              break;
            case "noLineThrough":
              a.textDecoration.includes("lineThrough") && gb(a.textDecoration, "lineThrough");
              break;
            case "overline":
              a.textDecoration.includes("overline") || a.textDecoration.push("overline");
              break;
            case "noOverline":
              a.textDecoration.includes("overline") && gb(a.textDecoration, "overline");
          }
        }
        function cw(a, b, c, d, e) {
          e = void 0 === e ? !0 : e;
          return (a = iw(a, c, d)) ? a : e ? Wv(b, c, d) : null;
        }
        function Wv(a, b, c) {
          if (!a) return null;
          var d = Qf(a, Sv, c);
          return d ? d : jw(a, b, c);
        }
        function iw(a, b, c) {
          var d = Qf(a, Sv, c);
          return d ? d : jw(a, b, c);
        }
        function jw(a, b, c) {
          a = Zv(a, "style", b, "");
          for (var d = null, e = 0; e < a.length; e++) {
            var f = Pf(a[e], "urn:ebu:tt:style", c);
            f || (f = Qf(a[e], Sv, c));
            f || (f = iw(a[e], b, c));
            f && (d = f);
          }
          return d;
        }
        function Zv(a, b, c, d, e) {
          var f = [];
          if (!a || 1 > c.length) return f;
          var g = a;
          for (a = null; g && !(a = e ? Pf(g, e, b) : g.getAttribute(b)) && (g = g.parentNode, g instanceof Element););
          if (b = a) for (b = t(b.split(" ")), e = b.next(); !e.done; e = b.next()) for (e = e.value, a = t(c), g = a.next(); !g.done; g = a.next()) if (g = g.value, d + g.getAttribute("xml:id") == e) {
            f.push(g);
            break;
          }
          return f;
        }
        function aw(a, b, c, d) {
          a = $v(a, b);
          null == c ? c = a.start : null != a.start && (c += a.start);
          null == d ? d = a.end : null != a.start && (d += a.start);
          return {
            start: c,
            end: d
          };
        }
        function $v(a, b) {
          var c = kw(a.getAttribute("begin"), b),
            d = kw(a.getAttribute("end"), b);
          a = kw(a.getAttribute("dur"), b);
          null == d && null != a && (d = c + a);
          return {
            start: c,
            end: d
          };
        }
        function kw(a, b) {
          var c = null;
          if (lw.test(a)) {
            a = lw.exec(a);
            c = Number(a[1]);
            var d = Number(a[2]),
              e = Number(a[3]),
              f = Number(a[4]);
            f += (Number(a[5]) || 0) / b.h;
            e += f / b.frameRate;
            c = e + 60 * d + 3600 * c;
          } else if (mw.test(a)) c = nw(mw, a);else if (ow.test(a)) c = nw(ow, a);else if (pw.test(a)) a = pw.exec(a), c = Number(a[1]) / b.frameRate;else if (qw.test(a)) a = qw.exec(a), c = Number(a[1]) / b.g;else if (rw.test(a)) c = nw(rw, a);else if (a) throw new O(2, 2, 2001, "Could not parse cue time range in TTML");
          return c;
        }
        function nw(a, b) {
          a = a.exec(b);
          return null == a || "" == a[0] ? null : (Number(a[4]) || 0) / 1E3 + (Number(a[3]) || 0) + 60 * (Number(a[2]) || 0) + 3600 * (Number(a[1]) || 0);
        }
        K("shaka.text.TtmlTextParser", Qv);
        Qv.prototype.parseMedia = Qv.prototype.parseMedia;
        Qv.prototype.setSequenceMode = Qv.prototype.setSequenceMode;
        Qv.prototype.parseInit = Qv.prototype.parseInit;
        function Tv(a, b, c, d) {
          this.frameRate = Number(a) || 30;
          this.h = Number(b) || 1;
          this.g = Number(d);
          0 == this.g && (this.g = a ? this.frameRate * this.h : 1);
          c && (a = /^(\d+) (\d+)$/g.exec(c)) && (this.frameRate *= Number(a[1]) / Number(a[2]));
        }
        var Uv = /^(\d{1,2}(?:\.\d+)?|100(?:\.0+)?)% (\d{1,2}(?:\.\d+)?|100(?:\.0+)?)%$/,
          gw = /^(\d{1,2}(?:\.\d+)?|100)%$/,
          fw = /^(\d+px|\d+em|\d*\.?\d+c)$/,
          Vv = /^(\d+)px (\d+)px$/,
          lw = /^(\d{2,}):(\d{2}):(\d{2}):(\d{2})\.?(\d+)?$/,
          mw = /^(?:(\d{2,}):)?(\d{2}):(\d{2})$/,
          ow = /^(?:(\d{2,}):)?(\d{2}):(\d{2}\.\d{2,})$/,
          pw = /^(\d*(?:\.\d*)?)f$/,
          qw = /^(\d*(?:\.\d*)?)t$/,
          rw = RegExp("^(?:(\\d*(?:\\.\\d*)?)h)?(?:(\\d*(?:\\.\\d*)?)m)?(?:(\\d*(?:\\.\\d*)?)s)?(?:(\\d*(?:\\.\\d*)?)ms)?$"),
          ew = {
            left: rb,
            center: "center",
            right: "end",
            start: rb,
            end: "end"
          },
          dw = {
            left: "line-left",
            center: "center",
            right: "line-right"
          },
          Rv = ["http://www.w3.org/ns/ttml#parameter", "http://www.w3.org/2006/10/ttaf1#parameter"],
          Sv = ["http://www.w3.org/ns/ttml#styling", "http://www.w3.org/2006/10/ttaf1#styling"],
          Yv = ["http://www.smpte-ra.org/schemas/2052-1/2010/smpte-tt", "http://www.smpte-ra.org/schemas/2052-1/2013/smpte-tt"];
        ed["application/ttml+xml"] = function () {
          return new Qv();
        };
        function sw() {
          this.g = new Qv();
        }
        sw.prototype.parseInit = function (a) {
          var b = !1;
          new yf().box("moov", Df).box("trak", Df).box("mdia", Df).box("minf", Df).box("stbl", Df).R("stsd", Ff).box("stpp", function (c) {
            b = !0;
            c.parser.stop();
          }).parse(a);
          if (!b) throw new O(2, 2, 2007);
        };
        sw.prototype.setSequenceMode = function () {};
        sw.prototype.parseMedia = function (a, b) {
          var c = this,
            d = !1,
            e = [];
          new yf().box("mdat", Hf(function (f) {
            d = !0;
            e = e.concat(c.g.parseMedia(f, b));
          })).parse(a, !1);
          if (!d) throw new O(2, 2, 2007);
          return e;
        };
        K("shaka.text.Mp4TtmlParser", sw);
        sw.prototype.parseMedia = sw.prototype.parseMedia;
        sw.prototype.setSequenceMode = sw.prototype.setSequenceMode;
        sw.prototype.parseInit = sw.prototype.parseInit;
        ed['application/mp4; codecs="stpp"'] = function () {
          return new sw();
        };
        ed['application/mp4; codecs="stpp.ttml"'] = function () {
          return new sw();
        };
        ed['application/mp4; codecs="stpp.ttml.im1t"'] = function () {
          return new sw();
        };
        ed['application/mp4; codecs="stpp.TTML.im1t"'] = function () {
          return new sw();
        };
        function tw() {
          this.g = !1;
        }
        tw.prototype.parseInit = function () {};
        tw.prototype.setSequenceMode = function (a) {
          this.g = a;
        };
        tw.prototype.parseMedia = function (a, b) {
          a = Bc(a);
          a = a.replace(/\r\n|\r(?=[^\n]|$)/gm, "\n");
          var c = a.split(/\n{2,}/m);
          if (!/^WEBVTT($|[ \t\n])/m.test(c[0])) throw new O(2, 2, 2E3);
          a = b.vttOffset;
          if (c[0].includes("X-TIMESTAMP-MAP") && this.g) {
            var d = c[0].match(/LOCAL:((?:(\d{1,}):)?(\d{2}):(\d{2})\.(\d{3}))/m),
              e = c[0].match(/MPEGTS:(\d+)/m);
            if (d && e) {
              a = uw(new Lq(d[1]));
              if (null == a) throw new O(2, 2, 2E3);
              e = Number(e[1]);
              for (d = b.segmentStart - b.periodStart; 95443.7176888889 <= d;) d -= 95443.7176888889, e += 8589934592;
              a = b.periodStart + e / 9E4 - a;
            }
          }
          b = [];
          e = t(c[0].split("\n"));
          for (d = e.next(); !d.done; d = e.next()) if (d = d.value, /^Region:/.test(d)) {
            d = new Lq(d);
            var f = new lb();
            Oq(d);
            Mq(d);
            for (var g = Oq(d); g;) {
              var h = f,
                k = g;
              (g = /^id=(.*)$/.exec(k)) ? h.id = g[1] : (g = /^width=(\d{1,2}|100)%$/.exec(k)) ? h.width = Number(g[1]) : (g = /^lines=(\d+)$/.exec(k)) ? (h.height = Number(g[1]), h.heightUnits = 2) : (g = /^regionanchor=(\d{1,2}|100)%,(\d{1,2}|100)%$/.exec(k)) ? (h.regionAnchorX = Number(g[1]), h.regionAnchorY = Number(g[2])) : (g = /^viewportanchor=(\d{1,2}|100)%,(\d{1,2}|100)%$/.exec(k)) ? (h.viewportAnchorX = Number(g[1]), h.viewportAnchorY = Number(g[2])) : /^scroll=up$/.exec(k) && (h.scroll = "up");
              Mq(d);
              g = Oq(d);
            }
            b.push(f);
          }
          e = new Map();
          vw(e);
          d = [];
          c = t(c.slice(1));
          for (f = c.next(); !f.done; f = c.next()) {
            f = f.value.split("\n");
            if ((1 != f.length || f[0]) && !/^NOTE($|[ \t])/.test(f[0]) && "STYLE" == f[0]) {
              h = [];
              g = -1;
              for (k = 1; k < f.length; k++) f[k].includes("::cue") && (h.push([]), g = h.length - 1), -1 != g && (h[g].push(f[k]), f[k].includes("}") && (g = -1));
              h = t(h);
              for (g = h.next(); !g.done; g = h.next()) {
                var l = g.value;
                g = "global";
                (k = l[0].match(/\((.*)\)/)) && (g = k.pop());
                k = l.slice(1, -1);
                l[0].includes("}") && (l = /\{(.*?)\}/.exec(l[0])) && (k = l[1].split(";"));
                (l = e.get(g)) || (l = new jb(0, 0, ""));
                for (var m = !1, p = 0; p < k.length; p++) {
                  var n = /^\s*([^:]+):\s*(.*)/.exec(k[p]);
                  if (n) {
                    var q = n[2].trim().replace(";", "");
                    switch (n[1].trim()) {
                      case "background-color":
                      case "background":
                        m = !0;
                        l.backgroundColor = q;
                        break;
                      case "color":
                        m = !0;
                        l.color = q;
                        break;
                      case "font-family":
                        m = !0;
                        l.fontFamily = q;
                        break;
                      case "font-size":
                        m = !0;
                        l.fontSize = q;
                        break;
                      case "font-weight":
                        if (700 <= parseInt(q, 10) || "bold" == q) m = !0, l.fontWeight = 700;
                        break;
                      case "font-style":
                        switch (q) {
                          case "normal":
                            m = !0;
                            l.fontStyle = ub;
                            break;
                          case "italic":
                            m = !0;
                            l.fontStyle = "italic";
                            break;
                          case "oblique":
                            m = !0, l.fontStyle = "oblique";
                        }
                        break;
                      case "opacity":
                        m = !0;
                        l.opacity = parseFloat(q);
                        break;
                      case "text-shadow":
                        m = !0;
                        l.textShadow = q;
                        break;
                      case "white-space":
                        m = !0, l.wrapLine = "noWrap" != q;
                    }
                  }
                }
                m && e.set(g, l);
              }
            }
            m = a;
            if (1 == f.length && !f[0] || /^NOTE($|[ \t])/.test(f[0]) || "STYLE" == f[0] || "REGION" == f[0]) f = null;else {
              h = null;
              f[0].includes("--\x3e") || (h = f[0], f.splice(0, 1));
              g = new Lq(f[0]);
              k = uw(g);
              p = Nq(g, /[ \t]+--\x3e[ \t]+/g);
              l = uw(g);
              if (null == k || null == p || null == l) throw new O(2, 2, 2001, "Could not parse cue time range in WebVTT");
              k += m;
              l += m;
              m = f.slice(1).join("\n").trim();
              e.has("global") ? (f = e.get("global").clone(), f.startTime = k, f.endTime = l, f.payload = "") : f = new jb(k, l, "");
              ww(m, f, e);
              Mq(g);
              for (k = Oq(g); k;) xw(f, k, b), Mq(g), k = Oq(g);
              null != h && (f.id = h);
            }
            f && d.push(f);
          }
          return d;
        };
        function vw(a) {
          for (var b = t(Object.entries(zb)), c = b.next(); !c.done; c = b.next()) {
            var d = t(c.value);
            c = d.next().value;
            d = d.next().value;
            var e = new jb(0, 0, "");
            e.color = d;
            a.set("." + c, e);
          }
          b = t(Object.entries(Ab));
          for (c = b.next(); !c.done; c = b.next()) d = t(c.value), c = d.next().value, d = d.next().value, e = new jb(0, 0, ""), e.backgroundColor = d, a.set("." + c, e);
        }
        function ww(a, b, c) {
          0 === c.size && vw(c);
          a: {
            var d = a;
            a = [];
            for (var e = -1, f = "", g = 0; g < d.length; g++) if ("/" === d[g] && 0 < g && "<" === d[g - 1]) {
              var h = d.indexOf(">", g);
              if (h <= g) {
                a = d;
                break a;
              }
              if ((h = d.substring(g + 1, h)) && "c" === h) {
                var k = a.pop();
                k ? k === h ? (f += "/" + h + ">", g += h.length + 1) : k.startsWith("c.") ? (g += h.length + 1, f += "/" + k + ">") : f += d[g] : f += d[g];
              } else f += d[g];
            } else "<" === d[g] ? (e = g + 1, "c" != d[e] && (e = -1)) : ">" === d[g] && 0 < e && (a.push(d.substr(e, g - e)), e = -1), f += d[g];
            a = f;
          }
          d = [];
          f = -1;
          for (e = 0; e < a.length; e++) "<" === a[e] ? f = e + 1 : ">" === a[e] && 0 < f && (f = a.substr(f, e - f), f.match(yw) && d.push(f), f = -1);
          d = t(d);
          for (e = d.next(); !e.done; e = d.next()) e = e.value, a = a.replace("<" + e + ">", '<div time="' + e + '">'), a += "</div>";
          a: {
            e = a;
            f = [];
            g = -1;
            d = "";
            a = !1;
            for (h = 0; h < e.length; h++) if ("/" === e[h]) {
              k = e.indexOf(">", h);
              if (-1 === k) {
                a = e;
                break a;
              }
              if ((k = e.substring(h + 1, k)) && "v" == k) {
                a = !0;
                var l = null;
                f.length && (l = f[f.length - 1]);
                if (l) {
                  if (l === k) d += "/" + k + ">";else {
                    if (!l.startsWith("v")) {
                      d += e[h];
                      continue;
                    }
                    d += "/" + l + ">";
                  }
                  h += k.length + 1;
                } else d += e[h];
              } else d += e[h];
            } else "<" === e[h] ? (g = h + 1, "v" != e[g] && (g = -1)) : ">" === e[h] && 0 < g && (f.push(e.substr(g, h - g)), g = -1), d += e[h];
            e = t(f);
            for (f = e.next(); !f.done; f = e.next()) f = f.value, g = f.replace(" ", ".voice-"), d = d.replace("<" + f + ">", "<" + g + ">"), d = d.replace("</" + f + ">", "</" + g + ">"), a || (d += "</" + g + ">");
            a = d;
          }
          if (e = bg("<span>" + a + "</span>", "span")) {
            d = [];
            e = e.childNodes;
            if (1 == e.length && (f = e[0], f.nodeType == Node.TEXT_NODE || f.nodeType == Node.CDATA_SECTION_NODE)) {
              b.payload = zw(a);
              return;
            }
            a = t(e);
            for (e = a.next(); !e.done; e = a.next()) Aw(e.value, b, d, c);
            b.nestedCues = d;
          } else b.payload = zw(a);
        }
        function Bw(a, b) {
          return a && 0 < a.length ? a : b;
        }
        function Aw(a, b, c, d) {
          var e = b.clone();
          if (a.nodeType === Node.ELEMENT_NODE && a.nodeName) for (var f = t(a.nodeName.split(/(?=[ .])+/g)), g = f.next(); !g.done; g = f.next()) {
            var h = g = g.value;
            if (h.startsWith(".voice-")) {
              var k = h.split("-").pop();
              h = 'v[voice="' + k + '"]';
              d.has(h) || (h = "v[voice=" + k + "]");
            }
            d.has(h) && (h = d.get(h)) && (e.backgroundColor = Bw(h.backgroundColor, e.backgroundColor), e.color = Bw(h.color, e.color), e.fontFamily = Bw(h.fontFamily, e.fontFamily), e.fontSize = Bw(h.fontSize, e.fontSize), e.fontWeight = h.fontWeight, e.fontStyle = h.fontStyle, e.opacity = h.opacity, e.textShadow = h.textShadow, e.wrapLine = h.wrapLine);
            switch (g) {
              case "br":
                g = b.clone();
                g.lineBreak = !0;
                c.push(g);
                break;
              case "b":
                e.fontWeight = 700;
                break;
              case "i":
                e.fontStyle = "italic";
                break;
              case "u":
                e.textDecoration.push("underline");
                break;
              case "div":
                if (g = a.getAttribute("time")) if (g = uw(new Lq(g))) e.startTime = g;
            }
          }
          if (Sf(a)) for (f = !0, d = t(a.textContent.split("\n")), a = d.next(); !a.done; a = d.next()) a = a.value, f || (f = b.clone(), f.lineBreak = !0, c.push(f)), 0 < a.length && (f = e.clone(), f.payload = zw(a), c.push(f)), f = !1;else for (b = t(a.childNodes), a = b.next(); !a.done; a = b.next()) Aw(a.value, e, c, d);
        }
        function xw(a, b, c) {
          var d;
          if (d = /^align:(start|middle|center|end|left|right)$/.exec(b)) b = d[1], "middle" == b ? a.textAlign = nb : a.textAlign = wb[b.toUpperCase()];else if (d = /^vertical:(lr|rl)$/.exec(b)) a.writingMode = "lr" == d[1] ? "vertical-lr" : "vertical-rl";else if (d = /^size:([\d.]+)%$/.exec(b)) a.size = Number(d[1]);else if (d = /^position:([\d.]+)%(?:,(line-left|line-right|middle|center|start|end))?$/.exec(b)) a.position = Number(d[1]), d[2] && (b = d[2], a.positionAlign = "line-left" == b || "start" == b ? "line-left" : "line-right" == b || "end" == b ? "line-right" : "center");else if (d = /^region:(.*)$/.exec(b)) {
            if (b = Cw(c, d[1])) a.region = b;
          } else if (c = /^line:([\d.]+)%(?:,(start|end|center))?$/.exec(b)) a.lineInterpretation = 1, a.line = Number(c[1]), c[2] && (a.lineAlign = yb[c[2].toUpperCase()]);else if (c = /^line:(-?\d+)(?:,(start|end|center))?$/.exec(b)) a.lineInterpretation = qb, a.line = Number(c[1]), c[2] && (a.lineAlign = yb[c[2].toUpperCase()]);
        }
        function Cw(a, b) {
          a = a.filter(function (c) {
            return c.id == b;
          });
          return a.length ? a[0] : null;
        }
        function uw(a) {
          a = Nq(a, yw);
          if (null == a) return null;
          var b = Number(a[2]),
            c = Number(a[3]);
          return 59 < b || 59 < c ? null : Number(a[4]) / 1E3 + c + 60 * b + 3600 * (Number(a[1]) || 0);
        }
        function zw(a) {
          var b = {
              "&amp;": "&",
              "&lt;": "<",
              "&gt;": ">",
              "&quot;": '"',
              "&#39;": "'",
              "&nbsp;": "\u00a0",
              "&lrm;": "\u200e",
              "&rlm;": "\u200f"
            },
            c = /&(?:amp|lt|gt|quot|#(0+)?39|nbsp|lrm|rlm);/g,
            d = RegExp(c.source);
          return a && d.test(a) ? a.replace(c, function (e) {
            return b[e] || "'";
          }) : a || "";
        }
        K("shaka.text.VttTextParser", tw);
        tw.prototype.parseMedia = tw.prototype.parseMedia;
        tw.prototype.setSequenceMode = tw.prototype.setSequenceMode;
        tw.prototype.parseInit = tw.prototype.parseInit;
        var yw = /(?:(\d{1,}):)?(\d{2}):(\d{2})\.(\d{2,3})/g;
        ed["text/vtt"] = function () {
          return new tw();
        };
        ed['text/vtt; codecs="vtt"'] = function () {
          return new tw();
        };
        ed['text/vtt; codecs="wvtt"'] = function () {
          return new tw();
        };
        function Dw() {
          this.g = null;
        }
        Dw.prototype.parseInit = function (a) {
          var b = this,
            c = !1;
          new yf().box("moov", Df).box("trak", Df).box("mdia", Df).R("mdhd", function (d) {
            d = fi(d.reader, d.version);
            b.g = d.timescale;
          }).box("minf", Df).box("stbl", Df).R("stsd", Ff).box("wvtt", function () {
            c = !0;
          }).parse(a);
          if (!this.g) throw new O(2, 2, 2008);
          if (!c) throw new O(2, 2, 2008);
        };
        Dw.prototype.setSequenceMode = function () {};
        Dw.prototype.parseMedia = function (a, b) {
          if (!a.length) return [];
          if (!this.g) throw new O(2, 2, 2008);
          var c = 0,
            d = [],
            e,
            f = [],
            g = !1,
            h = !1,
            k = !1,
            l = null;
          new yf().box("moof", Df).box("traf", Df).R("tfdt", function (z) {
            g = !0;
            c = ei(z.reader, z.version).xe;
          }).R("tfhd", function (z) {
            l = di(z.reader, z.flags).De;
          }).R("trun", function (z) {
            h = !0;
            d = gi(z.reader, z.version, z.flags).Se;
          }).box("mdat", Hf(function (z) {
            k = !0;
            e = z;
          })).parse(a, !1);
          if (!k && !g && !h) throw new O(2, 2, 2008);
          a = c;
          for (var m = new vf(e, 0), p = t(d), n = p.next(); !n.done; n = p.next()) {
            n = n.value;
            var q = n.ge || l,
              v = n.fd ? c + n.fd : a;
            a = v + (q || 0);
            var y = 0;
            do {
              var w = m.K();
              y += w;
              var x = m.K(),
                D = null;
              "vttc" == Cf(x) ? 8 < w && (D = m.Za(w - 8)) : m.skip(w - 8);
              q && D && (w = Ew(D, b.periodStart + v / this.g, b.periodStart + a / this.g), f.push(w));
            } while (n.sampleSize && y < n.sampleSize);
          }
          return f.filter(cc);
        };
        function Ew(a, b, c) {
          var d, e, f;
          new yf().box("payl", Hf(function (g) {
            d = Bc(g);
          })).box("iden", Hf(function (g) {
            e = Bc(g);
          })).box("sttg", Hf(function (g) {
            f = Bc(g);
          })).parse(a);
          return d ? Fw(d, e, f, b, c) : null;
        }
        function Fw(a, b, c, d, e) {
          d = new jb(d, e, "");
          ww(a, d, new Map());
          b && (d.id = b);
          if (c) for (a = new Lq(c), b = Oq(a); b;) xw(d, b, []), Mq(a), b = Oq(a);
          return d;
        }
        K("shaka.text.Mp4VttParser", Dw);
        Dw.prototype.parseMedia = Dw.prototype.parseMedia;
        Dw.prototype.setSequenceMode = Dw.prototype.setSequenceMode;
        Dw.prototype.parseInit = Dw.prototype.parseInit;
        ed['application/mp4; codecs="wvtt"'] = function () {
          return new Dw();
        };
        function Gw() {}
        Gw.prototype.parseInit = function () {};
        Gw.prototype.setSequenceMode = function () {};
        Gw.prototype.parseMedia = function (a) {
          var b = Bc(a).replace(/\r+/g, "");
          b = b.trim();
          a = [];
          if ("" == b) return a;
          b = t(b.split("\n\n"));
          for (var c = b.next(); !c.done; c = b.next()) {
            c = c.value.split("\n");
            var d = new Lq(c[0]),
              e = Hw(d),
              f = Nq(d, /,/g);
            d = Hw(d);
            if (null == e || null == f || null == d) throw new O(2, 2, 2001, "Could not parse cue time range in SubViewer");
            a.push(new jb(e, d, c.slice(1).join("\n").trim()));
          }
          return a;
        };
        function Hw(a) {
          a = Nq(a, /(?:(\d{1,}):)?(\d{2}):(\d{2})\.(\d{2,3})/g);
          if (null == a) return null;
          var b = Number(a[2]),
            c = Number(a[3]);
          return 59 < b || 59 < c ? null : Number(a[4]) / 1E3 + c + 60 * b + 3600 * (Number(a[1]) || 0);
        }
        K("shaka.text.SbvTextParser", Gw);
        Gw.prototype.parseMedia = Gw.prototype.parseMedia;
        Gw.prototype.setSequenceMode = Gw.prototype.setSequenceMode;
        Gw.prototype.parseInit = Gw.prototype.parseInit;
        ed["text/x-subviewer"] = function () {
          return new Gw();
        };
        function Iw() {
          this.g = new tw();
        }
        Iw.prototype.parseInit = function () {};
        Iw.prototype.setSequenceMode = function () {};
        Iw.prototype.parseMedia = function (a, b) {
          a = Bc(a);
          a = Jw(a);
          a = L(Fc(a));
          return this.g.parseMedia(a, b);
        };
        function Jw(a) {
          var b = "WEBVTT\n\n";
          if ("" == a) return b;
          a = a.replace(/\r+/g, "");
          a = a.trim();
          a = t(a.split("\n\n"));
          for (var c = a.next(); !c.done; c = a.next()) c = c.value.split(/\n/), c[0].match(/\d+/) && c.shift(), c[0] = c[0].replace(/,/g, "."), b += c.join("\n") + "\n\n";
          return b;
        }
        K("shaka.text.SrtTextParser", Iw);
        Iw.srt2webvtt = Jw;
        Iw.prototype.parseMedia = Iw.prototype.parseMedia;
        Iw.prototype.setSequenceMode = Iw.prototype.setSequenceMode;
        Iw.prototype.parseInit = Iw.prototype.parseInit;
        ed["text/srt"] = function () {
          return new Iw();
        };
        function Kw() {}
        Kw.prototype.parseInit = function () {};
        Kw.prototype.setSequenceMode = function () {};
        Kw.prototype.parseMedia = function (a) {
          var b = "",
            c = "";
          a = Bc(a).split(/\r?\n\s*\r?\n/);
          a = t(a);
          for (var d = a.next(); !d.done; d = a.next()) {
            var e = Lw.exec(d.value);
            e && (d = e[1], e = e[2], "V4 Styles" == d || "V4+ Styles" == d ? b = e : "Events" == d && (c = e));
          }
          a = [];
          d = null;
          b = t(b.split(/\r?\n/));
          for (var f = b.next(); !f.done; f = b.next()) if (e = f.value, !/^\s*;/.test(e) && (f = Mw.exec(e))) if (e = f[1].trim(), f = f[2].trim(), "Format" == e) d = f.split(Nw);else if ("Style" == e) {
            e = f.split(Nw);
            f = {};
            for (var g = 0; g < d.length && g < e.length; g++) f[d[g]] = e[g];
            a.push(f);
          }
          d = [];
          b = null;
          e = {};
          c = t(c.split(/\r?\n/));
          for (f = c.next(); !f.done; e = {
            xd: e.xd
          }, f = c.next()) if (f = f.value, !/^\s*;/.test(f) && (g = Mw.exec(f))) if (f = g[1].trim(), g = g[2].trim(), "Format" == f) b = g.split(Nw);else if ("Dialogue" == f) {
            g = g.split(Nw);
            f = {};
            for (var h = 0; h < b.length && h < g.length; h++) f[b[h]] = g[h];
            h = Ow(f.Start);
            var k = Ow(f.End);
            g = new jb(h, k, g.slice(b.length - 1).join(",").replace(/\\N/g, "\n").replace(/\{[^}]+\}/g, ""));
            e.xd = f.Style;
            (f = a.find(function (l) {
              return function (m) {
                return m.Name == l.xd;
              };
            }(e))) && Pw(g, f);
            d.push(g);
          }
          return d;
        };
        function Pw(a, b) {
          var c = b.Fontname;
          c && (a.fontFamily = c);
          if (c = b.Fontsize) a.fontSize = c + "px";
          if (c = b.PrimaryColour) if (c = Qw(c)) a.color = c;
          if (c = b.BackColour) if (c = Qw(c)) a.backgroundColor = c;
          b.Bold && (a.fontWeight = 700);
          b.Italic && (a.fontStyle = "italic");
          b.Underline && a.textDecoration.push("underline");
          if (c = b.Spacing) a.letterSpacing = c + "px";
          if (c = b.Alignment) switch (parseInt(c, 10)) {
            case 1:
              a.displayAlign = sb;
              a.textAlign = "start";
              break;
            case 2:
              a.displayAlign = sb;
              a.textAlign = nb;
              break;
            case 3:
              a.displayAlign = sb;
              a.textAlign = "end";
              break;
            case 5:
              a.displayAlign = "before";
              a.textAlign = "start";
              break;
            case 6:
              a.displayAlign = "before";
              a.textAlign = nb;
              break;
            case 7:
              a.displayAlign = "before";
              a.textAlign = "end";
              break;
            case 9:
              a.displayAlign = "center";
              a.textAlign = "start";
              break;
            case 10:
              a.displayAlign = "center";
              a.textAlign = nb;
              break;
            case 11:
              a.displayAlign = "center", a.textAlign = "end";
          }
          if (b = b.AlphaLevel) a.opacity = parseFloat(b);
        }
        function Qw(a) {
          a = parseInt(a.replace("&H", ""), 16);
          return 0 <= a ? "rgba(" + (a & 255) + "," + (a >> 8 & 255) + "," + (a >> 16 & 255) + "," + (a >> 24 & 255 ^ 255) / 255 + ")" : null;
        }
        function Ow(a) {
          a = Rw.exec(a);
          return 3600 * (a[1] ? parseInt(a[1].replace(":", ""), 10) : 0) + 60 * parseInt(a[2], 10) + parseFloat(a[3]);
        }
        K("shaka.text.SsaTextParser", Kw);
        Kw.prototype.parseMedia = Kw.prototype.parseMedia;
        Kw.prototype.setSequenceMode = Kw.prototype.setSequenceMode;
        Kw.prototype.parseInit = Kw.prototype.parseInit;
        var Lw = /^\s*\[([^\]]+)\]\r?\n([\s\S]*)/,
          Mw = /^\s*([^:]+):\s*(.*)/,
          Nw = /\s*,\s*/,
          Rw = /^(\d+:)?(\d{1,2}):(\d{1,2}(?:[.]\d{1,3})?)?$/;
        ed["text/x-ssa"] = function () {
          return new Kw();
        }; /*
           @license
           EME Encryption Scheme Polyfill
           Copyright 2019 Google LLC
           SPDX-License-Identifier: Apache-2.0
           */
        function Sw() {}
        var Tw;
        function Uw() {
          Tw ? console.debug("EmeEncryptionSchemePolyfill: Already installed.") : navigator.requestMediaKeySystemAccess && MediaKeySystemAccess.prototype.getConfiguration ? (Tw = navigator.requestMediaKeySystemAccess, console.debug("EmeEncryptionSchemePolyfill: Waiting to detect encryptionScheme support."), navigator.requestMediaKeySystemAccess = Vw) : console.debug("EmeEncryptionSchemePolyfill: EME not found");
        }
        function Vw(a, b) {
          var c = this,
            d;
          return G(function (e) {
            if (1 == e.g) return console.assert(c == navigator, 'bad "this" for requestMediaKeySystemAccess'), u(e, Tw.call(c, a, b), 2);
            d = e.h;
            if (Ww(d)) return console.debug("EmeEncryptionSchemePolyfill: Native encryptionScheme support found."), navigator.requestMediaKeySystemAccess = Tw, e.return(d);
            console.debug("EmeEncryptionSchemePolyfill: No native encryptionScheme support found. Patching encryptionScheme support.");
            navigator.requestMediaKeySystemAccess = Xw;
            return e.return(Xw.call(c, a, b));
          });
        }
        function Xw(a, b) {
          var c = this,
            d,
            e,
            f,
            g,
            h,
            k,
            l,
            m,
            p,
            n;
          return G(function (q) {
            if (1 == q.g) {
              console.assert(c == navigator, 'bad "this" for requestMediaKeySystemAccess');
              d = Yw(a);
              e = [];
              f = t(b);
              for (g = f.next(); !g.done; g = f.next()) h = g.value, k = Zw(h.videoCapabilities, d), l = Zw(h.audioCapabilities, d), h.videoCapabilities && h.videoCapabilities.length && !k.length || h.audioCapabilities && h.audioCapabilities.length && !l.length || (m = Object.assign({}, h), m.videoCapabilities = k, m.audioCapabilities = l, e.push(m));
              if (!e.length) throw p = Error("Unsupported keySystem or supportedConfigurations."), p.name = "NotSupportedError", p.code = DOMException.NOT_SUPPORTED_ERR, p;
              return u(q, Tw.call(c, a, e), 2);
            }
            n = q.h;
            return q.return(new $w(n, d));
          });
        }
        function Zw(a, b) {
          return a ? a.filter(function (c) {
            return !c.encryptionScheme || c.encryptionScheme == b;
          }) : a;
        }
        K("EmeEncryptionSchemePolyfill", Sw);
        Sw.install = Uw;
        function ax() {}
        var bx;
        function cx() {
          bx ? console.debug("McEncryptionSchemePolyfill: Already installed.") : navigator.mediaCapabilities ? (bx = navigator.mediaCapabilities.decodingInfo, console.debug("McEncryptionSchemePolyfill: Waiting to detect encryptionScheme support."), navigator.mediaCapabilities.decodingInfo = dx) : console.debug("McEncryptionSchemePolyfill: MediaCapabilities not found");
        }
        function dx(a) {
          var b = this,
            c,
            d,
            e;
          return G(function (f) {
            switch (f.g) {
              case 1:
                return console.assert(b == navigator.mediaCapabilities, 'bad "this" for decodingInfo'), u(f, bx.call(b, a), 2);
              case 2:
                c = f.h;
                if (!a.keySystemConfiguration) return f.return(c);
                if ((d = c.keySystemAccess) && Ww(d)) return console.debug("McEncryptionSchemePolyfill: Native encryptionScheme support found."), navigator.mediaCapabilities.decodingInfo = bx, f.return(c);
                console.debug("McEncryptionSchemePolyfill: No native encryptionScheme support found. Patching encryptionScheme support.");
                navigator.mediaCapabilities.decodingInfo = ex;
                if (d) {
                  f.B(3);
                  break;
                }
                e = c;
                return u(f, fx(a), 4);
              case 4:
                return e.keySystemAccess = f.h, f.return(c);
              case 3:
                return f.return(ex.call(b, a));
            }
          });
        }
        function ex(a) {
          var b = this,
            c,
            d,
            e,
            f,
            g,
            h,
            k,
            l;
          return G(function (m) {
            switch (m.g) {
              case 1:
                return console.assert(b == navigator.mediaCapabilities, 'bad "this" for decodingInfo'), c = null, a.keySystemConfiguration && (d = a.keySystemConfiguration, e = d.keySystem, f = d.audio && d.audio.encryptionScheme, g = d.video && d.video.encryptionScheme, c = Yw(e), h = {
                  powerEfficient: !1,
                  smooth: !1,
                  supported: !1,
                  keySystemAccess: null,
                  configuration: a
                }, f && f != c || g && g != c) ? m.return(h) : u(m, bx.call(b, a), 2);
              case 2:
                k = m.h;
                if (k.keySystemAccess) {
                  k.keySystemAccess = new $w(k.keySystemAccess, c);
                  m.B(3);
                  break;
                }
                if (!a.keySystemConfiguration) {
                  m.B(3);
                  break;
                }
                l = k;
                return u(m, fx(a), 5);
              case 5:
                l.keySystemAccess = m.h;
              case 3:
                return m.return(k);
            }
          });
        }
        function fx(a) {
          var b, c;
          return G(function (d) {
            if (1 == d.g) {
              var e = a.keySystemConfiguration,
                f = [],
                g = [];
              e.audio && f.push({
                robustness: e.audio.robustness || "",
                contentType: a.audio.contentType
              });
              e.video && g.push({
                robustness: e.video.robustness || "",
                contentType: a.video.contentType
              });
              e = {
                initDataTypes: e.initDataType ? [e.initDataType] : [],
                distinctiveIdentifier: e.distinctiveIdentifier,
                persistentState: e.persistentState,
                sessionTypes: e.sessionTypes
              };
              f.length && (e.audioCapabilities = f);
              g.length && (e.videoCapabilities = g);
              b = e;
              return u(d, navigator.requestMediaKeySystemAccess(a.keySystemConfiguration.keySystem, [b]), 2);
            }
            c = d.h;
            return d.return(c);
          });
        }
        K("McEncryptionSchemePolyfill", ax);
        ax.install = cx;
        function $w(a, b) {
          this.h = a;
          this.g = b;
          this.keySystem = a.keySystem;
        }
        $w.prototype.getConfiguration = function () {
          var a = this.h.getConfiguration();
          if (a.videoCapabilities) for (var b = t(a.videoCapabilities), c = b.next(); !c.done; c = b.next()) c.value.encryptionScheme = this.g;
          if (a.audioCapabilities) for (b = t(a.audioCapabilities), c = b.next(); !c.done; c = b.next()) c.value.encryptionScheme = this.g;
          return a;
        };
        $w.prototype.createMediaKeys = function () {
          return this.h.createMediaKeys();
        };
        function Yw(a) {
          if (a.startsWith("com.widevine") || a.startsWith("com.microsoft") || a.startsWith("com.chromecast") || a.startsWith("com.adobe") || a.startsWith("org.w3")) return "cenc";
          if (a.startsWith("com.apple")) return "cbcs-1-9";
          console.warn("EmeEncryptionSchemePolyfill: Unknown key system:", a, "Please contribute!");
          return null;
        }
        function Ww(a) {
          a = a.getConfiguration();
          var b = a.audioCapabilities && a.audioCapabilities[0];
          return (a = a.videoCapabilities && a.videoCapabilities[0] || b) && void 0 !== a.encryptionScheme ? !0 : !1;
        }
        function gx() {}
        function ju() {
          Uw();
          cx();
        }
        K("EncryptionSchemePolyfills", gx);
        gx.install = ju;
        "undefined" !== typeof module && module.exports && (module.exports = gx);
      }).call(exportTo, innerGlobal, innerGlobal, undefined);
      for (var k in exportTo.shaka) exports[k] = exportTo.shaka[k];
    })();
  })(shakaPlayer_compiled);

  class Player extends Lightning.Component {
    static _template() {
      return {
        collision: true,
        forceZIndexContext: true
      };
    }
    _setupShakaPlayer(videoEl) {
      videoEl.autoplay = true;
      this._player = new shakaPlayer_compiled.Player(videoEl);
    }
    async _loadPlayback(url, videoEl) {
      this._setupShakaPlayer(videoEl);
      await this._player.load(url);
    }
    async _unloadPlayback() {
      await this._player.unload();
    }
    _init() {
      VideoPlayer.consumer(this);
      VideoPlayer.loader(this._loadPlayback.bind(this));
      VideoPlayer.unloader(this._unloadPlayback.bind(this));
    }
    _firstActive() {
      VideoPlayer.size(1920, 1080); // Resize to desired size
      VideoPlayer.position(200, 100); // Move by 100px down and 200px to the right
      VideoPlayer.open('http://amssamples.streaming.mediaservices.windows.net/683f7e47-bd83-4427-b0a3-26a6c4547782/BigBuckBunny.ism/manifest(format=mpd-time-csf)');
    }
    _focus() {
      // Your existing code for handling focus
      // ...
      VideoPlayer.seek(0);
    }
    _unfocus() {
      // Your existing code for handling unfocus
      // ...
    }
    $videoPlayerPlaying() {
      // Your existing code for video playing event
      // ...
    }
    $videoPlayerEnded() {
      // Your existing code for video ended event
      // ...
    }
    _handleEnter() {
      // Your existing code for handling Enter key
      // ...
      VideoPlayer.playPause();
    }
  }

  class App extends Lightning.Component {
    static _template() {
      return {
        Background: {
          w: 1920,
          h: 1080,
          color: 0xfffbb03b,
          src: Utils.asset('images/background.jpg'),
          visible: true
        },
        BtnWrapper: {
          x: 50,
          y: 50,
          visible: true,
          flex: {
            direction: 'column',
            padding: 20,
            wrap: true
          },
          rect: true,
          color: 0xFF2D2D2D,
          paddingLeft: 200,
          TvButton: {
            type: HomeButton,
            buttonText: 'TV',
            iconSrc: 'images/tv.png',
            screen: 'TvScreenWrapper',
            signals: {
              enterScreen: true
            }
          },
          MoviesButton: {
            type: HomeButton,
            buttonText: 'Movies',
            iconSrc: 'images/movies.png',
            screen: 'MoviesScreenWrapper',
            signals: {
              enterScreen: true
            }
          },
          SportsButton: {
            type: HomeButton,
            buttonText: 'Sports',
            iconSrc: 'images/sports.png',
            screen: 'SportsScreenWrapper',
            signals: {
              enterScreen: true
            }
          }
        },
        TvScreenWrapper: {
          x: 50,
          y: 50,
          visible: false,
          type: AssetList,
          screen: 'TvScreenWrapper',
          signals: {
            exitScreen: true,
            playVideo: true
          },
          collision: true,
          forceZIndexContext: true
        },
        MoviesScreenWrapper: {
          x: 50,
          y: 50,
          visible: false,
          type: AssetList,
          screen: 'MoviesScreenWrapper',
          signals: {
            exitScreen: true,
            playVideo: true
          }
        },
        SportsScreenWrapper: {
          x: 50,
          y: 50,
          visible: false,
          type: AssetList,
          screen: 'SportsScreenWrapper',
          signals: {
            exitScreen: true,
            playVideo: true
          }
        },
        VideoPlayer: {
          x: 50,
          y: 50,
          w: 1200,
          visible: false,
          type: Player,
          collision: true,
          forceZIndexContext: true,
          Label: {
            y: 700,
            x: 250,
            color: 0xffff0000,
            text: {
              text: 'Press the Return/Enter key to play/pause video \nPress the Esc key to exit video player',
              fontSize: 20,
              maxLines: 3
            }
          }
        }
      };
    }
    _init() {
      this.buttonIndex = 0;
      this.prevScreen = '';
      this._setState('BtnWrapper');
    }
    playVideo(screenName) {
      this.prevScreen = screenName;
      this.tag(screenName).visible = false;
      this.tag('Background').visible = false;
      this.tag('BtnWrapper').visible = false;
      this.tag('VideoPlayer').visible = true;
      this._setState('VideoPlayer');
    }
    enterScreen(screenName) {
      this.tag('BtnWrapper').visible = false;
      this.tag('VideoPlayer').visible = false;
      this.tag('Background').visible = true;
      this.tag(screenName).visible = true;
      this._setState(screenName);
    }
    exitScreen(screenName) {
      this.tag(screenName).visible = false;
      this.tag('Background').visible = true;
      this.tag('BtnWrapper').visible = true;
      this._setState('BtnWrapper');
    }
    static _states() {
      return [class BtnWrapper extends this {
        _handleLeft() {
          if (this.buttonIndex != 0) {
            this.buttonIndex--;
          }
        }
        _handleRight() {
          if (this.buttonIndex != 2) {
            this.buttonIndex++;
          }
        }
        _getFocused() {
          return this.tag('BtnWrapper').children[this.buttonIndex];
        }
      }, class TvScreenWrapper extends this {
        _getFocused() {
          return this.tag('TvScreenWrapper');
        }
      }, class MoviesScreenWrapper extends this {
        _getFocused() {
          return this.tag('MoviesScreenWrapper');
        }
      }, class SportsScreenWrapper extends this {
        _getFocused() {
          return this.tag('SportsScreenWrapper');
        }
      }, class VideoPlayer extends this {
        _getFocused() {
          return this.tag('VideoPlayer');
        }
      }];
    }
  }

  function index () {
    return Launch(App, ...arguments);
  }

  return index;

})();

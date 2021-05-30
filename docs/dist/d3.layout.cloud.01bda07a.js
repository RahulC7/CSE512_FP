// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"js/d3.layout.cloud.js":[function(require,module,exports) {
var define;
var global = arguments[3];
function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

(function (f) {
  if ((typeof exports === "undefined" ? "undefined" : _typeof(exports)) === "object" && typeof module !== "undefined") {
    module.exports = f();
  } else if (typeof define === "function" && define.amd) {
    define([], f);
  } else {
    var g;

    if (typeof window !== "undefined") {
      g = window;
    } else if (typeof global !== "undefined") {
      g = global;
    } else if (typeof self !== "undefined") {
      g = self;
    } else {
      g = this;
    }

    g = g.d3 || (g.d3 = {});
    g = g.layout || (g.layout = {});
    g.cloud = f();
  }
})(function () {
  var define, module, exports;
  return function e(t, n, r) {
    function s(o, u) {
      if (!n[o]) {
        if (!t[o]) {
          var a = typeof require == "function" && require;
          if (!u && a) return a(o, !0);
          if (i) return i(o, !0);
          var f = new Error("Cannot find module '" + o + "'");
          throw f.code = "MODULE_NOT_FOUND", f;
        }

        var l = n[o] = {
          exports: {}
        };
        t[o][0].call(l.exports, function (e) {
          var n = t[o][1][e];
          return s(n ? n : e);
        }, l, l.exports, e, t, n, r);
      }

      return n[o].exports;
    }

    var i = typeof require == "function" && require;

    for (var o = 0; o < r.length; o++) {
      s(r[o]);
    }

    return s;
  }({
    1: [function (require, module, exports) {
      // Word cloud layout by Jason Davies, https://www.jasondavies.com/wordcloud/
      // Algorithm due to Jonathan Feinberg, http://static.mrfeinberg.com/bv_ch03.pdf
      var dispatch = require("d3-dispatch").dispatch;

      var cloudRadians = Math.PI / 180,
          cw = 1 << 11 >> 5,
          ch = 1 << 11;

      module.exports = function () {
        var size = [256, 256],
            text = cloudText,
            font = cloudFont,
            fontSize = cloudFontSize,
            fontStyle = cloudFontNormal,
            fontWeight = cloudFontNormal,
            rotate = cloudRotate,
            padding = cloudPadding,
            spiral = archimedeanSpiral,
            words = [],
            timeInterval = Infinity,
            event = dispatch("word", "end"),
            timer = null,
            random = Math.random,
            cloud = {},
            canvas = cloudCanvas;

        cloud.canvas = function (_) {
          return arguments.length ? (canvas = functor(_), cloud) : canvas;
        };

        cloud.start = function () {
          var contextAndRatio = getContext(canvas()),
              board = zeroArray((size[0] >> 5) * size[1]),
              bounds = null,
              n = words.length,
              i = -1,
              tags = [],
              data = words.map(function (d, i) {
            d.text = text.call(this, d, i);
            d.font = font.call(this, d, i);
            d.style = fontStyle.call(this, d, i);
            d.weight = fontWeight.call(this, d, i);
            d.rotate = rotate.call(this, d, i);
            d.size = ~~fontSize.call(this, d, i);
            d.padding = padding.call(this, d, i);
            return d;
          }).sort(function (a, b) {
            return b.size - a.size;
          });
          if (timer) clearInterval(timer);
          timer = setInterval(step, 0);
          step();
          return cloud;

          function step() {
            var start = Date.now();

            while (Date.now() - start < timeInterval && ++i < n && timer) {
              var d = data[i];
              d.x = size[0] * (random() + .5) >> 1;
              d.y = size[1] * (random() + .5) >> 1;
              cloudSprite(contextAndRatio, d, data, i);

              if (d.hasText && place(board, d, bounds)) {
                tags.push(d);
                event.call("word", cloud, d);
                if (bounds) cloudBounds(bounds, d);else bounds = [{
                  x: d.x + d.x0,
                  y: d.y + d.y0
                }, {
                  x: d.x + d.x1,
                  y: d.y + d.y1
                }]; // Temporary hack

                d.x -= size[0] >> 1;
                d.y -= size[1] >> 1;
              }
            }

            if (i >= n) {
              cloud.stop();
              event.call("end", cloud, tags, bounds);
            }
          }
        };

        cloud.stop = function () {
          if (timer) {
            clearInterval(timer);
            timer = null;
          }

          return cloud;
        };

        function getContext(canvas) {
          canvas.width = canvas.height = 1;
          var ratio = Math.sqrt(canvas.getContext("2d").getImageData(0, 0, 1, 1).data.length >> 2);
          canvas.width = (cw << 5) / ratio;
          canvas.height = ch / ratio;
          var context = canvas.getContext("2d");
          context.fillStyle = context.strokeStyle = "red";
          context.textAlign = "center";
          return {
            context: context,
            ratio: ratio
          };
        }

        function place(board, tag, bounds) {
          var perimeter = [{
            x: 0,
            y: 0
          }, {
            x: size[0],
            y: size[1]
          }],
              startX = tag.x,
              startY = tag.y,
              maxDelta = Math.sqrt(size[0] * size[0] + size[1] * size[1]),
              s = spiral(size),
              dt = random() < .5 ? 1 : -1,
              t = -dt,
              dxdy,
              dx,
              dy;

          while (dxdy = s(t += dt)) {
            dx = ~~dxdy[0];
            dy = ~~dxdy[1];
            if (Math.min(Math.abs(dx), Math.abs(dy)) >= maxDelta) break;
            tag.x = startX + dx;
            tag.y = startY + dy;
            if (tag.x + tag.x0 < 0 || tag.y + tag.y0 < 0 || tag.x + tag.x1 > size[0] || tag.y + tag.y1 > size[1]) continue; // TODO only check for collisions within current bounds.

            if (!bounds || !cloudCollide(tag, board, size[0])) {
              if (!bounds || collideRects(tag, bounds)) {
                var sprite = tag.sprite,
                    w = tag.width >> 5,
                    sw = size[0] >> 5,
                    lx = tag.x - (w << 4),
                    sx = lx & 0x7f,
                    msx = 32 - sx,
                    h = tag.y1 - tag.y0,
                    x = (tag.y + tag.y0) * sw + (lx >> 5),
                    last;

                for (var j = 0; j < h; j++) {
                  last = 0;

                  for (var i = 0; i <= w; i++) {
                    board[x + i] |= last << msx | (i < w ? (last = sprite[j * w + i]) >>> sx : 0);
                  }

                  x += sw;
                }

                delete tag.sprite;
                return true;
              }
            }
          }

          return false;
        }

        cloud.timeInterval = function (_) {
          return arguments.length ? (timeInterval = _ == null ? Infinity : _, cloud) : timeInterval;
        };

        cloud.words = function (_) {
          return arguments.length ? (words = _, cloud) : words;
        };

        cloud.size = function (_) {
          return arguments.length ? (size = [+_[0], +_[1]], cloud) : size;
        };

        cloud.font = function (_) {
          return arguments.length ? (font = functor(_), cloud) : font;
        };

        cloud.fontStyle = function (_) {
          return arguments.length ? (fontStyle = functor(_), cloud) : fontStyle;
        };

        cloud.fontWeight = function (_) {
          return arguments.length ? (fontWeight = functor(_), cloud) : fontWeight;
        };

        cloud.rotate = function (_) {
          return arguments.length ? (rotate = functor(_), cloud) : rotate;
        };

        cloud.text = function (_) {
          return arguments.length ? (text = functor(_), cloud) : text;
        };

        cloud.spiral = function (_) {
          return arguments.length ? (spiral = spirals[_] || _, cloud) : spiral;
        };

        cloud.fontSize = function (_) {
          return arguments.length ? (fontSize = functor(_), cloud) : fontSize;
        };

        cloud.padding = function (_) {
          return arguments.length ? (padding = functor(_), cloud) : padding;
        };

        cloud.random = function (_) {
          return arguments.length ? (random = _, cloud) : random;
        };

        cloud.on = function () {
          var value = event.on.apply(event, arguments);
          return value === event ? cloud : value;
        };

        return cloud;
      };

      function cloudText(d) {
        return d.text;
      }

      function cloudFont() {
        return "serif";
      }

      function cloudFontNormal() {
        return "normal";
      }

      function cloudFontSize(d) {
        return Math.sqrt(d.value);
      }

      function cloudRotate() {
        return (~~(Math.random() * 6) - 3) * 30;
      }

      function cloudPadding() {
        return 1;
      } // Fetches a monochrome sprite bitmap for the specified text.
      // Load in batches for speed.


      function cloudSprite(contextAndRatio, d, data, di) {
        if (d.sprite) return;
        var c = contextAndRatio.context,
            ratio = contextAndRatio.ratio;
        c.clearRect(0, 0, (cw << 5) / ratio, ch / ratio);
        var x = 0,
            y = 0,
            maxh = 0,
            n = data.length;
        --di;

        while (++di < n) {
          d = data[di];
          c.save();
          c.font = d.style + " " + d.weight + " " + ~~((d.size + 1) / ratio) + "px " + d.font;
          var w = c.measureText(d.text + "m").width * ratio,
              h = d.size << 1;

          if (d.rotate) {
            var sr = Math.sin(d.rotate * cloudRadians),
                cr = Math.cos(d.rotate * cloudRadians),
                wcr = w * cr,
                wsr = w * sr,
                hcr = h * cr,
                hsr = h * sr;
            w = Math.max(Math.abs(wcr + hsr), Math.abs(wcr - hsr)) + 0x1f >> 5 << 5;
            h = ~~Math.max(Math.abs(wsr + hcr), Math.abs(wsr - hcr));
          } else {
            w = w + 0x1f >> 5 << 5;
          }

          if (h > maxh) maxh = h;

          if (x + w >= cw << 5) {
            x = 0;
            y += maxh;
            maxh = 0;
          }

          if (y + h >= ch) break;
          c.translate((x + (w >> 1)) / ratio, (y + (h >> 1)) / ratio);
          if (d.rotate) c.rotate(d.rotate * cloudRadians);
          c.fillText(d.text, 0, 0);
          if (d.padding) c.lineWidth = 2 * d.padding, c.strokeText(d.text, 0, 0);
          c.restore();
          d.width = w;
          d.height = h;
          d.xoff = x;
          d.yoff = y;
          d.x1 = w >> 1;
          d.y1 = h >> 1;
          d.x0 = -d.x1;
          d.y0 = -d.y1;
          d.hasText = true;
          x += w;
        }

        var pixels = c.getImageData(0, 0, (cw << 5) / ratio, ch / ratio).data,
            sprite = [];

        while (--di >= 0) {
          d = data[di];
          if (!d.hasText) continue;
          var w = d.width,
              w32 = w >> 5,
              h = d.y1 - d.y0; // Zero the buffer

          for (var i = 0; i < h * w32; i++) {
            sprite[i] = 0;
          }

          x = d.xoff;
          if (x == null) return;
          y = d.yoff;
          var seen = 0,
              seenRow = -1;

          for (var j = 0; j < h; j++) {
            for (var i = 0; i < w; i++) {
              var k = w32 * j + (i >> 5),
                  m = pixels[(y + j) * (cw << 5) + (x + i) << 2] ? 1 << 31 - i % 32 : 0;
              sprite[k] |= m;
              seen |= m;
            }

            if (seen) seenRow = j;else {
              d.y0++;
              h--;
              j--;
              y++;
            }
          }

          d.y1 = d.y0 + seenRow;
          d.sprite = sprite.slice(0, (d.y1 - d.y0) * w32);
        }
      } // Use mask-based collision detection.


      function cloudCollide(tag, board, sw) {
        sw >>= 5;
        var sprite = tag.sprite,
            w = tag.width >> 5,
            lx = tag.x - (w << 4),
            sx = lx & 0x7f,
            msx = 32 - sx,
            h = tag.y1 - tag.y0,
            x = (tag.y + tag.y0) * sw + (lx >> 5),
            last;

        for (var j = 0; j < h; j++) {
          last = 0;

          for (var i = 0; i <= w; i++) {
            if ((last << msx | (i < w ? (last = sprite[j * w + i]) >>> sx : 0)) & board[x + i]) return true;
          }

          x += sw;
        }

        return false;
      }

      function cloudBounds(bounds, d) {
        var b0 = bounds[0],
            b1 = bounds[1];
        if (d.x + d.x0 < b0.x) b0.x = d.x + d.x0;
        if (d.y + d.y0 < b0.y) b0.y = d.y + d.y0;
        if (d.x + d.x1 > b1.x) b1.x = d.x + d.x1;
        if (d.y + d.y1 > b1.y) b1.y = d.y + d.y1;
      }

      function collideRects(a, b) {
        return a.x + a.x1 > b[0].x && a.x + a.x0 < b[1].x && a.y + a.y1 > b[0].y && a.y + a.y0 < b[1].y;
      }

      function archimedeanSpiral(size) {
        var e = size[0] / size[1];
        return function (t) {
          return [e * (t *= .1) * Math.cos(t), t * Math.sin(t)];
        };
      }

      function rectangularSpiral(size) {
        var dy = 4,
            dx = dy * size[0] / size[1],
            x = 0,
            y = 0;
        return function (t) {
          var sign = t < 0 ? -1 : 1; // See triangular numbers: T_n = n * (n + 1) / 2.

          switch (Math.sqrt(1 + 4 * sign * t) - sign & 3) {
            case 0:
              x += dx;
              break;

            case 1:
              y += dy;
              break;

            case 2:
              x -= dx;
              break;

            default:
              y -= dy;
              break;
          }

          return [x, y];
        };
      } // TODO reuse arrays?


      function zeroArray(n) {
        var a = [],
            i = -1;

        while (++i < n) {
          a[i] = 0;
        }

        return a;
      }

      function cloudCanvas() {
        return document.createElement("canvas");
      }

      function functor(d) {
        return typeof d === "function" ? d : function () {
          return d;
        };
      }

      var spirals = {
        archimedean: archimedeanSpiral,
        rectangular: rectangularSpiral
      };
    }, {
      "d3-dispatch": 2
    }],
    2: [function (require, module, exports) {
      // https://d3js.org/d3-dispatch/ Version 1.0.3. Copyright 2017 Mike Bostock.
      (function (global, factory) {
        _typeof(exports) === 'object' && typeof module !== 'undefined' ? factory(exports) : typeof define === 'function' && define.amd ? define(['exports'], factory) : factory(global.d3 = global.d3 || {});
      })(this, function (exports) {
        'use strict';

        var noop = {
          value: function value() {}
        };

        function dispatch() {
          for (var i = 0, n = arguments.length, _ = {}, t; i < n; ++i) {
            if (!(t = arguments[i] + "") || t in _) throw new Error("illegal type: " + t);
            _[t] = [];
          }

          return new Dispatch(_);
        }

        function Dispatch(_) {
          this._ = _;
        }

        function parseTypenames(typenames, types) {
          return typenames.trim().split(/^|\s+/).map(function (t) {
            var name = "",
                i = t.indexOf(".");
            if (i >= 0) name = t.slice(i + 1), t = t.slice(0, i);
            if (t && !types.hasOwnProperty(t)) throw new Error("unknown type: " + t);
            return {
              type: t,
              name: name
            };
          });
        }

        Dispatch.prototype = dispatch.prototype = {
          constructor: Dispatch,
          on: function on(typename, callback) {
            var _ = this._,
                T = parseTypenames(typename + "", _),
                t,
                i = -1,
                n = T.length; // If no callback was specified, return the callback of the given type and name.

            if (arguments.length < 2) {
              while (++i < n) {
                if ((t = (typename = T[i]).type) && (t = get(_[t], typename.name))) return t;
              }

              return;
            } // If a type was specified, set the callback for the given type and name.
            // Otherwise, if a null callback was specified, remove callbacks of the given name.


            if (callback != null && typeof callback !== "function") throw new Error("invalid callback: " + callback);

            while (++i < n) {
              if (t = (typename = T[i]).type) _[t] = set(_[t], typename.name, callback);else if (callback == null) for (t in _) {
                _[t] = set(_[t], typename.name, null);
              }
            }

            return this;
          },
          copy: function copy() {
            var copy = {},
                _ = this._;

            for (var t in _) {
              copy[t] = _[t].slice();
            }

            return new Dispatch(copy);
          },
          call: function call(type, that) {
            if ((n = arguments.length - 2) > 0) for (var args = new Array(n), i = 0, n, t; i < n; ++i) {
              args[i] = arguments[i + 2];
            }
            if (!this._.hasOwnProperty(type)) throw new Error("unknown type: " + type);

            for (t = this._[type], i = 0, n = t.length; i < n; ++i) {
              t[i].value.apply(that, args);
            }
          },
          apply: function apply(type, that, args) {
            if (!this._.hasOwnProperty(type)) throw new Error("unknown type: " + type);

            for (var t = this._[type], i = 0, n = t.length; i < n; ++i) {
              t[i].value.apply(that, args);
            }
          }
        };

        function get(type, name) {
          for (var i = 0, n = type.length, c; i < n; ++i) {
            if ((c = type[i]).name === name) {
              return c.value;
            }
          }
        }

        function set(type, name, callback) {
          for (var i = 0, n = type.length; i < n; ++i) {
            if (type[i].name === name) {
              type[i] = noop, type = type.slice(0, i).concat(type.slice(i + 1));
              break;
            }
          }

          if (callback != null) type.push({
            name: name,
            value: callback
          });
          return type;
        }

        exports.dispatch = dispatch;
        Object.defineProperty(exports, '__esModule', {
          value: true
        });
      });
    }, {}]
  }, {}, [1])(1);
});
},{}],"../../../.nvm/versions/node/v15.5.0/lib/node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}

module.bundle.Module = Module;
var checkedAssets, assetsToAccept;
var parent = module.bundle.parent;

if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "50439" + '/');

  ws.onmessage = function (event) {
    checkedAssets = {};
    assetsToAccept = [];
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      var handled = false;
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          var didAccept = hmrAcceptCheck(global.parcelRequire, asset.id);

          if (didAccept) {
            handled = true;
          }
        }
      }); // Enable HMR for CSS by default.

      handled = handled || data.assets.every(function (asset) {
        return asset.type === 'css' && asset.generated.js;
      });

      if (handled) {
        console.clear();
        data.assets.forEach(function (asset) {
          hmrApply(global.parcelRequire, asset);
        });
        assetsToAccept.forEach(function (v) {
          hmrAcceptRun(v[0], v[1]);
        });
      } else if (location.reload) {
        // `location` global exists in a web worker context but lacks `.reload()` function.
        location.reload();
      }
    }

    if (data.type === 'reload') {
      ws.close();

      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);

  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID; // html encode message and stack trace

  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];

      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAcceptCheck(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAcceptCheck(bundle.parent, id);
  }

  if (checkedAssets[id]) {
    return;
  }

  checkedAssets[id] = true;
  var cached = bundle.cache[id];
  assetsToAccept.push([bundle, id]);

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAcceptCheck(global.parcelRequire, id);
  });
}

function hmrAcceptRun(bundle, id) {
  var cached = bundle.cache[id];
  bundle.hotData = {};

  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });

    return true;
  }
}
},{}]},{},["../../../.nvm/versions/node/v15.5.0/lib/node_modules/parcel-bundler/src/builtins/hmr-runtime.js","js/d3.layout.cloud.js"], null)
//# sourceMappingURL=/d3.layout.cloud.01bda07a.js.map
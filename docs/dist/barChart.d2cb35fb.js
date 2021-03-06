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
})({"js/visualizations/barChart.js":[function(require,module,exports) {
function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

// -------------------- DATA GENERATION PART --------------------
function createBarChartData() {
  var data = [];

  var _iterator = _createForOfIteratorHelper(paper_to_author),
      _step;

  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var paper = _step.value;
      data.push({
        name: paper.title.slice(0, 10),
        value: paper.n_citation,
        url: paper.url
      });
    } // for (let paperId of author_to_papers[last_clicked]) {
    //     const p = paper_to_authors[paperId];
    //     if (true
    //         // p.year >= minYear &&
    //         // p.year <= maxYear &&
    //         // p.numCitations >= minCitations &&
    //         // p.numCitations <= maxCitations
    //     ) {
    //         data.push({ name: p.title, value: p.numCitations });
    //     }
    // }

  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }

  data.sort(function (a, b) {
    return a.value < b.value ? 1 : -1;
  }); //let data = [{name: "Dhruv Yadav", value: 42, url: 'http://aops.com'}, {name: "Rahul Chandra", value: 30, url: 'http://google.com'}];

  return data.slice(0, Math.min(data.length, 10));
}

function createCollaboratorData() {
  var authors = new Map();

  var _iterator2 = _createForOfIteratorHelper(paper_to_author),
      _step2;

  try {
    for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
      var paper = _step2.value;
      var cur_authors = paper.authors;
      var cur_citations = paper.n_citation;

      for (var i = 0; i < cur_authors.length; i++) {
        var author = cur_authors[i];
        var name = author.name;

        if (authors.has(name)) {
          authors.set(name, authors.get(name) + cur_citations);
        } else {
          authors.set(name, cur_citations);
        }
      }
    }
  } catch (err) {
    _iterator2.e(err);
  } finally {
    _iterator2.f();
  }

  var data = [];
  authors.forEach(function (val, key) {
    data.push({
      name: key,
      value: val
    });
  });
  data.sort(function (a, b) {
    return a.value < b.value ? 1 : -1;
  });
  return data.slice(1, Math.min(data.length, 11));
} // -------------------- VISUALIZATION PART --------------------


var updateBarChart = function updateBarChart() {};

function createBarChart(width, height, source, data_generator, paper) {
  var fontFamily = "Lato";
  var fontSize = 60;
  var barHeight = 75;
  var svg = d3.select(source).append("svg").attr("viewBox", [0, 0, width, height]);

  function update() {
    // TODO: add range slider support
    var data = data_generator();
    console.log(data);
    var margin = {
      top: 80,
      right: 20,
      bottom: 10,
      left: 350
    };
    var height = Math.ceil((data.length + 0.1) * barHeight) + margin.top + margin.bottom;
    svg.attr("viewBox", [0, 0, width, height]);
    svg.selectAll("g").remove();
    var x = d3.scaleLinear().domain([0, d3.max(data, function (d) {
      return d.value;
    })]).range([margin.left, width - margin.right]);
    var y = d3.scaleBand().domain(d3.range(data.length)).rangeRound([margin.top, height - margin.bottom]).padding(0.1);
    var format = x.tickFormat(20, data.format);

    if (paper) {
      svg.append("g").selectAll("a").data(data).join("a").attr("xlink:href", function (d) {
        return d.url;
      }).append("rect").attr("fill", "steelblue").attr("x", x(0)).attr("y", function (d, i) {
        return y(i);
      }).attr("width", function (d) {
        return x(d.value) - x(0);
      }).attr("height", y.bandwidth());
    } else {
      svg.append("g").selectAll("a").data(data).join("a").attr("xlink:href", function (d) {
        return "https://letmegooglethat.com/?q=" + d.name;
      }).append("rect").attr("fill", "steelblue").attr("x", x(0)).attr("y", function (d, i) {
        return y(i);
      }).attr("width", function (d) {
        return x(d.value) - x(0);
      }).attr("height", y.bandwidth());
    }

    svg.append("g").attr("fill", "white").attr("text-anchor", "end").attr("font-family", fontFamily).attr("font-size", fontSize).selectAll("text").data(data).join("text").attr("x", function (d) {
      return x(d.value);
    }).attr("y", function (d, i) {
      return y(i) + y.bandwidth() / 2;
    }).attr("dy", "0.35em").attr("dx", -4).text(function (d) {
      return format(d.value);
    }).call(function (text) {
      return text.filter(function (d) {
        return x(d.value) - x(0) < 20;
      }) // short bars
      .attr("dx", +4).attr("fill", "black").attr("text-anchor", "start");
    });

    var xAxis = function xAxis(g) {
      return g.attr("transform", "translate(0,".concat(margin.top + 8, ")")).call(d3.axisTop(x).ticks(width / 200, data.format).tickSize(25)).call(function (g) {
        return g.select(".domain").remove();
      });
    };

    var yAxis = function yAxis(g) {
      return g.attr("transform", "translate(".concat(margin.left, ",0)")).call(d3.axisLeft(y).tickFormat(function (i) {
        return data[i].name;
      }).tickSize(25).tickSizeOuter(0));
    };

    svg.append("g").call(xAxis).style("font-size", "35px");
    svg.append("g").call(yAxis).style("font-size", "45px");
  }

  console.log(svg);
  return Object.assign(svg.node(), {
    update: update
  });
}
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
      console.log('[parcel] ??? Error resolved');
      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] ????  ' + data.error.message + '\n' + data.error.stack);
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
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">????</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
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
},{}]},{},["../../../.nvm/versions/node/v15.5.0/lib/node_modules/parcel-bundler/src/builtins/hmr-runtime.js","js/visualizations/barChart.js"], null)
//# sourceMappingURL=/barChart.d2cb35fb.js.map
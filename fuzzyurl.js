(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Fuzzyurl = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var defaultFuzzyurl = {
  protocol: null,
  username: null,
  password: null,
  hostname: null,
  port: null,
  path: null,
  query: null,
  fragment: null
};
var fields = Object.keys(defaultFuzzyurl);

/**
 * Creates a Fuzzyurl object with the given parameter values.  Valid
 * `params` keys are: `protocol`, `username`, `password`, `hostname`,
 * `port`, `path`, `query`, and `fragment`; all default to null.
 *
 * @param {object} params Parameter values.
 *
 */
function Fuzzyurl(params) {
  var ps = Object.assign({}, defaultFuzzyurl, params || {});
  for (var p in ps) {
    if (defaultFuzzyurl.hasOwnProperty(p)) this[p] = ps[p];else throw new Error('Bad Fuzzyurl parameter: ' + p);
  }
};

Fuzzyurl.prototype.equals = function (fu) {
  var _this = this;

  var equal = true;
  fields.forEach(function (f) {
    if (_this[f] != fu[f]) equal = false;
  });
  return equal;
};

module.exports = Fuzzyurl;

},{}],2:[function(require,module,exports){
'use strict';

function _typeof(obj) { return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj; }

var Fuzzyurl = require("./constructor");
var Strings = Fuzzyurl.Strings = require("./strings");
var Match = Fuzzyurl.Match = require("./match");
var Protocols = Fuzzyurl.Protocols = require("./protocols");

var maskDefaults = {
  protocol: "*", username: "*", password: "*", hostname: "*",
  port: "*", path: "*", query: "*", fragment: "*"
};
Fuzzyurl.mask = function mask(params) {
  var fu;
  if (typeof params == "string") {
    fu = Fuzzyurl.fromString(params);
  } else if (!params) {
    fu = {};
  } else if ((typeof params === "undefined" ? "undefined" : _typeof(params)) == "object") {
    fu = params;
  } else {
    throw new Error("params must be string, object, or null");
  }

  var m = new Fuzzyurl(maskDefaults);
  Object.keys(fu).forEach(function (k) {
    if (fu[k]) m[k] = fu[k];
  });
  return m;
};

Fuzzyurl.toString = function toString(fuzzyurl) {
  return Strings.toString(fuzzyurl);
};

Fuzzyurl.prototype.toString = function () {
  return Strings.toString(this);
};

Fuzzyurl.fromString = function fromString(string) {
  return Strings.fromString(string);
};

Fuzzyurl.match = function match(mask, url) {
  var m = typeof mask === "string" ? Strings.fromString(mask) : mask;
  var u = typeof url === "string" ? Strings.fromString(url) : url;
  return Match.match(m, u);
};

Fuzzyurl.matches = function matches(mask, url) {
  var m = typeof mask === "string" ? Strings.fromString(mask) : mask;
  var u = typeof url === "string" ? Strings.fromString(url) : url;
  return Match.matches(m, u);
};

Fuzzyurl.matchScores = function matchScores(mask, url) {
  var m = typeof mask === "string" ? Strings.fromString(mask) : mask;
  var u = typeof url === "string" ? Strings.fromString(url) : url;
  return Match.matchScores(m, u);
};

Fuzzyurl.bestMatch = function bestMatch(masks, url) {
  var ms = masks.map(function (m) {
    return typeof m === "string" ? Strings.fromString(m) : m;
  });
  var u = typeof url === "string" ? Strings.fromString(url) : url;
  return Match.bestMatch(ms, u);
};

module.exports = Fuzzyurl;

},{"./constructor":1,"./match":3,"./protocols":4,"./strings":5}],3:[function(require,module,exports){
'use strict';

function _typeof(obj) { return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj; }

var Protocols = require('./protocols');

/**
 * If `mask` (which may contain * wildcards) matches `url` (which may not),
 * returns an integer representing how closely they match (higher is closer).
 * If `mask` does not match `url`, returns null.
 *
 * @param {Fuzzyurl} mask  Fuzzyurl mask to match with
 * @param {Fuzzyurl} url   Fuzzyurl URL to match
 * @returns {integer|null} total match score, or null if no match
 *
 */
function match(mask, url) {
  var scores = matchScores(mask, url);
  var scoreValues = Object.keys(scores).map(function (k) {
    return scores[k];
  });
  if (scoreValues.indexOf(null) >= 0) return null;
  return scoreValues.reduce(function (x, y) {
    return x + y;
  });
}

/**
 * If `mask` (which may contain * wildcards) matches `url` (which may not),
 * returns true; otherwise returns false.
 *
 * @param {Fuzzyurl} mask  Fuzzyurl mask to match with
 * @param {Fuzzyurl} url   Fuzzyurl URL to match
 * @returns {boolean} true if mask matches url, false otherwise
 */
function matches(mask, url) {
  return match(mask, url) !== null;
}

/**
 * Returns a Fuzzyurl-like object containing values representing how well
 * different parts of `mask` and `url` match.  Values are integers for
 * matches or null for no match; higher integers indicate a better match.
 *
 * @param {Fuzzyurl} mask  Fuzzyurl mask to match with
 * @param {Fuzzyurl} url   Fuzzyurl URL to match
 * @returns {Fuzzyurl} Fuzzyurl-like object containing match scores
 */
function matchScores(mask, url) {
  if ("object" !== (typeof mask === 'undefined' ? 'undefined' : _typeof(mask))) throw new Error('mask must be a Fuzzyurl object');
  if ("object" !== (typeof url === 'undefined' ? 'undefined' : _typeof(url))) throw new Error('url must be a Fuzzyurl object');

  // infer protocol from port, and vice versa
  var urlProtocol = url.protocol || Protocols.getProtocol(url.port);
  var urlPort = url.port || Protocols.getPort(url.protocol);

  return {
    protocol: fuzzyMatch(mask.protocol, urlProtocol),
    username: fuzzyMatch(mask.username, url.username),
    password: fuzzyMatch(mask.password, url.password),
    hostname: fuzzyMatch(mask.hostname, url.hostname),
    port: fuzzyMatch(mask.port, urlPort),
    path: fuzzyMatch(mask.path, url.path),
    query: fuzzyMatch(mask.query, url.query),
    fragment: fuzzyMatch(mask.fragment, url.fragment)
  };
}

/**
 * If `mask` (which may contain * wildcards) matches `url` (which may not),
 * returns 1 if `mask` and `url` match perfectly, 0 if `mask` and `url`
 * are a wildcard match, or null otherwise.
 *
 * Wildcard language:
 *
 *     *              matches anything
 *     foo/*          matches "foo/" and "foo/bar/baz" but not "foo"
 *     foo/**         matches "foo/" and "foo/bar/baz" and "foo"
 *     *.example.com  matches "api.v1.example.com" but not "example.com"
 *     **.example.com matches "api.v1.example.com" and "example.com"
 *
 * Any other form is treated as a literal match.
 *
 * @param {string} mask  String mask to match with (may contain wildcards).
 * @param {string} value String value to match.
 * @returns {integer|null} 1 for perfect match, 0 for wildcard match, null otherwise.
 */
function fuzzyMatch(mask, value) {
  if (mask === "*") return 0;
  if (mask == value) return 1;
  if (!mask || !value) return null;

  if (mask.indexOf("**.") == 0) {
    var maskValue = mask.slice(3);
    if (value.endsWith('.' + maskValue)) return 0;
    if (maskValue === value) return 0;
    return null;
  }
  if (mask.indexOf("*") == 0) {
    if (value.endsWith(mask.slice(1))) return 0;
    return null;
  }

  // trailing wildcards are implemented more easily in reverse
  var revMask = strReverse(mask);
  var revValue = strReverse(value);

  if (revMask.indexOf("**/") == 0) {
    var revMaskValue = revMask.slice(3);
    if (revValue.endsWith('/' + revMaskValue)) return 0;
    if (revValue === revMaskValue) return 0;
    return null;
  }
  if (revMask.indexOf("*") == 0) {
    if (revValue.endsWith(revMask.slice(1))) return 0;
    return null;
  }

  return null;
}

// this implementation is from the internet and it is fast
function strReverse(str) {
  var rev = '';
  for (var i = str.length - 1; i >= 0; i--) {
    rev += str[i];
  }return rev;
}

/**
 * From a list of Fuzzyurl `masks`, returns the index of the one which best
 * matches `url`.  Returns null if none of `masks` match.
 *
 * @param {array} masks  Array of Fuzzyurl URL masks to match with.
 * @param {Fuzzyurl} url Fuzzyurl URL to match.
 * @returns {integer|null} Index of best matching mask, or null if none match.
 */
function bestMatch(masks, url) {
  if ("object" !== (typeof url === 'undefined' ? 'undefined' : _typeof(url))) throw new Error('url must be a Fuzzyurl object');

  var bestMask = null;
  var bestScore = -1;
  for (var i in masks) {
    var m = masks[i];
    if ("object" !== (typeof m === 'undefined' ? 'undefined' : _typeof(m))) throw new Error('Got a non-Fuzzyurl mask: ' + m);
    var score = match(m, url);
    if (score && score > bestScore) {
      bestScore = score;
      bestMask = parseInt(i);
    }
  }
  return bestMask;
}

module.exports = { match: match, matches: matches, matchScores: matchScores, fuzzyMatch: fuzzyMatch, bestMatch: bestMatch };

},{"./protocols":4}],4:[function(require,module,exports){
'use strict';

var portsByProtocol = {
  ssh: "22",
  http: "80",
  https: "443"
};

var protocolsByPort = {
  22: "ssh",
  80: "http",
  443: "https"
};

/**
 * Given a protocol, returns the (string-formatted) port number, or null
 * if not found.
 *
 * @param {string|null} protocol
 * @returns {string|null} port
 */
function getPort(protocol) {
  if (!protocol) return null;
  var baseProtocol = protocol.split("+").pop();
  return portsByProtocol[baseProtocol];
}

/**
 * Given a port number (string or integer), returns the protocol string,
 * or null if not found.
 *
 * @param {string|integer} port
 * @returns {string|null} protocol
 */
function getProtocol(port) {
  if (!port) return null;
  return protocolsByPort[port.toString()];
}

module.exports = { getPort: getPort, getProtocol: getProtocol };

},{}],5:[function(require,module,exports){
'use strict';

var Fuzzyurl = require('./constructor');

// This regex is a lot more readable in the Elixir and Ruby versions.
var regex = new RegExp('^' + '(?:(\\*|[a-zA-Z][A-Za-z+.-]+)://)?' + // m[1] is protocol
'(?:(\\*|[a-zA-Z0-9%_.!~*\'();&=+$,-]+)' + // m[2] is username
'(?::(\\*|[a-zA-Z0-9%_.!~*\'();&=+$,-]*))?' + // m[3] is password
'@)?' + '([a-zA-Z0-9\\.\\*\\-]+?)?' + // m[4] is hostname
'(?::(\\*|\\d+))?' + // m[5] is port
'(/[^\\?\\#]*)?' + // m[6] is path
'(?:\\?([^\\#]*))?' + // m[7] is query
'(?:\\#(.*))?' + // m[8] is fragment
'$');

function fromString(str) {
  if (typeof str !== "string") return null;
  var m = regex.exec(str, regex);
  if (!m) return null;
  var fu = new Fuzzyurl({
    protocol: m[1],
    username: m[2],
    password: m[3],
    hostname: m[4],
    port: m[5],
    path: m[6],
    query: m[7],
    fragment: m[8]
  });
  return fu;
}

function toString(fuzzyurl) {
  var out = '',
      f = fuzzyurl;
  if (f.protocol) out += f.protocol + '://';
  if (f.username) out += f.username;
  if (f.password) out += ':' + f.password;
  if (f.username) out += '@';
  if (f.hostname) out += f.hostname;
  if (f.port) out += ':' + f.port;
  if (f.path) out += f.path;
  if (f.query) out += '?' + f.query;
  if (f.fragment) out += '#' + f.fragment;
  return out;
}

module.exports = { fromString: fromString, toString: toString };

},{"./constructor":1}]},{},[2])(2)
});
//# sourceMappingURL=fuzzyurl.js.map

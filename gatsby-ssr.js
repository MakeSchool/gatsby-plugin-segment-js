"use strict";

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.onRenderBody = function (_ref, pluginOptions) {
  var setHeadComponents = _ref.setHeadComponents;
  var trackPage = pluginOptions.trackPage,
      prodKey = pluginOptions.prodKey,
      devKey = pluginOptions.devKey,
      _pluginOptions$host = pluginOptions.host,
      host = _pluginOptions$host === undefined ? "https://cdn.segment.io" : _pluginOptions$host,
      delayLoad = pluginOptions.delayLoad,
      delayLoadTime = pluginOptions.delayLoadTime,
      manualLoad = pluginOptions.manualLoad;

  if (!prodKey || prodKey.length < 10) console.error("segment prodKey must be at least 10 char in length");

  if (devKey && devKey.length < 10) console.error("if present, devKey must be at least 10 char in length");

  var writeKey = process.env.NODE_ENV === "production" ? prodKey : devKey;

  var includeTrackPage = !trackPage ? "" : "analytics.page();";

  var snippet = "!function(){var analytics=window.analytics=window.analytics||[];if(!analytics.initialize)if(analytics.invoked)window.console&&console.error&&console.error(\"Segment snippet included twice.\");else{analytics.invoked=!0;analytics.methods=[\"trackSubmit\",\"trackClick\",\"trackLink\",\"trackForm\",\"pageview\",\"identify\",\"reset\",\"group\",\"track\",\"ready\",\"alias\",\"debug\",\"page\",\"once\",\"off\",\"on\",\"addSourceMiddleware\",\"addIntegrationMiddleware\",\"setAnonymousId\",\"addDestinationMiddleware\"];analytics.factory=function(e){return function(){var t=Array.prototype.slice.call(arguments);t.unshift(e);analytics.push(t);return analytics}};for(var e=0;e<analytics.methods.length;e++){var key=analytics.methods[e];analytics[key]=analytics.factory(key)}analytics.load=function(key,e){var t=document.createElement(\"script\");t.type=\"text/javascript\";t.async=!0;t.src=\"https://cdn.segment.com/analytics.js/v1/\" + key + \"/analytics.min.js\";var n=document.getElementsByTagName(\"script\")[0];n.parentNode.insertBefore(t,n);analytics._loadOptions=e};analytics.SNIPPET_VERSION=\"4.13.1\";\n  " + (delayLoad || manualLoad ? "" : "analytics.load('" + writeKey + "');") + "\n  }}();";

  var delayedLoader = "\n      window.segmentSnippetLoaded = false;\n      window.segmentSnippetLoading = false;\n\n      window.segmentSnippetLoader = function (customDelay, callback) {\n        if (!window.segmentSnippetLoaded && !window.segmentSnippetLoading) {\n          if (!customDelay) { window.segmentSnippetLoading = true; }\n\n          function loader() {\n            if (window.segmentSnippetLoaded) { return; }\n            window.analytics.load('" + writeKey + "');\n            window.segmentSnippetLoading = false;\n            window.segmentSnippetLoaded = true;\n            if(callback) {callback()}\n          };\n\n          setTimeout(\n            function () {\n              \"requestIdleCallback\" in window\n                ? requestIdleCallback(function () {loader()})\n                : loader();\n            },\n            customDelay ? " + delayLoadTime + " || 1000 : 1000\n          );\n        }\n      }\n      window.addEventListener('load',function () {window.segmentSnippetLoader(true)}, { once: true });\n      window.addEventListener('scroll',function () {window.segmentSnippetLoader(false)}, { once: true });\n      window.addEventListener('mousedown',function () {window.segmentSnippetLoader(false)}, { once: true });\n      window.addEventListener('touchstart',function () {window.segmentSnippetLoader(false)}, { once: true });\n    ";

  var snippetToUse = "\n      " + (delayLoad && !manualLoad ? delayedLoader : "") + "\n      " + snippet + "\n    ";

  if (writeKey) {
    setHeadComponents([_react2.default.createElement("script", {
      key: "plugin-segment",
      dangerouslySetInnerHTML: { __html: snippetToUse }
    })]);
  }
};
import React from "react";

exports.onRenderBody = ({ setHeadComponents }, pluginOptions) => {
  const {
    trackPage,
    prodKey,
    devKey,
    host = "https://cdn.segment.io",
    delayLoad,
    delayLoadTime,
    manualLoad,
  } = pluginOptions;

  // ensures Segment write key is present
  if (!prodKey || prodKey.length < 10)
    console.error("segment prodKey must be at least 10 char in length");

  // if dev key is present, ensures it is at least 10 car in length
  if (devKey && devKey.length < 10)
    console.error("if present, devKey must be at least 10 char in length");

  // use prod write key when in prod env, else use dev write key
  // note below, snippet wont render unless writeKey is truthy
  const writeKey = process.env.NODE_ENV === "production" ? prodKey : devKey;

  // if trackPage option is falsy (undefined or false), remove analytics.page(), else keep it in by default
  // NOTE: do not remove per https://github.com/benjaminhoffman/gatsby-plugin-segment-js/pull/18
  const includeTrackPage = !trackPage ? "" : "analytics.page();";

  // Segment's minified snippet (version 4.13.1)
  const snippet = `!function(){var analytics=window.analytics=window.analytics||[];if(!analytics.initialize)if(analytics.invoked)window.console&&console.error&&console.error("Segment snippet included twice.");else{analytics.invoked=!0;analytics.methods=["trackSubmit","trackClick","trackLink","trackForm","pageview","identify","reset","group","track","ready","alias","debug","page","once","off","on","addSourceMiddleware","addIntegrationMiddleware","setAnonymousId","addDestinationMiddleware"];analytics.factory=function(e){return function(){var t=Array.prototype.slice.call(arguments);t.unshift(e);analytics.push(t);return analytics}};for(var e=0;e<analytics.methods.length;e++){var key=analytics.methods[e];analytics[key]=analytics.factory(key)}analytics.load=function(key,e){var t=document.createElement("script");t.type="text/javascript";t.async=!0;t.src="https://cdn.segment.com/analytics.js/v1/" + key + "/analytics.min.js";var n=document.getElementsByTagName("script")[0];n.parentNode.insertBefore(t,n);analytics._loadOptions=e};analytics.SNIPPET_VERSION="4.13.1";
  ${delayLoad || manualLoad ? `` : `analytics.load('${writeKey}');` }
  }}();`;

  const delayedLoader = `
      window.segmentSnippetLoaded = false;
      window.segmentSnippetLoading = false;

      window.segmentSnippetLoader = function (customDelay, callback) {
        if (!window.segmentSnippetLoaded && !window.segmentSnippetLoading) {
          if (!customDelay) { window.segmentSnippetLoading = true; }

          function loader() {
            if (window.segmentSnippetLoaded) { return; }
            window.analytics.load('${writeKey}');
            window.segmentSnippetLoading = false;
            window.segmentSnippetLoaded = true;
            if(callback) {callback()}
          };

          setTimeout(
            function () {
              "requestIdleCallback" in window
                ? requestIdleCallback(function () {loader()})
                : loader();
            },
            customDelay ? ${delayLoadTime} || 1000 : 1000
          );
        }
      }
      window.addEventListener('load',function () {window.segmentSnippetLoader(true)}, { once: true });
      window.addEventListener('scroll',function () {window.segmentSnippetLoader(false)}, { once: true });
      window.addEventListener('mousedown',function () {window.segmentSnippetLoader(false)}, { once: true });
      window.addEventListener('touchstart',function () {window.segmentSnippetLoader(false)}, { once: true });
    `;

  // if `delayLoad` option is true, use the delayed loader
  const snippetToUse = `
      ${delayLoad && !manualLoad ? delayedLoader : ""}
      ${snippet}
    `;

  // only render snippet if write key exists
  if (writeKey) {
    setHeadComponents([
      <script
        key="plugin-segment"
        dangerouslySetInnerHTML={{ __html: snippetToUse }}
      />,
    ]);
  }
};

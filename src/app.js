/* jshint browser: true */
/* globals chrome:false */

/**
 * Load the content scripts directly into GitHub. (See the "Architecture" section in the README for why.)
 */
var script = document.createElement('script');
script.setAttribute('src', chrome.extension.getURL('src/content.js'));

document.head.appendChild(script);

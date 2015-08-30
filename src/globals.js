/* jshint browser: true */
/* globals chrome:false */

/**
 * Load global variables to be used by the extension.
 */
var globals = {
  alertSoundUrl: chrome.extension.getURL('assets/Basso.wav')
};

var script = document.createElement('script');
script.innerHTML = 'GPLUSPLUS = ' + JSON.stringify(globals) + ';';

document.head.appendChild(script);

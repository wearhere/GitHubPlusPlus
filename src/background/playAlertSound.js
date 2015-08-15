/**
 * Plays an alert sound.
 *
 * We do this in the background so that we can use a local audio file.
 */
chrome.runtime.onMessage.addListener(function(request) {
  if (request.method !== 'playAlertSound') return;

  new Audio('assets/Basso.wav').play();
});
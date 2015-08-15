(function() {
  var prMatch = window.location.href.match(/pull\/\d+/);
  if (!prMatch) return;

  var prRef = prMatch[0];

  var diffTab = document.querySelector('.js-pull-request-tab[href$="' + prRef + '/files"]');
  if (!diffTab) {
    console.error('Could not find diff tab');
    return;
  }

  var IGNORE_WHITESPACE_BUTTON_CLASS = 'js-gplusplus-ignore-whitespace';

  var ignoreWhitespaceButton = document.createElement('button');
  ignoreWhitespaceButton.classList.add(IGNORE_WHITESPACE_BUTTON_CLASS);
  ignoreWhitespaceButton.innerText = "Ignore Whitespace";

  diffTab.appendChild(ignoreWhitespaceButton);
  diffTab.addEventListener('click', function(e) {
    if (!e.target.closest('.' + IGNORE_WHITESPACE_BUTTON_CLASS)) return;

    e.preventDefault();
    e.stopPropagation();
    window.location.href = window.location.href.replace(/(pull\/\d+).*/, '$1/files?w=1');
  }, true /* capture */);
})();
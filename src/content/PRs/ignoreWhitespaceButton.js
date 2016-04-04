/**
 * Adds a button to PR pages to load the diff with the ignore whitespace button set.
 */
Router.on('start:pr-files', function(prRef) {
  // When opening a PR from the PR list, GitHub will take a moment to load the PR _after_ already
  // having changed the location.
  ElementUtils.waitForElement('.tabnav-tab.selected[href$="' + prRef + '/files"]', 3 * 1000)
    .done(function(diffTab) {
      var IGNORE_WHITESPACE_BUTTON_CLASS = 'js-gplusplus-ignore-whitespace';

      var ignoreWhitespaceButton = $('<button>')
        .addClass(IGNORE_WHITESPACE_BUTTON_CLASS)
        .text('Ignore Whitespace');

      diffTab.append(ignoreWhitespaceButton);

      diffTab[0].parentElement.addEventListener('click', function(e) {
        if (!e.target.closest('.' + IGNORE_WHITESPACE_BUTTON_CLASS)) return;

        e.preventDefault();
        e.stopPropagation();
        window.location.href = window.location.href.replace(/(pull\/\d+).*/, '$1/files?w=1');
      }, true /* capture */ );
    })
    .fail(function() {
      console.error('Could not find diff tab');
    });
});

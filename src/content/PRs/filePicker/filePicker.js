/**
 * Adds a Sublime-Text style quick-open file browser to PRs--using GitHub's own file picker!
 */
(function() {
  var keyPressListener;
  var prContent;
  var filePicker;

  Router.on('start:pr-files', function(prRef) {
    var files;

    // When opening a PR from the PR list, GitHub will take a moment to load the PR _after_ already
    // having changed the location.
    ElementUtils.waitForElement('.content', 3 * 1000)
      .done(function(fileList) {
        files = fileList.find('li > a').toArray().map(function(fileLink) {
          return {
            href: fileLink.href,
            name: fileLink.innerText
          };
        });

        keyPressListener = function(e) {
          // Ignore typing in comments.
          if ($(e.target).closest('input, textarea, [contenteditable]').length) return;
          if (e.keyCode !== 116 /* t */) return;
          if (filePicker) return;

          // Prevent the default not because GitHub has anything registered to this--it doesn't--
          // but so the 't' doesn't get entered into the file picker as we focus below.
          e.preventDefault();
          showFilePicker();
        };
        document.addEventListener('keypress', keyPressListener);
      })
      .fail(function() {
        console.error('Could not load files list');
      });

    function showFilePicker() {
      if (filePicker) return;

      filePicker = Templates.filePicker({
        prRef: prRef,
      });

      prContent = $('#js-repo-pjax-container').contents().hide();
      $('#js-repo-pjax-container').prepend(filePicker);

      filePicker.find('.js-tree-finder-results').on('mousedown', '.js-navigation-item', function(e) {
        e.preventDefault();
        e.stopImmediatePropagation();

        hideFilePicker();
        var fileHref = $(e.currentTarget).find('a').attr('href');
        window.location.hash = fileHref.slice(fileHref.indexOf('#'));
      });

      filePicker.find('.js-gplusplus-tree-finder-field')
        .on('input', renderResults)
        .on('blur', hideFilePicker)
        .on('keydown', function(e) {
          if (e.keyCode === 27 /* escape */) {
            hideFilePicker();
          } else if (e.keyCode === 13 /* enter */) {
            var selectedFile = filePicker.find('.navigation-focus');
            if (!selectedFile.length) return;

            // The tree finder actually handles navigation--but by resetting the full href, which
            // will a.) be unnecessarily disruptive b.) ironically not work, since the diff view
            // doesn't jump to anchors on load.
            e.stopImmediatePropagation();
            hideFilePicker();
            var fileHref = selectedFile.find('a').attr('href');
            window.location.hash = fileHref.slice(fileHref.indexOf('#'));
          }
        })
        .focus();

      renderResults();
    }

    function renderResults() {
      var input = $('.js-gplusplus-tree-finder-field').val().toLowerCase();

      var matchingFiles = input ? fuzzyMatch(files, input) : files;

      $('.js-tree-finder-results').html(Templates.filePickerResults(matchingFiles));

      if (_.size(matchingFiles) === 1) {
        // Pre-select the first file so that the user can jump to it by hitting enter.
        $('.js-tree-finder-results').children().first().addClass('navigation-focus');
      }
    }

    // Sublime Text's file matching algorithm, courtesy of
    // https://www.quora.com/How-is-the-fuzzy-search-algorithm-in-Sublime-Text-designed/answer/Bulat-Bochkariov
    function fuzzyMatch(files, query) {
      var tokens = query.toLowerCase().split('');

      return _.filter(files, function(file) {
        var tokenIndex = 0;
        var stringIndex = 0;
        var string = file.name.toLowerCase();

        while (stringIndex < string.length) {
          if (string[stringIndex] === tokens[tokenIndex]) {
            tokenIndex++;

            if (tokenIndex >= tokens.length) {
              return true;
            }
          }

          stringIndex++;
        }
      });
    }
  });

  Router.on('stop:pr-files', function() {
    document.removeEventListener('keypress', keyPressListener);
    hideFilePicker();
  });

  function hideFilePicker() {
    if (!filePicker) return;

    filePicker.remove();
    filePicker = null;

    prContent.show();
    prContent = null;
  }
})();

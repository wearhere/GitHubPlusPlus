/**
 * Adds a Sublime-Text style quick-open file browser to PRs--using GitHub's own file picker!
 */
(function() {
  var keyPressListener;
  var scrollPosition;
  var prContent;
  var filePicker;

  ['pr-files', 'commits'].forEach(function(route) {
    Router.on('start:' + route, start);
    Router.on('stop:' + route, stop);
    Router.on('restart:' + route, function(routeRef) {
      // When the user navigates from one commit to another or (I suppose) from one PR to another,
      // we must reload the file list. The easiest way to do that is just to re-run the entire route.
      stop();
      start(routeRef);
    });
  });

  function start(routeRef) {
    if (keyPressListener) {
      console.error('File picker routes are stopping and starting out of order.');
      return;
    }

    var files;

    // When transitioning between commits, GitHub will take a moment to load the PR _after_ already
    // having changed the location.
    ElementUtils.waitForElement('.page-context-loader:not(:visible)', 3 * 1000).then(function() {
      // This checks that we've transitioned from the issues list into a PR, or from the PR commit
      // list to a commit.
      //
      // HACK(jeff): The `:visible` is a way to check that we've made the transition without checking
      // the loading indicator directly, since it doesn't always exist, unlike the indicator that
      // shows when transitioning between commits. The visible item is the diff stat summary rather
      // than the list itself, which is collapsed and hidden until you click on the summary.
      return ElementUtils.waitForElement(':visible + .content', 3 * 1000);
    })
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
        routeRef: routeRef,
      });

      scrollPosition = {
        x: window.scrollX,
        y: window.scrollY
      };

      prContent = $('#js-repo-pjax-container')
        .children()
        .attr('data-gplusplus-was-hidden', function() {
          return $(this).css('display');
        })
        .hide();

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
  }

  function stop() {
    document.removeEventListener('keypress', keyPressListener);
    keyPressListener = null;

    hideFilePicker();
  }

  function hideFilePicker() {
    if (!filePicker) return;

    filePicker.remove();
    filePicker = null;

    prContent.css('display', function() {
      var display = $(this).attr('data-gplusplus-was-hidden');
      $(this).attr('data-gplusplus-was-hidden', '');
      return display;
    });
    prContent = null;

    if (scrollPosition) {
      window.scrollTo(scrollPosition.x, scrollPosition.y);
      scrollPosition = null;
    }
  }
})();

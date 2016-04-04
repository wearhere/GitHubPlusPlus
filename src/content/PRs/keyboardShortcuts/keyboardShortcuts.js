/**
 * Adds shortcuts to PR pages.
 */
(function() {
  var prRef;

  var keyPressListener = function(e) {
    if (e.altKey) {
      var newHref;
      switch (e.charCode) {
        case 161: // 1
          newHref = prRef;
          break;
        case 8482: // 2 and I'll be danged if I know why this isn't 162. Tested in Chrome 44.0.2403.155.
          newHref = prRef + '/commits';
          break;
        case 163: // 3
          newHref = prRef + '/files';
          break;
        case 8249: // Shift + 3 and no I don't know why this isn't still 163. Tested in Chrome 44.0.2403.155.
          // Special case: reload to show the diff without whitespace.
          window.location.href = window.location.href.replace(/(pull\/\d+).*/, '$1/files?w=1');
          return;
      }
      if (newHref) {
        // Don't actually attempt to go to the href because we don't want to
        // trigger a page reload. Instead, click the tab with this href.
        var tab = document.querySelector('.tabnav-tab[href$="' + newHref + '"]');
        if (tab) {
          tab.click();
        } else {
          new Audio(GPLUSPLUS.alertSoundUrl).play();
        }
      }
    }
  };

  // Adds the above shortcuts to the site-wide keyboard shortcuts table
  // under the "Pull request list" section.
  // HACK(jeff): Add the file picker shortcut here too.
  // TODO(jeff): Abstract this so other modules can add to the keyboard shortcuts list.
  function addPRShortcutsToPopup(popup) {
    popup.find('.column.one-third:nth-child(3) table').append(Templates.prShortcutsDescription());
  }

  var shortcutPopupObserver;

  Router.on('start:pr', function(localPrRef) {
    prRef = localPrRef;

    document.addEventListener('keypress', keyPressListener);

    // The popup is always present. Detect it being populated with the shortcuts
    // by the toggling of the '.shortcuts' class on the popup.
    shortcutPopupObserver = new MutationObserver(function(records) {
      var shortcutPopup = $('.facebox-content.shortcuts');
      if (shortcutPopup.length) {
        // The shortcut HTML is recreated every time.
        addPRShortcutsToPopup(shortcutPopup);
      }
    });

    shortcutPopupObserver.observe(document.querySelector('.facebox-content'), {
      attributes: true,
      attributeFilter: ['class']
    });
  });

  Router.on('stop:pr', function() {
    document.removeEventListener('keypress', keyPressListener);

    shortcutPopupObserver.disconnect();
  });
})();

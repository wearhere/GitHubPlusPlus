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
        var tab = document.querySelector('.js-pull-request-tab[href$="' + newHref + '"]');
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
  function addPRShortcutsToPopup(popup) {
    // TODO(jeff): Put this in a Handlebars template.
    var shortcutTable = '<tbody class="js-hidden-pane">' +
          '<tr>' +
            '<th></th>' +
            '<th>Pull requests (G++)</th>' +
          '</tr>' +
          '<tr>' +
            '<td class="keys">' +
              '<kbd><span class="platform-mac">⎇</span><span class="platform-other">alt</span> 1</kbd>' +
            '</td>' +
            '<td>View conversation</td>' +
          '</tr>' +
          '<tr>' +
            '<td class="keys">' +
              '<kbd><span class="platform-mac">⎇</span><span class="platform-other">alt</span> 2</kbd>' +
            '</td>' +
            '<td>View commits</td>' +
          '</tr><tr>' +
            '<td class="keys">' +
              '<kbd><span class="platform-mac">⎇</span><span class="platform-other">alt</span> 3</kbd>' +
            '</td>' +
            '<td>View files</td>' +
          '</tr><tr>' +
            '<td class="keys">' +
              '<kbd><span class="platform-mac">⎇</span><span class="platform-other">alt</span> shift 3</kbd>' +
            '</td>' +
            '<td>View files ignoring whitespace</td>' +
          '</tr></tbody>';

    popup.querySelector('.column.one-third:nth-child(3) table').innerHTML += shortcutTable;
  }

  var shortcutPopupObserver;

  Router.on('start:pr', function(localPrRef) {
    prRef = localPrRef;

    document.addEventListener('keypress', keyPressListener);

    // The popup is always present. Detect it being populated with the shortcuts
    // by the toggling of the '.shortcuts' class on the popup.
    shortcutPopupObserver = new MutationObserver(function(records) {
      var shortcutPopup = document.querySelector('.facebox-content.shortcuts');
      if (shortcutPopup) {
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

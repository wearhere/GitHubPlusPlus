/**
 * Utilities for manipulating elements.
 */
var ElementUtils = {
  /**
   * Waits for the element(s) identified by _selector_ to appear in the DOM, returning a promise
   * that will be resolved with the element(s) if they appear within the timeout or rejected
   * if they do not appear within the timeout.
   */
  waitForElement: function(selector, timeout) {
    var deferred = $.Deferred();

    var elemsAtStart = $(selector);
    if (elemsAtStart.length) {
      return deferred.resolve(elemsAtStart).promise();
    }

    var observer = new MutationObserver(function() {
      var elems = $(selector);
      if (elems.length) {
        observer.disconnect();
        deferred.resolve(elems);
      }
    });

    observer.observe(document, {
      childList: true,
      subtree: true
    });

    setTimeout(function() {
      observer.disconnect();
      deferred.reject();
    }, timeout);

    return deferred.promise();
  }
};

// Remove $ from the global namespace and just declare it as a local variable
// inside the extension. This prevents $ from conflicting with the GitHub code.
var $ = window.jQuery.noConflict(true /* Also remove jQuery global var. */ );

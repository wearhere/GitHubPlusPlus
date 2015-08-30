// Remove _ from the global namespace and just declare it as a local variable
// inside the extension. This prevents _ from conflicting with GitHub's code.
var _ = window._.noConflict();

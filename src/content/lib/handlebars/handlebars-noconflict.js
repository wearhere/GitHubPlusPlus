// Remove Handlebars from the global namespace and just declare it as a local variable
// inside the extension. This prevents Handlebars from conflicting with GitHub's code.
var Handlebars = window.Handlebars;
window.Handlebars.noConflict();

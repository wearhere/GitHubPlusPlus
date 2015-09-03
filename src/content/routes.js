/**
 * Declare all routes to be observed by the extension.
 */
Router.route(/(pull\/\d+)/, 'pr');
Router.route(/(pull\/\d+)\/files/, 'pr-files');
Router.route(/(commit\/.{7})/, 'commits');

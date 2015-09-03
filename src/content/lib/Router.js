/**
 * The router observes the user's navigation around GitHub and fires events when pre-defined routes
 * are arrived at.
 *
 * (For those familiar with Backbone, this is a mashup of `Backbone.Router` and `Backbone.History`,
 * customized in the following ways:
 *  - hooking into `replaceState` rather than popstate events
 *  - no navigation methods since the extension merely observes GitHub's changes rather than
 *    instigates changes itself (at the moment)
 *  - multiple routes can be active at a time.)
 *
 * Client code defines a route by calling `Router.route` with a routing string
 * (http://backbonejs.org/index.html#Router-routes) or regular expression and name. Whenever
 * the location changes, and the new location matches the route, the router will fire a "start:name"
 * event whose arguments are the capture(s) from the route or regular expression.
 *
 * If the location changes but the new location matches the same route, the router will fire a
 * "restart" event rather than a "start" event.
 *
 * Multiple routes can be active at the same time if they match the same location.
 *
 * When the location changes and the new location stops matching a route, the router will fire a
 * "stop:name" event. All "stop" events will be fired before any "start" or "restart" events.
 *
 * The router will also fire a "start" event as appropriate when the page first loads.
 *
 * Complete example:
 *
 *    Router.route('page/:number', 'page');
 *
 *    Router.on('start:page', function(number) {
 *      // Do something to the page.
 *    });
 *
 *    Router.on('stop:page', function() {
 *      // Clean up state from the 'start:page' handler as appropriate.
 *    });
 */
var Router = _.extend({}, Events, {
  _started: false,

  _routes: [],

  _currentRoutes: [],

  start: function() {
    if (this._started) return;
    this._started = true;

    // Monitor for route changes.
    var origReplaceState = history.replaceState;
    history.replaceState = function() {
      var retValue = origReplaceState.apply(history, arguments);
      this._loadUrl();
      return retValue;
    }.bind(this);

    // Load the initial route.
    this._loadUrl();
  },

  route: function(route, name) {
    if (!_.isRegExp(route)) route = this._routeToRegExp(route);

    this._routes.unshift({
      route: route,
      name: name
    });
  },

  // Convert a route string into a regular expression, suitable for matching
  // against the current path.
  _routeToRegExp: function(route) {
    var optionalParam = /\((.*?)\)/g;
    var namedParam    = /(\(\?)?:\w+/g;
    var splatParam    = /\*\w+/g;
    var escapeRegExp  = /[\-{}\[\]+?.,\\\^$|#\s]/g;

    route = route.replace(escapeRegExp, '\\$&')
                 .replace(optionalParam, '(?:$1)?')
                 .replace(namedParam, function(match, optional) {
                   return optional ? match : '([^/?]+)';
                 })
                 .replace(splatParam, '([^?]*?)');
    return new RegExp('^' + route + '(?:\\?([\\s\\S]*))?$');
  },

  _getParams: function(route, path) {
    var params = route.route.exec(path).slice(1);
    params = _.map(params, function(param, i) {
      // Don't decode the search params.
      if (i === params.length - 1) return param || null;
      return param ? decodeURIComponent(param) : null;
    });
    return params;
  },

  _loadUrl: function() {
    var path = window.location.pathname;

    var stoppedRoutes = _.difference(this._routes, this._currentRoutes);

    // Stop, restart, and start routes in that order. That way if two routes overlap, teardown
    // can happen cleanly before start.
    this._currentRoutes = _.filter(this._currentRoutes, function(route) {
      var routeMatches = route.route.test(path);
      if (!routeMatches) {
        this.trigger('stop:' + route.name);
      }
      return routeMatches;
    }, this);

    _.each(this._currentRoutes, function(route) {
      var params = this._getParams(route, path);
      this.trigger.apply(this, ['restart:' + route.name].concat(params));
    }, this);

    [].push.apply(this._currentRoutes, _.filter(stoppedRoutes, function(route) {
      var routeMatches = route.route.test(path);
      if (routeMatches) {
        var params = this._getParams(route, path);
        this.trigger.apply(this, ['start:' + route.name].concat(params));
      }
      return routeMatches;
    }, this));
  }
});

// Give the content scripts time to register their routes.
setTimeout(function() {
  Router.start();
}, 0);

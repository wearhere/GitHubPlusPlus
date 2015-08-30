/**
 * The router observes the user's navigation around GitHub and fires events when pre-defined routes
 * are arrived at.
 *
 * (For those familiar with Backbone, this is a mashup of `Backbone.Router` and `Backbone.History`,
 * customized for GitHub using `replaceState` to navigate, and for the extension merely observing
 * GitHub's changes rather than instigating changes itself (at the moment)).
 *
 * Client code defines a route by calling `Router.route` with a routing string
 * (http://backbonejs.org/index.html#Router-routes) or regular expression and name. Whenever
 * the location changes, and the new location matches the route, the router will fire a "start:name"
 * event whose arguments are the capture(s) from the route or regular expression.
 *
 * If the location changes but the new location matches the same route, the router will _not_ fire
 * another "start" event.
 *
 * When the location changes and the new location matches a different route (or no route), the router
 * will fire a "stop:name" event.
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

  _currentRoute: null,

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

  _loadUrl: function() {
    var path = window.location.pathname;

    var routeMatched = _.some(this._routes, function(route) {
      if (route.route.test(path)) {
        if (this._currentRoute) {
          if (route === this._currentRoute) {
            return true;
          } else {
            this.trigger('stop:' + this._currentRoute.name);
          }
        }

        var params = route.route.exec(path).slice(1);
        params = _.map(params, function(param, i) {
          // Don't decode the search params.
          if (i === params.length - 1) return param || null;
          return param ? decodeURIComponent(param) : null;
        });

        this.trigger.apply(this, ['start:' + route.name].concat(params));

        this._currentRoute = route;

        return true;
      }
    }, this);

    // Unload the current route if we didn't do it already above.
    if (!routeMatched && this._currentRoute) {
      this.trigger('stop:' + this._currentRoute.name);
      this._currentRoute = null;
    }
  }
});

// Give the content scripts time to register their routes.
setTimeout(function() {
  Router.start();
}, 0);

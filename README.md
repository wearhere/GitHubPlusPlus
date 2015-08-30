# GitHub++

Adds keyboard shortcuts and other stuff to GitHub.

For easy discoverability, the extension amends GitHub's site-wide keyboard shortcut map (press "?" outside a text area) with the shortcuts it adds. Example section:

<img src="shortcuts.png" width=317 />

## Current Features

* Adds shortcuts to toggle between PR tabs and view diffs without whitespace.
* Adds a button to view diffs without whitespace for people that prefer that.
* Enables GitHub's file browser in PRs for the files that have changed in the PR, using Sublime
Text-style fuzzy-matching logic.

## Installation

1. Go to <chrome://extensions>
2. Check the "Developer mode" option in the upper right corner
3. Click *Load Unpacked Extension* and select this folder

### Why Isn't This in the Chrome Web Store?

It could be, I'm just lazy.

Also this is a developer tool, and it's easier to hack on if you install it locally.

## Contributing

PRs and bug reports are welcome!

### Local Development

1. Run `npm install` (only need to do this once)
2. Run `npm start`

If you make changes to scripts in `src/content/`, you just need to reload GitHub, not the extension
(see "Architecture" below for why).

If you make changes to other files in the extension, you need to reload the extension which you can
do by Cmd-R reloading <chrome://extensions>. Then you need to reload GitHub.

### Architecture

The "content scripts" in `src/content/` are injected directly into GitHub, in a bit of a departure from
normal Chrome extension practice. This is because GitHub is a single-page application, but uses
`history.replaceState` to update the URL rather than changing the hash. In order for the extension
to observe the user navigating around GitHub and set-up/tear-down state as necessary it needs
to be able to intercept `history.replaceState`, and it can only do that if it shares the same JavaScript
context as GitHub itself.

(Yes, content scripts could use mutation observers but that would be more gross.)

So, don't declare any global variables unless absolutely necessary, to avoid polluting GitHub's
context. All content scripts are concatenated together so top-level local declarations from one file
will appear "global" from another file's perspective. Files in `src/content/lib/` are loaded before
those outside `src/content/lib/`.

Since the content scripts aren't actually content scripts, they won't be able to use Chrome extension
APIs usually available to content scripts. If you need to load assets from the extension, you can
pass the results of `chrome.extension.getURL` to the content scripts in `src/globals.js`. If you
need to use other APIs, we'll need to figure that out.

## Copyright and License

GitHub++ Copyright 2015 Jeffrey Wear.

`Backbone.Events` (c) 2010-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors.

GitHub++ is available under the MIT license. See the LICENSE file for more info.

faucet-pipeline-js version history
==================================


v2.0.0
------

_2019-02-18_

improvements for end users:

* extended compacting options

  if compacting is activated, bundles can now opt into varying levels of
  minification via `compact: minify` or `compact: mangle`

* added support for JSX fragments

  `<>`/`</>` shorthand syntax can now be configured via `jsx.fragment`
  (alongside `jsx.pragma`)

* removed `global` shim

  introducing this was premature in the first place: faucet-pipeline is not in
  the business of polyfilling - this should be handled at the application level

* renamed default identifier for ECMAScript module format: `es` → `esm`

  `es` remains supported for backwards compatibility though

* dropped Node 6 compatibility

  April 2019 marks the end of life for this LTS version, so it should soon be
  phased out by users.

  While most functionality (namely anything but JSX) remains compatible for now,
  we no longer offer any guarantees in that regard.

improvements for developers:

* renamed configuration property for source maps: `sourcemap` → `sourcemaps`


v1.1.1
------

_2018-11-29_

improvements for end users:

* fixed change detection in watch mode if multiple files were altered
  simultaneously

no significant changes for developers


v1.1.0
------

_2018-11-07_

no significant changes for end users

improvements for developers:

* added support for virtual bundles, using strings rather than files as entry
  point and not automatically writing bundles to disk (programmatic API only)
* improved support for compiling bundles programmatically

faucet-pipeline-js
==================

[![package version](https://img.shields.io/npm/v/faucet-pipeline-js.svg?style=flat)](https://www.npmjs.com/package/faucet-pipeline-js)
[![build status](https://travis-ci.org/faucet-pipeline/faucet-pipeline-js.svg?branch=master)](https://travis-ci.org/faucet-pipeline/faucet-pipeline-js)
[![Greenkeeper badge](https://badges.greenkeeper.io/faucet-pipeline/faucet-pipeline-js.svg)](https://greenkeeper.io)

[faucet-pipeline](http://faucet-pipeline.org) plugin for bundling JavaScript
modules, along with extensions for ESNext, JSX and TypeScript

note that this repository comprises multiple packages; those residing within
`pkg` are merely meta-packages to simplify dependency management for users


Features and Configuration
--------------------------

supported global features:

* compacting
* Browserslist, determining transpilation targets
* source maps (inline)
* fingerprinting - NB: can be overriden with bundle-specific configuration

bundle-specific configuration:

| option                | description                                                                                                                                       | permitted values                                                                                                      | examples                             |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| `source` (required)   | references the entry-point module                                                                                                                 | file path <br> non-relative file paths are interpeted as identifiers for third-party packages                         | `"./src/index.js"`                   |
| `target` (required)   | references the target bundle                                                                                                                      | relative file path                                                                                                    | `"./dist/bundle.js"`                 |
| `compact`             | activates bundle compression <br> NB: only takes effect if compacting is activated globally (typically via `--compact`)                           | `compact` (default), `minify` or `mangle`                                                                             |                                      |
| `sourcemaps`          | if truthy, activates inline source-map generation <br> NB: only takes effect if source maps are activated globally (typically via `--sourcemaps`) | `false` suppresses source maps                                                                                        |                                      |
| `format`              | determines the bundle format                                                                                                                      | `iife` (default), `esm`, `umd`, `amd` or `commonjs` - all case-insensitive                                            |                                      |
| `exports`             | determines the bundle's API; the value exported by `source` (if any)                                                                              |                                                                                                                       | `"MYLIB"`, for IIFEs                 |
| `extensions`          | additional file extensions for loading modules                                                                                                    |                                                                                                                       | `[".jsx"]`                           |
| `externals`           | determines which modules/packages to exclude from the bundle                                                                                      | an object whose key refers to the respective module/package name, the value refers to a corresponding global variable | `{ jquery: "jQuery" }`               |
| `esnext`              | if truthy, activates ESNext transpilation (typically determined by Browserslist)                                                                  |                                                                                                                       |                                      |
| `esnext.browserslist` | custom Browserslist entry selection                                                                                                               | the name of the Browserslist group to select <br> `false` suppresses automatic configuration via Browserslist         | `esnext: { browserslist: "legacy" }` |
| `esnext.exclude`      | modules/packages for which to skip transpilation <br> this might be useful when importing distributions already optimized for ES5, for example    |                                                                                                                       | `esnext: { exclude: ["jquery"] }`    |
| `jsx`                 | if truthy, activates JSX transpilation <br> additionally accepts the same options as `esnext`                                                     |                                                                                                                       |                                      |
| `jsx.pragma`          | determines the function to use for JSX expressions                                                                                                |                                                                                                                       | `jsx: { pragma: "createElement" }`   |
| `jsx.fragment`        | determines the function to use for JSX fragments                                                                                                  |                                                                                                                       | `jsx: { fragment: "Fragment" }`      |
| `typescript`          | if truthy, activates TypeScript transpilation <br> anything other than `true` will be passed through as TypeScript compiler options               |                                                                                                                       |                                      |


Contributing
------------

* ensure [Node](http://nodejs.org) is installed
* `npm install` downloads dependencies
* `npm test` runs the test suite and checks code for stylistic consistency


Release Process
---------------

1. ensure dependencies are up to date (→ `./pkg/update_all`)
2. ensure all meta-packages use the same version number (i.e.
   `pkg/*/package.json`, both WRT `version` field and faucet-js `dependencies`)
3. `./release`, skipping dependencies' installation (due to meta-packages; thus
   the manual first step)


License
-------

faucet-pipeline-js is licensed under the Apache 2.0 License.

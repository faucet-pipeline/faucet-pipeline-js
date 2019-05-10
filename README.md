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

| option                | description                                                                                                                                                                                                               | permitted values                                                                                                      |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `source` (required)   | references the entry-point module (e.g. `"./src/index.js"`)                                                                                                                                                               | file path <br> non-relative file paths are interpeted as identifiers for third-party packages                         |
| `target` (required)   | references the target bundle (e.g. `"./dist/bundle.js"`)                                                                                                                                                                  | relative file path                                                                                                    |
| `format`              | determines the bundle format                                                                                                                                                                                              | `iife` (default), `esm`, `umd`, `amd` or `commonjs` - all case-insensitive                                            |
| `exports`             | determines the bundle's API; the name of the value exported by the `source` module, if any (e.g. `"MYLIB"`, which would become a global variable for IIFEs)                                                               |                                                                                                                       |
| `externals`           | determines which modules/packages to exclude from the bundle (e.g. `{ jquery: "jQuery" }`)                                                                                                                                | an object whose key refers to the respective module/package name, the value refers to a corresponding global variable |
| `compact`             | activates bundle compression <br> NB: only takes effect if compacting is activated globally (typically via `--compact`) <br> certain options require faucet-pipeline-jsmin                                                | `compact` (default), `minify` or `mangle`                                                                             |
| `esnext`              | if truthy, activates ESNext transpilation (typically determined by Browserslist) <br> requires faucet-pipeline-esnext                                                                                                     |                                                                                                                       |
| `esnext.browserslist` | custom Browserslist entry selection (e.g. `esnext: { browserslist: "legacy" }`)                                                                                                                                           | the name of the Browserslist group to select <br> `false` suppresses automatic configuration via Browserslist         |
| `esnext.exclude`      | modules/packages for which to skip transpilation <br> this might be useful when importing distributions already optimized for ES5, for example (e.g. `esnext: { exclude: ["jquery"] }`)                                   |                                                                                                                       |
| `jsx`                 | if truthy, activates JSX transpilation (automatically adding `.jsx` file extensions) <br> additionally accepts the same options as `esnext` <br> requires faucet-pipeline-jsx                                             |                                                                                                                       |
| `jsx.pragma`          | determines the function to use for JSX expressions (e.g. `jsx: { pragma: "createElement" }`)                                                                                                                              |                                                                                                                       |
| `jsx.fragment`        | determines the function to use for JSX fragments (e.g. `jsx: { fragment: "Fragment" }`)                                                                                                                                   |                                                                                                                       |
| `typescript`          | if truthy, activates TypeScript transpilation (automatically adding `.ts` file extensions) <br> anything other than `true` will be passed through as TypeScript compiler options <br> requires faucet-pipeline-typescript |                                                                                                                       |
| `sourcemaps`          | if truthy, activates inline source-map generation <br> NB: only takes effect if source maps are activated globally (typically via `--sourcemaps`)                                                                         | `false` suppresses source maps                                                                                        |
| `extensions`          | additional file extensions for loading modules (e.g. `[".es"]`)                                                                                                                                                           |                                                                                                                       |


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

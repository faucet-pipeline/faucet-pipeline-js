faucet-pipeline-js
==================

[![package version](https://img.shields.io/npm/v/faucet-pipeline-js.svg?style=flat)](https://www.npmjs.com/package/faucet-pipeline-js)
[![build status](https://travis-ci.org/faucet-pipeline/faucet-pipeline-js.svg?branch=master)](https://travis-ci.org/faucet-pipeline/faucet-pipeline-js)
[![Greenkeeper badge](https://badges.greenkeeper.io/faucet-pipeline/faucet-pipeline-js.svg)](https://greenkeeper.io)

[faucet-pipeline](http://faucet-pipeline.org) plugin for bundling JavaScript
modules, along with extensions for ESNext, JSX and TypeScript


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

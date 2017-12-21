/* global describe, it */
"use strict";

let { MockAssetManager, makeBundle, awaitInvocations, FIXTURES_DIR } = require("./util");
let faucetJS = require("../../lib");
let niteOwl = require("nite-owl");
let fs = require("fs");
let path = require("path");

describe("watcher", () => {
	it("responds to files changes in watch mode", done => {
		let filepath = "./src/index.js";
		let fullpath = path.resolve(FIXTURES_DIR, filepath);
		let source = fs.readFileSync(fullpath, "utf8");

		let config = [{
			entryPoint: filepath,
			target: "./dist/bundle.js"
		}];
		let watcher = niteOwl([FIXTURES_DIR]); // FIXME: prevents process termination
		let assman = new MockAssetManager(FIXTURES_DIR);
		let code = `
var util = "UTIL";

console.log(\`[…] $\{util}\`); // eslint-disable-line no-console
		`.trim();
		let conclude = awaitInvocations(2, _ => {
			fs.writeFileSync(fullpath, source); // restore original
			done();
		});

		faucetJS(config, assman, { watcher }). // triggers initial compilation
			then(_ => {
				assman.assertWrites([{
					filepath: path.resolve(FIXTURES_DIR, "./dist/bundle.js"),
					content: makeBundle(code)
				}]);

				conclude();
			});

		// simulate source edit
		// NB: delay assumes that initial compilation has not yet completed
		setTimeout(_ => {
			fs.writeFileSync(fullpath, source + '\nconsole.log("…");');
		}, 10);
		// check result
		setTimeout(_ => {
			assman.assertWrites([{
				filepath: path.resolve(FIXTURES_DIR, "./dist/bundle.js"),
				content: makeBundle(code + '\nconsole.log("…");')
			}]);

			conclude();
		}, 1000); // FIXME: hacky
	});
});

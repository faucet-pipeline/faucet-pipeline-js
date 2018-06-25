/* global describe, afterEach, it */
"use strict";

let { MockAssetManager, makeBundle, awaitInvocations, FIXTURES_DIR } = require("./util");
let faucetJS = require("../../lib");
let niteOwl = require("nite-owl");
let fs = require("fs");
let path = require("path");

describe("watcher", () => {
	let entryPoint = { relative: "./src/index.js" };
	entryPoint.absolute = path.resolve(FIXTURES_DIR, entryPoint.relative);
	let src = fs.readFileSync(entryPoint.absolute, "utf8");
	let watcher;

	afterEach(() => {
		fs.writeFileSync(entryPoint.absolute, src); // restore original
		watcher.terminate();
	});

	// disable this test on legacy Node due to apparent/inexplicable race condition
	let test = process.version.substr(0, 3) === "v6." ? it.skip : it;
	test("responds to file changes in watch mode", function(done) {
		let config = [{
			source: entryPoint.relative,
			target: "./dist/bundle.js"
		}];
		watcher = niteOwl(FIXTURES_DIR, { suppressReporting: true });
		let assetManager = new MockAssetManager(FIXTURES_DIR);
		let conclude = awaitInvocations(2, _ => {
			done();
		});

		let bundlePath = path.resolve(FIXTURES_DIR, "./dist/bundle.js");
		let code = `
var util = "UTIL";

console.log(\`[…] $\{util}\`); // eslint-disable-line no-console
		`.trim();
		let expectedBundles = [{
			filepath: bundlePath,
			content: makeBundle(code)
		}, {
			filepath: bundlePath,
			content: makeBundle(code + '\nconsole.log("…");')
		}];

		faucetJS(config, assetManager, // triggers initial compilation
				{ watcher, browsers: {} }).
			then(_ => {
				assetManager.assertWrites(expectedBundles.slice(0, 1));

				conclude();
			});

		// edit source module
		// NB: delay assumes that initial compilation has not yet completed
		setTimeout(_ => {
			fs.writeFileSync(entryPoint.absolute, src + 'console.log("…");');
		}, 50);
		// check result by polling
		let timer = 0;
		let interval = 50;
		let threshold = this.timeout() - 10 * interval;
		let check = _ => {
			timer += interval;
			if(timer > threshold ||
					assetManager._writes.length === expectedBundles.length) {
				assetManager.assertWrites(expectedBundles);
				conclude();
				return;
			}

			setTimeout(check, interval); // retry
		};
		setTimeout(check, interval);
	});
});

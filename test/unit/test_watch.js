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

	it("responds to file changes in watch mode", function(done) {
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

		faucetJS(config, assetManager, { watcher }). // triggers initial compilation
			then(_ => {
				console.log("~~~~ ✓ 1st compile");
				assetManager.assertWrites(expectedBundles.slice(0, 1));

				conclude();
			});

		// edit source module
		// NB: delay assumes that initial compilation has not yet completed
		setTimeout(_ => {
			console.log("~~~~ edit file");
			fs.writeFileSync(entryPoint.absolute, src + 'console.log("…");');
			console.log("~~~~ done editing");
		}, 50);
		// check result by polling
		let timer = 0;
		let interval = 50;
		let threshold = this.timeout() - 2 * interval;
		let check = _ => {
			timer += interval;
			console.log(`~~~~ [${timer}ms] checking... #${assetManager._writes.length}`);
			if(timer > threshold ||
					assetManager._writes.length === expectedBundles.length) {
				console.log("~~~~ assert");
				assetManager.assertWrites(expectedBundles);
				conclude();
				return;
			}

			console.log(`~~~~ [${timer} / ${threshold}] retry`);
			setTimeout(check, interval); // retry
		};
		setTimeout(check, interval);
	});
});

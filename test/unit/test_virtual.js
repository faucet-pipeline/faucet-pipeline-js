/* global describe, it */
"use strict";

let { FIXTURES_DIR } = require("./util");
let { VirtualBundle } = require("../../lib/bundle/virtual");
let fs = require("fs");
let path = require("path");
let assert = require("assert");

let assertSame = assert.strictEqual;

let DEFAULT_OPTIONS = {
	browsers: {}
};

describe("virtual bundle", _ => {
	it("should bundle JavaScript from a source string", async () => {
		let bundle = new VirtualBundle(FIXTURES_DIR, null, DEFAULT_OPTIONS);

		let res = await bundle.compile(`
import UTIL from "./src/util";

console.log(UTIL);
		`);
		assertSame(res.error, undefined);
		assertSame(res.code, expectedBundle("virtual_bundle_js1.js"));

		res = await bundle.compile(`
import UTIL from "./src/util";
import MYLIB from "my-lib";

console.log(UTIL + MYLIB);
		`);
		assertSame(res.error, undefined);
		assertSame(res.code, expectedBundle("virtual_bundle_js2.js"));
	});

	it("should support JSX", async () => {
		let bundle = new VirtualBundle(FIXTURES_DIR, {
			format: "CommonJS",
			jsx: {
				pragma: "createElement",
				fragment: "Fragment"
			}
		}, DEFAULT_OPTIONS);

		let { code, error } = await bundle.compile(`
import UTIL from "./src/util";
import MYLIB from "my-lib";
import { Button, List } from "my-lib/components";
import createElement from "my-lib/elements";

console.log(<List>
	<Button label={UTIL} />
	<>
		<Button type="reset" label={MYLIB} />
	</>
</List>);
		`);
		assertSame(error, undefined);
		assertSame(code, expectedBundle("virtual_bundle_jsx.js"));
	});
});

function expectedBundle(filename) {
	return fs.readFileSync(path.resolve(__dirname, "expected", filename), "utf8");
}

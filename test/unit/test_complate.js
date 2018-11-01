/* global describe, it */
"use strict";

let { FIXTURES_DIR } = require("./util");
let { VirtualBundle } = require("../../lib/bundle/virtual");
let assert = require("assert");

let assertSame = assert.strictEqual;

let DEFAULT_CONFIG = {
	format: "CommonJS",
	jsx: { pragma: "createElement" }
};
let DEFAULT_OPTIONS = {
	browsers: {}
};

let rendering = `
import Renderer, { Fragment as _F, createElement as _h } from "complate-stream";
import BufferedStream from "complate-stream/src/buffered-stream";

let renderer = new Renderer();

function emit(html) {
	ACTUAL = html;
}

function render(macro, fragment) {
	let view = () => _h(_F, null, macro);
	let stream = new BufferedStream();
	renderer.renderView(view, null, stream, { fragment }, () => {
		let html = stream.read();
		emit(html)
	});
}
`;

describe("complate rendering", _ => {
	it("should render HTML via complate-stream", async () => {
		let snippet = `
import { Button, List } from "my-lib/components";
import { createElement } from "complate-stream";

<List>
	<Button label="ok" />
	<Button type="reset" label="cancel" />
</List>
		`;

		// inject rendering code by separating imports from JSX, splitting on
		// the first blank line
		// FIXME: hacky and brittle
		let viewCode = snippet.replace("\n\n", "\n\n; " + rendering + "; render(") + ")";

		let bundle = new VirtualBundle(FIXTURES_DIR, DEFAULT_CONFIG, DEFAULT_OPTIONS);
		let { code, error } = await bundle.compile(viewCode);

		let ACTUAL;
		eval(code); // XXX: use require-from-string instead? (would also address `emit`/`ACTUAL` issue)
		// FIXME: why is this available synchronously?
		assertSame(ACTUAL, `
<!DOCTYPE html>
<ul><li><button>ok</button></li><li><button type="reset">cancel</button></li></ul>
		`.trim());
	});
});

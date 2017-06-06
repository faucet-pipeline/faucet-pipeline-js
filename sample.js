let bundler = require("./src");

bundler([{
	entryPoint: "samples/foo.js",
	target: "dist/foo.js"
}, {
	entryPoint: "samples/bar.js",
	target: "dist/bar.js"
}], {
	watch: true,
	rootDir: "."
});

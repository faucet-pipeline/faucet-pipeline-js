let bundler = require("./src");

bundler([{
	entryPoint: "samples/foo.js"
}, {
	entryPoint: "samples/bar.js"
}], {
	watch: true,
	rootDir: "."
});

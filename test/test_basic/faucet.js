let config = {
	targetDir: "dist",
	manifest: false,
	bundles: [{
		entryPoint: "src/index.js",
		target: "bundle.js"
	}]
};

module.exports = {
	js: config
};

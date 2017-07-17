let config = {
	targetDir: "dist",
	manifest: false,
	bundles: [{
		entryPoint: "index.js",
		target: "bundle.js"
	}]
};

module.exports = {
	js: config
};

let config = {
	targetDir: "dist",
	manifest: {
		file: "dist/manifest.json",
		baseURI: "/assets"
	},
	bundles: [{
		entryPoint: "index.js",
		target: "bundle.js"
	}]
};

module.exports = {
	js: config
};

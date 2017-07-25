let config = {
	manifest: {
		file: "dist/manifest.json",
		baseURI: "/assets"
	},
	bundles: [{
		entryPoint: "index.js",
		target: "dist/bundle.js"
	}]
};

module.exports = {
	js: config
};

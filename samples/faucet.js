let config = {
	manifest: {
		file: "dist/manifest.json",
		baseURI: "/assets"
	},
	bundles: [{
		entryPoint: "index.js",
		target: "dist/bundle.js",
		transpiler: {
			features: ["es2015"]
		}
	}]
};

module.exports = {
	js: config
};

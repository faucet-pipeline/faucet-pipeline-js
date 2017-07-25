let config = {
	manifest: {
		file: "dist/manifest.json",
		baseURI: "/assets"
	},
	bundles: [{
		entryPoint: "foo.js",
		target: "dist/foo.js",
		transpiler: {
			features: ["es2015"]
		}
	}, {
		entryPoint: "bar.js",
		target: "dist/bar.js"
	}]
};

module.exports = {
	js: config
};

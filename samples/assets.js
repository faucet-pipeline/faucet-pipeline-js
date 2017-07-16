let config = {
	targetDir: "dist",
	manifest: {
		file: "dist/manifest.json",
		baseURI: "/assets"
	},
	bundles: [{
		entryPoint: "foo.js",
		target: "foo.js",
		transpiler: {
			features: ["es2015"]
		}
	}, {
		entryPoint: "bar.js",
		target: "bar.js"
	}]
};

module.exports = {
	js: config
};

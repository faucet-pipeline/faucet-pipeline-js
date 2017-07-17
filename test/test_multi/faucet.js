let config = {
	targetDir: "dist",
	manifest: {
		file: "dist/manifest.json",
		baseURI: "/assets"
	},
	bundles: [{
		entryPoint: "src/foo.js",
		target: "foo.js"
	}, {
		entryPoint: "src/bar.js",
		target: "bar.js",
		transpiler: {
			features: ["es2015"]
		}
	}]
};

module.exports = {
	js: config
};

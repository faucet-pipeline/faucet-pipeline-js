let config = {
	targetDir: "dist",
	manifest: {
		file: "dist/manifest.json",
		baseURI: (bundlePath, bundleName) => assetURI(bundleName)
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

function assetURI(filename) {
	return ["/assets", filename].join("/");
}

let config = {
	manifest: {
		file: "dist/manifest.json",
		baseURI: (bundlePath, bundleName) => assetURI(bundleName)
	},
	bundles: [{
		entryPoint: "src/foo.js",
		target: "dist/foo.js"
	}, {
		entryPoint: "src/bar.js",
		target: "dist/bar.js",
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

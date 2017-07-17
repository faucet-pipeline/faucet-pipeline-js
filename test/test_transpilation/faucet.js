let config = {
	targetDir: "dist",
	manifest: false,
	bundles: [{
		entryPoint: "src/index.js",
		target: "bundle.js",
		transpiler: {
			features: ["es2015"]
		}
	}]
};

module.exports = {
	js: config
};

module.exports = {
	manifest: {
		file: "./dist/manifest.json"
	},
	js: [{
		entryPoint: "./index.js",
		target: "./dist/bundle.js",
		transpiler: {
			features: ["es2015"]
		}
	}]
};

module.exports = {
	manifest: {
		file: "./dist/manifest.json",
		baseURI: "/assets"
	},
	js: [{
		entryPoint: "./index.js",
		target: "./dist/bundle.js",
		transpiler: {
			features: ["es2015"]
		}
	}]
};

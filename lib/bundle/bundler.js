let rollupAnalyzer = require("rollup-plugin-analyzer").plugin;
let rollup = require("rollup");

module.exports = function generateBundle(entryPoint, target, config, cache) {
	let { readConfig, writeConfig, reporting } = config;
	let options = Object.assign({}, readConfig, {
		input: entryPoint,
		cache
	});

	if(reporting) {
		options.plugins.push(rollupAnalyzer({
			root: reporting.referenceDir,
			// TODO: support for options: `limit`, `filter`, `showExports`, `hideDeps`
			onAnalysis: res => void reporting.report({
				size: res.bundleSize,
				originalSize: res.bundleOrigSize,
				reduction: res.bundleReduction
			})
		}));
	}

	return rollup.rollup(options).
		then(bundle => {
			let modules = bundle.modules.reduce(collectModulePaths, new Set());
			return bundle.generate(writeConfig).
				then(({ code }) => ({ code, modules, cache: bundle }));
		});
};

// adapted from Rollup
function collectModulePaths(memo, module) {
	let filepath = module.id;

	// skip plugin helper modules
	if(/\0/.test(filepath)) {
		return memo;
	}

	return memo.add(filepath);
}

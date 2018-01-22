let rollup = require("rollup");

module.exports = function generateBundle(entryPoint, target, config, cache) {
	let { readConfig, writeConfig } = config;
	let options = Object.assign({}, readConfig, {
		input: entryPoint,
		cache
	});
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

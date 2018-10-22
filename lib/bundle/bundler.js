let rollup = require("rollup");

module.exports = function generateBundle(entryPoint, config, cache) {
	let { readConfig, writeConfig } = config;
	let options = Object.assign({}, readConfig, {
		input: entryPoint,
		cache
	});
	return rollup.rollup(options).
		then(bundle => {
			let modules = bundle.modules.reduce(collectModulePaths, new Set());
			return bundle.generate(writeConfig).
				then(({ code, map }) => ({
					code: map ? `${code}\n//# sourceMappingURL=${map.toUrl()}\n` : code,
					modules,
					cache: bundle
				}));
		});
};

// adapted from Rollup
function collectModulePaths(memo, module) {
	let filepath = module.id;
	// skip plugin helper modules (`"\0"` prefix is a Rollup convention)
	return /\0/.test(filepath) ? memo : memo.add(filepath);
}

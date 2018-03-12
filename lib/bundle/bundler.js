let rollup = require("rollup");
let rollupAnalyzer = require("rollup-analyzer");

let report = msg => void console.error(msg);

module.exports = function generateBundle(entryPoint, target, config, cache) {
	let { readConfig, writeConfig } = config;
	let options = Object.assign({}, readConfig, {
		input: entryPoint,
		cache
	});
	let analyzer = rollupAnalyzer({ // TODO: configurable
		//root // TODO: pass through `configDir`
		limit: 5
	});
	return rollup.rollup(options).
		then(bundle => {
			return analyzer.formatted(bundle).
				then(report, report).
				then(_ => bundle);
		}).
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

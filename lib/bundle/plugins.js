let { loadExtension } = require("faucet-pipeline-core/lib/util");

exports.determinePlugins = function({ esnext, typescript, jsx, sourcemaps, browsers, compact }) {
	let plugins = [];
	if(esnext || typescript || jsx || compact === "minify" || compact === "mangle") {
		// TODO: Improve error message (correct extension name)
		let { default: swc } = loadExtension("rollup-plugin-swc",
				"failed to activate SWC");

		let swcConfig = generateSWCConfig({
			esnext,
			typescript,
			jsx,
			sourcemaps,
			browsers,
			compact
		});
		plugins.push(swc(swcConfig));
	}
	if(compact === true || compact === "compact") {
		plugins.push(require("rollup-plugin-cleanup")());
	}
	return plugins;
};

function generateSWCConfig({ esnext, typescript, jsx, sourcemaps, browsers, compact }) {
	let env;
	let rollup = {};
	let jsc = {
		parser: {
			syntax: typescript ? "typescript" : "ecmascript"
		},
		target: esnext ? "es5" : "es2016"
	};

	if(jsx) {
		if(typescript) {
			jsc.parser.tsx = true;
		} else {
			jsc.parser.jsx = true;
		}

		jsc.transform = {
			react: {
				pragma: jsx?.pragma,
				pragmaFrag: jsx?.fragment

				// TODO: Improve JSX Handling
				// https://github.com/faucet-pipeline/faucet-pipeline-js/issues/144
				// https://swc.rs/docs/configuration/compilation#jsctransformreact
			}
		};
	}

	if(sourcemaps) {
		jsc.sourcemaps = "inline";
	}

	let exclude = esnext?.exclude ?? [];
	let browserslist = esnext?.browserslist;

	let targets = browserslist === false ? null : browsers[browserslist || "defaults"];
	if(targets && targets.length) {
		console.error("transpiling JavaScript for", targets.join(", "));
		delete jsc.target;
		env = { targets };
	}

	rollup.exclude = exclude.map(pkg => {
		// distinguish paths from package identifiers - as per Node's
		// resolution algorithm <https://nodejs.org/api/modules.html>, a
		// string is a path if it begins with `/`, `./` or `../`
		// FIXME: duplicates faucet-core's `resolvePath`, resulting in
		//        inconsistency WRT working directory
		return /^\.{0,2}\//.test(pkg) ? pkg : `node_modules/${pkg}/**`;
	});

	let mangle = compact === "mangle";
	if(mangle || compact === "minify") {
		var minify = true; // eslint-disable-line no-var
		jsc.minify = { compress: false, mangle };
	}

	return {
		minify,
		rollup,
		env,
		jsc
	};
}

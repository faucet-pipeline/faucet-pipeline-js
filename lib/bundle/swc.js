exports.generateSWCConfig = function({ typescript, jsx, sourcemaps }) {
	let jsc = {
		parser: {
			syntax: typescript ? "typescript" : "ecmascript"
		},
		// Disable es3 / es5 / es2015 transforms
		target: "es2016"
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

	return {
		jsc
	};
};

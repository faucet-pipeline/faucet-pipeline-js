"use strict";

let Bundle = require("./bundle");

module.exports = (config, manager) => {
	return config.forEach(bundleConfig => {
		bundleConfig = Object.assign({}, bundleConfig);
		let [entryPoint, target] = extract(bundleConfig, "entryPoint", "target").
			map(manager.relativePath);
		let bundle = new Bundle(entryPoint, target, bundleConfig);

		bundle.compile().
			then(({ code, error }) => {
				if(error) {
					manager.reportError(error);
				}

				return manager.writeFile(bundle.target, code);
			}).
			catch(manager.reportError); // XXX: kind of redundant?
	});
};

// removes properties from object, returning their respective values
function extract(obj, ...props) {
	return props.map(prop => {
		let value = obj[prop];
		delete obj[prop];
		return value;
	});
}

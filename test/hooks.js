// monkey-patches faucet-pipeline to `require` local repository as faucet-pipeline-js

let hook = require("node-hook");
let path = require("path");

let faucetJS = path.resolve(__dirname, "..");

hook.hook(".js", (src, name) => {
	if(/\/faucet-pipeline\/index.js$/.test(name)) {
		return src.replace("faucet-pipeline-js", faucetJS);
	}

	return src;
});

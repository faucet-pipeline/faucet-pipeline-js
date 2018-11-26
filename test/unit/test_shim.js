"use strict";

// skip tests using modern syntax on legacy versions of Node
// NB: this is a workaround until we can drop support for Node v6
//     <https://github.com/faucet-pipeline/faucet-pipeline-core/issues/49>
let major = process.version.split(".")[0].substr(1);
if(parseInt(major, 10) > 6) {
	require("./_test_virtual");
}

import "babel-polyfill";

main();

async function main() {
	let res = await retrieve();
	console.log(res);
}

async function retrieve() {
	return new Promise(resolve => {
		setTimeout(_ => {
			let res = Math.random();
			resolve(res);
		}, 100);
	});
}

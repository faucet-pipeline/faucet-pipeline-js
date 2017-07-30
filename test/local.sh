if [ -z "$root" ]; then
	echo 'ERROR: `$root` is undefined'
	exit 1
fi

faucet="require('$root/test/hooks.js'); require('$root/node_modules/.bin/faucet');"

function faucet {
	args="$@"
	node -e "$faucet" -- "" "$@"
}

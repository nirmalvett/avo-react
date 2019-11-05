cd static || exit 1
node --max_old_space_size=8192 node_modules/webpack/bin/webpack.js --progress --config webpack.config.js
cd ..

cd static || exit 1
NODE_ENV=production node --max_old_space_size=8192 node_modules/webpack/bin/webpack.js -p --progress --config webpack.config.js
cd ..

module.exports = {
    "presets": [
        "@babel/preset-react",
        ['@babel/preset-env', {targets: {node: 'current'}}],
        '@babel/preset-typescript',
    ],
    "plugins": [
        "@babel/plugin-proposal-object-rest-spread",
        "@babel/plugin-proposal-class-properties",
        "@babel/plugin-transform-runtime"
    ]
};

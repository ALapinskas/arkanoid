import * as path from "path";

var config = {
    entry: "./src/index.js",
    output: {
        filename: "bundle.js",
        path: path.resolve("public"),
        library: {
            type: 'module'
        },
    },
    devServer: {
        static: ["dict", "public"],
        compress: false,
        hot: false,
        open: true,
        port: 9000,
    },
    experiments: {
        outputModule: true,
    }
    //target: "web"
};

export default (env, argv) => {
    if (argv.mode === "development") {
        config.devtool = "source-map";
    }

    if (argv.mode === "production") {
        config.output.filename = "index.es6.min.js";
    }
    /*
    if (argv.mode === "production-es5") {
        config.output.filename = "index.es5.min.js";
        config.library.type = 'commonjs';
    }

    if (argv.mode === "production-global") {
        config.output.filename = "index..min.js";
        config.library.type = 'window';
    }*/
    return config;
};
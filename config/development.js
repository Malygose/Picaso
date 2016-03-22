module.exports = {
    autoInstallReferenceModule: true,
    gulp: {
        tasks: {
            gulpLess: false
        }
    },
    server: {
        less: {
            config: {
                render: {
                    compress: false
                }
            }
        }
    }
};

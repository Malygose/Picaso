module.exports = {
    server: {
        session: {
            config: {
                cookie: {
                    maxAge: 1000 * 60 * 20
                }
            }
        },
        Static: {
            config: {
                index: 'production.html'
            }
        }
    }
};

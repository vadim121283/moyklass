module.exports = {
    server: {
        port: process.env.NODE_APP_INSTANCE || 8081,
        lifeTime: process.env.NODE_LIFE_TIME || '', // For auto rebooting features use 'ms','m','s','h','d' suffix for this variable, for example 12h
    },
    db: {
        username: process.env.DATABASE_USERNAME_DEV || 'moyklass',
        password: process.env.DATABASE_PASSWORD_DEV || 'moyklass',
        database: process.env.DATABASE_NAME_DEV || 'moyklass',
        sql: {
            host: '127.0.0.1',
            dialect: 'postgres',
            pool: {
                max: 5,
                min: 0,
                idle: 10000
            },
            define: {
                timestamps: false
            },
        },
    },
};

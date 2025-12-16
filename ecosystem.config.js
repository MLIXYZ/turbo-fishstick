module.exports = {
    apps: [
        {
            name: 'game-key-store',
            cwd: './server',
            script: './dist/server.js',
            instances: 1,
            exec_mode: 'cluster',
            env: {
                NODE_ENV: 'production',
            },
            error_file: './logs/err.log',
            out_file: './logs/out.log',
            log_file: './logs/combined.log',
            time: true,
            max_memory_restart: '500M',
            autorestart: true,
            watch: false,
        },
    ],
}

/**
 * PM2 ecosystem config for production deploy on the dedicated server.
 * Run: pm2 start ecosystem.config.cjs --env production
 */
module.exports = {
  apps: [
    {
      name: 'informational-site',
      script: '.next/standalone/server.js',
      cwd: __dirname,
      instances: 1,
      exec_mode: 'fork',
      max_memory_restart: '768M',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        HOSTNAME: '127.0.0.1',
      },
    },
  ],
}

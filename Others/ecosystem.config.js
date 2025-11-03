module.exports = {
  apps: [{
    name: 'freightpro-backend',
    script: './dist/server.js',
    cwd: '/var/www/api', // Update this to your VPS backend path
    instances: 1, // Use 'max' for cluster mode on VPS
    exec_mode: 'fork',
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 4000 // Adjust if needed
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 4000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    // Environment variables loaded from .env file
    env_file: './.env'
  }]
};

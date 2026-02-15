module.exports = {
  apps: [
    {
      name: 'school-cafe-backend',
      script: 'backend/server.js',
      cwd: 'C:/school-cafe',
      watch: false,
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: 'C:/school-cafe/logs/backend-error.log',
      out_file: 'C:/school-cafe/logs/backend-out.log',
      time: true,
      interpreter: 'node',
      node_args: '--es-module-specifier-resolution=node'
    },
    {
      name: 'school-cafe-frontend',
      script: 'node_modules/.bin/vite',
      args: '--port 5173 --host',
      cwd: 'C:/school-cafe/frontend',
      watch: false,
      env: {
        NODE_ENV: 'development'
      },
      error_file: 'C:/school-cafe/logs/frontend-error.log',
      out_file: 'C:/school-cafe/logs/frontend-out.log',
      time: true,
      interpreter: 'node'
    }
  ]
};

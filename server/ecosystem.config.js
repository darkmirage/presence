// pm2 ecosystem file
module.exports = {
  apps : [{
    name: "presence-server",
    script: "./dist/server.js",
    exp_backoff_restart_delay: 100,
    env: {
      NODE_ENV: "development",
      ENV: "dev",
      SOCKETCLUSTER_PORT: 8000
    },
    env_production: {
      NODE_ENV: "production",
      ENV: "prod",
      SOCKETCLUSTER_PORT: 8080,
      WIREPLACE_SSL_CERT: "/etc/letsencrypt/live/server.wireplace.net/fullchain.pem",
      WIREPLACE_SSL_KEY: "/etc/letsencrypt/live/server.wireplace.net/privkey.pem"
    }
  }]
}
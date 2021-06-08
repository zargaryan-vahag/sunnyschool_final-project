import env from '../../env.json';

module.exports = {
  apiURL() {
    return `${env.BACKEND_PROTOCOL}://${env.BACKEND_HOST}:${env.BACKEND_PORT}`
  },
  ...env,
};

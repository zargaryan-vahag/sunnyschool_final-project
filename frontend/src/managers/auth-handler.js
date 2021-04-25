import { getToken, delToken } from './token-manager';
import config from '../../env.json';

module.exports = async () => {
  const token = getToken();
  let userData;

  if (token) {
    userData = await (
      await fetch(
        `${config.BACKEND_PROTOCOL}://${config.BACKEND_HOST}:${config.BACKEND_PORT}/auth/user`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            accessToken: token,
          }),
        }
      )
    ).json();
  }

  if (userData && userData.success) {
    return userData;
  }
  delToken();
  return null;
};

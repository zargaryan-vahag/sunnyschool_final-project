import { getToken, delToken } from '../../managers/token-manager';
import { apiURL } from '../config';

export default async function authUser() {
  const token = getToken();
  if (!token) {
    return null;
  }

  const userData = await (
    await fetch(apiURL() + '/auth/user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        accessToken: getToken(),
      }),
    }
  )).json();

  if (userData.success) {
    return userData;
  }

  delToken();
  return null;
}

import { getToken } from '../../managers/token-manager';
import { apiURL } from '../config';

export default async function getUserByUsername(username) {
  return (await fetch(
    apiURL() + '/users/username/' + username, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        accesstoken: getToken(),
      },
    }
  )).json();
}

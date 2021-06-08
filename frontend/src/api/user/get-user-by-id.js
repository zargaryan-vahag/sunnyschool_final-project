import { getToken } from '../../managers/token-manager';
import { apiURL } from '../config';

export default async function getUserById(userId) {
  return (await fetch(
    apiURL() + '/users/id/' + userId, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        accesstoken: getToken(),
      },
    }
  )).json();
}

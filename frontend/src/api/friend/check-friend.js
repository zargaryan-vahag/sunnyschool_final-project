import { getToken } from '../../managers/token-manager';
import { apiURL } from '../config';

export default async function checkFriend(userId) {
  return (await fetch(
    apiURL() + "/users/isfriend/" + userId, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        accesstoken: getToken(),
      }
    }
  )).json();
}

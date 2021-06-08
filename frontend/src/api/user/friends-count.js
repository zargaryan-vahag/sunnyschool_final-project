import { getToken } from '../../managers/token-manager';
import { apiURL } from '../config';

export default async function friendsCount(userId) {
  return (await fetch(
    apiURL() + "/users/friendscount/" + userId, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        accesstoken: getToken(),
      }
    }
  )).json();
}

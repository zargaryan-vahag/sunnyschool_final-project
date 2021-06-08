import { getToken } from '../../managers/token-manager';
import { apiURL } from '../config';

export default async function refuseFriendRequest(userId) {
  return (await fetch(
    apiURL() + "/users/refusefriend/" + userId, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        accesstoken: getToken(),
      }
    }
  )).json();
}

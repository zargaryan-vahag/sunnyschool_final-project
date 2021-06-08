import { getToken } from '../../managers/token-manager';
import { apiURL } from '../config';

export default async function unfriend(userId) {
  return (await fetch(
    apiURL() + "/users/unfriend/" + userId, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        accesstoken: getToken(),
      }
    }
  )).json();
}

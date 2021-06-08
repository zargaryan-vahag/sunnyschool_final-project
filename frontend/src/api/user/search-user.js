import { getToken } from '../../managers/token-manager';
import { apiURL } from '../config';

export default async function searchUser(q) {
  return (await fetch(
    apiURL() + '/users?q=' + q, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        accesstoken: getToken(),
      }
    }
  )).json();
}

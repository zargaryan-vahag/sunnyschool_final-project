import { getToken } from '../../managers/token-manager';
import { apiURL } from '../config';

export default async function searchCommunity(q) {
  return (await fetch(
    apiURL() + '/communities?q=' + q, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        accesstoken: getToken(),
      }
    }
  )).json();
}

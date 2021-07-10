import { getToken } from '../../managers/token-manager';
import { apiURL } from '../config';

export default async function createCommunity(name) {
  return (await fetch(apiURL() + '/communities', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      accesstoken: getToken(),
    },
    body: JSON.stringify({ name }),
  })).json();
}

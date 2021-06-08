import { getToken } from '../../managers/token-manager';
import { apiURL } from '../config';

export default async function getDialogs() {
  return (await fetch(
    apiURL() + '/dialogs', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        accesstoken: getToken(),
      },
    }
  )).json();
}

import { getToken } from '../../managers/token-manager';
import { apiURL } from '../config';

export default async function editUser(values) {
  return (await fetch(
    apiURL() + '/users', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        accesstoken: getToken(),
      },
      body: JSON.stringify(values),
    }
  )).json();
}

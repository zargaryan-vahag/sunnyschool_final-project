import { getToken } from '../../managers/token-manager';
import { apiURL } from '../config';

export default async function delUserAvatar() {
  return (await fetch(
    apiURL() + "/users/avatar", {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        accesstoken: getToken(),
      },
    }
  )).json();
}

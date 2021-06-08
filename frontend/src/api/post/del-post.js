import { getToken } from '../../managers/token-manager';
import { apiURL } from '../config';

export default async function delPost(postId) {
  return (await fetch(
    apiURL() + '/posts', {
      method: "DELETE",
      headers: {
        'Content-type': 'application/json',
        accesstoken: getToken(),
      },
      body: JSON.stringify({ postId })
    }
  )).json();
}

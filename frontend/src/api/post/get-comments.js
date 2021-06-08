import { getToken } from '../../managers/token-manager';
import { apiURL } from '../config';

export default async function getComments({ postId, page }) {
  return (await fetch(
    apiURL() + '/posts/comments/' + postId + '?page=' + page,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        accesstoken: getToken(),
      }
    }
  )).json();
}

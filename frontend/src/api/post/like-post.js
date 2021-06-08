import { getToken } from '../../managers/token-manager';
import { apiURL } from '../config';

export default async function likePost(postId) {
  return (await fetch(
    apiURL() + '/posts/like/' + postId, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        accesstoken: getToken(),
      }
    }
  )).json();
}

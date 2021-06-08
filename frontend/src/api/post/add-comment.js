import { getToken } from '../../managers/token-manager';
import { apiURL } from '../config';

export default async function addComment({ postId, text }) {
  return (await fetch(
    apiURL() + '/posts/comments/' + postId, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        accesstoken: getToken(),
      },
      body: JSON.stringify({ text })
    }
  )).json();
}

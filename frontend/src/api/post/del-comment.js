import { getToken } from '../../managers/token-manager';
import { apiURL } from '../config';

export default async function delComment({ postId, commentId }) {
  return (await fetch(
    apiURL() + '/posts/comments/' + postId, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        accesstoken: getToken(),
      },
      body: JSON.stringify({ commentId: commentId })
    }
  )).json();
}

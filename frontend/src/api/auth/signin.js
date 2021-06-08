import { apiURL } from '../config';

export default async function signin({ login, password }) {
  return (await fetch(
    apiURL() + '/auth/signin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        login,
        password,
      }),
    }
  )).json();
}

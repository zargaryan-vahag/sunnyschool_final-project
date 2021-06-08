import { apiURL } from '../config';

export default async function signup({
  email,
  username,
  firstname,
  lastname,
  password,
  verifypassword,
}) {
  return (await fetch(
    apiURL() + '/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        username,
        firstname,
        lastname,
        password,
        verifypassword,
      }),
    }
  )).json();
}

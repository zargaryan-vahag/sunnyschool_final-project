import React from 'react';
import CircularProgress from '@material-ui/core/CircularProgress';
import MuiAlert from '@material-ui/lab/Alert';
// import Link from '@material-ui/core/Link';
import Link from '../components/link';

import Info from '../components/info.js';
import config from '../../env.json';

export default function Verify() {
  async function verify() {
    const params = new URL(window.location.href).searchParams;
    const token = params.get('token');
    let response;
    if (token) {
      response = await (
        await fetch(
          `${config.BACKEND_PROTOCOL}://${config.BACKEND_HOST}:${config.BACKEND_PORT}/auth/verify`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              verifyToken: token,
            }),
          }
        )
      ).json();
    }
    setVerifyInfo(response);
  }

  const [verifyInfo, setVerifyInfo] = React.useState(null);

  React.useEffect(() => {
    verify();
  }, [setVerifyInfo]);

  if (verifyInfo) {
    if (verifyInfo.success) {
      return (
        <MuiAlert elevation={6} variant="filled" severity="success">
          Your account was successfully verified, click{' '}
          <Link to="/signin" color="inherit">
            Here
          </Link>{' '}
          to login
        </MuiAlert>
      );
    }
    return (
      <MuiAlert elevation={6} variant="filled" severity="error">
        Something went wrong ;(
      </MuiAlert>
    );
  }
  return (
    <Info text="" component={() => <CircularProgress color="inherit" />} />
  );
}

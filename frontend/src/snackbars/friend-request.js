import React, { Fragment } from 'react';
import Box from '@material-ui/core/Box';
import PropTypes from 'prop-types';

import Link from '../components/link';
import UserAvatar from '../components/user-avatar';

export default function FriendRequestBar(props) {
  return (
    <Fragment>
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="flex-end"
        width={240}
      >
        <Box display="flex" alignItems="center">
          <Box mr={1}>
            <UserAvatar
              username={props.username}
              imageName={props.imageName}
              imageWidth={30}
            />
          </Box>
          <Box>
            <Link
              to={"/profile/" + props.username}
              style={{
                color: 'white',
              }}
            >
              {props.firstname} {props.lastname}
            </Link>
          </Box>
        </Box>
        <Box>
          <Link
            to={"/profile/" + props.username}
            style={{
              color: 'white',
            }}
          >
            New friend request
          </Link>
        </Box>
      </Box>
    </Fragment>
  );
}

FriendRequestBar.propTypes = {
  firstname: PropTypes.string,
  lastname: PropTypes.string,
  username: PropTypes.string,
  imageName: PropTypes.string,
};

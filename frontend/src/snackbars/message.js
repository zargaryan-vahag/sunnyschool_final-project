import React, { Fragment } from 'react';
import Box from '@material-ui/core/Box';
import PropTypes from 'prop-types';

import Link from '../components/link';
import UserAvatar from '../components/user-avatar';

export default function NewMessageBar(props) {
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
              username={props.senderData.username}
              imageName={props.senderData.avatar}
              imageWidth={30}
            />
          </Box>
          <Box>
            <Link
              to={"/profile/" + props.senderData.username}
              style={{
                color: 'white',
              }}
            >
              {props.senderData.firstname} {props.senderData.lastname}
            </Link>
          </Box>
        </Box>
        <Box>
          <Link
            to={"/dialog/" + props.senderData._id}
            style={{
              color: 'white',
            }}
          >
            {props.text}
          </Link>
        </Box>
      </Box>
    </Fragment>
  );
}

NewMessageBar.propTypes = {
  senderData: PropTypes.object.isRequired,
  text: PropTypes.string.isRequired,
};

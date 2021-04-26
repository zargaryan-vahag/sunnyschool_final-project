import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/styles';
import Box from '@material-ui/core/Box';
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord';

import Link from './link';
import config from '../../env.json';

const useStyles = makeStyles({
  onlineStatus: {
    display: 'flex',
    justifyContent: 'center',
    padding: '0.5px',
    backgroundColor: 'white',
    borderRadius: '1000px',
    color: '#4BB34B',
    position: 'absolute',
    right: '-2%',
    bottom: '-2%',
  },
  avatar: {
    position: 'relative',
  }
});

export default function UserAvatar({ username, imageName, imageWidth, link, showOnlineStatus }) {
  const classes = useStyles();
  
  return (
    <Box
      width={imageWidth + 'px'}
      height={imageWidth + 'px'}
      className={showOnlineStatus ? classes.avatar : ''}
    >
      <Box
        width={imageWidth + 'px'}
        height={imageWidth + 'px'}
        borderRadius='1000px'
        overflow='hidden'
        display='flex'
        justifyContent='center'
        alignItems='center'
      >
        {link ? (
          <Link to={'/profile/' + username}>
            <img
              src={[
                config.BACKEND_PROTOCOL + '://' +
                config.BACKEND_HOST + ':' +
                config.BACKEND_PORT + '/uploads/' +
                imageName
              ]}
              style={{
                width: '100%',
              }}
            />
          </Link>
        ) : (
          <img
            src={[
              config.BACKEND_PROTOCOL + '://' +
              config.BACKEND_HOST + ':' +
              config.BACKEND_PORT + '/uploads/' +
              imageName
            ]}
            style={{
              width: '100%',
            }}
          />
        )}
      </Box>
      {showOnlineStatus && (
        <span className={classes.onlineStatus}>
          <FiberManualRecordIcon style={{
            fontSize: (imageWidth * 13 / 40) + 'px',
          }}/>
        </span>
      )}
    </Box>
  );
}

UserAvatar.defaultProps = {
  link: true,
  showOnlineStatus: false,
}

UserAvatar.propTypes = {
  username: PropTypes.string.isRequired,
  imageName: PropTypes.string.isRequired,
  imageWidth: PropTypes.number.isRequired,
  link: PropTypes.bool,
  showOnlineStatus: PropTypes.bool,
};

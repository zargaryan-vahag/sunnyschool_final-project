import React from 'react';
import PropTypes from 'prop-types';
import Box from '@material-ui/core/Box';

import Link from './link';
import config from '../../env.json';

export default function UserAvatar({ username, imageName, imageWidth, link }) {
  return (
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
  );
}

UserAvatar.defaultProps = {
  link: true,
}

UserAvatar.propTypes = {
  username: PropTypes.string.isRequired,
  imageName: PropTypes.string.isRequired,
  imageWidth: PropTypes.number.isRequired,
  link: PropTypes.bool,
};

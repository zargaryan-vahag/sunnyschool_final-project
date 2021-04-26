import React from 'react';
import Moment from 'react-moment';
import moment from 'moment';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Tooltip from '@material-ui/core/Tooltip';

import Link from './link';
import UserAvatar from './user-avatar';

const useStyles = makeStyles((theme) => ({
  date: {
    color: theme.palette.text.secondary,
  }
}))

export default function UserMessage(props) {
  const classes = useStyles();
  
  return (
    <Box display="flex" mt={2} mr={2} mb={2}>
      <Box mr={1}>
        <UserAvatar
          username={props.authorData.username}
          imageName={props.authorData.avatar}
          imageWidth={props.imageWidth}
        />
      </Box>
      <Box>
        <Box display="flex" justifyContent="flex-start">
          <Box>
            <Link to={'/profile/' + props.authorData.username}>
              {props.authorData.firstname + " " + props.authorData.lastname}
            </Link>
          </Box>
          <Box className={classes.date} ml={1}>
            <Tooltip title={
              <Moment format="YYYY.MM.DD hh:mm">
                {props.postData.createdAt}
              </Moment>
            }>
              {<Moment fromNow>{props.postData.createdAt}</Moment>}
            </Tooltip>
          </Box>
        </Box>
        <Box>
          {props.content}
        </Box>
      </Box>
    </Box>
  );
}

UserMessage.defaultProps = {
  imageWidth: 40,
};

UserMessage.propTypes = {
  authorData: PropTypes.object.isRequired,
  postData: PropTypes.object.isRequired,
  imageWidth: PropTypes.number,
  content: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.string,
    PropTypes.element,
  ])
};

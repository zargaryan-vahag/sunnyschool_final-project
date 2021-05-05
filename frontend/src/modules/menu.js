import React, { useEffect, useState, useContext, useCallback } from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import EventIcon from '@material-ui/icons/Event';
import MessageIcon from '@material-ui/icons/Message';
import SupervisorAccountIcon from '@material-ui/icons/SupervisorAccount';
import PeopleIcon from '@material-ui/icons/People';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord';
import { Box } from '@material-ui/core';

import { SocketContext } from '../context/socket';
import Link from '../components/link';

const items = [
  {
    name: 'My profile',
    label: 'My profile',
    link: '/profile',
    icon: AccountCircleIcon,
  },
  {
    name: 'News',
    label: 'News',
    link: '/news',
    icon: EventIcon,
  },
  {
    name: 'Messages',
    label: 'Messages',
    link: '/dialogs',
    icon: MessageIcon,
  },
  {
    name: 'Friends',
    label: 'Friends',
    link: '/friends',
    icon: SupervisorAccountIcon,
  },
  // {
  //   name: 'Communities',
  //   label: 'Communities',
  //   link: '/communities',
  //   icon: PeopleIcon,
  // },
];

const menuStyles = makeStyles({
  icon: {
    marginRight: '5px',
  },
  link: {
    '&:hover': {
      textDecoration: 'none',
    },
  },
  listItem: {
    paddingLeft: '5px',
  },
});

export default function Menu(props) {
  const classes = menuStyles();
  const socket = useContext(SocketContext);
  const [unreadMessage, setUnreadMessage] = useState(false);

  const hasUnreadMessage = useCallback((data) => {
    setUnreadMessage(data.has);
  }, [unreadMessage]);

  const newMessage = useCallback((data) => {
    if (
      props.match.path != "/dialog/:userId" &&
      props.userData._id != data.messages[0].userId._id
    ) {
      setUnreadMessage(true);
    }
  }, [unreadMessage]);

  useEffect(() => {
    socket.emit("has_unread_message");

    socket.on("new_message", newMessage);
    socket.on("has_unread_message", hasUnreadMessage);

    return () => {
      socket.off("new_message", newMessage);
      socket.off("has_unread_message", hasUnreadMessage);
    };
  }, []);

  return (
    <List disablePadding dense>
      {items.map((item) => (
        <Link
          key={item.name}
          to={`${item.link}/${
            item.name == 'My profile' ? props.userData.username : 
            item.name == 'Friends' ? props.userData._id : ''
          }`}
          color="inherit"
          className={classes.link}
        >
          <ListItem className={classes.listItem} button>
            <item.icon className={classes.icon} />
            <ListItemText>
              <Box
                display="flex"
                justifyContent="space-between"
              >
                <Box>
                  {item.label}
                </Box>
                <Box>
                  {item.name == "Messages" && ( 
                    <FiberManualRecordIcon style={{
                      visibility: (unreadMessage) ? 'unset' : 'hidden',
                      color: '#3f51b5',
                      fontSize: '10px',
                      marginLeft: '10px',
                    }}/>
                  )}
                </Box>
              </Box>
            </ListItemText>
          </ListItem>
        </Link>
      ))}
    </List>
  );
}

Menu.propTypes = {
  userData: PropTypes.object.isRequired,
};

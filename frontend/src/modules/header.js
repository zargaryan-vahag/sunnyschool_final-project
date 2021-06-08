import React, { useRef, useEffect, useState, useCallback, useContext } from 'react';
import PropTypes from 'prop-types';
import { SnackbarProvider } from 'notistack';
import { makeStyles } from '@material-ui/core/styles';
import { AppBar, Toolbar, Typography, Button } from '@material-ui/core';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Grow from '@material-ui/core/Grow';
import Paper from '@material-ui/core/Paper';
import Popper from '@material-ui/core/Popper';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import MenuList from '@material-ui/core/MenuList';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import NotificationsIcon from '@material-ui/icons/Notifications';
import Badge from '@material-ui/core/Badge';
import Box from '@material-ui/core/Box';

import { getFriendRequests, getFriendRequestsCount } from '../api/friend';
import config from '../api/config';
import { SocketContext } from '../context/socket';
import Link from '../components/link';
import UserAvatar from '../components/user-avatar';
import Search from '../components/search';
import { getToken, delToken } from '../managers/token-manager';
import FriendRequestBar from '../snackbars/friend-request';
import NewMessageBar from '../snackbars/message';

const useStyles = makeStyles((theme) => ({
  logo: {
    fontFamily: 'Work Sans, sans-serif',
    fontWeight: 600,
    color: '#FFFEFE',
    textAlign: 'left',
    textDecoration: 'none',
  },
  toolbar: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  header: {
    display: 'flex',
    justifyContent: 'center',
    flexDirection: 'row',
    zIndex: '800',
  },
  container: {
    maxWidth: '1000px',
    width: '100%',
  },
  root: {
    display: 'flex',
  },
  paper: {
    marginRight: theme.spacing(2),
  },
  menu: {
    textTransform: 'none',
  },
  snackBar: {
    zIndex: 500,
  },
}));

export default function Header(props) {
  function logout() {
    delToken();
    location.href = '/';
  }

  function handleListKeyDown(event) {
    if (event.key === 'Tab') {
      event.preventDefault();
      setOpen(false);
    }
  }

  function handleToggle() {
    setOpen((prevOpen) => !prevOpen);
  }

  function handleClose(event) {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }

    setOpen(false);
  }

  async function handleNoteClick (event) {
    setAnchorEl(event.currentTarget);
    const fRequests = await getFriendRequests();
    setNotes(fRequests.data);
  }

  function handleNoteClose () {
    setAnchorEl(null);
  }

  const classes = useStyles();
  const [anchorEl, setAnchorEl] = useState(null);
  const openMenu = Boolean(anchorEl);

  const [open, setOpen] = useState(false);
  const anchorRef = useRef(null);
  const prevOpen = useRef(open);
  const providerRef = useRef();

  const [notes, setNotes] = useState([]);
  const [noteCount, setNoteCount] = useState(0);

  if (props.userData) {
    const socket = useContext(SocketContext);
    const notificationAudio = new Audio(config.NOTIFICATIONSOUND)

    const friendRequest = useCallback((data) => {
      setNoteCount((noteCount) => (noteCount + 1));
      
      try {
        notificationAudio.play();
      } catch (e) {  }

      providerRef.current.enqueueSnackbar("", {
        autoHideDuration: 5000,
        action: () => <FriendRequestBar 
          firstname={data.firstname}
          lastname={data.lastname}
          username={data.username}
          imageName={data.avatar}
        />
      });
    }, [noteCount]);

    const decrementNotes = useCallback(() => {
      setNoteCount((noteCount) => (noteCount - 1));
    }, [noteCount]);

    useEffect(() => {
      socket.on("friend_request", friendRequest);
      socket.on("refused_friend_request", decrementNotes);

      return () => {
        socket.off("friend_request", friendRequest);
      };
    }, []);

    if (props.match.path != "/dialog/:userId") {
      const messageAudio = new Audio(config.MESSAGESOUND);

      const newMessage = useCallback((data) => {
        if (props.userData._id != data.messages[0].userId._id) {
          try {
            messageAudio.play();
          } catch (e) {  }

          providerRef.current.enqueueSnackbar("", {
            autoHideDuration: 5000,
            action: () => <NewMessageBar
              senderData={data.messages[0].userId}
              text={data.messages[0].text}
            />
          });
        }
      }, []);

      useEffect(() => {
        socket.on("new_message", newMessage);

        return () => {
          socket.off("new_message", newMessage);
        };
      }, []);
    }
  }

  useEffect(() => {
    if (prevOpen.current === true && open === false) {
      anchorRef.current.focus();
    }
    prevOpen.current = open;
  }, [open]);

  useEffect(async () => {
    if (props.userData) {
      const fRequestCount = await getFriendRequestsCount();
      setNoteCount(fRequestCount.data);
    }
  }, []);

  return (
    <>
      <SnackbarProvider
        classes={{
          containerRoot: classes.snackBar,
        }}
        ref={providerRef}
        maxSnack={5}
        style={{
          maxWidth: '200px',
          width: '100%',
          minHeight: '50px',
          maxHeight: '160px',
          overflow: 'hidden',
          wordWrap: 'break-word',
          marginLeft: '0px',
        }}
      >
      </SnackbarProvider>
      <AppBar className={classes.header}>
        <Toolbar className={`${classes.toolbar} ${classes.container}`}>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-around"
          >
            <Box>
              <Link to="/" style={{ color: 'white' }} className={classes.logo}>
                <Typography variant="h6" component="h1">
                  Sunny media
                </Typography>
              </Link>
            </Box>
            <Box ml={2} height={'100%'}>
              {props.userData ? (
                <Search />
              ) : null}
            </Box>
          </Box>
          <div>
            {props.userData ? (
              <>
                <Box display="flex" alignItems="center">
                  <Box mr={2}>
                    <Button
                      size="large"
                      style={{
                        color: 'white'
                      }}
                      onClick={handleNoteClick}
                    >
                      <Badge
                        badgeContent={noteCount}
                        color="secondary"
                      >
                        <NotificationsIcon />
                      </Badge>
                    </Button>
                    <Menu
                      id="long-menu"
                      anchorEl={anchorEl}
                      keepMounted
                      open={openMenu}
                      onClose={handleNoteClose}
                      PaperProps={{
                        style: {
                          maxHeight: 45 * 4.5,
                          width: '400px',
                        },
                      }}
                    >
                      {notes.map((note) => {
                        return (
                          <MenuItem key={note._id}>
                            <Link to={"/profile/" + note.from.username}>
                              {note.from.firstname} {note.from.lastname} sent friend request to you
                            </Link>
                          </MenuItem>
                        );
                      })}
                    </Menu>
                  </Box>
                  <Box>
                    <Button
                      className={classes.menu}
                      ref={anchorRef}
                      aria-controls={open ? 'menu-list-grow' : undefined}
                      aria-haspopup="true"
                      color="inherit"
                      onClick={handleToggle}
                    >
                      <span style={{marginRight: '5px'}}>{props.userData.firstname}</span>
                      <UserAvatar
                        username={props.userData.username}
                        imageName={props.userData.avatar}
                        imageWidth={40}
                        link={false}
                      />
                      <ExpandMoreIcon />
                    </Button>
                    <Popper open={open} anchorEl={anchorRef.current} role={undefined} transition disablePortal>
                      {({ TransitionProps, placement }) => (
                        <Grow
                          {...TransitionProps}
                          style={{ transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom' }}
                        >
                          <Paper>
                            <ClickAwayListener onClickAway={handleClose}>
                              <MenuList autoFocusItem={open} id="menu-list-grow" onKeyDown={handleListKeyDown}>
                                <MenuItem onClick={(e) => {
                                  handleClose(e);
                                }}>
                                  <Link to={'/profile/' + props.userData.username}>Profile</Link>
                                </MenuItem>

                                <MenuItem onClick={(e) => {
                                  handleClose(e);
                                }}>
                                  <Link to='/edit'>Settings</Link>
                                </MenuItem>
                                <hr />
                                <MenuItem onClick={(e) => {
                                  handleClose(e);
                                  logout();
                                }}>
                                  Logout
                                </MenuItem>
                              </MenuList>
                            </ClickAwayListener>
                          </Paper>
                        </Grow>
                      )}
                    </Popper>
                  </Box>
                </Box>
              </>
            ) : (
              <Link to="/signin" color="inherit" style={{ color: 'white' }}>
                <Button color="inherit">Sign in</Button>
              </Link>
            )}
          </div>
        </Toolbar>
      </AppBar>
      <div style={{ marginBottom: '70px' }} />
    </>
  );
}

Header.propTypes = {
  userData: PropTypes.object,
};

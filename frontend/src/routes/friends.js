import React, { useEffect, useState } from 'react';
import { useBottomScrollListener } from 'react-bottom-scroll-listener';
import StickyBox from "react-sticky-box";
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import CheckIcon from '@material-ui/icons/Check';
import Paper from '@material-ui/core/Paper';
import CircularProgress from '@material-ui/core/CircularProgress';

import config from '../../env.json';
import Header from '../modules/header';
import Main from '../modules/main';
import Footer from '../modules/footer';
import Info from '../components/info.js';
import Link from '../components/link';
import UserAvatar from '../components/user-avatar';
import { getToken } from '../managers/token-manager';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    fontFamily: 'arial',
    display: 'flex',
    justifyContent: 'center',
  },
  paper: {
    width: "100%",
    padding: theme.spacing(2),
  },
  tabsRoot: {
    backgroundColor: theme.palette.background.paper,
    padding: '5px 10px',
  },
}));

export default function Index(props) {
  function handleClick (event) {
    setAnchorEl(event.currentTarget);
  }

  function handleClose () {
    setAnchorEl(null);
  }

  async function unfriend(e, id) {
    console.log(e.currentTarget);
    // const res = await (await fetch(
    //   baseURL + "/users/unfriend/" + id,
    //   {
    //     method: 'DELETE',
    //     headers: {
    //       'Content-Type': 'application/json',
    //       accesstoken: getToken(),
    //     }
    //   }
    // )).json();
    
    // if (res.success) {   
      // const friendsList = [];
      // console.log(id);

      // if (props.match.params.userId == props.userData._id) {
      //   friends.map((friend) => {
      //     if (friend._id != id) friendsList.push(friend);
      //   });
      // } else {
      //   friends.map((friend) => {
      //     if (friend._id == id) {
      //       friend.isFriend = false;
      //     }
      //     friendsList.push(friend);
      //   });
      // }

      // setFriends(friendsList);
    // }
  }

  async function getFriends(userId, page) {
    return (await fetch(
      baseURL + "/users/friends/" + userId + "?page=" + page,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          accesstoken: getToken(),
        }
      }
    )).json();
  }
  
  const classes = useStyles();
  const baseURL = config.BACKEND_PROTOCOL + "://" + config.BACKEND_HOST + ":" + config.BACKEND_PORT;

  const [anchorEl, setAnchorEl] = useState(null);
  const openMenu = Boolean(anchorEl);

  const [user, setUser] = useState(null);
  const [friends, setFriends] = useState({
    success: false,
    page: 1,
    data: []
  });
  const [end, setEnd] = useState(false);

  useBottomScrollListener(async () => {
    if (end) return;

    if (user && user.success) {
      friends.page++;
      const newFriends = await getFriends(user.data._id, friends.page);
      
      setFriends({
        success: true,
        data: [...friends.data, ...newFriends.data],
        page: friends.page
      });

      if (newFriends.data.length == 0) {
        setEnd(true);
      }
    }
  });

  useEffect(async () => {
    let userId;
    if (props.match.params.userId == props.userData._id) {
      userId = props.userData._id;
      setUser({
        success: true,
        data: props.userData,
      });
    } else {
      const User = await (
        await fetch(
          baseURL + "/users/id/" + props.match.params.userId,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              accesstoken: getToken(),
            },
          }
        )
      ).json();
      userId = User.data._id;
      setUser(User);
    }

    const friends = await getFriends(userId, 1);
    friends.page = 1;
    
    if (friends.success) {
      setFriends(friends);
    }
  }, [props.match.params.userId]);
  
  if (user) {
    if (user.success) {
      return (
        <>
          <Header {...props} />
          <Main {...props}>
            <Grid container spacing={1}>
              <Grid item xs={9}>
                {friends.success && friends.data.length == 0 ? (
                  <Info text="Friends list is empty ;("/>
                ) : (
                  <Paper className={classes.paper}>
                    {friends.success && friends.data.map((friend) => {
                      return (
                        <Box
                          key={friend._id}
                          display="flex"
                          style={{
                            borderBottom: 'solid 1px darkgrey',
                            paddingBottom: '10px',
                            marginTop: '20px',
                          }}
                        >
                          <Box mr={1}>
                            <UserAvatar
                              username={friend.username}
                              imageName={friend.avatar}
                              imageWidth={100}
                            />
                          </Box>
                          <Grid
                            container
                            direction="column"
                            justify="space-around"
                            alignItems="flex-start"
                          >
                            <Box
                              display="flex"
                              justifyContent="space-between"
                              width="100%"
                            >
                              <Box>
                                <Link to={'/profile/' + friend.username}>
                                  {friend.firstname} {friend.lastname}
                                </Link>
                              </Box>
                              <Box>
                                {friend.isFriend == true ? (<>
                                  {/* <IconButton
                                    aria-label="more"
                                    aria-controls="long-menu"
                                    aria-haspopup="true"
                                    style={{
                                      padding: '5px',
                                    }}
                                    onClick={handleClick}
                                  > */}
                                    <CheckIcon />
                                  {/* </IconButton>
                                  <Menu
                                    id="long-menu"
                                    anchorEl={anchorEl}
                                    keepMounted
                                    open={openMenu}
                                    onClose={handleClose}
                                    PaperProps={{
                                      style: {
                                        maxHeight: 45 * 4.5,
                                        width: '20ch',
                                      },
                                    }}
                                  >
                                    <MenuItem id={friend._id} onClick={(e) => {
                                      handleClose();
                                      unfriend(e, friend._id);
                                    }}>
                                      Unfriend
                                    </MenuItem>
                                  </Menu> */}
                                </>) : null}
                              </Box>
                            </Box>
                            <Box>
                              {friend.hometown}
                            </Box>
                            <Box>
                              <Link to={'/dialog/' + friend._id}>Write message</Link>
                            </Box>
                          </Grid>
                        </Box>
                      );
                    })}
                  </Paper>
                )}
              </Grid>
              <Grid item xs={3}>
                <StickyBox offsetTop={80} offsetBottom={20}>
                  <Paper>
                    <Box
                      className={classes.tabsRoot}
                      display="flex"
                      alignItems="center"
                    >
                      <Box mr={1}>
                        <UserAvatar
                          username={user.data.username}
                          imageName={user.data.avatar}
                          imageWidth={30}
                        />
                      </Box>
                      <Box>
                        <Box display="flex" justifyContent="flex-start">
                          <Link to={'/profile/' + user.data.username}>
                            {user.data.firstname + " " + user.data.lastname}
                          </Link>
                        </Box>
                        <Box>
                          <Link to={'/profile/' + user.data.username}>
                            Back to profile
                          </Link>
                        </Box>
                      </Box>
                    </Box>
                  </Paper>
                </StickyBox>
              </Grid>
            </Grid>
          </Main>
          <Footer />
        </>
      );
    } else {
      return (
        <>
          <Header {...props} />
          <Main {...props}>
            <Info text="User not found ;(" />
          </Main>
          <Footer />
        </>
      );
    }
  } else {
    return (
      <>
        <Header {...props} />
        <Main {...props}>
          <Info
            text="Loading..."
            component={() => <CircularProgress color="inherit" />}
          />
        </Main>
        <Footer />
      </>
    );
  }
}

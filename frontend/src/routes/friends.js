import React, { useEffect, useState } from 'react';
import { useBottomScrollListener } from 'react-bottom-scroll-listener';
import StickyBox from "react-sticky-box";
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import Paper from '@material-ui/core/Paper';
import CircularProgress from '@material-ui/core/CircularProgress';

import { getUserById } from '../api/user';
import { getFriends } from '../api/friend';
import Header from '../modules/header';
import Main from '../modules/main';
import Footer from '../modules/footer';
import Info from '../components/info.js';
import Link from '../components/link';
import UserAvatar from '../components/user-avatar';

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

export default function Friends(props) {  
  const classes = useStyles();
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
      const newFriends = await getFriends({
        userId: user.data._id,
        page: friends.page,
      });
      
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
      const User = await getUserById(props.match.params.userId);
      userId = User.data._id;
      setUser(User);
    }

    const friends = await getFriends({
      userId: userId,
      page: 1,
    });
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

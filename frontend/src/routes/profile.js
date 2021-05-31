import React, { useEffect, useState, useCallback, useContext } from 'react';
import PropTypes from 'prop-types';
import StickyBox from "react-sticky-box";
import FbImageLibrary from 'react-fb-image-grid';
import { useBottomScrollListener } from 'react-bottom-scroll-listener';
import { Formik, Form } from 'formik';
import { makeStyles } from '@material-ui/core/styles';
import CircularProgress from '@material-ui/core/CircularProgress';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import AttachFileIcon from '@material-ui/icons/AttachFile';

import config from '../../env.json';
import { SocketContext } from '../context/socket';
import Link from '../components/link';
import Info from '../components/info.js';
import UserInputField from '../components/user-input-field';
import AlertDialog from '../components/alert-dialog';
import Post from '../components/post';
import Thumb from '../components/thumb';
import Header from '../modules/header';
import Main from '../modules/main';
import Footer from '../modules/footer';
import { getToken } from '../managers/token-manager';
import birthday from '../managers/birthday';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    fontFamily: 'arial',
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: 'center',
  },
  profile_image: {
    width: '100%',
  },
  link: {
    '&:hover': {
      textDecoration: 'none',
    },
  },
  avatarButton: {
    color: 'darkgrey',
    textTransform: 'none',
    fontSize: '10px',
    width: '100%',
    borderRadius: '0',
    paddingTop: '5px',
    paddingBottom: '5px',
    '&:hover': {
      color: 'white',
    },
  },
  fileIcon: {
    cursor: 'pointer',
  },
  profileButtons: {
    width: '100%',
    textTransform: 'none'
  }
}));

export default function Profile(props) {
  async function postHandler(data, cb) {
    const formData = new FormData();
    formData.append('postText', data.postText);
    for (let file of data.files) {
      formData.append('files', file);
    }

    try {
      let res = await fetch(
        baseURL + "/posts",
        {
          method: 'POST',
          headers: {
            accesstoken: getToken(),
          },
          body: formData,
        }
      );
      res = await res.json();

      if (res.success) {
        cb();
        setNewPost(!newPost);
      } else {
        throw new Error(res.message);
      }
    } catch (e) {
      setTitle('Error');
      setText(e.message);
      setComponent(<></>);
      setOpen(true);
    }
  }

  async function getPosts(userId, page) {
    const Posts = await fetch(
      baseURL + "/posts/user/" +
      userId + "?action=posts&page=" + page,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          accesstoken: getToken(),
        },
      }
    )
    return Posts.json();
  }

  async function updateAvatarModal(e, options) {
    e.stopPropagation();
    setTitle('');
    setText('');
    if (options.action == "update") {
      setComponent(<>
        <Formik
          initialValues={{
            file: [],
          }}
          onSubmit={async (values) => {
            if (values.file[0]) {
              const formData = new FormData();
              formData.append('file', values.file[0]);
          
              let res = await fetch(
                baseURL + "/users/avatar",
                {
                  method: 'PATCH',
                  headers: {
                    accesstoken: getToken(),
                  },
                  body: formData,
                }
              );
              res = await res.json();
        
              if (res.success) {
                setTitle('Success');
                setText(res.message);
                setComponent(<></>);
                props.userData.avatar = res.data.avatar;
              } else {
                setTitle('Error');
                setText(res.message);
                setComponent(<></>);
              }
              setOpen(true);
            }
          }}
        >
          {({
            values,
            handleSubmit,
            setFieldValue,
          }) => (
            <Form
              className={classes.form}
              onSubmit={handleSubmit}
              encType="multipart/form-data"
            >
              <p>
                supported files {avatarExtensions.join(" ")}
              </p>
              <div>
                <Box display="flex" justifyContent="space-between">
                  <Box>
                    <IconButton style={{
                      padding: '0',
                    }}>
                      <label htmlFor="file" style={{
                        width: '25px',
                        height: '25px',
                        margin: '0px',
                      }}>
                        <AttachFileIcon className={classes.fileIcon}/>
                      </label>
                    </IconButton>
                  </Box>
                  <Box>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                    >
                      Upload
                    </Button>
                  </Box>
                </Box>
                <input
                  id="file"
                  name="file"
                  type="file"
                  style={{
                    display: 'none',
                  }}
                  onChange={(event) => {
                    if (event.currentTarget.files[0]) {
                      const mimeType = event.currentTarget.files[0].type;
                      if (avatarExtensions.includes(mimeType.split('/')[1].toUpperCase())) {
                        setText('');
                        setFieldValue('file', event.currentTarget.files);
                      } else {
                        event.currentTarget.value = [];
                        setText("Unsupported file type");
                        setFieldValue('file', []);
                      }
                    }
                  }}
                />
              </div>
              <Thumb files={values.file} />
            </Form>
          )}
        </Formik>
      </>);
      setOpen(true);
    } else if (options.action == "delete") {
      const res = await (await fetch(
        baseURL + "/users/avatar",
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            accesstoken: getToken(),
          },
        }
      )).json();

      if (res.success) {
        setTitle('Success');
        setText(res.message);
        setComponent(<></>);
        props.userData.avatar = res.data.avatar;
      } else {
        setTitle('Error');
        setText(res.message);
        setComponent(<></>);
      }
      setOpen(true);
    }
  }

  async function friendRequest(userId) {
    const res = await (await fetch(
      baseURL + "/users/friendrequest",
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          accesstoken: getToken(),
        },
        body: JSON.stringify({ to: userId })
      }
    )).json();
    
    if (res.success) {
      if (res.data.accepted) {
        setIsFriend(true);
        setRequestSent(false);
        setRequestSentFrom(false);
      } else {
        setRequestSent(true);
        setIsFriend(false);
        setRequestSentFrom(props.userData._id);
      }
    } else {
      setComponent(<></>);
      setTitle('Error');
      setText(res.message);
      setOpen(true);
    }
  }

  async function unfriend(userId) {
    const res = await (await fetch(
      baseURL + "/users/unfriend/" + userId,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          accesstoken: getToken(),
        }
      }
    )).json();
    
    if (res.success) {
      setIsFriend(false);
      setRequestSent(false);
      setRequestSentFrom(false);
    } else {
      setComponent(<></>);
      setTitle('Error');
      setText(res.message);
      setOpen(true);
    }
  }

  async function refuse(userId) {
    const res = await (await fetch(
      baseURL + "/users/refusefriend/" + userId,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          accesstoken: getToken(),
        }
      }
    )).json();
    
    if (res.success) {
      setIsFriend(false);
      setRequestSent(false);
      setRequestSentFrom(false);
    } else {
      setComponent(<></>);
      setTitle('Error');
      setText(res.message);
      setOpen(true);
    }
  }

  const classes = useStyles();
  const baseURL = config.BACKEND_PROTOCOL + "://" + config.BACKEND_HOST + ":" + config.BACKEND_PORT;
  const socket = useContext(SocketContext);
  const avatarExtensions = ['PNG', 'JPG', 'JPEG', 'GIF'];
  const genderList = ['Not selected', 'Male', 'Female']
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState({
    success: false,
    data: [],
    page: 1
  });
  const [friendsCount, setFriendsCount] = useState(null);
  const [postsCount, setPostsCount] = useState(null);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [component, setComponent] = useState(null);
  const [newPost, setNewPost] = useState(false);
  const [end, setEnd] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [requestSentFrom, setRequestSentFrom] = useState(false);
  const [isFriend, setIsFriend] = useState(false);
  const [online, setOnline] = useState(false);

  useEffect(async () => {
    let userId;
    if (props.match.params.username == props.userData.username) {
      userId = props.userData._id;
      setUser({
        success: true,
        data: props.userData,
      });
    } else {
      const User = await (
        await fetch(
          baseURL + "/users/username/" + props.match.params.username,
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
    
    const Posts = await getPosts(userId, 1);
    Posts.page = 1;
    setPosts(Posts);

    const postsCount = await (
      await fetch(
        baseURL + "/posts/user/" +
        userId + "?action=postsCount",
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            accesstoken: getToken(),
          }
        }
      )
    ).json();
    setPostsCount(postsCount);

    const friendsCount = await (
      await fetch(
        baseURL + "/users/friendscount/" + userId,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            accesstoken: getToken(),
          }
        }
      )
    ).json();
    setFriendsCount(friendsCount);

    const friendCheck = await (
      await fetch(
        baseURL + "/users/isfriend/" + userId,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            accesstoken: getToken(),
          }
        }
      )
    ).json();
    
    if (friendCheck.success) {
      setIsFriend(friendCheck.data[0].isFriend);
    }

    if (!friendCheck.data[0].isFriend) {
      const fRequest = await (
        await fetch(
          baseURL + "/users/friendrequest/" + userId,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              accesstoken: getToken(),
            }
          }
        )
      ).json();

      if (fRequest.success) {
        if (fRequest.data.sent) {
          setRequestSentFrom(fRequest.data.from)
          setRequestSent(true);
        }
      }
    }
  }, [props.match.params.username, newPost]);

  const checkOnlineStatus = useCallback((data) => {
    setOnline(data.online);
  }, [online]);

  useEffect(() => {
    if (user) {
      socket.emit("online_status", {
        userId: user.data._id
      });
  
      socket.on("online_status", checkOnlineStatus);
  
      return () => {
        socket.off("online_status", checkOnlineStatus);
      };
    }
  }, [user]);

  useBottomScrollListener(async () => {
    if (end) return;

    if (user && user.success) {
      posts.page++;
      const newPosts = await getPosts(user.data._id, posts.page);
      setPosts({
        success: true,
        data: [...posts.data, ...newPosts.data],
        page: posts.page
      });

      if (newPosts.data.length == 0) {
        setEnd(true);
      }
    }
  });

  if (user && posts && postsCount != null && friendsCount != null) {
    if (user.success) {      
      return (
        <>
          <Header {...props} />
          <Main {...props}>
            <div className={classes.root}>
              <AlertDialog
                open={open}
                dialogTitle={title}
                dialogText={text}
                component={component}
                onClose={() => {
                  setOpen(false);
                }}
              />
              <Grid container spacing={1}>
                <Grid item xs={3}>
                  <StickyBox offsetTop={100} offsetBottom={20}>
                    <Grid item xs={12}>
                      <Box component="div" m={1}>
                        <Paper className={classes.paper}>
                          <Box>
                            <FbImageLibrary
                              className={classes.profile_image}
                              hideOverlay={user.data._id != props.userData._id}
                              renderOverlay={(user.data._id == props.userData._id) ? () => {
                                return (
                                  <>
                                    <Button
                                      onClick={(e) => {updateAvatarModal(e, {action: "update"})}}
                                      className={classes.avatarButton}
                                    >
                                      Update avatar
                                    </Button>
                                    <Button
                                      onClick={(e) => {updateAvatarModal(e, {action: "delete"})}}
                                      className={classes.avatarButton}
                                    >
                                      Delete
                                    </Button>
                                  </>
                                );
                              } : () => {}}
                              images={[
                                baseURL + "/uploads/" + 
                                user.data.avatar
                              ]}
                            />
                          </Box>
                          {props.match.params.username == props.userData.username ? (
                            <Box mt={1}>
                              <Link to="/edit" className={classes.link}>
                                <Button variant="contained" className={classes.profileButtons}>
                                  Edit
                                </Button>
                              </Link>
                            </Box>
                          ) : (<>
                            <Box>
                              <Link to={"/dialog/" + user.data._id}>
                                <Button
                                  variant="contained"
                                  className={classes.profileButtons}
                                  style={{
                                    backgroundColor: '#5181B8',
                                    color: 'white'
                                  }}
                                >
                                  Write message
                                </Button>
                              </Link>
                            </Box>
                            <Box mt={1}>
                              {isFriend ? (
                                <Button
                                  variant="contained"
                                  className={classes.profileButtons}
                                  onClick={() => {unfriend(user.data._id)}}
                                >
                                  Unfriend
                                </Button>
                              ) : (
                                <Button
                                  variant="contained"
                                  className={classes.profileButtons}
                                  onClick={() => {friendRequest(user.data._id)}}
                                  disabled={requestSentFrom == props.userData._id && requestSent}
                                  style={{
                                    backgroundColor: 
                                      (requestSent && requestSentFrom == props.userData._id) 
                                        ? ''
                                        : '#5181B8',
                                    color: 
                                      (requestSent && requestSentFrom == props.userData._id) 
                                        ? '' 
                                        : 'white',
                                  }}
                                >
                                  Add Friend
                                </Button>
                              )}
                              {requestSent && (
                                <Button
                                  variant="contained"
                                  className={classes.profileButtons}
                                  onClick={() => {refuse(user.data._id)}}
                                  disabled={!requestSent}
                                  style={{
                                    marginTop: '5px'
                                  }}
                                >
                                  Refuse
                                </Button>
                              )}
                            </Box>
                          </>)}
                        </Paper>
                      </Box>
                    </Grid>
                    {/* <Grid item xs={12}>
                      <Box component="div" m={1}>
                        <Paper className={classes.paper}>Friends</Paper>
                      </Box>
                    </Grid>
                    <Grid item xs={12}>
                      <Box component="div" m={1}>
                        <Paper className={classes.paper}>Communities</Paper>
                      </Box>
                    </Grid> */}
                  </StickyBox>
                </Grid>
                <Grid item xs={9}>
                  <Grid item xs={12}>
                    <Box component="div" m={1}>
                      <Paper className={classes.paper}>
                        <Box
                          m={1}
                          display="flex"
                          justifyContent="space-between"
                        >
                          <Box fontSize={25}>
                            {user.data.firstname} {user.data.lastname}
                          </Box>
                          <Box>
                            {(online) ? 'online' : null}
                          </Box>
                        </Box>
                        <hr />
                        <Box>
                          {(user.data.info.hometown) ? (
                            <Box display="flex" justifyContent="space-between" m={1}>
                              <Box>Hometown</Box>
                              <Box>{user.data.info.hometown}</Box>
                            </Box>
                          ) : null}
                          <Box display="flex" justifyContent="space-between" m={1}>
                            <Box>Gender</Box>
                            <Box>{genderList[user.data.info.gender]}</Box>
                          </Box>
                          {(user.data.info.birthday) ? (
                            <Box display="flex" justifyContent="space-between" m={1}>
                              <Box>Birthday</Box>
                              <Box>{birthday(user.data.info.birthday)}</Box>
                            </Box>
                          ) : null}
                        </Box>
                        <hr />
                        <Box m={1} display="flex" justifyContent="space-around">
                          <Box>
                            <Link to={"/friends/" + user.data._id}>
                              <Box>{friendsCount.data}</Box>
                              <Box>friends</Box>
                            </Link>
                          </Box>
                          <Box>
                            <Box>{postsCount.data}</Box>
                            <Box>posts</Box>
                          </Box>
                          <Box>
                            <Link to={"/communities/" + user.data._id}>
                              <Box>{user.data.followingCommunitiesCount}</Box>
                              <Box>comunities</Box>
                            </Link>
                          </Box>
                        </Box>
                      </Paper>
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    {props.match.params.username == props.userData.username ? (
                      <Box component="div" m={1}>
                        <Paper className={classes.paper}>
                          <UserInputField
                            userData={user.data}
                            textarea={{
                              placeholder: "What's new?",
                            }}
                            onPost={postHandler}
                          />
                        </Paper>
                      </Box>
                    ) : null}
                    <Box component="div" m={1}>
                      {posts && posts.success && posts.data.map((post) => {
                        return (
                          <Paper
                            key={post._id}
                            className={classes.paper}
                            style={{marginBottom: '25px'}}
                            id={post._id}
                          >
                            <Post
                              authorData={user.data}
                              userData={props.userData}
                              postData={post}
                              imageWidth={40}
                              {...props}
                            />
                          </Paper>
                        );
                      })}
                    </Box>
                  </Grid>
                </Grid>
              </Grid>
            </div>
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

Profile.propTypes = {
  match: PropTypes.object,
  userData: PropTypes.object,
};

import React, { useEffect, useState } from 'react';
import FbImageLibrary from 'react-fb-image-grid';
import StickyBox from "react-sticky-box";
import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import CircularProgress from '@material-ui/core/CircularProgress';
import Button from '@material-ui/core/Button';

import config from '../../env.json';
import { getToken } from '../managers/token-manager';
import Header from '../modules/header';
import Main from '../modules/main';
import Footer from '../modules/footer';
import paginator from '../managers/paginator';
import AlertDialog from '../components/alert-dialog';
import Info from '../components/info.js';
import Link from '../components/link';
import Avatar from '../components/user-avatar';
import UserInputField from '../components/user-input-field';
import Post from '../components/post';
import ImageForm from '../components/image-input-form';

const useStyles = makeStyles((theme) => ({
  paper: {
    width: "100%",
    padding: theme.spacing(2),
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
  },
}));

export default function Communities(props) {
  const classes = useStyles();
  const baseURL = config.BACKEND_PROTOCOL + "://" + config.BACKEND_HOST + ":" + config.BACKEND_PORT;
  const [community, setCommunity] = useState({});
  const [posts, setPosts] = useState({
    success: false,
    page: 1,
    data: [],
  });
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [component, setComponent] = useState(null);

  paginator(async (setEnd) => {
    posts.page++;
    const newPosts = await getPosts(props.match.params.communityId, posts.page);
    setPosts({
      success: true,
      page: posts.page,
      data: [...posts.data, ...newPosts.data]
    });

    setEnd(newPosts.data.length == 0);
  });
  
  async function getCommunity(communityId) {
    return (await fetch(baseURL + '/communities/' + communityId, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        accessToken: getToken(),
      }
    })).json();
  }

  async function getPosts(communityId, page) {
    return (await fetch(
      baseURL + '/communities/posts/' + communityId + '?page=' + page,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          accessToken: getToken(),
        }
      }
    )).json();
  }

  async function getFollowStatus(communityId) {
    return (await fetch(
      baseURL + '/communities/isfollower/' + communityId,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          accessToken: getToken(),
        }
      }
    )).json();
  }

  async function toggleFollow(community) {
    const result = await (await fetch(baseURL + '/communities/togglefollow/' + community.data._id, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        accessToken: getToken(),
      }
    })).json();

    if (result.message == "followed") {
      community.data.isFollowed = true;
    } else {
      community.data.isFollowed = false;
    }
    
    setCommunity({
      ...community
    });
  }

  async function postHandler(values, cb) {
    const formData = new FormData();
    formData.append('postText', values.postText);
    formData.append('communityId', community.data._id);
    for (let file of values.files) {
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
        setPosts({
          success: true,
          data: [res.data, ...posts.data],
          page: posts.page,
        });
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

  async function updateAvatarModal(e, options) {
    e.stopPropagation();
    setTitle('');
    setText('');
    
    if (options.action == "update") {
      setComponent(<ImageForm onSubmit={onAvatarSubmit} />);
      setOpen(true);
    } else if (options.action == "delete") {
      const res = await (await fetch(
        baseURL + "/communities/avatar",
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            accesstoken: getToken(),
          },
          body: JSON.stringify({
            communityId: props.match.params.communityId,
          }),
        }
      )).json();

      if (res.success) {
        setTitle('Success');
        setText(res.message);
        setComponent(<></>);
        community.data.avatar = res.data.avatar;
      } else {
        setTitle('Error');
        setText(res.message);
        setComponent(<></>);
      }
      setOpen(true);
    }
  }

  async function onAvatarSubmit(values) {
    if (values.file[0]) {
      const formData = new FormData();
      formData.append('file', values.file[0]);
      formData.append('communityId', props.match.params.communityId);
  
      let res = await fetch(
        baseURL + "/communities/avatar",
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
        setText("Avatar updated");
        setComponent(<></>);
        community.data.avatar = res.data.avatar;
      } else {
        setTitle('Error');
        setText(res.message);
        setComponent(<></>);
      }
    }
  }

  useEffect(async () => {
    const community = await getCommunity(props.match.params.communityId);
    const psts = await getPosts(props.match.params.communityId, posts.page);

    if (psts.success) {
      setPosts({
        success: true,
        data: psts.data,
        page: posts.page,
      });
    }
    
    community.data.isFollowed = (await getFollowStatus(community.data._id)).data;

    if (community.success) {
      setCommunity(community);
    }
  }, [props.match.params.communityId]);

  if (community.success) {
    return (
      <>
        <AlertDialog
          open={open}
          dialogTitle={title}
          dialogText={text}
          component={component}
          onClose={() => {
            setOpen(false);
          }}
        />
        <Header {...props} />
        <Main {...props}>
          <Box>
            <Grid container spacing={1}>
              <Grid item xs={9}>
                <Grid item xs={12}>
                  <Box m={1}>
                    <Paper className={classes.paper}>
                      <Box
                        m={1}
                        display="flex"
                        justifyContent="space-between"
                      >
                        <Box fontSize={25}>{community.data.name}</Box>
                      </Box>
                      <hr />
                      <Box>{community.data.status}</Box>
                    </Paper>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  {community.data.creatorId == props.userData._id ? (
                    <Box m={1}>
                      <Paper className={classes.paper}>
                        <UserInputField
                          userData={props.userData}
                          textarea={{
                            placeholder: "What's new?",
                          }}
                          onPost={postHandler}
                        />
                      </Paper>
                    </Box>
                  ) : null}
                  <Box m={1}>
                    {posts && posts.success && posts.data.map((post) => {
                      post.community = community.data;
                      return (
                        <Paper
                          key={post._id}
                          className={classes.paper}
                          style={{marginBottom: '25px'}}
                          id={post._id}
                        >
                          <Post
                            authorData={post.author}
                            userData={props.userData}
                            postData={post}
                            imageWidth={50}
                            {...props}
                          />
                        </Paper>
                      );
                    })}
                  </Box>
                </Grid>
              </Grid>
              <Grid item xs={3}>
                <StickyBox offsetTop={100} offsetBottom={20}>
                  <Grid item xs={12}>
                    <Box m={1}>
                      <Paper className={classes.paper}>
                        <Box>
                          <FbImageLibrary
                            className={classes.profile_image}
                            hideOverlay={community.data.creatorId != props.userData._id}
                            renderOverlay={(community.data.creatorId == props.userData._id) ? () => {
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
                            images={[baseURL + "/uploads/" + community.data.avatar]}
                          />
                        </Box>
                        <Box>
                          {community.data.isFollowed ? (
                            <Button
                              variant="contained"
                              className={classes.profileButtons}
                              onClick={() => {toggleFollow(community)}}
                            >
                              Unfollow
                            </Button>
                          ) : (
                            <Button
                              variant="contained"
                              className={classes.profileButtons}
                              onClick={() => {toggleFollow(community)}}
                              style={{
                                backgroundColor: '#5181B8',
                                color: 'white',
                              }}
                            >
                              Follow
                            </Button>
                          )}
                        </Box>
                      </Paper>
                    </Box>
                  </Grid>
                </StickyBox>
              </Grid>
            </Grid>
          </Box>
        </Main>
        <Footer />
      </>
    );
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

import React, { useEffect, useState } from 'react';
import FbImageLibrary from 'react-fb-image-grid';
import StickyBox from "react-sticky-box";
import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import CircularProgress from '@material-ui/core/CircularProgress';
import Button from '@material-ui/core/Button';

import {
  getCommunity,
  toggleFollowCommunity,
  delCommunityAvatar,
  updateCommunityAvatar,
  getFollowStatus
} from '../api/community';
import {
  addPost,
  getPosts
} from '../api/post';
import { apiURL } from '../api/config';
import Header from '../modules/header';
import Main from '../modules/main';
import Footer from '../modules/footer';
import paginator from '../managers/paginator';
import AlertDialog from '../components/alert-dialog';
import Info from '../components/info.js';
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
    const newPosts = await getPosts({
      communityId: props.match.params.communityId,
      page: posts.page,
    });
    setPosts({
      success: true,
      page: posts.page,
      data: [...posts.data, ...newPosts.data]
    });

    setEnd(newPosts.data.length == 0);
  });

  async function toggleFollow(community) {
    const result = await toggleFollowCommunity(community.data._id);

    if (result.message == "followed") {
      community.data.isFollowed = true;
    } else {
      community.data.isFollowed = false;
    }
    
    setCommunity({
      ...community
    });
  }

  async function postHandler(values, clearForm) {
    try {
      const res = await addPost({
        files: values.files,
        postText: values.postText,
        communityId: community.data._id,
      });

      if (res.success) {
        clearForm();
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
      const res = await delCommunityAvatar(props.match.params.communityId);

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
      const res = await updateCommunityAvatar({
        avatar: values.file[0],
        communityId: props.match.params.communityId,
      });

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
    const psts = await getPosts({
      communityId: props.match.params.communityId,
      page: posts.page,
    });

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
                            images={[apiURL() + "/uploads/" + community.data.avatar]}
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

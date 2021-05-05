import React, { useState, useEffect } from 'react';
import FbImageLibrary from 'react-fb-image-grid';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import FavoriteIcon from '@material-ui/icons/Favorite';
import ChatBubbleIcon from '@material-ui/icons/ChatBubble';
import CloseIcon from '@material-ui/icons/Close';
import Button from '@material-ui/core/Button';

import config from '../../env.json';
import UserInputField from './user-input-field';
import UserMessage from './user-message';
import AlertDialog from './alert-dialog';
import { getToken } from '../managers/token-manager';
import nl2br from '../managers/nl2br';

const baseURL = config.BACKEND_PROTOCOL + '://' + config.BACKEND_HOST + ':' + config.BACKEND_PORT;

const useStyles = makeStyles(({
  liked: {
    color: '#FF3347',
    fontWeight: 'bold',
  },
  default: {
    color: '#888888',
    fontWeight: 'bold',
  },
  postButtons: {
    cursor: 'pointer',
    userSelect: 'none'
  }
}));

function PostHeader(props) {
  function handleClick (event) {
    setAnchorEl(event.currentTarget);
  }

  function handleClose () {
    setAnchorEl(null);
  }
  
  async function delPost(id) {
    let res = await fetch(baseURL + '/posts', {
      method: "DELETE",
      headers: {
        'Content-type': 'application/json',
        accesstoken: getToken(),
      },
      body: JSON.stringify({ postId: id }),
    });
    res = await res.json();

    if (res.success) {
      const elem = document.getElementById(id);
      if (elem) {
        elem.style.display = "none";
      }
    } else {
      setTitle("Error");
      setText(res.message);
      setOpen(true);
    }
  }

  const [anchorEl, setAnchorEl] = useState(null);
  const openMenu = Boolean(anchorEl);

  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');

  return (<>
    <AlertDialog
      open={open}
      dialogTitle={title}
      dialogText={text}
      onClose={() => {setOpen(false)}}
    />
    <Box display="flex" justifyContent="space-between" mt={2} mb={2}>
      <Box display="flex" justifyContent="space-between">
        <UserMessage {...props} />
      </Box>
      <Box>
        {props.authorData.username == props.userData.username ? (<>
          <IconButton
            aria-label="more"
            aria-controls="long-menu"
            aria-haspopup="true"
            onClick={handleClick}
          >
            <MoreVertIcon />
          </IconButton>
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
            <MenuItem onClick={() => {
              handleClose();
              delPost(props.postData._id);
            }}>
              Delete
            </MenuItem>
          </Menu>
        </>) : null}
      </Box>
    </Box>
  </>);
}

function PostBody(props) {
  const imagesExtensions = ['JPG', 'PNG', 'GIF', 'WEBP', 'TIFF', 'PSD', 'RAW', 'BMP', 'HEIF', 'INDD', 'JPEG'];
  const imagesArr = [];
  const other = [];

  for (let file of props.postData.files) {
    const arr = file.split(".");
    const extension = arr[arr.length - 1].toUpperCase();
    if (imagesExtensions.includes(extension)) {
      imagesArr.push(baseURL + '/uploads/' + file);
    } else {
      other.push(file);
    }
  }

  return (
    <Box>
      <Box
        mb={1}
        color="black"
        textAlign="start"
        style={{
          wordBreak: 'break-word',
        }}
      >
        {nl2br(props.postData.content)}
      </Box>
      <Box
        style={{
          textAlign: 'start',
        }}
      >
        {imagesArr.length > 0 && <FbImageLibrary images={imagesArr} hideOverlay={true} />}
        {other.map((file) => {
          return (
            <p key={file}>
              <a download href={baseURL + '/uploads/' + file}>
                {file}
              </a>
            </p>
          );
        })}
      </Box>
    </Box>
  );
}

function PostFooter(props) {
  async function like(postId) {
    const res = await (
      await fetch(
        baseURL + '/posts/like/' + postId, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            accesstoken: getToken(),
          }
        }
      )
    ).json();
    
    if (res.data.liked) {
      setLikeClass(classes.liked);
      props.postData.isLiked = true;
    } else {
      setLikeClass(classes.default);
      props.postData.isLiked = false;
    }
    props.postData.likes = res.data.likesCount;
    setLikes(res.data.likesCount);
  }

  async function openPost() {
    setComponent(
      <Post
        {...props}
        commentsBlock={true}
        commentHandler={commentHandler}
      />
    );
    setOpen(true);
  }

  async function commentHandler(values, resetForm, comments, setComments) {
    if (values.postText == '') return;
    
    const res = await (
      await fetch(
        baseURL + '/posts/comments/' + props.postData._id, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            accesstoken: getToken(),
          },
          body: JSON.stringify({
            text: values.postText,
            postId: props.postData._id,
          })
        }
      )
    ).json();

    if (res.success) {
      resetForm();
      props.postData.comments = res.data.commentsCount;

      const newComment = res.data.comment;
      newComment.userId = props.userData;
      
      setComments({
        page: 1,
        data: [newComment, ...comments.data].slice(0, config.COMMENT_PER_PAGE),
      });
    }
  }

  async function getComments(postId, page) {
    const comms = await fetch(
      baseURL + '/posts/comments/' + 
      postId + '?page=' + page,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          accesstoken: getToken(),
        }
      }
    )
    
    return comms.json();
  }

  async function delComment(commentId, postId) {
    const res = await (
      await fetch(
        baseURL + '/posts/comments/' + postId, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            accesstoken: getToken(),
          },
          body: JSON.stringify({ commentId: commentId })
        }
      )
    ).json();
    
    if (res.success) {
      props.postData.comments = res.data.commentsCount;
      const elem = document.getElementById(commentId);
      if (elem) {
        elem.style.display = "none";
      }
    }
  }

  async function moreComments(e, postId) {
    const button = e.currentTarget;
    const newComments = await getComments(postId, comments.page + 1);
    setComments({
      page: comments.page + 1,
      data: [...comments.data, ...newComments.data]
    });

    if (newComments.data.length == 0) {
      button.style.display = "none";
    }
  }

  const classes = useStyles();
  const [likeClass, setLikeClass] = useState((props.postData.isLiked) ? classes.liked : classes.default);
  const [likes, setLikes] = useState(props.postData.likes);
  const [open, setOpen] = useState(false);
  const [component, setComponent] = useState(<></>);
  const [comments, setComments] = useState({
    page: 1,
    data: []
  });

  if (props.commentsBlock) {
    useEffect(async () => {
      const comments = await getComments(props.postData._id, 1);
      comments.page = 1;
      setComments(comments);
    }, []);
  }

  return (
    <>
      <AlertDialog
        open={open}
        dialogTitle={''}
        dialogText={''}
        component={component}
        onClose={() => {setOpen(false)}}
        style={{
          minWidth: '700px',
        }}
      />
      <hr />
      <Box display="flex">
        <Box
          mr={2}
          className={classes.postButtons}
          display="flex"
          alignItems="center"
          onClick={() => {like(props.postData._id)}}
        >
          <Box display="flex" alignItems="center" mr={1}>
            <FavoriteIcon className={likeClass} />
          </Box>
          <Box className={likeClass}>
            {likes}
          </Box>
        </Box>
        <Box
          mr={2}
          className={classes.postButtons}
          display="flex"
          alignItems="center"
          onClick={() => {
            if (!props.commentsBlock) {
              openPost();
            }
          }}
        >
          <Box display="flex" alignItems="center" mr={1}>
            <ChatBubbleIcon className={classes.default} />
          </Box>
          <Box className={classes.default}>
            {props.postData.comments}
          </Box>
        </Box>
      </Box>
      {props.commentsBlock == true && (<>
        <hr />
        <Box>
          <Box>
            <UserInputField
              userData={props.userData}
              textarea={{
                placeholder: 'Leave a comment'
              }}
              onPost={(values, resetForm) => props.commentHandler(values, resetForm, comments, setComments)}
              fileInput={false}
            />
          </Box>
          <Box>
            {comments.data.map((comment) => {
              return (
                <Box id={comment._id} key={comment._id}>
                  <Box
                    display="flex"
                    justifyContent="space-between"
                  >
                    <Box>
                      <UserMessage
                        authorData={comment.userId}
                        postData={comment}
                        content={comment.text}
                      />
                    </Box>
                    <Box>
                      {(props.userData._id == comment.userId._id || 
                      props.userData._id == props.postData.author) &&  (
                        <CloseIcon onClick={() => {
                          delComment(comment._id, props.postData._id)}}
                          style={{
                            cursor: 'pointer'
                          }}
                        />
                      )}
                    </Box>
                  </Box>
                  <hr />
                </Box>
              );
            })}
          </Box>
          <Box>
            {comments.data.length >= config.COMMENT_PER_PAGE && (
              <Button
                onClick={(e) => {moreComments(e, props.postData._id)}}
              >
                More comments
              </Button>
            )}
          </Box>
        </Box>
      </>)}
    </>
  );
}

export default function Post(props) {
  return (
    <Box>
      <PostHeader {...props} />
      <PostBody {...props} />
      <PostFooter {...props} />
    </Box>
  );
}

Post.propTypes = {
  authorData: PropTypes.object.isRequired,
  userData: PropTypes.object.isRequired,
  postData: PropTypes.object.isRequired,
  imageWidth: PropTypes.number,
  commentsBlock: PropTypes.bool,
  commentsData: PropTypes.object
};

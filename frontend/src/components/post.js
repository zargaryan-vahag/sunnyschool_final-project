import React, { useState, useEffect } from 'react';
import FbImageLibrary from 'react-fb-image-grid';
import PropTypes from 'prop-types';
import Moment from 'react-moment';
import moment from 'moment';
import Tooltip from '@material-ui/core/Tooltip';
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

import {
  likePost,
  delPost,
  addComment,
  getComments,
  delComment,
} from '../api/post';
import config from '../api/config';
import UserInputField from './user-input-field';
import UserMessage from './user-message';
import AlertDialog from './alert-dialog';
import Avatar from './user-avatar';
import Link from './link';
import nl2br from '../managers/nl2br';

const useStyles = makeStyles((theme) => ({
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
  },
  date: {
    color: theme.palette.text.secondary,
  },
}));

function PostHeader(props) {
  function handleClick (event) {
    setAnchorEl(event.currentTarget);
  }

  function handleClose () {
    setAnchorEl(null);
  }
  
  async function deletePost(id) {
    const res = await delPost(id);

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

  const classes = useStyles();
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
      <Box display="flex" mr={2}>
        <Box mr={1}>
          <Avatar
            imageName={props.postData.community
              ? props.postData.community.avatar
              : props.authorData.avatar
            }
            imageWidth={props.imageWidth}
            linkValue={props.postData.community
              ? '/community/' + props.postData.community._id
              : '/profile/' + props.authorData.username}
          />
        </Box>
        <Box>
          <Box
            display="flex"
            flexDirection="column"
            justifyContent="center"
            height="100%"
          >
            <Box textAlign="start">
              <Link to={props.postData.community
                ? '/community/' + props.postData.community._id
                : '/profile/' + props.authorData.username
              }>
                {props.postData.community
                  ? props.postData.community.name
                  : props.authorData.firstname + " " + props.authorData.lastname}
              </Link>
            </Box>
            <Box className={classes.date} textAlign="start">
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
              deletePost(props.postData._id);
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
      imagesArr.push(config.apiURL() + '/uploads/' + file);
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
              <a download href={config.apiURL() + '/uploads/' + file}>
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
    const res = await likePost(postId);
    
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
    
    const res = await addComment({
      postId: props.postData._id,
      text: values.postText,
    });

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

  async function deleteComment(commentId, postId) {
    const res = await delComment({
      commentId,
      postId,
    });
    
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
    const newComments = await getComments({
      postId: postId,
      page: comments.page + 1
    });

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
      const comments = await getComments({
        postId: props.postData._id,
        page: 1,
      });
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
      {props.postData.community && (
        <Box textAlign="start" mb={1}>
          <Link to={'/profile/' + props.authorData.username}>
            {props.authorData.firstname} {props.authorData.lastname}
          </Link>
        </Box>
      )}
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
                          deleteComment(comment._id, props.postData._id)}}
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

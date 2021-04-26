import React, { useState, useContext, useCallback, useEffect, useRef } from 'react';
import { animateScroll } from "react-scroll";

import Header from '../modules/header';
import Main from '../modules/main';
import Footer from '../modules/footer';
import { makeStyles } from '@material-ui/core/styles';
import { Box } from '@material-ui/core';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import Paper from '@material-ui/core/Paper';
import CircularProgress from '@material-ui/core/CircularProgress';
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord';

import config from '../../env.json';
import { getToken } from '../managers/token-manager';
import nl2br from '../managers/nl2br';
import { SocketContext } from '../context/socket';
import Info from '../components/info.js';
import Link from '../components/link';
import UserAvatar from '../components/user-avatar';
import UserInputField from '../components/user-input-field';
import UserMessage from '../components/user-message';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    fontFamily: 'arial',
    minHeight: '100%',
    maxHeight: '100%',
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: 'center',
  },
  dialog: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    maxHeight: 'calc(100vh - 160px)',
    height: '100%',
  },
  dialogHeader: {
    width: '100%',
    backgroundColor: 'white',
    paddingBottom: '10px',
    borderBottom: 'solid 1px #C4C4C4',
  },
  dialogBody: {
    height: '100%',
    overflowY: 'auto',
    wordBreak: 'break-word',
  },
  dialogFooter: {
    width: '100%',
    bottom: '0',
    backgroundColor: 'white',
    paddingTop: '10px',
    borderTop: 'solid 1px #C4C4C4',
  },
  message: {
    display: 'flex',
    justifyContent: 'space-between',
    "& .hidden-button": {
      display: "none",
    },
    "&:hover": {
      backgroundColor: '#F5F6F8',
    },
    "&:hover .hidden-button": {
      display: "flex",
    }
  },
  messageInput: {
    '& textarea': {
      overflowY: 'auto !important',
      maxHeight: '100px',
    }
  }
}));

export default function Dialogs(props) {  
  function sendMessage(values, resetForm, to) {
    if (values.postText != '') {
      socket.emit('new_message', {
        to,
        text: values.postText
      });
      resetForm();
    }
  }

  function onScroll (e, userId) {
    if (e.target.scrollTop == 0) {
      socket.emit('get_messages', {
        dialogId: dialog._id,
        userId: userId,
        page: dialog.page
      });
    }
  };
  
  const classes = useStyles();
  const baseURL = config.BACKEND_PROTOCOL + "://" + config.BACKEND_HOST + ":" + config.BACKEND_PORT;
  const socket = useContext(SocketContext);
  const scrollElem = useRef();
  
  const [user, setUser] = useState(null);
  const [dialog, setDialog] = useState({
    page: 1,
    messages: []
  });
  const [dialogMembers, setDialogMembers] = useState({});
  const [read, setRead] = useState(true);

  const newMessage = useCallback((data) => {
    if (
      data.messages[0].userId._id == props.match.params.userId ||
      data.messages[0].userId._id == props.userData._id
    ) {
      setDialog((dialog) => ({
        _id: data._id,
        read: data.read,
        page: 2,
        messages: [
          ...dialog.messages.slice(-1 * (config.MESSAGE_PER_PAGE - 1)),
          data.messages[0]
        ]
      }));

      if (data.read == props.match.params.userId) {
        setRead(false);
      }

      if (data.messages[0].userId._id != props.userData._id) {
        socket.emit('read', {
          dialogId: data._id,
          interlocutor: props.match.params.userId
        });
      }

      const chatBody = document.getElementById('chat-body');
      const scrollPosition = chatBody?.scrollHeight - chatBody?.scrollTop - chatBody?.clientHeight;
      
      if (scrollPosition < 120 || data.messages[0].userId._id == props.userData._id) {
        animateScroll.scrollToBottom({
          containerId: "chat-body"
        });
      }
    }
  }, []);

  const getMessages = useCallback((data) => {
    if (data) {
      setDialog((dialog) => ({
        _id: data._id,
        read: data.read,
        page: dialog.page + 1,
        scrollToIndex: data.messages.length,
        messages: [
          ...data.messages,
          ...dialog.messages
        ]
      }));

      if (data.read == props.match.params.userId) {
        setRead(false);
      } else {
        setRead(true);
      }

      if (scrollElem.current) {
        scrollElem.current.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [dialog]);

  const userRead = useCallback(() => {
    setRead(true);
  }, [read]);

  useEffect(() => {
    if (dialog.read && dialog.read == props.userData._id) {
      socket.emit('read', {
        dialogId: dialog._id,
        interlocutor: props.match.params.userId
      });
    }
  }, [dialog]);

  useEffect(async () => {
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
    setUser(User);
  }, []);

  useEffect(() => {
    if (user) {
      const members = {};
      members[props.userData._id] = props.userData;
      members[user.data._id] = user.data;
      setDialogMembers(members);
      
      socket.emit('get_messages', {
        userId: user.data._id,
        page: dialog.page
      });

      socket.on("new_message", newMessage);
      socket.on("get_messages", getMessages);
      socket.on("read", userRead);

      return () => {
        socket.off("new_message", newMessage);
        socket.off("get_messages", getMessages);
        socket.on("read", userRead);
      };
    }
  }, [user]);
  
  if (user) {
    if (user.success) {
      return (
        <>
          <Header {...props} />
          <Main {...props}>
            <div className={classes.root}>
              <Paper className={classes.paper}>
                <Box className={classes.dialog}>
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    className={classes.dialogHeader}
                  >
                    <Box>
                      <Link to="/dialogs">
                        <ArrowBackIosIcon />
                      </Link>
                    </Box>
                    <Box
                      display="flex"
                      justifyContent="center"
                      flexDirection="columnt"
                    >
                      <Box
                        display="flex"
                        alignItems="center"
                      >
                        <Link to={"/profile/" + user.data.username}>
                          {user.data.firstname} {user.data.lastname}
                        </Link>
                        <FiberManualRecordIcon style={{
                          visibility: (read) ? 'hidden' : 'unset',
                          color: '#3f51b5',
                          fontSize: '10px',
                        }}/>
                      </Box>
                    </Box>
                    <Box>
                      <UserAvatar 
                        username={user.data.username}
                        imageName={user.data.avatar}
                        imageWidth={40}
                      />
                    </Box>
                  </Box>
                  <Box
                    display="flex"
                    flexDirection="column"
                    textAlign="initial"
                    className={classes.dialogBody}
                    id="chat-body"
                    onScroll={(e) => {
                      onScroll(e, user.data._id);
                    }}
                  >
                    <Box style={{
                      width: '100%',
                      paddingBottom: '5px',
                    }}>
                      {dialog.messages && dialog.messages.map((message, index) => {
                        const refProp = {};
                        if (dialog.scrollToIndex && index == dialog.scrollToIndex) {
                          refProp.ref = scrollElem;
                        } else if (index == dialog.messages.length - 1) {
                          refProp.ref = scrollElem;
                        }
                        
                        const newMessageDate = new Date(message.createdAt).getTime();
                        const lastMessageDate = new Date(dialog.messages[index - 1]?.createdAt).getTime();

                        return (
                          <div
                            {...refProp}
                            key={message._id}
                            className={classes.messageInput}
                          >
                            <Box>
                              {
                                index != 0 && 
                                (
                                  message.userId == dialog.messages[index - 1].userId || 
                                  message.userId._id == dialog.messages[index - 1].userId ||
                                  message.userId._id == dialog.messages[index - 1].userId._id
                                ) && 
                                newMessageDate - lastMessageDate < 60000
                              ? (
                                <Box ml="56px" mb="8px">{nl2br(message.text)}</Box>
                              ) : (
                                <UserMessage
                                  authorData={dialogMembers[message.userId._id || message.userId]}
                                  postData={message}
                                  content={nl2br(message.text)}
                                />
                              )}
                            </Box>
                            <Box>
                              {/* <span className="hidden-button">...</span> */}
                            </Box>
                          </div>
                        );
                      })}
                      {!user.data.isFriend && (
                        <Info text={"Add " + user.data.firstname + " to your friends to write message"} />
                      )}
                    </Box>
                  </Box>
                  <Box className={classes.dialogFooter}>
                    <UserInputField
                      userData={props.userData}
                      textarea={{
                        placeholder: "Write a message...",
                        autoComplete: 'off',
                        autoFocus: true,
                        className: classes.messageInput,
                      }}
                      fileInput={false}
                      buttonText="Send"
                      disabled={!user.data.isFriend}
                      onPost={(values, resetForm) => {sendMessage(values, resetForm, user.data._id)}}
                    />
                  </Box>
                </Box>
              </Paper>
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

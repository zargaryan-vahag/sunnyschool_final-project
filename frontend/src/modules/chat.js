import React, { useEffect, useState, useCallback, useContext, useRef } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Paper from '@material-ui/core/Paper';
import Slide from '@material-ui/core/Slide';
import ForumIcon from '@material-ui/icons/Forum';
import SendIcon from '@material-ui/icons/Send';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';

import { SocketContext } from '../context/socket';
import Link from '../components/link';
import UserAvatar from '../components/user-avatar';

const useStyles = makeStyles((theme) => ({
  footer: {
    width: '100%',
    position: 'fixed',
    bottom: 0,
    display: 'flex',
    justifyContent: 'center',
  },
  root: {
    height: 180,
  },
  chatBox: {
    width: '100%',
    maxWidth: '1000px',
    position: 'relative',
  },
  wrapper: {
    width: 100 + theme.spacing(2),
    position: 'absolute',
    bottom: 0,
    left: 0,
    "& .react-resizable-handle": {
      top: '0',
      botton: 'unset',
      right: '0',
      cursor: 'sw-resize',
    }
  },
  paper: {
    zIndex: 1,
    position: 'relative',
    width: '300px',
    height: '400px',
    marginBottom: '10px',
    padding: '10px',
  },
  polygon: {
    fill: theme.palette.common.white,
    stroke: theme.palette.divider,
    strokeWidth: 1,
  },
  chatButton: {
    color: '#3f51b5',
    cursor: 'pointer',
    "&:hover": {
      color: '#23527c'
    },
  },
  textarea: {
    resize: 'both',
    padding: '5px',
  },
  chatBody: {
    overflowY: 'auto',
    wordBreak: 'break-word',
  }
}));

export default function Chat(props) {
  function handleChange() {
    setChecked(!checked);
  }

  function sendPublicMessage(message) {
    socket.emit("public_message", {
      username: props.userData.username,
      firstname: props.userData.firstname,
      lastname: props.userData.lastname,
      avatar: props.userData.avatar,
      message: message
    });

    const pos = chatBody.current.scrollTop + chatBody.current.clientHeight;
    setIsScrolledBottom(pos == chatBody.current.scrollHeight);
  }

  const classes = useStyles();
  const messageLength = 200;
  const [currMessLength, setCurrMessLength] = useState(0);
  const [checked, setChecked] = useState(false);
  const socket = useContext(SocketContext);
  const [messages, setMessages] = useState([]);
  const [isScrolledBottom, setIsScrolledBottom] = useState(true);
  const chatBody = useRef();

  const publicMessage = useCallback((data) => {
    setMessages((messages) => ([
      ...messages.slice(-99),
      data
    ]));
    
    setIsScrolledBottom((isScrolledBottom) => {
      if (isScrolledBottom && chatBody.current) {
        chatBody.current.scrollTop = chatBody.current.scrollHeight - chatBody.current.clientHeight;
      }
      return isScrolledBottom;
    });
  }, [isScrolledBottom]);

  useEffect(() => {    
    socket.on("public_message", publicMessage);

    return () => {
      socket.off("public_message", publicMessage);
    };
  }, []);

  return (
    <footer className={classes.footer}>
      <Box className={classes.chatBox}>
        <Box className={classes.wrapper}>
          <Slide direction="up" in={checked} mountOnEnter unmountOnExit>
            <Paper elevation={4} className={classes.paper}>
              <Box
                height="100%"
                display="flex"
                justifyContent="space-between"
                flexDirection="column"
              >
                <div
                  className={classes.chatBody}
                  id="chat-body"
                  style={{
                    height: '100%',
                  }}
                  ref={chatBody}
                >
                  {messages.length == 0 && (
                    <Box
                      display="flex"
                      justifyContent="center"
                      alignItems="center"
                      color="darkgray"
                      height="100%"
                    >
                      Public chat
                    </Box>
                  )}
                  {messages.map((message, index) => {
                    return (
                      <Box
                        display="flex"
                        key={index}
                        mt={1}
                        mb={1}
                      >
                        <Box
                          display="flex"
                          width="30px"
                          mr={1}
                        >
                          <UserAvatar
                            username={message.username}
                            imageName={message.avatar}
                            imageWidth={30}
                          />
                        </Box>
                        <Box width="100%">
                          <Link to={'/profile/' + message.username}>
                            {message.firstname} {message.lastname}
                          </Link> {message.message}
                        </Box>
                      </Box>
                    );
                  })}
                </div>
                <Box
                  height="70px"
                  display="flex"
                  justify-content="flex-end"
                  flex-direction="column"
                  borderTop="solid 1px darkgray"
                >
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      sendPublicMessage(e.target[0].value);
                      e.target.reset();
                      setCurrMessLength(0);
                    }}
                  >
                    <Box
                      display="flex"
                      alignItems="center"
                    >
                      <Box>
                        <TextField
                          fullWidth
                          variant="outlined"
                          placeholder="Public message..."
                          className={classes.textarea}
                          name="message"
                          autoComplete="off"
                          onInput = {(e) =>{
                            e.target.value = e.target.value.toString().slice(0, messageLength);
                            setCurrMessLength(e.target.value.length);
                          }}
                        />
                      </Box>
                      <Box
                        display="flex"
                        flexDirection="column"
                        alignItems="center"
                      >
                        <Button type="submit">
                          <SendIcon
                            className={classes.chatButton}
                            style={{
                              fontSize: '24px',
                            }}
                          />
                        </Button>
                        <Box>
                          <span style={{color: 'darkgrey'}}>
                            {currMessLength} / {messageLength}
                          </span>
                        </Box>
                      </Box>
                    </Box>
                  </form>
                </Box>
              </Box>
            </Paper> 
          </Slide>
          <Box>
            <ForumIcon
              className={classes.chatButton}
              onClick={handleChange}
            />
          </Box>
        </Box>
      </Box>
    </footer>
  );
}

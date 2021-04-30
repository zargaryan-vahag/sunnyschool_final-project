import React, { useEffect, useState, useCallback, useContext, useRef } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Paper from '@material-ui/core/Paper';
import Slide from '@material-ui/core/Slide';
import ForumIcon from '@material-ui/icons/Forum';
import SendIcon from '@material-ui/icons/Send';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';

import Dialogs from '../routes/dialogs';
import Dialog from '../routes/dialog';
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
    zIndex: 600,
  },
  root: {
    height: 180,
  },
  chatBox: {
    width: '100%',
    // maxWidth: '1000px',
    position: 'relative',
  },
  wrapper: {
    width: 100 + theme.spacing(2),
    position: 'absolute',
    bottom: 0,
    right: 0,
    "& .react-resizable-handle": {
      top: '0',
      botton: 'unset',
      right: '0',
      cursor: 'sw-resize',
    }
  },
  paper: {
    width: '375px',
    height: '400px',
    marginBottom: '10px',
    padding: '10px',
    position: 'absolute',
    bottom: '22px',
    right: '0',
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
  },
  tabs: {
    borderRight: `1px solid ${theme.palette.divider}`,
    "& button": {
      minWidth: '50px',
    },
  },
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
  
  function a11yProps(index) {
    return {
      id: `horizontal-tab-${index}`,
      'aria-controls': `horizontal-tabpanel-${index}`,
    };
  }

  function handleTabChange (event, newValue) {
    setTabValue(newValue);
  }

  const classes = useStyles();
  const messageLength = 200;
  const socket = useContext(SocketContext);

  const chatBody = useRef();
  const dialogs = useRef();
  const dialog = useRef();
  const [currMessLength, setCurrMessLength] = useState(0);
  const [checked, setChecked] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isScrolledBottom, setIsScrolledBottom] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [userId, setUserId] = useState(null);

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
                <Tabs
                  orientation="horizontal"
                  variant="scrollable"
                  value={tabValue}
                  onChange={handleTabChange}
                  className={classes.tabs}
                >
                  <Tab label="Public" {...a11yProps(0)} />
                  <Tab label="Dialogs" {...a11yProps(1)} />
                </Tabs>
                <div
                  className={classes.chatBody}
                  id="chat-body"
                  style={{
                    height: '100%',
                  }}
                  ref={chatBody}
                >
                  {tabValue == 0 ? (<>
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
                  </>) : tabValue == 1 ? (<>
                    <div ref={dialogs}>
                      <Dialogs
                        {...props}
                        littleWindow={true}
                        onDialogClick={(userId) => {
                          dialog.current.style.display = 'block';
                          dialogs.current.style.display = 'none';
                          setUserId(userId);
                        }}
                      />
                    </div>
                    <div style={{display: 'none'}} ref={dialog}>
                      {userId && (
                        <Dialog
                          {...props}
                          userId={userId}
                          littleWindow={true}
                          bodyHeight="109px"
                          onBackClick={() => {
                            dialog.current.style.display = 'none';
                            dialogs.current.style.display = 'block';
                            setUserId(null);
                          }}
                        />
                      )}
                    </div>
                  </>) : null}
                </div>
                {tabValue == 0 && (
                  <Box
                    height="70px"
                    display="flex"
                    justify-content="flex-end"
                    flex-direction="column"
                    borderTop="solid 1px darkgray"
                  >
                    <form
                      style={{
                        width: '100%',
                      }}
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
                        <Box width="100%">
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
                )}
              </Box>
            </Paper> 
          </Slide>
          <Box
            display="flex"
            justifyContent="flex-end"
          >
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

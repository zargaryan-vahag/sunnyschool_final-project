import React, { useState, useContext, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useHistory } from "react-router-dom";
import Moment from 'react-moment';
import moment from 'moment';
import Header from '../modules/header';
import Main from '../modules/main';
import Footer from '../modules/footer';
import { makeStyles } from '@material-ui/core/styles';
import { Box } from '@material-ui/core';
import Paper from '@material-ui/core/Paper';
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord';

import { getDialogs } from '../api/user';
import { SocketContext } from '../context/socket';
import UserAvatar from '../components/user-avatar';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    fontFamily: 'arial',
    minHeight: '100%',
    maxHeight: '100%',
  },
  paper: {
    // padding: theme.spacing(2),
  },
  dialogBox: {
    borderBottom: 'solid 1px #D2D3D5',
    borderTop: 'solid 1px #D2D3D5',
    "&:hover": {
      backgroundColor: '#F5F6F8',
      cursor: 'pointer',
    }
  }
}));

export default function Dialogs(props) {
  const classes = useStyles();
  const socket = useContext(SocketContext);

  const [dialogs, setDialogs] = useState(null);

  const history = useHistory();

  const redirect = (path) => { 
    history.push(path);
  }

  const newMessage = useCallback((data) => {
    for (let i in dialogs) {
      if (dialogs[i]._id == data._id) {
        data.interlocutor = dialogs[i].interlocutor;
        dialogs.splice(i, 1);
        dialogs.unshift(data);
        setDialogs([...dialogs]);
        
        break;
      }
    }
  }, [dialogs]);

  const userRead = useCallback((data) => {
    for (let i in dialogs) {
      if (dialogs[i]._id == data.dialogId) {
        dialogs[i].read = null;
        setDialogs([...dialogs]);
        
        break;
      }
    }
  }, [dialogs]);

  useEffect(async () => {
    const Dialogs = await getDialogs();
    setDialogs(Dialogs.data);
  }, []);

  useEffect(() => {
    if (dialogs) {
      socket.on("new_message", newMessage);
      socket.on("read", userRead);

      return () => {
        socket.off("new_message", newMessage);
        socket.on("read", userRead);
      };
    }
  }, [dialogs]);
  
  return (
    <>
      {!props.littleWindow && <Header {...props} />}
      <Main {...props}>
        <div className={classes.root}>
          <Paper className={classes.paper}>
            {dialogs && dialogs.map((dialog) => {
              return (
                <Box
                  key={dialog._id}
                  display="flex"
                  className={classes.dialogBox}
                  style={{
                    backgroundColor: (dialog.read == props.userData._id) ? '#F5F6F8' : '',
                  }}
                  onClick={() => {
                    if (!props.littleWindow) {
                      redirect('/dialog/' + dialog.interlocutor._id);
                    }
                    props.onDialogClick(dialog.interlocutor._id);
                  }}
                >
                  <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    width={60}
                    height={60}
                    m={1}
                  >
                    <UserAvatar
                      username={dialog.interlocutor.username}
                      imageName={dialog.interlocutor.avatar}
                      imageWidth={60}
                    />
                  </Box>
                  <Box
                    m={1}
                    display="flex"
                    flexDirection="column"
                    justifyContent="space-between"
                    width="calc(100% - 100px)"
                  >
                    <Box
                      display="flex"
                      justifyContent="space-between"
                    >
                      <Box fontWeight="bold">
                        {dialog.interlocutor.firstname} {dialog.interlocutor.lastname}
                      </Box>
                      <Box color="#9D9EA0">
                        <Moment format="YYYY.MM.DD hh:mm">
                          {dialog.messages[0].createdAt}
                        </Moment>
                      </Box>
                    </Box>
                    <Box
                      display="flex"
                      alignItems="center"
                      justifyContent="space-between"
                      p="4px 4px"
                      style={{
                        backgroundColor: (dialog.read == dialog.interlocutor._id) ? '#F5F6F8' : 'unset',
                      }}
                    >
                      <Box
                        width="100%"
                        display="flex"
                        alignItems="center"
                      >
                        {dialog.messages[0].userId._id == props.userData._id && (
                          <Box
                            mr={1}
                            width={25}
                            height={25}
                          >
                            <UserAvatar
                              username={props.userData.username}
                              imageName={props.userData.avatar}
                              imageWidth={25}
                            />
                          </Box>
                        )}
                        <Box
                          style={{
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            height: '20px'
                          }}
                          textOverflow="ellipsis"
                          whiteSpace="nowrap"
                          overflow="hidden"
                          height={20}
                        >
                          {dialog.messages[0].text}
                        </Box>
                      </Box>
                      <Box>
                        <FiberManualRecordIcon style={{
                          visibility: (dialog.read == props.userData._id) ? 'unset' : 'hidden',
                          color: '#3f51b5',
                          fontSize: '10px',
                        }}/>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              );
            })}
          </Paper>
        </div>
      </Main>
      {!props.littleWindow && <Footer />}
    </>
  );
}

Dialogs.defaultProps = {
  littleWindow: false,
  onDialogClick: () => {},
};

Dialogs.propTypes = {
  littleWindow: PropTypes.bool,
  onDialogClick: PropTypes.func,
};

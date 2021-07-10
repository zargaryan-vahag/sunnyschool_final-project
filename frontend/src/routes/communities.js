import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import CircularProgress from '@material-ui/core/CircularProgress';
import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import MoreHorizIcon from '@material-ui/icons/MoreHoriz'; 
import AddIcon from '@material-ui/icons/Add';

import { getCommunities, toggleFollowCommunity } from '../api/community';
import Header from '../modules/header';
import Main from '../modules/main';
import Footer from '../modules/footer';
import paginator from '../managers/paginator';
import Info from '../components/info.js';
import Link from '../components/link';
import Avatar from '../components/user-avatar';
import AlertDialog from '../components/alert-dialog';
import CreateCommunityForm from '../components/create-community-form';

const useStyles = makeStyles((theme) => ({
  paper: {
    width: "100%",
    padding: theme.spacing(2),
  },
}));

function CommunityActions({ community, onToggleFollow }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const openMenu = Boolean(anchorEl);

  function handleClick(event) {
    setAnchorEl(event.currentTarget);
  }

  function handleClose() {
    setAnchorEl(null);
  }

  return (<>
    <IconButton
      aria-label="more"
      aria-controls="long-menu"
      aria-haspopup="true"
      style={{
        padding: '5px',
      }}
      onClick={handleClick}
    >
      <MoreHorizIcon />
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
      <MenuItem id={community._id} onClick={() => {
        handleClose();
        onToggleFollow();
      }}>
        {community.isFollowed ? "Unfollow" : "Follow"}
      </MenuItem>
    </Menu>
  </>);
}

export default function Communities(props) {
  const classes = useStyles();
  const [open, setOpen] = useState(false);
  const [communities, setCommunities] = useState({
    success: false,
    page: 1,
    data: [],
  });

  paginator(async (setEnd) => {
    communities.page++;
    const newCommunities = await getCommunities({
      userId: props.match.params.userId,
      page: communities.page,
    });
    setCommunities({
      success: true,
      page: communities.page,
      data: [...communities.data, ...newCommunities.data]
    });

    setEnd(newCommunities.data.length == 0);
  });

  async function toggleFollow(community) {
    const result = await toggleFollowCommunity(community._id);

    if (result.message == "followed") {
      community.isFollowed = true;
    } else {
      community.isFollowed = false;
    }
  }

  function openForm(e) {
    setOpen(true);
  }

  useEffect(async () => {
    const comms = await getCommunities({
      userId: props.match.params.userId,
      page: communities.page,
    });
    if (comms.success) {
      setCommunities({
        success: true,
        data: comms.data,
        page: communities.page,
      });
    }
  }, [props.match.params.userId]);

  if (communities.success) {
    return (<>
      <AlertDialog
        open={open}
        component={<CreateCommunityForm />}
        onClose={() => {setOpen(false)}}
      />
      <Header {...props} />
      <Main {...props}>
        <Box>
          <Paper className={classes.paper}>
            <Box
              borderBottom="dashed"
              paddingBottom="16px"
            >
              <Button
                variant="contained"
                color="primary"
                onClick={openForm}
              >
                <AddIcon /> Create
              </Button>
            </Box>
            {communities.data.length == 0 && (
              <Info text="Communities list is empty ;("/>
            )}
            {communities.data.map((community) => {
              return (
                <Box
                  key={community._id}
                  display="flex"
                  style={{
                    borderBottom: 'solid 1px darkgrey',
                    paddingBottom: '10px',
                    marginTop: '20px',
                  }}
                >
                  <Box mr={2}>
                    <Avatar
                      imageName={community.avatar}
                      imageWidth={100}
                      linkValue={"/community/" + community._id}
                    />
                  </Box>
                  <Box
                    display="flex"
                    flexDirection="column"
                    justifyContent="center"
                    width="100%"
                  >
                    <Box
                      display="flex"
                      justifyContent="space-between"
                    >
                      <Box>
                        <Typography variant="h5" component="h1">
                          <Link to={"/community/" + community._id}>{community.name}</Link>
                        </Typography>
                      </Box>
                      <Box>
                        <CommunityActions
                          community={community}
                          onToggleFollow={() => {
                            toggleFollow(community);
                          }}
                        />
                      </Box>
                    </Box>
                    <Box>
                      {community.followersCount + " followers"}
                    </Box>
                  </Box>
                </Box>
              );
            })}
          </Paper>
        </Box>
      </Main>
      <Footer />
    </>);
  } else {
    return (<>
      <Header {...props} />
      <Main {...props}>
        <Info
          text="Loading..."
          component={() => <CircularProgress color="inherit" />}
        />
      </Main>
      <Footer />
    </>);
  }
}

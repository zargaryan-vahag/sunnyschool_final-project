import React, { useState, useEffect } from 'react';
import StickyBox from "react-sticky-box";
import { useBottomScrollListener } from 'react-bottom-scroll-listener';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';

import config from '../../env.json';
import { getToken } from '../managers/token-manager';
import Header from '../modules/header';
import Main from '../modules/main';
import Footer from '../modules/footer';
import Post from '../components/post';

const useStyles = makeStyles((theme) => ({
  paper: {
    padding: theme.spacing(2),
    textAlign: 'center',
  },
  tabsRoot: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper,
    display: 'flex',
  },
  tabs: {
    borderRight: `1px solid ${theme.palette.divider}`,
    width: '100%',
    "& button": {
      minWidth: 'inherit',
    },
  },
}));

function a11yProps(index) {
  return {
    id: `vertical-tab-${index}`,
    'aria-controls': `vertical-tabpanel-${index}`,
  };
}

export default function Index(props) {
  async function getNews(page) {
    const Posts = await fetch(
      baseURL + "/posts?page=" + page,
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

  async function getLiked(page) {
    const Posts = await fetch(
      baseURL + "/posts/liked?page=" + page,
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

  async function handleChange (event, newValue) {
    setTabValue(newValue);

    if (newValue != tabValue) {
      if (newValue == 0) {
        const newPosts = await getNews(1);
        setNews({
          page: 1,
          data: newPosts.data,
        });
      } else if (newValue == 1) {
        const newPosts = await getLiked(1);
        setNews({
          page: 1,
          data: newPosts.data,
        });
      }
    }
  }

  const classes = useStyles();
  const baseURL = config.BACKEND_PROTOCOL + "://" + config.BACKEND_HOST + ":" + config.BACKEND_PORT;
  const [tabValue, setTabValue] = useState(0);
  const [news, setNews] = useState({
    page: 1,
    data: []
  });
  const [end, setEnd] = useState(false);
  
  useBottomScrollListener(async () => {
    if (end) return;

    news.page++;
    let newPosts = {};

    if (tabValue == 0) {
      newPosts = await getNews(news.page);
    } else {
      newPosts = await getLiked(news.page);
    }

    setNews({
      page: news.page,
      data: [...news.data, ...newPosts.data],
    });

    if (newPosts.data.length == 0) {
      setEnd(true);
    }
  });

  useEffect(async () => {
    const res = await getNews(1);
    const news = {};
    news.page = 1;
    news.data = res.data;
    setNews(news);
  }, []);

  return (
    <>
      <Header {...props} />
      <Main {...props}>
        <Grid container spacing={1} style={{width: '100%'}}>
          <Grid item xs={10}>
            <Box component="div" m={1}>
              {news.data.map((post) => {
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
                      imageWidth={40}
                      {...props}
                    />
                  </Paper>
                );
              })}
            </Box>
          </Grid>
          <Grid item xs={2}>
            <StickyBox offsetTop={100} offsetBottom={20}>
              <Paper style={{marginBottom: '25px'}} >
                <Box className={classes.tabsRoot} mt={1}>
                  <Tabs
                    orientation="vertical"
                    variant="scrollable"
                    value={tabValue}
                    onChange={handleChange}
                    className={classes.tabs}
                  >
                    <Tab label="News" {...a11yProps(0)} />
                    <Tab label="Liked" {...a11yProps(1)} />
                  </Tabs>
                </Box>
              </Paper>
            </StickyBox>
          </Grid>
        </Grid>
      </Main>
      <Footer />
    </>
  );
}

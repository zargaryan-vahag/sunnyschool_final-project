import React, { useState, useEffect } from 'react';
import StickyBox from "react-sticky-box";
import { useBottomScrollListener } from 'react-bottom-scroll-listener';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';

import { getPosts } from '../api/post';
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

export default function News(props) {
  async function handleChange (event, newValue) {
    setTabValue(newValue);

    if (newValue != tabValue) {
      let newPosts;
      if (newValue == 0) {
        newPosts = await getPosts({
          news: true,
          page: 1,
        });
      } else if (newValue == 1) {
        newPosts = await getPosts({
          liked: true,
          page: 1,
        });
      }
      
      setNews({
        page: 1,
        data: newPosts.data,
      });
      setEnd(false);
    }
  }

  const classes = useStyles();
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
      newPosts = await getPosts({
        news: true,
        page: news.page,
      });
    } else {
      newPosts = await getPosts({
        liked: true,
        page: news.page,
      });
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
    const res = await getPosts({
      news: true,
      page: 1,
    });
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
                      imageWidth={60}
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

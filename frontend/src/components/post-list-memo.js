import React, { memo } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';

import Post from '../components/post';

const useStyles = makeStyles((theme) => ({
  paper: {
    width: "100%",
    padding: theme.spacing(2),
  },
}));

function PostsList({ memoValues: { userData, posts, onDelete } }) {
  const classes = useStyles();
  return (<>
    {posts.map((post) => {
      return (
        <Paper
          key={post._id}
          className={classes.paper}
          style={{marginBottom: '25px'}}
        >
          <Post
            authorData={post.author}
            userData={userData}
            postData={post}
            imageWidth={50}
            onDelete={onDelete}
          />
        </Paper>
      );
    })}
  </>);
}

export default memo(PostsList);

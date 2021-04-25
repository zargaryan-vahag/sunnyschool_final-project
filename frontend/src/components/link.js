import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Link } from 'react-router-dom';

const useStyles = makeStyles({
  link: {
    color: '#3f51b5',
    textDecoration: 'none',
    '&:hover': {
      textDecoration: 'underline',
    },
  },
});

export default function CustomLink(props) {
  const classes = useStyles();

  return (
    <Link {...props} className={classes.link}>
      {props.children}
    </Link>
  );
}

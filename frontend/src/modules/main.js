import React from 'react';
import PropTypes from 'prop-types';
import StickyBox from "react-sticky-box";
import { makeStyles } from '@material-ui/core/styles';
import Menu from './menu';

const useStyles = makeStyles({
  main: {
    display: 'flex',
    justifyContent: 'center',
  },
  container: {
    maxWidth: '1000px',
    width: '100%',
    display: 'flex',
    justifyContent: 'flex-between',
    marginTop: '25px',
  },
  sidebar: {
    maxWidth: '150px',
    width: '100%',
    marginRight: '25px',
  },
  content: {
    width: 'calc(100% - 150px)',
  },
});

export default function Main(props) {
  const classes = useStyles();

  return (
    <main className={classes.main}>
      <div className={classes.container}>
        <div className={classes.sidebar}>
          <StickyBox offsetTop={100} offsetBottom={20}>
            <Menu {...props} />
          </StickyBox>
        </div>
        <div className={classes.content}>{props.children}</div>
      </div>
    </main>
  );
}

Main.propTypes = {
  children: PropTypes.object,
};

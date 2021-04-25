import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import PropTypes from 'prop-types';

const useStyles = makeStyles({
  content: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
});

export default function Info(props) {
  const classes = useStyles();

  return (
    <main className={classes.content}>
      <Card style={{ width: '300px' }}>
        <CardContent>
          <Typography
            variant="h5"
            component="h2"
            style={{ textAlign: 'center' }}
          >
            {props.text}
            {props.component && props.component()}
          </Typography>
        </CardContent>
      </Card>
    </main>
  );
}

Info.propTypes = {
  text: PropTypes.string.isRequired,
  component: PropTypes.func,
};

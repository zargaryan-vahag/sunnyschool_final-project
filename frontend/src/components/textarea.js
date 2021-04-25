import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';

const useStyles = makeStyles({
  textarea: {
    resize: 'both',
  },
});

export default function CustomTextArea(props) {
  const classes = useStyles();

  return (
    <TextField
      fullWidth
      multiline
      variant="outlined"
      className={classes.textarea}
      {...props}
    />
  );
}

import React, {useState} from 'react';
import { Img } from 'react-image';
import { makeStyles } from '@material-ui/core/styles';
import AlertDialog from '../components/alert-dialog';

export default function CustomTextArea(props) {
  function handleClick(props) {
    setComponent(function () {
      return <Img {...props}/>;
    });
    setOpen(true);
  }
  
  const [open, setOpen] = useState(false);
  const [component, setComponent] = useState(function() {});

  return (<>
    <AlertDialog
      open={open}
      onClose={() => {
        setOpen(false);
      }}
      component={component}
    />
    <Img
      onClick={() => {handleClick(props)}}
      {...props}
    />
  </>);
}

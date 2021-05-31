import React from 'react';
import { Formik, Form } from 'formik';
import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import AttachFileIcon from '@material-ui/icons/AttachFile';

import Thumb from '../components/thumb';

const useStyles = makeStyles((theme) => ({
  fileIcon: {
    cursor: 'pointer',
  },
}));

export default function ImageForm({ onSubmit }) {
  const classes = useStyles();
  const avatarExtensions = ['PNG', 'JPG', 'JPEG', 'GIF'];

  return (
    <Formik
      initialValues={{
        file: [],
      }}
      onSubmit={onSubmit}
    >
      {({
        values,
        handleSubmit,
        setFieldValue,
      }) => (
        <Form
          className={classes.form}
          onSubmit={handleSubmit}
          encType="multipart/form-data"
        >
          <p>
            supported files {avatarExtensions.join(" ")}
          </p>
          <div>
            <Box display="flex" justifyContent="space-between">
              <Box>
                <IconButton style={{
                  padding: '0',
                }}>
                  <label htmlFor="file" style={{
                    width: '25px',
                    height: '25px',
                    margin: '0px',
                  }}>
                    <AttachFileIcon className={classes.fileIcon}/>
                  </label>
                </IconButton>
              </Box>
              <Box>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                >
                  Upload
                </Button>
              </Box>
            </Box>
            <input
              id="file"
              name="file"
              type="file"
              style={{
                display: 'none',
              }}
              onChange={(event) => {
                if (event.currentTarget.files[0]) {
                  const mimeType = event.currentTarget.files[0].type;
                  if (avatarExtensions.includes(mimeType.split('/')[1].toUpperCase())) {
                    setFieldValue('file', event.currentTarget.files);
                  } else {
                    event.currentTarget.value = [];
                    setFieldValue('file', []);
                  }
                }
              }}
            />
          </div>
          <Thumb files={values.file} />
        </Form>
      )}
    </Formik>
  );
}
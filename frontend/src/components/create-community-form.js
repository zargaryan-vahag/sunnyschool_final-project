import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import TextField from '@material-ui/core/TextField';

import { createCommunity } from '../api/community';

const useStyles = makeStyles((theme) => ({
  error: {
    color: 'red',
  },
}));

export default function CreateCommunityForm() {
  const classes = useStyles();
  const [nameLength, setNameLength] = useState(0);
  const maxLength = 128;

  return (
    <Formik
      initialValues={{ name: '' }}
      validateOnChange={false}
      validateOnBlur={false}
      validationSchema={Yup.object().shape({
        name: Yup.string()
          .required('Name is required')
          .min(1, 'Name must be at least 1 character')
          .max(maxLength, `Name must be less than ${maxLength} characters`)
      })}
      onSubmit={async (values) => {
        const result = await createCommunity(values.name);
        location.href = '/community/' + result.data._id;
      }}
    >
      {({ values, handleChange, handleSubmit, errors, touched }) => (
        <Form onSubmit={handleSubmit}>
          <TextField
            className={errors.name && touched.name ? ' is-invalid' : ''}
            variant="outlined"
            margin="normal"
            fullWidth
            id="name"
            label={`Community name ${nameLength} / ${maxLength}`}
            name="name"
            type="text"
            autoComplete="off"
            autoFocus
            onChange={handleChange}
            value={values.name}
            onInput={(e) => {setNameLength(e.target.value.length)}}
            inputProps={{ maxLength: maxLength }}
          />
          <Box className={classes.error}>
            {errors.name && touched.name ? errors.name : ''}
          </Box>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
          >
            Create
          </Button>
        </Form>
      )}
    </Formik>
  );
}

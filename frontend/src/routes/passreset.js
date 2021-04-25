import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';

import config from '../../env.json';
import Header from '../modules/header';
import Footer from '../modules/footer';
import AlertDialog from '../components/alert-dialog';

const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(8),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: '100%',
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
  error: {
    color: 'red',
  },
}));

export default function Forgot(props) {
  const classes = useStyles();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div>
      <Header />
      <Container component="main" maxWidth="xs">
        <AlertDialog
          open={open}
          dialogTitle={title}
          dialogText={text}
          onClose={handleClose}
        />
        <CssBaseline />
        <div className={classes.paper}>
          <Typography component="h1" variant="h5">
            Password reset
          </Typography>
          <Formik
            initialValues={{
              password: '',
              verifypassword: '',
            }}
            validationSchema={Yup.object().shape({
              password: Yup.string()
                .min(8, 'Password must be at least 8 characters')
                .required('Password is required'),
              verifypassword: Yup.string().when('password', {
                is: (val) => !!(val && val.length > 0),
                then: Yup.string().oneOf(
                  [Yup.ref('password')],
                  'Both password need to be the same'
                ),
              }),
            })}
            onSubmit={async (values) => {
              values.resetToken = props.match.params.token;
              try {
                let response = await fetch(
                  `${config.BACKEND_PROTOCOL}://${config.BACKEND_HOST}:${config.BACKEND_PORT}/auth/passreset`,
                  {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(values),
                  }
                );
                response = await response.json();

                if (response.success) {
                  setTitle('Success');
                  setText(response.message);
                } else {
                  throw new Error(response.message);
                }
              } catch (e) {
                setTitle('Fail');
                setText(e.message);
              }

              setOpen(true);
            }}
          >
            {({ handleSubmit, handleChange, values, errors, touched }) => (
              <Form className={classes.form} onSubmit={handleSubmit}>
                <TextField
                  className={
                    errors.password && touched.password ? ' is-invalid' : ''
                  }
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  name="password"
                  label="New password"
                  type="password"
                  id="password"
                  autoComplete="current-password"
                  onChange={handleChange}
                  value={values.password}
                />
                <div className={classes.error}>
                  {errors.password && touched.password ? errors.password : ''}
                </div>
                <TextField
                  className={
                    errors.verifypassword && touched.verifypassword
                      ? ' is-invalid'
                      : ''
                  }
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  name="verifypassword"
                  label="Verify password"
                  type="password"
                  id="verifypassword"
                  onChange={handleChange}
                  value={values.verifypassword}
                />
                <div className={classes.error}>
                  {errors.verifypassword && touched.verifypassword
                    ? errors.verifypassword
                    : ''}
                </div>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="primary"
                  className={classes.submit}
                >
                  Send
                </Button>
              </Form>
            )}
          </Formik>
        </div>
      </Container>
      <Footer />
    </div>
  );
}

Forgot.propTypes = {
  match: PropTypes.object,
};

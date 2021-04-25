import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
// import Link from '@material-ui/core/Link';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import Link from '../components/link';

import AlertDialog from '../components/alert-dialog';
import Header from '../modules/header';
import Footer from '../modules/footer';
import config from '../../env.json';

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

export default function SignIn() {
  const classes = useStyles();
  const [open, setOpen] = React.useState(false);
  const [title, setTitle] = React.useState('');
  const [text, setText] = React.useState('');

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
          <Avatar className={classes.avatar}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Sign up
          </Typography>
          <Formik
            initialValues={{
              email: '',
              username: '',
              firstname: '',
              lastname: '',
              password: '',
              verifypassword: '',
            }}
            validationSchema={Yup.object().shape({
              email: Yup.string()
                .email('Email is invalid')
                .required('Email Name is required'),
              username: Yup.string()
                .matches(
                  /^[a-zA-Z0-9_\-.]+$/gm,
                  'Username is in incorrect format'
                )
                .min(3, 'Username must be at least 3 characters')
                .max(32, 'Username must be less than 32 characters')
                .required('Username is required'),
              firstname: Yup.string()
                .min(2, 'First name must be at least 2 characters')
                .max(32, 'First name must be less than 32 characters')
                .matches(/^[A-Za-z]*$/, 'First name must be in english')
                .required('First Name is required'),
              lastname: Yup.string()
                .min(2, 'Last name must be at least 2 characters')
                .max(32, 'Last name must be less than 32 characters')
                .matches(/^[A-Za-z]*$/, 'Last name must be in english')
                .required('Last Name is required'),
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
              let response = await fetch(
                `${config.BACKEND_PROTOCOL}://${config.BACKEND_HOST}:${config.BACKEND_PORT}/auth/signup`,
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
                setText(
                  'You have successfuly registered, check your mail to verify your account'
                );
              } else {
                setTitle('Fail');
                setText(response.message);
              }

              setOpen(true);
            }}
          >
            {({ handleSubmit, handleChange, values, errors, touched }) => (
              <Form className={classes.form} onSubmit={handleSubmit}>
                <TextField
                  className={errors.email && touched.email ? ' is-invalid' : ''}
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  id="email"
                  label="Email"
                  name="email"
                  autoComplete="email"
                  type="email"
                  autoFocus
                  onChange={handleChange}
                  value={values.email}
                />
                <div className={classes.error}>
                  {errors.email && touched.email ? errors.email : ''}
                </div>
                <TextField
                  className={
                    errors.username && touched.username ? ' is-invalid' : ''
                  }
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  id="username"
                  label="Username"
                  name="username"
                  autoComplete="username"
                  onChange={handleChange}
                  value={values.username}
                />
                <div className={classes.error}>
                  {errors.username && touched.username ? errors.username : ''}
                </div>
                <TextField
                  className={
                    errors.firstname && touched.firstname ? ' is-invalid' : ''
                  }
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  id="firstname"
                  label="First name"
                  name="firstname"
                  autoComplete="firstname"
                  onChange={handleChange}
                  value={values.firstname}
                />
                <div className={classes.error}>
                  {errors.firstname && touched.firstname
                    ? errors.firstname
                    : ''}
                </div>
                <TextField
                  className={
                    errors.lastname && touched.lastname ? ' is-invalid' : ''
                  }
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  id="lastname"
                  label="Last name"
                  name="lastname"
                  autoComplete="lastname"
                  onChange={handleChange}
                  value={values.lastname}
                />
                <div className={classes.error}>
                  {errors.lastname && touched.lastname ? errors.lastname : ''}
                </div>
                <TextField
                  className={
                    errors.password && touched.password ? ' is-invalid' : ''
                  }
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  name="password"
                  label="Password"
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
                  Sign up
                </Button>
                <Grid container>
                  <Grid item>
                    <Link to="/signin" variant="body2">
                      Already have an account? Sign in
                    </Link>
                  </Grid>
                </Grid>
              </Form>
            )}
          </Formik>
        </div>
      </Container>
      <Footer />
    </div>
  );
}

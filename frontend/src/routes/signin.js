import React from 'react';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
// import Checkbox from '@material-ui/core/Checkbox';
import Grid from '@material-ui/core/Grid';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
// import Link from '@material-ui/core/Link';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import Link from '../components/link';

import { signin } from '../api/auth';
import { setToken } from '../managers/token-manager';
import Header from '../modules/header';
import Footer from '../modules/footer';

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
  const [error, setError] = React.useState(null);

  return (
    <div>
      <Header />
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <div className={classes.paper}>
          <Avatar className={classes.avatar}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Sign in
          </Typography>
          <Formik
            initialValues={{
              login: '',
              password: '',
            }}
            validationSchema={Yup.object().shape({
              login: Yup.string().required('Write login'),
              password: Yup.string().required('Write password'),
            })}
            onSubmit={async (values) => {
              const response = await signin(values);

              if (response.success) {
                setToken(response.data);
                location.href = '/';
              } else {
                setError(response.message);
              }
            }}
          >
            {({ handleSubmit, handleChange, values, errors, touched }) => (
              <Form className={classes.form} onSubmit={handleSubmit}>
                <TextField
                  className={errors.email && touched.email ? ' is-invalid' : ''}
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  id="login"
                  label="Email or Username"
                  name="login"
                  autoComplete="email"
                  type="text"
                  autoFocus
                  onChange={handleChange}
                  value={values.login}
                />
                <div className={classes.error}>
                  {errors.login && touched.login ? errors.login : ''}
                </div>
                <TextField
                  className={errors.email && touched.email ? ' is-invalid' : ''}
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  id="password"
                  label="Password"
                  name="password"
                  type="password"
                  onChange={handleChange}
                  value={values.password}
                />
                <div className={classes.error}>
                  {errors.password && touched.password ? errors.password : ''}
                </div>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="primary"
                  className={classes.submit}
                >
                  Sign In
                </Button>
                <div className={classes.error}>{error}</div>
                <Grid container>
                  <Grid item xs>
                    <Link to="/forgot" variant="body2">
                      Forgot password?
                    </Link>
                  </Grid>
                  <Grid item>
                    <Link to="/signup" variant="body2">
                      Don&apos;t have an account? Sign up
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

import React from 'react';
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

export default function Forgot() {
  const classes = useStyles();
  const [open, setOpen] = React.useState(false);
  const [title, setTitle] = React.useState('');
  const [text, setText] = React.useState('');

  return (
    <div>
      <Header />
      <Container component="main" maxWidth="xs">
        <AlertDialog
          open={open}
          dialogTitle={title}
          dialogText={text}
          onClose={() => {setOpen(false)}}
        />
        <CssBaseline />
        <div className={classes.paper}>
          <Typography component="h1" variant="h5">
            Password reset
          </Typography>
          <Formik
            initialValues={{
              email: '',
            }}
            validationSchema={Yup.object().shape({
              email: Yup.string().email().required('Write valid email'),
            })}
            onSubmit={async (values) => {
              try {
                let response = await fetch(
                  `${config.BACKEND_PROTOCOL}://${config.BACKEND_HOST}:${config.BACKEND_PORT}/auth/forgot`,
                  {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(values),
                  }
                );
                response = await response.json();
                console.log(response);
                if (response.success) {
                  setTitle('Success');
                  setText('Email with instructions has been sent');
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
                <span>
                  Enter e-mail address to receive a link to reset your password
                </span>
                <TextField
                  className={errors.email && touched.email ? ' is-invalid' : ''}
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  id="email"
                  label="Email"
                  name="email"
                  autoComplete="email"
                  type="text"
                  autoFocus
                  onChange={handleChange}
                  value={values.email}
                />
                <div className={classes.error}>
                  {errors.email && touched.email ? errors.email : ''}
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

import React, { useState } from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import Box from '@material-ui/core/Box';
import Paper from '@material-ui/core/Paper';

import { editUser } from '../api/user';
import birthday from '../managers/birthday';
import Header from '../modules/header';
import Main from '../modules/main';
import Footer from '../modules/footer';
import AlertDialog from '../components/alert-dialog';

const useStyles = makeStyles((theme) => ({
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
  paper: {
    padding: theme.spacing(2),
    textAlign: 'center',
    color: theme.palette.text.secondary,
  },
}));

export default function Edit(props) {
  const classes = useStyles();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');

  const formFields = {
    firstname: props.userData.firstname,
    lastname: props.userData.lastname,
    hometown: props.userData.info.hometown || '',
    gender: props.userData.info.gender,
  }

  if (props.userData.info.birthday) {
    formFields.birthday = props.userData.info.birthday;
  }

  return (<>
    <Header {...props} />
    <Main {...props}>
      <Paper style={{
        display: "flex",
        justifyContent: "center",
      }}>
        <AlertDialog
          open={open}
          dialogTitle={title}
          dialogText={text}
          onClose={() => {
            setOpen(false);
          }}
        />
        <Box>
          <Typography component="h1" variant="h5">
            Edit my profile
          </Typography>
          <Formik
            initialValues={formFields}
            validationSchema={Yup.object().shape({
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
              hometown: Yup.string()
                .nullable()
                .max(32, 'Hometown must be less than 32 characters')
                .matches(/^[A-Za-z0-9]*$/, 'Hometown must be in english'),
              gender: Yup.number()
                .min(0, 'invalid gender')
                .max(2, 'invalid gender')
            })}
            onSubmit={async (values) => {
              const response = await editUser(values);

              if (response.success) {
                setTitle('Success');
                setText(response.message);
                props.userData.firstname = values.firstname;
                props.userData.lastname = values.lastname;
                props.userData.info.hometown = values.hometown;
                props.userData.info.gender = values.gender;
                props.userData.info.birthday = values.birthday;
              } else {
                setTitle('Fail');
                setText(response.message);
              }
              setOpen(true);
            }}
          >
            {({ handleSubmit, handleChange, values, errors, touched }) => (
              <Form className={classes.form} onSubmit={handleSubmit}>
                <Box width="500px">
                  <Box>
                    <TextField
                      variant="outlined"
                      margin="normal"
                      fullWidth
                      id="firstname"
                      label="First name"
                      name="firstname"
                      autoComplete="firstname"
                      type="text"
                      onChange={handleChange}
                      value={values.firstname}
                    />
                    <div className={classes.error}>
                      {errors.firstname && touched.firstname ? errors.firstname : ''}
                    </div>
                  </Box>
                  <Box>
                    <TextField
                      variant="outlined"
                      margin="normal"
                      fullWidth
                      id="lastname"
                      label="Last name"
                      name="lastname"
                      type="lastname"
                      onChange={handleChange}
                      value={values.lastname}
                    />
                    <div className={classes.error}>
                      {errors.lastname && touched.lastname ? errors.lastname : ''}
                    </div>
                  </Box>
                  <Box>
                    <TextField
                      variant="outlined"
                      margin="normal"
                      fullWidth
                      id="hometown"
                      label="Hometown"
                      name="hometown"
                      type="hometown"
                      onChange={handleChange}
                      value={values.hometown}
                    />
                    <div className={classes.error}>
                      {errors.hometown && touched.hometown ? errors.hometown : ''}
                    </div>
                  </Box>
                  <Box>
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                      mt={2}
                    >
                      <FormControl variant="outlined" className={classes.formControl}>
                        <InputLabel htmlFor="outlined-gender-native-simple">Gender</InputLabel>
                        <Select
                          native
                          name="gender"
                          value={values.gender}
                          label="Gender"
                          inputProps={{
                            name: "gender",
                            id: "outlined-gender-native-simple",
                            onChange: handleChange,
                          }}
                        >
                          <option value={0}>Not selected</option>
                          <option value={1}>Male</option>
                          <option value={2}>Female</option>
                        </Select>
                      </FormControl>
                      <TextField
                        type="date"
                        label="Birthday"
                        name="birthday"
                        value={birthday(values.birthday)}
                        onChange={handleChange}
                        inputProps={{
                          id: "outlined-birthday-native-simple",
                        }}
                        InputLabelProps={{
                          shrink: true,
                        }}
                      />
                    </Box>
                    <div className={classes.error}>
                      {errors.gender && touched.gender ? errors.gender : ''}
                    </div>
                  </Box>
                  <Box>
                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      color="primary"
                      className={classes.submit}
                    >
                      Save
                    </Button>
                  </Box>
                </Box>
              </Form>
            )}
          </Formik>
        </Box>
      </Paper>
    </Main>
    <Footer />
  </>);
}

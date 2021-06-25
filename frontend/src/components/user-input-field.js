import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import Picker, { SKIN_TONE_NEUTRAL } from 'emoji-picker-react';
import { Formik, Form } from 'formik';
import { makeStyles } from '@material-ui/core/styles';
import Collapse from '@material-ui/core/Collapse';
import IconButton from '@material-ui/core/IconButton';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import InsertEmoticonIcon from '@material-ui/icons/InsertEmoticon';
import AttachFileIcon from '@material-ui/icons/AttachFile';

import UserAvatar from '../components/user-avatar';
import Textarea from '../components/textarea';
import Thumb from '../components/thumb';

const useStyles = makeStyles({
  emoji: {
    cursor: 'pointer',
  },
  button: {
    textTransform: 'none',
    minWidth: '100%',
    width: '100%',
    height: 'min-content',
    padding: '0',
    wordBreak: 'keep-all',
  },
  fileIcon: {
    cursor: 'pointer',
  },
  error: {
    color: 'red',
  },
});

export default function UserInputField(props) {
  function onEmojiClick(e, emojiObject) {
    const input = fileElement.current.form.postText;
    const lastValue = input.value;
    input.value += emojiObject.emoji;

    const event = new Event('input', { bubbles: true });
    event.simulated = true;

    const tracker = input._valueTracker;
    if (tracker) {
      tracker.setValue(lastValue);
    }

    input.dispatchEvent(event);
  }

  function toggleEmojiBox() {
    if (picker == null) {
      setPicker(function () {
        return <>
          <Picker
            groupVisibility={{
              smileys_people: true,
              animals_nature: true,
              food_drink: true,
              travel_places: true,
              activities: true,
              objects: true,
              symbols: true,
              flags: true,
              recently_used: true,
            }}
            skinTone={SKIN_TONE_NEUTRAL}
            preload={false}
            disableSkinTonePicker={true}
            onEmojiClick={onEmojiClick}
            pickerStyle={{
              width: '100%',
            }}
          />
        </>
      });
    }
    setEmojiBox(!emojiBox);
  }

  function handlePostTextChange(e) {
    setPostText(e.currentTarget.value);
  }

  const classes = useStyles();
  const [emojiBox, setEmojiBox] = useState(false);
  const [postText, setPostText] = useState('');
  const [picker, setPicker] = useState(null);
  const fileElement = useRef();

  const formFields = {
    postText: ''
  };

  if (props.fileInput) {
    formFields.files = [];
  }

  return (
    <Formik
      initialValues={formFields}
      validateOnChange={false}
      validateOnBlur={false}
      onSubmit={async (values, obj) => {
        if (values.files && values.files.length === 0 && values.postText == '') {
          obj.setFieldError(
            'postText',
            'Posts content is required if there is no file'
          );
        } else {
          props.onPost(values, () => {
            obj.resetForm();
            setPostText('');
          });
        }
      }}
    >
      {({
        values,
        handleChange,
        handleSubmit,
        setFieldValue,
        errors,
        touched,
      }) => (
        <Form
          className={classes.form}
          onSubmit={handleSubmit}
          encType="multipart/form-data"
        >
          <input
            type="hidden"
            name="ref"
            ref={fileElement}
          />
          <Box display="flex" justifyContent="space-between">
            <Grid item xs={1} style={{maxWidth: 'inherit'}}>
              <Box display="flex" justifyContent="center" alignItems="center">
                <UserAvatar
                  username={props.userData.username}
                  imageName={props.userData.avatar}
                  imageWidth={40}
                />
              </Box>
              {props.fileInput && (
                <Box display="flex" alignItems="flex-end" height="100%">
                  <Box mb={5} width="100%" display="flex" justifyContent="center">
                    <IconButton style={{
                      padding: '0',
                    }}>
                      <label htmlFor="files" style={{
                        width: '25px',
                        height: '25px',
                        margin: '0px',
                      }}>
                        <AttachFileIcon className={classes.fileIcon}/>
                      </label>
                    </IconButton>
                    <input
                      multiple
                      id="files"
                      name="files"
                      type="file"
                      style={{ display: 'none' }}
                      onChange={(event) => {
                        setFieldValue('files', Array.prototype.slice.call([...event.currentTarget.files, ...values.files], 0, 10));
                      }}
                    />
                  </Box>
                </Box>
              )}
            </Grid>
            <Grid item xs={10} style={{maxWidth: 'inherit'}}>
              <Box ml={1} mr={1}>
                <Textarea
                  id="postText"
                  name="postText"
                  type="text"
                  value={postText}
                  onChange={(e) => {
                    handleChange(e);
                    handlePostTextChange(e);
                  }}
                  onKeyPress={(e) => {
                    if (e.shiftKey && e.key == "Enter") {
                      e.preventDefault();
                      setPostText(postText + "\n");
                    } else if (!e.shiftKey && e.key == "Enter") {
                      e.preventDefault();
                      e.target.form.submit.click();
                    }
                  }}
                  disabled={props.disabled}
                  {...props.textarea}
                />
                <div className={classes.error}>
                  {errors.postText && touched.postText ? errors.postText : ''}
                </div>
                <div>
                  <Collapse in={emojiBox}>
                    {picker != null ? picker : ''}
                  </Collapse>
                </div>
              </Box>
            </Grid>
            <Grid item xs={1} style={{maxWidth: 'inherit'}}>
              <Box display="flex" justifyContent="center">
                <InsertEmoticonIcon
                  className={classes.emoji}
                  onClick={toggleEmojiBox}
                />
              </Box>
              <Box
                display="flex"
                alignItems={props.fileInput ? "flex-end" : ''}
                height={props.fileInput ? '100%' : '95%'}
              >
                <Box
                  mb={4}
                  width="100%"
                  display="flex"
                  justifyContent="center"
                >
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    name="submit"
                    className={classes.button}
                    disabled={props.disabled}
                  >
                    {props.buttonText}
                  </Button>
                </Box>
              </Box>
            </Grid>
          </Box>
          <Grid item xs={12}>
            {props.fileInput && (
              <Box mr={1} ml={1}>
                <Thumb
                  files={values.files}
                  onDelete={(index) => {
                    values.files.splice(index, 1);
                    setFieldValue('files', values.files);
                  }}
                />
              </Box>
            )}
          </Grid>
        </Form>
      )}
    </Formik>
  );
}

UserInputField.defaultProps = {
  fileInput: true,
  buttonText: 'Post',
  disabled: false,
  shiftSubmit: false,
};

UserInputField.propTypes = {
  userData: PropTypes.object.isRequired,
  textarea: PropTypes.object,
  fileInput: PropTypes.bool,
  onPost: PropTypes.func,
  buttonText: PropTypes.string,
  disabled: PropTypes.bool,
  shiftSubmit: PropTypes.bool,
};

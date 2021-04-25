import React, { useState, useEffect, Fragment } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import CircularProgress from '@material-ui/core/CircularProgress';
import Box from '@material-ui/core/Box';

import config from '../../env.json';
import { getToken } from '../managers/token-manager';
import UserAvatar from './user-avatar';
import Link from './link';

const useStyles = makeStyles((theme) => ({
  list: {
    padding: '0',
    "& li": {
      padding: '0'
    }
  }
}));

export default function Search() {
  const classes = useStyles();
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const baseURL = config.BACKEND_PROTOCOL + "://" + config.BACKEND_HOST + ":" + config.BACKEND_PORT;

  async function search(q) {
    if (loading) return;
    setLoading(true);

    if (q != '') {
      const response = await fetch(
        baseURL + '/users?q=' + q,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            accesstoken: getToken(),
          }
        }
      );
      const users = await response.json();
      
      setOptions(users.data);
    } else {
      setOptions([]);
    }

    setLoading(false);
  }

  useEffect(() => {
    if (!open) {
      setOptions([]);
    }
  }, [open]);

  return (
    <Autocomplete
      value={searchValue}
      id="asynchronous-demo"
      style={{ width: 300 }}
      open={open}
      onOpen={() => {
        setOpen(true);
      }}
      onClose={() => {
        setOpen(false);
        setLoading(false);
      }}
      ListboxProps={{
        className: classes.list
      }}
      getOptionSelected={(option, value) => option.name === value.name}
      getOptionLabel={(option) => {
        return option 
          ? option.firstname + " " + option.lastname + " " + option.username
          : '';
      }}
      renderOption={(option) => (<>
        <Link
          to={"/profile/" + option.username}
          style={{
            display: 'block',
            width: '100%',
            padding: '6px 16px'
          }}
          onClick={() => {setSearchValue('')}}
        >
          <Box display="flex" alignItems="center">
            <Box mr={2}>
              <UserAvatar
                username={option.username}
                imageName={option.avatar}
                imageWidth={40}
                link={false}
              />
            </Box>
            <Box>
              {option.firstname} {option.lastname}
            </Box>
          </Box>
        </Link>
      </>)}
      options={options}
      loading={loading}
      renderInput={(params) => (
        <TextField
          {...params}
          onChange={(e) => {
            search(e.target.value);
          }}
          label="Search"
          variant="outlined"
          InputProps={{
            ...params.InputProps,
            style: {
              backgroundColor: 'white',
            },
            endAdornment: (
              <Fragment>
                {loading && open ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </Fragment>
            ),
          }}
        />
      )}
    />
  );
}

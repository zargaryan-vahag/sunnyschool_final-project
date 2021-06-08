import React, { useState, useEffect, Fragment } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import CircularProgress from '@material-ui/core/CircularProgress';
import Box from '@material-ui/core/Box';

import { searchUser } from '../api/user';
import { searchCommunity } from '../api/community';
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
  
  async function search(q) {
    if (loading) return;
    setLoading(true);

    if (q != '') {
      const users = await searchUser(q);
      users.data.forEach((user) => {
        user.type = "user";
      });
      
      const communities = await searchCommunity(q);
      communities.data.forEach((community) => {
        community.type = "community";
      });
      
      setOptions([...users.data, ...communities.data]);
    } else {
      setOptions([]);
    }

    setLoading(false);
  }

  function optionLabel(option) {
    if (!option) {
      return '';
    }

    return (option.type == "user")
      ? option.firstname + " " + option.lastname + " " + option.username :
    (option.type == "community")
      ? option.name : "";
  }

  function optionRenderer(option) {
    return (<>
      <Link
        to={
          (option.type == "user") ? "/profile/" + option.username :
          (option.type == "community") ? "/community/" + option._id : ""
        }
        style={{
          display: 'block',
          width: '100%',
          padding: '6px 16px',
        }}
        onClick={() => {setSearchValue('')}}
      >
        <Box display="flex" alignItems="center">
          <Box mr={2}>
            <UserAvatar
              username={
                (option.type == "user") ? option.username :
                (option.type == "community") ? option._id : ""
              }
              imageName={option.avatar}
              imageWidth={40}
              link={false}
            />
          </Box>
          <Box>
            {
              (option.type == "user") ? option.firstname + " " + option.lastname :
              (option.type == "community") ? option.name : ""
            }
          </Box>
        </Box>
      </Link>
    </>)
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
      getOptionSelected={(option, value) => option._id === value._id}
      getOptionLabel={optionLabel}
      renderOption={optionRenderer}
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

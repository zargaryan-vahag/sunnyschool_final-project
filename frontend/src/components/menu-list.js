import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Box from '@material-ui/core/Box';

import Link from '../components/link';

function MenuList({ children, list, onItemSelect }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = (name = null) => {
    setAnchorEl(null);
    if (name !== null) {
      onItemSelect(name);
    }
  };
  
  return (<>
    <Box
      component="span"
      display="inline"
      aria-controls="simple-menu"
      aria-haspopup="true"
      onClick={handleClick}
    >
      {children}
    </Box>
    <Menu
      id="simple-menu"
      anchorEl={anchorEl}
      keepMounted
      open={Boolean(anchorEl)}
      onClose={() => handleClose()}
    >
      {list.map((item) => (
        <Box component="span" display="inline" key={item.name}>
          {item.link ? (
            <Link key={item.link} to="/">
              <MenuItem key={item.name} onClick={() => handleClose(item.name)}>
                {item.title}
              </MenuItem>
            </Link>
          ) : (
            <MenuItem key={item.name} onClick={() => handleClose(item.name)}>
              {item.title}
            </MenuItem>
          )}
        </Box>
      ))}
    </Menu>
  </>);
}

MenuList.propTypes = {
  list: PropTypes.array.isRequired,
  onItemSelect: PropTypes.func.isRequired,
};

export default MenuList;

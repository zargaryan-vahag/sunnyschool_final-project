module.exports = (userdata) => {
  delete userdata.password;
  delete userdata.token;
  delete userdata.email;
  return userdata;
}

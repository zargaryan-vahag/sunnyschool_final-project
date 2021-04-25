module.exports = {
  getToken() {
    return localStorage.getItem('accessToken');
  },
  setToken(token) {
    localStorage.setItem('accessToken', token);
  },
  delToken() {
    localStorage.removeItem('accessToken');
  },
};

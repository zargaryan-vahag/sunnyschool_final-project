module.exports = (app) => {
  app.use('/auth', require('./routes/auth'));
  app.use('/users', require('./routes/users'));
  app.use('/posts', require('./routes/posts'));
  app.use('/dialogs', require('./routes/dialogs'));
};

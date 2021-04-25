import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from 'react-router-dom';
import Helmet from 'react-helmet';

import Signin from './routes/signin';
import Signup from './routes/signup';
import Forgot from './routes/forgot';
import Verify from './routes/verify';
import Profile from './routes/profile';
import News from './routes/news';
import Dialog from './routes/dialog';
import Dialogs from './routes/dialogs';
import Friends from './routes/friends';
import Communities from './routes/communities';
import Passwordreset from './routes/passreset';
import Edit from './routes/edit';

import './css/global-styles.css';
import authHandler from './managers/auth-handler';

import { SocketContext, socket } from './context/socket';

export default function App() {
  async function getUser() {
    const user = await authHandler();
    setUser(user);
  }

  const [user, setUser] = React.useState(false);

  React.useEffect(() => {
    getUser();
  }, [setUser]);

  if (user) {
    return (
      <SocketContext.Provider value={socket}>
        <Router>
          <Helmet bodyAttributes={{ style: 'background-color: #EDEEF0' }} />
          <Switch>
            <Route
              exact
              path="/profile/:username"
              component={(props) => <Profile {...props} userData={user.data}/>}
            />
            <Route
              path="/news"
              component={(props) => <News {...props} userData={user.data}/>}
            />
            <Route
              path="/dialog/:userId"
              component={(props) => <Dialog {...props} userData={user.data}/>}
            />
            <Route
              path="/dialogs"
              component={(props) => <Dialogs {...props} userData={user.data}/>}
            />
            <Route
              path="/friends/:userId"
              component={(props) => <Friends {...props} userData={user.data}/>}
            />
            <Route
              path="/communities"
              component={(props) => <Communities {...props} userData={user.data}/>}
            />
            <Route
              path="/edit"
              component={(props) => <Edit {...props} userData={user.data}/>}
            />
            <Route
              path="/verify"
              component={(props) => <Verify {...props} userData={user.data}/>}
            />
            <Route path="/">
              <Redirect to="/news"/>
            </Route>
          </Switch>
        </Router>
      </SocketContext.Provider>
    );
  }
  if (user == null) {
    return (
      <Router>
        <Helmet bodyAttributes={{ style: 'background-color: #EDEEF0' }} />
        <Switch>
          <Route path="/verify" component={(props) => <Verify {...props} />} />
          <Route path="/signup" component={(props) => <Signup {...props} />} />
          <Route path="/signin" component={(props) => <Signin {...props} />} />
          <Route path="/forgot" component={(props) => <Forgot {...props} />} />
          <Route
            path="/passwordreset/:token"
            component={(props) => <Passwordreset {...props} />}
          />
          <Route path="/">
            <Redirect to="/signin" />
          </Route>
        </Switch>
      </Router>
    );
  } else {
    return <></>;
  }
}

const TokenManager = require('./managers/token-manager');
const AppError = require('./managers/app-error');
const UsersCtrl = require('./controllers/users.ctrl');
const DialogCtrl = require('./controllers/dialogs.ctrl');

module.exports = (server) => {  
  const io = require('socket.io')(server, {
    cors: {
      origin: `http://${process.env.frontendHost}:${process.env.frontendPort}`,
      methods: ["GET", "POST"]
    }
  });

  io.use(async (client, next) => {
    try {
      if (client.handshake.auth.token) {
        const decoded = await TokenManager.decode(client.handshake.auth.token);
        if (decoded.userId) {
          client.userId = decoded.userId;
          next();
        } else {
          throw new AppError('Auth error', 401);
        }
      } else {
        throw new AppError('Token not provided', 401);
      }
    } catch (e) {
      new AppError(e.message, 401);
    }
  }).on('connection', (client) => {
    console.log("User connected");

    onlineUsers.set(client.userId, client);

    client.on('disconnect', () => {
      onlineUsers.delete(client.userId);
      console.log("disconnected");
    });

    client.on('get_messages', async (params) => {
      try {
        let dialog;

        if (params.dialogId) {
          dialog = await DialogCtrl.getMessagesByDialogId({
            dialogId: params.dialogId,
            user1: client.userId,
            user2: params.userId,
            page: params.page
          });
        } else {
          dialog = await DialogCtrl.getMessages({
            user1: client.userId,
            user2: params.userId,
            page: params.page
          });
        }
        
        client.emit('get_messages', dialog);
      } catch (e) {
        console.log(e);
      }
    });

    client.on('new_message', async (data) => {
      try {
        const check = await UsersCtrl.checkFriend(client.userId, data.to);
      
        if (check[0].isFriend) {
          const dialog = await DialogCtrl.newMessage({
            from: client.userId,
            to: data.to,
            text: data.text
          });
          
          client.emit('new_message', dialog);
          if (onlineUsers.has(data.to)) {
            onlineUsers.get(data.to).emit('new_message', dialog);
          }
        }
      } catch (e) {
        console.log(e);
      }
    });

    client.on('read', async (data) => {
      try {
        await DialogCtrl.read(data.dialogId, client.userId);

        if (onlineUsers.has(data.interlocutor)) {
          onlineUsers.get(data.interlocutor).emit('read');
        }
      } catch (e) {
        console.log(e);
      }
    });

    client.on('online_status', (data) => {
      client.emit('online_status', {
        online: onlineUsers.has(data.userId)
      });
    });

    client.on('has_unread_message', async () => {
      try {
        const check = await DialogCtrl.hasUnreadMessage(client.userId);
        client.emit('has_unread_message', {
          has: check
        });
      } catch (e) {
        console.log(e);
      }
    });
  });
};

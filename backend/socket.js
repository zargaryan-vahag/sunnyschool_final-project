const TokenManager = require('./managers/token-manager');
const DialogService = require('./services/dialog-service');
const FriendService = require('./services/friend-service');
const AppError = require('./managers/app-error');

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
          throw AppError.unauthorized();
        }
      } else {
        throw AppError.unauthorized();
      }
    } catch (e) {
      console.log(e);
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
          dialog = await DialogService.getMessagesByDialogId(
            params.dialogId,
            client.userId,
            params.userId,
            params.page
          );
        } else {
          dialog = await DialogService.getMessages(
            client.userId,
            params.userId,
            params.page
          );
        }
        
        client.emit('get_messages', dialog);
      } catch (e) {
        console.log(e);
      }
    });

    client.on('new_message', async (data) => {
      try {
        const isFriend = await FriendService.isFriend(client.userId, data.to);
        if (isFriend) {
          const dialog = await DialogService.newMessage(
            client.userId,
            data.to,
            data.text.trim()
          );
          
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
        await DialogService.read(data.dialogId, client.userId);

        if (onlineUsers.has(data.interlocutor)) {
          onlineUsers.get(data.interlocutor).emit('read', {
            dialogId: data.dialogId
          });
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
        const check = await DialogService.hasUnreadMessage(client.userId);
        client.emit('has_unread_message', {
          has: check
        });
      } catch (e) {
        console.log(e);
      }
    });

    client.on('del_message', async (data) => {
      try {
        const dialog = await DialogService.getMessage(data.dialogId, data.messageId);
        if (dialog.messages[0].userId._id != client.userId) {
          throw AppError.inaccessible("Access denied");
        }

        await DialogService.deleteMessage(data.dialogId, data.messageId);
        
        client.emit('del_message', dialog);
      } catch (e) {
        console.log(e);
      }
    });

    client.on('public_message', (data) => {
      data.message = data.message.trim().slice(0,200);
      if (data.message != "") {
        io.sockets.emit('public_message', data);
      }
    })
  });
};

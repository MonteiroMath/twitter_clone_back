const socket = require("../socket");
const User = require("../models/users");
const Message = require("../models/messages");

function postMessage(req, res, next) {
  const { newMessage } = req.body;

  if (!newMessage) {
    throw new Error("Request must contain the new message data");
  }

  const { message, authorID, recipientID } = newMessage;

  if (!authorID || !recipientID || !message) {
    throw new Error("Missing required data on newMessage");
  }

  if (authorID === recipientID) {
    throw new Error("User cannot message himself");
  }

  const findAuthorPromise = User.findByPk(authorID);
  const findRecipientPromise = User.findByPk(recipientID);

  Promise.all([findAuthorPromise, findRecipientPromise])
    .then(([author, recipient]) => {
      if (!author) throw new Error(`User ${authorID} not found`);
      if (!recipient) throw new Error(`User ${recipientID} not found`);

      return Message.create({
        authorID,
        recipientID,
        message,
      });
    })
    .then((message) => {
      const io = socket.getIO();
      io.emit("NEW_MESSAGE", { action: "CREATE", message });
      res.json({ success: true });
    })
    .catch(next);
}

module.exports = {
  postMessage,
};

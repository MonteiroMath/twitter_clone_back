const { sequelize } = require("../db/dbAdapter");
const { QueryTypes } = require("sequelize");
const socket = require("../socket");
const User = require("../models/users");
const Conversation = require("../models/conversations");
const Message = require("../models/messages");

function getMessages(req, res, next) {
  const { authorID, recipientID } = req.params;

  Message.findAll({
    where: {
      authorID: {
        [Op.or]: [authorID, recipientID],
      },
      recipientID: {
        [Op.or]: [authorID, recipientID],
      },
    },
    order: [["createdAt", "ASC"]],
    limit: 10,
  })
    .then((messages) => {
      res.json({ success: true, messages });
    })
    .catch(next);
}

function postConversation(req, res) {
  const { from, to } = req.body;

  if (!from || !to) {
    throw new Error("Missing required data");
  }

  const findAuthorPromise = User.findByPk(authorID);
  const findRecipientPromise = User.findByPk(recipientID);

  Promise.all([findAuthorPromise, findRecipientPromise])
    .then(([author, recipient]) => {
      if (!author) throw new Error(`User ${from} not found`);
      if (!recipient) throw new Error(`User ${to} not found`);

      return Conversation.create();
    })
    .then((conversation) => {
      conversation.setUsers([author, recipient]);
    })
    .then((conversation) => {
      res.json({ success: true, conversation });
    })
    .catch(next);
}

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

function getConversations(req, res, next) {
  const { userID } = req.params;

  Conversation.findAll({
    include: [{ model: User, where: { id: userID } }],
  })
    .then((conversations) => {
      res.json({ success: true, conversations });
    })
    .catch((error) => {
      console.error(error);
    });
}

module.exports = {
  getMessages,
  postMessage,
  getConversations,
};

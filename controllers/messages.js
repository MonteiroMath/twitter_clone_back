const { sequelize } = require("../db/dbAdapter");
const { QueryTypes } = require("sequelize");
const socket = require("../socket");
const User = require("../models/users");
const Conversation = require("../models/conversations");
const Message = require("../models/messages");

function getMessages(req, res, next) {
  const { conversationID } = req.params;

  Conversation.findByPk(conversationID)
    .then((conversation) => {
      if (!conversation) {
        throw new Error(`Conversation ${conversationID} not found`);
      }

      return conversation.getMessages({
        order: [["createdAt", "ASC"]],
        limit: 10,
      });
    })
    .then((messages) => {
      res.json({ success: true, messages });
    })
    .catch(next);
}

function postConversation(req, res, next) {
  const { from, to } = req.body;

  if (!from || !to) {
    throw new Error("Missing required data");
  }

  const findAuthorPromise = User.findByPk(from);
  const findRecipientPromise = User.findByPk(to);

  Promise.all([findAuthorPromise, findRecipientPromise])
    .then(([author, recipient]) => {
      if (!author) throw new Error(`User ${from} not found`);
      if (!recipient) throw new Error(`User ${to} not found`);

      return Conversation.create();
    })
    .then((conversation) => {
      return conversation.setParticipants([from, to]);
    })
    .then((conversation) => {
      res.json({ success: true, conversation });
    })
    .catch(next);
}

function postMessage(req, res, next) {
  const { conversationID } = req.params;
  const { newMessage } = req.body;

  if (!newMessage) {
    throw new Error("Request must contain the new message data");
  }

  const { message, userID } = newMessage;

  if (!userID || !message) {
    throw new Error("Missing required data on newMessage");
  }

  const findAuthorPromise = User.findByPk(userID);
  const findConversationPromise = Conversation.findByPk(conversationID);

  Promise.all([findAuthorPromise, findConversationPromise])
    .then(([author, conversation]) => {
      if (!author) throw new Error(`User ${userID} not found`);
      if (!conversation) throw new Error(`User ${conversationID} not found`);

      return conversation.addMessage({
        userID,
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
  postConversation,
};

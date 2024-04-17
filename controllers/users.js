const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/users");

const JWT_SECRET = process.env.JWT_SECRET;

const getUserByUsername = (req, res, next) => {
  //return the list of users or a user by Username

  const { username } = req.query;

  if (!username) {
    return next(new Error("You must inform the username in the query"));
  }

  User.findOne({ where: { username: username } }).then((user) => {
    if (!user) {
      return next(new Error("User not found"));
    }

    res.json({
      success: true,
      user: user.hidePassword(),
    });
  });

  //User.findAll().then((users) => res.json({ success: true, users }));
};

const getUser = (req, res) => {
  //gets an user by the id parameter
  // return an object to the client containing said user

  let { id } = req.params;

  User.findByPk(id).then((user) => {
    res.json({
      success: true,
      user,
    });
  });
};

const createUser = (req, res, next) => {
  const { username, email, password, birthDate, webpage } = req.body;

  if (!username || !email || !password || !birthDate)
    throw new Error("Invalid request - User data must be informed");

  User.findOne({
    where: {
      email,
    },
  })
    .then((user) => {
      if (user) {
        const error = new Error("User already registered");
        error.status = 409;
        next(error);
      }

      return bcrypt.hash(password, 12);
    })
    .then((hashedPassword) => {
      return User.create({
        username,
        email,
        password: hashedPassword,
        birthDate,
        webpage,
      });
    })
    .then((user) => {
      const safeUser = user.hidePassword();

      const jwtToken = jwt.sign(
        {
          userId: user.id,
        },
        JWT_SECRET,
        {
          expiresIn: "1h",
        }
      );

      res.status(200).json({ success: true, jwtToken, user: safeUser });
    })
    .catch(next);
};

const login = (req, res, next) => {
  const { email, password } = req.body;
  let user;

  if (!email || !password) {
    const error = new Error("Invalid request - User data must be informed");
    error.status = 400;
    return next(error);
  }

  User.findOne({ where: { email } })
    .then((registeredUser) => {
      if (!registeredUser) {
        const error = new Error("User not found");
        error.status = 404;
        return next(error);
      }

      user = registeredUser.hidePassword();
      return bcrypt.compare(password, registeredUser.password);
    })
    .then((correctPassword) => {
      if (!correctPassword) {
        const error = new Error("Wrong Password");
        error.status = 401;
        return next(error);
      }

      const jwtToken = jwt.sign(
        {
          userId: user.id,
        },
        JWT_SECRET,
        {
          expiresIn: "1h",
        }
      );

      res.status(200).json({ success: true, jwtToken, user });
    });
};

const followUser = (req, res, next) => {
  const { reqUserId: followerId } = req;
  const { followedId } = req.params;

  let followerUser;

  const findFollowerPromise = User.findByPk(followerId);
  const fintFollowedPromise = User.findByPk(followedId);

  Promise.all([findFollowerPromise, fintFollowedPromise])
    .then(([follower, followed]) => {
      if (!follower) throw new Error(`User ${followerId} not found`);
      if (!followed) throw new Error(`User ${followedId} not found`);

      followerUser = follower;
      return followerUser.addFollowed(followed);
    })
    .then((follow) => {
      if (!follow)
        throw new Error(`It wasn't possible to follow user ${followedId}`);

      return followerUser.reload();
    })
    .then((updatedFollowerUser) =>
      res.json({ success: true, user: updatedFollowerUser.hidePassword() })
    )
    .catch(next);
};

const unfollowUser = (req, res, next) => {
  /*
    - Check if both users exist
      - If not, next(error)
    - follower.removeFollowed
    - return updated user

  */
  const { reqUserId: followerId } = req;
  const { followedId } = req.params;

  let followerUser;

  const findFollowerPromise = User.findByPk(followerId);
  const fintFollowedPromise = User.findByPk(followedId);

  Promise.all([findFollowerPromise, fintFollowedPromise])
    .then(([follower, followed]) => {
      if (!follower) throw new Error(`User ${followerId} not found`);
      if (!followed) throw new Error(`User ${followedId} not found`);

      followerUser = follower;

      return followerUser.removeFollowed(followed);
    })
    .then((success) => {
      if (!success)
        throw new Error(`It wasn't possible to unfollow user ${followedId}`);

      return followerUser.reload();
    })
    .then((updatedFollowerUser) =>
      res.json({ success: true, user: updatedFollowerUser.hidePassword() })
    )
    .catch(next);
};

//middlewares //todo move to a middlewares folder

const findUser = (req, res, next) => {
  //find an user by the userId parameter
  //set said user on the req and pass execution to the next middleware

  const { id } = req.params;

  User.findByPk(id)
    .then((user) => {
      if (!user) throw new Error(`User ${id} not found`);

      req.user = user;
      next();
    })
    .catch(next);
};

const parseUserFromBody = (req, res, next) => {
  const { userId } = req.body;

  if (!userId) throw new Error(`An user id must be informed`);

  User.findByPk(userId)
    .then((user) => {
      if (!user) throw new Error(`User ${userId} not found`);

      req.user = user;
      next();
    })
    .catch(next);
};

const parseUserFromQuery = (req, res, next) => {
  const { username, userId } = req.query;

  if (!username && !userId)
    throw new Error("An username or userId must be informed");

  const getUserPromise = userId
    ? User.findByPk(userId)
    : User.findOne({ where: { username: username } });

  getUserPromise
    .then((user) => {
      if (!user) {
        return next(new Error("User not found"));
      }
      req.user = user;
      next();
    })
    .catch(next);
};

function verifyUser(req, res, next) {
  //middleware that verifies if an userId was sent in the body of the request and if the informed corresponds to an actual user
  //responds with an error if negative. Adds the id to the userId property of the request if positive.

  const { userId } = req.body;
  if (!userId) {
    throw new Error("The user id must be informed");
  }

  User.findByPk(userId).then((user) => {
    if (!user) throw new Error(`User ${id} not found`);

    req.userId = parseInt(userId);
    next();
  });
}

module.exports = {
  getUser,
  getUserByUsername,
  findUser,
  parseUserFromBody,
  parseUserFromQuery,
  createUser,
  verifyUser,
  login,
  followUser,
  unfollowUser,
};

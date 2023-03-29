const { StatusCodes } = require('http-status-codes');
const User = require('../models/User');
const CustomError = require('../errors');
const {
  createTokenUser,
  attachCookiesToResponse,
  checkPermissions,
} = require('../utils');

const getAllUsers = async (req, res) => {
  console.log(req.user);
  const users = await User.find({ role: 'user' }).select('-password');
  res.status(StatusCodes.OK).json({ users });
};

const getSingleUser = async (req, res) => {
  const { id } = req.params;
  const user = await User.findOne({ _id: id }).select('-password');
  if (!user) {
    throw new CustomError.NotFoundError(`No item found with id: ${id}`);
  }
  checkPermissions(req.user, user._id);
  res.status(StatusCodes.OK).json({ user });
};

const showCurrentUser = async (req, res) => {
  res.status(StatusCodes.OK).json({ user: req.user });
};

// update name and email with findOneAndUpdate
// const updateUser = async (req, res) => {
//   const { email, name } = req.body;
//   if (!email || !name) {
//     throw new CustomError.BadRequestError('Please provide all values');
//   }
//   const user = await User.findOneAndUpdate(
//     { _id: req.user.userId },
//     { email: email, name: name },
//     { new: true, runValidators: true }
//   );
//   const tokenUser = createTokenUser(user);
//   attachCookiesToResponse({ res, user: tokenUser });
//   res.status(StatusCodes.OK).json({ user: tokenUser });
// };

// update name and email with user.save() hook
const updateUser = async (req, res) => {
  const { email, name } = req.body;
  if (!email || !name) {
    throw new CustomError.BadRequestError('Please provide all values');
  }
  const user = await User.findOne({ _id: req.user.userId });
  user.email = email;
  user.name = name;

  await user.save();
  const tokenUser = createTokenUser(user);
  attachCookiesToResponse({ res, user: tokenUser });
  res.status(StatusCodes.OK).json({ user: tokenUser });
};

// update password
const updateUserPassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    throw new CustomError.BadRequestError(
      'Please provide old password and new password '
    );
  }
  // find user from database by id
  const user = await User.findOne({ _id: req.user.userId });

  const isPasswordCorrect = await user.comparePassword(oldPassword);
  if (!isPasswordCorrect) {
    throw new CustomError.UnauthenticatedError('Incorrect Password');
  }
  user.password = newPassword;
  await user.save();
  res.status(StatusCodes.OK).json({ msg: 'Success! Password Updated' });
};

module.exports = {
  getAllUsers,
  getSingleUser,
  showCurrentUser,
  updateUser,
  updateUserPassword,
};

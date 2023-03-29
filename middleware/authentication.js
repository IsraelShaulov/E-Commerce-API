const CustomError = require('../errors');
const { isTokenValid } = require('../utils');

const authenticateUser = async (req, res, next) => {
  const token = req.signedCookies.token;
  // if there is no token like if user logged out or user haven't registered
  // or the user have'nt logged in
  if (!token) {
    throw new CustomError.UnauthenticatedError('Authentication Failed');
  }
  // if the token is present
  try {
    const payload = isTokenValid({ token });
    const { name, userId, role } = payload;
    req.user = { name: name, userId: userId, role: role };
    next();
  } catch (error) {
    throw new CustomError.UnauthenticatedError('Authentication Failed');
  }
};

const authorizePermissions = (...roles) => {
  // console.log(roles);
  // return function as callback
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new CustomError.UnauthorizedError(
        'Unauthorized to access this route'
      );
    }
    next();
  };
};

module.exports = { authenticateUser, authorizePermissions };

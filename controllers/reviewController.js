const { StatusCodes } = require('http-status-codes');
const Review = require('../models/Review');
const Product = require('../models/Product');
const CustomError = require('../errors');
const { checkPermissions } = require('../utils');

const createReview = async (req, res) => {
  const { product: productId } = req.body;

  const isValidProduct = await Product.findOne({ _id: productId });
  if (!isValidProduct) {
    throw new CustomError.NotFoundError(`No Product with id ${productId}`);
  }

  const alreadySubmitted = await Review.findOne({
    product: productId,
    user: req.user.userId,
  });

  if (alreadySubmitted) {
    throw new CustomError.BadRequestError(
      'Already submitted review for this product '
    );
  }

  req.body.user = req.user.userId;
  const review = await Review.create(req.body);
  res.status(StatusCodes.CREATED).json({ review });
};

const getAllReviews = async (req, res) => {
  const reviews = await Review.find({})
    .populate({
      path: 'product',
      select: 'name company price',
    })
    .populate({
      path: 'user',
      select: 'name',
    });
  res.status(StatusCodes.OK).json({ reviews });
};

const getSingleReview = async (req, res) => {
  const { id } = req.params;
  const review = await Review.findOne({ _id: id });
  if (!review) {
    throw new CustomError.NotFoundError(`No review with id ${id}`);
  }
  res.status(StatusCodes.OK).json({ review });
};

// update rating, title, comment with review.save() hook
const updateReview = async (req, res) => {
  const { id } = req.params;
  const { rating, title, comment } = req.body;
  const review = await Review.findOne({ _id: id });
  if (!review) {
    throw new CustomError.NotFoundError(`No review with id ${id}`);
  }
  // check permissions(review.user) the .user is the userId
  checkPermissions(req.user, review.user);

  review.rating = rating;
  review.title = title;
  review.comment = comment;
  await review.save();
  res.status(StatusCodes.OK).json({ review });
};

const deleteReview = async (req, res) => {
  const { id } = req.params;
  const review = await Review.findOne({ _id: id });
  if (!review) {
    throw new CustomError.NotFoundError(`No review with id ${id}`);
  }
  // check permissions(review.user) the .user is the userId
  checkPermissions(req.user, review.user);
  await review.deleteOne();
  res.status(StatusCodes.OK).json({ msg: 'Success! Review removed' });
};

const getSingleProductReviews = async (req, res) => {
  const { id } = req.params;
  const reviews = await Review.find({ product: id });
  res.status(StatusCodes.OK).json({ reviews, count: reviews.length });
};

module.exports = {
  createReview,
  getAllReviews,
  getSingleReview,
  getSingleReview,
  updateReview,
  deleteReview,
  getSingleProductReviews,
};

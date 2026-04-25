const { body, param, query } = require('express-validator');

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const loginValidation = [
  body('email').isEmail().withMessage('Valid email required'),
  body('password').trim().notEmpty().withMessage('Password is required')
];

const registerValidation = [
  body('fullName').trim().isLength({ min: 2, max: 80 }).withMessage('Full name is required'),
  body('email').isEmail().withMessage('Valid email required'),
  body('password').trim().notEmpty().withMessage('Password is required'),
  body('confirmPassword')
    .custom((value, { req }) => value === req.body.password)
    .withMessage('Confirm password must match password')
];

const otpValidation = [
  body('email').isEmail().withMessage('Valid email required'),
  body('otp').trim().isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits')
];

const inquiryValidation = [
  body('name').trim().isLength({ min: 2, max: 80 }),
  body('email').isEmail(),
  body('phone').optional().trim().isLength({ max: 30 }),
  body('message').trim().isLength({ min: 10, max: 2000 }),
  body('kittenInterestedIn').optional().trim().isLength({ max: 120 })
];

const reservationValidation = [
  body('customerName').trim().isLength({ min: 2, max: 80 }),
  body('email').isEmail(),
  body('phone').optional().trim().isLength({ max: 30 }),
  body('kitten').matches(objectIdRegex).withMessage('Invalid kitten id')
];

const kittenValidation = [
  body('name').trim().isLength({ min: 2, max: 120 }),
  body('age').trim().isLength({ min: 1, max: 50 }),
  body('breed').trim().isLength({ min: 2, max: 120 }),
  body('gender').isIn(['Male', 'Female']),
  body('price').isFloat({ min: 0 }),
  body('status').isIn(['Available', 'Reserved', 'Sold']),
  body('temperament').optional().trim().isLength({ max: 500 }),
  body('description').optional().trim().isLength({ max: 5000 }),
  body('visible').optional().isBoolean(),
  body('featured').optional().isBoolean()
];

const idParamValidation = [param('id').matches(objectIdRegex).withMessage('Invalid id')];

const kittenFilterValidation = [
  query('gender').optional().isIn(['Male', 'Female']),
  query('status').optional().isIn(['Available', 'Reserved', 'Sold']),
  query('maxPrice').optional().isFloat({ min: 0 }),
  query('age').optional().trim().isLength({ max: 50 })
];

module.exports = {
  loginValidation,
  registerValidation,
  otpValidation,
  inquiryValidation,
  reservationValidation,
  kittenValidation,
  idParamValidation,
  kittenFilterValidation
};

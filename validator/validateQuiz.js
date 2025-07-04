const { body, validationResult } = require('express-validator');
const { logger } = require('../utils/logger');

const validateQuizSubmission = [
  body('title')
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters')
    .trim()
    .escape(),
  
  body('description')
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters')
    .trim(),
  
  body('category')
    .notEmpty()
    .withMessage('Category is required')
    .isIn(['Education', 'Technology', 'Health', 'Science', 'Tips & Tricks', 'Research', 'General'])
    .withMessage('Invalid category'),
  
  body('difficulty')
    .optional()
    .isIn(['Easy', 'Medium', 'Hard'])
    .withMessage('Difficulty must be Easy, Medium, or Hard'),
  
  body('timeLimit')
    .optional()
    .isInt({ min: 1, max: 180 })
    .withMessage('Time limit must be between 1 and 180 minutes'),
  
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['Draft', 'Published'])
    .withMessage('Status must be either Draft or Published'),
  
  body('author')
    .notEmpty()
    .withMessage('Author is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Author name must be between 2 and 100 characters')
    .trim()
    .escape(),
  
  body('questions')
    .isArray({ min: 1 })
    .withMessage('At least one question is required'),
  
  body('questions.*.question')
    .notEmpty()
    .withMessage('Question text is required')
    .isLength({ min: 5, max: 500 })
    .withMessage('Question must be between 5 and 500 characters')
    .trim()
    .escape(),
  
  body('questions.*.options')
    .isArray({ min: 2, max: 6 })
    .withMessage('Question must have between 2 and 6 options'),
  
  body('questions.*.options.*')
    .notEmpty()
    .withMessage('Option cannot be empty')
    .isLength({ min: 1, max: 200 })
    .withMessage('Option must be between 1 and 200 characters')
    .trim()
    .escape(),
  
  body('questions.*.correctAnswers')
    .isArray({ min: 1 })
    .withMessage('At least one correct answer is required'),
  
  body('questions.*.correctAnswers.*')
    .notEmpty()
    .withMessage('Correct answer cannot be empty')
    .trim()
    .escape(),
  
  body('questions.*.points')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('Points must be between 1 and 10'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.warn('Quiz submission validation failed:', {
        errors: errors.array(),
        body: req.body,
        ip: req.ip
      });
      
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array().map(error => ({
          field: error.param,
          message: error.msg,
          value: error.value
        }))
      });
    }
    
    // Additional validation for questions
    if (req.body.questions && req.body.questions.length > 0) {
      for (let i = 0; i < req.body.questions.length; i++) {
        const question = req.body.questions[i];
        
        // Validate that correct answers exist in options
        if (question.correctAnswers && question.options) {
          const invalidAnswers = question.correctAnswers.filter(answer => 
            !question.options.includes(answer)
          );
          
          if (invalidAnswers.length > 0) {
            return res.status(400).json({
              success: false,
              message: `Correct answers must be from the provided options for question ${i + 1}`
            });
          }
        }
        
        // Validate unique options
        if (question.options) {
          const uniqueOptions = [...new Set(question.options)];
          if (uniqueOptions.length !== question.options.length) {
            return res.status(400).json({
              success: false,
              message: `Options must be unique for question ${i + 1}`
            });
          }
        }
      }
    }
    
    next();
  }
];

const validateQuizUpdate = [
  body('title')
    .optional()
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters')
    .trim()
    .escape(),
  
  body('description')
    .optional()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters')
    .trim(),
  
  body('category')
    .optional()
    .isIn(['Education', 'Technology', 'Health', 'Science', 'Tips & Tricks', 'Research', 'General'])
    .withMessage('Invalid category'),
  
  body('difficulty')
    .optional()
    .isIn(['Easy', 'Medium', 'Hard'])
    .withMessage('Difficulty must be Easy, Medium, or Hard'),
  
  body('timeLimit')
    .optional()
    .isInt({ min: 1, max: 180 })
    .withMessage('Time limit must be between 1 and 180 minutes'),
  
  body('status')
    .optional()
    .isIn(['Draft', 'Published'])
    .withMessage('Status must be either Draft or Published'),
  
  body('author')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Author name must be between 2 and 100 characters')
    .trim()
    .escape(),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.warn('Quiz update validation failed:', {
        errors: errors.array(),
        body: req.body,
        ip: req.ip
      });
      
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array().map(error => ({
          field: error.param,
          message: error.msg,
          value: error.value
        }))
      });
    }
    
    next();
  }
];

module.exports = {
  validateQuizSubmission,
  validateQuizUpdate
};

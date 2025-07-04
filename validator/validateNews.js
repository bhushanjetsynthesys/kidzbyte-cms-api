const { body, validationResult } = require('express-validator');
const { logger } = require('../utils/logger');

const validateNewsSubmission = [
  body('title')
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters')
    .trim()
    .escape(),
  
  body('subTitle')
    .notEmpty()
    .withMessage('Subtitle is required')
    .isLength({ min: 3, max: 300 })
    .withMessage('Subtitle must be between 3 and 300 characters')
    .trim()
    .escape(),
  
  body('description')
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ min: 5, max: 5000 })
    .withMessage('Description must be between 5 and 5000 characters')
    .trim(),
  
  body('category')
    .notEmpty()
    .withMessage('Category is required')
    .isIn(['Education', 'Technology', 'Health', 'Science', 'Tips & Tricks', 'Research', 'Announcement', 'General News'])
    .withMessage('Invalid category'),
  
  body('type')
    .notEmpty()
    .withMessage('Type is required')
    .isIn(['Video', 'Image', 'Text'])
    .withMessage('Invalid type'),
  
  body('hasQuiz')
    .optional()
    .isBoolean()
    .withMessage('hasQuiz must be a boolean'),
  
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
  
  body('quizQuestions')
    .optional()
    .isArray()
    .withMessage('Quiz questions must be an array'),
  
  body('quizQuestions.*.question')
    .if(body('quizQuestions').exists())
    .notEmpty()
    .withMessage('Quiz question text is required')
    .isLength({ min: 5, max: 500 })
    .withMessage('Quiz question must be between 5 and 500 characters')
    .trim()
    .escape(),
  
  body('quizQuestions.*.options')
    .if(body('quizQuestions').exists())
    .isArray({ min: 2, max: 6 })
    .withMessage('Quiz question must have between 2 and 6 options'),
  
  body('quizQuestions.*.options.*')
    .if(body('quizQuestions').exists())
    .notEmpty()
    .withMessage('Quiz option cannot be empty')
    .isLength({ min: 1, max: 200 })
    .withMessage('Quiz option must be between 1 and 200 characters')
    .trim()
    .escape(),
  
  body('quizQuestions.*.correctAnswers')
    .if(body('quizQuestions').exists())
    .isArray({ min: 1 })
    .withMessage('At least one correct answer is required'),
  
  body('quizQuestions.*.correctAnswers.*')
    .if(body('quizQuestions').exists())
    .notEmpty()
    .withMessage('Correct answer cannot be empty')
    .trim()
    .escape(),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.warn('News submission validation failed:', {
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
    
    // Additional validation for quiz questions
    if (req.body.hasQuiz && (!req.body.quizQuestions || req.body.quizQuestions.length === 0)) {
      return res.status(400).json({
        success: false,
        message: 'Quiz questions are required when hasQuiz is true'
      });
    }
    
    // Validate that correct answers exist in options
    if (req.body.quizQuestions && req.body.quizQuestions.length > 0) {
      for (let i = 0; i < req.body.quizQuestions.length; i++) {
        const question = req.body.quizQuestions[i];
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
      }
    }
    
    next();
  }
];

module.exports = {
  validateNewsSubmission
};

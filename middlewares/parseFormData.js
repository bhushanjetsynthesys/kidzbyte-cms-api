const { logger } = require('../utils/logger');

/**
 * Middleware to parse JSON strings from form data
 * This is needed when using multipart/form-data with file uploads
 */
const parseFormDataJson = (req, res, next) => {
    try {
        // Parse quizQuestions if it's a JSON string
        if (req.body.quizQuestions && typeof req.body.quizQuestions === 'string') {
            try {
                req.body.quizQuestions = JSON.parse(req.body.quizQuestions);
            } catch (parseError) {
                logger.warn('Failed to parse quizQuestions JSON in middleware:', {
                    error: parseError.message,
                    quizQuestions: req.body.quizQuestions
                });
                return res.status(400).json({
                    success: false,
                    error: 'Invalid JSON format for quizQuestions',
                    type: 'VALIDATION_ERROR'
                });
            }
        }

        // Convert string booleans to actual booleans
        if (req.body.hasQuiz !== undefined) {
            if (typeof req.body.hasQuiz === 'string') {
                req.body.hasQuiz = req.body.hasQuiz === 'true';
            }
        }

        next();
    } catch (error) {
        logger.error('Error in parseFormDataJson middleware:', {
            error: error.message,
            stack: error.stack
        });
        return res.status(500).json({
            success: false,
            error: 'Internal server error',
            type: 'INTERNAL_ERROR'
        });
    }
};

module.exports = {
    parseFormDataJson
};

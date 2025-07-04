const quizORM = require('../orm/quizDetails');
const { logger } = require('../utils/logger');

/**
 * Submit a quiz
 */
const submitQuiz = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      difficulty,
      timeLimit,
      questions,
      status,
      author
    } = req.body;

    // Create quiz data
    const quizData = {
      title,
      description,
      category,
      difficulty: difficulty || 'Easy',
      timeLimit: timeLimit || 30,
      questions: questions || [],
      status,
      author
    };

    // Create quiz
    const quiz = await quizORM.createQuiz(quizData);

    logger.info('Quiz submitted successfully:', {
      quizId: quiz._id,
      title: quiz.title,
      author: quiz.author,
      category: quiz.category,
      difficulty: quiz.difficulty,
      totalQuestions: quiz.totalQuestions,
      totalPoints: quiz.totalPoints,
      status: quiz.status
    });

    res.status(201).json({
      success: true,
      message: 'Quiz submitted successfully',
      data: {
        quizId: quiz._id,
        title: quiz.title,
        status: quiz.status,
        totalQuestions: quiz.totalQuestions,
        totalPoints: quiz.totalPoints,
        difficulty: quiz.difficulty,
        timeLimit: quiz.timeLimit,
        createdAt: quiz.createdAt
      }
    });

  } catch (error) {
    logger.error('Error submitting quiz:', {
      error: error.message,
      stack: error.stack,
      body: req.body
    });

    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
};

/**
 * Get all quizzes with filtering and pagination
 */
const getQuizzes = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      status,
      author,
      difficulty
    } = req.query;

    // Build filter object
    const filter = { isActive: true };
    
    if (category) filter.category = category;
    if (status) filter.status = status;
    if (author) filter.author = new RegExp(author, 'i');
    if (difficulty) filter.difficulty = difficulty;

    // Get quizzes with pagination using ORM
    const result = await quizORM.getQuiz(
      parseInt(limit),
      parseInt(page),
      { createdAt: -1 },
      filter,
      '-__v',
      true
    );

    res.status(200).json({
      success: true,
      data: {
        quizzes: result.docs,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(result.totalCount / parseInt(limit)),
          totalCount: result.totalCount,
          hasNextPage: (parseInt(page) * parseInt(limit)) < result.totalCount,
          hasPreviousPage: parseInt(page) > 1
        }
      }
    });

  } catch (error) {
    logger.error('Error fetching quizzes:', {
      error: error.message,
      stack: error.stack,
      query: req.query
    });

    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
};

/**
 * Get single quiz by ID
 */
const getQuizById = async (req, res) => {
  try {
    const { id } = req.params;

    const quiz = await quizORM.getOneQuiz({ _id: id, isActive: true });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        quiz
      }
    });

  } catch (error) {
    logger.error('Error fetching quiz:', {
      error: error.message,
      stack: error.stack,
      quizId: req.params.id
    });

    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
};

/**
 * Update quiz
 */
const updateQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedQuiz = await quizORM.updateQuiz({ _id: id, isActive: true }, updateData);

    if (!updatedQuiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    logger.info('Quiz updated successfully:', {
      quizId: updatedQuiz._id,
      title: updatedQuiz.title,
      author: updatedQuiz.author
    });

    res.status(200).json({
      success: true,
      message: 'Quiz updated successfully',
      data: {
        quiz: updatedQuiz
      }
    });

  } catch (error) {
    logger.error('Error updating quiz:', {
      error: error.message,
      stack: error.stack,
      quizId: req.params.id,
      body: req.body
    });

    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
};

/**
 * Delete quiz (soft delete)
 */
const deleteQuiz = async (req, res) => {
  try {
    const { id } = req.params;

    const quiz = await quizORM.deleteById(id);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    logger.info('Quiz deleted successfully:', {
      quizId: quiz._id,
      title: quiz.title,
      author: quiz.author
    });

    res.status(200).json({
      success: true,
      message: 'Quiz deleted successfully'
    });

  } catch (error) {
    logger.error('Error deleting quiz:', {
      error: error.message,
      stack: error.stack,
      quizId: req.params.id
    });

    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
};

module.exports = {
  submitQuiz,
  getQuizzes,
  getQuizById,
  updateQuiz,
  deleteQuiz
};

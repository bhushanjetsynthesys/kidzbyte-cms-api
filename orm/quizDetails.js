const QuizDetails = require('../models/quizDetails');
const { utilityConstants } = require('../constants/constants');

// Create a new quiz
const createQuiz = async (quizData) => {
  try {
    const quiz = new QuizDetails(quizData);
    return await quiz.save();
  } catch (error) {
    throw error;
  }
};

// Find quizzes with filtering, sorting, and pagination
const findQuizzes = async (filter = {}, options = {}) => {
  try {
    const {
      select = '',
      sort = { createdAt: -1 },
      page = 1,
      limit = 10,
      populate = ''
    } = options;

    const skip = (page - 1) * limit;
    
    let query = QuizDetails.find(filter);
    
    if (select) {
      query = query.select(select);
    }
    
    if (populate) {
      query = query.populate(populate);
    }
    
    const quizzes = await query
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .exec();
    
    const total = await QuizDetails.countDocuments(filter);
    
    return {
      data: quizzes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    };
  } catch (error) {
    throw error;
  }
};

// Find a single quiz by ID
const findQuizById = async (quizId, options = {}) => {
  try {
    const { select = '', populate = '' } = options;
    
    let query = QuizDetails.findById(quizId);
    
    if (select) {
      query = query.select(select);
    }
    
    if (populate) {
      query = query.populate(populate);
    }
    
    return await query.exec();
  } catch (error) {
    throw error;
  }
};

// Update a quiz by ID
const updateQuiz = async (quizId, updateData, options = {}) => {
  try {
    const { select = '', populate = '' } = options;
    
    let query = QuizDetails.findByIdAndUpdate(
      quizId,
      { $set: updateData },
      { new: true, runValidators: true }
    );
    
    if (select) {
      query = query.select(select);
    }
    
    if (populate) {
      query = query.populate(populate);
    }
    
    return await query.exec();
  } catch (error) {
    throw error;
  }
};

// Delete a quiz by ID
const deleteQuiz = async (quizId) => {
  try {
    return await QuizDetails.findByIdAndDelete(quizId);
  } catch (error) {
    throw error;
  }
};

// Upsert quiz (create if not exists, update if exists)
const upsertQuiz = async (filter, updateData, options = {}) => {
  try {
    const { select = '', populate = '' } = options;
    
    let query = QuizDetails.findOneAndUpdate(
      filter,
      { $set: updateData },
      { new: true, upsert: true, runValidators: true }
    );
    
    if (select) {
      query = query.select(select);
    }
    
    if (populate) {
      query = query.populate(populate);
    }
    
    return await query.exec();
  } catch (error) {
    throw error;
  }
};

// Count quizzes with filter
const countQuizzes = async (filter = {}) => {
  try {
    return await QuizDetails.countDocuments(filter);
  } catch (error) {
    throw error;
  }
};

// Find all quizzes (simple find without pagination)
const findAllQuizzes = async (filter = {}, options = {}) => {
  try {
    const { select = '', sort = { createdAt: -1 }, populate = '' } = options;
    
    let query = QuizDetails.find(filter);
    
    if (select) {
      query = query.select(select);
    }
    
    if (populate) {
      query = query.populate(populate);
    }
    
    return await query.sort(sort).exec();
  } catch (error) {
    throw error;
  }
};

// Increment quiz attempts
const incrementQuizAttempts = async (quizId) => {
  try {
    return await QuizDetails.findByIdAndUpdate(
      quizId,
      { $inc: { attempts: 1 } },
      { new: true }
    );
  } catch (error) {
    throw error;
  }
};

module.exports = {
  createQuiz,
  findQuizzes,
  findQuizById,
  updateQuiz,
  deleteQuiz,
  upsertQuiz,
  countQuizzes,
  findAllQuizzes,
  incrementQuizAttempts
};

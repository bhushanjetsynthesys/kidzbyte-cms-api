const mongoose = require('mongoose');

const quizDetailsSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: String,
      required: true,
      enum: ['Education', 'Technology', 'Health', 'Science', 'Tips & Tricks', 'Research', 'General']
    },
    difficulty: {
      type: String,
      required: true,
      enum: ['Easy', 'Medium', 'Hard'],
      default: 'Easy'
    },
    timeLimit: {
      type: Number, // in minutes
      default: 30
    },
    questions: [{
      question: {
        type: String,
        required: true,
        trim: true
      },
      options: [{
        type: String,
        required: true,
        trim: true
      }],
      correctAnswers: [{
        type: String,
        required: true,
        trim: true
      }],
      points: {
        type: Number,
        default: 1
      }
    }],
    totalQuestions: {
      type: Number,
      default: 0
    },
    totalPoints: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      required: true,
      enum: ['Draft', 'Published'],
      default: 'Draft'
    },
    author: {
      type: String,
      required: true,
      trim: true
    },
    publishedAt: {
      type: Date,
      default: null
    },
    attemptCount: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true,
    collection: 'quizDetails'
  }
);

// Index for better performance
quizDetailsSchema.index({ category: 1, status: 1 });
quizDetailsSchema.index({ author: 1 });
quizDetailsSchema.index({ publishedAt: -1 });
quizDetailsSchema.index({ difficulty: 1 });

// Pre-save middleware to calculate totals and set publishedAt
quizDetailsSchema.pre('save', function(next) {
  // Calculate total questions and points
  this.totalQuestions = this.questions.length;
  this.totalPoints = this.questions.reduce((sum, q) => sum + (q.points || 1), 0);
  
  // Set publishedAt when status changes to Published
  if (this.isModified('status') && this.status === 'Published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  
  next();
});

module.exports = mongoose.model('QuizDetails', quizDetailsSchema);

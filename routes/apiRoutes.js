const express = require('express');
const router = express.Router();

const validateAuth = require('../validator/validateAuth');
const { validateNewsSubmission } = require('../validator/validateNews');
const { validateQuizSubmission } = require('../validator/validateQuiz');

const authService = require('../service/auth');
const newsService = require('../service/news');
const quizService = require('../service/quiz');

const authMiddleware = require('../middlewares/auth');
const { parseFormDataJson } = require('../middlewares/parseFormData');
const {
  loginLimiter,
  otpVerifyLimiter,
  resendOtpLimiter
} = require('../middlewares/security');
const { asyncErrorHandler } = require('../middlewares/errorHandler');

router.post('/login',
  loginLimiter,
  validateAuth.validateLoginRequest,
  asyncErrorHandler(authService.initiateLogin)
);

router.post('/resend-otp',
  resendOtpLimiter,
  validateAuth.validateResendOTP,
  asyncErrorHandler(authService.resendOTP)
);

router.post('/verify-otp',
  otpVerifyLimiter,
  validateAuth.validateOTPVerification,
  asyncErrorHandler(authService.verifyOTPAndLogin)
);

router.get('/profile',
  authMiddleware.authenticateToken,
  asyncErrorHandler(authService.getProfile)
);

router.post('/logout',
  authMiddleware.authenticateToken,
  asyncErrorHandler(authService.logout)
);

router.post('/create-profile',
  authMiddleware.authenticateToken,
  validateAuth.validateStudentProfile,
  asyncErrorHandler(authService.createStudentProfile)
);

router.get('/schools',
  asyncErrorHandler(authService.getSchoolList)
);

router.post('/create-news',
  newsService.upload.single('file'),
  parseFormDataJson,
  validateNewsSubmission,
  asyncErrorHandler(newsService.submitNews)
);

router.get('/news',
  asyncErrorHandler(newsService.getNews)
);

router.get('/news/:id',
  asyncErrorHandler(newsService.getNewsById)
);

router.put('/news/:id',
  newsService.upload.single('file'),
  parseFormDataJson,
  asyncErrorHandler(newsService.updateNews)
);

router.delete('/news/:id',
  asyncErrorHandler(newsService.deleteNews)
);

router.post('/create-quiz',
  authMiddleware.authenticateToken,
  asyncErrorHandler(quizService.submitQuiz)
);

router.get('/quiz',
  asyncErrorHandler(quizService.getAllQuizzes)
);

router.get('/quiz/:id',
  asyncErrorHandler(quizService.getQuizById)
);

router.put('/quiz/:id',
  authMiddleware.authenticateToken,
  asyncErrorHandler(quizService.updateQuiz)
);

router.delete('/quiz/:id',
  authMiddleware.authenticateToken,
  asyncErrorHandler(quizService.deleteQuiz)
);

module.exports = router;
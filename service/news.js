const newsORM = require('../orm/newsDetails');
const { logger } = require('../utils/logger');
const { utilityConstants } = require('../constants/constants');
const { AppError } = require('../middlewares/errorHandler');
const { uploadFilesS3 } = require('../helper/commonHelper');
const multer = require('multer');
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image and video files are allowed'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB limit
    }
});

const submitNews = async (req, res) => {
    try {
        logger.info('Service::news@submitNews');
        const {
            title,
            subTitle,
            description,
            category,
            type,
            content_url,
            hasQuiz,
            status,
            author,
            quizQuestions
        } = req.body;
        let uploadedFilePath = null;
        let uploadResult = null;
        if (req.file) {
            try {
                uploadResult = await uploadFilesS3(req.file, 'news');
                uploadedFilePath = uploadResult.s3Url;

            } catch (uploadError) {
                logger.error('Error uploading file to S3:', {
                    error: uploadError.message,
                    stack: uploadError.stack,
                    fileName: req.file.originalname
                });
                return res.status(utilityConstants.serviceResponseCodes.error).json({
                    success: false,
                    error: 'File upload failed',
                    type: 'FILE_UPLOAD_ERROR'
                });
            }
        }
        // Create news article data
        const newsData = {
            title,
            subTitle,
            description,
            category,
            type,
            content_url: content_url || null,
            upload_file: uploadedFilePath,
            hasQuiz: hasQuiz || false,
            status,
            author,
            quizQuestions: quizQuestions || []
        };

        // Create news article
        const newsArticle = await newsORM.createNews(newsData);

        const responseData = {
            articleId: newsArticle._id,
            title: newsArticle.title,
            status: newsArticle.status,
            hasQuiz: newsArticle.hasQuiz,
            quizCount: newsArticle.quizQuestions.length,
            createdAt: newsArticle.createdAt
        };

        return res.status(utilityConstants.serviceResponseCodes.success).json({
            success: true,
            message: utilityConstants.commonResponse.newsCreated,
            data: responseData
        });

    } catch (error) {
        logger.error('Error submitting news article:', {
            error: error.message,
            stack: error.stack,
            body: req.body
        });
        // Handle known application errors
        if (error instanceof AppError) {
            return res.status(error.status).json({
                success: false,
                error: error.message,
                type: error.type
            });
        }
        // Handle unexpected errors
        return res.status(utilityConstants.serviceResponseCodes.serverError).json({
            success: false,
            error: utilityConstants.commonResponse.serverError,
            type: 'INTERNAL_ERROR'
        });
    }
};

const getNews = async (req, res) => {
    try {
        logger.info('Service::news@getNews');
        const {
            page = 1,
            limit = 10,
            category,
            status,
            author,
            hasQuiz,
            type
        } = req.query;

        // Build filter object
        const filter = { isActive: true };

        if (category) filter.category = category;
        if (status) filter.status = status;
        if (author) filter.author = new RegExp(author, 'i');
        if (hasQuiz !== undefined) filter.hasQuiz = hasQuiz === 'true';
        if (type) filter.type = type;

        // Get articles with pagination using ORM
        const result = await newsORM.getNews(
            parseInt(limit),
            parseInt(page),
            { createdAt: -1 },
            filter,
            '-__v',
            true
        );

        const responseData = {
            articles: result.docs,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(result.totalCount / parseInt(limit)),
                totalCount: result.totalCount,
                hasNextPage: (parseInt(page) * parseInt(limit)) < result.totalCount,
                hasPreviousPage: parseInt(page) > 1
            }
        };

        return res.status(utilityConstants.serviceResponseCodes.success).json({
            success: true,
            message: utilityConstants.commonResponse.newsRetrieved,
            data: responseData
        });

    } catch (error) {
        logger.error('Error fetching news articles:', {
            error: error.message,
            stack: error.stack,
            query: req.query
        });

        // Handle known application errors
        if (error instanceof AppError) {
            return res.status(error.status).json({
                success: false,
                error: error.message,
                type: error.type
            });
        }

        // Handle unexpected errors
        return res.status(utilityConstants.serviceResponseCodes.serverError).json({
            success: false,
            error: utilityConstants.commonResponse.serverError,
            type: 'INTERNAL_ERROR'
        });
    }
};

const getNewsById = async (req, res) => {
    try {
        logger.info('Service::news@getNewsById');

        const { id } = req.params;

        const article = await newsORM.getOneNews({ _id: id, isActive: true });

        if (!article) {
            return res.status(utilityConstants.serviceResponseCodes.dataNotFound).json({
                success: false,
                error: utilityConstants.commonResponse.newsNotFound,
                type: 'ARTICLE_NOT_FOUND'
            });
        }

        // Increment view count using ORM
        await newsORM.incrementViewCount({ _id: id });

        const responseData = {
            article: {
                ...article,
                viewCount: article.viewCount + 1
            }
        };

        return res.status(utilityConstants.serviceResponseCodes.success).json({
            success: true,
            message: utilityConstants.commonResponse.newsRetrieved,
            data: responseData
        });

    } catch (error) {
        logger.error('Error fetching news article:', {
            error: error.message,
            stack: error.stack,
            articleId: req.params.id
        });

        // Handle known application errors
        if (error instanceof AppError) {
            return res.status(error.status).json({
                success: false,
                error: error.message,
                type: error.type
            });
        }

        // Handle unexpected errors
        return res.status(utilityConstants.serviceResponseCodes.serverError).json({
            success: false,
            error: utilityConstants.commonResponse.serverError,
            type: 'INTERNAL_ERROR'
        });
    }
};

const updateNews = async (req, res) => {
    try {
        logger.info('Service::news@updateNews');
        const { id } = req.params;
        const updateData = req.body;

        // Handle file upload to S3 if present
        if (req.file) {
            try {
                const uploadResult = await uploadFilesS3(req.file, 'news');
                updateData.upload_file = uploadResult.cdnUrl || uploadResult.s3Url;

                logger.info('File uploaded to S3 successfully for update:', {
                    s3Key: uploadResult.s3Key,
                    cdnUrl: uploadResult.cdnUrl,
                    fileName: uploadResult.fileName
                });
            } catch (uploadError) {
                logger.error('Error uploading file to S3 for update:', {
                    error: uploadError.message,
                    stack: uploadError.stack,
                    fileName: req.file.originalname
                });

                return res.status(utilityConstants.serviceResponseCodes.error).json({
                    success: false,
                    error: 'File upload failed',
                    type: 'FILE_UPLOAD_ERROR'
                });
            }
        }

        const updatedArticle = await newsORM.updateNews({ _id: id, isActive: true }, updateData);

        if (!updatedArticle) {
            return res.status(utilityConstants.serviceResponseCodes.dataNotFound).json({
                success: false,
                error: utilityConstants.commonResponse.newsNotFound,
                type: 'ARTICLE_NOT_FOUND'
            });
        }
        const responseData = {
            article: updatedArticle
        };
        return res.status(utilityConstants.serviceResponseCodes.success).json({
            success: true,
            message: utilityConstants.commonResponse.newsUpdated,
            data: responseData
        });

    } catch (error) {
        logger.error('Error updating news article:', {
            error: error.message,
            stack: error.stack,
            articleId: req.params.id,
            body: req.body
        });

        // Handle known application errors
        if (error instanceof AppError) {
            return res.status(error.status).json({
                success: false,
                error: error.message,
                type: error.type
            });
        }

        // Handle unexpected errors
        return res.status(utilityConstants.serviceResponseCodes.serverError).json({
            success: false,
            error: utilityConstants.commonResponse.serverError,
            type: 'INTERNAL_ERROR'
        });
    }
};

const deleteNews = async (req, res) => {
    try {
        logger.info('Service::news@deleteNews');

        const { id } = req.params;

        const isDeleted = await newsORM.deleteOneNews({ _id: id, isActive: true });

        if (!isDeleted) {
            return res.status(utilityConstants.serviceResponseCodes.dataNotFound).json({
                success: false,
                error: utilityConstants.commonResponse.newsNotFound,
                type: 'ARTICLE_NOT_FOUND'
            });
        }

        return res.status(utilityConstants.serviceResponseCodes.success).json({
            success: true,
            message: utilityConstants.commonResponse.newsDeleted
        });

    } catch (error) {
        logger.error('Error deleting news article:', {
            error: error.message,
            stack: error.stack,
            articleId: req.params.id
        });

        // Handle known application errors
        if (error instanceof AppError) {
            return res.status(error.status).json({
                success: false,
                error: error.message,
                type: error.type
            });
        }

        // Handle unexpected errors
        return res.status(utilityConstants.serviceResponseCodes.serverError).json({
            success: false,
            error: utilityConstants.commonResponse.serverError,
            type: 'INTERNAL_ERROR'
        });
    }
};

module.exports = {
    submitNews,
    getNews,
    getNewsById,
    updateNews,
    deleteNews,
    upload
};

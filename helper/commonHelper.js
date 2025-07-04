const { logger } = require('../utils/logger');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { Upload } = require('@aws-sdk/lib-storage');
const fs = require('fs');
const path = require('path');

// Load environment configuration
require('../utils/envConfig').config();

// Configure S3 client
const s3Client = new S3Client({
  region: process.env.AWS_DEFAULT_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

/**
 * Upload files to S3
 * @param {Object} file - File object from multer
 * @param {string} folderName - Dynamic folder name for S3 (e.g., 'news', 'quiz', 'profiles')
 * @param {string} bucketName - S3 bucket name (optional, defaults to env variable)
 * @returns {Promise<Object>} - Upload result with S3 URL
 */
exports.uploadFilesS3 = async (file, folderName, bucketName = null) => {
  logger.info('commonHelper@uploadFilesS3 - Starting S3 upload', {
    folderName,
    fileName: file?.originalname,
    fileSize: file?.size,
    mimeType: file?.mimetype
  });

  try {
    if (!file) {
      throw new Error('No file provided for upload');
    }

    if (!folderName) {
      throw new Error('Folder name is required');
    }

    const bucket = bucketName || process.env.AWS_BUCKET;
    if (!bucket) {
      throw new Error('S3 bucket name not configured');
    }

    // Sanitize file name to avoid special characters
    const sanitizedFileName = file.originalname.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const fileExtension = path.extname(sanitizedFileName);
    const timestamp = Date.now();
    const randomSuffix = Math.round(Math.random() * 1E9);
    const uniqueFileName = `${folderName}-${timestamp}-${randomSuffix}${fileExtension}`;
    const s3Key = `${folderName}/${uniqueFileName}`;

    // Prepare file buffer
    let fileBuffer;
    if (file.buffer) {
      fileBuffer = file.buffer;
    } else if (file.path) {
      try {
        fileBuffer = fs.readFileSync(file.path);
      } catch (fsError) {
        throw new Error(`Failed to read file from path: ${file.path}`);
      }
    } else {
      throw new Error('Invalid file format - no buffer or path found');
    }

    const uploadParams = {
      Bucket: bucket,
      Key: s3Key,
      Body: fileBuffer,
      ContentType: file.mimetype,
      CacheControl: 'max-age=31536000',
      ServerSideEncryption: 'AES256',
      ACL: 'public-read',
    };

    let result;
    
    // For files under 100MB, use simple PutObject to avoid multipart issues
    // Most video files under 100MB should work fine with simple upload
    if (file.size < 100 * 1024 * 1024) {
      logger.info('commonHelper@uploadFilesS3 - Using simple upload for file', {
        fileSize: file.size,
        fileName: file.originalname
      });
      
      const command = new PutObjectCommand(uploadParams);
      result = await s3Client.send(command);
      
      // Construct result object to match Upload response
      result = {
        Location: `https://${bucket}.s3.${process.env.AWS_DEFAULT_REGION}.amazonaws.com/${s3Key}`,
        ETag: result.ETag,
        Key: s3Key,
        Bucket: bucket
      };
    } else {
      // Use multipart upload only for very large files (>100MB)
      logger.info('commonHelper@uploadFilesS3 - Using multipart upload for large file', {
        fileSize: file.size,
        fileName: file.originalname
      });
      
      try {
        const upload = new Upload({
          client: s3Client,
          params: uploadParams,
          queueSize: 2, // Reduced concurrency to avoid issues
          partSize: 10 * 1024 * 1024, // 10MB parts (larger parts, fewer requests)
          leavePartsOnError: false,
        });

        // Add progress tracking
        upload.on("httpUploadProgress", (progress) => {
          const percent = progress.total ? Math.round((progress.loaded / progress.total) * 100) : 0;
          logger.info('commonHelper@uploadFilesS3 - Upload progress', {
            loaded: progress.loaded,
            total: progress.total,
            percent: `${percent}%`
          });
        });

        result = await upload.done();
      } catch (multipartError) {
        logger.error('commonHelper@uploadFilesS3 - Multipart upload failed, retrying with simple upload', {
          error: multipartError.message,
          fileName: file.originalname,
          fileSize: file.size
        });
        
        // Fallback to simple upload even for large files
        const command = new PutObjectCommand(uploadParams);
        result = await s3Client.send(command);
        
        result = {
          Location: `https://${bucket}.s3.${process.env.AWS_DEFAULT_REGION}.amazonaws.com/${s3Key}`,
          ETag: result.ETag,
          Key: s3Key,
          Bucket: bucket
        };
      }
    }

    // Construct URLs
    const s3Url = `${process.env.AWS_URL}${s3Key}`;
    const cdnUrl = process.env.AWS_CDN_URL ? `${process.env.AWS_CDN_URL}${s3Key}` : s3Url;

    logger.info('commonHelper@uploadFilesS3 - Upload successful', {
      s3Key,
      s3Url,
      cdnUrl,
      location: result.Location,
      etag: result.ETag
    });

    // Clean up local file if it exists
    if (file.path && fs.existsSync(file.path)) {
      try {
        fs.unlinkSync(file.path);
        logger.info('commonHelper@uploadFilesS3 - Cleaned up local file', { filePath: file.path });
      } catch (cleanupError) {
        logger.warn('commonHelper@uploadFilesS3 - Failed to cleanup local file', {
          filePath: file.path,
          error: cleanupError.message
        });
      }
    }

    return {
      success: true,
      s3Key,
      s3Url,
      cdnUrl,
      fileName: uniqueFileName,
      originalName: file.originalname,
      size: file.size,
      mimeType: file.mimetype,
      location: result.Location,
      etag: result.ETag
    };

  } catch (error) {
    logger.error('commonHelper@uploadFilesS3 - Upload failed', {
      error: error.message,
      stack: error.stack,
      folderName,
      fileName: file?.originalname,
      fileSize: file?.size
    });

    // Clean up local file on error
    if (file?.path && fs.existsSync(file.path)) {
      try {
        fs.unlinkSync(file.path);
        logger.info('commonHelper@uploadFilesS3 - Cleaned up local file after error', { filePath: file.path });
      } catch (cleanupError) {
        logger.warn('commonHelper@uploadFilesS3 - Failed to cleanup local file after error', {
          filePath: file.path,
          error: cleanupError.message
        });
      }
    }

    throw error;
  }
};

/**
 * Format express-validator error output
 * @param {Array} errorArr
 * @param {string|null} customFlag
 * @returns {Object}
 */
exports.expressErrorHandler = (errorArr, customFlag = null) => {
  logger.info('commonHelper@expressErrorHandler');
  if (customFlag) {
    return { ...errorArr[0], customFlag };
  }
  return errorArr;
};

const { uploadFilesS3, validateS3Config } = require('./helper/commonHelper');
const fs = require('fs');

async function testS3Upload() {
  try {
    // First validate configuration
    console.log('Validating S3 configuration...');
    const config = validateS3Config();
    console.log('Config validation:', config);

    if (!config.isValid) {
      console.error('S3 configuration is invalid:', config.missing);
      return;
    }

    // Create a simple test file in memory
    const testFileContent = Buffer.from('This is a test file for S3 upload', 'utf8');
    
    // Create a mock file object similar to what multer provides
    const mockFile = {
      originalname: 'test-file.txt',
      mimetype: 'text/plain',
      size: testFileContent.length,
      buffer: testFileContent
    };

    console.log('Testing S3 upload with mock file...');
    const result = await uploadFilesS3(mockFile, 'test');
    
    console.log('Upload successful!');
    console.log('Result:', {
      s3Key: result.s3Key,
      s3Url: result.s3Url,
      cdnUrl: result.cdnUrl,
      fileName: result.fileName,
      size: result.size
    });

  } catch (error) {
    console.error('Test failed:', error.message);
    console.error('Error type:', error.type);
    if (error.originalError) {
      console.error('Original error:', error.originalError.message);
    }
  }
}

testS3Upload();

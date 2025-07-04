const { uploadFilesS3 } = require('./helper/commonHelper');

async function testS3Upload() {
  try {
    console.log('Testing S3 upload with small file...');
    
    // Create a small test file (well under 5MB)
    const testFile = {
      originalname: 'test-small.txt',
      mimetype: 'text/plain',
      size: 50,
      buffer: Buffer.from('Hello S3 Upload Test - Small File!')
    };
    
    const result = await uploadFilesS3(testFile, 'test');
    console.log('✅ Small file upload successful!');
    console.log('S3 URL:', result.s3Url);
    console.log('CDN URL:', result.cdnUrl);
    console.log('File size:', result.size);
    
  } catch (error) {
    console.error('❌ Upload failed:', error.message);
    if (error.stack) {
      console.error('Stack:', error.stack);
    }
  }
}

testS3Upload();

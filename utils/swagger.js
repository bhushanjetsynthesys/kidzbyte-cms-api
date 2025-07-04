const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'KB CMS Backend',
      version: '2.0.0',
      description: `API documentation for KB WEB Backend with OTP-based Authentication

      ## Dummy OTP Testing (Local/Stage Only)
      
      For testing purposes in development and staging environments, you can use these test accounts:
      
      **Test Mobile Number:** 1234567899
      **Test Email:** abc@gmail.com
      **Dummy OTP:** 1234
      
      These accounts will always receive the dummy OTP (1234) instead of a real SMS/email.
      This feature is automatically disabled in production environments for security.
      
      ### How to use:
      1. Use the test mobile number (1234567899) or email (abc@gmail.com) in the login request
      2. The system will return the dummy OTP (1234) in the response for development
      3. Use 1234 as the OTP in the verification request
      4. The flow works exactly like real accounts but with predictable test data
      
      ⚠️ **Security Note:** Dummy OTP functionality is only available in development/staging environments.`,
      contact: {
        name: 'API Support',
        email: 'support@example.com'
      }
    },
    servers: [
      {
        url: process.env.API_BASEURL || 'http://localhost:3005',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        LoginRequest: {
          type: 'object',
          required: ['identifier'],
          properties: {
            identifier: {
              type: 'string',
              description: 'Mobile number or email address. Use "1234567899" or "abc@gmail.com" for dummy OTP testing in dev/stage.',
              oneOf: [
                {
                  example: 'john@example.com',
                  description: 'Regular email address'
                },
                {
                  example: 'abc@gmail.com',
                  description: 'Test email for dummy OTP (dev/stage only)'
                },
                {
                  example: '1234567899',
                  description: 'Test mobile for dummy OTP (dev/stage only)'
                }
              ]
            },
            fullName: {
              type: 'string',
              description: 'User full name (for new users)',
              example: 'John Doe'
            },
            countryCode: {
              type: 'string',
              description: 'Country code for mobile numbers',
              example: '+1'
            },
            deviceInfo: {
              type: 'object',
              description: 'Device information',
              example: {
                deviceType: 'mobile',
                os: 'iOS',
                version: '14.0'
              }
            }
          }
        },
        LoginResponse: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              example: 'OTP sent successfully'
            },
            sessionToken: {
              type: 'string',
              example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
            },
            identifierType: {
              type: 'string',
              example: 'email'
            },
            expiresIn: {
              type: 'number',
              example: 600
            },
            developmentInfo: {
              type: 'object',
              description: 'Additional info for dummy accounts (development only)',
              properties: {
                isDummyAccount: {
                  type: 'boolean',
                  example: true
                },
                dummyOTP: {
                  type: 'string',
                  example: '1234'
                },
                note: {
                  type: 'string',
                  example: 'This is a test account. In production, OTP would be sent normally.'
                }
              }
            }
          }
        },
        ResendOTPRequest: {
          type: 'object',
          required: ['identifier'],
          properties: {
            identifier: {
              type: 'string',
              description: 'Mobile number or email address',
              example: 'john@example.com'
            },
            countryCode: {
              type: 'string',
              description: 'Country code for mobile numbers',
              example: '+1'
            }
          }
        },
        ResendOTPResponse: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              example: 'OTP resent successfully. Please check your email/mobile.'
            },
            sessionToken: {
              type: 'string',
              example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
            },
            identifierType: {
              type: 'string',
              example: 'email'
            },
            expiresIn: {
              type: 'number',
              example: 540
            },
            isResent: {
              type: 'boolean',
              example: true
            }
          }
        },
        OTPVerificationRequest: {
          type: 'object',
          required: ['sessionToken', 'otp', 'identifier'],
          properties: {
            sessionToken: {
              type: 'string',
              description: 'Session token from login response',
              example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
            },
            otp: {
              type: 'string',
              description: '6-digit OTP code. Use "1234" for dummy test accounts (1234567899 or abc@gmail.com)',
              oneOf: [
                {
                  example: '123456',
                  description: 'Regular OTP for normal accounts'
                },
                {
                  example: '1234',
                  description: 'Dummy OTP for test accounts in dev/stage'
                }
              ]
            },
            identifier: {
              type: 'string',
              description: 'Mobile number or email address. Must match the identifier used in login.',
              oneOf: [
                {
                  example: 'john@example.com',
                  description: 'Regular account identifier'
                },
                {
                  example: 'abc@gmail.com',
                  description: 'Test email for dummy OTP'
                },
                {
                  example: '1234567899',
                  description: 'Test mobile for dummy OTP'
                }
              ]
            }
          }
        },
        OTPVerificationResponse: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              example: 'Login successful'
            },
            token: {
              type: 'string',
              example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
            },
            user: {
              type: 'object',
              properties: {
                id: {
                  type: 'string',
                  example: '507f1f77bcf86cd799439011'
                },
                email: {
                  type: 'string',
                  example: 'john@example.com'
                },
                mobileNumber: {
                  type: 'string',
                  example: '+1234567890'
                },
                fullName: {
                  type: 'string',
                  example: 'John Doe'
                },
                isEmailVerified: {
                  type: 'boolean',
                  example: true
                },
                isMobileVerified: {
                  type: 'boolean',
                  example: false
                },
                lastLoginAt: {
                  type: 'string',
                  format: 'date-time',
                  example: '2025-06-26T10:00:00.000Z'
                }
              }
            }
          }
        },
        UserProfile: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string',
              example: 'User profile retrieved successfully'
            },
            data: {
              type: 'object',
              properties: {
                user: {
                  type: 'object',
                  properties: {
                    id: {
                      type: 'string',
                      example: '507f1f77bcf86cd799439011'
                    },
                    email: {
                      type: 'string',
                      example: 'john@example.com'
                    },
                    mobile: {
                      type: 'string',
                      example: '+1234567890'
                    },
                    fullName: {
                      type: 'string',
                      example: 'John Doe'
                    },
                    countryCode: {
                      type: 'string',
                      example: '+1'
                    },
                    createdAt: {
                      type: 'string',
                      format: 'date-time',
                      example: '2025-06-26T10:00:00.000Z'
                    },
                    lastLogin: {
                      type: 'string',
                      format: 'date-time',
                      example: '2025-06-26T10:00:00.000Z'
                    }
                  }
                }
              }
            }
          }
        },
        LogoutResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string',
              example: 'Logout successful'
            }
          }
        },
        StudentProfileRequest: {
          type: 'object',
          required: ['userId', 'fullName', 'age', 'institution'],
          properties: {
            userId: {
              type: 'string',
              description: 'User ID (MongoDB ObjectId)',
              example: '507f1f77bcf86cd799439011'
            },
            fullName: {
              type: 'string',
              description: 'Student full name',
              minLength: 2,
              maxLength: 100,
              example: 'John Doe'
            },
            age: {
              type: 'integer',
              description: 'Student age',
              minimum: 1,
              maximum: 150,
              example: 20
            },
            institution: {
              type: 'string',
              description: 'Educational institution name',
              minLength: 2,
              maxLength: 200,
              example: 'Harvard University'
            },
            filePath: {
              type: 'string',
              description: 'File path for documents (resume, etc.) - optional',
              nullable: true,
              example: '/uploads/documents/resume.pdf'
            }
          }
        },
        StudentProfileResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string',
              example: 'Student profile created/updated successfully'
            },
            data: {
              type: 'object',
              properties: {
                user: {
                  type: 'object',
                  properties: {
                    id: {
                      type: 'string',
                      example: '507f1f77bcf86cd799439011'
                    },
                    fullName: {
                      type: 'string',
                      example: 'John Doe'
                    },
                    age: {
                      type: 'integer',
                      example: 20
                    },
                    institution: {
                      type: 'string',
                      example: 'Harvard University'
                    },
                    filePath: {
                      type: 'string',
                      nullable: true,
                      example: '/uploads/documents/resume.pdf'
                    },
                    email: {
                      type: 'string',
                      example: 'john@example.com'
                    },
                    mobileNumber: {
                      type: 'string',
                      example: '+1234567890'
                    },
                    updatedAt: {
                      type: 'string',
                      format: 'date-time',
                      example: '2025-06-27T10:00:00.000Z'
                    }
                  }
                }
              }
            }
          }
        },
        SchoolListResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string',
              example: 'Schools retrieved successfully'
            },
            data: {
              type: 'object',
              properties: {
                schools: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/School'
                  }
                },
                pagination: {
                  type: 'object',
                  properties: {
                    currentPage: {
                      type: 'integer',
                      example: 1
                    },
                    totalPages: {
                      type: 'integer',
                      example: 5
                    },
                    totalSchools: {
                      type: 'integer',
                      example: 98
                    },
                    limit: {
                      type: 'integer',
                      example: 20
                    },
                    hasNextPage: {
                      type: 'boolean',
                      example: true
                    },
                    hasPrevPage: {
                      type: 'boolean',
                      example: false
                    }
                  }
                }
              }
            }
          }
        },
        School: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '507f1f77bcf86cd799439011'
            },
            name: {
              type: 'string',
              example: 'Harvard University'
            },
            address: {
              type: 'object',
              properties: {
                street: {
                  type: 'string',
                  example: 'Massachusetts Hall'
                },
                city: {
                  type: 'string',
                  example: 'Cambridge'
                },
                state: {
                  type: 'string',
                  example: 'Massachusetts'
                },
                country: {
                  type: 'string',
                  example: 'United States'
                },
                zipCode: {
                  type: 'string',
                  example: '02138'
                }
              }
            },
            contactInfo: {
              type: 'object',
              properties: {
                phone: {
                  type: 'string',
                  example: '+1-617-495-1000'
                },
                email: {
                  type: 'string',
                  example: 'info@harvard.edu'
                },
                website: {
                  type: 'string',
                  example: 'https://www.harvard.edu'
                }
              }
            },
            type: {
              type: 'string',
              enum: ['public', 'private', 'charter', 'international', 'vocational'],
              example: 'private'
            },
            establishedYear: {
              type: 'integer',
              example: 1636
            },
            studentCapacity: {
              type: 'integer',
              example: 20000
            },
            description: {
              type: 'string',
              example: 'Harvard University is a private Ivy League research university in Cambridge, Massachusetts.'
            },
            facilities: {
              type: 'array',
              items: {
                type: 'string'
              },
              example: ['Library', 'Laboratory', 'Sports Complex', 'Dormitories']
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              example: '2025-06-27T10:00:00.000Z'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              example: '2025-06-27T10:00:00.000Z'
            }
          }
        },
        SimpleSchoolListResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string',
              example: 'Schools retrieved successfully'
            },
            data: {
              type: 'object',
              properties: {
                schools: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      _id: {
                        type: 'string',
                        example: '507f1f77bcf86cd799439011'
                      },
                      name: {
                        type: 'string',
                        example: 'Harvard University'
                      }
                    }
                  }
                }
              }
            }
          }
        },
        News: {
          type: 'object',
          required: ['title', 'subTitle', 'description', 'category', 'type', 'status', 'author'],
          properties: {
            _id: {
              type: 'string',
              description: 'News article ID',
              example: '64f7c8e9b1234567890abcde'
            },
            title: {
              type: 'string',
              description: 'News article title',
              example: 'Breaking: New Educational Program Launched'
            },
            subTitle: {
              type: 'string',
              description: 'News article subtitle',
              example: 'A comprehensive overview of our latest initiative'
            },
            description: {
              type: 'string',
              description: 'News article description',
              example: 'We are excited to announce the launch of our new educational program...'
            },
            category: {
              type: 'string',
              enum: ['Education', 'Technology', 'Health', 'Science', 'Tips & Tricks', 'Research', 'Announcement', 'General News'],
              description: 'News category',
              example: 'Education'
            },
            type: {
              type: 'string',
              enum: ['Video', 'Image', 'Text'],
              description: 'News content type',
              example: 'Text'
            },
            content_url: {
              type: 'string',
              description: 'External content URL (optional)',
              nullable: true,
              example: 'https://example.com/content'
            },
            upload_file: {
              type: 'string',
              description: 'Uploaded file path (optional)',
              nullable: true,
              example: '/uploads/news/news-1234567890.jpg'
            },
            hasQuiz: {
              type: 'boolean',
              default: false,
              description: 'Whether the news article has quiz questions'
            },
            status: {
              type: 'string',
              enum: ['Draft', 'Published'],
              default: 'Draft',
              description: 'News article status'
            },
            author: {
              type: 'string',
              description: 'Author name',
              example: 'John Doe'
            },
            quizQuestions: {
              type: 'array',
              items: {
                type: 'object',
                required: ['question', 'options', 'correctAnswers'],
                properties: {
                  _id: {
                    type: 'string',
                    description: 'Quiz question ID'
                  },
                  question: {
                    type: 'string',
                    description: 'Quiz question text',
                    example: 'What is the main benefit of this program?'
                  },
                  options: {
                    type: 'array',
                    items: {
                      type: 'string'
                    },
                    description: 'Answer options',
                    example: ['Better learning outcomes', 'Cost reduction', 'Increased engagement', 'All of the above']
                  },
                  correctAnswers: {
                    type: 'array',
                    items: {
                      type: 'string'
                    },
                    description: 'Correct answer options',
                    example: ['All of the above']
                  }
                }
              },
              description: 'Quiz questions associated with the news article'
            },
            publishedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Publication timestamp',
              nullable: true
            },
            viewCount: {
              type: 'number',
              default: 0,
              description: 'Number of views'
            },
            likes: {
              type: 'number',
              default: 0,
              description: 'Number of likes'
            },
            isActive: {
              type: 'boolean',
              default: true,
              description: 'Whether the news article is active'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp'
            }
          }
        },
        Quiz: {
          type: 'object',
          required: ['title', 'description', 'category', 'author', 'questions'],
          properties: {
            _id: {
              type: 'string',
              description: 'Quiz ID',
              example: '64f7c8e9b1234567890abcde'
            },
            title: {
              type: 'string',
              description: 'Quiz title',
              example: 'Mathematics Quiz - Grade 5'
            },
            description: {
              type: 'string',
              description: 'Quiz description',
              example: 'A comprehensive quiz covering basic mathematical concepts for grade 5 students'
            },
            category: {
              type: 'string',
              description: 'Quiz category',
              example: 'Mathematics'
            },
            author: {
              type: 'string',
              description: 'Author name',
              example: 'Jane Smith'
            },
            difficulty: {
              type: 'string',
              enum: ['Easy', 'Medium', 'Hard'],
              default: 'Easy',
              description: 'Quiz difficulty level'
            },
            timeLimit: {
              type: 'integer',
              default: 30,
              description: 'Time limit in minutes'
            },
            questions: {
              type: 'array',
              items: {
                type: 'object',
                required: ['question', 'options', 'correctAnswer'],
                properties: {
                  question: {
                    type: 'string',
                    description: 'Question text',
                    example: 'What is 2 + 2?'
                  },
                  options: {
                    type: 'array',
                    items: {
                      type: 'string'
                    },
                    description: 'Answer options',
                    example: ['3', '4', '5', '6']
                  },
                  correctAnswer: {
                    type: 'string',
                    description: 'Correct answer',
                    example: '4'
                  },
                  explanation: {
                    type: 'string',
                    description: 'Explanation of the correct answer',
                    example: 'Two plus two equals four'
                  },
                  points: {
                    type: 'integer',
                    default: 1,
                    description: 'Points awarded for correct answer'
                  }
                }
              },
              description: 'Quiz questions'
            },
            status: {
              type: 'string',
              enum: ['draft', 'published', 'archived'],
              default: 'draft',
              description: 'Quiz status'
            },
            tags: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Quiz tags',
              example: ['math', 'grade5', 'arithmetic']
            },
            totalQuestions: {
              type: 'integer',
              description: 'Total number of questions'
            },
            totalPoints: {
              type: 'integer',
              description: 'Total points possible'
            },
            attempts: {
              type: 'number',
              default: 0,
              description: 'Number of quiz attempts'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp'
            }
          }
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            error: {
              type: 'string',
              example: 'An Error occurred please try again'
            },
            type: {
              type: 'string',
              example: 'INTERNAL_ERROR'
            }
          }
        }
      }
    },
    paths: {
      '/login': {
        post: {
          summary: 'Initiate login process',
          description: 'Send OTP to user\'s email or mobile number',
          tags: ['Authentication'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/LoginRequest'
                }
              }
            }
          },
          responses: {
            '200': {
              description: 'OTP sent successfully',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/LoginResponse'
                  }
                }
              }
            },
            '400': {
              description: 'Bad request',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse'
                  }
                }
              }
            },
            '429': {
              description: 'Too many OTP requests',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse'
                  }
                }
              }
            },
            '500': {
              description: 'Internal server error',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse'
                  }
                }
              }
            }
          }
        }
      },
      '/verify-otp': {
        post: {
          summary: 'Verify OTP and complete login',
          description: 'Verify the OTP code and return JWT token',
          tags: ['Authentication'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/OTPVerificationRequest'
                }
              }
            }
          },
          responses: {
            '200': {
              description: 'Login successful',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/OTPVerificationResponse'
                  }
                }
              }
            },
            '400': {
              description: 'Invalid OTP or expired session',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse'
                  }
                }
              }
            },
            '404': {
              description: 'User not found',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse'
                  }
                }
              }
            },
            '500': {
              description: 'Internal server error',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse'
                  }
                }
              }
            }
          }
        }
      },
      '/profile': {
        get: {
          summary: 'Get user profile',
          description: 'Get authenticated user\'s profile information',
          tags: ['User Profile'],
          security: [
            {
              bearerAuth: []
            }
          ],
          responses: {
            '200': {
              description: 'Profile retrieved successfully',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/UserProfile'
                  }
                }
              }
            },
            '401': {
              description: 'Unauthorized - Invalid or missing token',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse'
                  }
                }
              }
            },
            '500': {
              description: 'Internal server error',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse'
                  }
                }
              }
            }
          }
        }
      },
      '/logout': {
        post: {
          summary: 'Logout user',
          description: 'Logout the authenticated user',
          tags: ['Authentication'],
          security: [
            {
              bearerAuth: []
            }
          ],
          responses: {
            '200': {
              description: 'Logout successful',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/LogoutResponse'
                  }
                }
              }
            },
            '401': {
              description: 'Unauthorized - Invalid or missing token',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse'
                  }
                }
              }
            },
            '500': {
              description: 'Internal server error',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse'
                  }
                }
              }
            }
          }
        }
      },
      '/resend-otp': {
        post: {
          summary: 'Resend OTP',
          description: 'Resend existing OTP if not expired, or generate new OTP if expired',
          tags: ['Authentication'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ResendOTPRequest'
                }
              }
            }
          },
          responses: {
            '200': {
              description: 'OTP resent successfully',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ResendOTPResponse'
                  }
                }
              }
            },
            '400': {
              description: 'Bad request',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse'
                  }
                }
              }
            },
            '404': {
              description: 'User not found',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse'
                  }
                }
              }
            },
            '429': {
              description: 'Too many OTP requests',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse'
                  }
                }
              }
            },
            '500': {
              description: 'Internal server error',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse'
                  }
                }
              }
            }
          }
        }
      },
      '/create-profile': {
        post: {
          summary: 'Create or update student profile',
          description: 'Create a new student profile or update existing profile data. If the user already exists, their profile will be updated with the new information.',
          tags: ['User Profile'],
          security: [
            {
              bearerAuth: []
            }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/StudentProfileRequest'
                }
              }
            }
          },
          responses: {
            '200': {
              description: 'Student profile created/updated successfully',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/StudentProfileResponse'
                  }
                }
              }
            },
            '400': {
              description: 'Bad request - Validation errors',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      {
                        $ref: '#/components/schemas/ErrorResponse'
                      },
                      {
                        type: 'object',
                        properties: {
                          type: {
                            type: 'string',
                            example: 'VALIDATION_ERROR'
                          }
                        }
                      }
                    ]
                  }
                }
              }
            },
            '401': {
              description: 'Unauthorized - Invalid or missing token',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse'
                  }
                }
              }
            },
            '404': {
              description: 'User not found',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      {
                        $ref: '#/components/schemas/ErrorResponse'
                      },
                      {
                        type: 'object',
                        properties: {
                          type: {
                            type: 'string',
                            example: 'USER_NOT_FOUND'
                          }
                        }
                      }
                    ]
                  }
                }
              }
            },
            '500': {
              description: 'Internal server error',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      {
                        $ref: '#/components/schemas/ErrorResponse'
                      },
                      {
                        type: 'object',
                        properties: {
                          type: {
                            type: 'string',
                            example: 'INTERNAL_ERROR'
                          }
                        }
                      }
                    ]
                  }
                }
              }
            }
          }
        }
      },
      '/schools': {
        get: {
          summary: 'Get list of schools',
          description: 'Retrieve a simple list of all schools with only their names',
          tags: ['Schools'],
          responses: {
            '200': {
              description: 'Schools retrieved successfully',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/SimpleSchoolListResponse'
                  }
                }
              }
            },
            '500': {
              description: 'Internal server error',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      {
                        $ref: '#/components/schemas/ErrorResponse'
                      },
                      {
                        type: 'object',
                        properties: {
                          type: {
                            type: 'string',
                            example: 'INTERNAL_ERROR'
                          }
                        }
                      }
                    ]
                  }
                }
              }
            }
          }
        }
      },
      '/create-news': {
        post: {
          summary: 'Submit a news article',
          description: 'Create a new news article with optional quiz questions and file upload',
          tags: ['News'],
          security: [
            {
              bearerAuth: []
            }
          ],
          requestBody: {
            required: true,
            content: {
              'multipart/form-data': {
                schema: {
                  type: 'object',
                  required: ['title', 'subTitle', 'description', 'category', 'type', 'status', 'author'],
                  properties: {
                    title: {
                      type: 'string',
                      description: 'News article title',
                      example: 'Breaking: New Educational Program Launched'
                    },
                    subTitle: {
                      type: 'string',
                      description: 'News article subtitle',
                      example: 'A comprehensive overview of our latest initiative'
                    },
                    description: {
                      type: 'string',
                      description: 'News article description',
                      example: 'We are excited to announce the launch of our new educational program...'
                    },
                    category: {
                      type: 'string',
                      enum: ['Education', 'Technology', 'Health', 'Science', 'Tips & Tricks', 'Research', 'Announcement', 'General News'],
                      description: 'News category',
                      example: 'Education'
                    },
                    type: {
                      type: 'string',
                      enum: ['Video', 'Image', 'Text'],
                      description: 'News content type',
                      example: 'Text'
                    },
                    content_url: {
                      type: 'string',
                      description: 'External content URL (optional)',
                      example: 'https://example.com/content'
                    },
                    hasQuiz: {
                      type: 'boolean',
                      default: false,
                      description: 'Whether the news article has quiz questions'
                    },
                    status: {
                      type: 'string',
                      enum: ['Draft', 'Published'],
                      default: 'Draft',
                      description: 'News article status'
                    },
                    author: {
                      type: 'string',
                      description: 'Author name',
                      example: 'John Doe'
                    },
                    file: {
                      type: 'string',
                      format: 'binary',
                      description: 'Upload file (image or video, max 50MB). Uploaded file will be saved to /uploads/news/ directory'
                    },
                    quizQuestions: {
                      type: 'string',
                      description: 'Quiz questions as JSON string (optional). Array of objects with question, options, and correctAnswers fields',
                      example: '[{"question":"What is the main benefit?","options":["A","B","C","D"],"correctAnswers":["A"]}]'
                    }
                  }
                }
              },
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['title', 'subTitle', 'description', 'category', 'type', 'status', 'author'],
                  properties: {
                    title: {
                      type: 'string',
                      description: 'News article title',
                      example: 'Breaking: New Educational Program Launched'
                    },
                    subTitle: {
                      type: 'string',
                      description: 'News article subtitle',
                      example: 'A comprehensive overview of our latest initiative'
                    },
                    description: {
                      type: 'string',
                      description: 'News article description',
                      example: 'We are excited to announce the launch of our new educational program...'
                    },
                    category: {
                      type: 'string',
                      enum: ['Education', 'Technology', 'Health', 'Science', 'Tips & Tricks', 'Research', 'Announcement', 'General News'],
                      description: 'News category',
                      example: 'Education'
                    },
                    type: {
                      type: 'string',
                      enum: ['Video', 'Image', 'Text'],
                      description: 'News content type',
                      example: 'Text'
                    },
                    content_url: {
                      type: 'string',
                      description: 'External content URL (optional)',
                      example: 'https://example.com/content'
                    },
                    hasQuiz: {
                      type: 'boolean',
                      default: false,
                      description: 'Whether the news article has quiz questions'
                    },
                    status: {
                      type: 'string',
                      enum: ['Draft', 'Published'],
                      default: 'Draft',
                      description: 'News article status'
                    },
                    author: {
                      type: 'string',
                      description: 'Author name',
                      example: 'John Doe'
                    },
                    quizQuestions: {
                      type: 'array',
                      items: {
                        type: 'object',
                        required: ['question', 'options', 'correctAnswers'],
                        properties: {
                          question: {
                            type: 'string',
                            description: 'Quiz question text',
                            example: 'What is the main benefit of this program?'
                          },
                          options: {
                            type: 'array',
                            items: {
                              type: 'string'
                            },
                            description: 'Answer options',
                            example: ['Better learning outcomes', 'Cost reduction', 'Increased engagement', 'All of the above']
                          },
                          correctAnswers: {
                            type: 'array',
                            items: {
                              type: 'string'
                            },
                            description: 'Correct answer options',
                            example: ['All of the above']
                          }
                        }
                      },
                      description: 'Quiz questions (optional)'
                    }
                  }
                }
              }
            }
          },
          responses: {
            '200': {
              description: 'News article created successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: {
                        type: 'boolean',
                        example: true
                      },
                      message: {
                        type: 'string',
                        example: 'Article submitted successfully'
                      },
                      data: {
                        type: 'object',
                        properties: {
                          articleId: {
                            type: 'string',
                            example: '64f7c8e9b1234567890abcde'
                          },
                          title: {
                            type: 'string',
                            example: 'Breaking: New Educational Program Launched'
                          },
                          status: {
                            type: 'string',
                            example: 'Draft'
                          },
                          hasQuiz: {
                            type: 'boolean',
                            example: false
                          },
                          quizCount: {
                            type: 'number',
                            example: 0
                          },
                          createdAt: {
                            type: 'string',
                            format: 'date-time'
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            '400': {
              description: 'Validation error',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: {
                        type: 'boolean',
                        example: false
                      },
                      error: {
                        type: 'string',
                        example: 'Validation failed'
                      },
                      type: {
                        type: 'string',
                        example: 'VALIDATION_ERROR'
                      }
                    }
                  }
                }
              }
            },
            '401': {
              description: 'Unauthorized',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: {
                        type: 'boolean',
                        example: false
                      },
                      error: {
                        type: 'string',
                        example: 'Authentication token is invalid'
                      },
                      type: {
                        type: 'string',
                        example: 'UNAUTHORIZED'
                      }
                    }
                  }
                }
              }
            },
            '500': {
              description: 'Server error',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: {
                        type: 'boolean',
                        example: false
                      },
                      error: {
                        type: 'string',
                        example: 'An Error occurred please try again'
                      },
                      type: {
                        type: 'string',
                        example: 'INTERNAL_ERROR'
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      '/news': {
        get: {
          summary: 'Get all news articles',
          description: 'Retrieve all news articles with pagination and filtering options',
          tags: ['News'],
          parameters: [
            {
              in: 'query',
              name: 'page',
              schema: {
                type: 'integer',
                default: 1
              },
              description: 'Page number'
            },
            {
              in: 'query',
              name: 'limit',
              schema: {
                type: 'integer',
                default: 10
              },
              description: 'Number of items per page'
            },
            {
              in: 'query',
              name: 'category',
              schema: {
                type: 'string',
                enum: ['Education', 'Technology', 'Health', 'Science', 'Tips & Tricks', 'Research', 'Announcement', 'General News']
              },
              description: 'Filter by category'
            },
            {
              in: 'query',
              name: 'status',
              schema: {
                type: 'string',
                enum: ['Draft', 'Published']
              },
              description: 'Filter by status'
            },
            {
              in: 'query',
              name: 'author',
              schema: {
                type: 'string'
              },
              description: 'Filter by author name'
            },
            {
              in: 'query',
              name: 'hasQuiz',
              schema: {
                type: 'boolean'
              },
              description: 'Filter by quiz availability'
            },
            {
              in: 'query',
              name: 'type',
              schema: {
                type: 'string',
                enum: ['Video', 'Image', 'Text']
              },
              description: 'Filter by content type'
            }
          ],
          responses: {
            '200': {
              description: 'News articles retrieved successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: {
                        type: 'boolean',
                        example: true
                      },
                      message: {
                        type: 'string',
                        example: 'News articles retrieved successfully'
                      },
                      data: {
                        type: 'object',
                        properties: {
                          articles: {
                            type: 'array',
                            items: {
                              $ref: '#/components/schemas/News'
                            }
                          },
                          pagination: {
                            type: 'object',
                            properties: {
                              currentPage: {
                                type: 'integer',
                                example: 1
                              },
                              totalPages: {
                                type: 'integer',
                                example: 5
                              },
                              totalCount: {
                                type: 'integer',
                                example: 50
                              },
                              hasNextPage: {
                                type: 'boolean',
                                example: true
                              },
                              hasPreviousPage: {
                                type: 'boolean',
                                example: false
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            '500': {
              description: 'Server error',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse'
                  }
                }
              }
            }
          }
        }
      },
      '/news/{id}': {
        get: {
          summary: 'Get a specific news article',
          description: 'Retrieve a news article by its ID',
          tags: ['News'],
          parameters: [
            {
              in: 'path',
              name: 'id',
              required: true,
              schema: {
                type: 'string'
              },
              description: 'News article ID'
            }
          ],
          responses: {
            '200': {
              description: 'News article retrieved successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: {
                        type: 'boolean',
                        example: true
                      },
                      message: {
                        type: 'string',
                        example: 'News articles retrieved successfully'
                      },
                      data: {
                        type: 'object',
                        properties: {
                          article: {
                            $ref: '#/components/schemas/News'
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            '404': {
              description: 'News article not found',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: {
                        type: 'boolean',
                        example: false
                      },
                      error: {
                        type: 'string',
                        example: 'Article not found'
                      },
                      type: {
                        type: 'string',
                        example: 'ARTICLE_NOT_FOUND'
                      }
                    }
                  }
                }
              }
            },
            '500': {
              description: 'Server error',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse'
                  }
                }
              }
            }
          }
        },
        put: {
          summary: 'Update a news article',
          description: 'Update an existing news article',
          tags: ['News'],
          security: [
            {
              bearerAuth: []
            }
          ],
          parameters: [
            {
              in: 'path',
              name: 'id',
              required: true,
              schema: {
                type: 'string'
              },
              description: 'News article ID'
            }
          ],
          requestBody: {
            required: true,
            content: {
              'multipart/form-data': {
                schema: {
                  type: 'object',
                  properties: {
                    title: {
                      type: 'string',
                      description: 'News article title'
                    },
                    subTitle: {
                      type: 'string',
                      description: 'News article subtitle'
                    },
                    description: {
                      type: 'string',
                      description: 'News article description'
                    },
                    category: {
                      type: 'string',
                      enum: ['Education', 'Technology', 'Health', 'Science', 'Tips & Tricks', 'Research', 'Announcement', 'General News'],
                      description: 'News category'
                    },
                    type: {
                      type: 'string',
                      enum: ['Video', 'Image', 'Text'],
                      description: 'News content type'
                    },
                    content_url: {
                      type: 'string',
                      description: 'External content URL'
                    },
                    hasQuiz: {
                      type: 'boolean',
                      description: 'Whether the news article has quiz questions'
                    },
                    status: {
                      type: 'string',
                      enum: ['Draft', 'Published'],
                      description: 'News article status'
                    },
                    author: {
                      type: 'string',
                      description: 'Author name'
                    },
                    file: {
                      type: 'string',
                      format: 'binary',
                      description: 'Upload new file (image or video, max 50MB). Will replace existing file if provided'
                    },
                    quizQuestions: {
                      type: 'string',
                      description: 'Quiz questions as JSON string. Array of objects with question, options, and correctAnswers fields',
                      example: '[{"question":"What is the main benefit?","options":["A","B","C","D"],"correctAnswers":["A"]}]'
                    }
                  }
                }
              },
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    title: {
                      type: 'string',
                      description: 'News article title'
                    },
                    subTitle: {
                      type: 'string',
                      description: 'News article subtitle'
                    },
                    description: {
                      type: 'string',
                      description: 'News article description'
                    },
                    category: {
                      type: 'string',
                      enum: ['Education', 'Technology', 'Health', 'Science', 'Tips & Tricks', 'Research', 'Announcement', 'General News'],
                      description: 'News category'
                    },
                    type: {
                      type: 'string',
                      enum: ['Video', 'Image', 'Text'],
                      description: 'News content type'
                    },
                    content_url: {
                      type: 'string',
                      description: 'External content URL'
                    },
                    hasQuiz: {
                      type: 'boolean',
                      description: 'Whether the news article has quiz questions'
                    },
                    status: {
                      type: 'string',
                      enum: ['Draft', 'Published'],
                      description: 'News article status'
                    },
                    author: {
                      type: 'string',
                      description: 'Author name'
                    },
                    quizQuestions: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          question: {
                            type: 'string',
                            description: 'Quiz question text'
                          },
                          options: {
                            type: 'array',
                            items: {
                              type: 'string'
                            },
                            description: 'Answer options'
                          },
                          correctAnswers: {
                            type: 'array',
                            items: {
                              type: 'string'
                            },
                            description: 'Correct answer options'
                          }
                        }
                      },
                      description: 'Quiz questions'
                    }
                  }
                }
              }
            }
          },
          responses: {
            '200': {
              description: 'News article updated successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: {
                        type: 'boolean',
                        example: true
                      },
                      message: {
                        type: 'string',
                        example: 'Article updated successfully'
                      },
                      data: {
                        type: 'object',
                        properties: {
                          article: {
                            $ref: '#/components/schemas/News'
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            '400': {
              description: 'Validation error',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse'
                  }
                }
              }
            },
            '401': {
              description: 'Unauthorized',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse'
                  }
                }
              }
            },
            '404': {
              description: 'News article not found',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: {
                        type: 'boolean',
                        example: false
                      },
                      error: {
                        type: 'string',
                        example: 'Article not found'
                      },
                      type: {
                        type: 'string',
                        example: 'ARTICLE_NOT_FOUND'
                      }
                    }
                  }
                }
              }
            },
            '500': {
              description: 'Server error',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse'
                  }
                }
              }
            }
          }
        },
        delete: {
          summary: 'Delete a news article',
          description: 'Delete an existing news article (soft delete)',
          tags: ['News'],
          security: [
            {
              bearerAuth: []
            }
          ],
          parameters: [
            {
              in: 'path',
              name: 'id',
              required: true,
              schema: {
                type: 'string'
              },
              description: 'News article ID'
            }
          ],
          responses: {
            '200': {
              description: 'News article deleted successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: {
                        type: 'boolean',
                        example: true
                      },
                      message: {
                        type: 'string',
                        example: 'Article deleted successfully'
                      }
                    }
                  }
                }
              }
            },
            '401': {
              description: 'Unauthorized',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse'
                  }
                }
              }
            },
            '404': {
              description: 'News article not found',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: {
                        type: 'boolean',
                        example: false
                      },
                      error: {
                        type: 'string',
                        example: 'Article not found'
                      },
                      type: {
                        type: 'string',
                        example: 'ARTICLE_NOT_FOUND'
                      }
                    }
                  }
                }
              }
            },
            '500': {
              description: 'Server error',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse'
                  }
                }
              }
            }
          }
        }
      },
      '/create-quiz': {
        post: {
          summary: 'Submit a quiz',
          description: 'Create a new quiz',
          tags: ['Quiz'],
          security: [
            {
              bearerAuth: []
            }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Quiz'
                }
              }
            }
          },
          responses: {
            '201': {
              description: 'Quiz created successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: {
                        type: 'boolean',
                        example: true
                      },
                      message: {
                        type: 'string',
                        example: 'Quiz created successfully'
                      },
                      data: {
                        $ref: '#/components/schemas/Quiz'
                      }
                    }
                  }
                }
              }
            },
            '400': {
              description: 'Validation error',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse'
                  }
                }
              }
            },
            '401': {
              description: 'Unauthorized',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse'
                  }
                }
              }
            },
            '500': {
              description: 'Server error',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse'
                  }
                }
              }
            }
          }
        }
      },
      '/quiz': {
        get: {
          summary: 'Get all quizzes',
          description: 'Retrieve all quizzes with pagination and filtering options',
          tags: ['Quiz'],
          parameters: [
            {
              in: 'query',
              name: 'page',
              schema: {
                type: 'integer',
                default: 1
              },
              description: 'Page number'
            },
            {
              in: 'query',
              name: 'limit',
              schema: {
                type: 'integer',
                default: 10
              },
              description: 'Number of items per page'
            },
            {
              in: 'query',
              name: 'category',
              schema: {
                type: 'string'
              },
              description: 'Filter by category'
            },
            {
              in: 'query',
              name: 'difficulty',
              schema: {
                type: 'string',
                enum: ['Easy', 'Medium', 'Hard']
              },
              description: 'Filter by difficulty'
            },
            {
              in: 'query',
              name: 'status',
              schema: {
                type: 'string',
                enum: ['draft', 'published', 'archived']
              },
              description: 'Filter by status'
            }
          ],
          responses: {
            '200': {
              description: 'Quizzes retrieved successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: {
                        type: 'boolean',
                        example: true
                      },
                      data: {
                        type: 'array',
                        items: {
                          $ref: '#/components/schemas/Quiz'
                        }
                      },
                      pagination: {
                        type: 'object',
                        properties: {
                          page: {
                            type: 'integer',
                            example: 1
                          },
                          limit: {
                            type: 'integer',
                            example: 10
                          },
                          total: {
                            type: 'integer',
                            example: 25
                          },
                          totalPages: {
                            type: 'integer',
                            example: 3
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            '500': {
              description: 'Server error',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse'
                  }
                }
              }
            }
          }
        }
      },
      '/quiz/{id}': {
        get: {
          summary: 'Get a specific quiz',
          description: 'Retrieve a quiz by its ID',
          tags: ['Quiz'],
          parameters: [
            {
              in: 'path',
              name: 'id',
              required: true,
              schema: {
                type: 'string'
              },
              description: 'Quiz ID'
            }
          ],
          responses: {
            '200': {
              description: 'Quiz retrieved successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: {
                        type: 'boolean',
                        example: true
                      },
                      data: {
                        $ref: '#/components/schemas/Quiz'
                      }
                    }
                  }
                }
              }
            },
            '404': {
              description: 'Quiz not found',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse'
                  }
                }
              }
            },
            '500': {
              description: 'Server error',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse'
                  }
                }
              }
            }
          }
        },
        put: {
          summary: 'Update a quiz',
          description: 'Update an existing quiz',
          tags: ['Quiz'],
          security: [
            {
              bearerAuth: []
            }
          ],
          parameters: [
            {
              in: 'path',
              name: 'id',
              required: true,
              schema: {
                type: 'string'
              },
              description: 'Quiz ID'
            }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    title: {
                      type: 'string'
                    },
                    description: {
                      type: 'string'
                    },
                    category: {
                      type: 'string'
                    },
                    difficulty: {
                      type: 'string',
                      enum: ['Easy', 'Medium', 'Hard']
                    },
                    timeLimit: {
                      type: 'integer'
                    },
                    questions: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          question: {
                            type: 'string'
                          },
                          options: {
                            type: 'array',
                            items: {
                              type: 'string'
                            }
                          },
                          correctAnswer: {
                            type: 'string'
                          },
                          explanation: {
                            type: 'string'
                          },
                          points: {
                            type: 'integer'
                          }
                        }
                      }
                    },
                    status: {
                      type: 'string',
                      enum: ['draft', 'published', 'archived']
                    },
                    tags: {
                      type: 'array',
                      items: {
                        type: 'string'
                      }
                    }
                  }
                }
              }
            }
          },
          responses: {
            '200': {
              description: 'Quiz updated successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: {
                        type: 'boolean',
                        example: true
                      },
                      message: {
                        type: 'string',
                        example: 'Quiz updated successfully'
                      },
                      data: {
                        $ref: '#/components/schemas/Quiz'
                      }
                    }
                  }
                }
              }
            },
            '400': {
              description: 'Validation error',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse'
                  }
                }
              }
            },
            '401': {
              description: 'Unauthorized',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse'
                  }
                }
              }
            },
            '404': {
              description: 'Quiz not found',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse'
                  }
                }
              }
            },
            '500': {
              description: 'Server error',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse'
                  }
                }
              }
            }
          }
        },
        delete: {
          summary: 'Delete a quiz',
          description: 'Delete an existing quiz',
          tags: ['Quiz'],
          security: [
            {
              bearerAuth: []
            }
          ],
          parameters: [
            {
              in: 'path',
              name: 'id',
              required: true,
              schema: {
                type: 'string'
              },
              description: 'Quiz ID'
            }
          ],
          responses: {
            '200': {
              description: 'Quiz deleted successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: {
                        type: 'boolean',
                        example: true
                      },
                      message: {
                        type: 'string',
                        example: 'Quiz deleted successfully'
                      }
                    }
                  }
                }
              }
            },
            '401': {
              description: 'Unauthorized',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse'
                  }
                }
              }
            },
            '404': {
              description: 'Quiz not found',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse'
                  }
                }
              }
            },
            '500': {
              description: 'Server error',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse'
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  apis: [
    './routes/apiRoutes.js'
  ]
};

const specs = swaggerJsdoc(options);

module.exports = {
  specs
};

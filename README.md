# Lottery Management Backend

A comprehensive Node.js/Express.js backend API for lottery management system with role-based authentication for Super Admins, Admins, and Users.

## 🚀 Features

### Authentication System
- **Super Admin**: Full system access with pre-authentication
- **Admin**: Administrative access with pre-authentication  
- **User**: Standard user access with direct authentication
- **JWT-based authentication** with role-based access control
- **Password management** (forgot password, reset password, change password)
- **Secure password hashing** using bcrypt

### Security Features
- **Pre-authentication tokens** for Super Admin and Admin login
- **JWT token expiration** and validation
- **Input validation** using Joi schemas
- **Password strength requirements**
- **Audit logging** for all authentication events
- **Environment-based configuration** with validation

## 🛠️ Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js v5.1.0
- **Database**: MongoDB with Mongoose v8.19.1
- **Authentication**: JWT (jsonwebtoken v9.0.2)
- **Password Hashing**: bcrypt v6.0.0
- **Validation**: Joi v18.0.1
- **Environment**: dotenv v17.2.3
- **CORS**: cors v2.8.5
- **Development**: nodemon v3.1.10

## 📁 Project Structure

```
Lottery_Management_Backend/
├── docs/                          # API Documentation
│   ├── admin-auth.md             # Admin API documentation
│   ├── super-admin-auth.md       # Super Admin API documentation
│   ├── user-auth.md              # User API documentation
│   ├── authentication-flow.md    # Authentication flow guide
│   └── env.example               # Environment variables template
├── src/                          # Source Code
│   ├── config/                   # Configuration
│   │   └── index.js              # Environment config with validation
│   ├── controllers/              # Business Logic
│   │   ├── admin.controller.js   # Admin operations
│   │   ├── superAdmin.controller.js # Super Admin operations
│   │   └── user.controller.js    # User operations
│   ├── middleware/               # Custom Middleware
│   │   ├── auth.js               # Super Admin authentication
│   │   ├── adminAuth.js          # Admin authentication
│   │   ├── userAuth.js           # User authentication
│   │   ├── adminPreAuth.js       # Admin pre-authentication
│   │   └── superAdminPreAuth.js  # Super Admin pre-authentication
│   ├── models/                   # Database Models
│   │   ├── SuperAdmin.js         # Super Admin schema
│   │   ├── Admin.js              # Admin schema
│   │   └── User.js               # User schema with address
│   ├── routes/                   # API Routes
│   │   ├── index.js              # Main router
│   │   ├── superAdmin.routes.js  # Super Admin routes
│   │   ├── admin.routes.js       # Admin routes
│   │   └── user.routes.js        # User routes
│   ├── shared/                   # Shared Utilities
│   │   └── validate.js           # Input validation middleware
│   └── validation/               # Validation Schemas
│       ├── superAdmin.schemas.js # Super Admin validation
│       ├── admin.schemas.js      # Admin validation
│       └── user.schemas.js       # User validation
├── index.js                      # Application entry point
├── package.json                  # Dependencies and scripts
└── package-lock.json            # Dependency lock file
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Lottery_Management_Backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp docs/env.example .env
   ```
   
   Edit `.env` file with your configuration:
   ```env
   PORT=3000
   MONGO_URI=mongodb://127.0.0.1:27017/lottery_db
   JWT_SECRET=your_very_strong_secret_key_here_at_least_16_characters
   JWT_EXPIRES_IN=7d
   ```

4. **Start the server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   node index.js
   ```

The server will start on `http://localhost:3000` (or your configured PORT).

## 📚 API Documentation

### Base URL
All API endpoints are prefixed with `/api`

### Health Check
- **GET** `/health` - Server health status

### Documentation Access
- **GET** `/docs/` - Access API documentation files

## 🔐 Authentication Flows

### Super Admin Authentication
**Two-step authentication process:**
1. Get pre-authentication token: `GET /api/super-admin/pre-auth-token`
2. Login with pre-auth token: `POST /api/super-admin/login`

### Admin Authentication  
**Two-step authentication process:**
1. Get pre-authentication token: `GET /api/admin/pre-auth-token`
2. Login with pre-auth token: `POST /api/admin/login`

### User Authentication
**Direct authentication:**
1. Login directly: `POST /api/user/login`

## 📋 API Endpoints

### Super Admin APIs
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/super-admin/signup` | Create super admin | No |
| GET | `/api/super-admin/pre-auth-token` | Get pre-auth token | No |
| POST | `/api/super-admin/login` | Login with pre-auth | **Pre-auth JWT** |
| POST | `/api/super-admin/logout` | Logout | **Full JWT** |
| POST | `/api/super-admin/forgot-password` | Request password reset | No |
| POST | `/api/super-admin/reset-password` | Reset password | No |
| POST | `/api/super-admin/change-password` | Change password | **Full JWT** |

### Admin APIs
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/admin/signup` | Create admin | No |
| GET | `/api/admin/pre-auth-token` | Get pre-auth token | No |
| POST | `/api/admin/login` | Login with pre-auth | **Pre-auth JWT** |
| POST | `/api/admin/logout` | Logout | **Full JWT** |
| POST | `/api/admin/forgot-password` | Request password reset | No |
| POST | `/api/admin/reset-password` | Reset password | No |
| POST | `/api/admin/change-password` | Change password | **Full JWT** |

### User APIs
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/user/signup` | Create user account | No |
| POST | `/api/user/login` | User login | No |
| POST | `/api/user/logout` | Logout | **JWT** |
| POST | `/api/user/forgot-password` | Request password reset | No |
| POST | `/api/user/reset-password` | Reset password | No |
| POST | `/api/user/change-password` | Change password | **JWT** |

## 🗄️ Database Schemas

### Super Admin Schema
```javascript
{
  fullName: String (required),
  email: String (required, unique, lowercase, indexed),
  passwordHash: String (required, bcrypt hashed),
  role: String (enum: ['super_admin'], default: 'super_admin'),
  isActive: Boolean (default: true),
  passwordResetToken: String,
  passwordResetExpires: Date,
  timestamps: true
}
```

### Admin Schema
```javascript
{
  fullName: String (required),
  email: String (required, unique, lowercase, indexed),
  passwordHash: String (required, bcrypt hashed),
  role: String (enum: ['admin'], default: 'admin'),
  isActive: Boolean (default: true),
  passwordResetToken: String,
  passwordResetExpires: Date,
  timestamps: true
}
```

### User Schema
```javascript
{
  firstName: String (required),
  lastName: String (required),
  email: String (required, unique, lowercase, indexed),
  address: {
    street: String (required),
    city: String (required),
    state: String (required),
    country: String (required),
    zipCode: String (required)
  },
  phone: String (required, validated format),
  passwordHash: String (required, bcrypt hashed),
  role: String (enum: ['user'], default: 'user'),
  isActive: Boolean (default: true),
  passwordResetToken: String,
  passwordResetExpires: Date,
  timestamps: true
}
```

## 🔒 Security Features

### JWT Token Structure
```javascript
{
  sub: "user_id_here",
  role: "user|admin|super_admin",
  iat: timestamp,
  exp: timestamp
}
```

### Password Requirements
- Minimum 8 characters
- Maximum 72 characters
- Hashed with bcrypt (10 salt rounds)

### Token Expiration
- **Default**: 7 days
- **Pre-auth tokens**: 1 hour
- **Reset tokens**: 10 minutes

### Error Handling
- **Clear error messages** for authentication issues
- **Specific feedback** for token problems
- **Security-conscious** responses (no information leakage)

## 🧪 Testing Examples

### Super Admin Flow
```bash
# 1. Get pre-auth token
curl -X GET http://localhost:3000/api/super-admin/pre-auth-token

# 2. Login with pre-auth token
curl -X POST http://localhost:3000/api/super-admin/login \
  -H "Authorization: Bearer <pre_auth_token>" \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "password123"}'

# 3. Use full access token for protected routes
curl -X POST http://localhost:3000/api/super-admin/logout \
  -H "Authorization: Bearer <full_access_token>"
```

### User Flow
```bash
# 1. Signup
curl -X POST http://localhost:3000/api/user/signup \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "address": {
      "street": "123 Main St",
      "city": "New York",
      "state": "NY",
      "country": "USA",
      "zipCode": "10001"
    },
    "phone": "+1234567890",
    "password": "password123"
  }'

# 2. Login
curl -X POST http://localhost:3000/api/user/login \
  -H "Content-Type: application/json" \
  -d '{"email": "john@example.com", "password": "password123"}'

# 3. Logout
curl -X POST http://localhost:3000/api/user/logout \
  -H "Authorization: Bearer <jwt_token>"
```

## 🔧 Configuration

### Environment Variables
| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `PORT` | Server port | 3000 | No |
| `MONGO_URI` | MongoDB connection string | mongodb://127.0.0.1:27017/lottery_db | No |
| `JWT_SECRET` | JWT signing secret | dev_default_change_me_please | Yes (production) |
| `JWT_EXPIRES_IN` | JWT expiration time | 7d | No |
| `NODE_ENV` | Environment mode | development | No |

### Development vs Production
- **Development**: Uses default JWT secret if not provided
- **Production**: Requires explicit JWT_SECRET configuration
- **Environment validation**: Validates all environment variables on startup

## 📖 Documentation Files

- **`docs/super-admin-auth.md`** - Complete Super Admin API documentation
- **`docs/admin-auth.md`** - Complete Admin API documentation  
- **`docs/user-auth.md`** - Complete User API documentation
- **`docs/authentication-flow.md`** - Authentication flow guide
- **`docs/env.example`** - Environment variables template

## 🚀 Deployment

### Production Checklist
1. Set `NODE_ENV=production`
2. Configure strong `JWT_SECRET`
3. Use production MongoDB instance
4. Set appropriate `JWT_EXPIRES_IN`
5. Configure reverse proxy (nginx)
6. Set up SSL/TLS certificates
7. Configure monitoring and logging

### Docker Support (Future)
- Dockerfile for containerized deployment
- Docker Compose for local development
- Kubernetes manifests for orchestration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For support and questions:
- Check the documentation in `/docs` folder
- Review the API examples in this README
- Check server logs for detailed error messages

## 🔄 Version History

- **v1.0.0** - Initial release with complete authentication system
  - Super Admin, Admin, and User authentication
  - Password management (forgot, reset, change)
  - JWT-based security with role-based access
  - Comprehensive API documentation
  - Input validation and error handling

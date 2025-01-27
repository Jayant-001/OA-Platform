# CodeClash - Online Coding Assessment Platform

## About The Project
A comprehensive platform for conducting coding assessments and competitions with real-time code execution, secure authentication, and anti-cheat measures.

### Architecture Overview


## Features

# Online Coding Assessment Platform - Core Features

### Admin Portal

#### Problem Management
- **Create/Edit Problems**: Comprehensive interface for creating coding problems with support for markdown formatting, multiple test cases, and custom validators
- **Test Cases**: Define input/output pairs with hidden test cases for thorough code validation
- **Resource Limits**: Set execution time limits and memory constraints per problem to ensure optimal performance

#### Contest Management
- **Contest Creation**: Schedule contests with customizable duration, problem sets, and participant limits
- **Participant Management**: Control user registration, view real-time participation stats, and manage access rights
- **Scoring Configuration**: Define scoring rules based on problem difficulty, submission time, and test case results

### User Platform

#### Contest Participation
- **Registration System**: Simple contest registration with email verification and role-based access
- **Code Submission**: Feature-rich code editor with syntax highlighting and multiple language support
- **Status Tracking**: Real-time submission status updates with detailed execution results
- **Language Support**: Support for popular programming languages (Python, Java, C++, JavaScript)

#### Anti-Cheat System
- **Tab Detection**: Monitors and logs tab switching attempts during contest participation
- **Activity Monitoring**: Tracks user actions and flags suspicious behavior patterns
- **Session Control**: Manages user sessions with automatic invalidation on violation detection

#### Leaderboard
- **Real-time Rankings**: Live updates of participant standings based on submission results
- **Score Tracking**: Detailed scoring history with problem-wise breakdown
- **Performance Analytics**: Metrics showing solving patterns and submission statistics

### Code Execution System

#### Secure Execution
- **Docker Isolation**: Each submission runs in an isolated container for security
- **Language Environments**: Pre-configured containers for each supported programming language
- **Resource Control**: Strict CPU and memory limits enforcement per submission

#### Queue Management
- **Job Processing**: Distributed queue system for handling multiple submissions efficiently
- **Load Distribution**: Smart distribution of execution jobs across worker nodes
- **Error Handling**: Robust error recovery and job retry mechanism for failed executions

## Technology Stack

### Frontend
- **React + TypeScript**
  - Component-based UI
  - Type-safe development
  - State management
- **Vite**
  - Fast development builds
  - Hot module replacement
  - Optimized production builds

### Backend
- **Node.js + Express**
  - RESTful API endpoints
  - Middleware support
  - Request handling
- **TypeScript**
  - Type safety
  - Enhanced IDE support
  - Better code organization

### Database & Caching
- **PostgreSQL**
  - User data storage
  - Contest information
  - Submission records
- **Redis**
  - Submission status caching
  - Session management
  - Real-time updates

### Queue System
- **BullMQ**
  - Job queue management
  - Worker communication
  - Event handling
  - Rate limiting

### Containerization
- **Docker**
  - Isolated code execution
  - Language-specific containers
  - Resource management
  - Security isolation

### Authentication
- **JWT**
  - Secure user sessions
  - Token-based auth
  - Role-based access

### Development Tools
- **pnpm**
  - Monorepo management
  - Dependency handling
- **Turbo**
  - Build system
  - Task running
  - Cache optimization

Would you like me to elaborate on any specific component or create detailed documentation for any feature?
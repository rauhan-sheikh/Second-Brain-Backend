# SecondBrain Backend

SecondBrain is a personal knowledge management application that allows users to collect, organize, and share various types of content such as articles, tweets, videos, books, and other resources. Think of it as your digital "second brain" where you can store and categorize information for easy retrieval and sharing.

This is the backend API for SecondBrain, built with Node.js, Express, and MongoDB.

## Features

- **Content Management**: Store and organize different types of content (articles, tweets, videos, books, other)
- **Content Filtering**: Filter content by type (article, tweet, video, book, other)
- **Brain Sharing**: Generate shareable links to publicly share your entire content collection
- **User Authentication**: Secure signup/signin with JWT tokens

## Tech Stack

### Backend

- **Node.js** with **Express.js** framework
- **TypeScript** for type safety
- **MongoDB** with **Mongoose** ODM
- **JWT** for authentication
- **bcrypt** for password hashing
- **Zod** for input validation
- **CORS**, **Helmet**, **Morgan** for security and logging

## API Endpoints

### Authentication

- `POST /api/v1/auth/signup` - User registration
- `POST /api/v1/auth/signin` - User login
- `POST /api/v1/auth/reset-password` - Password reset
- `GET /api/v1/auth/me` - Get current user info

### Content Management

- `POST /api/v1/content` - Create new content
- `GET /api/v1/content` - Get user's content
- `DELETE /api/v1/content` - Delete content

### Brain Sharing

- `GET /api/v1/brain` - Check sharing status
- `POST /api/v1/brain/share` - Enable/disable sharing
- `GET /api/v1/brain/:shareLink` - Get shared content

## Getting Started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Set up environment variables:
   Create a `.env` file with:

   ```
   MONGO_URI=mongodb://localhost:27017/secondbrain
   JWT_SECRET=your-super-secret-jwt-key
   PORT=3000
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Compile TypeScript
- `npm run start` - Start production server
- `npm run clean` - Remove build files
- `npm run typecheck` - Run TypeScript type checking

## Usage

1. **Sign Up**: Create a new account
2. **Add Content**: Click "Add Content" to create new entries
3. **Organize**: Use tags and content types to organize your knowledge
4. **Filter**: Use the sidebar to filter content by type
5. **Share**: Generate a shareable link to share your brain publicly

## Content Types

- **Article**: Blog posts, news articles, web pages
- **Tweet**: Twitter/X posts
- **Video**: YouTube videos and other video content
- **Book**: Books with links to Open Library or other sources
- **Other**: Any other type of content

## Future Enhancements

- Search functionality
- Content import from various sources
- Collaboration features
- Advanced tagging and categorization
- Export functionality

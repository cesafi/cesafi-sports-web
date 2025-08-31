# EditorJS Setup Guide

## Overview
The articles view page has been implemented with EditorJS integration and Cloudinary support for images. The implementation includes fallback functionality when EditorJS packages are not installed.

## Installation

To enable full EditorJS functionality, install the required packages:

```bash
npm install @editorjs/editorjs @editorjs/header @editorjs/list @editorjs/paragraph @editorjs/quote @editorjs/delimiter @editorjs/table @editorjs/warning @editorjs/code @editorjs/link @editorjs/embed @editorjs/simple-image
```

## Features Implemented

### 1. Article View Pages
- **Admin**: `/admin/articles/[id]`
- **Head Writer**: `/head-writer/articles/[id]`

### 2. Components Created
- `ArticleInfoCard` - Displays article metadata and status
- `ArticleStatusModal` - Manages article status and publication details
- `ArticleEditorCard` - Rich text editor with EditorJS integration

### 3. EditorJS Features
- **Rich Text Editing**: Headers, paragraphs, lists, quotes
- **Media Support**: Images with Cloudinary integration
- **Advanced Tools**: Tables, code blocks, embeds, links
- **Auto-save**: Content saves automatically every 30 seconds
- **Fallback Editor**: Simple textarea when EditorJS is not installed

### 4. Cloudinary Integration
- **Image Upload**: Custom image tool with Cloudinary service
- **Automatic Optimization**: Images are optimized for web
- **Folder Organization**: Images stored in 'articles' folder

### 5. Status Management
- **Status Types**: review, approved, published, revise, cancelled
- **Publication Control**: Manage publication dates
- **Workflow Support**: Different statuses for editorial workflow

## Usage

### Accessing Article Editor
1. Navigate to Articles list (Admin or Head Writer dashboard)
2. Click on any article to open the detail view
3. Use the editor to modify content
4. Click "Save Content" or wait for auto-save

### Managing Article Status
1. Click "Manage Status" button in the article info card
2. Update status, title, and publication date
3. Save changes

### Image Upload
1. In the editor, click the image tool
2. Select an image file
3. Image is automatically uploaded to Cloudinary
4. Optimized image is inserted into the content

## File Structure

```
src/
├── app/(protected)/
│   ├── admin/articles/[id]/page.tsx
│   └── head-writer/articles/[id]/page.tsx
├── components/admin/articles/
│   ├── article-info-card.tsx
│   ├── article-status-modal.tsx
│   ├── article-editor-card.tsx
│   └── index.ts
├── hooks/
│   └── use-article-details.ts
└── services/
    └── cloudinary.ts (already exists)
```

## Environment Variables

Ensure these Cloudinary environment variables are set:

```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## Database Schema

The implementation uses the existing articles table with these fields:
- `id` (string)
- `title` (string)
- `content` (JSON)
- `status` (enum: review, approved, published, revise, cancelled)
- `authored_by` (string)
- `cover_image_url` (string)
- `published_at` (timestamp)
- `created_at` (timestamp)
- `updated_at` (timestamp)

## Next Steps

1. Install EditorJS packages for full functionality
2. Test image upload with Cloudinary
3. Customize editor tools as needed
4. Add additional validation if required
5. Implement link preview endpoint for LinkTool (optional)

## Troubleshooting

### EditorJS Not Loading
- Ensure all packages are installed
- Check browser console for import errors
- Verify Next.js dynamic import configuration

### Image Upload Issues
- Verify Cloudinary environment variables
- Check network requests in browser dev tools
- Ensure Cloudinary service is properly configured

### Auto-save Not Working
- Check browser console for errors
- Verify article update API is working
- Ensure proper permissions for the user
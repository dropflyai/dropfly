# AI Content Creation Platform

A powerful content creation platform that automates the entire content workflow from RSS feeds to published social media posts using AI-powered generation.

## Features

- **Automated Content Generation**: RSS feeds → AI content creation → Media generation → Publishing
- **Review Dashboard**: Approve/reject content and media before publishing
- **AI Media Generation**: Multiple AI services (Flux Pro, Recraft V3, Higgsfield, Ideogram)
- **Multi-Platform Publishing**: Instagram, Facebook, LinkedIn via Ayrshare
- **n8n Workflow Automation**: Visual workflow builder for customization

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: n8n workflows (automation engine)
- **Database**: Airtable
- **AI Services**: Anthropic Claude, HuggingFace, Ideogram, Flux Pro, Recraft V3
- **Publishing**: Ayrshare API

## Prerequisites

- Node.js 18+ and npm
- n8n instance (cloud or self-hosted)
- Airtable account
- Ayrshare account (for social media publishing)
- API keys for AI services (HuggingFace, Ideogram, etc.)

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd content-dashboard
npm install
```

### 2. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your credentials:

```env
# Airtable Configuration
AIRTABLE_API_KEY=your_airtable_personal_access_token
AIRTABLE_BASE_ID=your_base_id
AIRTABLE_TABLE_ID=your_table_id

# n8n Configuration
N8N_API_URL=your_n8n_instance_url
N8N_API_KEY=your_n8n_api_key
RSS_WORKFLOW_ID=your_rss_workflow_id
MEDIA_WORKFLOW_ID=your_media_workflow_id
PUBLISH_WORKFLOW_ID=your_publish_workflow_id
PUBLISH_WEBHOOK_URL=your_publish_webhook_url

# Anthropic API
ANTHROPIC_API_KEY=your_anthropic_api_key
```

### 3. Setup Airtable

Create an Airtable base with a "Posts" table containing these fields:

- **Topic** (text) - Post topic/title
- **Content** (long text) - Post body content
- **Hashtags** (text) - Hashtags for the post
- **Post Format** (single select) - Carousel, Reel, etc.
- **Tone** (text) - Content tone
- **Status** (single select) - Draft, Ready for Review, Approved, Rejected, Published
- **Media Status** (single select) - Pending, Ready for Review, Approved, Rejected
- **Media URL** (url) - Generated media URL
- **Media Service** (text) - Which AI service generated the media
- **Rating** (number) - Quality rating
- **Performance Tags** (multiple select) - Tags for tracking
- **Revision Notes** (long text) - Notes for rejected content

Get your Airtable credentials:
- **API Key**: Go to https://airtable.com/account → Create Personal Access Token
- **Base ID**: Found in the URL when viewing your base (appXXXXXXXXXX)
- **Table ID**: Open Developer Tools → Network tab → Find API calls (tblXXXXXXXXXX)

### 4. Setup n8n Workflows

Import the n8n workflow files (if provided) or set up these workflows:

1. **RSS Workflow**: Fetches articles from RSS feeds and generates content
2. **Media Generation Workflow**: Creates images/videos for approved content
3. **Publishing Workflow**: Publishes approved content to social media

Configure each workflow with the required credentials for:
- Airtable
- HuggingFace
- Ideogram / Flux Pro / Recraft V3
- Ayrshare

Get workflow IDs from your n8n instance URLs.

### 5. Run the Dashboard

Development mode:

```bash
npm run dev
```

Production build:

```bash
npm run build
npm start
```

The dashboard will be available at http://localhost:3000

## Usage

### Brand Voice Management 🎨

**First, customize your brand voice** (http://localhost:3000/branding):

1. **Edit Company Info**: Name, location, tagline
2. **Define Brand Voice**: Core voice, essence, principles
3. **List Products**: Add/edit your product offerings
4. **Save Changes**: Version-controlled, auto-timestamped

All content generation will automatically use your brand configuration!

### Content Review Workflow

1. **View Posts**: The dashboard displays all posts from Airtable
2. **Filter Posts**: Use status filters (All, Ready for Review, Approved, etc.)
3. **Navigate**: Use arrow keys or Previous/Next buttons to move between posts
4. **Review Content**:
   - Click "Approve Content" to approve the text
   - Click "Reject Content" to reject with feedback
5. **Review Media**:
   - Once content is approved, media will be generated
   - Click "Approve Media" or "Reject Media" as needed
6. **Publish**: Approved content+media will be published automatically

### Trigger Workflows

- **Generate More Content**: Click "Trigger RSS Content Generation"
- **Generate Media**: Click "Trigger Media Generation" for approved posts
- **Publish Posts**: Click "Publish Now" to send to social media

## Project Structure

```
content-dashboard/
├── app/
│   ├── api/
│   │   ├── posts/          # API routes for Airtable operations
│   │   ├── brand-voice/    # Brand configuration API
│   │   ├── generate-content/ # AI content generation
│   │   └── trigger/        # Workflow triggers
│   ├── branding/           # Brand voice management page
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Main dashboard component
│   └── globals.css         # Global styles
├── config/
│   └── brand-voice.json    # Centralized brand configuration
├── lib/
│   └── brand-voice.ts      # Brand voice utilities
├── public/                 # Static assets
├── .env.local              # Environment variables (not committed)
├── .env.example            # Environment template
├── BRAND_VOICE_GUIDE.md    # Complete brand guide for reference
├── package.json            # Dependencies
└── README.md               # This file
```

## API Endpoints

- `GET /api/posts` - Fetch all posts from Airtable
- `PATCH /api/posts/[id]` - Update a post (approve, reject, etc.)
- `DELETE /api/posts/[id]` - Delete a post
- `POST /api/generate-media` - Trigger media generation workflow

## Keyboard Shortcuts

- **Right Arrow** / **D**: Next post
- **Left Arrow** / **A**: Previous post
- **Enter**: Approve current content
- **R**: Reject current content
- **M**: Approve media
- **X**: Reject media
- **Delete**: Delete current post

## Troubleshooting

### Posts not loading
- Check Airtable credentials in `.env.local`
- Verify Base ID and Table ID are correct
- Check browser console for API errors

### Workflows not triggering
- Verify n8n API URL and API Key
- Check workflow IDs are correct
- Ensure workflows are activated in n8n

### Media not generating
- Check AI service API keys in n8n workflows
- Verify media workflow is properly configured
- Check n8n execution logs for errors

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - feel free to use for personal or commercial projects

## Support

For issues or questions, please open a GitHub issue or contact the maintainers.

---

**Built with ❤️ using Next.js, n8n, and AI**

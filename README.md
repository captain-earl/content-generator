# Content Generator

AI-powered content generation tool that creates SEO-optimized blog posts, featured images, and social media snippets.

## Features

- **Blog Post Generation**: Creates 1,500+ word SEO-optimized blog posts
- **Meta Description**: Auto-generates compelling meta descriptions
- **Featured Images**: AI-generated featured images using Pollinations
- **Social Media Snippets**: Twitter threads and LinkedIn posts
- **SuperMemory Integration**: Automatically stores generated content

## Tech Stack

- Next.js 15
- TypeScript
- Tailwind CSS
- Kimi API (content generation)
- Pollinations AI (image generation)
- SuperMemory (content storage)

## Live Demo

https://content-generator-cg8smuoj0-earls-projects-b703942d.vercel.app

## Setup

1. Clone the repository:
```bash
git clone https://github.com/captain-earl/content-generator.git
cd content-generator
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables in Vercel:
```
KIMI_API_KEY=your_kimi_api_key
SUPERMEMORY_API_KEY=your_supermemory_key
```

4. Deploy to Vercel:
```bash
vercel --prod
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `KIMI_API_KEY` | Kimi AI API key for content generation | Yes |
| `SUPERMEMORY_API_KEY` | SuperMemory API key for storage | No |

## Usage

1. Enter your blog topic
2. Add keywords (comma-separated)
3. Select tone (professional, casual, friendly, authoritative)
4. Click "Generate Content"
5. Download results as Markdown or copy individual sections

## API

### POST /api/generate

Generate content for a topic.

**Request:**
```json
{
  "topic": "HVAC Maintenance Tips",
  "keywords": "HVAC, maintenance, air conditioning, heating",
  "tone": "professional"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "topic": "...",
    "blogPost": "...",
    "metaDescription": "...",
    "featuredImage": "...",
    "socialSnippets": {
      "twitterThread": ["..."],
      "linkedinPost": "..."
    }
  }
}
```

## License

MIT

import { NextRequest, NextResponse } from 'next/server';

const KIMI_API_URL = 'https://api.moonshot.cn/v1/chat/completions';
const SUPERMEMORY_API_URL = 'https://api.supermemory.ai/v1';

export async function POST(req: NextRequest) {
  try {
    const { topic, keywords, tone = 'professional' } = await req.json();

    if (!topic || !keywords) {
      return NextResponse.json(
        { error: 'Topic and keywords are required' },
        { status: 400 }
      );
    }

    const kimiApiKey = process.env.KIMI_API_KEY;
    if (!kimiApiKey) {
      return NextResponse.json(
        { error: 'Kimi API key not configured' },
        { status: 500 }
      );
    }

    // Generate blog post
    const blogPost = await generateBlogPost(topic, keywords, tone, kimiApiKey);
    
    // Generate meta description
    const metaDescription = await generateMetaDescription(blogPost, keywords, kimiApiKey);
    
    // Generate social media snippets
    const socialSnippets = await generateSocialSnippets(topic, blogPost, keywords, kimiApiKey);
    
    // Generate image prompt
    const imagePrompt = await generateImagePrompt(topic, keywords, kimiApiKey);

    // Generate featured image URL (using Pollinations AI - free)
    const featuredImage = `https://image.pollinations.ai/prompt/${encodeURIComponent(imagePrompt)}?width=1200&height=630&nologo=true`;

    // Store in SuperMemory
    const supermemoryResult = await storeInSuperMemory({
      topic,
      keywords,
      blogPost,
      metaDescription,
      socialSnippets,
      featuredImage,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      data: {
        topic,
        keywords,
        blogPost,
        metaDescription,
        socialSnippets,
        featuredImage,
        imagePrompt,
        supermemoryId: supermemoryResult?.id || null,
      },
    });
  } catch (error) {
    console.error('Content generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate content', details: (error as Error).message },
      { status: 500 }
    );
  }
}

async function generateBlogPost(topic: string, keywords: string, tone: string, apiKey: string) {
  const prompt = `Write a comprehensive, SEO-optimized blog post about "${topic}".

Keywords to include naturally: ${keywords}

Requirements:
- Minimum 1,500 words
- Use proper HTML formatting with h2 and h3 tags
- Include an engaging introduction
- Break content into clear sections with subheadings
- Include a compelling conclusion
- Tone: ${tone}
- Include practical tips and actionable advice
- Use bullet points and numbered lists where appropriate
- Include a FAQ section at the end

Write the full blog post now:`;

  const response = await fetch(KIMI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'kimi-k2-0711-preview',
      messages: [
        {
          role: 'system',
          content: 'You are an expert content writer and SEO specialist. Write engaging, well-researched blog posts that rank well in search engines.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 4000,
    }),
  });

  if (!response.ok) {
    throw new Error(`Kimi API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

async function generateMetaDescription(blogPost: string, keywords: string, apiKey: string) {
  const prompt = `Create an SEO-optimized meta description (150-160 characters) for this blog post.

Blog post excerpt: ${blogPost.slice(0, 500)}...

Keywords: ${keywords}

Write only the meta description, nothing else:`;

  const response = await fetch(KIMI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'kimi-k2-0711-preview',
      messages: [
        {
          role: 'system',
          content: 'You are an SEO expert. Write compelling meta descriptions that drive clicks.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.5,
      max_tokens: 200,
    }),
  });

  const data = await response.json();
  return data.choices[0].message.content.trim();
}

async function generateSocialSnippets(topic: string, blogPost: string, keywords: string, apiKey: string) {
  const prompt = `Create social media snippets for this blog post.

Topic: ${topic}
Keywords: ${keywords}
Blog summary: ${blogPost.slice(0, 800)}...

Create:
1. A Twitter/X thread (5-7 tweets, each under 280 characters)
2. A LinkedIn post (professional tone, 150-200 words)

Format as JSON with keys "twitterThread" (array of strings) and "linkedinPost" (string):`;

  const response = await fetch(KIMI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'kimi-k2-0711-preview',
      messages: [
        {
          role: 'system',
          content: 'You are a social media expert. Create engaging, shareable content.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.8,
      max_tokens: 1500,
    }),
  });

  const data = await response.json();
  const content = data.choices[0].message.content;
  
  // Try to parse JSON, fallback to raw content if fails
  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch {
    // Return raw content if parsing fails
  }
  
  return {
    twitterThread: [content.slice(0, 280)],
    linkedinPost: content,
  };
}

async function generateImagePrompt(topic: string, keywords: string, apiKey: string) {
  const prompt = `Create a detailed image generation prompt for a blog featured image about: ${topic}

Keywords: ${keywords}

Requirements:
- Professional, modern style
- Suitable for a blog header (16:9 aspect ratio)
- No text in the image
- Describe colors, composition, and mood

Write only the image prompt:`;

  const response = await fetch(KIMI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'kimi-k2-0711-preview',
      messages: [
        {
          role: 'system',
          content: 'You are an expert at creating image generation prompts.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 300,
    }),
  });

  const data = await response.json();
  return data.choices[0].message.content.trim();
}

async function storeInSuperMemory(content: any) {
  const apiKey = process.env.SUPERMEMORY_API_KEY;
  if (!apiKey) {
    console.warn('SuperMemory API key not configured');
    return null;
  }

  try {
    const response = await fetch(`${SUPERMEMORY_API_URL}/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        content: JSON.stringify(content),
        metadata: {
          type: 'blog_post',
          topic: content.topic,
          keywords: content.keywords,
          createdAt: content.createdAt,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`SuperMemory API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('SuperMemory storage error:', error);
    return null;
  }
}

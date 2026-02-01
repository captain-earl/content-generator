import { NextRequest, NextResponse } from 'next/server';

const KIMI_API_URL = 'https://api.moonshot.cn/v1/chat/completions';
const SUPERMEMORY_API_URL = 'https://api.supermemory.ai/v1';

// Demo mode - returns mock content when API keys aren't configured
const DEMO_MODE = !process.env.KIMI_API_KEY || process.env.KIMI_API_KEY === 'your_kimi_api_key_here';

export async function POST(req: NextRequest) {
  try {
    const { topic, keywords, tone = 'professional' } = await req.json();

    if (!topic || !keywords) {
      return NextResponse.json(
        { error: 'Topic and keywords are required' },
        { status: 400 }
      );
    }

    // Demo mode: return mock content
    if (DEMO_MODE) {
      console.log('Running in DEMO mode - no API keys configured');
      const demoContent = generateDemoContent(topic, keywords, tone);
      return NextResponse.json({
        success: true,
        demo: true,
        data: demoContent,
      });
    }

    const kimiApiKey = process.env.KIMI_API_KEY;

    // Generate blog post
    const blogPost = await generateBlogPost(topic, keywords, tone, kimiApiKey!);
    
    // Generate meta description
    const metaDescription = await generateMetaDescription(blogPost, keywords, kimiApiKey!);
    
    // Generate social media snippets
    const socialSnippets = await generateSocialSnippets(topic, blogPost, keywords, kimiApiKey!);
    
    // Generate image prompt
    const imagePrompt = await generateImagePrompt(topic, keywords, kimiApiKey!);

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

function generateDemoContent(topic: string, keywords: string, tone: string) {
  const keywordList = keywords.split(',').map(k => k.trim());
  
  return {
    topic,
    keywords,
    blogPost: generateDemoBlogPost(topic, keywordList, tone),
    metaDescription: `Learn everything about ${topic} with expert tips on ${keywordList.slice(0, 2).join(' and ')}. Complete guide for 2026.`,
    socialSnippets: {
      twitterThread: generateDemoTwitterThread(topic, keywordList),
      linkedinPost: generateDemoLinkedInPost(topic, keywordList),
    },
    featuredImage: `https://image.pollinations.ai/prompt/${encodeURIComponent(`Professional blog header image about ${topic}, modern design, clean, minimalist, high quality`)}?width=1200&height=630&nologo=true`,
    imagePrompt: `Professional blog header image about ${topic}, modern design, clean, minimalist, high quality`,
    supermemoryId: null,
  };
}

function generateDemoBlogPost(topic: string, keywords: string[], tone: string): string {
  const toneIntro = {
    professional: 'In today\'s competitive landscape,',
    casual: 'Hey there! So,',
    friendly: 'Welcome! Let\'s talk about',
    authoritative: 'Based on extensive research and industry expertise,'
  }[tone] || 'In this comprehensive guide,';

  return `<h2>Introduction to ${topic}</h2>
<p>${toneIntro} understanding ${topic} is essential for success. Whether you're just getting started or looking to refine your approach, this guide covers everything you need to know about ${keywords.slice(0, 3).join(', ')}, and more.</p>

<h2>Why ${topic} Matters</h2>
<p>${topic} has become increasingly important in recent years. With the rise of digital transformation and changing consumer behaviors, mastering ${keywords[0] || 'the fundamentals'} can give you a significant competitive advantage.</p>

<h3>Key Benefits</h3>
<ul>
<li>Improved efficiency and productivity</li>
<li>Better results and ROI</li>
<li>Enhanced customer satisfaction</li>
<li>Competitive market positioning</li>
</ul>

<h2>Getting Started with ${topic}</h2>
<p>Starting your journey with ${topic} doesn't have to be complicated. Here are the essential steps to begin:</p>

<h3>Step 1: Research and Planning</h3>
<p>Before diving in, take time to understand your specific needs related to ${keywords[1] || 'the topic'}. This foundational work will save you time and resources down the road.</p>

<h3>Step 2: Implementation</h3>
<p>Once you have a clear plan, begin implementing the core strategies. Focus on ${keywords[2] || 'best practices'} to ensure you're building on solid ground.</p>

<h3>Step 3: Optimization</h3>
<p>Continuous improvement is key. Regularly review your approach to ${topic} and make adjustments based on results and feedback.</p>

<h2>Best Practices for ${topic}</h2>
<p>To maximize your success with ${topic}, follow these proven strategies:</p>

<ol>
<li><strong>Stay Consistent:</strong> Regular effort yields better results than sporadic attempts.</li>
<li><strong>Monitor Progress:</strong> Track key metrics to understand what's working.</li>
<li><strong>Adapt and Evolve:</strong> Be willing to adjust your approach as circumstances change.</li>
<li><strong>Learn Continuously:</strong> The landscape around ${topic} is always evolving.</li>
</ol>

<h2>Common Mistakes to Avoid</h2>
<p>Even experienced practitioners can fall into these traps:</p>
<ul>
<li>Neglecting ${keywords[0] || 'fundamentals'}</li>
<li>Overcomplicating simple processes</li>
<li>Ignoring feedback and data</li>
<li>Failing to plan for the long term</li>
</ul>

<h2>Advanced Strategies</h2>
<p>Once you've mastered the basics, consider these advanced techniques:</p>
<p>Integration of ${keywords.slice(0, 2).join(' and ')} can create powerful synergies. Look for opportunities to combine different approaches for maximum impact. Stay informed about emerging trends and technologies that could affect your strategy.</p>

<h2>Measuring Success</h2>
<p>Establish clear KPIs related to ${topic}:</p>
<ul>
<li>Performance metrics</li>
<li>Quality indicators</li>
<li>Efficiency measurements</li>
<li>ROI calculations</li>
</ul>

<h2>FAQ</h2>
<p><strong>Q: How long does it take to see results with ${topic}?</strong><br/>
A: Results vary, but most see initial improvements within 30-60 days with consistent effort.</p>

<p><strong>Q: Do I need special tools for ${topic}?</strong><br/>
A: While basic approaches work, specialized tools for ${keywords[0] || 'the topic'} can significantly enhance your results.</p>

<p><strong>Q: Can ${topic} work for small businesses?</strong><br/>
A: Absolutely! The principles apply regardless of organization size.</p>

<h2>Conclusion</h2>
<p>${topic} offers tremendous opportunities for those willing to invest the time and effort. By following the strategies outlined in this guide and focusing on ${keywords.slice(0, 2).join(' and ')}, you'll be well-positioned for success.</p>

<p>Remember, the key is to start today and remain consistent. Every step you take brings you closer to mastering ${topic}.</p>`;
}

function generateDemoTwitterThread(topic: string, keywords: string[]): string[] {
  return [
    `🧵 Thread: Everything you need to know about ${topic}\n\nA comprehensive guide to mastering ${keywords[0] || 'the essentials'} 🚀`,
    `1/ Why ${topic} matters now more than ever:\n\nThe landscape has changed dramatically. Those who adapt quickly will thrive. Those who don't... won't. 📈`,
    `2/ The fundamentals of ${keywords[0] || 'success'}:\n\n• Consistency beats intensity\n• Data drives decisions\n• Relationships matter\n• Always be learning`,
    `3/ Common mistakes to avoid:\n\n❌ Overcomplicating things\n❌ Ignoring feedback\n❌ Short-term thinking\n❌ Going it alone`,
    `4/ Quick wins you can implement today:\n\n✅ Audit your current approach\n✅ Set clear goals\n✅ Find a mentor\n✅ Track your progress`,
    `5/ The future of ${topic}:\n\nWe're seeing rapid innovation in ${keywords.slice(0, 2).join(' and ')}. Stay ahead by staying curious. 🔮`,
    `That's a wrap! If you found this thread helpful:\n\n→ Follow for more insights\n→ RT to share with others\n→ Reply with your biggest takeaway\n\nWhat topic should I cover next? 👇`
  ];
}

function generateDemoLinkedInPost(topic: string, keywords: string[]): string {
  return `I just published a comprehensive guide on ${topic}.

After working with dozens of clients on ${keywords.slice(0, 2).join(' and ')}, I've identified the key patterns that separate those who succeed from those who struggle.

Here are 5 insights that might change how you think about ${topic}:

1️⃣ Strategy beats tactics - Having a clear roadmap is more valuable than any single technique

2️⃣ Consistency compounds - Small daily actions create massive results over time

3️⃣ Data tells the truth - Trust metrics over intuition

4️⃣ Relationships amplify - The right connections can 10x your impact

5️⃣ Adaptation is survival - What worked yesterday may not work tomorrow

The full guide covers everything from getting started to advanced strategies. Whether you're new to ${topic} or looking to level up, there's something valuable for you.

What's your biggest challenge with ${keywords[0] || 'this topic'}? Let's discuss in the comments.

#${keywords[0]?.replace(/\s+/g, '') || 'Strategy'} #${keywords[1]?.replace(/\s+/g, '') || 'Leadership'} #${topic.replace(/\s+/g, '')}`;
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

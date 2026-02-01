'use client';

import { useState } from 'react';
import { 
  Sparkles, 
  FileText, 
  Image as ImageIcon, 
  Share2, 
  Copy, 
  Check, 
  Loader2,
  Download,
  RefreshCw,
  Layout
} from 'lucide-react';

interface GeneratedContent {
  topic: string;
  keywords: string;
  blogPost: string;
  metaDescription: string;
  socialSnippets: {
    twitterThread: string[];
    linkedinPost: string;
  };
  featuredImage: string;
  imagePrompt: string;
  supermemoryId: string | null;
}

export default function Home() {
  const [topic, setTopic] = useState('');
  const [keywords, setKeywords] = useState('');
  const [tone, setTone] = useState('professional');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GeneratedContent | null>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState<string>('');

  const handleGenerate = async () => {
    if (!topic || !keywords) {
      setError('Please enter both topic and keywords');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, keywords, tone }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate content');
      }

      setResult(data.data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(''), 2000);
  };

  const downloadContent = () => {
    if (!result) return;
    
    const content = `# ${result.topic}

## Meta Description
${result.metaDescription}

## Keywords
${result.keywords}

## Featured Image
${result.featuredImage}

## Blog Post
${result.blogPost}

## Twitter Thread
${result.socialSnippets.twitterThread.map((t, i) => `${i + 1}. ${t}`).join('\n\n')}

## LinkedIn Post
${result.socialSnippets.linkedinPost}
`;

    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${result.topic.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="w-10 h-10 text-yellow-400" />
            <h1 className="text-4xl md:text-5xl font-bold text-white">
              Content Generator
            </h1>
          </div>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Generate SEO-optimized blog posts, featured images, and social media snippets in seconds.
            Powered by Kimi AI.
          </p>
        </div>

        {/* Input Form */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 md:p-8 border border-white/20">
            <div className="space-y-6">
              <div>
                <label className="block text-white font-medium mb-2">
                  <FileText className="inline w-4 h-4 mr-2" />
                  Blog Topic
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., HVAC Maintenance Tips for Homeowners"
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-white font-medium mb-2">
                  <Layout className="inline w-4 h-4 mr-2" />
                  Keywords (comma-separated)
                </label>
                <input
                  type="text"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  placeholder="e.g., HVAC maintenance, air conditioning, heating system, home care"
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-white font-medium mb-2">Tone</label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="professional" className="bg-slate-800">Professional</option>
                  <option value="casual" className="bg-slate-800">Casual</option>
                  <option value="friendly" className="bg-slate-800">Friendly</option>
                  <option value="authoritative" className="bg-slate-800">Authoritative</option>
                </select>
              </div>

              {error && (
                <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-red-200">
                  {error}
                </div>
              )}

              <button
                onClick={handleGenerate}
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating Content...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Generate Content
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Results */}
        {result && (
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Actions Bar */}
            <div className="flex flex-wrap gap-3 justify-end">
              <button
                onClick={downloadContent}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg flex items-center gap-2 transition-colors"
              >
                <Download className="w-4 h-4" />
                Download Markdown
              </button>
              <button
                onClick={() => {
                  setResult(null);
                  setTopic('');
                  setKeywords('');
                }}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg flex items-center gap-2 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                New Generation
              </button>
            </div>

            {/* Meta Description */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                  <Layout className="w-5 h-5 text-blue-400" />
                  Meta Description
                </h3>
                <button
                  onClick={() => copyToClipboard(result.metaDescription, 'meta')}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  {copied === 'meta' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-gray-400" />}
                </button>
              </div>
              <p className="text-gray-300">{result.metaDescription}</p>
            </div>

            {/* Featured Image */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-pink-400" />
                  Featured Image
                </h3>
                <button
                  onClick={() => copyToClipboard(result.featuredImage, 'image')}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  {copied === 'image' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-gray-400" />}
                </button>
              </div>
              <img
                src={result.featuredImage}
                alt="Featured"
                className="w-full max-w-2xl mx-auto rounded-lg shadow-2xl"
              />
              <p className="text-sm text-gray-400 mt-2 text-center">{result.imagePrompt}</p>
            </div>

            {/* Blog Post */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-green-400" />
                  Blog Post
                </h3>
                <button
                  onClick={() => copyToClipboard(result.blogPost, 'blog')}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  {copied === 'blog' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-gray-400" />}
                </button>
              </div>
              <div className="prose prose-invert max-w-none">
                <div dangerouslySetInnerHTML={{ __html: result.blogPost.replace(/\n/g, '<br/>') }} />
              </div>
            </div>

            {/* Social Media Snippets */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <h3 className="text-xl font-semibold text-white flex items-center gap-2 mb-4">
                <Share2 className="w-5 h-5 text-blue-400" />
                Social Media Snippets
              </h3>

              {/* Twitter Thread */}
              <div className="mb-6">
                <h4 className="text-lg font-medium text-white mb-3">Twitter/X Thread</h4>
                <div className="space-y-3">
                  {result.socialSnippets.twitterThread.map((tweet, index) => (
                    <div key={index} className="bg-black/30 rounded-lg p-4 relative group">
                      <p className="text-gray-300">{tweet}</p>
                      <button
                        onClick={() => copyToClipboard(tweet, `tweet-${index}`)}
                        className="absolute top-2 right-2 p-2 opacity-0 group-hover:opacity-100 hover:bg-white/10 rounded-lg transition-all"
                      >
                        {copied === `tweet-${index}` ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-gray-400" />}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* LinkedIn Post */}
              <div>
                <h4 className="text-lg font-medium text-white mb-3">LinkedIn Post</h4>
                <div className="bg-black/30 rounded-lg p-4 relative group">
                  <p className="text-gray-300 whitespace-pre-wrap">{result.socialSnippets.linkedinPost}</p>
                  <button
                    onClick={() => copyToClipboard(result.socialSnippets.linkedinPost, 'linkedin')}
                    className="absolute top-2 right-2 p-2 opacity-0 group-hover:opacity-100 hover:bg-white/10 rounded-lg transition-all"
                  >
                    {copied === 'linkedin' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-gray-400" />}
                  </button>
                </div>
              </div>
            </div>

            {result.supermemoryId && (
              <div className="text-center text-green-400 text-sm">
                ✓ Content stored in SuperMemory (ID: {result.supermemoryId})
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

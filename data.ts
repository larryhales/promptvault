import { Prompt, Category } from './types';

export const SAMPLE_PROMPTS: Prompt[] = [
  {
    id: '1',
    title: 'Luxury Listing Description',
    content: 'Write a captivating luxury real estate listing description for a 5-bedroom, 4-bath home in [NEIGHBORHOOD]. Highlight the open-concept chef\'s kitchen with Wolf appliances, the panoramic city views from the infinity pool, and the smart home integration. Tone: Sophisticated, exclusive, and inviting. Max 250 words.',
    description: 'Generate high-converting copy for high-end residential listings.',
    category: Category.MARKETING,
    tags: ['luxury', 'listing', 'copywriting'],
    author: 'TopAgent',
    likes: 156,
    copyCount: 42,
    createdAt: new Date().toISOString(),
    tools: [],
    testedModels: ['ChatGPT', 'Claude', 'Gemini'],
    youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' // Sample video
  },
  {
    id: '2',
    title: 'Modern Living Room Visualization',
    content: 'Generate a photorealistic image of a modern living room with floor-to-ceiling windows overlooking a sunset ocean view. Style: Minimalist interior design, neutral color palette with warm wood accents, low-profile furniture, ambient lighting. 4k resolution, architectural photography style.',
    description: 'Create staging inspiration images for empty listings.',
    category: Category.IMAGE_GENERATION,
    tags: ['staging', 'interior design', 'visualization'],
    author: 'DesignPro',
    likes: 89,
    copyCount: 15,
    createdAt: new Date().toISOString(),
    tools: ['Image Generation'],
    testedModels: ['Midjourney', 'Gemini']
  },
  {
    id: '3',
    title: 'Difficult Negotiation Script',
    content: 'Act as a master negotiator. I am representing the buyer. The home inspection revealed a damaged roof (est cost $15k). The seller has refused to offer credits. Write a script for a phone call to the listing agent to persuasively argue for a $10k credit without killing the deal. Focus on win-win outcomes.',
    description: 'Scripts for navigating tough transaction hurdles.',
    category: Category.TRANSACTIONS,
    tags: ['negotiation', 'scripts', 'objection handling'],
    author: 'CloserCoach',
    likes: 210,
    copyCount: 120,
    createdAt: new Date().toISOString(),
    tools: ['Reasoning'],
    testedModels: ['ChatGPT', 'Claude']
  },
  {
    id: '4',
    title: '30-Day Social Content Plan',
    instructions: 'Use this chain to generate a month of content. Execute Prompt 1 to get the themes, then Prompt 2 to write the actual captions.',
    content: 'Create a 4-week content calendar for a real estate agent focusing on "First Time Home Buyers". Week 1: Education. Week 2: Market Data. Week 3: Client Success Stories. Week 4: Local Community. Output a table with Day, Theme, and Content Idea.',
    content2: 'Based on the calendar above, write 3 Instagram captions for Week 1 (Education). Include engaging hooks, 3 value points, and a CTA. Add relevant hashtags.',
    description: 'A multi-step chain to build a full month of social media content.',
    category: Category.SOCIAL_MEDIA,
    tags: ['social media', 'planning', 'instagram', 'chain'],
    author: 'SocialNinja',
    likes: 342,
    copyCount: 500,
    createdAt: new Date().toISOString(),
    tools: ['Web Search'],
    testedModels: ['ChatGPT', 'Perplexity', 'Grok']
  }
];
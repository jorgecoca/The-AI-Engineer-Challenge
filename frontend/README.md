# AI Chat Interface

A modern chat interface built with Next.js that integrates with an AI backend.

## Features

- Real-time streaming chat responses
- Modern, responsive UI with a warm color scheme
- Smooth animations and transitions
- Error handling and loading states

## Prerequisites

- Node.js 18.x or later
- npm or yarn
- OpenAI API key

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env.local` file in the root directory and add your OpenAI API key:
```
NEXT_PUBLIC_OPENAI_API_KEY=your_openai_api_key_here
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Development

The application is built with:
- Next.js 14
- TypeScript
- Tailwind CSS
- Heroicons

## API Integration

The frontend communicates with a FastAPI backend running on `http://localhost:8000`. Make sure the backend server is running before using the chat interface.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

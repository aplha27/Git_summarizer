# GitGrade 🚀

**AI-Powered Repository Profiler** - Transform any GitHub repository into a meaningful score, summary, and personalized roadmap.

## 🎯 Problem Statement

In today's tech world, a GitHub repository is a developer's tangible work, but most students don't know how good, clean, or complete their code looks to a recruiter or mentor. GitGrade solves this by providing instant, AI-powered analysis of any public GitHub repository.

## ✨ Features

- **Comprehensive Analysis**: Evaluates code quality, structure, documentation, testing, and Git practices
- **AI-Powered Scoring**: Uses Google Gemini 2.0 Flash for intelligent repository assessment
- **Detailed Feedback**: Provides strengths, weaknesses, and actionable improvement roadmaps
- **Roast Mode**: Get brutally honest (but funny) feedback about your code
- **Beautiful UI**: Modern, responsive interface with animated score visualization

## 🛠 Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Animations**: Framer Motion
- **AI**: Google Gemini 2.0 Flash API
- **GitHub Integration**: Octokit
- **Icons**: Lucide React

## 🚀 Getting Started

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd gitgrade
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file:
   ```env
   GITHUB_ACCESS_TOKEN=your_github_token_here
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open [http://localhost:3000](http://localhost:3000)** in your browser

## 🔑 API Keys Setup

### GitHub Token
1. Go to GitHub Settings → Developer settings → Personal access tokens
2. Generate a new token with `public_repo` scope
3. Add it to your `.env.local` file

### Gemini API Key
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add it to your `.env.local` file

## 📊 Analysis Criteria

GitGrade evaluates repositories on multiple dimensions:

- **Code Quality & Structure** (25 points): Clean code, architecture, file organization
- **Documentation** (20 points): README quality, code comments, API docs  
- **Testing & CI/CD** (20 points): Test coverage, automated workflows
- **Dependencies & Security** (15 points): Up-to-date dependencies, security practices
- **Git Practices** (10 points): Commit quality, branching, meaningful messages
- **Real-world Applicability** (10 points): Practical use case, completeness

## 🎨 Demo

Try the demo with popular repositories like:
- `https://github.com/facebook/react`
- `https://github.com/microsoft/vscode`
- `https://github.com/vercel/next.js`

## 🚀 Deployment

Deploy easily on Vercel:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/gitgrade)

## 📝 License

MIT License - feel free to use this project for your own hackathons and learning!

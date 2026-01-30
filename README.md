# Vestra - AI-Powered Personal Wardrobe Stylist 👗✨

Vestra is a modern, intelligent fashion companion that helps you organize your wardrobe, discover new outfits, and pack smarter for your trips. Using advanced AI, it analyzes your personal style, skin tone, and local weather to provide daily outfit recommendations.

## 🚀 Key Features

- **📂 Digital Wardrobe**: Upload and categorize your clothes to create a searchable digital closet.
- **🤖 AI Outfit Generator**: Get personalized outfit suggestions based on your existing wardrobe and specific occasions (Casual, Business, Formal).
- **☀️ Weather-Smart OOTD**: Daily "Outfit of the Day" recommendations adapted to your local weather conditions and personal style.
- **🎨 Skin Tone Analysis**: Interactive quiz to determine your seasonal color palette (Spring, Summer, Autumn, Winter) and find colors that suit you best.
- **🧳 Smart Packing Lists**: Generate AI-curated packing lists for your trips based on destination weather, duration, and planned activities.
- **📊 Style Analytics**: Track your most worn items and identify wardrobe gaps.

## 🛠️ Tech Stack

- **Frontend**: [Next.js 16](https://nextjs.org/) (App Router), [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) & [Framer Motion](https://www.framer.com/motion/) for animations.
- **Backend & Auth**: [Supabase](https://supabase.com/) (PostgreSQL, Auth, Storage).
- **AI & Inference**:
  - [Groq SDK](https://groq.com/) (Llama models for fast inference).
  - [Hugging Face](https://huggingface.co/) (Image classification and analysis).

## 🏁 Getting Started

### Prerequisites

- Node.js 18+ installed.
- A [Supabase](https://supabase.com/) project (with Database and Storage buckets configured).
- API Keys for Groq (for AI outfit generation).

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/StartLord-22/vestra.git
   cd vestra
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env.local` file in the root directory and add your credentials:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   GROQ_API_KEY=your_groq_api_key
   HF_ACCESS_TOKEN=your_huggingface_token
   ```

4. **Run the development server:**

   ```bash
   npm run dev
   ```

5. **Open the app:**
   Visit [http://localhost:3000](http://localhost:3000) in your browser.

### Run with Docker

1. **Ensure Docker Desktop is running** (or any Docker Engine compatible environment).
2. **Build and start the stack:**

   ```bash
   docker compose up --build
   ```

   This uses the provided `Dockerfile` and `.dockerignore` to build the Next.js app image, runs migrations if configured, and starts all defined services.
3. **Stop the containers when done:**

   ```bash
   docker compose down
   ```

   Add `-v` if you also want to remove named volumes.

## 📂 Project Structure

- `src/app`: Next.js App Router pages (Dashboard, Wardrobe, Outfit, etc.).
- `src/components`: Reusable UI components using Tailwind CSS.
- `src/lib`: Core business logic, AI integrations, and Supabase clients.
- `src/lib/seasonColor`: Logic for color analysis and skin tone quizzes.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

---

_Built with ❤️ by Atul Rathore_

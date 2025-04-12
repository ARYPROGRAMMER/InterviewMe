# InterviewMe - AI-Powered Interview Prep Platform

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://interview-me-beta.vercel.app/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase-11-FFCA28?style=for-the-badge&logo=firebase)](https://firebase.google.com/)
[![MIT License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](./LICENSE)

A modern web application designed to help users prepare for technical interviews with AI-powered interview simulations and detailed feedback. Perfect for job seekers, coding bootcamp graduates, and professionals looking to advance their careers.

<div align="center">
  <a href="https://interview-me-beta.vercel.app/">
    <img src="public/logo.svg" alt="Interview Prep Platform" width="250" />
  </a>
  <br/>
  <b><a href="https://interview-me-beta.vercel.app/">📝 Try InterviewMe now!</a></b>
</div>

## 📋 Table of Contents

- [✨ Features](#-features)
- [🛠️ Tech Stack](#-tech-stack)
- [🚀 Getting Started](#-getting-started)
- [📁 Project Structure](#-project-structure)
- [📋 Usage Guide](#-usage-guide)
- [🔍 API Documentation](#-api-documentation)
- [🧩 Component Library](#-component-library)
- [⚠️ Troubleshooting](#-troubleshooting)
- [🗺️ Roadmap](#-roadmap)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)
- [🙏 Acknowledgments](#-acknowledgments)

## ✨ Features

- **🤖 AI-Powered Interviews**: Simulate real interview experiences with our advanced AI agent that adapts to your skill level
- **📊 Personalized Feedback**: Receive detailed feedback on your interview performance with actionable improvement suggestions
- **🧠 Technical Skills Assessment**: Get evaluated on technical knowledge, problem-solving abilities, communication skills, and cultural fit
- **📚 Interview History**: Track your progress and review past interview sessions with performance analytics
- **🔐 User Authentication**: Secure user accounts with Firebase authentication and role-based access control
- **📱 Responsive Design**: Fully functional on all devices from mobile to desktop with adaptive UI components
- **🌎 Multi-language Support**: Practice interviews in different languages to prepare for global opportunities
- **🧠 Industry-specific Questions**: Tailored interview scenarios for different tech sectors and roles

## 🛠️ Tech Stack

<div align="center">
  <table>
    <tr>
      <td align="center" width="96">
        <img src="https://skillicons.dev/icons?i=nextjs" width="48" height="48" alt="Next.js" />
        <br>Next.js
      </td>
      <td align="center" width="96">
        <img src="https://skillicons.dev/icons?i=react" width="48" height="48" alt="React" />
        <br>React
      </td>
      <td align="center" width="96">
        <img src="https://skillicons.dev/icons?i=ts" width="48" height="48" alt="TypeScript" />
        <br>TypeScript
      </td>
      <td align="center" width="96">
        <img src="https://skillicons.dev/icons?i=tailwind" width="48" height="48" alt="Tailwind" />
        <br>Tailwind
      </td>
      <td align="center" width="96">
        <img src="https://skillicons.dev/icons?i=firebase" width="48" height="48" alt="Firebase" />
        <br>Firebase
      </td>
      <td align="center" width="96">
        <img src="https://skillicons.dev/icons?i=vercel" width="48" height="48" alt="Vercel" />
        <br>Vercel
      </td>
    </tr>
  </table>
</div>

### Core Technologies

- **Frontend**: Next.js 15, React 19, TypeScript 5
- **Styling**: TailwindCSS 4, Class Variance Authority, shadcn/ui
- **State Management**: React Context, Server Components
- **Authentication**: Firebase Authentication with custom claims
- **Database**: Firebase Firestore with optimized queries
- **AI Integration**: AI SDK, VAPI AI with streaming responses
- **Form Handling**: React Hook Form, Zod validation
- **UI Components**: Radix UI primitives with custom styling
- **Deployment**: [Vercel](https://interview-me-beta.vercel.app/) with Edge Functions

## 🚀 Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm, yarn, or pnpm package manager
- Firebase account for authentication and database
- VAPI AI account for interview simulation API access

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/ARYPROGRAMMER/InterviewMe
   cd InterviewMe
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up Firebase**

   - Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication with Email/Password and Google providers
   - Create a Firestore database in production mode
   - Set up Firebase Admin SDK credentials

4. **Configure environment variables**

   Create a `.env.local` file in the root directory with your credentials:

   ```
   # Firebase
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

   # Firebase Admin
   FIREBASE_ADMIN_PROJECT_ID=your_project_id
   FIREBASE_ADMIN_CLIENT_EMAIL=your_client_email
   FIREBASE_ADMIN_PRIVATE_KEY=your_private_key

   # VAPI AI
   NEXT_PUBLIC_VAPI_API_KEY=your_vapi_key

   # Optional: Google AI for enhanced features
   GOOGLE_API_KEY=your_google_api_key
   ```

4. Run the development server

   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the application

## 📁 Project Structure

```
app/                 # Next.js app router
  (auth)/            # Authentication routes
  (root)/            # Main application routes
    interview/       # Interview simulation
      [id]/          # Individual interview session
        feedback/    # Interview feedback
components/          # React components
  ui/                # UI components (buttons, forms, etc.)
constants/           # Application constants
firebase/            # Firebase configuration
lib/                 # Utility functions and actions
  actions/           # Server actions
public/              # Static assets
types/               # TypeScript type definitions
```

## 📋 Usage

1. Create an account or sign in with your credentials
2. Select a new interview from the dashboard
3. Choose your interview settings (experience level, technologies)
4. Start the interview session with the AI interviewer
5. After completing the interview, you'll receive detailed feedback on your performance
6. Review your interview history and track your improvement over time

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style and naming conventions
- Write tests for new features or bug fixes
- Update documentation for any changed functionality
- Reference relevant issues in your pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 🙏 Acknowledgments

- Next.js team for the incredible framework
- Vercel for the deployment platform
- Firebase for authentication and database services
- VAPI AI for the interview simulation capabilities
- shadcn/ui for the component library foundation
- All contributors are appreciated - till now only ME

---

<div align="center">
  <p>
    <a href="https://interview-me-beta.vercel.app/">Website</a> •
    <a href="https://github.com/ARYPROGRAMMER/InterviewMe">GitHub</a> •
  </p>
</div>

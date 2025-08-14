# Guidely: AI-Powered Study Assistant

Guidely is an intelligent web application designed to revolutionize your study process. It leverages AI to help you generate study materials from your content and create personalized study plans based on your material, available time, and deadlines.

## Features

- **Material Generation:** Upload your study content (PDF or TXT) and generate summaries, flashcards, quizzes, or outlines.
- **AI-Powered Study Planning:** Get a comprehensive study plan tailored to your material, the number of days you have to prepare, and your daily study hours.
- **PDF Export:** Export your generated study materials as PDF files for offline access.
- **Responsive Design:** Enjoy a seamless experience across various devices.
- **Intuitive UI:** A clean and user-friendly interface built with React and Tailwind CSS.

## Technologies Used

**Frontend:**
- React.js
- Tailwind CSS
- Lucide React (Icons)
- React Router DOM (for navigation)
- React Markdown (for rendering AI output)
- html2pdf.js (for PDF export)

**Backend:**
- Node.js
- Express.js
- Multer (for file uploads)
- Dotenv (for environment variables)
- OpenAI SDK (configured with OpenRouter.ai)
- pdf-parse (for PDF text extraction)

**AI Integration:**
- **OpenRouter.ai:** Used as a unified API gateway to various Large Language Models (LLMs).
- **Anthropic Claude 3 Haiku:** The primary AI model used for generating study materials and plans, accessed via OpenRouter.ai.

## Getting Started

Follow these instructions to set up and run Guidely locally on your machine.

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or Yarn
- Git

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd studymate
    ```

2.  **Install Backend Dependencies:**
    ```bash
    cd backend
    npm install # or yarn install
    cd ..
    ```

3.  **Install Frontend Dependencies:**
    ```bash
    cd frontend
    npm install # or yarn install
    cd ..
    ```

### Environment Variables

Create `.env` files in both your `backend/` and `frontend/` directories.

**`backend/.env`:**

```
OPENROUTER_API_KEY=YOUR_OPENROUTER_API_KEY
PORT=5002
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

*   Replace `YOUR_OPENROUTER_API_KEY` with your actual API key obtained from [OpenRouter.ai](https://openrouter.ai/).

**`frontend/.env`:**

```
# No specific environment variables needed for local development proxy
# For production deployment, you might add REACT_APP_BACKEND_URL here
```

### Running Locally

1.  **Start the Backend Server:**
    ```bash
    cd backend
    npm start # or yarn start
    ```
    The backend API will run on `http://localhost:5002`.

2.  **Start the Frontend Development Server:**
    ```bash
    cd frontend
    npm start # or yarn start
    ```
    The frontend application will open in your browser at `http://localhost:3000`.

## Deployment

This project is structured as a monorepo, allowing independent deployment of the frontend and backend.

### Frontend Deployment (Netlify)

1.  **Host your repository on GitHub/GitLab/Bitbucket.**
2.  **Log in to Netlify** ([app.netlify.com](https://app.netlify.com/)).
3.  **Add new site** and connect to your Git repository.
4.  **Configure build settings:**
    *   **Base directory:** `frontend/`
    *   **Build command:** `npm run build`
    *   **Publish directory:** `frontend/build`
5.  **Environment Variables:** If deploying to production, you'll need to set `REACT_APP_BACKEND_URL` in Netlify's build settings to the URL of your deployed backend API.

### Backend Deployment (Render)

1.  **Host your repository on GitHub/GitLab/Bitbucket.**
2.  **Log in to Render** ([dashboard.render.com](https://dashboard.render.com/)).
3.  **Create a new Web Service** and connect to your Git repository.
4.  **Configure service settings:**
    *   **Root Directory:** `backend/`
    *   **Build Command:** `npm install`
    *   **Start Command:** `npm start`
5.  **Environment Variables:** Set `OPENROUTER_API_KEY` (and any other backend-specific variables) in Render's environment settings.

## Contributing

Contributions are welcome! Please feel free to open issues or submit pull requests.

## License

This project is open-source and available under the MIT License.

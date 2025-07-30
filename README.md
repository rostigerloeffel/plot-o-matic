# Plot-O-Matic 🎮

**Plot-O-Matic** is an interactive web application for creating and playing AI-generated text adventures. With a user-friendly interface, you can create your own interactive stories using ChatGPT and share them with others.

## ✨ Features

- **🤖 AI-Powered Creation**: Create text adventures using ChatGPT with customizable settings
- **🎮 Interactive Gameplay**: Play your own and others' adventures in a chat-based interface
- **🏠 Room-Based Navigation**: Explore adventures organized by rooms with seamless transitions
- **💾 Local Storage**: All adventures are stored locally in the browser
- **📱 Responsive Design**: Consistent layout for all screen sizes
- **🎨 Modern UI**: Dark theme with appealing user interface
- **⚙️ Customizable Settings**: Configure difficulty, room count, game mechanics, and more

## 🚀 Live Demo

The application is live at: [https://rostigerloeffel.github.io/plot-o-matic/](https://rostigerloeffel.github.io/plot-o-matic/)

## 🛠️ Technology Stack

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: CSS3 with Flexbox and responsive design
- **AI Integration**: ChatGPT API (simulated for demo)
- **Deployment**: GitHub Pages with GitHub Actions

## 📦 Installation & Development

### Prerequisites

- Node.js (version 18 or higher)
- npm or yarn

### Local Development

1. **Clone repository**
   ```bash
   git clone https://github.com/rstelzma/plot-o-matic.git
   cd plot-o-matic
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open browser**
   Navigate to `http://localhost:5173`

### Production Build

```bash
npm run build
```

### Code Quality

```bash
npm run lint
```

## 🎮 Usage

### Playing Adventures

1. Open the application
2. Click on "Abenteuer spielen" tab
3. Select an adventure from the library
4. Use natural language to interact with the game
5. Navigate between rooms and solve puzzles

### Creating Adventures

1. Click on "Abenteuer erstellen" tab
2. Fill in the adventure settings:
   - **Szenario**: Describe the scenario (required)
   - **Schwierigkeitsgrad**: Choose difficulty level (easy/medium/hard)
   - **Räume**: Select number of rooms (few/medium/many)
   - **Spielmechaniken**: Enable/disable features like time system, player death, inventory puzzles, NPCs
   - **Stil**: Describe the desired style
3. Click "Abenteuer generieren" to create with ChatGPT
4. Review the generated adventure and save it

### Adventure Settings

- **Szenario**: The main scenario and setting of the adventure
- **Schwierigkeitsgrad**: Controls puzzle complexity and game mechanics
- **Räume**: Determines the size and scope of the adventure
- **Zeitsystem**: Optional time-based mechanics
- **Spieler kann sterben**: Enables death mechanics
- **Inventar-Rätsel**: Enables item collection and combination puzzles
- **NPCs**: Adds non-player characters to interact with
- **Stil**: Defines the narrative style and atmosphere

## 📁 Project Structure

```
plot-o-matic/
├── src/
│   ├── components/          # React components
│   │   ├── AdventureCreator.tsx   # Adventure creation interface
│   │   ├── AdventurePlayer.tsx    # Game player interface
│   │   └── AdventureLibrary.tsx   # Adventure library
│   ├── types.ts             # TypeScript definitions
│   ├── App.tsx              # Main component
│   ├── main.tsx             # Entry point
│   └── index.css            # Styles
├── .github/workflows/       # GitHub Actions
├── public/                  # Static files
└── dist/                    # Build output
```

## �� Configuration

### ChatGPT API Integration

The application uses the official OpenAI API directly from the frontend:

1. **Get OpenAI API Key**: Sign up at [OpenAI](https://platform.openai.com/) and get your API key
2. **Environment Variables**: Create a `.env.local` file in the project root:
   ```
   VITE_OPENAI_API_KEY=your_actual_api_key_here
   ```
3. **Start the Application**:
   ```bash
   npm run dev
   ```
   
   This will start the frontend at: http://localhost:5173

**Note**: The API key is used directly in the frontend. For production, consider using a proxy server to keep the API key secure.

### GitHub Pages Deployment

The project is configured for GitHub Pages:

1. **Repository Settings**: Enable GitHub Pages in repository settings
2. **Branch**: Select `gh-pages` as source
3. **Automatic Deployment**: GitHub Actions builds and deploys automatically on each push

### Vite Configuration

The `vite.config.ts` is optimized for GitHub Pages:

```typescript
export default defineConfig({
  plugins: [react()],
  base: '/plot-o-matic/', // Adjust to your repository name
})
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Conventions

- **Components**: Maximum 200 lines per component
- **TypeScript**: Use strict typing
- **CSS**: Modular CSS classes
- **Commits**: English commit messages

## 📝 License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

## 🙏 Acknowledgments

- **React Team** for the amazing framework
- **Vite Team** for the fast build tool
- **OpenAI** for ChatGPT API
- **GitHub** for the free hosting platform

## 📞 Support

For questions or issues:

1. Create an [Issue](https://github.com/rstelzma/plot-o-matic/issues)
2. Describe the problem in detail
3. Add screenshots if relevant

---

**Have fun creating and playing AI-generated text adventures! 🎮✨**
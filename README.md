# Plot-O-Matic 🎮

**Plot-O-Matic** is an interactive web application for creating and playing text adventures. With a user-friendly interface, you can create your own interactive stories and share them with others.

## ✨ Features

- **🎯 Simple Editor**: Create text adventures with an intuitive visual editor
- **🎮 Interactive Gameplay**: Play your own and others' adventures
- **💾 Local Storage**: All adventures are stored locally in the browser
- **📱 Responsive Design**: Consistent Flexbox layout for all screen sizes
- **🎨 Modern UI**: Dark theme with appealing user interface
- **🔧 Conditions**: Create complex stories with conditional paths

## 🚀 Live Demo

The application is live at: [https://rostigerloeffel.github.io/plot-o-matic/](https://rostigerloeffel.github.io/plot-o-matic/)

## 🛠️ Technology Stack

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: CSS3 with Flexbox and responsive design
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
2. Select an adventure from the library
3. Click "Play"
4. Follow the story and make decisions

### Creating Adventures

1. Click "Create New Adventure"
2. Fill in basic information (title, description, author)
3. Create nodes for your story
4. Add choices to each node
5. Connect choices to other nodes
6. Mark end nodes as "End Node"
7. Save your adventure

### In-Game Commands

- `inventory`: Shows your current inventory
- `set [variable] [value]`: Sets a game variable

## 📁 Project Structure

```
plot-o-matic/
├── src/
│   ├── components/          # React components
│   │   ├── GameEngine.tsx   # Game engine
│   │   ├── AdventureEditor.tsx # Adventure editor
│   │   └── AdventureLibrary.tsx # Library
│   ├── types.ts             # TypeScript definitions
│   ├── App.tsx              # Main component
│   ├── main.tsx             # Entry point
│   └── index.css            # Styles
├── .github/workflows/       # GitHub Actions
├── public/                  # Static files
└── dist/                    # Build output
```

## 🔧 Configuration

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
- **GitHub** for the free hosting platform

## 📞 Support

For questions or issues:

1. Create an [Issue](https://github.com/rstelzma/plot-o-matic/issues)
2. Describe the problem in detail
3. Add screenshots if relevant

---

**Have fun creating and playing text adventures! 🎮✨**
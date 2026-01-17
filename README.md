"# Sutradhar 🚀

Sutradhar is an innovative AI-powered platform designed to make computers accessible to everyone, regardless of physical abilities or technical expertise. Leveraging advanced biometric technologies, computer vision, and natural language processing, Sutradhar empowers users to interact with computers through facial recognition, hand gestures, voice commands, and more.

## 🌟 Unique Selling Points (USPs)

- **Inclusive Accessibility**: Designed specifically for users with disabilities, elderly individuals, and those new to technology
- **Multi-Modal Interaction**: Seamlessly combines voice, gesture, facial, and touch inputs for natural, intuitive interaction
- **AI-Powered Intelligence**: Advanced AI capabilities providing personalized assistance and adaptive learning
- **Hardware Integration**: Seamless integration with physical devices like ESP32 for enhanced control
- **Open-Source & Customizable**: Fully open-source codebase allowing community contributions and easy customization
- **Real-Time Processing**: Low-latency computer vision and AI processing for responsive user experience

## ✨ Features

- 🤖 **Jarvis AI Assistant**: Intelligent conversational AI for seamless interaction
- 👤 **Facial Recognition**: Advanced face detection and recognition capabilities
- ✋ **Hand Gesture Control**: Intuitive hand tracking for computer control
- 🎤 **Voice Features**: Speech recognition and text-to-speech functionality
- 🧠 **Biometric Authentication**: Secure access through facial and retinal features
- 📱 **Cross-Platform UI**: Modern React-based interface with responsive design
- 🔧 **System Integration**: Control system stats, launch apps, and more
- 🌐 **Web Services**: Integrated weather, news, calendar, and search functionalities
- 📄 **PDF Reader**: Built-in PDF reading capabilities
- 🎮 **Quiz Game**: Interactive quiz features for engagement
- 🔳 **AR Button**: Augmented Reality interactive buttons for immersive control
- 🧭 **Navigational Trigger**: Advanced navigation and action triggering system

## 🛠️ Tech Stack

- **Backend**: Python Flask with OpenCV, MediaPipe, Google Generative AI
- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **AI/ML**: Computer vision, speech recognition, NLP
- **Deployment**: Docker + Docker Compose
- **Hardware Integration**: ESP32 support for physical button interactions

## 📋 Prerequisites

- Docker and Docker Compose installed
- At least 4GB RAM recommended
- Webcam access for facial/hand recognition features
- Python 3.8+ (for local development)
- Node.js 16+ (for local development)

## 🚀 Getting Started

### Using Docker (Recommended)

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd sutradhar
   ```

2. **Start the application**:
   ```bash
   docker-compose up --build
   ```

3. **Access the application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

### Local Development

#### Backend Setup
```bash
cd backend
pip install -r requirements.txt
python server.py
```

#### Frontend Setup
```bash
cd my-app
npm install
npm run dev
```

#### Hardware Server (Optional)
For ESP32 integration:
```bash
python hardwareserver.py
```

## 🏗️ Project Structure

```
sutradhar/
├── backend/              # Flask Python backend
│   ├── app/             # Main application modules
│   ├── features/        # AI features (facial, voice, hand tracking)
│   ├── datasets/        # Training data and known faces
│   ├── services/        # Email, weather, Jarvis services
│   └── Dockerfile       # Backend container config
├── my-app/              # React frontend
│   ├── src/
│   │   ├── components/  # UI components (Jarvis, Biometric, etc.)
│   │   ├── api/         # API integration
│   │   └── pages/       # Application pages
│   ├── public/          # Static assets
│   └── Dockerfile       # Frontend container config
├── docker-compose.yml   # Multi-container orchestration
├── hardwareserver.py    # ESP32 hardware integration server
└── README.md
```

## 🔧 Configuration

- Backend environment variables in `backend/.env`
- Configure API keys for Google Generative AI, weather services, etc.
- Frontend configuration in `my-app/`

## 🎯 Usage

1. **Launch the application** using Docker Compose
2. **Access the web interface** at http://localhost:3000
3. **Enable camera permissions** for facial recognition features
4. **Use voice commands** or hand gestures to interact
5. **Explore Jarvis assistant** for AI-powered assistance

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with ❤️ to make technology accessible to all
- Special thanks to the open-source community for amazing libraries

## 📞 Support

For questions, issues, or feature requests:
- Open an issue in this repository
- Contact the maintainers

---

**Sutradhar** - Empowering everyone to harness the power of technology! 🌟" 

# Voice-Chat

A real-time voice and text chat platform built with .NET and WebSocket technology, featuring AI-powered conversation, speech-to-text, text-to-speech, and multi-language support.

## 🎯 Overview

Voice-Chat is a comprehensive communication platform that enables users to interact through multiple modalities:

- **Voice Conversations**: Real-time voice chat with speech recognition and AI responses
- **Text Messaging**: Traditional text-based chat with AI assistance
- **Language Translation**: Instant translation of text to different languages
- **Conversation History**: Persistent chat history tracking
- **Audio Synthesis**: Text-to-speech conversion with customizable voice options

## 🏗️ Architecture

The platform uses a **WebSocket-based architecture** for real-time communication:

### Backend (C# .NET)

- **WebSocket Manager**: Handles client connections and message routing
- **Request Handler**: Processes different message types and coordinates services
- **AI Integration**: Powered by Google Gemini for intelligent responses
- **Speech Services**: Speech-to-text and text-to-speech capabilities
- **Data Persistence**: Chat history and user data management

### Frontend (Typescript Next.js)

- React-based user interface
- Real-time WebSocket communication
- Audio recording and playback capabilities

## 📡 WebSocket API

The platform communicates via WebSocket messages with JSON payloads. All messages require a `type` field to specify the request type.

### Message Types

#### 1. Voice Chat (`voiceChat`)

Initiates a voice conversation session where the client will send audio data.

```json
{
  "type": "voiceChat",
  "audioType": "mp3",
  "language": "English",
  "replyAudio": {
    "style": "voice type",
    "type": "wav",
    "speed": 1.0
  }
}
```

After sending this message, the client should send binary audio data in the next WebSocket frame.

#### 2. Text Chat (`textChat`)

Sends a text message for AI conversation.

```json
{
  "type": "textChat",
  "content": "ask text",
  "language": "English",
  "replyAudio": {
    "style": "voice type",
    "type": "wav",
    "speed": 1.0
  }
}
```

#### 3. Text Translation (`textTranslation`)

Translates text to a specified target language.

```json
{
  "type": "textTranslation",
  "content": "Hello world",
  "language": "Spanish"
}
```

#### 4. Chat History (`textHistory`)

Retrieves the user's conversation history.

```json
{
  "type": "textHistory"
}
```

#### 5. Voice Sample (`voiceSample`)

Requests a voice sample with specific audio settings.

```json
{
  "type": "voiceSample",
  "replyAudio": {
    "voice": "voice type",
    "speed": 1.0
  }
}
```

### Response Format

The server responds with:

- **Text responses**: JSON-formatted chat replies and translations
- **Binary responses**: Audio data for voice synthesis
- **History responses**: JSON array of previous conversations

## 🔧 Key Features

### 🎤 Voice Processing

- **Speech Recognition**: Converts audio input to text using advanced STT services
- **Multiple Audio Formats**: Supports MP3 and other common audio formats
- **Real-time Processing**: Low-latency audio processing for smooth conversations

### 🤖 AI Integration

- **Intelligent Responses**: Powered by Google Gemini for contextual conversations
- **Multi-language Support**: Conversations in multiple languages
- **Formatted Prompts**: Optimized prompt formatting for better AI responses

### 🔊 Audio Synthesis

- **Text-to-Speech**: Converts AI responses back to speech
- **Voice Customization**: Multiple voice options and speed controls
- **Voice Samples**: Preview different voice settings before use

### 📚 Data Management

- **Conversation History**: Persistent storage of chat sessions
- **User Tracking**: Individual user session management
- **Message Threading**: Proper conversation flow tracking

### 🌐 Multi-language Support

- **Real-time Translation**: Instant text translation between languages
- **Localized Responses**: AI responses in the user's preferred language
- **Global Communication**: Bridge language barriers in conversations

## 🚀 Getting Started

### Prerequisites

- .NET 9.0 or later
- Node.js and npm
- Google Gemini API key
- Speech services API credentials

### Environment Variables

```bash
FRONTEND_ACCESS_KEY = "set a private key by yourself for backend access"

SPEECH_TO_TEXT_API_URL = "deepgram url"
SPPECH_TO_TEXT_API_KEY = "your key"

GEMIMNI_API_URL = "url"
GEMIMNI_API_KEY = "your key"

TEXT_TO_AUDIO_API_URL = "third party url"
TEXT_TO_AUDIO_API_KEY = "your key"


SUPABASE_URL = "your supabase url"
SUPABASE_KEY = "your supabase api key"
# Additional service keys as needed
```

### Running the Application

1. **Backend**:

```bash
cd backend
dotnet restore
dotnet run
```

2. **Frontend**:

```bash
cd frontend
npm install
npm run dev
```

### WebSocket Connection

Connect to the WebSocket endpoint with a user ID header:

```
ws://localhost:5000/ws
Headers: {
    accessKey: accessKey,
    userId: userId,
  },
```

## 📋 Message Flow Examples

### Voice Chat Flow

1. Client sends `voiceChat` message with audio settings
2. Client sends binary audio data
3. Server processes speech-to-text
4. Server generates AI response
5. Server sends text response and audio reply

### Text Chat Flow

1. Client sends `textChat` message with text content
2. Server processes with AI
3. Server sends formatted response
4. Server optionally sends audio version

### Translation Flow

1. Client sends `textTranslation` with source text
2. Server translates using AI
3. Server returns translated text

## 🛡️ Error Handling

The platform includes comprehensive error handling for:

- Invalid message formats
- Missing required fields
- Audio processing failures
- AI service timeouts
- Network connection issues

## 🔮 Future Enhancements

- Group chat capabilities
- File sharing support
- Advanced voice effects
- Video calling integration
- Mobile app development

---

Built with ❤️ using .NET, WebSockets, Next.js.


# 🧠 Conversational Image Recognition Chatbot

## 🔍 Overview

The **Conversational Image Recognition Chatbot** is a web-based interactive chatbot application designed to simulate human-like conversations while supporting both text and image inputs. Built using **Flask (Python)** as the backend and **HTML, CSS, and JavaScript** for the frontend, the application provides dynamic user interaction, image previewing, markdown rendering, and PDF export functionality.

---

## 🌐 Features

### 💬 User-Friendly Chat Interface
- Real-time message exchange between the user and the chatbot.
- Supports both **text messages** and **image uploads**.
- Displays messages with clear styling and user/bot distinction.

### 🖼️ Image Upload and Preview
- Allows users to upload image files.
- Provides a **live image preview** before sending.
- Option to **cancel** the preview and clear the file input.

### 🧠 Chatbot Response
- Sends user input (text and/or image) to the Flask backend.
- Displays bot responses dynamically using **Markdown rendering** (powered by the `marked.js` library).

### 📄 Export Chat as PDF
- Enables exporting the entire chat conversation as a styled **PDF file** using `jsPDF`.
- Maintains layout with:
  - Chat bubbles (differentiated by user/bot)
  - Images with automatic scaling
  - Timestamps and page numbers
- Ensures content fits within PDF pages with **auto-pagination** and **bubble wrapping**.

### 🔄 Auto-scroll and Typing Indicator
- Keeps the latest message in view using `scrollTop`.
- Shows a **typing animation** while the bot is generating a response.

### ⌨️ Keyboard Shortcut
- Sends the message by pressing **Enter**, enhancing UX.

---

## 🛠️ Technologies Used

| Layer         | Technologies |
|---------------|--------------|
| Frontend      | HTML, CSS, JavaScript |
| Backend       | Python (Flask) |
| PDF Export    | jsPDF |
| Markdown Render | marked.js |
| Image Handling | FileReader API |
| Deployment    | Localhost (Flask Server) |

---

## 📁 Project Structure

```
project-root/
│
├── static/
│   ├── script.js         # JavaScript logic for interactivity
│   └── style.css         # UI styling (not provided here)
│
├── templates/
│   └── index.html        # Main HTML page
│
├── app.py                # Flask backend (assumed name)
├── requirements.txt      # Python dependencies
└── README.md             # Project documentation (this file)
```

---

## 🚀 How It Works

1. **User opens** the chatbot interface in their browser.
2. User types a message or uploads an image.
3. Message and/or image are sent to `/chat` endpoint via `FormData`.
4. Flask backend processes the input and sends back a response.
5. Response is rendered on the UI using Markdown.
6. User can **export the full conversation** as a professional PDF.

---

## 📌 Potential Enhancements

- Add support for **voice input and output**.
- Connect with a **real AI model or vision API** for image recognition.
- Add **chat history saving** to local storage or database.
- Support for **drag & drop** image upload.

---

## 👨‍💻 Author

> Developed with care by **Sandip (Sandy)** — an aspiring developer passionate about building intelligent, user-friendly web apps.

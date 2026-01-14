

from flask import Flask, request, jsonify, render_template, session
import google.generativeai as genai
from PIL import Image
import os
from dotenv import load_dotenv

# Load environment variables from .env.local
load_dotenv('.env.local')

app = Flask(__name__)
app.secret_key = os.urandom(24)  # Session security

# Set up Gemini API key
GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY')
if not GOOGLE_API_KEY:
    raise ValueError("No GOOGLE_API_KEY found in environment variables.")

genai.configure(api_key=GOOGLE_API_KEY)

# Choose the model
MODEL_ID = "gemini-2.5-flash"  # You can change this to another model if needed

@app.route('/')
def index():
    if 'messages' not in session:
        session['messages'] = []
    return render_template('index.html')

@app.route('/get_conversation', methods=['GET'])
def get_conversation():
    return jsonify({"messages": session.get('messages', [])})

@app.route('/chat', methods=['POST'])
def chat():
    messages = session.get('messages', [])
    user_message = request.form.get('message', '')
    print(f"Received user message: {user_message}")
    image_file = request.files.get('image_file')

    if user_message:
        messages.append({"role": "user", "content": user_message})

    if image_file:
        response_text = process_image(image_file)
    else:
        response_text = generate_response(user_message, messages)

    messages.append({"role": "bot", "content": response_text})
    session['messages'] = messages

    return jsonify({"response": response_text})

def generate_response(user_message, messages):
    try:
        conversation_history = ""
        context_messages = messages[-10:] if len(messages) > 10 else messages
        for msg in context_messages:
            role = msg["role"]
            content = msg["content"]
            conversation_history += f"{'User' if role == 'user' else 'Assistant'}: {content}\n"
        
        prompt = f"{conversation_history}User: {user_message}\nAssistant:"

        model = genai.GenerativeModel(MODEL_ID)
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        print(f"Error generating response: {e}")
        return "Network Error : Please connect to Internet!!!"

def process_image(image_file):
    try:
        image = Image.open(image_file)
        model = genai.GenerativeModel(MODEL_ID)

        response = model.generate_content(
            contents=[
                {"mime_type": "image/png", "data": image_file.read()},
                {"text": "Describe the content of this image."}
            ]
        )
        return response.text
    except Exception as e:
        print(f"Error processing image: {e}")
        return f"I'm having trouble analyzing this image. Error: {str(e)}"

if __name__ == '__main__':
    app.run(debug=True)

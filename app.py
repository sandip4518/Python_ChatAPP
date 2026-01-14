from flask import Flask, request, jsonify, render_template, session
from google import genai
from google.genai import types
from PIL import Image
import requests
import io
import os
from dotenv import load_dotenv

# Load environment variables from .env.local
load_dotenv('.env.local')

app = Flask(__name__)
app.secret_key = os.urandom(24)  # Add a secret key for session management

# Initialize the Google Gen AI client
GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY')  # Get API key from environment
if not GOOGLE_API_KEY:
    raise ValueError("No GOOGLE_API_KEY found in environment variables.")

client = genai.Client(api_key=GOOGLE_API_KEY)

# Choose the model
MODEL_ID = "gemini-2.5-flash"  # You can change this to another model if needed

@app.route('/')
def index():
    # Initialize conversation history if it doesn't exist
    if 'messages' not in session:
        session['messages'] = []
    return render_template('index.html')

@app.route('/get_conversation', methods=['GET'])
def get_conversation():
    # Return the current conversation history
    return jsonify({"messages": session.get('messages', [])})

@app.route('/chat', methods=['POST'])
def chat():
    # Get or initialize conversation history
    messages = session.get('messages', [])
    
    user_message = request.form.get('message', '')
    print(f"Received user message: {user_message}")
    image_file = request.files.get('image_file')

    # Store user message for display
    if user_message:
        messages.append({"role": "user", "content": user_message})

    if image_file:
        # Process the uploaded image
        response_text = process_image(image_file)
    else:
        # Generate response with conversation context
        response_text = generate_response(user_message, messages)
    
    # Store bot response for display
    messages.append({"role": "bot", "content": response_text})
    
    # Save updated conversation to session
    session['messages'] = messages
    
    response = jsonify({"response": response_text})
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response

def generate_response(user_message, messages):
    try:
        # Create a conversation history string
        conversation_history = ""
        
        # Include the last few messages for context (to avoid token limits)
        context_messages = messages[-10:] if len(messages) > 10 else messages
        
        for msg in context_messages:
            if msg["role"] == "user":
                conversation_history += f"User: {msg['content']}\n"
            else:
                conversation_history += f"Assistant: {msg['content']}\n"
        
        # Add the current query with context
        prompt = f"{conversation_history}User: {user_message}\nAssistant:"
        
        # Send to model
        response = client.models.generate_content(
            model=MODEL_ID,
            contents=prompt
        )
        
        return response.text
    except Exception as e:
        print(f"Error generating response: {e}")
        return "Network Error : Please connect to Internet!!!"

def process_image(image_file):
    try:
        # Open the image file
        image = Image.open(image_file)
        
        # Generate a prompt based on the image
        prompt = "Describe the content of this image."
        
        # Send the image and prompt to the model
        response = client.models.generate_content(
            model=MODEL_ID,
            contents=[image, prompt]
        )
        return response.text
    except Exception as e:
        print(f"Error processing image: {e}")
        return f"I'm having trouble analyzing this image. Error: {str(e)}"

if __name__ == '__main__':
    app.run(debug=True)
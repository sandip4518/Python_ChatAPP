// Show image preview when a file is selected
document.getElementById("image-file").addEventListener("change", function (e) {
  const imageFile = e.target.files[0];
  const previewContainer = document.getElementById("image-preview-container");
  const previewImage = document.getElementById("image-preview");

  if (imageFile) {
    const reader = new FileReader();
    reader.onload = function (e) {
      previewImage.src = e.target.result;
      previewContainer.style.display = "block";
    };
    reader.readAsDataURL(imageFile);
  }
});

// Cancel preview and clear file input
document
  .getElementById("cancel-preview")
  .addEventListener("click", function () {
    const previewContainer = document.getElementById("image-preview-container");
    const previewImage = document.getElementById("image-preview");
    const fileInput = document.getElementById("image-file");

    previewContainer.style.display = "none";
    previewImage.src = "#";
    fileInput.value = "";
  });

// Send message or image
document.getElementById("send-button").onclick = async function () {
  const userInput = document.getElementById("user-input").value.trim();
  const imageFile = document.getElementById("image-file").files[0];
  const messagesDiv = document.getElementById("messages");
  const sendButton = document.getElementById("send-button");

  if (!userInput && !imageFile) return;

  sendButton.disabled = true;

  try {
    document.getElementById("user-input").value = "";
    document.getElementById("image-file").value = "";
    document.getElementById("image-preview-container").style.display = "none";
    document.getElementById("image-preview").src = "#";

    if (userInput) {
      messagesDiv.innerHTML += `<div class="message user">${userInput}</div>`;
      messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }

    if (imageFile) {
      await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = function (e) {
          messagesDiv.innerHTML += `
            <div class="message user">
              <img src="${e.target.result}" alt="Uploaded Image" class="uploaded-image">
            </div>`;
          messagesDiv.scrollTop = messagesDiv.scrollHeight;
          resolve();
        };
        reader.readAsDataURL(imageFile);
      });
    }

    const formData = new FormData();
    if (userInput) formData.append("message", userInput);
    if (imageFile) formData.append("image_file", imageFile);

    messagesDiv.innerHTML += `
      <div class="message bot typing">
        <div class="typing-indicator">Bot is typing...</div>
      </div>`;
    messagesDiv.scrollTop = messagesDiv.scrollHeight;

    const response = await fetch("/chat", {
      method: "POST",
      body: formData,
    });

    const typingIndicator = messagesDiv.querySelector(".typing");
    if (typingIndicator) typingIndicator.remove();

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.response) {
      const botMessage = document.createElement("div");
      botMessage.classList.add("message", "bot");

      // ✅ Render markdown from bot response
      botMessage.innerHTML = marked.parse(data.response);
      messagesDiv.appendChild(botMessage);
      messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }
  } catch (error) {
    console.error("Error:", error);
    messagesDiv.innerHTML += `
      <div class="message bot error">
        Sorry, there was an error processing your request.
      </div>`;
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  } finally {
    sendButton.disabled = false;
  }
};

// Export PDF
document.getElementById("export-button").onclick = async function () {
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF();

  const currentDate = new Date().toLocaleString();
  const pageWidth = pdf.internal.pageSize.width;
  const pageHeight = pdf.internal.pageSize.height;
  const margins = { left: 20, right: 20, top: 30, bottom: 20 };

  pdf.setFillColor(52, 58, 64);
  pdf.rect(0, 0, pageWidth, 25, "F");

  pdf.setTextColor(255, 255, 255);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(16);
  pdf.text("Chat Conversation History", pageWidth / 2, 15, { align: "center" });
  pdf.setFontSize(10);
  pdf.text(currentDate, pageWidth - margins.right, 20, { align: "right" });

  let yPos = 40;
  const messages = document.getElementById("messages").children;

  for (let message of messages) {
    try {
      const isUser = message.classList.contains("user");
      const imgElement = message.querySelector("img");
      let text = message.innerText
        .replace(/\s+/g, " ")
        .replace(/[^\x00-\x7F]/g, "")
        .trim();

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(11);

      if (imgElement) {
        const { img, width, height } = await processImage(imgElement);
        if (yPos + height + 20 > pageHeight - margins.bottom) {
          pdf.addPage();
          yPos = margins.top;
        }

        const xPos = isUser ? pageWidth - width - margins.right : margins.left;

        pdf.setFillColor(
          isUser ? 210 : 230,
          isUser ? 235 : 230,
          isUser ? 255 : 230
        );
        pdf.roundedRect(xPos - 5, yPos - 5, width + 10, height + 10, 3, 3, "F");
        pdf.addImage(img, "JPEG", xPos, yPos, width, height);
        yPos += height + 15;
      }

      if (text) {
        const maxBubbleWidth = 130;
        const fullWrapped = pdf.splitTextToSize(text, maxBubbleWidth);
        const longestLineWidth = Math.max(
          ...fullWrapped.map((line) => pdf.getTextWidth(line))
        );
        const bubbleWidth = Math.min(longestLineWidth, maxBubbleWidth);
        const wrappedText = pdf.splitTextToSize(text, bubbleWidth);
        const lineHeight = 7;
        const bubblePadding = 5;

        const topPadding = bubblePadding + 2;
        const bottomPadding = bubblePadding - 2;

        const bubbleX = isUser
          ? pageWidth - margins.right - bubbleWidth - bubblePadding * 2
          : margins.left;

        let lineIndex = 0;

        while (lineIndex < wrappedText.length) {
          if (
            yPos + lineHeight + topPadding + bottomPadding >
            pageHeight - margins.bottom
          ) {
            pdf.addPage();
            yPos = margins.top;
          }

          const linesFit = Math.floor(
            (pageHeight - margins.bottom - yPos - topPadding - bottomPadding) /
              lineHeight
          );
          const currentLines = wrappedText.slice(
            lineIndex,
            lineIndex + linesFit
          );
          const currentHeight = currentLines.length * lineHeight;

          pdf.setFillColor(
            isUser ? 210 : 230,
            isUser ? 235 : 230,
            isUser ? 255 : 230
          );
          pdf.roundedRect(
            bubbleX - bubblePadding,
            yPos - topPadding,
            bubbleWidth + bubblePadding * 2,
            currentHeight + topPadding + bottomPadding,
            3,
            3,
            "F"
          );

          pdf.setTextColor(0, 0, 0);
          for (let i = 0; i < currentLines.length; i++) {
            pdf.text(currentLines[i], bubbleX, yPos + i * lineHeight + 1);
          }

          yPos += currentHeight + 15;
          lineIndex += linesFit;
        }
      }
    } catch (error) {
      console.error("Error processing message:", error);
      continue;
    }
  }

  const totalPages = pdf.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    pdf.setFontSize(10);
    pdf.setTextColor(100, 100, 100);
    pdf.text(
      `Page ${i} of ${totalPages}`,
      pageWidth - margins.right,
      pageHeight - margins.bottom,
      { align: "right" }
    );
  }

  pdf.save(`chat-history-${new Date().toISOString().slice(0, 10)}.pdf`);
};

// Helper function to scale images
const processImage = (imgElement) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      const aspectRatio = img.width / img.height;
      let imgWidth = Math.min(50, img.width);
      let imgHeight = imgWidth / aspectRatio;
      resolve({ img, width: imgWidth, height: imgHeight });
    };
    img.src = imgElement.src;
  });
};

// Send on Enter key press
window.onload = function () {
  document
    .getElementById("user-input")
    .addEventListener("keypress", function (event) {
      if (event.key === "Enter") {
        event.preventDefault();
        document.getElementById("send-button").click();
      }
    });
};

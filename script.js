const sendButton = document.getElementById('sendButton');
const addInputButton = document.getElementById('addInputButton');
const addOutputButton = document.getElementById('addOutputButton');
const API_URL = "https://api.openai.com/v1/chat/completions";
const API_KEY = "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";
const container = document.getElementById('container');  // Grab the main "container"

let messages = []; // This array will store all the messages
let textAreaArray = [];   
 
messages.push({
  "role": "system",
  "content": document.getElementById('system-input').value
});

window.onload = () => {
  addTextArea('chat-input');
};

addInputButton.addEventListener('click', () => {
  addTextArea('chat-input');
});

addOutputButton.addEventListener('click', () => {
  addTextArea('chat-output');
});

function addTextArea(className) {
  console.log(messages)
  const textAreaContainer = document.createElement('div');
  textAreaContainer.className = 'textarea-container';

  const deleteButton = document.createElement('button');
  deleteButton.className = 'delete-button';
  deleteButton.innerHTML = '&mdash;';
  deleteButton.addEventListener('click', removeTextArea);
  textAreaContainer.appendChild(deleteButton);

  let newElement; //either textarea or div based on className

  newElement = document.createElement('div');
  newElement.contentEditable = true;
  newElement.setAttribute('id', `dynamic-textarea-${textAreaArray.length + 1}`);
  newElement.className = className;
  newElement.dataset.id = textAreaArray.length + 1;
  textAreaContainer.appendChild(newElement);
  textAreaArray.push(newElement);

  container.appendChild(textAreaContainer); 

  if(className === 'chat-input' || className === 'chat-output') {
    newElement.addEventListener('input', autoResizeTextarea);
    newElement.addEventListener('change', autoResizeTextarea);
    newElement.addEventListener('paste', (event) => {
      event.preventDefault();  // Prevent the pasting event
      let text = event.clipboardData.getData('text/plain');  // Get plain text from clipboard
      document.execCommand('insertText', false, text);  // Insert the text manually
  });
  }
}

function removeTextArea(event) {
  let indexOfElementToRemove = textAreaArray.indexOf(event.target.nextElementSibling);
  textAreaArray.splice(indexOfElementToRemove, 1); 
  container.removeChild(event.target.parentElement);
  
  // If the textarea is a chat input, loop through the messages array and remove the message that corresponds to the textarea
  if(event.target.nextElementSibling.className === 'chat-input') {
    for (let i = 0; i < messages.length; i++) {
      const message = messages[i];
      console.log("Raw content for chat input: ", event.target.nextElementSibling.dataset.rawContent)
      if(message.role === 'user' && message.content === event.target.nextElementSibling.innerHTML) {
        messages.splice(i, 1);
      }
    }
  }

  // If the textarea is a chat output, loop through the messages array and remove the message that corresponds to attribute of the textarea
  if(event.target.nextElementSibling.className === 'chat-output') {
    for (let i = 0; i < messages.length; i++) {
      const message = messages[i];
      console.log("Raw content for chat output: ", event.target.nextElementSibling.dataset.rawContent)
      if(message.role === 'assistant' && message.content === event.target.nextElementSibling.dataset.rawContent) {
        messages.splice(i, 1);
      }
    }
  }
}

// Function to automatically resize the textarea according to its content
function autoResizeTextarea(evt) {
  evt.target.style.height = 'auto'; // reset the height
  if(evt.target.scrollHeight > evt.target.clientHeight){
    let computed = window.getComputedStyle(evt.target);
    let height = 
      parseInt(computed.getPropertyValue('border-top-width'), 10)
      + parseInt(computed.getPropertyValue('padding-top'), 10)
      + evt.target.scrollHeight
      + parseInt(computed.getPropertyValue('padding-bottom'), 10)
      + parseInt(computed.getPropertyValue('border-bottom-width'), 10);
    evt.target.style.height = height + 'px';
    evt.target.style.overflowY = 'hidden'; // to prevent performance issues due to constant resize
  } else if(evt.target.scrollHeight < evt.target.offsetHeight) { 
    evt.target.style.height = evt.target.scrollHeight +'px'; 
  }
}

sendButton.addEventListener('click', async () => {
  const chatInputs = document.getElementsByClassName('chat-input');
  const systemInput = document.getElementById('system-input').value;
 
  if(messages.some(message => message.role === 'system')){
    messages.find(message => message.role === 'system').content = systemInput;
  }

  // Loop through all the chat inputs, only add those that don't already exist in the messages array
  for (let i = 0; i < chatInputs.length; i++) {
    const chatInput = chatInputs[i];
    const chatInputContent = chatInput.innerHTML;

    if (!messages.some(message => message.role === 'user' && message.content === chatInputContent)) {
      messages.push({
        "role": "user",
        "content": chatInputContent
      });
    }
  }

  // Remove duplicates in the messages array
  messages = messages.filter((message, index, self) =>
    index === self.findIndex((m) => (
      m.role === message.role && m.content === message.content
    ))
  );

  const response = await fetchResponse(API_URL, API_KEY, messages);

  // Check if the choices array and get the message object
   if (response && response.choices && Array.isArray(response.choices) && response.choices.length > 0) {
      const assistantMessage = response.choices[0].message;
      if (assistantMessage && assistantMessage.content) {
          renderLatex(assistantMessage.content); // Render the assistant's message
          messages.push(assistantMessage); 
      }
  }
  console.log(response);
});

async function fetchResponse(url, key, messages) {
    const body = {
        "model": "gpt-4",
        "messages": messages
    };
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${key}`
            },
            body: JSON.stringify(body)
        });

        console.log("Current messages: ", messages);

        return response.json();
    } catch (error) {
        console.error("Fetching response failed with error: ", error);
    }
}

function renderLatex(input) {
  // If there is an input, create a new textarea and render the input
  if (input) {
    addTextArea('chat-output');

    const outputElement = textAreaArray[textAreaArray.length - 1]; // Get last textarea created

    var latexInput = input
    latexInput = appendNewlines(latexInput);
    latexInput = convertBracketsToSpace(latexInput);
    latexInput = replaceNewlines(latexInput);
    latexInput = performTextStyling(latexInput);

    outputElement.innerHTML = latexInput;
    outputElement.dataset.rawContent = input;

    autoResizeTextarea({ target: outputElement }); 
    MathJax.typesetPromise().then(() => {});
  } else {
    alert("No input to render");
  }
}

function convertBracketsToSpace(input) {
  return input.replace(/</g, ' < ').replace(/>/g, ' > ');
}

function replaceNewlines(input) {
// Replace occurrences of two newlines with <p/> tag 
input = input.replace(/\\n\\n/g, '<p/>'); 

// Replace every occurrence of a newline preceded and followed by whitespace with '\n\n'
input = input.replace(/\s*\\n\s*/g, '\n\n'); 

// Replace any remaining newlines with a space
input = input.replace(/\\n/g, ' '); 
 
// Replace any remaining double backslashes with a single backslash
return input.replace(/\\\\/g, '\\');
}

function appendNewlines(input) {
// Split the input into paragraphs
const paragraphs = input.split("\n\n");

// Join the paragraphs back together, adding '\n\n' in between each one
const appendedInput = paragraphs.join("\\n\\n");

return appendedInput;
}

function performTextStyling(input) {
  input = input.replace(/(\B)\*\*(.+?)\*\*(\B)/g, '<b>$2</b>');
  input = input.replace(/_([^_{}]+?)_([^a-z0-9]|$)/ig, '<i>$1</i>$2');
  input = input.replace(/_([^_{}]+?)_($|\s+)/g, '<i>$1</i> $2');
  return input.replace(/<\/i>\\\(/g, '</i> \\(');
}


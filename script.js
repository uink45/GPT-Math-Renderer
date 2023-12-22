let button = document.querySelector(".settings-icon");
let settingsPane = document.getElementById('settings-pane');
let overlay = document.querySelector('#overlay');
let inputField = document.getElementById('openai-key');
let darkModeToggle = document.getElementById('dark-mode');
let systemInput = document.getElementById('system-input');
let userButton = document.getElementById('user-button');
let assistantButton = document.getElementById('assistant-button');
let messageContainer = document.getElementById('message-container');
let bodyElement = document.getElementsByTagName('body')[0];
let title = document.querySelector("h1");
let messages = [(systemInput.placeholder !== '') ? {text: systemInput.placeholder, element: systemInput} : {text: systemInput.value, element: systemInput}];
let paneIsOpen = false; 

window.onload = function() {
    let storedKey = localStorage.getItem("openAIKey");
    if(storedKey) { 
        inputField.value = storedKey;
    }

    let darkModeStored = localStorage.getItem("darkMode");
    if(darkModeStored) {
        if(darkModeStored === 'true') {
            darkModeToggle.checked = true;
            bodyElement.classList.add("dark-mode");
            title.classList.add("dark-mode");
            button.classList.add("dark-mode");
        } else {
            darkModeToggle.checked = false;
        }
    }
    autoExpand(systemInput);
}

button.addEventListener("click", function(event) {
    event.stopPropagation();
    if(!paneIsOpen) { 
        settingsPane.style.display = 'block';
        overlay.style.display = 'block';
        button.classList.add("active");
        settingsPane.classList.remove("exit");
        overlay.classList.remove("exit");
        paneIsOpen = true; 
    } else {
        settingsPane.classList.add("exit");
        overlay.classList.add("exit");
        setTimeout(function(){
            settingsPane.style.display = 'none';
            overlay.style.display = 'none';
        }, 500);
        button.classList.remove("active");
        paneIsOpen = false;
    }
});

overlay.addEventListener("click", function () {
    settingsPane.classList.add("exit");
    overlay.classList.add("exit");
    setTimeout(function(){
        settingsPane.style.display = 'none';
        overlay.style.display = 'none';
    }, 500);
    button.classList.remove("active");
    paneIsOpen = false;

    localStorage.setItem("openAIKey", inputField.value);
    localStorage.setItem("darkMode", darkModeToggle.checked);
});

let slider = document.querySelector('.slider');

slider.addEventListener("click", function() {
    darkModeToggle.checked = !darkModeToggle.checked;
    if(darkModeToggle.checked) {
        bodyElement.classList.add("dark-mode");
        systemInput.classList.add("dark-mode");
        title.classList.add("dark-mode");
        button.classList.add("dark-mode");

        const textAreasDark = document.querySelectorAll('.new-input');
        textAreasDark.forEach(textArea => {
            textArea.classList.add('dark-mode');
        });

        localStorage.setItem("darkMode", 'true');
    } else {
        bodyElement.classList.remove("dark-mode");
        title.classList.remove("dark-mode");
        button.classList.remove("dark-mode");
        systemInput.classList.add("dark-mode");

        const textAreasLight = document.querySelectorAll('.new-input');
        textAreasLight.forEach(textArea => {
            textArea.classList.remove('dark-mode');
        });

        localStorage.setItem("darkMode", 'false');
    }
});

function autoExpand(element) {
    // Only adjust the height if there's an overflow
    if (element.scrollHeight > element.clientHeight) {
        element.style.height = element.scrollHeight + 2 + 'px';
    }
}

function createNewTextArea(role, defaultText = '') {
    let newElement = document.createElement('div');
    let newElementWrapper = document.createElement('div');
    let removeButton = document.createElement('button');

    newElement.dataset.role = role;
    newElementWrapper.classList.add('newElement-wrapper', 'fadeIn');
    newElement.classList = 'new-input';
    newElement.setAttribute('contentEditable', 'true');
    newElement.textContent = defaultText; 
    removeButton.classList.add('remove-textarea'); 
    removeButton.title = "Remove this box"; 
    newElementWrapper.appendChild(newElement);
    newElementWrapper.appendChild(removeButton);
    messageContainer.appendChild(newElementWrapper);

    let oldText = defaultText;
    messages.push({
        text: oldText,
        element: newElement
    });

    newElement.addEventListener('input', () => {
        let newText = newElement.textContent;

        const messageObj = messages.find(msg => msg.element === newElement);
        if (messageObj) {
            messageObj.text = newText;
        }
        else{
            console.log("Message not found", oldText);
        }
        oldText = newText;
        autoExpand(newElement);
    });

    newElement.addEventListener('paste', (e) => {
        e.preventDefault();
        const text = (e.originalEvent || e).clipboardData.getData('text/plain');
        document.execCommand('insertText', false, text);
        autoExpand(newElement);
    });

    removeButton.addEventListener('click', function () {
        newElementWrapper.style.animation = "fadeOut 0.6s ease-in forwards";
        setTimeout(function(){
            messageContainer.removeChild(newElementWrapper);
        }, 600);

        const messageObj = messages.find(msg => msg.element === newElement);
        if (messageObj) {
            messages.splice(messages.indexOf(messageObj), 1);
        }
        else{
            console.log("Message not found", oldText);
        }
        console.log(messages);
    });

    return newElement;
}

userButton.addEventListener("click", function(event) {
    createNewTextArea('User');
});

systemInput.addEventListener('input', function () {
    messages[0] = { 
        text: systemInput.value, 
        element: systemInput 
    };
});

document.getElementById('send-button').addEventListener('click', function() {
    const formattedMessages = messages.map((messageObj, index) => {
        let role;
        if (index === 0) {
            role = 'system';
        } else {
            const textarea = document.querySelectorAll('.new-input')[index - 1];
            role = messageObj.element.dataset.role.toLowerCase();
        }
        return {
            role,
            content: messageObj.text
        };
    });

    const requestBody = {
        model: 'gpt-4-1106-preview',
        messages: formattedMessages,
        stream: true,
    };

    const newDiv = createNewTextArea('Assistant', ''); 

    fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${inputField.value}`
        },
        body: JSON.stringify(requestBody),
    })
    .then(response => {
        const reader = response.body.getReader();
        let partialData = '';
        let includesMath = false;

        reader.read()
            .then(function processStream({ done, value }) {
                partialData += new TextDecoder().decode(value);
                let newlineIndex;
                while ((newlineIndex = partialData.indexOf('\n')) !== -1) {
                    let responseChunk = partialData.slice(0, newlineIndex);
                    try {
                        const trimmedData = responseChunk.replace('data: ', '').trim();
                        const data = JSON.parse(trimmedData);

                        if (data['choices'] && data['choices'][0] && data['choices'][0]['delta'] && data['choices'][0]['delta']['content']) {
                            const messageContent = data['choices'][0]['delta']['content'];
                            const messageObj = messages.find(msg => msg.element === newDiv);
                            newDiv.textContent += messageContent;
                            
                            if(messageObj){
                                messageObj.text += messageContent;  // Append the new text to the existing content
                            }

                            if (!includesMath) {
                                let mathSymbols = ['\\(', '\\)', '\\[', '\\]', '$$'];
                                includesMath = mathSymbols.some(symbol => messageContent.includes(symbol));
                            }

                        } else if (data['choices'] && data['choices'][0] && data['choices'][0]['delta'] && data['choices'][0]['finish_reason']) {
                            if(data['choices'][0]['finish_reason'] === "stop") {
                                return;
                            }
                        }
                    } catch (e) {
                    
                    }

                    autoExpand(newDiv);
                    partialData = partialData.slice(newlineIndex + 1);
                }

                if (!done) {
                    return reader.read().then(processStream);
                }
            })
            .then(() => {
                renderMathInElement(newDiv); // Here is the modified line
                autoExpand(newDiv);
            });
    })
    .catch((error) => {
        console.error('Error:', error);
    });
});
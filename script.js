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
let messages = [(systemInput.placeholder !== '') ? systemInput.placeholder : systemInput.value];
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
        element.style.height = element.scrollHeight + 'px';
    }
}
function createNewTextArea(role, defaultText = '') {
    let textarea = document.createElement('textarea');
    let textareaWrapper = document.createElement('div'); 
    let removeButton = document.createElement('button');

    textarea.dataset.role = role;
    textareaWrapper.classList.add('textarea-wrapper', 'fadeIn');
    textarea.classList = 'new-input';
    textarea.placeholder = role;
    textarea.value = defaultText; // Set default text
    removeButton.classList.add('remove-textarea'); 
    removeButton.innerText = '—'; 
    removeButton.title = "Remove this box"; 
    
    textareaWrapper.appendChild(textarea);
    textareaWrapper.appendChild(removeButton);
    messageContainer.appendChild(textareaWrapper);

    let oldText = defaultText;  // this will hold the previous input value

    messages.push(oldText);
    autoExpand(textarea);

    textarea.addEventListener('input', () => {
        let newText = textarea.value;
        const index = messages.indexOf(oldText);
        if (index !== -1) {
            messages[index] = newText;
        }
        oldText = newText;
        textareaWrapper.style.height = `${textarea.scrollHeight + 40}px`;
        autoExpand(textarea);
        console.log(messages);
    });

    textareaWrapper.style.height = `${textarea.scrollHeight + 40}px`;

    removeButton.addEventListener('click', function () {
        textareaWrapper.style.animation = "fadeOut 0.6s ease-in forwards";
        setTimeout(function(){
            messageContainer.removeChild(textareaWrapper);
        }, 600);

        const index = messages.indexOf(oldText);
        if (index !== -1) {
            messages.splice(index, 1);
        }

        console.log(messages);
    });
}

userButton.addEventListener("click", function(event) {
    createNewTextArea('User');
});

assistantButton.addEventListener("click", function(event) {
    createNewTextArea('Assistant');
});

systemInput.addEventListener('input', function () {
    messages[0] = systemInput.value;
});

document.getElementById('send-button').addEventListener('click', function() {
    // map the messages array to the needed format
    const formattedMessages = messages.map((message, index) => {
        let role;
        if (index === 0) {
            role = 'system';
        } else {
            const textarea = document.querySelectorAll('.new-input')[index - 1];
            role = textarea.dataset.role.toLowerCase();
        }
        return {
            role,
            content: message
        };
    });

    // prepare the body of the request
    const requestBody = {
        model: 'gpt-4',
        messages: formattedMessages
    };

    // use Fetch API to send a request
    fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${inputField.value}` // get the API Key from the settings
        },
        body: JSON.stringify(requestBody),
    })
        .then(response => response.json())
        .then(data => {
            if (data['choices'] && data['choices'][0] && data['choices'][0]['message']) {
                createNewTextArea('Assistant', data['choices'][0]['message']['content']);
            } else {
                console.error('API response does not contain the assistant’s reply.');
            }
        })
        .catch((error) => {
            console.error('Error:', error);
        });
});
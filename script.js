let button = document.querySelector(".settings-icon");
let settingsPane = document.getElementById('settings-pane');
let overlay = document.querySelector('#overlay');
let inputField = document.getElementById('openai-key');
let darkModeToggle = document.getElementById('dark-mode');
let systemInput = document.getElementById('system-input');
let bodyElement = document.getElementsByTagName('body')[0];
let title = document.querySelector("h1");

let paneIsOpen = false; 

// Load settings from local storage at start
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
    // When pane closes, save the input field value and dark mode state to local storage
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
        localStorage.setItem("darkMode", 'true');
    } else {
        bodyElement.classList.remove("dark-mode");
        title.classList.remove("dark-mode");
        button.classList.remove("dark-mode");
        systemInput.classList.add("dark-mode");
        localStorage.setItem("darkMode", 'false');
    }
});
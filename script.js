let button = document.querySelector(".settings-icon");
let settingsPane = document.getElementById('settings-pane');
let overlay = document.querySelector('#overlay');
let paneIsOpen = false;

button.addEventListener("click", function(event) {
    event.stopPropagation();
    if(!paneIsOpen) { 
        settingsPane.style.display = 'block';
        overlay.style.display = 'block';
        button.classList.add("active");
        // Remove 'exit' class to reverse the animation
        settingsPane.classList.remove("exit");
        overlay.classList.remove("exit");
        paneIsOpen = true; 
    } else {
        // Assign 'exit' class to start the animation
        settingsPane.classList.add("exit");
        overlay.classList.add("exit");
        // Delay hiding the elements to let animation finish
        setTimeout(function(){
            settingsPane.style.display = 'none';
            overlay.style.display = 'none';
        }, 500); // same duration as your CSS animation
        button.classList.remove("active");
        paneIsOpen = false;
    }
});

// Click anywhere to close the settings pane
overlay.addEventListener("click", function () {
    settingsPane.classList.add("exit");
    overlay.classList.add("exit");
    setTimeout(function(){
        settingsPane.style.display = 'none';
        overlay.style.display = 'none';
    }, 500);
    button.classList.remove("active");
    paneIsOpen = false; 
});
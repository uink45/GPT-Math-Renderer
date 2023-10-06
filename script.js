let button = document.querySelector(".settings-icon");

button.addEventListener("click", function(event) {
    event.stopPropagation(); // Prevent this click from triggering the document's click event
    button.classList.add("active");
});

// Click anywhere to remove the active class on the button
document.addEventListener("click", function() {
    button.classList.remove("active");
});
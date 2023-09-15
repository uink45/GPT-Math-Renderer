function renderLatex() {
    const inputElement = document.getElementById('input');
    const outputElement = document.getElementById('output');

    let latexInput = inputElement.value;
    latexInput = removeWarnings(latexInput);  
    latexInput = convertBracketsToSpace(latexInput);
    latexInput = replaceNewlines(latexInput);
    latexInput = performTextStyling(latexInput);

    outputElement.innerHTML = latexInput;

    typesetWithMathJax();
}

function removeWarnings(input) {
    // remove warning
    input = input.replace(/\\n\+\+\+ ==WARNING: Truncated because of repetitions==\\n/g, '');
    // remove any remaining unwanted characters or lines
    input = input.replace(/\\[\n\r]+/g, '');
    return input;
}

function convertBracketsToSpace(input) {
  return input.replace(/</g, ' < ').replace(/>/g, ' > ');
}

function replaceNewlines(input) {
  return input.replace(/\\n\\n/g, '<p/>').replace(/\\n/g, ' ').replace(/\\\\/g, '\\');
}

function performTextStyling(input) {
    input = input.replace(/(\B)\*\*(.+?)\*\*(\B)/g, '<b>$2</b>');
    input = input.replace(/_([^_{}]+?)_([^a-z0-9]|$)/ig, '<i>$1</i>$2');
    input = input.replace(/_([^_{}]+?)_($|\s+)/g, '<i>$1</i> $2');
    return input.replace(/<\/i>\\\(/g, '</i> \\(');
}

function typesetWithMathJax() {
  MathJax.typesetPromise().then(() => {});
}

/* Backup script
function renderLatex() {
    const inputElement = document.getElementById('input');
    const outputElement = document.getElementById('output');

    let latexInput = inputElement.value;
    latexInput = convertBracketsToSpace(latexInput);
    latexInput = replaceNewlines(latexInput);
    latexInput = performTextStyling(latexInput);

    outputElement.innerHTML = latexInput;

    typesetWithMathJax();
}

function convertBracketsToSpace(input) {
  return input.replace(/</g, ' < ').replace(/>/g, ' > ');
}

function replaceNewlines(input) {
  return input.replace(/\\n\\n/g, '<p/>').replace(/\\n/g, ' ').replace(/\\\\/g, '\\');
}

function performTextStyling(input) {
    input = input.replace(/(\B)\*\*(.+?)\*\*(\B)/g, '<b>$2</b>');
    input = input.replace(/_([^_{}]+?)_([^a-z0-9]|$)/ig, '<i>$1</i>$2');
    input = input.replace(/_([^_{}]+?)_($|\s+)/g, '<i>$1</i> $2');
    return input.replace(/<\/i>\\\(/g, '</i> \\(');
}

function typesetWithMathJax() {
  MathJax.typesetPromise().then(() => {});
}*/
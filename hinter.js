let activationKey = 70; // f
let selector = 'a,button,input,textarea,area,[contenteditable=true],[contenteditable=""],[tabindex],[role="button"],summary';
let captureKeyboard = false;
let links = [];
let hints = {};
let characters = [
    's', 'd', 'u', 'h', 'j', 'k', 'l', 'g', 'a', 'v', 'n', 't',
    'y', 'r', 'b', 'm', 'o', 'w', 'e', 'c', 'x', 'z', 'p', 'q'
];
let keys = [];

/**
 * Sleeps.
 * @param {number} ms 
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Checks if the element is visible.
 * @param {element} element
 */
function isVisible(element) {
    if (element.type == 'hidden' || element.type == 'submit') return false;
    if (element.hidden === true) return false;
    if (element.disabled) return false;
    if (element.style.display == 'none') return false;
    // Check coordinates
    var rectangle = element.getBoundingClientRect();
    var viewWidth = window.innerWidth;
    var viewHeight = window.innerHeight;
    if (rectangle.x + rectangle.width < 0) {
        //console.log('rectangle.x (' + rectangle.x + ') + rectangle.width (' + rectangle.width + ') < 0: ' + element.innerText);
        return false;
    }
    if (rectangle.x > viewWidth) {
        //console.log('rectangle.x (' + rectangle.x + ') > viewWidth (' + viewWidth + '): ' + element.innerText);
        return false;
    }
    if (rectangle.y + rectangle.height < 0) {
        //console.log('rectangle.y (' + rectangle.y + ') + rectangle.height (' + rectangle.height + ') < 0: ' + element.innerText);
        return false;
    }
    if (rectangle.y > viewHeight) {
        //console.log('rectangle.y (' + rectangle.y + ') > viewHeight (' + viewHeight + '): ' + element.innerText);
        return false;
    }
    return true;
}

/**
 * Creates hints.
 */
function createHints() {
    let elements = [];
    let queryElements = window.document.querySelectorAll(selector);
    for (let i = 0; i < queryElements.length; i++) {
        if (isVisible(queryElements[i])) elements.push(queryElements[i]);
    }
    for (let i = 0; i < elements.length; i++) {
        let element = elements[i];
        let rectangle = element.getBoundingClientRect();
        let hintText = characters[Math.floor(i / 24)] + characters[(i % 24)];
        let hint = document.createElement('div');
        hint.className = 'hinter';
        hint.style.left = rectangle.left + 'px';
        hint.style.top = rectangle.top + 'px';
        hint.style.width = rectangle.width + 'px';
        hint.style.height = rectangle.height + 'px';
        hint.innerText = hintText;
        hints[hintText] = {
            element: hint,
            target: element
        };
        element.parentElement.insertBefore(hint, element);
        //element.appendChild(hint);
    }
    keys = [];
    captureKeyboard = true;
}

/**
 * Clicks the target element.
 * @param {element} target
 */
async function follow(target) {
    target.focus();
    //await sleep(400);
    //target.click();
}

/**
 * Clear hints.
 */
function clear() {
    for (let property in hints) {
        let element = hints[property].element;
        element.parentNode.removeChild(element);
    }
    hints = {};
    captureKeyboard = false;
}

/**
 * Process key presses.
 * @param {event} event
 */
function onKeyUp(event) {
    let element = event.target;
    if (element.contentEditable == true) return;
    if (element.tagName.toLowerCase() == "input") return;
    if (element.tagName.toLowerCase() == "textarea") return;
    if (captureKeyboard) {
        event.stopPropagation();
        event.preventDefault();
        console.log('stop');
        if (event.keyCode == activationKey || event.keyCode == 27) {
            clear();
            return;
        }
        keys.push(String.fromCharCode(event.keyCode).toLowerCase());
        if (keys.length > 2) keys = keys.slice(-2);
        let value = keys.join('');
        if (hints[value]) {
            follow(hints[value].target);
            clear();
            return;
        }
    }
    if (event.keyCode == activationKey) {
        createHints();
    }
}
document.body.addEventListener('keyup', onKeyUp, true);
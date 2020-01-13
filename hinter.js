let activationKey = 70; // f
let selector = 'a,button,input,textarea,area,[contenteditable=true],[contenteditable=""],[tabindex],[role="button"],summary';
let captureKeyboard = false;
let focused = false;
let links = [];
let hints = {};
let focus = undefined;
let characters = [
    's', 'd', 'u', 'h', 'j', 'k', 'l', 'g', 'a', 'v', 'n', 't',
    'y', 'r', 'b', 'm', 'o', 'w', 'e', 'c', 'x', 'z', 'p', 'q'
];
let keys = [];

/**
 * Sleeps for a given time.
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
    // if (element.innerHTML == 'Send Feedback') {
    //     console.log('send feedback link');
    //     console.log('element.type: ' + element.type);
    //     console.log('element.hidden: ' + element.hidden);
    //     console.log('element.disabled: ' + element.disabled);
    //     let computedStyle = window.getComputedStyle(element, null);
    //     console.log(computedStyle);
    //     console.log('computedStyle.display: ' + computedStyle.display);
    //     console.log('computedStyle.width: ' + computedStyle.width);
    //     console.log('computedStyle.visibility: ' + computedStyle.visibility);
    //     console.log('computedStyle.opacity: ' + computedStyle.opacity);
    // }
    // hidden elements
    if (element.type == 'hidden' || element.type == 'submit') return false;
    if (element.hidden === true) return false;
    if (element.disabled) return false;
    let computedStyle = window.getComputedStyle(element, null);
    if (computedStyle.display == 'none') return false;
    if (computedStyle.visibility == 'hidden') return false;
    if (computedStyle.opacity == '0') return false;
    if (computedStyle.width == '0') return false;
    // check the element's coordinates
    var rectangle = element.getBoundingClientRect();
    var viewWidth = window.innerWidth;
    var viewHeight = window.innerHeight;
    if (rectangle.x + rectangle.width < 0) {
        return false;
    }
    if (rectangle.x > viewWidth) {
        return false;
    }
    if (rectangle.y + rectangle.height < 0) {
        return false;
    }
    if (rectangle.y > viewHeight) {
        return false;
    }
    return true;
}

/**
 * Gets the hint text for the given index.
 * @param number index 
 */
function getHintText(index) {
    return characters[Math.floor(index / 24)] + characters[(index % 24)]
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
        let hintText = getHintText(i);
        let hint = document.createElement('div');
        hint.className = 'hinter';
        hint.style.top = rectangle.top + 'px';
        hint.style.left = rectangle.left + 'px';
        //hint.style.height = rectangle.height + 'px';
        //hint.style.width = rectangle.width + 'px';
        hint.innerText = hintText;
        hints[hintText] = {
            element: hint,
            target: element
        };
        element.parentElement.insertBefore(hint, element);
    }
    keys = [];
    captureKeyboard = true;
}

/**
 * Focuses the target element.
 * @param {element} target
 */
function follow(target) {
    let rectangle = target.getBoundingClientRect();
    let element = document.createElement('div');
    element.className = 'hinter-focus';
    element.style.top = (rectangle.top - 1) + 'px';
    element.style.left = (rectangle.left - 1) + 'px';
    element.style.width = (rectangle.width) + 'px';
    element.style.height = (rectangle.height) + 'px';
    target.parentElement.insertBefore(element, target);
    focus = {
        element: element,
        target: target
    };
    target.focus();
    focused = true;
}

/**
 * Clear elements.
 */
function clear() {
    // clear focus
    if (focus) {
        focus.element.parentNode.removeChild(focus.element);
        focus = undefined;
    }
    // clear hints
    for (let property in hints) {
        let element = hints[property].element;
        element.parentNode.removeChild(element);
    }
    hints = {};
    // clear state
    focused = false;
    captureKeyboard = false;
}

/**
 * Process key presses.
 * @param {event} event
 */
function onKeyDown(event) {
    if (focused) {
        clear();
    }
    let element = event.target;
    if (element.contentEditable == true) return;
    if (element.tagName.toLowerCase() == "input") return;
    if (element.tagName.toLowerCase() == "textarea") return;
    if (event.keyCode == 27) {
        clear();
        return;
    }
    if (captureKeyboard) {
        event.stopPropagation();
        event.preventDefault();
        keys.push(String.fromCharCode(event.keyCode).toLowerCase());
        if (keys.length > 2) keys = keys.slice(-2);
        let value = keys.join('');
        if (hints[value]) {
            let target = hints[value].target;
            clear();
            follow(target);
            return;
        }
    }
    if (!captureKeyboard
        && event.shiftKey
        && event.keyCode == activationKey) {
        createHints();
    }
}

// attach the event listener
document.body.addEventListener('keydown', onKeyDown, true);
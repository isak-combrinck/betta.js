/* eslint-disable no-unused-vars */

/* ---------------------------------------
Betta JavaScript

A collection of JavaScript functions.

V 0.0.3 (early alpha)
---------------------------------------*/

/*
Read before hacking.

- Conform to the ESLint standard.
- Anything in the global scope has to start with 'betta_' e.g. 'betta_varName' or 'betta_myFunction'
- Use camelCase for variable and function names e.g. myName, newButton, etc.
- Use Capitalized CamelCase for constant variables e.g. ConstVar, PhoneNumber, etc.
- NO JQUERY! Only plain JavaScript allowed. You'll still find some JQuery thats being replaced.

Parameter naming:
e = event;
t = event.target;

e.g.

function test(e, t) {
  console.log('test');
}

test(event, event.target);

Library dependencies:
- JQuery
- Masonry
*/

'use strict';

// -------------------------------------------------------------------------------------------------
// Lightbox
// -------------------------------------------------------------------------------------------------

let betta_lightboxIsOpen = false; // Boolean for lightbox display state: true = open, false = closed
let betta_lightboxId = null; // ID of image being displayed in lightbox
let betta_lightboxSrc = null; // SRC (URI) for image being displayed in lightbox
let betta_lightboxIdForward = null; // ID of next image, if there is one
let betta_lightboxIdBack = null; // ID of previous image, if there is one
let betta_lightboxCaption = null; // Caption of image, taken from images alt property, null if empty
let betta_lightboxCaptionOpen = false; // Boolean for caption display state

/**
 * Set lightbox navigation buttons based on pictures available
 */
function betta_lightboxSetButtons() {
  document.getElementById('forward').disabled = false;
  document.getElementById('back').disabled = false;

  if (
    document.getElementById(
        betta_lightboxId.split('-')[0] +
        '-' +
        (parseInt(betta_lightboxId.split('-')[1]) - 1),
    ) == null
  ) {
    document.getElementById('back').disabled = true;
  } else {
    betta_lightboxIdBack =
      betta_lightboxId.split('-')[0] +
      '-' +
      (parseInt(betta_lightboxId.split('-')[1]) - 1);
  }

  if (
    document.getElementById(
        betta_lightboxId.split('-')[0] +
        '-' +
        (parseInt(betta_lightboxId.split('-')[1]) + 1),
    ) == null
  ) {
    document.getElementById('forward').disabled = true;
  } else {
    betta_lightboxIdForward =
      betta_lightboxId.split('-')[0] +
      '-' +
      (parseInt(betta_lightboxId.split('-')[1]) + 1);
  }
}

/**
 * Set the currently visible image for the lightbox
 * @param {string} image_id
 */
function betta_lightboxSetImage(image_id) {
  betta_lightboxId = image_id;
  betta_lightboxSrc = document
      .getElementById(betta_lightboxId)
      .querySelector('img').currentSrc;
  betta_lightboxCaption = document
      .getElementById(betta_lightboxId)
      .querySelector('img')
      .getAttribute('alt');

  betta_lightboxSetCaptionBtn(betta_lightboxCaption);

  $('.lightbox .img img').attr('src', betta_lightboxSrc);
  $('.lightbox .img img').attr('alt', betta_lightboxCaption);
  $('.lightbox .caption p').html(betta_lightboxCaption);

  betta_lightboxSetButtons();
}

/**
 * Go forward one image
 */
function betta_lightboxForward() {
  betta_lightboxSetImage(betta_lightboxIdForward);
}

/**
 * Go back one image
 */
function betta_lightboxBack() {
  betta_lightboxSetImage(betta_lightboxIdBack);
}

/**
 * Open lightbox with on image
 * @param {event} e
 */
function betta_lightboxOpen(e) {
  if (betta_isMobile()) {
    // On mobile no lightbox is opened, instead caption is displayed
    betta_overlayCaption(e);
  } else {
    if (!betta_lightboxIsOpen) {
      betta_lightboxIsOpen = true;
      localStorage.setItem('betta_lightboxIsOpen', betta_lightboxIsOpen);

      betta_lightboxSetImage($(e.target).siblings('.photo').attr('id'));

      $('.lightbox').addClass('open');
      betta_scroll(false);

      // Close lightbox
      document.addEventListener('keydown', (event) => {
        if (event.keyCode == 27) {
          betta_lightboxClose();
          event.preventDefault();
        }
      });

      // Toggle caption
      document.addEventListener('keydown', (event) => {
        if (event.keyCode == 32) {
          betta_lightboxToggleCaption();
          event.preventDefault();
        }
      });

      // Add listener to document for left arrow
      document.addEventListener('keydown', (event) => {
        if (event.keyCode == 37) {
          betta_lightboxBack();
          event.preventDefault();
        }
      });

      // Add listener to document for right arrow
      document.addEventListener('keydown', (event) => {
        if (event.keyCode == 39) {
          betta_lightboxForward();
          event.preventDefault();
        }
      });
    }
  }
}

/**
 * Close lightbox
 */
function betta_lightboxClose() {
  if (betta_lightboxIsOpen) {
    if (betta_lightboxCaptionOpen) {
      betta_lightboxCloseCaption();
    }

    betta_lightboxIsOpen = false;
    localStorage.setItem('betta_lightboxIsOpen', betta_lightboxIsOpen);
    betta_lightboxId = null;
    betta_lightboxSrc = null;
    betta_lightboxCaption = null;
    $('.lightbox .middle .caption').removeClass('open');

    $('.lightbox .img img').attr('src', null);
    $('.lightbox .img img').attr('alt', null);
    $('.lightbox .caption p').html(null);
    $('.lightbox').removeClass('open');
    betta_scroll();
  }
}

/**
 * Show or hide the caption button based on if a caption is available
 * @param {string} caption
 */
function betta_lightboxSetCaptionBtn(caption) {
  if (caption == null) {
    $('#caption').hide();
  } else {
    $('#caption').show();
  }
}

/**
 * Show/hide lightbox image caption
 */
function betta_lightboxOpenCaption() {
  betta_lightboxCaptionOpen = true;
  $('.lightbox .middle .caption').addClass('open');
  $('#caption>.icon>img').attr('src', '/icons/subtitles_off.svg');
}

/**
 * Show/hide lightbox image caption
 */
function betta_lightboxCloseCaption() {
  betta_lightboxCaptionOpen = false;
  $('.lightbox .middle .caption').removeClass('open');
  $('#caption>.icon>img').attr('src', '/icons/subtitles.svg');
}

/**
 * Show/hide lightbox image caption
 */
function betta_lightboxToggleCaption() {
  if (betta_lightboxIsOpen && !betta_lightboxCaptionOpen) {
    betta_lightboxOpenCaption();
  } else {
    betta_lightboxCloseCaption();
  }
}

/**
 * Overlay caption on image
 * @param {event} e the click event on the click-plane
 * @return {HTMLElement} returns the click pane, null on error
 */
function betta_overlayCaption(e) {
  const clickPlane = betta_elementOrClosestParentOfType(e.target, 'DIV');

  if (clickPlane.classList.contains('caption')) {
    clickPlane.classList.remove('caption');
    clickPlane.innerHTML = '';
    return null;
  } else {
    const id = betta_previousSiblingElementOfType(
        e.target,
        'PICTURE',
    ).getAttribute('id');
    const caption = document
        .getElementById(id)
        .querySelector('img')
        .getAttribute('alt');
    clickPlane.classList.add('caption');
    clickPlane.innerHTML = '<p>' + caption + '</p>';
    return clickPlane;
  }
}

// Open when clicking on image
betta_listen(
    document.querySelectorAll('.gallery-item>.content>.click-plane'),
    'click',
    betta_lightboxOpen,
);

// Close button
betta_listen(document.getElementById('close'), 'click', betta_lightboxClose);
// Passing to a function that doesn't accept parameters

// Toggle caption button
betta_listen(
    document.getElementById('caption'),
    'click',
    betta_lightboxToggleCaption,
);
// Passing to a function that doesn't accept parameters

// Forward button
betta_listen(
    document.querySelector('.lightbox #forward'),
    'click',
    betta_lightboxForward,
);
// Passing to a function that doesn't accept parameters

// Back button
betta_listen(document.querySelector('.lightbox #back'), 'click', betta_lightboxBack);
// Passing to a function that doesn't accept parameters

// -------------------------------------------------------------------------------------------------

// -------------------------------------------------------------------------------------------------
// Event Listeners
// -------------------------------------------------------------------------------------------------
/**
 * Add event listener, automatically check if single or multiple elements
 * @param {element} element
 * @param {event} e
 * @param {function} f
 */
function betta_listen(element, e, f) {
  if (element) {
    if (NodeList.prototype.isPrototypeOf(element)) {
      betta_addListeners(element, e, f);
    } else {
      betta_addListener(element, e, f);
    }
  }
}

/**
 * Add single event listener
 * @param {element} element
 * @param {event} e
 * @param {function} f
 */
function betta_addListener(element, e, f) {
  element.addEventListener(e, (event) => {
    f(event);
  });
}

/**
 * Add multiple event listeners
 * @param {element} element
 * @param {event} e
 * @param {function} f
 */
function betta_addListeners(element, e, f) {
  element.forEach((item) => {
    betta_addListener(item, e, f);
  });
}
// -------------------------------------------------------------------------------------------------

// -------------------------------------------------------------------------------------------------
// Loaded
// -------------------------------------------------------------------------------------------------
/**
 * Call a function once all elements are loaded
 * (works for picture elements but you have to select the nest img)
 * Note: calling it on all img elements on a page can cause problems,
 * e.g., betta uses an empty img element for the its lightbox, meaning
 * that the loaded function will not trigger, even after all images are
 * loaded.
 * @param {string} selector
 * @param {function} f
 */
function betta_loaded(selector, f) {
  const elements = document.querySelectorAll(selector);
  let elementsAmount = 0;
  let i = 1;

  elements.forEach((element) => {
    element.addEventListener('load', function() {
      i++;
      if (i == elementsAmount) {
        f();
      }
    });

    elementsAmount++;
  });
}

/**
 * Call a function repeatedly as items are progressively loaded
 * (works for picture elements but you have to select the nest img)
 * Note: calling it on all img elements on a page can cause problems,
 * e.g., betta uses an empty img element for the its lightbox, meaning
 * that the loaded function will not trigger, even after all images are
 * loaded.
 * @param {string} selector
 * @param {function} f
 * @param {int} n how frequently to call function, default is after every loaded item
 */
function betta_loadedProgressive(selector, f, n = 4) {
  const elements = document.querySelectorAll(selector);
  let elementsAmount = 0;
  let i = 1;
  let progress = 1;

  elements.forEach((element) => {
    element.addEventListener('load', function() {
      i++;
      if ((i == progress + n) || (i == elementsAmount)) {
        progress = i;
        f();
      }
    });

    elementsAmount++;
  });
}
// -------------------------------------------------------------------------------------------------

// -------------------------------------------------------------------------------------------------
// Mobile Device
// -------------------------------------------------------------------------------------------------
/**
 * Check if on mobile device (screen 800px wide or less)
 * @return {boolean} true if on mobile device, false if not
 */
function betta_isMobile() {
  const width = window.innerWidth > 0 ? window.innerWidth : screen.width;
  if (width <= 800) {
    return true;
  } else {
    return false;
  }
}

// -------------------------------------------------------------------------------------------------
// Load Masonry
// -------------------------------------------------------------------------------------------------
/**
 * Load Masonry, layout once images are loaded
 * @return a reference to the Masonry object
 * @param {string} grid
 * @param {string} item
 * @return {object} masonry object
 */
function betta_loadMasonry(grid, item) {
  const msnry = new Masonry(grid, {
    itemSelector: item,
    columnWidth: item,
    percentPosition: true,
  });
  msnry.reloadItems();

  return msnry;
}
// -------------------------------------------------------------------------------------------------

// -------------------------------------------------------------------------------------------------
// Scroll / no scroll
// -------------------------------------------------------------------------------------------------
/**
 * Enable or disable scrolling on all platforms
 * @param {boolean} scroll whether scroll should be enabled or not
 */
function betta_scroll(scroll = true) {
  if (!scroll) {
    document.querySelector('body').classList.add('no-scroll');
  } else {
    document.querySelector('body').classList.remove('no-scroll');
  }
}

/**
 * Enable or disable scrolling on mobile only
 * @param {boolean} scroll whether scroll should be enabled or not
 */
function betta_scrollMobile(scroll = true) {
  if (!scroll) {
    document.querySelector('body').classList.add('no-scroll-mobile');
  } else {
    document.querySelector('body').classList.remove('no-scroll-mobile');
  }
}
// -------------------------------------------------------------------------------------------------

// -------------------------------------------------------------------------------------------------
// Show
// -------------------------------------------------------------------------------------------------
/**
 * Add show class, remove if optional bool is passed
 * @param {element} element
 * @param {boolean} show
 */
function betta_show(element, show = true) {
  if (show) {
    document.querySelector(element).classList.add('show');
  } else {
    document.querySelector(element).classList.remove('show');
  }
}

// -------------------------------------------------------------------------------------------------

// -------------------------------------------------------------------------------------------------
// Hide
// -------------------------------------------------------------------------------------------------
/**
 * Add hide class, remove if optional bool is passed
 * @param {element} element
 * @param {boolean} hide
 */
 function betta_hide(element, hide = true) {
  if (hide) {
    element.classList.add('hide');
  } else {
    element.classList.remove('hide');
  }
}

// -------------------------------------------------------------------------------------------------

// -------------------------------------------------------------------------------------------------
// Main Navigation Menu
// There can only be one main navigation menu per page.
// -------------------------------------------------------------------------------------------------
let betta_menu = false;

/**
 * Toggle the menu
 */
function betta_toggleMenu() {
  if (betta_menu) {
    // Close menu
    document.querySelector('#betta_menu-button>.icon').innerHTML =
      '<img src="/icons/menu.svg" alt="Menu">';

    betta_scrollMobile();

    betta_show('body>nav', false);

    betta_menu = false;
  } else {
    // Open menu
    document.querySelector('#betta_menu-button>.icon').innerHTML =
      '<img src="/icons/close.svg" alt="Close">';

    betta_scrollMobile(false);

    betta_show('body>nav');

    betta_menu = true;
  }
}

betta_listen(document.querySelector('#betta_menu-button'), 'click', betta_toggleMenu);
// -------------------------------------------------------------------------------------------------

// -------------------------------------------------------------------------------------------------
// Action Menu
// There can only be one action menu per page.
// -------------------------------------------------------------------------------------------------
let betta_actionMenu = false;

/**
 * Toggle action menu visibility
 */
function betta_toggleActionMenu() {
  if (betta_actionMenu) {
    // Close action menu
    document.querySelector(
        '.betta_action-menu>button>.material-icons-round',
    ).innerHTML = 'connect_without_contact';
    document
        .querySelector('.betta_action-menu>.blur-pane')
        .removeEventListener('click', betta_toggleActionMenu);

    betta_scrollMobile();

    betta_show('.betta_action-menu>.content', false);
    betta_show('.betta_action-menu>.blur-pane', false);

    betta_actionMenu = false;
  } else {
    // Open action menu
    document.querySelector(
        '.betta_action-menu>button>.material-icons-round',
    ).innerHTML = 'close';
    betta_listen(
        document.querySelector('.betta_action-menu>.blur-pane'),
        'click',
        betta_toggleActionMenu,
    );

    betta_scrollMobile(false);

    betta_show('.betta_action-menu>.content');
    betta_show('.betta_action-menu>.blur-pane');

    betta_actionMenu = true;
  }
}

betta_listen(
    document.querySelectorAll('.betta_action-menu>button'),
    'click',
    betta_toggleActionMenu,
);
// -------------------------------------------------------------------------------------------------

// -------------------------------------------------------------------------------------------------
// Mailto
// -------------------------------------------------------------------------------------------------
/**
 * Send email to the given address
 * @param {string} email
 */
function betta_email(email) {
  window.location.href = 'mailto:' + email;
}
// -------------------------------------------------------------------------------------------------

// -------------------------------------------------------------------------------------------------
// Call
// -------------------------------------------------------------------------------------------------
/**
 * Call a phone number
 * @param {string} number
 */
function betta_call(number) {
  window.open(`tel:${number}`, '_self');
}
// -------------------------------------------------------------------------------------------------

/**
 * Clear the files selected to be uploaded in a form file input field
 * NOTE: Element calling the clear must be a next sibling of the input element to be cleared
 * @param {event} event
 * @return {boolean} that reflects success/failure of function
 */
function betta_clearFileInput(event) {
  // Get the button element, even if click was on icon
  const button = betta_elementOrClosestParentOfType(event.target, 'BUTTON');
  // Get the previous sibling that is an input field
  const fileInputElement = betta_previousSiblingElementOfType(button, 'INPUT');

  if (fileInputElement.value) {
    try {
      fileInputElement.value = '';
      betta_callChangeEvent(fileInputElement);

      return true;
    } catch (error) {
      // Form file input could not be cleared
    }
  }

  return false;
}

/**
 * Call change event on element
 * @param {element} element
 * @return {boolean} that reflects success/failure of function
 */
function betta_callChangeEvent(element) {
  try {
    if ('createEvent' in document) {
      const event = document.createEvent('HTMLEvents');
      event.initEvent('change', false, true);
      element.dispatchEvent(event);
    } else {
      element.fireEvent('onchange');
    }

    return true;
  } catch (error) {
    // Change event could not be called
  }

  return false;
}

/**
 * Get previous sibling element of specified type
 * @param {element} element the element to start the search from
 * @param {string} type the type of element to search for
 * @return {element} element, if present, otherwise null
 */
function betta_previousSiblingElementOfType(element, type) {
  try {
    while (element.previousElementSibling != null) {
      if (element.previousElementSibling.nodeName == type) {
        return element.previousElementSibling;
      } else {
        element = element.previousElementSibling;
      }
    }
  } catch (error) {
    // Could not search for element
  }
  // Element not found
  return null;
}

/**
 * Get the next element of a specified type, starting at the element provided
 * Can be used to get the button even if a click was on child element
 * NOTE: search includes the the element provided
 * @param {element} element the element to start the search with
 * @param {string} type the type of element to look for
 * @return {element} element, if found, otherwise null
 */
function betta_elementOrClosestParentOfType(element, type) {
  try {
    while (element != null) {
      if (element.nodeName == type) {
        return element;
      } else {
        element = element.parentNode;
      }
    }
  } catch (error) {
    // Could not search for element
  }
  // Element not found
  return null;
}

/**
 * Change theme
 */
 function betta_changeTheme() {
  try {
    if (document.body.classList.contains('dark')) {
      betta_show('#loader', true);

      document.body.classList.remove('dark');

      localStorage.setItem('dark', false);

      setTimeout(function(){
        betta_show('#loader', false);
      }, 750);
      return true;
    } else {
      betta_show('#loader', true);

      document.body.classList.add('dark');

      localStorage.setItem('dark', true);

      setTimeout(function(){
        betta_show('#loader', false);
      }, 750);
      return true;
    }
  } catch (error) {
    // Could not change theme
  }
  // Could not change theme
  return null;
}

betta_listen(document.getElementById('betta_theme-button'), 'click', betta_changeTheme);

// -------------------------------------------------------------------------------------------------
// Image Strip
// -------------------------------------------------------------------------------------------------

/**
   * Image strip state updating
   * @param {element} element
   * @param {number} scrollPosition
   */
 function betta_imageStripState(element, scrollPosition, length) {
  if (scrollPosition < 10) {
    betta_hide(element.querySelector('button.back'), true);
    return true;
  } else if (scrollPosition > 0) {
    betta_hide(element.querySelector('button.back'), false);
  }

  if (scrollPosition >= 2 * (element.scrollWidth / length) - 10) {
    betta_hide(element.querySelector('button.forward'), true);
    return true;
  } else if (scrollPosition <= 2 * (element.scrollWidth / length) - 10) {
    betta_hide(element.querySelector('button.forward'), false);
  }
}

/**
 * Image strip scroll right
 * @param {event} e
 */
function betta_scrollRight(e) {
  let imageStrip = betta_elementOrClosestParentOfType(e.target, "BUTTON")
      .parentElement.parentElement,
    scrollPosition = imageStrip.scrollLeft,
    imageStripLength = imageStrip.childElementCount - 2;

  if ((scrollPosition += imageStrip.scrollWidth / imageStripLength) > imageStrip.scrollWidth) {
    scrollPosition = imageStrip.scrollWidth;
  }

  imageStrip.scroll({
    top: 0,
    left: scrollPosition,
    behavior: "smooth",
  });

  betta_imageStripState(imageStrip, scrollPosition, imageStripLength);
}

/**
 * Image strip scroll left
 * @param {event} e
 */
function betta_scrollLeft(e) {
  let imageStrip = betta_elementOrClosestParentOfType(e.target, "BUTTON")
      .parentElement.parentElement,
    scrollPosition = imageStrip.scrollLeft,
    imageStripLength = imageStrip.childElementCount - 2;

  if ((scrollPosition -= imageStrip.scrollWidth / imageStripLength) < 0) {
    scrollPosition = 0;
  }

  imageStrip.scroll({
    top: 0,
    left: scrollPosition,
    behavior: "smooth",
  });

  betta_imageStripState(imageStrip, scrollPosition, imageStripLength);
}

betta_listen(document.querySelectorAll(".betta_image-strip .back"), "click", betta_scrollLeft);
betta_listen(document.querySelectorAll(".betta_image-strip .forward"), "click", betta_scrollRight);
// -------------------------------------------------------------------------------------------------

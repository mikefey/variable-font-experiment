document.addEventListener('DOMContentLoaded', () => {
  const CONTAINER_SELECTOR = '.app-container';
  const TEXT = 'HELLOWORLD';
  const CONTAINER = document.querySelector(CONTAINER_SELECTOR);
  const MAX_FONT_WEIGHT = 900;
  const MAX_DISTANCE = 400;
  const MAX_FONT_LOAD_ATTEMPTS = 20;

  let fontLoadAttempts = 0;
  let allLetters;
  let positions;
  let fontLoaded = false;

  const throttle = (callback, interval) => {
    let enableCall = true;
  
    return function(...args) {
      if (!enableCall) return;
  
      enableCall = false;
      callback.apply(this, args);
      setTimeout(() => enableCall = true, interval);
    }
  }

  const generateTextBlock = () => {
    const container = document.createElement('div');
    container.className = 'text-block';

    Array.from(TEXT).forEach((letter) => {
      const letterWrapper = document.createElement('div');
      const formattedLetter = letter === ' ' ? '&nbsp;' : letter;

      letterWrapper.className = 'letter';
      letterWrapper.innerHTML = formattedLetter;
      container.appendChild(letterWrapper);
    });

    return container;
  }

  const checkForFontLoad = ({ callback, initialTextWidth, sizingContainer }) => {
    let itw = initialTextWidth;
    let sc = sizingContainer;

    if (!itw) {
      sc = generateTextBlock();
      sc.style.opacity = '0';
      CONTAINER.appendChild(sc);
      itw = sc.offsetWidth;
    }

    if (sc.offsetWidth === itw && !fontLoaded && fontLoadAttempts < MAX_FONT_LOAD_ATTEMPTS) {
      setTimeout(() => {
        checkForFontLoad({
          callback: callback,
          initialTextWidth: itw,
          sizingContainer: sc,
        });
      }, 100);
    } else {
      fontLoaded = true;

      callback({
        sizingContainerWidth: sc.offsetWidth,
        sizingContainerHeight:
        sc.offsetHeight,
      });

      if (sc.parentNode) {
        sc.parentNode.removeChild(sc);
      }
    }

    fontLoadAttempts++;
  }

  const animateLetters = (inputX, inputY) => {
    positions.forEach((position, index) => {
      const horizontalDistance = inputX - position.x;
      const verticalDistance = inputY - position.y;
      const totalDistance = Math.sqrt(Math.pow(horizontalDistance, 2) + Math.pow(verticalDistance, 2));

      if (totalDistance < MAX_DISTANCE) {
        let fontWeight = (MAX_FONT_WEIGHT - (totalDistance * 3));
        if (fontWeight < 300) {
          fontWeight = 300;
        }

        allLetters[index].style.fontWeight = fontWeight;
      } else {
        if (allLetters[index].style.fontWeight > 300) {
          allLetters[index].style.fontWeight = 300;
        }
      }      
    })
  }

  const mouseMoveHandler = throttle((e) => {
    animateLetters(e.clientX, e.clientY);
  }, 50);

  const touchStartHandler = (e) => {
    const changes = e.changedTouches;
    animateLetters(changes[0].clientX, changes[0].clientY);
  };

  const touchEndHandler = () => {
    animateLetters(-10, -10);
  };

  const touchMoveHandler = throttle((e) => {
    const changes = e.changedTouches;
    animateLetters(changes[0].clientX, changes[0].clientY);
    e.preventDefault();
  }, 10);

  const init = () => {
    CONTAINER.removeEventListener('mousemove', mouseMoveHandler);
    CONTAINER.removeEventListener('touchstart', touchStartHandler);
    CONTAINER.removeEventListener('touchmove', touchMoveHandler);
    CONTAINER.removeEventListener('touchend', touchEndHandler);

    allLetters = document.querySelectorAll('.letter');
    positions = [];

    allLetters.forEach((letter) => {
      const rect = letter.getBoundingClientRect();
      const { top, right, bottom, left } = rect;
      const centerLeft = left + ((right - left) / 2);
      const centerTop = top + ((bottom - top) / 2);

      positions.push({ x: centerLeft, y: centerTop });
    })

    CONTAINER.addEventListener('mousemove', mouseMoveHandler);
    CONTAINER.addEventListener('touchstart', touchStartHandler);
    CONTAINER.addEventListener('touchmove', touchMoveHandler);
    CONTAINER.addEventListener('touchend', touchEndHandler);
  }

  const layoutText = ({ sizingContainerWidth, sizingContainerHeight }) => {
    CONTAINER.innerHTML = '';
    const numRows = Math.ceil(CONTAINER.offsetHeight / sizingContainerHeight);
    const numColumns = Math.ceil(CONTAINER.offsetWidth / sizingContainerWidth);
    let rowInc = 0;
    let colInc = 0;
    let total = numRows * numColumns;

    for (let i = 0; i < total; i++) {
      const tb = generateTextBlock();

      CONTAINER.appendChild(tb);
      tb.style.left = `${(colInc * sizingContainerWidth)}px`;
      tb.style.top = `${(rowInc * sizingContainerHeight)}px`;
      tb.style.width = `${(sizingContainerWidth + 5)}px`;

      const tbLetters = tb.querySelectorAll('.letter')
      let widthAcc = 0;

      tbLetters.forEach((letter) => {
        letter.style.width = letter.offsetWidth;
        letter.style.left = widthAcc;
        letter.style.position = 'absolute';
        widthAcc += letter.offsetWidth;
        letter.style.fontWeight = 300;
      })

      colInc++;

      if (colInc > numColumns - 1) {
        colInc = 0;
        rowInc++;
      }
    }

    init();
  }

  const resizeHandler = throttle(() => {
    checkForFontLoad({ callback: layoutText });
  }, 10);

  window.addEventListener('resize', resizeHandler);
  checkForFontLoad({ callback: layoutText });
});

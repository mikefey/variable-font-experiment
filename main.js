document.addEventListener('DOMContentLoaded', () => {
  const CONTAINER_SELECTOR = '.app-container';
  const TEXT = 'XO';
  const CONTAINER = document.querySelector(CONTAINER_SELECTOR);
  const MAX_FONT_WEIGHT = 900;
  const MAX_DISTANCE = 400;

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
      CONTAINER.appendChild(sc);
      itw = sc.offsetWidth;
    }

    if (sc.offsetWidth === itw) {
      setTimeout(() => {
        checkForFontLoad({
          callback: callback,
          initialTextWidth: itw,
          sizingContainer: sc,
        });
      }, 100);
    } else {
      callback({
        sizingContainerWidth: sc.offsetWidth,
        sizingContainerHeight:
        sc.offsetHeight,
      });

      CONTAINER.removeChild(sc);
    }
  }

  const init = () => {
    const allLetters = document.querySelectorAll('.letter');
    const positions = [];

    allLetters.forEach((letter) => {
      const rect = letter.getBoundingClientRect();
      const { top, right, bottom, left } = rect;
      const centerLeft = left + ((right - left) / 2);
      const centerTop = top + ((bottom - top) / 2);

      positions.push({ x: centerLeft, y: centerTop });
    })

    CONTAINER.addEventListener('mousemove', throttle((e) => {
      positions.forEach((position, index) => {
        const horizontalDistance = e.clientX - position.x;
        const verticalDistance = e.clientY - position.y;
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
    }, 50));
  }

  const layoutText = ({ sizingContainerWidth, sizingContainerHeight }) => {
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

  checkForFontLoad({ callback: layoutText });
});

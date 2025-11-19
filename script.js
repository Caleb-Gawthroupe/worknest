// Page load animations
document.addEventListener('DOMContentLoaded', () => {
  // Animate name label - fade in from left
  anime({
    targets: '#name-label',
    opacity: [0, 1],
    translateX: [-20, 0],
    duration: 600,
    easing: 'easeOutCubic',
    delay: 200
  });

  // Animate central text - fade in with scale
  const centralText = document.getElementById('central-text');
  // Ensure initial centered position
  centralText.style.transform = 'translate(-50%, -50%) scale(0.9)';
  anime({
    targets: centralText,
    opacity: [0, 1],
    scale: [0.9, 1],
    duration: 800,
    easing: 'easeOutCubic',
    delay: 400,
    update: function(anim) {
      // Always maintain translate(-50%, -50%) for centering while animating scale
      const scale = anim.animatables[0].target.scale;
      centralText.style.transform = `translate(-50%, -50%) scale(${scale})`;
    },
    complete: function() {
      // Ensure final centered position
      centralText.style.transform = 'translate(-50%, -50%) scale(1)';
    }
  });

  // Animate input container - pop up from bottom with fade
  const inputContainer = document.getElementById('input-container');
  // Animate a dummy object to control translateY manually, preventing anime from touching the element's transform
  const inputContainerAnim = { translateY: 20, opacity: 0 };
  anime({
    targets: inputContainerAnim,
    translateY: [20, 0],
    opacity: [0, 1],
    duration: 700,
    easing: 'easeOutCubic',
    delay: 800,
    update: function(anim) {
      // Always maintain horizontal centering while animating vertical position
      // Get values from our animated object
      const translateY = inputContainerAnim.translateY;
      const opacity = inputContainerAnim.opacity;
      inputContainer.style.transform = `translate(-50%, ${translateY}px)`;
      inputContainer.style.opacity = opacity;
    },
    complete: function() {
      // Ensure final centered position
      inputContainer.style.transform = 'translate(-50%, 0)';
      inputContainer.style.opacity = '1';
    }
  });

  // Animate filter selects - stagger fade in
  anime({
    targets: '.filter-select',
    opacity: [0, 1],
    scale: [0.95, 1],
    duration: 500,
    easing: 'easeOutCubic',
    delay: anime.stagger(100, {start: 1200})
  });

  // Animate arrow button - fade in with slight scale
  anime({
    targets: '.arrow-btn',
    opacity: [0, 1],
    scale: [0.8, 1],
    duration: 500,
    easing: 'easeOutBack',
    delay: 1500
  });

  // Filter select functionality
  const filterSelects = document.querySelectorAll('.filter-select');
  
  filterSelects.forEach(select => {
    select.addEventListener('change', (e) => {
      // Handle filter changes if needed
      console.log('Filter changed:', e.target.value);
    });
  });

  // Background floating shapes animations - fade in with the rest of the page
  const shapes = document.querySelectorAll('.floating-shape');
  
  shapes.forEach((shape, index) => {
    // Create infinite floating animation for each shape
    const randomX = (Math.random() - 0.5) * 200;
    const randomY = (Math.random() - 0.5) * 200;
    const randomDuration = 8000 + Math.random() * 4000; // 8-12 seconds
    const randomDelay = index * 100; // Stagger by 100ms instead of 500ms
    
    // Initial fade in - faster and earlier
    anime({
      targets: shape,
      opacity: [0, 0.15],
      duration: 600,
      delay: 600 + randomDelay,
      easing: 'easeOutQuad'
    });
    
    // Continuous floating animation - smooth back-and-forth movement
    const animObj = { x: 0, y: 0, rotation: 0 };
    
    function floatShape() {
      anime({
        targets: animObj,
        x: [0, randomX, -randomX, 0],
        y: [0, randomY, -randomY, 0],
        rotation: 360,
        duration: randomDuration * 2,
        easing: 'easeInOutSine',
        delay: 600 + randomDelay,
        update: function() {
          shape.style.transform = `translate(${animObj.x}px, ${animObj.y}px) rotate(${animObj.rotation}deg)`;
        },
        complete: function() {
          animObj.rotation = 0; // Reset rotation for next loop
          floatShape(); // Loop infinitely
        }
      });
    }
    
    floatShape();
  });

  // Arrow button click handler - resize and reposition to bottom left
  const arrowBtn = document.querySelector('.arrow-btn');
  let hasMoved = false;

  arrowBtn.addEventListener('click', () => {
    if (hasMoved) return; // One-way transition, don't move back
    
    hasMoved = true;
    const margin = 20;
    const halfWidth = (window.innerWidth / 2) - (margin * 2);

    // Get current computed positions
    const centralTextRect = centralText.getBoundingClientRect();
    const inputContainerRect = inputContainer.getBoundingClientRect();
    
    // Calculate final positions in pixels
    const finalCentralTextLeft = margin;
    const finalCentralTextTop = window.innerHeight - (margin + 250) - centralTextRect.height;
    const finalInputLeft = margin;
    // Position input container just below the central text with some spacing
    const spacing = 20;
    const finalInputTop = finalCentralTextTop + centralTextRect.height + spacing;
    
    // Calculate deltas from current position
    const centralTextDeltaX = finalCentralTextLeft - centralTextRect.left;
    const centralTextDeltaY = finalCentralTextTop - centralTextRect.top;
    const inputDeltaX = finalInputLeft - inputContainerRect.left;
    const inputDeltaY = finalInputTop - inputContainerRect.top;

    // Cache center positions to avoid recalculation
    const centerX = window.innerWidth / 2;
    const centerYCentral = window.innerHeight * 0.45;
    const centerYInput = window.innerHeight * 0.55;

    // Set will-change for better performance and force GPU acceleration
    centralText.style.willChange = 'transform';
    centralText.style.backfaceVisibility = 'hidden';
    inputContainer.style.willChange = 'transform, width, height';
    inputContainer.style.backfaceVisibility = 'hidden';

    // Get current height and calculate target height (increase by 50%)
    const currentHeight = inputContainerRect.height;
    const targetHeight = currentHeight * 1.5; // Increase height by 50%

    // Use dummy objects to avoid conflicts with existing transforms
    const centralTextAnim = { offsetX: 0, offsetY: 0 };
    const inputContainerAnim = { offsetX: 0, offsetY: 0, w: inputContainerRect.width, h: currentHeight };

    // Animate central text
    anime({
      targets: centralTextAnim,
      offsetX: [0, centralTextDeltaX],
      offsetY: [0, centralTextDeltaY],
      duration: 600,
      easing: 'easeOutCubic',
      update: function() {
        // Only update transform during animation to avoid layout recalculations
        const offsetX = centralTextAnim.offsetX;
        const offsetY = centralTextAnim.offsetY;
        // Calculate translate from the -50% center position
        centralText.style.transform = `translate3d(calc(-50% + ${offsetX}px), calc(-50% + ${offsetY}px), 0)`;
      },
      complete: function() {
        // Set final position
        centralText.style.top = finalCentralTextTop + 'px';
        centralText.style.left = finalCentralTextLeft + 'px';
        centralText.style.transform = 'translate3d(0, 0, 0)';
        centralText.style.textAlign = 'left';
        centralText.style.willChange = 'auto';
        centralText.style.backfaceVisibility = '';
      }
    });

    // Animate input container - increase height and position below text
    anime({
      targets: inputContainerAnim,
      offsetX: [0, inputDeltaX],
      offsetY: [0, inputDeltaY],
      w: [inputContainerRect.width, halfWidth],
      h: [currentHeight, targetHeight], // Increase height
      duration: 600,
      easing: 'easeOutCubic',
      update: function() {
        // Only update transform, width, and height during animation
        const offsetX = inputContainerAnim.offsetX;
        const offsetY = inputContainerAnim.offsetY;
        const w = inputContainerAnim.w;
        const h = inputContainerAnim.h;
        inputContainer.style.width = w + 'px';
        inputContainer.style.height = h + 'px';
        inputContainer.style.transform = `translate3d(calc(-50% + ${offsetX}px), ${offsetY}px, 0)`;
      },
      complete: function() {
        // Set final position with increased height
        // Calculate top position to ensure bottom margin: window height - bottom margin - container height
        const finalTopWithBottomMargin = window.innerHeight - margin - targetHeight;
        // Use the lower of: below text position OR position that gives bottom margin
        const finalTop = Math.max(finalInputTop, finalTopWithBottomMargin)-50;
        
        inputContainer.style.top = finalTop + 'px';
        inputContainer.style.left = finalInputLeft + 'px';
        inputContainer.style.transform = 'translate3d(0, 0, 0)';
        inputContainer.style.width = halfWidth + 'px';
        inputContainer.style.height = targetHeight + 'px';
        inputContainer.style.willChange = 'auto';
        inputContainer.style.backfaceVisibility = '';
      }
    });
  });
});

// ===== bio.js =====

const bioText = `Francesco and Arielle.`;

// Path to your silhouette image
const imgSrc = 'images/biography.png';

// Get the About link
const aboutLink = document.getElementById('about-link');

aboutLink.addEventListener('click', (e) => {
  e.preventDefault();

  const main = document.querySelector('main');

  // Prevent adding multiple times
  if (document.getElementById('ascii')) return;

  // Create <pre> element
  const ascii = document.createElement('pre');
  ascii.id = 'ascii';
  ascii.style.fontFamily = 'monospace';
  ascii.style.fontSize = '15px';
  ascii.style.lineHeight = '1';
  ascii.style.whiteSpace = 'pre';
  ascii.style.cursor = 'default';
  ascii.style.display = 'inline-block';
  ascii.style.marginTop = '20px';

  ascii.textContent = 'Loading...';
  main.appendChild(ascii);

  // Create hidden canvas to read the image
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  const img = new Image();
  img.src = imgSrc;
  img.onload = () => {
    const width = 100; // number of characters per row
    const scale = width / img.width;
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0, img.width, img.height);

    const imgData = ctx.getImageData(0, 0, img.width, img.height);
    const pixels = [];
    let bioIndex = 0;

    // Convert image to ASCII grid
    for (let y = 0; y < img.height; y += Math.ceil(1 / scale)) {
      const row = [];
      for (let x = 0; x < img.width; x += Math.ceil(1 / scale)) {
        const index = (y * img.width + x) * 4;
        const r = imgData.data[index];
        const g = imgData.data[index + 1];
        const b = imgData.data[index + 2];
        const brightness = (r + g + b) / 3;

        if (brightness < 160) {
          row.push(bioText[bioIndex % bioText.length]);
          bioIndex++;
        } else {
          row.push(' ');
        }
      }
      pixels.push(row);
    }

    // Animate the reveal
    let display = pixels.map(row => row.map(() => ' '));
    let totalChars = pixels.flat().length;
    let currentChar = 0;

    function step() {
      if (currentChar >= totalChars) return;
      let count = 0;

      outer: for (let y = 0; y < pixels.length; y++) {
        for (let x = 0; x < pixels[y].length; x++) {
          if (display[y][x] === ' ' && pixels[y][x] !== ' ') {
            display[y][x] = pixels[y][x];
            currentChar++;
            count++;
            if (count >= 10) break outer; // reveal 10 chars per frame
          }
        }
      }

      ascii.textContent = display.map(row => row.join('')).join('\n');
      requestAnimationFrame(step);
    }

    step();
  };
});

// References to DOM elements
const imageContainer = document.getElementById('image-container');
const imageUpload = document.getElementById('image-upload');
const hueSlider = document.getElementById('hue-slider');
const blurSlider = document.getElementById('blur-slider');
const saturationSlider = document.getElementById('saturation-slider');
const contrastSlider = document.getElementById('contrast-slider');
const sepiaSlider = document.getElementById('sepia-slider'); // New slider for sepia
const downloadButton = document.getElementById('download-btn');
const resetButton = document.getElementById('reset-btn'); // Reset button reference

// Image and canvas setup
let originalImage = null;
let canvas = document.createElement('canvas');
let ctx = canvas.getContext('2d');

// Event: Image Upload
imageUpload.addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (!file || !file.type.startsWith('image/')) {
    alert('Please upload a valid image file.');
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = () => {
      originalImage = img;
      drawPreview(img);
    };
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
});

// Function: Draw Image Preview
function drawPreview(img) {
  canvas.width = img.width;
  canvas.height = img.height;
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  // Display low-quality preview
  const previewCanvas = document.createElement('canvas');
  const previewCtx = previewCanvas.getContext('2d');
  previewCanvas.width = 300; // Smaller width for preview
  previewCanvas.height = (300 / img.width) * img.height;
  previewCtx.drawImage(img, 0, 0, previewCanvas.width, previewCanvas.height);

  imageContainer.innerHTML = ''; // Clear the container
  imageContainer.appendChild(previewCanvas);
}

// Event: Sliders (Real-time Updates)
[hueSlider, blurSlider, saturationSlider, contrastSlider, sepiaSlider].forEach((slider) => {
  slider.addEventListener('input', applyFilters);
});

// Function: Apply Filters
function applyFilters() {
  if (!originalImage) return;

  const hueValue = parseInt(hueSlider.value);
  const blurAmount = parseFloat(blurSlider.value);
  const saturationValue = parseFloat(saturationSlider.value) / 100;
  const contrastValue = parseFloat(contrastSlider.value) / 100;
  const sepiaIntensity = parseFloat(sepiaSlider.value) / 100; // New variable for sepia

  console.log(`Hue: ${hueValue}, Blur: ${blurAmount}, Saturation: ${saturationValue}, Contrast: ${contrastValue}, Sepia: ${sepiaIntensity}`); // Debug line

  // Clear the canvas and draw the image
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(originalImage, 0, 0, canvas.width, canvas.height);

  // Apply filters
  ctx.filter = `
    hue-rotate(${hueValue}deg)
    sepia(${sepiaIntensity})
    saturate(${saturationValue})
    contrast(${contrastValue})
  `;
  ctx.drawImage(originalImage, 0, 0); // Redraw image with applied filters

  // Apply highlight blur if specified
  if (blurAmount > 0) {
    applyHighlightBlur(blurAmount);
  }

  // Update the preview
  const previewCanvas = imageContainer.querySelector('canvas');
  const previewCtx = previewCanvas.getContext('2d');
  previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
  previewCtx.drawImage(canvas, 0, 0, previewCanvas.width, previewCanvas.height);
}
  

// Function: Apply Highlight Blur// Apply Highlight Blur
function applyHighlightBlur(blurAmount) {
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  // Create a mask for the highlight areas
  const highlightMask = createHighlightMask(data);

  // Apply Gaussian blur to the masked areas only
  const tempCanvas = document.createElement('canvas');
  const tempCtx = tempCanvas.getContext('2d');
  tempCanvas.width = canvas.width;
  tempCanvas.height = canvas.height;

  // Draw the original image on the temp canvas
  tempCtx.putImageData(imageData, 0, 0);

  // Apply Gaussian blur to the highlighted areas using the mask
  applyGaussianBlurToMask(tempCtx, highlightMask, blurAmount);

  // Get the blurred image data
  const blurredImageData = tempCtx.getImageData(0, 0, canvas.width, canvas.height);

  // Combine the original image data with the blurred areas
  for (let i = 0; i < data.length; i += 4) {
    if (highlightMask[i / 4] > 0) {
      // Only apply blur to the highlighted areas
      data[i] = blurredImageData.data[i];     // Red
      data[i + 1] = blurredImageData.data[i + 1]; // Green
      data[i + 2] = blurredImageData.data[i + 2]; // Blue
    }
  }

  // Put the combined data back into the canvas
  ctx.putImageData(imageData, 0, 0);
}

// Create a highlight mask based on pixel brightness
function createHighlightMask(data) {
  const mask = [];
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // Calculate the brightness (luminance) of the pixel
    const brightness = 0.2126 * r + 0.7152 * g + 0.0722 * b;

    // Mark the pixel as a highlight (if brightness is high enough)
    if (brightness > 220) {  // Adjust this threshold for highlights
      mask[i / 4] = 1;
    } else {
      mask[i / 4] = 0;
    }
  }
  return mask;
}
// Function: Apply Highlight Blur and Hue to Blurred Highlights Only
function applyHighlightBlur(blurAmount) {
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  // Create a mask for the highlight areas
  const highlightMask = createHighlightMask(data);

  // Apply Gaussian blur to the masked areas only
  const tempCanvas = document.createElement('canvas');
  const tempCtx = tempCanvas.getContext('2d');
  tempCanvas.width = canvas.width;
  tempCanvas.height = canvas.height;

  // Draw the original image on the temp canvas
  tempCtx.putImageData(imageData, 0, 0);

  // Apply Gaussian blur to the highlighted areas using the mask
  applyGaussianBlurToMask(tempCtx, highlightMask, blurAmount);

  // Get the blurred image data
  const blurredImageData = tempCtx.getImageData(0, 0, canvas.width, canvas.height);

  // Apply the hue to only the blurred highlighted areas
  const hueValue = parseInt(hueSlider.value);
  applyHueToBlurredHighlights(blurredImageData, highlightMask, hueValue);

  // Combine the original image data with the blurred and hue-adjusted areas
  for (let i = 0; i < data.length; i += 4) {
    if (highlightMask[i / 4] > 0) {
      // Only apply blur and hue to the highlighted areas
      data[i] = blurredImageData.data[i];     // Red
      data[i + 1] = blurredImageData.data[i + 1]; // Green
      data[i + 2] = blurredImageData.data[i + 2]; // Blue
    }
  }

  // Put the combined data back into the canvas
  ctx.putImageData(imageData, 0, 0);
}

// Apply hue rotation to the blurred highlights
function applyHueToBlurredHighlights(blurredImageData, highlightMask, hueValue) {
  const data = blurredImageData.data;

  for (let i = 0; i < data.length; i += 4) {
    if (highlightMask[i / 4] > 0) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      // Convert the RGB to HSL
      let hsl = rgbToHsl(r, g, b);

      // Apply hue rotation
      hsl[0] = (hsl[0] + hueValue / 360) % 1;

      // Convert back to RGB
      const [newR, newG, newB] = hslToRgb(hsl[0], hsl[1], hsl[2]);

      // Update the blurred image data with the new RGB values after hue rotation
      data[i] = newR;
      data[i + 1] = newG;
      data[i + 2] = newB;
    }
  }
}

// Convert RGB to HSL
function rgbToHsl(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  let h = 0;
  let s = 0;
  let l = (max + min) / 2;

  if (delta !== 0) {
    s = delta / (1 - Math.abs(2 * l - 1));
    if (max === r) {
      h = (g - b) / delta;
    } else if (max === g) {
      h = (b - r) / delta + 2;
    } else {
      h = (r - g) / delta + 4;
    }
    h /= 6;
    if (h < 0) h += 1;
  }

  return [h, s, l];
}

// Convert HSL to RGB
function hslToRgb(h, s, l) {
  let r, g, b;

  if (s === 0) {
    r = g = b = l * 255;
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return [r * 255, g * 255, b * 255];
}
// Apply Gaussian blur only to the mask (highlight areas)
function applyGaussianBlurToMask(ctx, mask, blurAmount) {
  const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
  const data = imageData.data;

  // Apply the Gaussian blur on the highlighted areas (based on the mask)
  for (let i = 0; i < data.length; i += 4) {
    if (mask[i / 4] === 1) {
      // Simple blur: average surrounding pixel values
      // A more complex Gaussian blur would use a kernel, but this gives a simple blur effect
      let r = 0, g = 0, b = 0;
      let count = 0;
      // Sample nearby pixels for averaging
      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          const x = (i / 4) % ctx.canvas.width + dx;
          const y = Math.floor((i / 4) / ctx.canvas.width) + dy;
          if (x >= 0 && x < ctx.canvas.width && y >= 0 && y < ctx.canvas.height) {
            const idx = (y * ctx.canvas.width + x) * 4;
            r += data[idx];
            g += data[idx + 1];
            b += data[idx + 2];
            count++;
          }
        }
      }
      data[i] = r / count;     // Average red
      data[i + 1] = g / count; // Average green
      data[i + 2] = b / count; // Average blue
    }
  }

  // Put the modified data back into the canvas
  ctx.putImageData(imageData, 0, 0);
}

// Event: Download Processed Image
downloadButton.addEventListener('click', () => {
  if (!originalImage) {
    alert('Please upload and adjust an image first.');
    return;
  }

  // Render full-quality image for download
  const downloadLink = document.createElement('a');
  downloadLink.href = canvas.toDataURL('image/jpeg');
  downloadLink.download = 'processed_image.jpg';
  downloadLink.click();
});

// Event: Reset Filters
resetButton.addEventListener('click', () => {
  hueSlider.value = 180; // Reset to default value
  blurSlider.value = 5;  // Reset to default value
  saturationSlider.value = 100; // Reset to default value
  contrastSlider.value = 100; // Reset to default value
  applyFilters(); // Reapply default filters
});

// Drag and Drop functionality for the image container
imageContainer.addEventListener('dragover', (event) => {
  event.preventDefault();
  imageContainer.classList.add('dragging'); // Optional: Add a visual cue for dragging
});

imageContainer.addEventListener('dragleave', () => {
  imageContainer.classList.remove('dragging');
});

imageContainer.addEventListener('drop', (event) => {
  event.preventDefault();
  const file = event.dataTransfer.files[0];
  if (file && file.type.startsWith('image/')) {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        originalImage = img;
        drawPreview(img);
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  } else {
    alert('Please drop a valid image file.');
  }
});
// Function to open the image and get its image data
export function open_image(imageData) {
    const img = new Image();
    img.src = imageData;
    return img;
  }
  
  // Function to put image data back into the image object
  export function putImageData(img) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
    return ctx.getImageData(0, 0, canvas.width, canvas.height);
  }
  
  // Function to rotate the hue of an image
  export function hue_rotate(img, degrees) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
  
    // Apply hue rotation using CSS filter
    ctx.filter = `hue-rotate(${degrees}deg)`;
    ctx.drawImage(img, 0, 0);
  }
  
  // Function to adjust the saturation of an image
  export function saturate(img, amount) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
  
    // Apply saturation using CSS filter
    ctx.filter = `saturate(${amount})`;
    ctx.drawImage(img, 0, 0);
  }
  
  // Function to adjust the contrast of an image
  export function contrast(img, amount) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
  
    // Apply contrast using CSS filter
    ctx.filter = `contrast(${amount})`;
    ctx.drawImage(img, 0, 0);
  }
  
  // Function to apply Gaussian blur to an image
  export function gauss_blur(img, amount) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
  
    // Apply Gaussian blur using CSS filter
    ctx.filter = `blur(${amount}px)`;
    ctx.drawImage(img, 0, 0);
  }
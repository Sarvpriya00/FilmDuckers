// Importing required functions from photon.js
import { open_image, putImageData, hue_rotate, saturate, contrast, gauss_blur } from '@silvia-odwyer/photon';

// Worker message listener
onmessage = async (e) => {
  const { imageData, adjustments } = e.data;

  try {
    // Load the image into Photon
    const img = open_image(imageData);

    // Apply hue rotation if specified
    if (adjustments.hue) {
      hue_rotate(img, adjustments.hue);
    }

    // Apply saturation adjustment if specified
    if (adjustments.saturation) {
      saturate(img, adjustments.saturation);
    }

    // Apply contrast adjustment if specified
    if (adjustments.contrast) {
      contrast(img, adjustments.contrast);
    }

    // Simulate halation using Gaussian blur
    if (adjustments.blurAmount) {
      gauss_blur(img, adjustments.blurAmount);
    }

    // Convert processed image back to imageData
    const processedImageData = putImageData(img);

    // Send the processed image back to the main thread
    postMessage({ success: true, imageData: processedImageData });
  } catch (error) {
    // Send an error message to the main thread
    postMessage({ success: false, error: error.message });
  }
};
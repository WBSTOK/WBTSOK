/**
 * Product Data Configuration
 * This file maps product IDs to their details for use throughout the site
 */

const productData = {
  // Test Strips
  'accu-chek': {
    name: 'Accu-Chek',
    image: 'assets/products/Accu-Chek Guide 100ct.png',
    category: 'Test Strips'
  },
  'contour': {
    name: 'Contour Next',
    image: 'assets/products/contour next 100ct.png',
    category: 'Test Strips'
  },
  'freestyle': {
    name: 'FreeStyle',
    image: 'assets/products/FSL3.png',
    category: 'Test Strips'
  },
  'onetouch': {
    name: 'OneTouch',
    image: 'assets/products/OneTouch Ultra 100ct.png',
    category: 'Test Strips'
  },
  'true-metrix': {
    name: 'True Metrix',
    image: 'assets/products/true-metrix.png',
    category: 'Test Strips'
  },
  'precision': {
    name: 'Precision Xtra',
    image: 'assets/products/precision-xtra.png',
    category: 'Test Strips'
  },
  'relion': {
    name: 'ReliOn',
    image: 'assets/products/relion.png',
    category: 'Test Strips'
  },
  'bayer': {
    name: 'Bayer Contour',
    image: 'assets/products/bayer-contour.png',
    category: 'Test Strips'
  },
  
  // CGM Systems
  'dexcomg6': {
    name: 'Dexcom G6',
    image: 'assets/products/dexcom_g6_3.png',
    category: 'CGM Systems'
  },
  'dexcomg7': {
    name: 'Dexcom G7',
    image: 'assets/products/dexcom-g7-sensor.png',
    category: 'CGM Systems'
  },
  'freestyle-libre': {
    name: 'FreeStyle Libre',
    image: 'assets/products/freestyle-libre.png',
    category: 'CGM Systems'
  },
  'freestyle-libre2': {
    name: 'FreeStyle Libre 2',
    image: 'assets/products/freestyle-libre2.png',
    category: 'CGM Systems'
  },
  'freestyle-libre3': {
    name: 'FreeStyle Libre 3',
    image: 'assets/products/FSL3.png',
    category: 'CGM Systems'
  },
  'guardian': {
    name: 'Medtronic Guardian',
    image: 'assets/products/guardian-sensor.png',
    category: 'CGM Systems'
  },
  
  // Insulin Pumps
  'omnipod': {
    name: 'Omnipod',
    image: 'assets/products/Omnipod_5_5.png',
    category: 'Insulin Pumps'
  },
  'omnipod-dash': {
    name: 'Omnipod Dash',
    image: 'assets/products/omnipod-dash.png',
    category: 'Insulin Pumps'
  },
  'omnipod5': {
    name: 'Omnipod 5',
    image: 'assets/products/Omnipod_5_5.png',
    category: 'Insulin Pumps'
  },
  'tslim': {
    name: 'Tandem t:slim',
    image: 'assets/products/tslim.png',
    category: 'Insulin Pumps'
  },
  'medtronic630g': {
    name: 'Medtronic 630G',
    image: 'assets/products/medtronic-pump.png',
    category: 'Insulin Pumps'
  },
  'medtronic670g': {
    name: 'Medtronic 670G',
    image: 'assets/products/medtronic-pump.png',
    category: 'Insulin Pumps'
  },
  'medtronic770g': {
    name: 'Medtronic 770G',
    image: 'assets/products/medtronic-pump.png',
    category: 'Insulin Pumps'
  },
  
  // Insulin Pens
  'novopen': {
    name: 'NovoPen',
    image: 'assets/products/novopen.png',
    category: 'Insulin Pens'
  },
  'flexpen': {
    name: 'FlexPen',
    image: 'assets/products/flexpen.png',
    category: 'Insulin Pens'
  },
  'kwikpen': {
    name: 'KwikPen',
    image: 'assets/products/kwikpen.png',
    category: 'Insulin Pens'
  },
  'solostar': {
    name: 'SoloStar',
    image: 'assets/products/solostar.png',
    category: 'Insulin Pens'
  },
  
  // Lancets and Lancing Devices
  'fastclix': {
    name: 'FastClix',
    image: 'assets/products/fastclix.png',
    category: 'Lancets'
  },
  'multiclix': {
    name: 'MultiClix',
    image: 'assets/products/multiclix.png',
    category: 'Lancets'
  },
  'delica': {
    name: 'Delica',
    image: 'assets/products/delica.png',
    category: 'Lancets'
  },
  'softclix': {
    name: 'Softclix',
    image: 'assets/products/softclix.png',
    category: 'Lancets'
  }
};

/**
 * Get the image path for a product
 * @param {string} productId - The ID of the product
 * @return {string} - The path to the product image
 */
function getProductImage(productId) {
  return productData[productId]?.image || 'assets/Shopping_Cart_Icon_PNG_Clipart.png';
}

/**
 * Get the name of a product
 * @param {string} productId - The ID of the product
 * @return {string} - The name of the product
 */
function getProductName(productId) {
  return productData[productId]?.name || 'Unknown Product';
}

/**
 * Get the category of a product
 * @param {string} productId - The ID of the product
 * @return {string} - The category of the product
 */
function getProductCategory(productId) {
  return productData[productId]?.category || '';
}
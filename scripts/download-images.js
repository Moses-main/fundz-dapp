const fs = require('fs');
const https = require('https');
const path = require('path');

// Theme-specific high-quality images from Unsplash (free to use)
const images = [
  // Save our Daughters - More focused on girl child education/empowerment
  {
    url: 'https://images.unsplash.com/photo-1532635241-17e820acc59f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    filename: 'save-daughters.jpg'
  },
  // Give Hope to Orphanages - Showing caring environment
  {
    url: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    filename: 'give-hope.jpg'
  },
  // Plant 1000 trees - Clear tree planting/forest image
  {
    url: 'https://images.unsplash.com/photo-1503435824048-a799a3a84bf7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    filename: 'plant-trees.jpg'
  }
];

const publicDir = path.join(__dirname, '../public');

// Create public directory if it doesn't exist
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Download each image
images.forEach(({ url, filename }) => {
  const filePath = path.join(publicDir, filename);
  const file = fs.createWriteStream(filePath);
  
  https.get(url, (response) => {
    response.pipe(file);
    
    file.on('finish', () => {
      file.close();
      console.log(`Downloaded ${filename}`);
    });
  }).on('error', (err) => {
    fs.unlink(filePath, () => {}); // Delete the file if there's an error
    console.error(`Error downloading ${filename}:`, err.message);
  });
});

console.log('All images downloaded to the public folder');

# Happy New Year Website 🎉

A festive New Year celebration website with animated stickmen, fireworks, sparkles, and decorations!

## Features

- 🎊 Festive decorations (festoons)
- ✨ Animated sparkles
- 🎆 Fireworks animation
- 👥 Two stickmen walking towards each other
- 🎉 "Happy New Year" text animation
- 📸 Custom face images on stickmen

## Setup

1. **Add your face images:**
   - Place your photo as `face1.jpg` in the same directory
   - Place your girlfriend's photo as `face2.jpg` in the same directory
   - Make sure the images are square or close to square for best results
   - Supported formats: JPG, PNG, GIF

2. **Open the website:**
   - Simply open `index.html` in your web browser
   - Or use a local server (recommended):
     ```bash
     # Using Python
     python -m http.server 8000
     
     # Using Node.js (http-server)
     npx http-server
     ```
   - Then visit `http://localhost:8000`

## Customization

### Change face images:
Edit `script.js` and update the image paths:
```javascript
stickman1 = new Stickman(..., 'your-face.jpg');
stickman2 = new Stickman(..., 'girlfriend-face.jpg');
```

### Adjust stickmen positions:
Modify the initial x positions in `script.js`:
```javascript
stickman1 = new Stickman(canvas.width * 0.2, ...); // Left stickman
stickman2 = new Stickman(canvas.width * 0.8, ...); // Right stickman
```

### Change colors:
Edit `style.css` to customize colors, or modify the firework colors in `script.js`.

## Browser Compatibility

Works best in modern browsers (Chrome, Firefox, Safari, Edge).

Enjoy your New Year celebration! 🎊🎉✨




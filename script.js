// Canvas setup
const canvas = document.getElementById('mainCanvas');
const ctx = canvas.getContext('2d');

// Initialize canvas size
function initCanvasSize() {
    const isMobileLandscape = window.innerWidth <= 1024 && window.innerHeight < window.innerWidth;
    const scale = isMobileLandscape ? 1.333 : 1;
    canvas.width = window.innerWidth * scale;
    canvas.height = window.innerHeight * scale;
}

initCanvasSize();

// Stickman class
class Stickman {
    constructor(x, y, direction, faceImage) {
        this.x = x;
        this.y = y;
        this.direction = direction; // 'left' or 'right'
        this.targetX = canvas.width / 2;
        this.speed = 2; // Faster walking speed
        this.walking = true;
        this.holdingHands = false;
        this.faceImage = faceImage;
        this.faceLoaded = false;
        this.scale = 4; // Make stickmen larger
        
        // Load face image if provided
        if (faceImage) {
            this.img = new Image();
            this.img.onload = () => {
                this.faceLoaded = true;
            };
            this.img.src = faceImage;
        }
        
        // Animation properties
        this.legAngle = 0;
        this.armAngle = 0;
        this.animationSpeed = 0.15;
        this.bobbleAngle = 0; // For head bobble animation
    }
    
    update() {
        if (this.walking) {
            // Move towards center slowly - bring them closer together
            if (this.direction === 'right') {
                if (this.x < this.targetX - 50) {
                    this.x += this.speed;
                } else {
                    this.walking = false;
                }
            } else {
                if (this.x > this.targetX + 50) {
                    this.x -= this.speed;
                } else {
                    this.walking = false;
                }
            }
            
            // Animate walking
            this.legAngle += this.animationSpeed;
            this.armAngle += this.animationSpeed;
        }
        
        // Always animate head bobble
        this.bobbleAngle += 0.1;
    }
    
    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.scale(this.scale, this.scale);
        
        // Head - use face image directly as the head
        const headSize = 40; // Size of the head
        const headY = -40; // Y position of head center
        // Add slight left-right tilt bobble animation
        const tiltAngle = Math.sin(this.bobbleAngle) * 0.15; // Small rotation angle
        
        if (this.faceLoaded && this.img) {
            // Draw the face image as the head itself with tilt bobble
            ctx.save();
            ctx.translate(0, headY);
            ctx.rotate(tiltAngle);
            const headX = -headSize / 2;
            const headYPos = -headSize / 2;
            ctx.drawImage(this.img, headX, headYPos, headSize, headSize);
            ctx.restore();
        } else {
            // Fallback circle if image not loaded yet
            ctx.beginPath();
            ctx.arc(0, headY, headSize / 2, 0, Math.PI * 2);
            ctx.fillStyle = '#ffdbac';
            ctx.fill();
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2;
            ctx.stroke();
        }
        
        // Body - connect to bottom of head
        ctx.beginPath();
        ctx.moveTo(0, headY + headSize / 2);
        ctx.lineTo(0, 20);
        ctx.stroke();
        
        // Arms
        if (this.holdingHands) {
            // When holding hands, only the inner arm extends toward the other person
            const handDirection = this.direction === 'right' ? 1 : -1;
            // Inner arm extends toward the other person (right stickman's right arm, left stickman's left arm)
            ctx.beginPath();
            ctx.moveTo(0, -10);
            ctx.lineTo(25 * handDirection, 0);
            ctx.stroke();
            // Outer arm stays back naturally
            ctx.beginPath();
            ctx.moveTo(0, -10);
            ctx.lineTo(-12 * handDirection, 8);
            ctx.stroke();
        } else {
            const armSwing = this.walking ? Math.sin(this.armAngle) * 0.5 : 0;
            ctx.beginPath();
            ctx.moveTo(0, -10);
            ctx.lineTo(-15 - armSwing * 10, 5);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(0, -10);
            ctx.lineTo(15 + armSwing * 10, 5);
            ctx.stroke();
        }
        
        // Legs
        const legSwing = this.walking ? Math.sin(this.legAngle) * 0.8 : 0;
        ctx.beginPath();
        ctx.moveTo(0, 20);
        ctx.lineTo(-10 - legSwing * 8, 40);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(0, 20);
        ctx.lineTo(10 + legSwing * 8, 40);
        ctx.stroke();
        
        ctx.restore();
    }
}

// Realistic firework particle class
class FireworkParticle {
    constructor(x, y, color, type = 'spark') {
        this.x = x;
        this.y = y;
        this.type = type; // 'spark', 'trail', 'glow'
        this.color = color;
        this.life = 1;
        this.decay = Math.random() * 0.015 + 0.008;
        
        if (type === 'spark') {
            this.vx = (Math.random() - 0.5) * 8;
            this.vy = (Math.random() - 0.5) * 8;
            this.size = Math.random() * 3 + 2;
        } else if (type === 'trail') {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 6 + 3;
            this.vx = Math.cos(angle) * speed;
            this.vy = Math.sin(angle) * speed;
            this.size = 2;
        } else {
            this.vx = (Math.random() - 0.5) * 2;
            this.vy = (Math.random() - 0.5) * 2;
            this.size = Math.random() * 4 + 3;
        }
    }
    
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.15; // gravity
        this.vx *= 0.98; // air resistance
        this.life -= this.decay;
    }
    
    draw() {
        ctx.save();
        ctx.globalAlpha = this.life;
        
        if (this.type === 'glow') {
            // Glowing effect
            const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size * 2);
            gradient.addColorStop(0, this.color);
            gradient.addColorStop(0.5, this.color + '80');
            gradient.addColorStop(1, 'transparent');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size * 2, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

// Sparkle class
class Sparkle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 4 + 2;
        this.angle = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.1;
        this.life = 1;
        this.decay = Math.random() * 0.02 + 0.01;
    }
    
    update() {
        this.angle += this.rotationSpeed;
        this.life -= this.decay;
    }
    
    draw() {
        ctx.save();
        ctx.globalAlpha = this.life;
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.fillStyle = '#ffd700';
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#ffd700';
        
        // Draw star shape
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
            const x = Math.cos(angle) * this.size;
            const y = Math.sin(angle) * this.size;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
        
        ctx.restore();
    }
}

// Create stickmen
let stickman1, stickman2;
let fireworks = [];
let sparkles = [];
let bothStopped = false;
let fireworksStarted = false;
let handsHeld = false;
let fireworkSound = null;
let backgroundMusic = null;
let conversationStarted = false;

// Valley scene drawing
function drawValley() {
    const groundY = canvas.height * 0.85;
    
    // Draw mountains in background
    ctx.fillStyle = '#1a1a3e';
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    
    // Left mountains
    ctx.lineTo(canvas.width * 0.1, groundY - 150);
    ctx.lineTo(canvas.width * 0.2, groundY - 80);
    ctx.lineTo(canvas.width * 0.3, groundY - 120);
    ctx.lineTo(canvas.width * 0.4, groundY - 60);
    
    // Valley center
    ctx.lineTo(canvas.width * 0.5, groundY - 40);
    
    // Right mountains
    ctx.lineTo(canvas.width * 0.6, groundY - 100);
    ctx.lineTo(canvas.width * 0.7, groundY - 70);
    ctx.lineTo(canvas.width * 0.8, groundY - 130);
    ctx.lineTo(canvas.width * 0.9, groundY - 90);
    
    ctx.lineTo(canvas.width, groundY);
    ctx.lineTo(canvas.width, canvas.height);
    ctx.lineTo(0, canvas.height);
    ctx.closePath();
    ctx.fill();
    
    // Draw ground/valley floor
    ctx.fillStyle = '#2d2d4a';
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    ctx.lineTo(canvas.width, groundY);
    ctx.lineTo(canvas.width, canvas.height);
    ctx.lineTo(0, canvas.height);
    ctx.closePath();
    ctx.fill();
    
    // Add some grass/details
    ctx.strokeStyle = '#3a3a5a';
    ctx.lineWidth = 1;
    for (let i = 0; i < canvas.width; i += 20) {
        ctx.beginPath();
        ctx.moveTo(i, groundY);
        ctx.lineTo(i + 5, groundY - 3);
        ctx.stroke();
    }
}

// Draw stars in night sky - more spread out
function drawStars() {
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 50; i++) {
        const x = (i * 73) % canvas.width;
        const y = (i * 97) % (canvas.height * 0.6);
        const size = Math.random() * 2;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Function to start all audio
function startAllAudio() {
    // Start background music
    if (backgroundMusic) {
        backgroundMusic.volume = 0.15; // Reduced volume
        backgroundMusic.loop = true;
        backgroundMusic.play().catch(error => {
            console.log('Background music play failed:', error);
        });
    }
    
    // Start firework sound after 5 seconds
    setTimeout(() => {
        if (fireworkSound) {
            fireworkSound.currentTime = 0;
            fireworkSound.play().catch(error => {
                console.log('Firework sound play failed:', error);
            });
        }
    }, 4000);
}

// Initialize
function init() {
    // Create stickmen with PNG files - positioned lower in the valley
    stickman1 = new Stickman(canvas.width * 0.2, canvas.height * 0.85, 'right', 'me.png');
    stickman2 = new Stickman(canvas.width * 0.8, canvas.height * 0.85, 'left', 'her.png');
    
    // Create sparkles
    createSparkles();
    
    // Load and prepare firework sound
    fireworkSound = new Audio('fireworks-29629.mp3');
    fireworkSound.loop = true;
    fireworkSound.volume = 0.6;
    fireworkSound.preload = 'auto';
    fireworkSound.load();
    
    // Try to autoplay background music (may be blocked by browser)
    backgroundMusic = document.getElementById('backgroundMusic');
    if (backgroundMusic) {
        backgroundMusic.volume = 0.2;
        backgroundMusic.loop = true;
        // Try to play immediately
        backgroundMusic.play()
            .then(() => {
                // Success! Hide overlay and start firework sound timer
                hideStartOverlay();
                setTimeout(() => {
                    if (fireworkSound) {
                        fireworkSound.currentTime = 0;
                        fireworkSound.play().catch(e => console.log('Firework sound failed:', e));
                    }
                }, 4000);
            })
            .catch(() => {
                // Autoplay blocked - show overlay
                showStartOverlay();
            });
    } else {
        // No background music element, show overlay
        showStartOverlay();
    }
}

function showStartOverlay() {
    const overlay = document.getElementById('startOverlay');
    if (overlay) {
        overlay.style.display = 'flex';
    }
}

function hideStartOverlay() {
    const overlay = document.getElementById('startOverlay');
    if (overlay) {
        overlay.classList.add('hidden');
        setTimeout(() => {
            overlay.style.display = 'none';
        }, 500);
    }
}

function createSparkles() {
    const sparklesContainer = document.getElementById('sparkles');
    for (let i = 0; i < 50; i++) {
        const sparkle = document.createElement('div');
        sparkle.className = 'sparkle';
        sparkle.style.left = Math.random() * 100 + '%';
        sparkle.style.top = Math.random() * 100 + '%';
        sparkle.style.animationDelay = Math.random() * 2 + 's';
        sparklesContainer.appendChild(sparkle);
    }
}

function createFirework(x, y) {
    const colors = ['#ff6b6b', '#ffd93d', '#6bcf7f', '#4ecdc4', '#45b7d1', '#ff9ff3', '#54a0ff', '#ff6b9d', '#c44569'];
    const particleCount = 50;
    
    // Create main burst particles
    for (let i = 0; i < particleCount; i++) {
        const angle = (Math.PI * 2 / particleCount) * i;
        const speed = Math.random() * 8 + 4;
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        const particle = new FireworkParticle(x, y, color, 'spark');
        particle.vx = Math.cos(angle) * speed;
        particle.vy = Math.sin(angle) * speed;
        fireworks.push(particle);
    }
    
    // Add glowing center
    for (let i = 0; i < 10; i++) {
        const color = colors[Math.floor(Math.random() * colors.length)];
        const particle = new FireworkParticle(x, y, color, 'glow');
        fireworks.push(particle);
    }
    
    // Add trailing particles
    for (let i = 0; i < 20; i++) {
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * 30;
        const color = colors[Math.floor(Math.random() * colors.length)];
        const particle = new FireworkParticle(
            x + Math.cos(angle) * distance,
            y + Math.sin(angle) * distance,
            color,
            'trail'
        );
        fireworks.push(particle);
    }
    
    // Add sparkles around firework
    for (let i = 0; i < 8; i++) {
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * 50 + 30;
        sparkles.push(new Sparkle(
            x + Math.cos(angle) * distance,
            y + Math.sin(angle) * distance
        ));
    }
    
}

function drawHandsConnection() {
    if (handsHeld && stickman1 && stickman2) {
        ctx.save();
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 5;
        ctx.beginPath();
        // Calculate hand positions - they meet in the middle
        const handY = stickman1.y - 10 * stickman1.scale;
        // Right stickman's right hand (extending right) - scaled properly
        const hand1X = stickman1.x + 25 * stickman1.scale;
        // Left stickman's left hand (extending left) - scaled properly
        const hand2X = stickman2.x - 25 * stickman2.scale;
        // Draw connection line between the hands
        ctx.moveTo(hand1X, handY);
        ctx.lineTo(hand2X, handY);
        ctx.stroke();
        // Draw a small circle at the meeting point to show they're holding hands
        ctx.fillStyle = '#000';
        ctx.beginPath();
        const midX = (hand1X + hand2X) / 2;
        ctx.arc(midX, handY, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

function animate() {
    // Clear canvas with night sky
    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw stars
    drawStars();
    
    // Draw valley scene
    drawValley();
    
    // Update and draw stickmen
    stickman1.update();
    stickman2.update();
    
    // Check if both stopped and make them hold hands
    if (!stickman1.walking && !stickman2.walking && !bothStopped) {
        bothStopped = true;
        setTimeout(() => {
            stickman1.holdingHands = true;
            stickman2.holdingHands = true;
            handsHeld = true;
            startFireworks();
            startConversation();
        }, 500);
        
    }
    
    stickman1.draw();
    stickman2.draw();
    
    // Update speech bubble positions if conversation started
    if (conversationStarted) {
        updateSpeechBubblePositions();
    }
    
    // Hands connection removed - no black line
    
    // Update and draw fireworks
    for (let i = fireworks.length - 1; i >= 0; i--) {
        fireworks[i].update();
        fireworks[i].draw();
        
        if (fireworks[i].life <= 0) {
            fireworks.splice(i, 1);
        }
    }
    
    // Update and draw sparkles
    for (let i = sparkles.length - 1; i >= 0; i--) {
        sparkles[i].update();
        sparkles[i].draw();
        
        if (sparkles[i].life <= 0) {
            sparkles.splice(i, 1);
        }
    }
    
    requestAnimationFrame(animate);
}

function updateSpeechBubblePositions() {
    if (!stickman1 || !stickman2) return;
    
    // Calculate head positions
    const head1Y = stickman1.y - 40 * stickman1.scale; // Head center Y
    const head1X = stickman1.x;
    const headSize1 = 40 * stickman1.scale; // Scaled head size
    const head2Y = stickman2.y - 40 * stickman2.scale; // Head center Y
    const head2X = stickman2.x;
    const headSize2 = 40 * stickman2.scale; // Scaled head size
    
    // Update bubble positions - left side of left stickman's head, right side of right stickman's head
    const bubble1 = document.getElementById('speechBubble1');
    const bubble2 = document.getElementById('speechBubble2');
    const bubble3 = document.getElementById('speechBubble3');
    
    // Left stickman bubbles: positioned closer to the left of head, slightly above
    const bubble1Left = head1X - headSize1/2 - 120; // Closer to head (was 150)
    if (bubble1) {
        bubble1.style.left = bubble1Left + 'px';
        bubble1.style.bottom = (canvas.height - head1Y + 20) + 'px'; // Closer vertically
        // Arrow should be on the right side of bubble, pointing right toward head
        const bubbleRightEdge = bubble1Left + 150; // Right edge of bubble
        const headLeftEdge = head1X - headSize1/2;
        // Arrow position from right edge, pointing right
        const arrowPosition = Math.max(20, Math.min(130, 150 - (bubbleRightEdge - headLeftEdge)));
        bubble1.style.setProperty('--arrow-offset', arrowPosition + 'px');
    }
    if (bubble3) {
        bubble3.style.left = bubble1Left + 'px';
        bubble3.style.bottom = (canvas.height - head1Y + 20) + 'px';
        const bubbleRightEdge = bubble1Left + 150;
        const headLeftEdge = head1X - headSize1/2;
        const arrowPosition = Math.max(20, Math.min(130, 150 - (bubbleRightEdge - headLeftEdge)));
        bubble3.style.setProperty('--arrow-offset', arrowPosition + 'px');
    }
    
    // Right stickman bubble: positioned closer to the right of head, slightly above
    const bubble2Right = canvas.width - head2X - headSize2/2 - 120; // Closer to head (was 150)
    if (bubble2) {
        bubble2.style.right = bubble2Right + 'px';
        bubble2.style.bottom = (canvas.height - head2Y + 20) + 'px'; // Closer vertically
        // Arrow should be on the left side of bubble, pointing left toward head
        const bubbleLeftEdge = canvas.width - bubble2Right - 150;
        const headRightEdge = head2X + headSize2/2;
        // Arrow position from left edge, pointing left
        const arrowPosition = Math.max(20, Math.min(130, headRightEdge - bubbleLeftEdge));
        bubble2.style.setProperty('--arrow-offset', arrowPosition + 'px');
    }
}

function startConversation() {
    if (conversationStarted) return;
    conversationStarted = true;
    
    // Update positions first
    updateSpeechBubblePositions();
    
    // First speech bubble - "Happy new year, Darling !"
    setTimeout(() => {
        const bubble1 = document.getElementById('speechBubble1');
        if (bubble1) {
            updateSpeechBubblePositions();
            bubble1.classList.add('show');
        }
    }, 1000);
    
    // Second speech bubble - "Happy new year Jaan ! I love you"
    setTimeout(() => {
        const bubble1 = document.getElementById('speechBubble1');
        const bubble2 = document.getElementById('speechBubble2');
        if (bubble1) bubble1.classList.remove('show');
        if (bubble2) {
            updateSpeechBubblePositions();
            bubble2.classList.add('show');
        }
    }, 4000);
    
    // Third speech bubble - "I love you moree"
    setTimeout(() => {
        const bubble2 = document.getElementById('speechBubble2');
        const bubble3 = document.getElementById('speechBubble3');
        if (bubble2) bubble2.classList.remove('show');
        if (bubble3) {
            updateSpeechBubblePositions();
            bubble3.classList.add('show');
        }
    }, 7000);
    
    // Hide last bubble after a while
    setTimeout(() => {
        const bubble3 = document.getElementById('speechBubble3');
        if (bubble3) bubble3.classList.remove('show');
    }, 11000);
}

// Typewriter animation function
function typeWriter(element, text, speed = 30, callback) {
    let i = 0;
    element.textContent = '';
    element.style.opacity = '1';
    
    function type() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
        } else {
            if (callback) callback();
        }
    }
    type();
}

function startFireworks() {
    if (fireworksStarted) return;
    fireworksStarted = true;
    
    // Show "Happy New Year" image
    setTimeout(() => {
        document.getElementById('newYearImage').classList.add('show');
        
        // Start typewriter animations
        setTimeout(() => {
            const topLeftText = document.getElementById('topLeftText');
            const rightSideText = document.getElementById('rightSideText');
            
            if (topLeftText) {
                topLeftText.classList.add('show');
                const topLeftP = topLeftText.querySelector('p');
                typeWriter(topLeftP, "2026 is a new beginning for us, so many moments to live, so many memories to make, and so much love still waiting for us. In Shaa Allah.", 30);
            }
            
            if (rightSideText) {
                setTimeout(() => {
                    rightSideText.classList.add('show');
                    const rightSideP = rightSideText.querySelector('p');
                    typeWriter(rightSideP, "This year tested us in so many ways, but every moment with you was worth it. In Shaa Allah, no matter how hard the road gets, we'll keep walking it together until the very end.", 30);
                }, 2000);
            }
        }, 1000);
    }, 500);
    
    // Create continuous fireworks
    setInterval(() => {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height * 0.4 + 50;
        createFirework(x, y);
    }, 1200);
    
    // Initial burst
    for (let i = 0; i < 8; i++) {
        setTimeout(() => {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height * 0.4 + 50;
            createFirework(x, y);
        }, i * 300);
    }
}

// Handle window resize
function handleResize() {
    // Account for mobile landscape scaling
    const isMobileLandscape = window.innerWidth <= 1024 && window.innerHeight < window.innerWidth;
    const scale = isMobileLandscape ? 1.333 : 1; // Inverse of 0.75 scale
    
    canvas.width = window.innerWidth * scale;
    canvas.height = window.innerHeight * scale;
    stickman1.targetX = canvas.width / 2;
    stickman2.targetX = canvas.width / 2;
    // Reposition stickmen
    stickman1.y = canvas.height * 0.85;
    stickman2.y = canvas.height * 0.85;
}

window.addEventListener('resize', handleResize);

// Handle start overlay click
function handleStartClick() {
    hideStartOverlay();
    startAllAudio();
}

// Handle orientation changes
function checkOrientation() {
    const orientationMsg = document.getElementById('orientationMessage');
    const container = document.querySelector('.container');
    
    if (window.innerWidth <= 768) {
        // Mobile device
        if (window.innerHeight > window.innerWidth) {
            // Portrait mode
            if (orientationMsg) orientationMsg.style.display = 'flex';
            if (container) container.style.display = 'none';
        } else {
            // Landscape mode
            if (orientationMsg) orientationMsg.style.display = 'none';
            if (container) container.style.display = 'block';
        }
    } else {
        // Desktop - always show
        if (orientationMsg) orientationMsg.style.display = 'none';
        if (container) container.style.display = 'block';
    }
}

// Add event listeners for starting audio
document.addEventListener('DOMContentLoaded', () => {
    const overlay = document.getElementById('startOverlay');
    if (overlay) {
        overlay.addEventListener('click', handleStartClick);
        overlay.addEventListener('touchstart', handleStartClick);
    }
    
    // Also allow keyboard to start
    document.addEventListener('keydown', (e) => {
        if (overlay && overlay.style.display !== 'none') {
            handleStartClick();
        }
    }, { once: true });
    
    // Check orientation on load and resize
    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', () => {
        setTimeout(checkOrientation, 100);
    });
});

// Start animation
init();
animate();


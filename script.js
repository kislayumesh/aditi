// Global State
let sessionId = 'session_' + Math.random().toString(36).substr(2, 9);
let noButtonClickCount = 0;
let isMusicPlaying = false;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Floating Hearts
    createFloatingHearts();

    // Dismiss Privacy Notice
    document.getElementById('acceptPrivacy').addEventListener('click', (e) => {
        e.target.parentElement.style.display = 'none';
        initAudio();
    });

    // Simulate Loading Screen
    setTimeout(() => {
        navigateTo('q1', 'loadingScreen');
    }, 3500);

    // Event listener for the "Our Forever Journey" button
    document.querySelector('.celebration-card .btn.primary').addEventListener('click', openFutureModal);
});

// Audio Control
const bgMusic = document.getElementById('bgMusic');
const musicBtn = document.getElementById('musicBtn');

function initAudio() {
    bgMusic.volume = 0;
    bgMusic.play().then(() => {
        isMusicPlaying = true;
        fadeInAudio();
        musicBtn.innerText = '🔊 Mute Music';
    }).catch(err => console.log("Audio requires interaction first."));
}

musicBtn.addEventListener('click', () => {
    if (isMusicPlaying) {
        bgMusic.pause();
        musicBtn.innerText = '🎵 Play Music';
    } else {
        bgMusic.play();
        musicBtn.innerText = '🔊 Mute Music';
    }
    isMusicPlaying = !isMusicPlaying;
});

function fadeInAudio() {
    let vol = 0;
    const interval = setInterval(() => {
        if (vol < 0.5) {
            vol += 0.05;
            bgMusic.volume = vol;
        } else {
            clearInterval(interval);
        }
    }, 200);
}

// Navigation Logic
function navigateTo(targetId, currentId) {
    const current = document.getElementById(currentId);
    const target = document.getElementById(targetId);
    
    current.classList.remove('active');
    setTimeout(() => {
        current.classList.add('hidden');
        target.classList.remove('hidden');
        
        // Trigger reflow to restart animations
        void target.offsetWidth; 
        
        target.classList.add('active');

        // Start effects if navigating to celebration page
        if (targetId === 'celebration') {
            startCelebrationEffects();
        }
        
    }, 500); 
}

// Answer Handling & Routing
function handleResponse(questionId, response) {
    sendAnalytics(questionId, response);

    if (questionId === 'q1') {
        if (response === 'YES') navigateTo('celebration', 'q1');
        if (response === 'NO') navigateTo('q2', 'q1');
    } 
    else if (questionId === 'q2') {
        if (response === 'YES') navigateTo('q3', 'q2');
        if (response === 'NO') navigateTo('q1', 'q2');
    }
    else if (questionId === 'q3') {
        if (response === 'OK') navigateTo('q4', 'q3');
    }
    else if (questionId === 'q4') {
        if (response === 'OK') navigateTo('q1', 'q4');
        if (response === 'YES') navigateTo('celebration', 'q4');
    }
}

// Question 4: Runaway Button Logic
const runawayBtn = document.getElementById('runawayBtn');
const q4Card = document.getElementById('q4Card');

function moveButton() {
    if (noButtonClickCount >= 5) return;

    const cardRect = q4Card.getBoundingClientRect();
    const btnRect = runawayBtn.getBoundingClientRect();

    const maxX = cardRect.width - btnRect.width - 40; 
    const maxY = cardRect.height - btnRect.height - 40;

    const randomX = Math.max(20, Math.floor(Math.random() * maxX));
    const randomY = Math.max(20, Math.floor(Math.random() * maxY));

    runawayBtn.style.position = 'absolute';
    runawayBtn.style.left = `${randomX}px`;
    runawayBtn.style.top = `${randomY}px`;
    
    const randomRotation = Math.floor(Math.random() * 30) - 15;
    runawayBtn.style.transform = `scale(1.1) rotate(${randomRotation}deg)`;
}

function hitButton() {
    noButtonClickCount++;
    sendAnalytics('q4', `NO_CLICK_${noButtonClickCount}`);

    if (noButtonClickCount >= 5) {
        breakButton();
    } else {
        moveButton();
    }
}

function breakButton() {
    runawayBtn.classList.add('broken');
    setTimeout(() => {
        runawayBtn.style.display = 'none';
        document.querySelector('#q4 .btn-group').style.display = 'none';
        document.getElementById('q4Text').style.display = 'none';
        
        const brokenState = document.getElementById('brokenState');
        brokenState.classList.remove('hidden');
    }, 3000);
}

// Future Modal Logic
function openFutureModal() {
    const modal = document.getElementById('futureModal');
    const note = document.getElementById('futureNote');
    modal.classList.remove('hidden');
    
    const text = "In Futureeeee";
    note.innerHTML = ""; // Use innerHTML
    let i = 0;
    
    function type() {
        if (i < text.length) {
            // If character is a space, use a non-breaking space entity
            const char = text.charAt(i) === ' ' ? '&nbsp;' : text.charAt(i);
            note.innerHTML += char;
            i++;
            setTimeout(type, 50);
        }
    }
    type();
}

function closeModal() {
    document.getElementById('futureModal').classList.add('hidden');
}

// Mock Analytics Tracking System
function sendAnalytics(question, answer) {
    const payload = {
        sessionId: sessionId,
        question: question,
        answer: answer,
        timestamp: new Date().toISOString(),
        device: /Mobi|Android/i.test(navigator.userAgent) ? 'Mobile' : 'Desktop',
        browser: navigator.userAgent
    };
    console.log("Analytics Logged:", payload);
}

// Celebration Effects
function startCelebrationEffects() {
    const canvas = document.getElementById('celebrationCanvas');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });

    let particles = [];
    let petals = [];
    const fireworkColors = ['#ff4d6d', '#ffb3c1', '#ffffff', '#ffd700', '#ff7eb3'];
    const petalColors = ['#ff4d6d', '#ff758f', '#ff8fa3', '#ffb3c1'];

    class FireworkParticle {
        constructor(x, y, color) {
            this.x = x; this.y = y; this.color = color;
            this.radius = Math.random() * 2 + 1;
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 5 + 2;
            this.vx = Math.cos(angle) * speed;
            this.vy = Math.sin(angle) * speed;
            this.friction = 0.95; this.gravity = 0.05;
            this.alpha = 1; this.decay = Math.random() * 0.015 + 0.01;
        }
        update() { this.vx *= this.friction; this.vy *= this.friction; this.vy += this.gravity; this.x += this.vx; this.y += this.vy; this.alpha -= this.decay; }
        draw() { ctx.save(); ctx.globalAlpha = this.alpha; ctx.beginPath(); ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2); ctx.fillStyle = this.color; ctx.fill(); ctx.restore(); }
    }

    class Petal {
        constructor() {
            this.x = Math.random() * canvas.width; this.y = Math.random() * -canvas.height;
            this.width = Math.random() * 10 + 10; this.height = Math.random() * 15 + 15;
            this.color = petalColors[Math.floor(Math.random() * petalColors.length)];
            this.speedY = Math.random() * 2 + 1; this.speedX = (Math.random() - 0.5) * 1;
            this.angle = Math.random() * 360; this.spin = (Math.random() - 0.5) * 5;
        }
        update() { this.y += this.speedY; this.x += this.speedX + Math.sin(this.y * 0.01) * 0.5; this.angle += this.spin; if (this.y > canvas.height + 50) { this.y = -50; this.x = Math.random() * canvas.width; } }
        draw() { ctx.save(); ctx.translate(this.x, this.y); ctx.rotate((this.angle * Math.PI) / 180); ctx.beginPath(); ctx.moveTo(0, 0); ctx.bezierCurveTo(-this.width/2, this.height/2, -this.width/2, this.height, 0, this.height); ctx.bezierCurveTo(this.width/2, this.height, this.width/2, this.height/2, 0, 0); ctx.fillStyle = this.color; ctx.globalAlpha = 0.8; ctx.fill(); ctx.restore(); }
    }

    for (let i = 0; i < 40; i++) { petals.push(new Petal()); }

    function explodeFirework() {
        const x = Math.random() * canvas.width;
        const y = Math.random() * (canvas.height * 0.6);
        const color = fireworkColors[Math.floor(Math.random() * fireworkColors.length)];
        for (let i = 0; i < 80; i++) { particles.push(new FireworkParticle(x, y, color)); }
    }

    setInterval(explodeFirework, 800);

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        petals.forEach(p => { p.update(); p.draw(); });
        particles.forEach((p, i) => { if (p.alpha <= 0) particles.splice(i, 1); else { p.update(); p.draw(); } });
        requestAnimationFrame(animate);
    }
    animate();
}

function createFloatingHearts() {
    const container = document.getElementById('particles');
    const heartCount = 100; 
    for (let i = 0; i < heartCount; i++) {
        const heart = document.createElement('div');
        heart.innerHTML = '❤️';
        heart.className = 'heart-particle';
        heart.style.left = Math.random() * 100 + 'vw';
        heart.style.top = Math.random() * 100 + 'vh';
        heart.style.animationDuration = (Math.random() * 6 + 4) + 's';
        heart.style.animationDelay = Math.random() * 8 + 's';
        heart.style.fontSize = (Math.random() * 20 + 15) + 'px';
        heart.style.transform = `rotate(${Math.random() * 40 - 20}deg)`;
        container.appendChild(heart);
    }
}
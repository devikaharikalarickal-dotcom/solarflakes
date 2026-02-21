/* ─── STARFIELD ─── */
(function () {
  const c = document.getElementById('starfield');
  const ctx = c.getContext('2d');
  let W, H, stars = [];

  function resize() {
    W = c.width = window.innerWidth;
    H = c.height = window.innerHeight;
    stars = Array.from({ length: 220 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      r: Math.random() * 1.4 + 0.2,
      a: Math.random(),
      speed: Math.random() * 0.4 + 0.05
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    stars.forEach(s => {
      s.a += s.speed * 0.01;
      const alpha = 0.3 + 0.7 * Math.abs(Math.sin(s.a));
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(200,220,255,${alpha})`;
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize);
  resize();
  draw();
})();


/* ─── HERO SCROLL ─── */
function scrollToPlanets() {
  document.getElementById('planets').scrollIntoView({ behavior: 'smooth' });
}


/* ─── PLANETS ─── */
let lastCard = null;
function showPlanet(el, name, symbol, fact) {
  if (lastCard) lastCard.style.outline = '';
  el.style.outline = '2px solid rgba(0,240,255,0.6)';
  lastCard = el;
  const info = document.getElementById('planetInfo');
  document.getElementById('planetName').textContent = symbol + ' ' + name;
  document.getElementById('planetFact').textContent = fact;
  info.classList.remove('show');
  void info.offsetWidth;
  info.classList.add('show');
}


/* ─── FACT CARDS ─── */
function flipCard(card) {
  card.classList.toggle('flipped');
}


/* ─── QUIZ ─── */
let answered = false;
function checkAnswer(btn, answer) {
  if (answered) return;
  answered = true;
  const result = document.getElementById('quizResult');
  const badge = document.getElementById('badge');
  document.querySelectorAll('.quiz-btn').forEach(b => {
    if (b.textContent === 'Saturn') b.classList.add('correct');
  });
  if (answer === 'Saturn') {
    btn.classList.add('correct');
    result.textContent = 'Correct! Saturn is known for its stunning rings! 🎉';
    result.className = 'correct';
    badge.innerHTML = '🏅 Junior Astronaut!';
  } else {
    btn.classList.add('wrong');
    result.textContent = 'Not quite — the answer is Saturn!';
    result.className = 'wrong';
  }
}


/* ─── GAME ─── */
(function () {
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;

  let gameStarted = false;
  let rocket = { x: W / 2 - 20, y: H - 70, w: 40, h: 50, speed: 7 };
  let obstacles = [], collectibles = [], particles = [];
  let score = 0, lives = 3, frame = 0;
  let keys = {};

  // Touch controls
  document.getElementById('leftBtn').addEventListener('touchstart', e => { e.preventDefault(); keys['ArrowLeft'] = true; }, { passive: false });
  document.getElementById('leftBtn').addEventListener('touchend', e => { e.preventDefault(); keys['ArrowLeft'] = false; }, { passive: false });
  document.getElementById('rightBtn').addEventListener('touchstart', e => { e.preventDefault(); keys['ArrowRight'] = true; }, { passive: false });
  document.getElementById('rightBtn').addEventListener('touchend', e => { e.preventDefault(); keys['ArrowRight'] = false; }, { passive: false });

  document.addEventListener('keydown', e => {
    keys[e.key] = true;
    if (!gameStarted && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) startGame();
  });
  document.addEventListener('keyup', e => { keys[e.key] = false; });

  canvas.addEventListener('touchstart', () => {
    if (!gameStarted) startGame();
  });

  function startGame() {
    gameStarted = true;
    document.getElementById('startMsg').style.display = 'none';
  }

  function spawnObstacle() {
    obstacles.push({
      x: Math.random() * (W - 36) + 2, y: -40, w: 36, h: 36,
      speed: 2.5 + score / 300
    });
  }

  function spawnStar() {
    collectibles.push({
      x: Math.random() * (W - 24) + 2, y: -30, w: 24, h: 24,
      speed: 2 + score / 400,
      angle: 0
    });
  }

  function spawnParticle(x, y, color) {
    for (let i = 0; i < 8; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 3 + 1;
      particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        r: Math.random() * 4 + 2,
        alpha: 1, color
      });
    }
  }

  function rectsOverlap(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }

  function drawRocket() {
    const { x, y, w, h } = rocket;
    // Body
    ctx.fillStyle = '#00f0ff';
    ctx.beginPath();
    ctx.moveTo(x + w / 2, y);
    ctx.lineTo(x + w, y + h * 0.6);
    ctx.lineTo(x + w, y + h);
    ctx.lineTo(x, y + h);
    ctx.lineTo(x, y + h * 0.6);
    ctx.closePath();
    ctx.fill();

    // Window
    ctx.fillStyle = '#0d1b2a';
    ctx.beginPath();
    ctx.arc(x + w / 2, y + h * 0.4, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Flames
    if (gameStarted) {
      const t = Date.now() / 100;
      ctx.fillStyle = 'rgba(255,160,20,0.9)';
      ctx.beginPath();
      ctx.moveTo(x + 8, y + h);
      ctx.lineTo(x + w / 2, y + h + 12 + Math.sin(t) * 6);
      ctx.lineTo(x + w - 8, y + h);
      ctx.closePath();
      ctx.fill();
    }
  }

  function update() {
    frame++;
    if (!gameStarted) return;

    // Move rocket
    if (keys['ArrowLeft']) rocket.x = Math.max(0, rocket.x - rocket.speed);
    if (keys['ArrowRight']) rocket.x = Math.min(W - rocket.w, rocket.x + rocket.speed);

    // Spawn
    if (frame % 90 === 0) spawnObstacle();
    if (frame % 120 === 0) spawnStar();

    // Update obstacles
    obstacles = obstacles.filter(o => {
      o.y += o.speed;
      if (rectsOverlap(o, rocket)) {
        lives--;
        spawnParticle(rocket.x + rocket.w / 2, rocket.y, '#ff6b6b');
        return false;
      }
      return o.y < H + 40;
    });

    // Update collectibles
    collectibles = collectibles.filter(s => {
      s.y += s.speed;
      s.angle += 0.05;
      if (rectsOverlap(s, rocket)) {
        score += 10;
        spawnParticle(s.x + s.w / 2, s.y + s.h / 2, '#ffd166');
        return false;
      }
      return s.y < H + 40;
    });

    // Particles
    particles = particles.filter(p => {
      p.x += p.vx; p.y += p.vy;
      p.alpha -= 0.04;
      return p.alpha > 0;
    });
  }

  function render() {
    ctx.clearRect(0, 0, W, H);

    // Background gradient
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, '#00020d');
    bg.addColorStop(1, '#0a0f2e');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // Obstacles (asteroids)
    obstacles.forEach(o => {
      ctx.fillStyle = '#8a6a4a';
      ctx.beginPath();
      ctx.arc(o.x + o.w / 2, o.y + o.h / 2, o.w / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#a07850';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.font = '22px serif';
      ctx.textAlign = 'center';
      ctx.fillText('☄️', o.x + o.w / 2, o.y + o.h / 2 + 8);
    });

    // Collectibles
    collectibles.forEach(s => {
      ctx.save();
      ctx.translate(s.x + s.w / 2, s.y + s.h / 2);
      ctx.rotate(s.angle);
      ctx.font = '20px serif';
      ctx.textAlign = 'center';
      ctx.fillText('⭐', 0, 8);
      ctx.restore();
    });

    // Particles
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha;
      ctx.fill();
      ctx.globalAlpha = 1;
    });

    drawRocket();

    // HUD
    ctx.font = '600 14px "Space Mono", monospace';
    ctx.textAlign = 'left';
    ctx.fillStyle = 'rgba(200,220,255,0.6)';
    ctx.fillText(`SCORE: ${score}`, 14, 28);

    // Lives
    ctx.textAlign = 'right';
    let heartsStr = '';
    for (let i = 0; i < 3; i++) heartsStr += (i < lives ? '❤️' : '🖤');
    ctx.font = '14px serif';
    ctx.fillText(heartsStr, W - 10, 26);

    if (!gameStarted) {
      ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(0,240,255,0.7)';
      ctx.font = '700 15px "Orbitron",monospace';
      ctx.fillText('READY FOR LAUNCH', W / 2, H / 2);
    }

    if (lives <= 0) {
      // Game over overlay
      ctx.fillStyle = 'rgba(0,2,13,0.8)';
      ctx.fillRect(0, 0, W, H);
      ctx.textAlign = 'center';
      ctx.font = '700 28px "Orbitron",monospace';
      ctx.fillStyle = '#ff6b6b';
      ctx.fillText('MISSION FAILED', W / 2, H / 2 - 30);
      ctx.font = '16px "Space Mono",monospace';
      ctx.fillStyle = '#c8d6ff';
      ctx.fillText(`Final Score: ${score}`, W / 2, H / 2 + 10);
      ctx.font = '12px "Space Mono",monospace';
      ctx.fillStyle = 'rgba(0,240,255,0.6)';
      ctx.fillText('Tap / press arrow to retry', W / 2, H / 2 + 50);

      function resetGame() {
        lives = 3; score = 0; frame = 0; gameStarted = false;
        obstacles = []; collectibles = []; particles = [];
        rocket.x = W / 2 - 20;
        document.getElementById('startMsg').style.display = 'block';
        loop();
      }

      canvas.addEventListener('click', resetGame, { once: true });

      document.addEventListener('keydown', function retry(e) {
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
          document.removeEventListener('keydown', retry);
          resetGame();
        }
      });

      return; // stop loop
    }
  }

  function loop() {
    update();
    render();
    if (lives > 0) requestAnimationFrame(loop);
  }

  loop();
})();
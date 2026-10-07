import './style.css'
import Matter from 'matter-js'

const { Bodies, Body, Composite, Engine } = Matter
const app = document.querySelector('#app')
const baseRooms = [
  { name: 'Sala de Aula', icon: '✏️', tint: '#d7e9df', floor: '#f1ead9', obstacles: [['carteira', 350, 145, 112, 72], ['livros', 490, 395, 82, 58]] },
  { name: 'Corredor', icon: '🚪', tint: '#e7d9b9', floor: '#eee5d2', obstacles: [['armario', 330, 235, 105, 100], ['banco', 535, 160, 120, 48], ['lixeira', 560, 380, 55, 55]] },
  { name: 'Biblioteca', icon: '📚', tint: '#e7c99e', floor: '#eee5d2', obstacles: [['estante', 320, 145, 72, 140], ['estante', 520, 350, 72, 140], ['livros', 620, 170, 92, 55]] },
  { name: 'Laboratório', icon: '🧪', tint: '#b9dce1', floor: '#e8efeb', obstacles: [['bancada', 320, 150, 140, 62], ['bancada', 510, 360, 145, 62], ['microscopio', 570, 190, 60, 65]] },
  { name: 'Refeitório', icon: '🍎', tint: '#eccd91', floor: '#f1ead9', obstacles: [['mesa', 340, 155, 130, 72], ['mesa', 530, 365, 130, 72], ['bandejas', 590, 180, 72, 52]] },
  { name: 'Quadra', icon: '🏀', tint: '#d39b5e', floor: '#e7c89e', obstacles: [['banco', 335, 155, 140, 45], ['cone', 510, 355, 48, 68], ['cone', 615, 185, 48, 68]] },
  { name: 'Sala de Artes', icon: '🎨', tint: '#e6a59c', floor: '#f3e5d8', obstacles: [['cavalete', 335, 160, 75, 112], ['tintas', 520, 370, 90, 58], ['mesa', 595, 165, 108, 65]] },
  { name: 'Almoxarifado', icon: '📦', tint: '#b4aa91', floor: '#e5e0d3', obstacles: [['caixas', 315, 180, 88, 95], ['caixas', 470, 350, 110, 90], ['armario', 610, 145, 86, 125], ['caixas', 650, 390, 70, 65]] },
  { name: 'Diretoria', icon: '🗝️', tint: '#b8c4d3', floor: '#e3e8e9', obstacles: [['mesa', 325, 170, 135, 76], ['armario', 510, 345, 90, 120], ['cadeira', 600, 165, 75, 74], ['livros', 650, 390, 90, 58]] },
  { name: 'Pátio da Escola', icon: '🏫', tint: '#8dbb8a', floor: '#d9e6d0', obstacles: [['canteiro', 325, 165, 110, 72], ['banco', 515, 365, 140, 48], ['canteiro', 630, 150, 100, 70]] },
]

const extraRoomNames = [
  'Sala de Música', 'Sala de Informática', 'Enfermaria', 'Auditório', 'Vestiário', 'Secretaria', 'Sala dos Professores', 'Sala de Reunião', 'Cantina', 'Sala de Leitura',
  'Estúdio de Rádio', 'Oficina Maker', 'Sala de Robótica', 'Galeria Escolar', 'Jardim Interno', 'Arquivo', 'Depósito Esportivo', 'Sala de Troféus', 'Sala de Dança', 'Sala de Teatro',
  'Anfiteatro', 'Estufa', 'Observatório', 'Terraço', 'Corredor Norte', 'Corredor Sul', 'Subsolo', 'Oficina de Ciências', 'Ginásio Central', 'Sala dos Desafios',
]
const extraRoomIcons = ['🎼', '💻', '🩺', '🎭', '👟', '🗂️', '🍎', '🪑', '🥪', '📖', '🎙️', '🛠️', '🤖', '🖼️', '🌿', '🗃️', '🏆', '🥇', '💃', '🎬', '🎪', '🌱', '🔭', '☀️', '🚪', '🚪', '🧰', '🔬', '🏀', '⭐']
const roomTints = ['#d6e6e2', '#e8d6b2', '#e5c9a2', '#bfdde1', '#efcf91', '#d6a77e', '#e5b3a4', '#bcb49e', '#c5d1df', '#a5c5a0']
const roomFloors = ['#e7eee8', '#eee5d2', '#eee5d2', '#e8efeb', '#f1ead9', '#e7c89e', '#f3e5d8', '#e5e0d3', '#e3e8e9', '#d9e6d0']
const routeRows = [3, 3, 2, 1, 2, 2]
const obstacleSlots = [290, 375, 460, 545, 630, 715].flatMap((x, column) => [85, 170, 255, 340, 425].map((y, row) => ({ column, row, x, y })))
const obstacleLabels = ['carteira', 'livros', 'armario', 'banco', 'lixeira', 'estante', 'bancada', 'microscopio', 'mesa', 'bandejas', 'cone', 'cavalete', 'tintas', 'caixas', 'cadeira', 'canteiro']

function obstacleCountForStage(stage) {
  const milestoneCounts = { 10: 12, 20: 19, 30: 23, 40: 24 }
  if (milestoneCounts[stage]) return milestoneCounts[stage]
  if (stage < 20) return 5 + Math.floor((stage - 11) * 0.85)
  if (stage < 30) return 14 + Math.floor((stage - 21) * 0.8)
  return 17 + Math.floor((stage - 31) * 0.6)
}

function createObstacles(stage, count) {
  const candidates = obstacleSlots.filter((slot) => routeRows[slot.column] !== slot.row)
  let seed = (stage * 374761393 + 668265263) >>> 0
  for (let index = candidates.length - 1; index > 0; index -= 1) {
    seed = (seed * 1664525 + 1013904223) >>> 0
    const swapIndex = seed % (index + 1)
    ;[candidates[index], candidates[swapIndex]] = [candidates[swapIndex], candidates[index]]
  }
  return candidates.slice(0, count).map((slot, index) => {
    const width = 46 + ((stage + index * 7) % 12)
    const height = 46 + ((stage * 3 + index * 5) % 12)
    const label = obstacleLabels[(stage * 7 + index * 5) % obstacleLabels.length]
    return [label, slot.x - width / 2, slot.y - height / 2, width, height]
  })
}

const rooms = [
  ...baseRooms,
  ...extraRoomNames.map((name, index) => ({
    name,
    icon: extraRoomIcons[index],
    tint: roomTints[index % roomTints.length],
    floor: roomFloors[index % roomFloors.length],
    obstacles: [],
  })),
]

rooms.forEach((room, index) => {
  const stage = index + 1
  if (stage >= 10) room.obstacles.push(...createObstacles(stage, obstacleCountForStage(stage) - room.obstacles.length))
})

const saved = JSON.parse(localStorage.getItem('school-hockey-progress') || '{}')
const roomStars = Array.from({ length: rooms.length }, (_, index) => Number(saved.stars?.[index] || 0))
let unlocked = Math.min(rooms.length - 1, Math.max(0, Number(saved.unlocked || 0)))
if (saved.stars?.[9]) unlocked = Math.max(unlocked, 10)
let selectedRoom = 0
let selectedGroup = 0
let shots = 0
let complete = false
let aimPoint = null
let aimPath = []
let activePointer = false
let previousTime = 0
let previousPuckX = 200
let engine
let puck
let fixtures = []
let canvas
let ctx
const savedAppearance = JSON.parse(localStorage.getItem('school-hockey-appearance') || '{}')
const appearance = {
  theme: savedAppearance.theme === 'dark' ? 'dark' : 'light',
  style: ['school', 'ocean', 'garden'].includes(savedAppearance.style) ? savedAppearance.style : 'school',
}

app.innerHTML = `
  <header class="topbar">
    <a class="brand" href="#" aria-label="School Hockey, início">
      <span class="brand-mark">SH<span>+</span></span>
      <span class="brand-name">SCHOOL <b>HOCKEY</b></span>
    </a>
    <div class="top-progress"><span>PROGRESSO</span><strong id="progress-count"></strong><div class="progress-track"><i id="progress-fill"></i></div></div>
    <div class="top-actions">
      <div class="player-chip"><span class="player-avatar">🪙</span><span>ALUNO<br><b>NOVATO</b></span></div>
      <div class="appearance-wrap">
        <button id="appearance-button" class="appearance-button" type="button" aria-expanded="false" aria-controls="appearance-panel"><span aria-hidden="true">◐</span><span class="appearance-label">Aparência</span></button>
        <div id="appearance-panel" class="appearance-panel" hidden>
          <div class="appearance-row"><span>Tema</span><div class="theme-options"><button type="button" data-theme-choice="light">☀ Claro</button><button type="button" data-theme-choice="dark">☾ Escuro</button></div></div>
          <div class="appearance-row"><span>Estilo</span><div class="style-options"><button type="button" class="style-swatch school-swatch" data-style-choice="school" aria-label="Estilo escolar" title="Escolar"></button><button type="button" class="style-swatch ocean-swatch" data-style-choice="ocean" aria-label="Estilo oceano" title="Oceano"></button><button type="button" class="style-swatch garden-swatch" data-style-choice="garden" aria-label="Estilo jardim" title="Jardim"></button></div></div>
        </div>
      </div>
    </div>
  </header>
  <div class="app-layout">
    <aside class="map-panel">
      <div class="map-heading"><div><span class="eyebrow">MAPA DA ESCOLA</span><h1>Escolha uma sala</h1></div><button id="restart-game-button" class="restart-game-button" type="button" title="Reiniciar progresso" aria-label="Reiniciar progresso"><span aria-hidden="true">↺</span><span>Reiniciar</span></button></div>
      <div id="room-groups" class="room-groups" aria-label="Blocos de fases"></div>
      <div id="room-list" class="room-list" aria-label="Fases da escola"></div>
      <div class="map-foot"><span class="map-foot-icon">⭐</span><span><b id="total-stars">0</b> estrelas conquistadas</span></div>
    </aside>
    <main class="game-panel">
      <div class="game-heading">
        <div class="room-title"><span id="room-icon" class="room-icon"></span><div><span class="eyebrow" id="level-label"></span><h2 id="room-name"></h2></div></div>
        <div class="shot-counter"><span>TACADAS</span><b id="shot-count">0</b></div>
      </div>
      <div class="court-frame">
        <div class="court-topline"><span><i class="live-dot"></i> PISTA EM JOGO</span><button id="reset-button" class="icon-button" type="button" title="Recomeçar fase" aria-label="Recomeçar fase">↺</button></div>
        <canvas id="game-canvas" width="900" height="520" aria-label="Pista desenhada em um livro. Arraste a moeda para mirar e solte para tacar com o lápis."></canvas>
        <div class="court-caption"><span><i class="legend-ball"></i> MOEDA</span><span><i class="legend-obstacle"></i> OBSTÁCULOS</span><span>✏️ LÁPIS</span><span><i class="legend-goal"></i> ESTOJO</span><b id="room-record"></b></div>
        <div id="win-overlay" class="win-overlay" hidden>
          <div class="win-sheet"><span class="win-stamp">GOL!</span><p class="eyebrow">FASE CONCLUÍDA</p><h3 id="win-title">Boa tacada!</h3><div id="earned-stars" class="earned-stars"></div><p id="win-copy" class="win-copy"></p><button id="next-button" class="primary-button" type="button">Próxima sala <span>→</span></button><button id="again-button" class="text-button" type="button">Jogar de novo</button></div>
        </div>
      </div>
      <div class="game-instructions"><span class="instruction-icon">↗</span><span><b>Arraste a moeda na direção do estojo</b> e solte para tacar.</span><span class="instruction-tip">A linha prevê o caminho</span></div>
      <div class="bottom-note"><span>🏫</span> No corredor da escola, mire até o estojo.</div>
    </main>
  </div>
`

canvas = document.querySelector('#game-canvas')
ctx = canvas.getContext('2d')
ctx.imageSmoothingEnabled = true
ctx.imageSmoothingQuality = 'high'

function resizeCanvas() {
  const bounds = canvas.getBoundingClientRect()
  const pixelRatio = Math.min(window.devicePixelRatio || 1, 3)
  const pixelWidth = Math.round((bounds.width || 900) * pixelRatio)
  const pixelHeight = Math.round((bounds.height || 520) * pixelRatio)
  if (canvas.width === pixelWidth && canvas.height === pixelHeight) return
  canvas.width = pixelWidth
  canvas.height = pixelHeight
  ctx.setTransform(pixelWidth / 900, 0, 0, pixelHeight / 520, 0, 0)
  if (puck) draw()
}

window.addEventListener('resize', resizeCanvas)
resizeCanvas()

const propSheet = new Image()
propSheet.src = new URL('./assets/school-props.svg', import.meta.url).href
propSheet.addEventListener('load', draw)

const propSprites = {
  carteira: [0, 220, 180], livros: [1, 190, 140], armario: [2, 145, 220], banco: [3, 240, 112],
  lixeira: [4, 150, 190], estante: [5, 220, 220], bancada: [6, 240, 135], microscopio: [7, 160, 190],
  mesa: [8, 225, 145], bandejas: [9, 200, 140], cone: [10, 155, 190], cavalete: [11, 170, 225],
  tintas: [12, 220, 175], caixas: [13, 220, 205], cadeira: [14, 185, 200], canteiro: [15, 230, 155],
}

function saveProgress() {
  localStorage.setItem('school-hockey-progress', JSON.stringify({ stars: roomStars, unlocked }))
}

function restartProgress() {
  const confirmed = window.confirm('Reiniciar o jogo? Seu progresso e suas estrelas serão apagados.')
  if (!confirmed) return
  roomStars.fill(0)
  unlocked = 0
  saveProgress()
  setRoom(0)
}

function applyAppearance() {
  document.documentElement.dataset.theme = appearance.theme
  document.documentElement.dataset.style = appearance.style
  localStorage.setItem('school-hockey-appearance', JSON.stringify(appearance))
  document.querySelectorAll('[data-theme-choice]').forEach((button) => {
    button.setAttribute('aria-pressed', String(button.dataset.themeChoice === appearance.theme))
  })
  document.querySelectorAll('[data-style-choice]').forEach((button) => {
    button.setAttribute('aria-pressed', String(button.dataset.styleChoice === appearance.style))
  })
}

function renderRooms() {
  const firstRoom = selectedGroup * 10
  document.querySelector('#room-groups').innerHTML = Array.from({ length: 4 }, (_, group) => {
    const firstStage = group * 10 + 1
    const lastStage = firstStage + 9
    const locked = group > 0 && group * 10 > unlocked
    return `<button class="room-group ${group === selectedGroup ? 'active' : ''}" type="button" data-group="${group}" ${locked ? 'disabled' : ''} aria-pressed="${group === selectedGroup}">${firstStage}–${lastStage}</button>`
  }).join('')
  document.querySelector('#room-list').innerHTML = rooms.slice(firstRoom, firstRoom + 10).map((room, offset) => {
    const index = firstRoom + offset
    const locked = index > unlocked
    const stars = roomStars[index]
    return `<button class="room-row ${index === selectedRoom ? 'selected' : ''} ${locked ? 'locked' : ''} ${stars ? 'completed' : ''}" type="button" data-room="${index}" ${locked ? 'disabled' : ''} aria-label="${room.name}${locked ? ', bloqueada' : ''}">
      <span class="room-row-icon" style="--room-tint:${room.tint}">${locked ? '🔒' : room.icon}</span><span class="room-row-copy"><b>${room.name}</b><small>${locked ? 'Complete a fase anterior' : stars ? 'Fase concluída' : index === 0 ? 'Comece por aqui' : 'Fase desbloqueada'}</small></span><span class="room-row-stars">${stars ? '★'.repeat(stars) + '☆'.repeat(3 - stars) : locked ? '' : '···'}</span>
    </button>`
  }).join('')
  document.querySelector('#progress-count').textContent = `${roomStars.filter(Boolean).length} / ${rooms.length} salas`
  document.querySelector('#progress-fill').style.width = `${(roomStars.filter(Boolean).length / rooms.length) * 100}%`
  document.querySelector('#total-stars').textContent = roomStars.reduce((sum, value) => sum + value, 0)
}

function setRoom(index) {
  if (index > unlocked) return
  selectedRoom = index
  selectedGroup = Math.floor(index / 10)
  shots = 0
  complete = false
  aimPoint = null
  aimPath = []
  document.querySelector('#win-overlay').hidden = true
  const room = rooms[index]
  document.querySelector('#room-icon').textContent = room.icon
  document.querySelector('#room-name').textContent = room.name
  document.querySelector('#level-label').textContent = `FASE ${String(index + 1).padStart(2, '0')} / ${rooms.length}`
  document.querySelector('#shot-count').textContent = shots
  document.querySelector('#room-record').textContent = roomStars[index] ? `${'★'.repeat(roomStars[index])}${'☆'.repeat(3 - roomStars[index])} MELHOR` : ''
  renderRooms()
  buildWorld()
}

function buildWorld() {
  engine = Engine.create({ gravity: { x: 0, y: 0 } })
  engine.positionIterations = 8
  engine.velocityIterations = 6
  const boundaries = [
    Bodies.rectangle(450, -8, 920, 24, { isStatic: true }),
    Bodies.rectangle(450, 528, 920, 24, { isStatic: true }),
    Bodies.rectangle(-8, 260, 24, 540, { isStatic: true }),
    Bodies.rectangle(908, 260, 24, 540, { isStatic: true }),
  ]
  const goalRails = [
    Bodies.rectangle(818, 219, 92, 10, { isStatic: true, label: 'goal-top' }),
    Bodies.rectangle(818, 301, 92, 10, { isStatic: true, label: 'goal-bottom' }),
    Bodies.rectangle(860, 260, 10, 92, { isStatic: true, label: 'goal-back' }),
  ]
  fixtures = rooms[selectedRoom].obstacles.map(([label, x, y, width, height]) => ({
    label, x, y, width, height,
    body: Bodies.rectangle(x + width / 2, y + height / 2, width, height, { isStatic: true, restitution: 0.48, chamfer: { radius: 9 } }),
  }))
  puck = Bodies.circle(200, 394, 18, { restitution: 0.72, frictionAir: 0.018, density: 0.008, label: 'puck' })
  previousPuckX = puck.position.x
  Composite.add(engine.world, [...boundaries, ...goalRails, ...fixtures.map((fixture) => fixture.body), puck])
}

function roundedRect(x, y, width, height, radius, fill, stroke) {
  ctx.beginPath()
  ctx.roundRect(x, y, width, height, radius)
  ctx.fillStyle = fill
  ctx.fill()
  if (stroke) {
    ctx.strokeStyle = stroke
    ctx.lineWidth = 2
    ctx.stroke()
  }
}

function drawFloor() {
  const room = rooms[selectedRoom]
  ctx.fillStyle = '#738275'
  ctx.fillRect(0, 0, 900, 520)
  ctx.save()
  ctx.shadowColor = 'rgba(39,48,39,.24)'
  ctx.shadowBlur = 14
  ctx.shadowOffsetY = 7
  roundedRect(17, 16, 866, 488, 18, '#778675', '#45594d')
  ctx.shadowColor = 'transparent'
  roundedRect(25, 22, 850, 48, 9, '#c9c1a9', '#6f684f')
  roundedRect(25, 450, 850, 48, 9, '#c9c1a9', '#6f684f')
  roundedRect(30, 64, 840, 392, 6, room.floor, '#98876a')
  ctx.globalAlpha = 0.1
  for (let row = 0; row < 8; row += 1) {
    for (let column = 0; column < 12; column += 1) {
      if ((row + column) % 2 === 0) {
        ctx.fillStyle = '#756446'
        ctx.fillRect(34 + column * 70, 68 + row * 48, 70, 48)
      }
    }
  }
  ctx.globalAlpha = 0.24
  ctx.strokeStyle = '#a18d68'
  ctx.lineWidth = 1
  for (let x = 34; x <= 874; x += 70) {
    ctx.beginPath(); ctx.moveTo(x, 66); ctx.lineTo(x, 454); ctx.stroke()
  }
  for (let y = 68; y <= 452; y += 48) {
    ctx.beginPath(); ctx.moveTo(31, y); ctx.lineTo(869, y); ctx.stroke()
  }
  ctx.globalAlpha = 1
  for (let index = 0; index < 8; index += 1) {
    const lockerX = 48 + index * 103
    roundedRect(lockerX, 27, 86, 36, 4, '#7e9787', '#536d60')
    ctx.strokeStyle = '#c3cfb7'
    ctx.lineWidth = 1
    for (let vent = 0; vent < 3; vent += 1) {
      ctx.beginPath(); ctx.moveTo(lockerX + 10, 34 + vent * 4); ctx.lineTo(lockerX + 27, 34 + vent * 4); ctx.stroke()
    }
    ctx.fillStyle = '#e2c477'
    ctx.fillRect(lockerX + 70, 42, 3, 8)
  }
  for (let index = 0; index < 5; index += 1) {
    const doorX = 75 + index * 166
    roundedRect(doorX, 456, 112, 37, 4, '#b9895e', '#745b42')
    roundedRect(doorX + 34, 460, 43, 8, 3, '#e4d3a7', '#91774f')
    ctx.beginPath(); ctx.arc(doorX + 94, 478, 3, 0, Math.PI * 2); ctx.fillStyle = '#f0cf72'; ctx.fill()
    ctx.strokeStyle = '#d8b986'
    ctx.lineWidth = 1
    ctx.beginPath(); ctx.moveTo(doorX + 10, 488); ctx.lineTo(doorX + 102, 488); ctx.stroke()
  }
  ctx.restore()
}

function drawFixture(fixture) {
  const { x, y, width, height, label } = fixture
  const sprite = propSprites[label]
  if (sprite && propSheet.complete && propSheet.naturalWidth) {
    const [index, sourceWidth, sourceHeight] = sprite
    const sourceX = index % 4 * 256 + (256 - sourceWidth) / 2
    const sourceY = Math.floor(index / 4) * 256 + (256 - sourceHeight) / 2
    const drawWidth = (width + 6) * 0.88
    const drawHeight = (height + 6) * 0.88
    const drawX = x + (width - drawWidth) / 2
    const drawY = y + (height - drawHeight) / 2
    ctx.save()
    ctx.shadowColor = 'rgba(66,58,43,.2)'
    ctx.shadowBlur = 8
    ctx.shadowOffsetY = 4
    ctx.drawImage(propSheet, sourceX, sourceY, sourceWidth, sourceHeight, drawX, drawY, drawWidth, drawHeight)
    ctx.restore()
    return
  }
  const colors = {
    carteira: ['#cf9a62', '#966c43'], livros: ['#d87a58', '#ad5845'], armario: ['#8c9d8d', '#68796a'], banco: ['#bd8758', '#936842'], lixeira: ['#7eaaa0', '#56877e'], estante: ['#9b6547', '#744b38'], bancada: ['#aab9ae', '#7d958a'], microscopio: ['#829bac', '#607584'], mesa: ['#d2a15e', '#a47b47'], bandejas: ['#8fadb0', '#627f83'], cone: ['#df7952', '#b8583d'], cavalete: ['#bf875a', '#946443'], tintas: ['#d88173', '#b15c58'], caixas: ['#bd9660', '#937249'], cadeira: ['#70889a', '#536b7b'], canteiro: ['#88a77c', '#66845d'],
  }
  const [fill, edge] = colors[label] || ['#c49a67', '#96724f']
  ctx.save()
  ctx.shadowColor = 'rgba(66,58,43,.14)'
  ctx.shadowBlur = 8
  ctx.shadowOffsetY = 4
  roundedRect(x, y, width, height, 10, fill, edge)
  ctx.shadowColor = 'transparent'
  ctx.fillStyle = 'rgba(255,255,255,.23)'
  ctx.fillRect(x + 8, y + 8, width - 16, 5)
  ctx.fillStyle = '#fffaf0'
  ctx.font = '700 11px "Nunito Sans", sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  const text = label.toUpperCase()
  ctx.fillText(text.length > 11 ? text.slice(0, 10) : text, x + width / 2, y + height / 2 + 2)
  ctx.restore()
}

function drawGoal() {
  ctx.save()
  ctx.shadowColor = 'rgba(45,53,47,.2)'
  ctx.shadowBlur = 12
  ctx.shadowOffsetY = 5
  roundedRect(772, 214, 94, 92, 15, '#6f9c8a', '#405d50')
  ctx.shadowColor = 'transparent'
  roundedRect(777, 229, 80, 62, 10, '#f2dba8', '#567764')
  ctx.strokeStyle = '#fff0c8'
  ctx.lineWidth = 2
  ctx.beginPath(); ctx.moveTo(789, 239); ctx.lineTo(789, 281); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(800, 239); ctx.lineTo(800, 281); ctx.stroke()
  roundedRect(772, 214, 94, 14, 7, '#568474', '#405d50')
  roundedRect(772, 292, 94, 14, 7, '#568474', '#405d50')
  roundedRect(857, 214, 10, 92, 5, '#e9c86c', '#405d50')
  ctx.strokeStyle = '#f8e6b6'
  ctx.lineWidth = 2
  for (let x = 783; x < 850; x += 8) {
    ctx.beginPath(); ctx.moveTo(x, 224); ctx.lineTo(x + 3, 224); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(x, 296); ctx.lineTo(x + 3, 296); ctx.stroke()
  }
  roundedRect(796, 217, 15, 10, 4, '#e9c86c', '#405d50')
  ctx.beginPath(); ctx.arc(802, 222, 2, 0, Math.PI * 2); ctx.fillStyle = '#fff1c7'; ctx.fill()
  ctx.fillStyle = '#525a4e'
  ctx.font = '900 10px "Nunito Sans", sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('ESTOJO', 820, 208)
  ctx.restore()
}

function drawPuck() {
  const { x, y } = puck.position
  ctx.save()
  ctx.shadowColor = 'rgba(89,62,21,.35)'
  ctx.shadowBlur = 9
  ctx.shadowOffsetY = 5
  const coin = ctx.createRadialGradient(x - 6, y - 7, 2, x, y, 19)
  coin.addColorStop(0, '#fff0a6')
  coin.addColorStop(0.58, '#e9bd4f')
  coin.addColorStop(1, '#b77c2b')
  ctx.beginPath(); ctx.arc(x, y, 18, 0, Math.PI * 2); ctx.fillStyle = coin; ctx.fill()
  ctx.shadowColor = 'transparent'
  ctx.lineWidth = 2.5
  ctx.strokeStyle = '#946321'
  ctx.stroke()
  ctx.beginPath(); ctx.arc(x, y, 12, 0, Math.PI * 2); ctx.strokeStyle = '#f8df83'; ctx.lineWidth = 1.5; ctx.stroke()
  ctx.fillStyle = '#9f7028'
  ctx.font = '900 15px Georgia, serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('S', x, y + 1)
  ctx.beginPath(); ctx.arc(x - 6, y - 6, 1.5, 0, Math.PI * 2); ctx.fillStyle = '#fff5c6'; ctx.fill()
  ctx.restore()
}

function drawPencilTaco() {
  if (!aimPoint || complete) return
  const dx = aimPoint.x - puck.position.x
  const dy = aimPoint.y - puck.position.y
  if (Math.hypot(dx, dy) < 10) return
  ctx.save()
  ctx.translate(puck.position.x, puck.position.y)
  ctx.rotate(Math.atan2(dy, dx))
  ctx.shadowColor = 'rgba(50,43,31,.24)'
  ctx.shadowBlur = 5
  ctx.shadowOffsetY = 3
  roundedRect(-101, -5, 72, 10, 4, '#e7b83f', '#966d2c')
  ctx.shadowColor = 'transparent'
  ctx.fillStyle = '#f8dc83'
  ctx.fillRect(-94, -2, 57, 2)
  ctx.fillStyle = '#d98369'
  roundedRect(-111, -5, 11, 10, 4, '#d98369', '#955b4b')
  ctx.fillStyle = '#b5b9ad'
  ctx.fillRect(-101, -5, 7, 10)
  ctx.beginPath(); ctx.moveTo(-29, -5); ctx.lineTo(-17, 0); ctx.lineTo(-29, 5); ctx.closePath(); ctx.fillStyle = '#e0c39a'; ctx.fill()
  ctx.beginPath(); ctx.moveTo(-17, 0); ctx.lineTo(-10, 0); ctx.lineTo(-17, 2.5); ctx.closePath(); ctx.fillStyle = '#57564c'; ctx.fill()
  ctx.restore()
}

function traceAim() {
  const dx = aimPoint.x - puck.position.x
  const dy = aimPoint.y - puck.position.y
  const magnitude = Math.hypot(dx, dy)
  if (magnitude < 10) return []
  const speed = Math.min(magnitude, 170) * 0.105
  const previewEngine = Engine.create({ gravity: { x: 0, y: 0 } })
  previewEngine.positionIterations = 8
  previewEngine.velocityIterations = 6
  const previewBoundaries = [
    Bodies.rectangle(450, -8, 920, 24, { isStatic: true }),
    Bodies.rectangle(450, 528, 920, 24, { isStatic: true }),
    Bodies.rectangle(-8, 260, 24, 540, { isStatic: true }),
    Bodies.rectangle(908, 260, 24, 540, { isStatic: true }),
    Bodies.rectangle(818, 219, 92, 10, { isStatic: true }),
    Bodies.rectangle(818, 301, 92, 10, { isStatic: true }),
    Bodies.rectangle(860, 260, 10, 92, { isStatic: true }),
  ]
  const previewFixtures = fixtures.map(({ x, y, width, height }) => Bodies.rectangle(
    x + width / 2,
    y + height / 2,
    width,
    height,
    { isStatic: true, restitution: 0.48, chamfer: { radius: 9 } },
  ))
  const previewPuck = Bodies.circle(puck.position.x, puck.position.y, 18, { restitution: 0.72, frictionAir: 0.018, density: 0.008 })
  Body.setVelocity(previewPuck, { x: dx / magnitude * speed, y: dy / magnitude * speed })
  Composite.add(previewEngine.world, [...previewBoundaries, ...previewFixtures, previewPuck])
  const path = [{ x: previewPuck.position.x, y: previewPuck.position.y }]
  let previousX = previewPuck.position.x
  for (let step = 0; step < 320; step += 1) {
    Engine.update(previewEngine, 16.66)
    const position = { x: previewPuck.position.x, y: previewPuck.position.y }
    if (step % 2 === 0) path.push(position)
    const enteredFromFront = previousX <= 772 && position.x > 772 && previewPuck.velocity.x > 0
    if (enteredFromFront && position.y >= 242 && position.y <= 278) {
      path.push({ x: 824, y: 260 })
      break
    }
    previousX = position.x
    if (Math.hypot(previewPuck.velocity.x, previewPuck.velocity.y) < 0.12) {
      path.push(position)
      break
    }
  }
  Engine.clear(previewEngine)
  return path
}

function drawAim() {
  if (!aimPoint || complete || aimPath.length < 2) return
  const visiblePath = [aimPath[0]]
  let remainingLength = 180
  for (let index = 1; index < aimPath.length; index += 1) {
    const previous = visiblePath[visiblePath.length - 1]
    const point = aimPath[index]
    const segmentX = point.x - previous.x
    const segmentY = point.y - previous.y
    const segmentLength = Math.hypot(segmentX, segmentY)
    if (segmentLength <= remainingLength) {
      visiblePath.push(point)
      remainingLength -= segmentLength
      continue
    }
    const ratio = remainingLength / segmentLength
    visiblePath.push({ x: previous.x + segmentX * ratio, y: previous.y + segmentY * ratio })
    break
  }
  const endpoint = visiblePath[visiblePath.length - 1]
  ctx.save()
  ctx.setLineDash([5, 6])
  ctx.strokeStyle = '#d9654d'
  ctx.globalAlpha = 0.9
  ctx.lineWidth = 3.5
  ctx.beginPath()
  ctx.moveTo(visiblePath[0].x, visiblePath[0].y)
  visiblePath.slice(1).forEach((point) => ctx.lineTo(point.x, point.y))
  ctx.stroke()
  ctx.setLineDash([])
  ctx.beginPath(); ctx.arc(endpoint.x, endpoint.y, 6, 0, Math.PI * 2); ctx.fillStyle = '#ed7557'; ctx.fill()
  ctx.beginPath(); ctx.arc(aimPoint.x, aimPoint.y, 5, 0, Math.PI * 2); ctx.fillStyle = '#fffaf0'; ctx.fill(); ctx.strokeStyle = '#375e71'; ctx.lineWidth = 2; ctx.stroke()
  ctx.restore()
}

function draw() {
  ctx.clearRect(0, 0, 900, 520)
  drawFloor()
  fixtures.forEach(drawFixture)
  drawGoal()
  drawAim()
  drawPencilTaco()
  drawPuck()
}

function finishLevel() {
  complete = true
  Body.setPosition(puck, { x: 824, y: 260 })
  Body.setVelocity(puck, { x: 0, y: 0 })
  Body.setStatic(puck, true)
  const earned = shots === 1 ? 3 : shots <= 3 ? 2 : 1
  roomStars[selectedRoom] = Math.max(roomStars[selectedRoom], earned)
  unlocked = Math.max(unlocked, Math.min(rooms.length - 1, selectedRoom + 1))
  saveProgress()
  renderRooms()
  const overlay = document.querySelector('#win-overlay')
  document.querySelector('#win-title').textContent = earned === 3 ? 'Tacada perfeita!' : 'Moeda no estojo!'
  document.querySelector('#earned-stars').innerHTML = [1, 2, 3].map((star) => `<span class="${star <= earned ? 'earned' : ''}">★</span>`).join('')
  document.querySelector('#win-copy').textContent = `${shots} ${shots === 1 ? 'tacada' : 'tacadas'} · ${earned} ${earned === 1 ? 'estrela' : 'estrelas'}`
  const next = selectedRoom + 1 < rooms.length
  document.querySelector('#next-button').hidden = !next
  document.querySelector('#next-button').innerHTML = next ? `Próxima sala <span>→</span>` : `Fim de jogo! <span>★</span>`
  overlay.hidden = false
}

function pointerPosition(event) {
  const rect = canvas.getBoundingClientRect()
  const x = (event.clientX - rect.left) * 900 / rect.width
  const y = (event.clientY - rect.top) * 520 / rect.height
  return { x: Math.max(0, Math.min(900, x)), y: Math.max(0, Math.min(520, y)) }
}

canvas.addEventListener('pointerdown', (event) => {
  if (complete) return
  const point = pointerPosition(event)
  if (Math.hypot(point.x - puck.position.x, point.y - puck.position.y) < 42 && Math.hypot(puck.velocity.x, puck.velocity.y) < 0.5) {
    activePointer = true
    aimPoint = point
    aimPath = traceAim()
    canvas.setPointerCapture(event.pointerId)
  }
})

canvas.addEventListener('pointermove', (event) => {
  if (activePointer) {
    aimPoint = pointerPosition(event)
    aimPath = traceAim()
  }
})

canvas.addEventListener('pointerup', () => {
  if (!activePointer) return
  activePointer = false
  const dx = aimPoint.x - puck.position.x
  const dy = aimPoint.y - puck.position.y
  const magnitude = Math.hypot(dx, dy)
  aimPoint = null
  aimPath = []
  if (magnitude < 10) return
  const power = Math.min(magnitude, 170) * 0.105
  Body.setVelocity(puck, { x: dx / magnitude * power, y: dy / magnitude * power })
  shots += 1
  document.querySelector('#shot-count').textContent = shots
})

document.querySelector('#room-list').addEventListener('click', (event) => {
  const button = event.target.closest('[data-room]')
  if (button) setRoom(Number(button.dataset.room))
})
document.querySelector('#room-groups').addEventListener('click', (event) => {
  const button = event.target.closest('[data-group]')
  if (!button || button.disabled) return
  selectedGroup = Number(button.dataset.group)
  renderRooms()
})
document.querySelector('#reset-button').addEventListener('click', () => setRoom(selectedRoom))
document.querySelector('#restart-game-button').addEventListener('click', restartProgress)
document.querySelector('#again-button').addEventListener('click', () => setRoom(selectedRoom))
document.querySelector('#next-button').addEventListener('click', () => {
  if (selectedRoom + 1 < rooms.length) setRoom(selectedRoom + 1)
})
document.querySelector('#appearance-button').addEventListener('click', (event) => {
  const panel = document.querySelector('#appearance-panel')
  panel.hidden = !panel.hidden
  event.currentTarget.setAttribute('aria-expanded', String(!panel.hidden))
})
document.querySelector('#appearance-panel').addEventListener('click', (event) => {
  const themeButton = event.target.closest('[data-theme-choice]')
  const styleButton = event.target.closest('[data-style-choice]')
  if (themeButton) appearance.theme = themeButton.dataset.themeChoice
  if (styleButton) appearance.style = styleButton.dataset.styleChoice
  if (themeButton || styleButton) applyAppearance()
})
document.addEventListener('click', (event) => {
  if (event.target.closest('.appearance-wrap')) return
  const panel = document.querySelector('#appearance-panel')
  panel.hidden = true
  document.querySelector('#appearance-button').setAttribute('aria-expanded', 'false')
})
document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return
  document.querySelector('#appearance-panel').hidden = true
  document.querySelector('#appearance-button').setAttribute('aria-expanded', 'false')
})
applyAppearance()

function frame(time) {
  const delta = previousTime ? Math.min(time - previousTime, 16.66) : 16.66
  previousTime = time
  Engine.update(engine, delta)
  if (Math.hypot(puck.velocity.x, puck.velocity.y) < 0.12) Body.setVelocity(puck, { x: 0, y: 0 })
  const { x, y } = puck.position
  const enteredFromFront = previousPuckX <= 772 && x > 772 && puck.velocity.x > 0
  const insideGoalMouth = y >= 242 && y <= 278
  if (!complete && enteredFromFront && insideGoalMouth) finishLevel()
  previousPuckX = puck.position.x
  draw()
  requestAnimationFrame(frame)
}

setRoom(0)
requestAnimationFrame(frame)

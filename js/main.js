// TUTTI GLI AUDIO DISPONIBILI
const allAudioSamples = [
  'audio/251004-shinjuku-gachaponshop-ambience.mp3',
  'audio/251004-shinjuku-gachaponshop-coins.mp3',
  'audio/251004-shinjuku-gachaponshop-guitarjingle.mp3',
  'audio/251004-shinjuku-gachaponshop-playing.mp3',
];

// Array degli audio non ancora estratti
let availableAudios = [...allAudioSamples];

const knobContainer = document.getElementById('knob-container');
const knob = document.getElementById('knob');
const textCircle = document.querySelector('.text-circle');
const status = document.getElementById('status');
const instruction = document.querySelector('.instruction');

let capsules = [];
let instructionToggle = true;
let isSoldOut = false;
let capsuleCounter = 0;

// Automatically alternate instruction text every 3 seconds
setInterval(() => {
  if (!isSoldOut) {
    instructionToggle = !instructionToggle;
    instruction.textContent = instructionToggle ? '回す' : 'rotate';
  }
}, 3000);

// About section toggle with typewriter effect
const aboutLink = document.getElementById('about-link');
const aboutText = document.getElementById('about-text');
const typewriter = document.getElementById('typewriter');
const fullText = 'This site is constantly evolving, so feel free to visit it regularly. Created by Francesco De Grazia and Arielle Krebs.';
let aboutOpen = false;

function typeWriterEffect(text, element, speed = 50) {
  let i = 0;
  element.textContent = '';
  element.classList.add('typing');

  function type() {
    if (i < text.length) {
      element.textContent += text.charAt(i);
      i++;
      setTimeout(type, speed);
    } else {
      element.classList.remove('typing');
      element.classList.add('done');
    }
  }
  type();
}

aboutLink.addEventListener('click', function(e) {
  e.preventDefault();

  if (!aboutOpen) {
    aboutText.classList.add('show');
    setTimeout(() => {
      typeWriterEffect(fullText, typewriter);
    }, 100);
    aboutOpen = true;
  } else {
    aboutText.classList.remove('show');
    typewriter.classList.remove('done', 'typing');
    typewriter.textContent = '';
    aboutOpen = false;
  }
});

// Click on knob - ESTRAE NUOVO AUDIO RANDOM
knobContainer.addEventListener('click', function(e) {
  // Se è sold out, non fare nulla
  if (isSoldOut) {
    console.log('❌ Sold out! No more audios available.');
    return;
  }

  console.log('🎰 Knob clicked - extracting new audio!');
  console.log('📊 Remaining audios:', availableAudios.length);

  // Animazione knob
  if (!knob.classList.contains('turning')) {
    textCircle.style.animationPlayState = 'paused';

    knob.classList.add('turning');
    setTimeout(() => {
      knob.classList.remove('turning');
      knob.style.transform = 'translate(-50%, -50%) rotate(300deg)';
      textCircle.style.animationPlayState = 'running';
    }, 1200);
  }

  // Dopo l'animazione, estrae un audio random
  setTimeout(() => {
    extractRandomAudio();
  }, 600);
});

function extractRandomAudio() {
  // Controlla se ci sono ancora audio disponibili
  if (availableAudios.length === 0) {
    console.log('🚫 SOLD OUT!');
    isSoldOut = true;
    knobContainer.classList.add('sold-out');
    status.textContent = 'SOLD OUT';
    status.classList.add('show', 'error');
    instruction.textContent = '';
    instruction.style.animation = 'none';
    return;
  }

  // Estrae un audio random dall'array disponibili
  const randomIndex = Math.floor(Math.random() * availableAudios.length);
  const selectedAudio = availableAudios[randomIndex];

  console.log('🎁 Extracted:', selectedAudio);
  console.log('📊 Remaining:', availableAudios.length - 1);

  // Rimuove l'audio estratto dall'array
  availableAudios.splice(randomIndex, 1);

  // Crea un nuovo player
  createPlayer(selectedAudio);
}

function createPlayer(audioPath) {
  capsuleCounter++;

  // Carica il nuovo audio
  const audio = new Audio(audioPath);
  audio.loop = true;

  // Estrai il nome del file
  const fileName = audioPath.split('/').pop().replace('.mp3', '').replace(/-/g, ' ');

  // Crea oggetto per tracciare audio
  const audioData = {
    audio: audio,
    id: capsuleCounter,
    fileName: fileName
  };

  capsules.push(audioData);

  const player = document.createElement('div');
  player.className = 'audio-player';
  player.id = 'audio-player-' + capsuleCounter;

  // Posizionamento iniziale - sarà calcolato correttamente da positionPlayers
  player.style.left = '50%';
  player.style.transform = 'translateX(-50%)';

  const playPauseBtn = document.createElement('button');
  playPauseBtn.className = 'play-pause-btn';
  playPauseBtn.textContent = '▶';
  playPauseBtn.setAttribute('aria-label', 'Play/Pause ' + fileName);

  player.appendChild(playPauseBtn);
  document.body.appendChild(player); // Aggiungi al body invece che al container

  // Mostra player con fade in
  setTimeout(() => {
    player.classList.add('show');
    // Posiziona correttamente il player appena creato
    positionPlayers();
  }, 800);

  // Event listeners audio
  audio.addEventListener('playing', () => {
    playPauseBtn.textContent = '⏸';
    console.log('▶️ Audio playing:', fileName);
  });

  audio.addEventListener('pause', () => {
    playPauseBtn.textContent = '▶';
    console.log('⏸️ Audio paused:', fileName);
  });

  audio.addEventListener('error', (e) => {
    console.error('❌ Audio error:', e);
    playPauseBtn.textContent = '✕';
    playPauseBtn.style.color = '#ff0000';
  });

  // Play/Pause button
  playPauseBtn.onclick = function(e) {
    e.stopPropagation();
    if (audio.paused) {
      audio.play().catch(err => {
        console.error('❌ Play failed:', err);
      });
    } else {
      audio.pause();
    }
  };

  // Avvia audio automaticamente
  setTimeout(() => {
    audio.play().catch(err => {
      console.error('❌ Auto-play failed:', err);
      console.log('ℹ️ Click the play button to start audio');
    });
  }, 1000);

  // ===== DRAG & DROP FUNCTIONALITY =====
  makeDraggable(player);
}

// Funzione per rendere un elemento draggable
function makeDraggable(element) {
  let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  let isDragging = false;
  let hasMoved = false;
  let startX = 0, startY = 0;
  const MOVE_THRESHOLD = 5; // pixel minimi per considerarlo un drag

  const dragHandle = element.querySelector('.drag-handle');
  const playPauseBtn = element.querySelector('.play-pause-btn');

  // Aggiungi listener al player intero, non solo al drag-handle
  element.addEventListener('mousedown', dragMouseDown);
  element.addEventListener('touchstart', dragTouchStart, { passive: false });

  function dragMouseDown(e) {
    // Se clicco direttamente sul bottone, non fare nulla (il bottone ha il suo handler)
    if (e.target === playPauseBtn) {
      return;
    }

    e.preventDefault();
    e.stopPropagation();
    isDragging = true;
    hasMoved = false;

    // Salva posizione iniziale
    startX = e.clientX;
    startY = e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;

    document.addEventListener('mouseup', closeDragElement);
    document.addEventListener('mousemove', elementDrag);
  }

  function dragTouchStart(e) {
    if (e.target === playPauseBtn) {
      return;
    }

    e.preventDefault();
    isDragging = true;
    hasMoved = false;

    const touch = e.touches[0];
    startX = touch.clientX;
    startY = touch.clientY;
    pos3 = touch.clientX;
    pos4 = touch.clientY;

    document.addEventListener('touchend', closeDragElement);
    document.addEventListener('touchmove', elementDragTouch, { passive: false });
  }

  function elementDrag(e) {
    if (!isDragging) return;
    e.preventDefault();

    // Calcola distanza dal punto iniziale
    const deltaX = Math.abs(e.clientX - startX);
    const deltaY = Math.abs(e.clientY - startY);

    // Se si è mosso oltre la soglia, considera come drag
    if (deltaX > MOVE_THRESHOLD || deltaY > MOVE_THRESHOLD) {
      hasMoved = true;
      element.classList.add('dragging');

      // Marca come posizione personalizzata
      element.dataset.customPosition = 'true';

      // Calcola la nuova posizione
      pos1 = pos3 - e.clientX;
      pos2 = pos4 - e.clientY;
      pos3 = e.clientX;
      pos4 = e.clientY;

      // Rimuovi il transform per usare posizionamento assoluto puro
      element.style.transform = 'none';

      // Imposta la nuova posizione
      element.style.top = (element.offsetTop - pos2) + "px";
      element.style.left = (element.offsetLeft - pos1) + "px";
    }
  }

  function elementDragTouch(e) {
    if (!isDragging) return;
    e.preventDefault();

    const touch = e.touches[0];
    const deltaX = Math.abs(touch.clientX - startX);
    const deltaY = Math.abs(touch.clientY - startY);

    if (deltaX > MOVE_THRESHOLD || deltaY > MOVE_THRESHOLD) {
      hasMoved = true;
      element.classList.add('dragging');

      element.dataset.customPosition = 'true';

      pos1 = pos3 - touch.clientX;
      pos2 = pos4 - touch.clientY;
      pos3 = touch.clientX;
      pos4 = touch.clientY;

      element.style.transform = 'none';

      element.style.top = (element.offsetTop - pos2) + "px";
      element.style.left = (element.offsetLeft - pos1) + "px";
    }
  }

  function closeDragElement(e) {
    isDragging = false;
    element.classList.remove('dragging');

    // Se NON si è mosso, simula un click sul bottone play/pause
    if (!hasMoved && playPauseBtn) {
      playPauseBtn.click();
    }

    hasMoved = false;
    document.removeEventListener('mouseup', closeDragElement);
    document.removeEventListener('mousemove', elementDrag);
    document.removeEventListener('touchend', closeDragElement);
    document.removeEventListener('touchmove', elementDragTouch);
  }
}

function positionPlayers() {
  const knobContainer = document.getElementById('knob-container');
  const instruction = document.querySelector('.instruction');
  const status = document.getElementById('status');

  if (knobContainer) {
    const knobRect = knobContainer.getBoundingClientRect();
    const knobBottom = knobRect.bottom + window.scrollY;

    // Gap responsive: aumenta il minimo su schermi piccoli
    // Su mobile il minimo è 40px invece che 20px
    const minGap = window.innerHeight < 700 ? 40 : 30;
    const maxGap = 80;
    const baseGap = clamp(minGap, window.innerHeight * 0.08, maxGap);

    // Gap tra cerchio e player - AUMENTATO DEL 50%
    const playerGap = baseGap * 1.5;
    const playersTop = knobBottom + playerGap;

    // Instruction molto più vicina al cerchio (circa 1/3 del baseGap originale)
    const instructionTop = knobBottom + (baseGap * 0.5);

    if (instruction) {
      instruction.style.top = instructionTop + 'px';
    }

    if (status) {
      status.style.top = instructionTop + 'px';
    }

    // Imposta il top e distribuisci i player orizzontalmente
    const players = document.querySelectorAll('.audio-player');
    const spacing = 70; // Spazio tra i player
    const totalWidth = (players.length - 1) * spacing;
    const startLeft = (window.innerWidth / 2) - (totalWidth / 2);

    players.forEach((player, index) => {
      // Imposta il top e left solo se il player non è stato trascinato
      if (!player.dataset.customPosition) {
        player.style.top = playersTop + 'px';
        player.style.left = (startLeft + (index * spacing)) + 'px';
        player.style.transform = 'translateX(-50%)';
      }
    });
  }
}

// Funzione helper per clamp
function clamp(min, val, max) {
  return Math.max(min, Math.min(max, val));
}

// Riposiziona i player quando la finestra viene ridimensionata
window.addEventListener('resize', positionPlayers);

// Posiziona i player al caricamento della pagina
window.addEventListener('load', positionPlayers);

// Posiziona anche subito (nel caso il DOM sia già pronto)
positionPlayers();

// ===== TIME MACHINE EASTER EGG =====
// Press "T" key to activate Time Machine archive
document.addEventListener('keydown', (e) => {
  // Only activate if user presses "T" (not in an input field)
  if (e.key === 't' || e.key === 'T') {
    // Don't activate if user is typing in an input/textarea
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
      return;
    }

    // Navigate to archive page
    window.location.href = 'archive.html';
  }
});

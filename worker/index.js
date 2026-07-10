let simInterval = null;
let simState = null;
let lastNotificationTime = 0;
let isPaused = false;

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

function broadcast(type, payload) {
  self.clients.matchAll().then(clients => {
    clients.forEach(client => client.postMessage({ type, payload }));
  });
}

function sendSimNotification(title, body, actions = []) {
  self.registration.showNotification(title, {
    body,
    icon: '/favicon.ico',
    tag: 'ev-charging',
    renotify: true,
    actions
  });
}

function tick() {
  if (isPaused || !simState) return;
  simState.currentSoc += 1;
  
  broadcast('PROGRESS', { currentSoc: simState.currentSoc });
  
  const now = Date.now();
  if (now - lastNotificationTime >= 5000) {
    lastNotificationTime = now;
    const energyUsedSoFar = ((simState.currentSoc - simState.startSoc) / 100) * simState.capacity / (simState.efficiency/100);
    const currentCost = (energyUsedSoFar * simState.costPerKwh).toFixed(2);
    const rangeGained = Math.round(((simState.currentSoc - simState.startSoc) / 100) * simState.customRange);
    
    sendSimNotification(
      `Charging: ${simState.currentSoc}%`,
      `Cost: ${simState.currency}${currentCost} • Range: +${rangeGained}km`,
      [
        { action: 'pause', title: 'Pause' },
        { action: 'stop', title: 'Stop' }
      ]
    );
  }

  if (simState.currentSoc >= simState.endSoc) {
    stopSimulation('COMPLETED');
  }
}

function stopSimulation(reason) {
  if (simInterval) clearInterval(simInterval);
  simInterval = null;
  
  if (!simState) return;

  const energyUsedSoFar = ((simState.currentSoc - simState.startSoc) / 100) * simState.capacity / (simState.efficiency/100);
  const currentCost = (energyUsedSoFar * simState.costPerKwh).toFixed(2);
  const rangeGained = Math.round(((simState.currentSoc - simState.startSoc) / 100) * simState.customRange);
  const effectiveKw = simState.chargerKw * (simState.efficiency / 100);
  const timeHrs = energyUsedSoFar / effectiveKw;
  const mins = Math.round(timeHrs * 60);

  let title = reason === 'COMPLETED' ? 'Charging Complete! 🔋' : 'Charging Stopped 🛑';
  
  sendSimNotification(
    title,
    `Reached ${simState.currentSoc}% SoC.\nCost: ${simState.currency}${currentCost}\nAdded: +${rangeGained}km in ~${mins} mins`
  );
  
  broadcast('STOPPED', { 
    reason, 
    finalSoc: simState.currentSoc,
    cost: currentCost,
    energy: energyUsedSoFar.toFixed(1),
    timeMins: mins,
    rangeGained,
    startSoc: simState.startSoc
  });
  
  simState = null;
  isPaused = false;
}

self.addEventListener('message', (event) => {
  const { type, payload } = event.data;
  
  if (type === 'START') {
    if (simInterval) clearInterval(simInterval);
    simState = { ...payload, currentSoc: payload.startSoc };
    isPaused = false;
    lastNotificationTime = Date.now();
    
    sendSimNotification('Charging Started ⚡', `Initializing session from ${simState.currentSoc}%...`, [
      { action: 'pause', title: 'Pause' },
      { action: 'stop', title: 'Stop' }
    ]);
    
    simInterval = setInterval(tick, payload.intervalSpeed);
  } else if (type === 'PAUSE' && simState) {
    isPaused = true;
    broadcast('PAUSED', {});
    sendSimNotification('Charging Paused ⏸️', `Paused at ${simState.currentSoc}%`, [{ action: 'resume', title: 'Resume' }, { action: 'stop', title: 'Stop' }]);
  } else if (type === 'RESUME' && simState) {
    isPaused = false;
    broadcast('RESUMED', {});
    sendSimNotification('Charging Resumed ▶️', `Resumed at ${simState.currentSoc}%`, [{ action: 'pause', title: 'Pause' }, { action: 'stop', title: 'Stop' }]);
  } else if (type === 'STOP' && simState) {
    stopSimulation('USER_STOPPED');
  } else if (type === 'SYNC') {
    // Send current state to UI
    if (simState) {
      broadcast('SYNC_STATE', {
        isSimulating: true,
        isPaused,
        currentSoc: simState.currentSoc,
        payload: simState
      });
    } else {
      broadcast('SYNC_STATE', { isSimulating: false, isPaused: false });
    }
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'pause' && simState) {
    isPaused = true;
    broadcast('PAUSED', {});
    sendSimNotification('Charging Paused ⏸️', `Paused at ${simState.currentSoc}%`, [{ action: 'resume', title: 'Resume' }, { action: 'stop', title: 'Stop' }]);
  } else if (event.action === 'resume' && simState) {
    isPaused = false;
    broadcast('RESUMED', {});
    sendSimNotification('Charging Resumed ▶️', `Resumed at ${simState.currentSoc}%`, [{ action: 'pause', title: 'Pause' }, { action: 'stop', title: 'Stop' }]);
  } else if (event.action === 'stop' && simState) {
    stopSimulation('USER_STOPPED');
  } else {
    // Click on body, open app
    event.waitUntil(
      self.clients.matchAll({ type: 'window' }).then((windowClients) => {
        for (let i = 0; i < windowClients.length; i++) {
          let client = windowClients[i];
          if (client.url.includes('/calculators/ev-charging') && 'focus' in client) {
            return client.focus();
          }
        }
        if (self.clients.openWindow) {
          return self.clients.openWindow('/calculators/ev-charging');
        }
      })
    );
  }
});

// =====================
// 1. DATA (что есть в игре)
// =====================
const player = {
  name: "Unknown Vampire",
  health: 100,
  strength: 20,
  shield: 10,
  level: 1,
  inventory: {
    sword: 1,
    healthPotion: 2,
    key: 0,
    gold: 5,
  },
};

const locations = {
  manor: { enemy: null },

  crypt: {
    state: "guard",
    enemies: {
      guard: { name: "Grave Guardian", maxHealth: 80, shield: 10 },
      spiders: { name: "Black Spider", maxHealth: 50, shield: 5 },
    },
  },

  cemetery: {
    enemy: { name: "Skeleton", maxHealth: 60, shield: 5 },
  },

  hall: {
    enemy: { name: "Blood Knight", maxHealth: 120, shield: 20 },
  },

  tower: {
    enemy: { name: "Vampire Lord", maxHealth: 200, shield: 30 },
  },
};

// =====================
// 2. STATE (что происходит сейчас)
// =====================
let currentLocation = "manor";
let currentEnemy = null;
let isTransitioning = false;
let combatLog = [];

// =====================
// 3. DOM (элементы страницы)
// =====================
const startBtn = document.querySelector("#start-btn");
const nameInput = document.querySelector("#name-input");
const startScreen = document.querySelector("#start-screen");

const playerName = document.querySelector("#player-name");
const playerHealth = document.querySelector("#player-health");
const playerLevel = document.querySelector("#player-level");
const playerInventory = document.querySelector("#player-inventory");

const attackBtn = document.querySelector("#attack-btn");
const drainBtn = document.querySelector("#drain-btn");
const giveGoldBtn = document.querySelector("#give-gold-btn");
const resetBtn = document.querySelector("#reset-btn");
const potionBtn = document.querySelector("#potion-btn");
const critBtn = document.querySelector("#crit-btn");

const chronicle = document.querySelector("#dark-chronicle");
const locationName = document.querySelector("#location-name");

// =====================
// 4. UI (обновление интерфейса)
// =====================
function updateUI() {
  playerName.textContent = player.name;
  playerHealth.textContent = player.health;
  playerLevel.textContent = player.level;
  playerInventory.textContent = `
  gold: ${player.inventory.gold} |
  healthPotion: ${player.inventory.healthPotion} |
  key: ${player.inventory.key} |
  sword: ${player.inventory.sword}
  `;
}

// =====================
// 5. SCENE (вывод текста)
// =====================
function showScene(lines) {
  chronicle.innerHTML = `
    <div class="scene">
      ${lines.map((line) => `<p>${line}</p>`).join("")}
    </div>
  `;
}

// =====================
// 6. GAME LOGIC
// =====================

// смена локации
function changeLocation(loc) {
  currentLocation = loc;

  const names = {
    crypt: "The Crypt",
    cemetery: "Moonlight Cemetery",
    hall: "Blood Hall",
    tower: "Forgotten Tower",
    manor: "Vampire Manor",
  };

  locationName.textContent = names[loc];

  showScene([`You travel to ${names[loc]}`]);

  handleLocation();
}

// логика входа в локацию
function handleLocation() {
  const loc = locations[currentLocation];

  // крипта — особая логика
  if (currentLocation === "crypt") {
    if (loc.state === "guard") {
      currentEnemy = createEnemy(loc.enemies.guard);

      showScene([
        "You enter the Crypt...",
        "The Grave Guardian blocks your way...",
        "Give gold or fight?",
        `Guardian HP: ${currentEnemy.health}`,
      ]);

      return;
    }

    if (loc.state === "spiders") {
      spawnEnemy();
      return;
    }

    if (loc.state === "cleared") {
      currentEnemy = null;
      showScene(["The Crypt is empty."]);
      return;
    }
  }

  spawnEnemy();
}

// создание врага
function createEnemy(template) {
  return {
    ...template,
    health: template.maxHealth,
  };
}

// спавн врага
function spawnEnemy() {
  const loc = locations[currentLocation];

  let enemy = null;

  if (currentLocation === "crypt") {
    enemy = loc.enemies[loc.state];
  } else {
    enemy = loc.enemy;
  }

  if (!enemy) {
    currentEnemy = null;
    showScene(["The area is peaceful..."]);
    return;
  }

  currentEnemy = createEnemy(enemy);

  showScene([`${currentEnemy.name} appears!`]);
}

// =====================
// 7. ACTIONS
// =====================

// атака
function attack() {
  if (!currentEnemy) {
    showScene(["Nothing to attack here."]);
    return;
  }

  combatLog = []; // ❗ очищаем в начале действия

  const damageToEnemy = 20;
  const damageToPlayer = 5;

  currentEnemy.health -= damageToEnemy;
  player.health -= damageToPlayer;

  combatLog.push(`You hit ${currentEnemy.name} for ${damageToEnemy}`);
  combatLog.push(
    `${currentEnemy.name} HP: ${Math.max(currentEnemy.health, 0)}`,
  );
  combatLog.push(`${currentEnemy.name} hits you for ${damageToPlayer}`);
  combatLog.push(`Your HP: ${player.health}`);

  showScene(combatLog);

  if (currentEnemy.health <= 0) {
    handleEnemyDeath();
  }

  updateUI();
}
//
function handleEnemyDeath() {
  if (!currentEnemy) return;

  const dead = currentEnemy;
  currentEnemy = null;

  setTimeout(() => {
    let lines = [`${dead.name} is defeated!`];

    if (currentLocation === "crypt") {
      if (locations.crypt.state === "guard") {
        locations.crypt.state = "spiders";
        player.level++;

        lines.push("Something crawls in the darkness...");

        showScene(lines);

        setTimeout(spawnEnemy, 3000);
        return;
      }

      if (locations.crypt.state === "spiders") {
        locations.crypt.state = "cleared";
        player.level++;

        lines.push("The Crypt is now silent...");
        lines.push("The area is peaceful...");

        showScene(lines);

        updateUI();
        return;
      }
    }

    showScene(lines);
    setTimeout(spawnEnemy, 3000);
  }, 1200);
}

//
function drainBlood() {
  if (!currentEnemy) {
    showScene(["There is nothing to drain."]);
    return;
  }

  // 🧠 ты наносишь слабый урон
  const damageToEnemy = 15;
  currentEnemy.health -= damageToEnemy;

  // 🧠 враг отвечает
  const damageToPlayer = 10;
  player.health -= damageToPlayer;

  // 🧠 ты лечишься
  const heal = 5;
  player.health += heal;

  // ограничение (чтобы не было 120/100)
  if (player.health > 100) player.health = 100;

  showScene([
    `You drain blood from ${currentEnemy.name} for ${damageToEnemy}`,
    `You heal yourself for ${heal}`,
    `${currentEnemy.name} HP: ${Math.max(currentEnemy.health, 0)}`,
    `Your HP: ${player.health}`,
  ]);

  // 💀 смерть врага
  if (currentEnemy.health <= 0) {
    showScene([`${currentEnemy.name} is defeated!`]);

    if (currentLocation === "crypt") {
      if (locations.crypt.state === "guard") {
        locations.crypt.state = "spiders";
        setTimeout(spawnEnemy, 1200);
        return;
      }

      if (locations.crypt.state === "spiders") {
        locations.crypt.state = "cleared";
        player.level++;
      }
    }

    spawnEnemy();
  }

  updateUI();
}

// дать золото
function giveGold() {
  // ❗ 1. проверка локации
  if (currentLocation !== "crypt") {
    showScene(["There is no one to pay here."]);
    return;
  }

  // ❗ 2. проверка состояния крипты
  if (locations.crypt.state !== "guard") {
    showScene(["There is no Guardian to pay."]);
    return;
  }

  // ❗ 3. проверка золота
  if (player.inventory.gold < 3) {
    showScene(["You don't have enough gold!"]);
    return;
  }

  // 💰 списание
  player.inventory.gold -= 3;

  // 🔁 смена состояния
  locations.crypt.state = "spiders";

  showScene([
    "You give gold to the Guardian...",
    "He steps aside silently...",
    "Something moves deeper in the crypt...",
  ]);

  setTimeout(() => {
    spawnEnemy();
  }, 500);

  updateUI();
}

//использовать крит-удар
function useCrit() {
  if (!currentEnemy) {
    showScene(["You swing your sword into the air...", "There is no enemy."]);
    return;
  }

  if (player.inventory.sword <= 0) {
    showScene(["You have no weapon for a critical strike."]);
    return;
  }

  combatLog = [];

  const damageToEnemy = 60;
  const damageToPlayer = 5;

  currentEnemy.health -= damageToEnemy;
  player.health -= damageToPlayer;

  player.inventory.sword -= 1;

  combatLog.push("CRITICAL STRIKE! 🗡️");
  combatLog.push(`You deal ${damageToEnemy} damage to ${currentEnemy.name}`);
  combatLog.push(
    `${currentEnemy.name} HP: ${Math.max(currentEnemy.health, 0)}`,
  );
  combatLog.push(`Your HP: ${player.health}`);

  showScene(combatLog);

  if (currentEnemy.health <= 0) {
    handleEnemyDeath();
  }

  updateUI();
}

//использовать зелье
function usePotion() {
  if (player.inventory.healthPotion <= 0) {
    showScene(["No potions left."]);
    return;
  }

  // ❗ если HP уже полный — НЕ тратим зелье
  if (player.health >= 100) {
    showScene([
      "Your health is already full.",
      "You don't need to use a potion.",
    ]);
    return;
  }

  player.inventory.healthPotion -= 1;
  player.health += 30;

  if (player.health > 100) player.health = 100;

  showScene([
    "You drink a health potion",
    "+30 HP",
    `Your HP: ${player.health}`,
  ]);

  updateUI();
}

// ресет
function resetGame() {
  player.health = 100;
  player.level = 1;
  player.inventory.healthPotion = 2;
  player.inventory.sword = 1;
  player.inventory.gold = 5;
  player.inventory.key = 0;

  currentLocation = "manor";
  currentEnemy = null;

  locations.crypt.state = "guard";

  locationName.textContent = "Vampire Manor";

  showScene(["The night is waiting..."]);

  updateUI();
}

// =====================
// 8. EVENTS (кнопки)
// =====================
startBtn.addEventListener("click", () => {
  player.name = nameInput.value || "Unknown Vampire";
  startScreen.style.display = "none";
  updateUI();
});

attackBtn.addEventListener("click", attack);
giveGoldBtn.addEventListener("click", giveGold);
resetBtn.addEventListener("click", resetGame);
drainBtn.addEventListener("click", drainBlood);
potionBtn.addEventListener("click", usePotion);
critBtn.addEventListener("click", useCrit);

document.querySelector("#crypt-btn").onclick = () => changeLocation("crypt");
document.querySelector("#cemetery-btn").onclick = () =>
  changeLocation("cemetery");
document.querySelector("#hall-btn").onclick = () => changeLocation("hall");
document.querySelector("#tower-btn").onclick = () => changeLocation("tower");

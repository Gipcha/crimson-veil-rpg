//  DATA

const player = {
  name: "Unknown Vampire",
  health: 100,
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
      guard: {
        name: "Grave Guardian",
        maxHealth: 80,
      },
      spiders: {
        name: "Black Spider",
        maxHealth: 50,
      },
    },
  },

  cemetery: {
    state: "skeleton",
    chestFound: false,

    enemy: {
      name: "Skeleton",
      maxHealth: 60,
    },
  },

  hall: {
    state: "alive",
    enemy: {
      name: "Blood Knight",
      maxHealth: 120,
    },
  },

  tower: {
    enemy: {
      name: "Vampire Lord",
      maxHealth: 200,
    },
  },
};

// STATE

let currentLocation = "manor";
let currentEnemy = null;
let isTransitioning = false;
let combatLog = [];

// DOM

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

const cryptBtn = document.querySelector("#crypt-btn");
const cemeteryBtn = document.querySelector("#cemetery-btn");
const hallBtn = document.querySelector("#hall-btn");
const towerBtn = document.querySelector("#tower-btn");

const chronicle = document.querySelector("#dark-chronicle");
const locationName = document.querySelector("#location-name");

// UI

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

// SCENE

function showScene(lines) {
  chronicle.innerHTML = `
    <div class="scene">
      ${lines.map((line) => `<p>${line}</p>`).join("")}
    </div>
  `;
}

// GAME LOGIC

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

  setTimeout(() => {
    handleLocation();
  });
}
function handleLocation() {
  const loc = locations[currentLocation];

  if (currentLocation === "hall") {
    if (loc.state === "cleared") {
      currentEnemy = null;
      showScene([
        "You enter the Blood Hall...",
        "It is silent...",
        "The Blood Knight is gone.",
      ]);
      return;
    }

    currentEnemy = createEnemy(loc.enemy);
    showScene([
      "You enter the Blood Hall...",
      "The Blood Knight draws his weapon!",
      `HP: ${currentEnemy.health}`,
    ]);
    return;
  }

  if (currentLocation === "cemetery") {
    currentEnemy = createEnemy(loc.enemy);
    showScene([
      "You step into the Moonlight Cemetery...",
      "A Skeleton rises from the grave...",
      `HP: ${currentEnemy.health}`,
    ]);
    return;
  }

  if (currentLocation === "tower") {
    if (player.inventory.key <= 0) {
      currentEnemy = null;

      showScene([
        "You approach the Forgotten Tower...",
        "The gates are sealed.",
        "You need a key to enter the Tower.",
      ]);
      return;
    }

    currentEnemy = createEnemy(loc.enemy);
    showScene([
      "You unlock the Forgotten Tower...",
      "The Vampire Lord watches you silently...",
      `Vampire Lord HP: ${currentEnemy.health}`,
    ]);
    return;
  }

  if (currentLocation === "crypt") {
    const crypt = locations.crypt;

    if (crypt.state === "guard") {
      currentEnemy = createEnemy(crypt.enemies.guard);

      showScene([
        "You enter the Crypt...",
        "The Grave Guardian blocks your way...",
        "Give gold or fight?",
        `Guardian HP: ${currentEnemy.health}`,
      ]);

      return;
    }

    if (crypt.state === "spiders") {
      currentEnemy = createEnemy(crypt.enemies.spiders);

      showScene([
        "You enter the Crypt...",
        "Black Spider appears!",
        `Black Spider HP: ${currentEnemy.health}`,
      ]);

      return;
    }

    if (crypt.state === "cleared") {
      currentEnemy = null;

      showScene(["The Crypt is empty."]);

      return;
    }
  }

  currentEnemy = null;
  showScene(["The area is peaceful..."]);
}

function createEnemy(template) {
  return {
    ...template,
    health: template.maxHealth,
  };
}

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

  updateUI();
}

// ACTIONS

function attack() {
  if (!currentEnemy) {
    showScene(["Nothing to attack here."]);
    return;
  }

  combatLog = [];

  const damageToEnemy = 20;
  const damageToPlayer = 5;

  currentEnemy.health -= damageToEnemy;
  player.health -= damageToPlayer;

  checkPlayerDeath();

  if (player.health <= 0) {
    return;
  }

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

function handleEnemyDeath() {
  if (!currentEnemy) return;

  const dead = currentEnemy;
  currentEnemy = null;
  player.level++;

  setTimeout(() => {
    let lines = [`${dead.name} is defeated!`];

    if (currentLocation === "crypt") {
      if (locations.crypt.state === "guard") {
        locations.crypt.state = "spiders";

        lines.push("Something crawls in the darkness...");

        showScene(lines);

        setTimeout(spawnEnemy, 3000);
        updateUI();
        return;
      }

      if (locations.crypt.state === "spiders") {
        locations.crypt.state = "cleared";

        lines.push("The Crypt is now silent...");
        lines.push("The area is peaceful...");

        showScene(lines);
        updateUI();
        return;
      }
    }

    if (currentLocation === "hall") {
      locations.hall.state = "cleared";
    }

    if (currentLocation === "cemetery") {
      if (!locations.cemetery.chestFound) {
        locations.cemetery.chestFound = true;

        player.inventory.gold += 10;
        player.inventory.key += 1;

        showScene([
          "Skeleton is defeated!",
          "You discover an old chest among the graves...",
          "You found 10 gold!",
          "You found a key!",
        ]);

        updateUI();
        return;
      }

      showScene([
        "Skeleton is defeated!",
        "The cemetery grows silent again...",
      ]);

      updateUI();
      return;
    }

    showScene(lines);
    updateUI();
  }, 1200);
}

function checkPlayerDeath() {
  if (player.health <= 0) {
    player.health = 0;
    currentEnemy = null;

    showScene([
      "You collapse into darkness...",
      "GAME OVER",
      "Press RESET to start again.",
    ]);

    updateUI();
    attackBtn.disabled = true;
    drainBtn.disabled = true;
    giveGoldBtn.disabled = true;
    potionBtn.disabled = true;
    critBtn.disabled = true;
    cryptBtn.disabled = true;
    cemeteryBtn.disabled = true;
    hallBtn.disabled = true;
    towerBtn.disabled = true;
  }
}

function drainBlood() {
  if (!currentEnemy) {
    showScene(["There is nothing to drain."]);
    return;
  }

  if (currentLocation === "cemetery") {
    showScene(["You can't use Drain in the Cemetery."]);
    return;
  }

  const damageToEnemy = 15;
  const damageToPlayer = 10;
  const heal = 5;

  // урон
  currentEnemy.health -= damageToEnemy;
  player.health -= damageToPlayer;

  // лечение
  player.health += heal;

  if (player.health > 100) {
    player.health = 100;
  }

  // смерть игрока
  checkPlayerDeath();

  if (player.health <= 0) {
    return;
  }

  showScene([
    `You drain blood from ${currentEnemy.name} for ${damageToEnemy}`,
    `You heal yourself for ${heal}`,
    `${currentEnemy.name} HP: ${Math.max(currentEnemy.health, 0)}`,
    `Your HP: ${player.health}`,
  ]);

  // смерть врага
  if (currentEnemy.health <= 0) {
    handleEnemyDeath();
  }

  updateUI();
}

function giveGold() {
  if (currentLocation !== "crypt") {
    showScene(["There is no one to pay here."]);
    return;
  }

  if (locations.crypt.state !== "guard") {
    showScene(["There is no Guardian to pay."]);
    return;
  }

  if (player.inventory.gold < 3) {
    showScene(["You don't have enough gold!"]);
    return;
  }

  player.inventory.gold -= 3;

  locations.crypt.state = "spiders";

  showScene([
    "You give gold to the Guardian...",
    "He steps aside silently...",
    "Something moves deeper in the crypt...",
  ]);

  setTimeout(() => {
    spawnEnemy();
  }, 3000);

  updateUI();
}

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

  checkPlayerDeath();

  if (player.health <= 0) {
    return;
  }

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
function usePotion() {
  if (player.inventory.healthPotion <= 0) {
    showScene(["No potions left."]);
    return;
  }

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
  locations.hall.state = "alive";
  locations.cemetery.state = "skeleton";
  locations.cemetery.chestFound = false;

  locationName.textContent = "Vampire Manor";

  showScene(["The night is waiting..."]);

  attackBtn.disabled = false;
  drainBtn.disabled = false;
  giveGoldBtn.disabled = false;
  potionBtn.disabled = false;
  critBtn.disabled = false;
  cryptBtn.disabled = false;
  cemeteryBtn.disabled = false;
  hallBtn.disabled = false;
  towerBtn.disabled = false;

  updateUI();
}
// EVENTS

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

cryptBtn.onclick = () => changeLocation("crypt");
cemeteryBtn.onclick = () => changeLocation("cemetery");
hallBtn.onclick = () => changeLocation("hall");
towerBtn.onclick = () => changeLocation("tower");

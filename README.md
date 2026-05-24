# Crimson Vale 🧛‍♂️

A browser-based dungeon adventure game built with vanilla JavaScript.

## 🎮 About the Game

Crimson Vale is a linear dungeon-style RPG level where the player explores dangerous locations, fights enemies, and survives encounters.

Each location contains its own scripted logic, enemy states, and progression flow.

You play as a vampire who must fight through the Crypt, Cemetery, Blood Hall, and finally face the Vampire Lord in the Forgotten Tower.

## ⚔️ Gameplay Features

- Turn-based combat system
- Multiple enemy types (Guardian, Spider, Skeleton, Blood Knight, Vampire Lord)
- Location-based progression system
- State-driven enemies (e.g. guard → spiders → cleared)
- Player system (health, level, inventory)
- Healing mechanic (Drain Blood & Potion system)
- Story-driven scene system (Dark Chronicle)
- Final boss encounter with win condition

## 🧠 Core Mechanics

### Combat

Players can:

- Attack enemies
- Use special critical strike
- Drain blood to heal during combat
- Use potions to restore health

### Progression

- Each enemy defeat increases player level
- Certain locations unlock new states after combat

### Locations

- Crypt (multi-phase encounter)
- Moonlight Cemetery (combat + reward chest)
- Blood Hall (mini-boss)
- Forgotten Tower (final boss encounter)

## 🧱 Tech Stack

- HTML5
- CSS3
- Vanilla JavaScript (no frameworks)

## 📁 Project Structure

- index.html — UI structure
- script.js — game logic and state management
- style.css — visual styling

## 🚀 How to Run

Open `index.html` in any modern browser. No installation required.

## 🎯 Design Philosophy

This project focuses on:

- state-based gameplay logic
- DOM manipulation without frameworks
- procedural storytelling through JavaScript
- simple but structured combat systems

## 🧪 Future Improvements (optional ideas)

- Save / Load system using localStorage
- More enemy variety per location
- Inventory upgrades system
- Visual combat animations
- Sound effects and ambience

---

Made as a learning project to practice JavaScript game architecture and DOM-based interaction.

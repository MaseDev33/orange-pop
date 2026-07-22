import { BUILDING_DEFINITIONS, UPGRADE_DEFINITIONS, formatNumber, calculateCost } from './data.js';

class UI {
  constructor(game) {
    this.game = game;
    this.moneyValue = document.getElementById('moneyValue');
    this.ppsValue = document.getElementById('ppsValue');
    this.popCounter = document.getElementById('popCounter');
    this.buildingGrid = document.getElementById('buildingGrid');
    this.floatingLayer = document.getElementById('floatingLayer');
    this.currentMoneyDisplay = 0;
    this.currentPopDisplay = 0;
    this.init();
  }

  init() {
    this.renderBuildings();
    this.renderUpgrades();
    this.updateUI(true);
    this.game.onIncome(amount => this.spawnFloatingText(amount));
    this.game.onOfflineReport((earned, effective, seconds) => this.showOfflineReport(earned, effective, seconds));
    this.game.handleOfflineEarnings();
    requestAnimationFrame(() => this.loop());
  }

  renderBuildings() {
    this.buildingGrid.innerHTML = '';
    BUILDING_DEFINITIONS.forEach(def => {
      const card = document.createElement('article');
      card.className = 'building-card card-soft';
      card.dataset.buildingId = def.id;
      card.innerHTML = `
        <div class="card-head">
          <div class="building-icon">${def.icon}</div>
          <div>
            <h2 class="building-title">${def.name}</h2>
            <p class="building-text">${def.description}</p>
          </div>
        </div>
        <div class="stats-grid">
          <div class="stat-row"><span>Owned</span><span class="owned-value">0</span></div>
          <div class="stat-row"><span>Production</span><span class="production-value">${def.production}/s</span></div>
          <div class="stat-row"><span>Next cost</span><span class="cost-value">$0</span></div>
        </div>
        <button class="buy-button">Buy</button>
      `;
      const button = card.querySelector('.buy-button');
      button.addEventListener('click', () => this.handleBuy(def.id));
      this.buildingGrid.appendChild(card);
    });
  }

  renderUpgrades() {
    const upgradeSection = document.createElement('section');
    upgradeSection.className = 'cards-grid';
    upgradeSection.innerHTML = `<div class="upgrade-banner card-soft">
      <div>
        <p class="upgrade-brand">⚡ Upgrades</p>
        <p>Unlock boosts that multiply your Orange Pop production.</p>
      </div>
    </div>`;

    UPGRADE_DEFINITIONS.forEach(upgrade => {
      const card = document.createElement('article');
      card.className = 'building-card card-soft';
      card.dataset.upgradeId = upgrade.id;
      card.innerHTML = `
        <div class="card-head">
          <div class="building-icon">${upgrade.icon}</div>
          <div>
            <h2 class="building-title">${upgrade.name}</h2>
            <p class="building-text">${upgrade.description}</p>
          </div>
        </div>
        <div class="stats-grid">
          <div class="stat-row"><span>Multiplier</span><span>${Math.round((upgrade.multiplier - 1) * 100)}%</span></div>
          <div class="stat-row"><span>Cost</span><span>$${formatNumber(upgrade.cost)}</span></div>
        </div>
        <button class="buy-button">Purchase</button>
      `;
      const button = card.querySelector('.buy-button');
      button.addEventListener('click', () => this.handleUpgradeBuy(upgrade.id));
      upgradeSection.appendChild(card);
    });

    const main = document.querySelector('main');
    main.appendChild(upgradeSection);
  }

  updateUI(force = false) {
    const money = this.game.state.money;
    const totalPop = this.game.state.totalOrangePop;
    const pps = this.game.popPerSecond;
    this.animateValue(this.moneyValue, this.currentMoneyDisplay, money, '$');
    this.animateValue(this.popCounter, this.currentPopDisplay, totalPop);
    this.ppsValue.textContent = formatNumber(pps) + '/s';
    this.currentMoneyDisplay = money;
    this.currentPopDisplay = totalPop;

    this.buildingGrid.querySelectorAll('.building-card').forEach(card => {
      const id = card.dataset.buildingId;
      const ownedSpan = card.querySelector('.owned-value');
      const costSpan = card.querySelector('.cost-value');
      const button = card.querySelector('.buy-button');
      if (!id) return;
      const owned = this.game.buildingState[id].owned;
      const cost = this.game.getCost(id);
      ownedSpan.textContent = owned;
      costSpan.textContent = `$${formatNumber(cost)}`;
      button.textContent = `Buy for $${formatNumber(cost)}`;
      button.disabled = money < cost;
    });

    document.querySelectorAll('[data-upgrade-id]').forEach(card => {
      const id = card.dataset.upgradeId;
      const button = card.querySelector('.buy-button');
      const upgradeState = this.game.state.upgrades.find(item => item.id === id);
      const upgradeDef = UPGRADE_DEFINITIONS.find(item => item.id === id);
      if (!upgradeState || !upgradeDef) return;
      button.textContent = upgradeState.purchased ? 'Owned' : `Buy for $${formatNumber(upgradeDef.cost)}`;
      button.disabled = upgradeState.purchased || money < upgradeDef.cost;
      if (upgradeState.purchased) {
        card.classList.add('upgrade-owned');
      } else {
        card.classList.remove('upgrade-owned');
      }
    });
  }

  handleBuy(buildingId) {
    const success = this.game.buyBuilding(buildingId);
    if (!success) return;
    this.updateUI();
  }

  handleUpgradeBuy(upgradeId) {
    const success = this.game.buyUpgrade(upgradeId);
    if (!success) return;
    this.updateUI();
  }

  spawnFloatingText(amount) {
    const text = document.createElement('div');
    text.className = 'floating-text';
    text.textContent = `+ $${formatNumber(amount)}`;
    const x = window.innerWidth * 0.7 + (Math.random() - 0.5) * 160;
    const y = 80 + (Math.random() - 0.5) * 40;
    text.style.left = `${x}px`;
    text.style.top = `${y}px`;
    this.floatingLayer.appendChild(text);
    setTimeout(() => text.remove(), 1300);
  }

  showOfflineReport(earned, effective, seconds) {
    const banner = document.createElement('div');
    banner.className = 'offline-banner card-soft';
    banner.innerHTML = `
      <p><strong>Welcome back!</strong> You earned <strong>${formatNumber(effective)} Orange Pop</strong> while away for ${formatNumber(seconds)} seconds.</p>
      <p class="offline-subtext">Estimated offline earnings before tax: ${formatNumber(earned)}</p>
    `;
    document.body.appendChild(banner);
    setTimeout(() => banner.remove(), 7000);
  }

  animateValue(element, from, to, prefix = '') {
    const difference = to - from;
    if (Math.abs(difference) < 0.5) {
      element.textContent = prefix + formatNumber(to);
      return;
    }
    const duration = 300;
    const start = performance.now();
    const animate = timestamp => {
      const progress = Math.min((timestamp - start) / duration, 1);
      const value = from + difference * easeOutCubic(progress);
      element.textContent = prefix + formatNumber(value);
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }

  loop() {
    this.game.update();
    this.updateUI();
    requestAnimationFrame(() => this.loop());
  }
}

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

window.addEventListener('DOMContentLoaded', () => {
  const gameInstance = window.game;
  new UI(gameInstance);
});

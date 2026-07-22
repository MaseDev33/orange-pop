import { BUILDING_DEFINITIONS, UPGRADE_DEFINITIONS, MAX_OFFLINE_SECONDS, calculateCost, loadSave, saveState } from './data.js';

class Game {
  constructor() {
    this.state = this.load() || this.createDefaultState();
    this.lastUpdate = performance.now();
    this.autoSaveInterval = 30000;
    this.incomeListeners = [];
    this.offlineReportListeners = [];
    this.startAutoSave();
    window.addEventListener('beforeunload', () => this.save());
  }

  createDefaultState() {
    return {
      money: 0,
      totalOrangePop: 0,
      buildings: BUILDING_DEFINITIONS.map(def => ({
        id: def.id,
        owned: def.id === 'orangeStand' ? 1 : 0,
      })),
      upgrades: UPGRADE_DEFINITIONS.map(upgrade => ({ id: upgrade.id, purchased: false })),
      lastOfflineTimestamp: Date.now(),
    };
  }

  load() {
    const saved = loadSave();
    if (!saved) return null;
    return {
      money: saved.money ?? 0,
      totalOrangePop: saved.totalOrangePop ?? 0,
      buildings: BUILDING_DEFINITIONS.map(def => {
        const savedBuilding = (saved.buildings || []).find(b => b.id === def.id);
        return { id: def.id, owned: savedBuilding ? savedBuilding.owned : 0 };
      }),
      upgrades: UPGRADE_DEFINITIONS.map(upgrade => {
        const savedUpgrade = (saved.upgrades || []).find(u => u.id === upgrade.id);
        return { id: upgrade.id, purchased: !!savedUpgrade?.purchased };
      }),
      lastOfflineTimestamp: saved.lastOfflineTimestamp || Date.now(),
    };
  }

  get buildingState() {
    return this.state.buildings.reduce((map, item) => {
      map[item.id] = item;
      return map;
    }, {});
  }

  get popPerSecond() {
    const baseProduction = BUILDING_DEFINITIONS.reduce((sum, def) => {
      const owned = this.buildingState[def.id].owned;
      return sum + owned * def.production;
    }, 0);
    const upgradeMultiplier = this.state.upgrades.reduce((mult, upgrade) => {
      if (!upgrade.purchased) return mult;
      const def = UPGRADE_DEFINITIONS.find(item => item.id === upgrade.id);
      return mult * (def?.multiplier || 1);
    }, 1);
    return baseProduction * upgradeMultiplier;
  }

  getBuildingDefinition(id) {
    return BUILDING_DEFINITIONS.find(building => building.id === id);
  }

  getCost(id) {
    const building = this.getBuildingDefinition(id);
    const owned = this.buildingState[id].owned;
    return calculateCost({ ...building, owned });
  }

  buyBuilding(id) {
    const cost = this.getCost(id);
    if (this.state.money < cost) return false;
    this.state.money -= cost;
    this.buildingState[id].owned += 1;
    return true;
  }

  buyUpgrade(id) {
    const upgrade = UPGRADE_DEFINITIONS.find(item => item.id === id);
    const savedUpgrade = this.state.upgrades.find(item => item.id === id);
    if (!upgrade || savedUpgrade?.purchased) return false;
    if (this.state.money < upgrade.cost) return false;
    this.state.money -= upgrade.cost;
    savedUpgrade.purchased = true;
    return true;
  }

  addIncome(amount) {
    if (amount <= 0) return;
    this.state.money += amount;
    this.state.totalOrangePop += amount;
    this.incomeListeners.forEach(listener => listener(amount));
  }

  onIncome(listener) {
    this.incomeListeners.push(listener);
  }

  onOfflineReport(listener) {
    this.offlineReportListeners.push(listener);
  }

  handleOfflineEarnings() {
    const saved = loadSave();
    if (!saved || !saved.lastOfflineTimestamp) return;
    const now = Date.now();
    const elapsedSeconds = Math.min((now - saved.lastOfflineTimestamp) / 1000, MAX_OFFLINE_SECONDS);
    if (elapsedSeconds <= 1) return;

    const earned = this.popPerSecond * elapsedSeconds;
    const effectiveEarnings = earned * 0.7;
    this.state.money += effectiveEarnings;
    this.state.totalOrangePop += effectiveEarnings;
    this.offlineReportListeners.forEach(listener => listener(earned, effectiveEarnings, elapsedSeconds));
  }

  update() {
    const now = performance.now();
    const dt = (now - this.lastUpdate) / 1000;
    this.lastUpdate = now;
    const generatedPop = this.popPerSecond * dt;
    if (generatedPop > 0) {
      this.addIncome(generatedPop);
    }
  }

  save() {
    saveState({
      money: this.state.money,
      totalOrangePop: this.state.totalOrangePop,
      buildings: this.state.buildings,
      upgrades: this.state.upgrades,
      lastOfflineTimestamp: Date.now(),
    });
  }

  startAutoSave() {
    this.saveTimer = setInterval(() => this.save(), this.autoSaveInterval);
  }
}

window.game = new Game();

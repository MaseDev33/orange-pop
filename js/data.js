const BUILDING_DEFINITIONS = [
  {
    id: 'orangeStand',
    name: 'Orange Stand',
    description: 'Fresh orange pop stands deliver a steady citrus flow.',
    icon: '🍊',
    baseCost: 15,
    costMultiplier: 1.18,
    production: 1,
  },
];

const UPGRADE_DEFINITIONS = [
  { id: 'stickyStraw', name: 'Sticky Straw', description: 'A smoother sip increases pop efficiency.', icon: '🥤', cost: 50, multiplier: 1.05 },
  { id: 'sparklingSyrup', name: 'Sparkling Syrup', description: 'Bubbles that boost every drop of Orange Pop.', icon: '✨', cost: 140, multiplier: 1.08 },
  { id: 'carbonationPump', name: 'Carbonation Pump', description: 'Pressurize production for a lively gain.', icon: '💨', cost: 340, multiplier: 1.11 },
  { id: 'goldenIce', name: 'Golden Ice', description: 'Premium ice keeps soda crisp and selling.', icon: '🧊', cost: 820, multiplier: 1.13 },
  { id: 'brandAmbassador', name: 'Brand Ambassador', description: 'Orange Pop gets a memorable face.', icon: '🧑‍🍳', cost: 1900, multiplier: 1.15 },
  { id: 'roadsideBillboard', name: 'Roadside Billboard', description: 'A bright advertisement drives demand.', icon: '🪧', cost: 4300, multiplier: 1.18 },
  { id: 'premiumOrange', name: 'Premium Orange', description: 'Juicier ingredients increase every stand.', icon: '🍊', cost: 9800, multiplier: 1.2 },
  { id: 'mobileCart', name: 'Mobile Cart', description: 'Move the soda stand to thirsty crowds.', icon: '🛒', cost: 22000, multiplier: 1.22 },
  { id: 'automatedFiller', name: 'Automated Filler', description: 'Machines make Orange Pop faster and cleaner.', icon: '🤖', cost: 50000, multiplier: 1.25 },
  { id: 'logisticsNetwork', name: 'Logistics Network', description: 'Smooth delivery keeps the pop flowing.', icon: '🚚', cost: 120000, multiplier: 1.28 },
  { id: 'viralCampaign', name: 'Viral Campaign', description: 'A catchy trend sends demand soaring.', icon: '📣', cost: 270000, multiplier: 1.32 },
  { id: 'sodaLab', name: 'Soda Lab', description: 'R&D helps you squeeze more from each stand.', icon: '🧪', cost: 620000, multiplier: 1.36 },
  { id: 'coolingTowers', name: 'Cooling Towers', description: 'Large-scale cooling improves output.', icon: '🏭', cost: 1400000, multiplier: 1.4 },
  { id: 'celebrityCollab', name: 'Celebrity Collab', description: 'A famous face makes Orange Pop luxurious.', icon: '🌟', cost: 3200000, multiplier: 1.45 },
  { id: 'worldTour', name: 'World Tour', description: 'A global campaign brings international pop.', icon: '✈️', cost: 7300000, multiplier: 1.5 },
  { id: 'franchiseHub', name: 'Franchise Hub', description: 'Centralized growth boosts your entire fleet.', icon: '🏢', cost: 17000000, multiplier: 1.55 },
  { id: 'patentFormula', name: 'Patent Formula', description: 'A unique recipe makes every pop better.', icon: '📜', cost: 40000000, multiplier: 1.6 },
  { id: 'ionicInfusion', name: 'Ionic Infusion', description: 'The cutting-edge boost that shakes the beverage world.', icon: '⚡', cost: 95000000, multiplier: 1.65 },
];

const SAVE_KEY = 'orange-pop-empire-save';
const MAX_OFFLINE_SECONDS = 86400;

function formatNumber(value) {
  const abs = Math.abs(value);
  if (abs >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(2)}B`;
  if (abs >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`;
  if (abs >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return `${Math.floor(value)}`;
}

function calculateCost(building) {
  return Math.ceil(building.baseCost * Math.pow(building.costMultiplier, building.owned));
}

function loadSave() {
  const raw = localStorage.getItem(SAVE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (error) {
    console.error('Invalid save data:', error);
    return null;
  }
}

function saveState(state) {
  localStorage.setItem(SAVE_KEY, JSON.stringify(state));
}

export { BUILDING_DEFINITIONS, UPGRADE_DEFINITIONS, MAX_OFFLINE_SECONDS, SAVE_KEY, formatNumber, calculateCost, loadSave, saveState };

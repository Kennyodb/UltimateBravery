// League of Legends Data
let champions = [];
let summonerSpells = [];
let items = [];
let allSummonerSpells = [];
let allItems = [];
let metadata = null;

const itemConstraints = {
  requiredBootsCount: 1,
  bootsFirst: true, // Ensure boots is always the first item
  mutuallyExclusivePairs: [
    ['Manamune', 'Muramana']
  ]
};

async function loadData() {
  const [championsData, summonerData, itemsData, metadataData] = await Promise.all([
    fetch('data/champions.json').then((response) => response.json()),
    fetch('data/summoner-spells.json').then((response) => response.json()),
    fetch('data/items.json').then((response) => response.json()),
    fetch('data/metadata.json').then((response) => response.json()).catch(() => ({ version: 'Unknown' }))
  ]);

  champions = championsData;
  allSummonerSpells = summonerData;
  allItems = itemsData;
  metadata = metadataData;

  // Display patch version
  if (metadata && metadata.version) {
    document.getElementById('patchVersion').textContent = `Patch ${metadata.version}`;
  }

  // Initialize with default game mode
  updateGameModeData();
}

function updateGameModeData() {
  const gameMode = document.getElementById('gameMode').value;
  const mapId = gameMode === 'ARAM' ? '12' : '11';

  // Filter items by map
  items = allItems.filter(item => item.maps && item.maps[mapId]);

  // Filter summoner spells by mode
  summonerSpells = allSummonerSpells.filter(spell =>
    spell.modes && spell.modes.includes(gameMode)
  );
}

// Get random element from array
function getRandomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function buildMutualExclusionMap(pairs) {
  const map = new Map();
  for (const [first, second] of pairs) {
    if (!map.has(first)) {
      map.set(first, new Set());
    }
    if (!map.has(second)) {
      map.set(second, new Set());
    }
    map.get(first).add(second);
    map.get(second).add(first);
  }
  return map;
}

function isBootsItem(item) {
  return Array.isArray(item.tags) && item.tags.includes('Boots');
}

function canSelectItem(item, selected, constraints, exclusionMap) {
  if (constraints.requiredBootsCount !== undefined) {
    const bootsCount = selected.filter(isBootsItem).length;
    if (isBootsItem(item) && bootsCount >= constraints.requiredBootsCount) {
      return false;
    }
  }

  const exclusions = exclusionMap.get(item.name);
  if (exclusions) {
    for (const picked of selected) {
      if (exclusions.has(picked.name)) {
        return false;
      }
    }
  }

  return true;
}

function selectItemsWithConstraints(pool, count, constraints) {
  const exclusionMap = buildMutualExclusionMap(constraints.mutuallyExclusivePairs || []);
  const available = [...pool];
  const selected = [];

  // If bootsFirst is true, select boots as the first item
  if (constraints.bootsFirst) {
    const bootsCandidates = available.filter(
      (item) => isBootsItem(item) && canSelectItem(item, selected, constraints, exclusionMap)
    );
    if (!bootsCandidates.length) {
      return null;
    }
    const bootsItem = getRandomElement(bootsCandidates);
    selected.push(bootsItem);
    available.splice(available.indexOf(bootsItem), 1);
  }

  // Select remaining items (excluding boots if we already selected one)
  while (selected.length < count) {
    const candidates = available.filter((item) =>
      !isBootsItem(item) && canSelectItem(item, selected, constraints, exclusionMap)
    );
    if (!candidates.length) {
      return null;
    }
    const pick = getRandomElement(candidates);
    selected.push(pick);
    available.splice(available.indexOf(pick), 1);
  }

  return selected;
}

// Generate ability priority (Q/W/E order)
function generateAbilityPriorityString() {
  const abilities = ['Q', 'W', 'E'];
  for (let i = abilities.length - 1; i > 0; i--) {
    const swapIndex = Math.floor(Math.random() * (i + 1));
    [abilities[i], abilities[swapIndex]] = [abilities[swapIndex], abilities[i]];
  }
  return abilities.join(' > ');
}

// Roll function
function roll() {
  if (!champions.length || !summonerSpells.length || !items.length) {
    return null;
  }

  const champion = getRandomElement(champions);
  const spell1 = getRandomElement(summonerSpells);
  let spell2 = getRandomElement(summonerSpells);
  while (spell2 === spell1) {
    spell2 = getRandomElement(summonerSpells);
  }

  let selectedItems = selectItemsWithConstraints(items, 6, itemConstraints);
  if (!selectedItems) {
    // Fallback: ensure boots is still first
    selectedItems = [];
    const availableItems = [...items];

    // Select boots first
    const bootsItems = availableItems.filter(item => isBootsItem(item));
    if (bootsItems.length > 0) {
      const bootsItem = getRandomElement(bootsItems);
      selectedItems.push(bootsItem);
      availableItems.splice(availableItems.indexOf(bootsItem), 1);
    }

    // Select remaining items
    while (selectedItems.length < 6 && availableItems.length > 0) {
      const randomIndex = Math.floor(Math.random() * availableItems.length);
      selectedItems.push(availableItems[randomIndex]);
      availableItems.splice(randomIndex, 1);
    }
  }

  const abilityPriority = generateAbilityPriorityString();

  return {
    champion,
    spell1,
    spell2,
    items: selectedItems,
    abilityPriority
  };
}

// Display results
function displayResults(data) {
  if (!data) {
    return;
  }

  document.getElementById('championName').textContent = data.champion.name;
  document.getElementById('championClass').textContent = data.champion.class;

  const championIcon = document.getElementById('championIcon');
  if (championIcon && data.champion.id) {
    championIcon.src = `images/champions/${data.champion.id}.png`;
    championIcon.alt = data.champion.name;
    championIcon.style.display = 'block';
  }

  document.getElementById('summonerSpell1').textContent = data.spell1.name;
  const spell1Icon = document.getElementById('spell1Icon');
  if (spell1Icon && data.spell1.id) {
    spell1Icon.src = `images/spells/${data.spell1.id}.png`;
    spell1Icon.alt = data.spell1.name;
    spell1Icon.style.display = 'block';
  }

  document.getElementById('summonerSpell2').textContent = data.spell2.name;
  const spell2Icon = document.getElementById('spell2Icon');
  if (spell2Icon && data.spell2.id) {
    spell2Icon.src = `images/spells/${data.spell2.id}.png`;
    spell2Icon.alt = data.spell2.name;
    spell2Icon.style.display = 'block';
  }

  for (let i = 0; i < 6; i++) {
    document.getElementById(`item${i + 1}`).textContent = data.items[i].name;
    const itemIcon = document.getElementById(`item${i + 1}Icon`);
    if (itemIcon && data.items[i].id) {
      itemIcon.src = `images/items/${data.items[i].id}.png`;
      itemIcon.alt = data.items[i].name;
      itemIcon.style.display = 'block';
    }
  }

  document.getElementById('abilityPriority').textContent = data.abilityPriority;

  document.getElementById('results').style.display = 'block';
}

const rollButton = document.getElementById('rollBtn');
const rerollButton = document.getElementById('rerollBtn');

function setButtonsEnabled(isEnabled) {
  rollButton.disabled = !isEnabled;
  rerollButton.disabled = !isEnabled;
}

async function initialize() {
  setButtonsEnabled(false);
  try {
    await loadData();
    setButtonsEnabled(true);
  } catch (error) {
    console.error('Failed to load data files.', error);
  }
}

// Event listeners
rollButton.addEventListener('click', () => {
  const data = roll();
  displayResults(data);
});

rerollButton.addEventListener('click', () => {
  const data = roll();
  displayResults(data);
});

document.getElementById('gameMode').addEventListener('change', () => {
  updateGameModeData();
  // Clear results when changing game mode
  document.getElementById('results').style.display = 'none';
});

initialize();

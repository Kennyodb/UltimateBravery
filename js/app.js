// League of Legends Data
let champions = [];
let summonerSpells = [];
let items = [];

const itemConstraints = {
  requiredBootsCount: 1,
  mutuallyExclusivePairs: [
    ['Manamune', 'Muramana']
  ]
};

async function loadData() {
  const [championsData, summonerData, itemsData] = await Promise.all([
    fetch('data/champions.json').then((response) => response.json()),
    fetch('data/summoner-spells.json').then((response) => response.json()),
    fetch('data/items.json').then((response) => response.json())
  ]);

  champions = championsData;
  summonerSpells = summonerData;
  items = itemsData;
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

  if (constraints.requiredBootsCount) {
    for (let i = 0; i < constraints.requiredBootsCount; i++) {
      const bootsCandidates = available.filter(
        (item) => isBootsItem(item) && canSelectItem(item, selected, constraints, exclusionMap)
      );
      if (!bootsCandidates.length) {
        return null;
      }
      const pick = getRandomElement(bootsCandidates);
      selected.push(pick);
      available.splice(available.indexOf(pick), 1);
    }
  }

  while (selected.length < count) {
    const candidates = available.filter((item) =>
      canSelectItem(item, selected, constraints, exclusionMap)
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
    selectedItems = [];
    const availableItems = [...items];
    for (let i = 0; i < 6; i++) {
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

  document.getElementById('summonerSpell1').textContent = data.spell1;
  document.getElementById('summonerSpell2').textContent = data.spell2;

  for (let i = 0; i < 6; i++) {
    document.getElementById(`item${i + 1}`).textContent = data.items[i].name;
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

initialize();


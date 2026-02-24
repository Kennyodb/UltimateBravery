// League of Legends Data
let champions = [];
let summonerSpells = [];
let items = [];
let allSummonerSpells = [];
let allItems = [];
let runes = [];
let metadata = null;

const RUNE_ICON_BASE = 'https://ddragon.leagueoflegends.com/cdn/img/';

const itemConstraints = {
  requiredBootsCount: 1,
  bootsFirst: true, // Ensure boots is always the first item
  mutuallyExclusiveGroups: [
    // Only one Hydra item allowed
    ['Ravenous Hydra', 'Titanic Hydra', 'Profane Hydra'],
  ],
  mutuallyExclusivePairs: [
    ['Manamune', 'Muramana']
  ]
};

async function loadData() {
  const [championsData, summonerData, itemsData, runesData, metadataData] = await Promise.all([
    fetch('data/champions.json').then((response) => response.json()),
    fetch('data/summoner-spells.json').then((response) => response.json()),
    fetch('data/items.json').then((response) => response.json()),
    fetch('data/runes.json').then((response) => response.json()),
    fetch('data/metadata.json').then((response) => response.json()).catch(() => ({ version: 'Unknown' }))
  ]);

  champions = championsData;
  allSummonerSpells = summonerData;
  allItems = itemsData;
  runes = runesData;
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

function buildMutualExclusionMap(pairs, groups) {
  const map = new Map();

  // Handle pairs
  for (const [first, second] of (pairs || [])) {
    if (!map.has(first)) map.set(first, new Set());
    if (!map.has(second)) map.set(second, new Set());
    map.get(first).add(second);
    map.get(second).add(first);
  }

  // Handle groups: every member excludes every other member
  for (const group of (groups || [])) {
    for (const member of group) {
      if (!map.has(member)) map.set(member, new Set());
      for (const other of group) {
        if (other !== member) map.get(member).add(other);
      }
    }
  }

  return map;
}

function isBootsItem(item) {
  return Array.isArray(item.tags) && item.tags.includes('Boots');
}

function canSelectItem(item, selected, constraints, exclusionMap, champion) {
  if (constraints.requiredBootsCount !== undefined) {
    const bootsCount = selected.filter(isBootsItem).length;
    if (isBootsItem(item) && bootsCount >= constraints.requiredBootsCount) {
      return false;
    }
  }

  // Exclude ranged-only items for melee champions
  if (item.rangedOnly && champion && !champion.ranged) {
    return false;
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

function selectItemsWithConstraints(pool, count, constraints, champion) {
  const exclusionMap = buildMutualExclusionMap(
    constraints.mutuallyExclusivePairs || [],
    constraints.mutuallyExclusiveGroups || []
  );
  const available = [...pool];
  const selected = [];

  // If bootsFirst is true, select boots as the first item
  if (constraints.bootsFirst) {
    const bootsCandidates = available.filter(
      (item) => isBootsItem(item) && canSelectItem(item, selected, constraints, exclusionMap, champion)
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
      !isBootsItem(item) && canSelectItem(item, selected, constraints, exclusionMap, champion)
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

function generateAbilityPriorityOrder() {
  const abilities = ['Q', 'W', 'E'];
  for (let i = abilities.length - 1; i > 0; i--) {
    const swapIndex = Math.floor(Math.random() * (i + 1));
    [abilities[i], abilities[swapIndex]] = [abilities[swapIndex], abilities[i]];
  }
  return abilities;
}

function generateRunePage() {
  if (!Array.isArray(runes) || runes.length < 2) {
    return null;
  }

  const primaryTree = getRandomElement(runes);
  let secondaryTree = getRandomElement(runes);
  while (secondaryTree.id === primaryTree.id) {
    secondaryTree = getRandomElement(runes);
  }

  const primarySlots = primaryTree.slots || [];
  const primaryRunes = primarySlots.map((slot) => getRandomElement(slot.runes || []));

  const secondarySlots = (secondaryTree.slots || []).slice(1); // exclude keystone slot
  const slotIndexes = [0, 1, 2].filter((i) => secondarySlots[i]);
  const firstIndex = getRandomElement(slotIndexes);
  const remainingIndexes = slotIndexes.filter((i) => i !== firstIndex);
  const secondIndex = getRandomElement(remainingIndexes);

  const secondaryRunes = [
    getRandomElement(secondarySlots[firstIndex].runes || []),
    getRandomElement(secondarySlots[secondIndex].runes || [])
  ];

  return {
    primaryTree,
    secondaryTree,
    primaryRunes,
    secondaryRunes
  };
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

  let selectedItems = selectItemsWithConstraints(items, 6, itemConstraints, champion);
  if (!selectedItems) {
    // Fallback: ignore mutual exclusion but still respect rangedOnly and boots
    selectedItems = [];
    const availableItems = items.filter(item => !item.rangedOnly || champion.ranged);

    // Select boots first
    const bootsItems = availableItems.filter(item => isBootsItem(item));
    if (bootsItems.length > 0) {
      const bootsItem = getRandomElement(bootsItems);
      selectedItems.push(bootsItem);
      availableItems.splice(availableItems.indexOf(bootsItem), 1);
    }

    // Select remaining items
    const nonBoots = availableItems.filter(item => !isBootsItem(item));
    while (selectedItems.length < 6 && nonBoots.length > 0) {
      const randomIndex = Math.floor(Math.random() * nonBoots.length);
      selectedItems.push(nonBoots[randomIndex]);
      nonBoots.splice(randomIndex, 1);
    }
  }

  const abilityPriorityOrder = generateAbilityPriorityOrder();
  const runePage = generateRunePage();

  return {
    champion,
    spell1,
    spell2,
    items: selectedItems,
    abilityPriorityOrder,
    runePage
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
    championIcon.title = data.champion.name;
    championIcon.style.display = 'block';
  }

  document.getElementById('summonerSpell1').textContent = data.spell1.name;
  const spell1Icon = document.getElementById('spell1Icon');
  if (spell1Icon && data.spell1.id) {
    spell1Icon.src = `images/spells/${data.spell1.id}.png`;
    spell1Icon.alt = data.spell1.name;
    spell1Icon.title = data.spell1.name;
    spell1Icon.style.display = 'block';
  }

  document.getElementById('summonerSpell2').textContent = data.spell2.name;
  const spell2Icon = document.getElementById('spell2Icon');
  if (spell2Icon && data.spell2.id) {
    spell2Icon.src = `images/spells/${data.spell2.id}.png`;
    spell2Icon.alt = data.spell2.name;
    spell2Icon.title = data.spell2.name;
    spell2Icon.style.display = 'block';
  }

  for (let i = 0; i < 6; i++) {
    document.getElementById(`item${i + 1}`).textContent = data.items[i].name;
    const itemIcon = document.getElementById(`item${i + 1}Icon`);
    if (itemIcon && data.items[i].id) {
      itemIcon.src = `images/items/${data.items[i].id}.png`;
      itemIcon.alt = data.items[i].name;
      itemIcon.title = data.items[i].name;
      itemIcon.style.display = 'block';
    }
  }

  if (data.champion.abilities && Array.isArray(data.abilityPriorityOrder)) {
    data.abilityPriorityOrder.forEach((letter, index) => {
      const ability = data.champion.abilities[letter];
      const abilityIcon = document.getElementById(`abilityIcon${index + 1}`);
      const abilityLabel = document.getElementById(`abilityLabel${index + 1}`);
      if (abilityIcon && ability) {
        abilityIcon.src = ability.icon;
        abilityIcon.alt = ability.name;
        abilityIcon.title = `${letter}: ${ability.name}`;
        abilityIcon.style.display = 'block';
      }
      if (abilityLabel) {
        abilityLabel.textContent = letter;
      }
    });
  }

  if (data.runePage) {
    document.getElementById('runePrimaryName').textContent = data.runePage.primaryTree.name;
    document.getElementById('runeSecondaryName').textContent = data.runePage.secondaryTree.name;

    const primaryTreeIcon = document.getElementById('runePrimaryTreeIcon');
    if (primaryTreeIcon) {
      primaryTreeIcon.src = `${RUNE_ICON_BASE}${data.runePage.primaryTree.icon}`;
      primaryTreeIcon.alt = data.runePage.primaryTree.name;
      primaryTreeIcon.title = data.runePage.primaryTree.name;
      primaryTreeIcon.style.display = 'block';
    }

    const secondaryTreeIcon = document.getElementById('runeSecondaryTreeIcon');
    if (secondaryTreeIcon) {
      secondaryTreeIcon.src = `${RUNE_ICON_BASE}${data.runePage.secondaryTree.icon}`;
      secondaryTreeIcon.alt = data.runePage.secondaryTree.name;
      secondaryTreeIcon.title = data.runePage.secondaryTree.name;
      secondaryTreeIcon.style.display = 'block';
    }

    data.runePage.primaryRunes.forEach((rune, index) => {
      const runeIcon = document.getElementById(`runePrimary${index + 1}`);
      if (runeIcon && rune) {
        runeIcon.src = `${RUNE_ICON_BASE}${rune.icon}`;
        runeIcon.alt = rune.name;
        runeIcon.title = rune.name;
        runeIcon.style.display = 'block';
      }
    });

    data.runePage.secondaryRunes.forEach((rune, index) => {
      const runeIcon = document.getElementById(`runeSecondary${index + 1}`);
      if (runeIcon && rune) {
        runeIcon.src = `${RUNE_ICON_BASE}${rune.icon}`;
        runeIcon.alt = rune.name;
        runeIcon.title = rune.name;
        runeIcon.style.display = 'block';
      }
    });
  }

  document.getElementById('results').style.display = 'grid';
}

const rollButton = document.getElementById('rollBtn');

function setButtonsEnabled(isEnabled) {
  rollButton.disabled = !isEnabled;
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

document.getElementById('gameMode').addEventListener('change', () => {
  updateGameModeData();
  // Clear results when changing game mode
  document.getElementById('results').style.display = 'none';
});

initialize();

const fs = require('fs');
const path = require('path');
const https = require('https');
const { pipeline } = require('stream');
const { promisify } = require('util');

const streamPipeline = promisify(pipeline);

const SOURCE_DIR = path.resolve(__dirname, '..', 'api-json');
const OUTPUT_DIR = path.resolve(__dirname, '..', 'data');
const IMAGES_DIR = path.resolve(__dirname, '..', 'images');
const DATA_DRAGON_BASE = 'https://ddragon.leagueoflegends.com';
const LOCALE = 'en_US';

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, payload) {
  fs.writeFileSync(filePath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
}

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function getLatestVersion(versions) {
  if (!Array.isArray(versions) || versions.length === 0) {
    throw new Error('versions.json is empty or invalid.');
  }
  return versions[0];
}

async function toChampionList(championJson, version, useOffline) {
  const data = championJson && championJson.data ? championJson.data : {};
  const champions = [];

  for (const champion of Object.values(data)) {
    let spells = [];

    // Try to load champion-specific JSON for detailed spell data
    try {
      let championData;
      if (useOffline) {
        const championPath = path.join(SOURCE_DIR, `${champion.id}.json`);
        if (fs.existsSync(championPath)) {
          championData = readJson(championPath);
        }
      } else {
        const championUrl = `${DATA_DRAGON_BASE}/cdn/${version}/data/${LOCALE}/champion/${champion.id}.json`;
        championData = await fetchJson(championUrl);
      }

      if (championData && championData.data && championData.data[champion.id]) {
        spells = championData.data[champion.id].spells || [];
      }
    } catch (error) {
      console.warn(`Could not load spell data for ${champion.name}: ${error.message}`);
    }

    const keys = ['Q', 'W', 'E', 'R'];
    const abilityMap = {};
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const spell = spells[i];
      abilityMap[key] = spell
        ? {
            name: spell.name,
            description: spell.description || '',
            icon: `${DATA_DRAGON_BASE}/cdn/${version}/img/spell/${spell.image.full}`
          }
        : {
            name: key,
            description: '',
            icon: `${DATA_DRAGON_BASE}/cdn/${version}/img/spell/${champion.id}${key}.png`
          };
    }

    // Determine melee/ranged from attack range (>175 = ranged)
    const attackRange = champion.stats && champion.stats.attackrange ? champion.stats.attackrange : 175;
    const ranged = attackRange > 175;

    champions.push({
      name: champion.name,
      class: champion.title,
      id: champion.id,
      ranged,
      icon: `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${champion.image.full}`,
      abilities: abilityMap
    });
  }

  return champions;
}

function toSummonerSpellList(spellJson, version) {
  const data = spellJson && spellJson.data ? spellJson.data : {};
  return Object.values(data).map((spell) => ({
    name: spell.name,
    description: spell.description || '',
    id: spell.id,
    modes: spell.modes || [],
    icon: `https://ddragon.leagueoflegends.com/cdn/${version}/img/spell/${spell.image.full}`
  })).sort((a, b) => a.name.localeCompare(b.name));
}

function toItemList(itemJson, version) {
  // Items that are only usable/meaningful on ranged champions
  const rangedOnlyIds = new Set([
    '3085', // Runaan's Hurricane
  ]);

  const data = itemJson && itemJson.data ? itemJson.data : {};
  const items = Object.entries(data)
    .filter(([_, item]) => item.gold && item.gold.purchasable)
    .filter(([_, item]) => item.maps && item.maps['11']) // Exclude ARAM-only items
    .filter(([_, item]) => !item.tags || !item.tags.includes('Trinket'))
    .filter(([_, item]) => !item.tags || !item.tags.includes('Lane'))
    .filter(([_, item]) => !item.tags || !item.tags.includes('Consumable'))
    .filter(([id, _]) => !id.startsWith('22') && !id.startsWith('32'))
    // Filter out component items, but keep completed boots
    .filter(([_, item]) => {
      if (item.tags && item.tags.includes('Boots')) {
        return item.gold && item.gold.total >= 900;
      }
      return !item.into || item.into.length === 0;
    })
    .map(([id, item]) => ({
      name: item.name,
      description: item.description || item.plaintext || '',
      tags: item.tags || [],
      id: id,
      maps: item.maps,
      rangedOnly: rangedOnlyIds.has(id),
      icon: `https://ddragon.leagueoflegends.com/cdn/${version}/img/item/${item.image.full}`
    }));

  const seen = new Set();
  const uniqueItems = [];
  for (const item of items) {
    if (!seen.has(item.name)) {
      seen.add(item.name);
      uniqueItems.push(item);
    }
  }

  uniqueItems.sort((a, b) => a.name.localeCompare(b.name));
  return uniqueItems;
}

function toRunes(runesJson) {
  if (!Array.isArray(runesJson)) {
    return [];
  }
  return runesJson;
}

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          if (res.statusCode && res.statusCode >= 400) {
            reject(new Error(`Request failed (${res.statusCode}) for ${url}`));
            return;
          }
          try {
            resolve(JSON.parse(data));
          } catch (error) {
            reject(error);
          }
        });
      })
      .on('error', reject);
  });
}

function downloadImage(url, destPath) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        if (res.statusCode && res.statusCode >= 400) {
          reject(new Error(`Request failed (${res.statusCode}) for ${url}`));
          return;
        }
        const writeStream = fs.createWriteStream(destPath);
        streamPipeline(res, writeStream)
          .then(resolve)
          .catch(reject);
      })
      .on('error', reject);
  });
}

async function downloadIcons(champions, items, summonerSpells, runes, version) {
  ensureDir(path.join(IMAGES_DIR, 'champions'));
  ensureDir(path.join(IMAGES_DIR, 'items'));
  ensureDir(path.join(IMAGES_DIR, 'spells'));
  ensureDir(path.join(IMAGES_DIR, 'abilities'));
  ensureDir(path.join(IMAGES_DIR, 'runes'));

  console.log('Downloading champion icons...');
  for (const champion of champions) {
    const destPath = path.join(IMAGES_DIR, 'champions', `${champion.id}.png`);
    if (!fs.existsSync(destPath)) {
      try {
        await downloadImage(champion.icon, destPath);
      } catch (error) {
        console.warn(`Failed to download icon for ${champion.name}:`, error.message);
      }
    }

    // Download ability icons
    if (champion.abilities) {
      for (const [key, ability] of Object.entries(champion.abilities)) {
        if (ability && ability.icon) {
          const abilityDestPath = path.join(IMAGES_DIR, 'abilities', `${champion.id}_${key}.png`);
          if (!fs.existsSync(abilityDestPath)) {
            try {
              await downloadImage(ability.icon, abilityDestPath);
            } catch (error) {
              // If primary URL fails, try the fallback champion abilities URL
              if (ability.icon.includes('champion/abilities')) {
                console.warn(`Ability icon not available for ${champion.name} ${key}`);
              } else {
                console.warn(`Failed to download ability icon for ${champion.name} ${key}:`, error.message);
              }
            }
          }
        }
      }
    }
  }

  console.log('Downloading item icons...');
  for (const item of items) {
    const destPath = path.join(IMAGES_DIR, 'items', `${item.id}.png`);
    if (!fs.existsSync(destPath)) {
      try {
        await downloadImage(item.icon, destPath);
      } catch (error) {
        console.warn(`Failed to download icon for ${item.name}:`, error.message);
      }
    }
  }

  console.log('Downloading summoner spell icons...');
  for (const spell of summonerSpells) {
    const destPath = path.join(IMAGES_DIR, 'spells', `${spell.id}.png`);
    if (!fs.existsSync(destPath)) {
      try {
        await downloadImage(spell.icon, destPath);
      } catch (error) {
        console.warn(`Failed to download icon for ${spell.name}:`, error.message);
      }
    }
  }

  console.log('Downloading rune icons...');
  if (Array.isArray(runes)) {
    for (const tree of runes) {
      if (tree.icon) {
        const treeDestPath = path.join(IMAGES_DIR, 'runes', `${tree.id}.png`);
        if (!fs.existsSync(treeDestPath)) {
          try {
            const treeIconUrl = `https://ddragon.leagueoflegends.com/cdn/img/${tree.icon}`;
            await downloadImage(treeIconUrl, treeDestPath);
          } catch (error) {
            console.warn(`Failed to download rune tree icon for ${tree.name}:`, error.message);
          }
        }
      }

      // Download individual rune icons from slots
      if (tree.slots && Array.isArray(tree.slots)) {
        for (const slot of tree.slots) {
          if (slot.runes && Array.isArray(slot.runes)) {
            for (const rune of slot.runes) {
              if (rune.icon) {
                const runeDestPath = path.join(IMAGES_DIR, 'runes', `${rune.id}.png`);
                if (!fs.existsSync(runeDestPath)) {
                  try {
                    const runeIconUrl = `https://ddragon.leagueoflegends.com/cdn/img/${rune.icon}`;
                    await downloadImage(runeIconUrl, runeDestPath);
                  } catch (error) {
                    console.warn(`Failed to download rune icon for ${rune.name}:`, error.message);
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  console.log('Icons downloaded successfully.');
}

function cleanupUnusedIcons(champions, items, summonerSpells) {
  const validChampionIds = new Set(champions.map(c => `${c.id}.png`));
  const validItemIds = new Set(items.map(i => `${i.id}.png`));
  const validSpellIds = new Set(summonerSpells.map(s => `${s.id}.png`));

  // Clean up champions
  const championsDir = path.join(IMAGES_DIR, 'champions');
  if (fs.existsSync(championsDir)) {
    const files = fs.readdirSync(championsDir);
    let removedCount = 0;
    for (const file of files) {
      if (file !== '.gitkeep' && !validChampionIds.has(file)) {
        fs.unlinkSync(path.join(championsDir, file));
        removedCount++;
      }
    }
    if (removedCount > 0) {
      console.log(`Removed ${removedCount} unused champion icon(s).`);
    }
  }

  // Clean up items
  const itemsDir = path.join(IMAGES_DIR, 'items');
  if (fs.existsSync(itemsDir)) {
    const files = fs.readdirSync(itemsDir);
    let removedCount = 0;
    for (const file of files) {
      if (file !== '.gitkeep' && !validItemIds.has(file)) {
        fs.unlinkSync(path.join(itemsDir, file));
        removedCount++;
      }
    }
    if (removedCount > 0) {
      console.log(`Removed ${removedCount} unused item icon(s).`);
    }
  }

  // Clean up spells
  const spellsDir = path.join(IMAGES_DIR, 'spells');
  if (fs.existsSync(spellsDir)) {
    const files = fs.readdirSync(spellsDir);
    let removedCount = 0;
    for (const file of files) {
      if (file !== '.gitkeep' && !validSpellIds.has(file)) {
        fs.unlinkSync(path.join(spellsDir, file));
        removedCount++;
      }
    }
    if (removedCount > 0) {
      console.log(`Removed ${removedCount} unused summoner spell icon(s).`);
    }
  }
}

async function loadFromApi() {
  const versions = await fetchJson(`${DATA_DRAGON_BASE}/api/versions.json`);
  const latestVersion = getLatestVersion(versions);
  const baseUrl = `${DATA_DRAGON_BASE}/cdn/${latestVersion}/data/${LOCALE}`;

  const [championsJson, itemsJson, summonersJson, runesJson] = await Promise.all([
    fetchJson(`${baseUrl}/champion.json`),
    fetchJson(`${baseUrl}/item.json`),
    fetchJson(`${baseUrl}/summoner.json`),
    fetchJson(`${baseUrl}/runesReforged.json`)
  ]);

  return { latestVersion, championsJson, itemsJson, summonersJson, runesJson };
}

function loadFromLocal() {
  const versions = readJson(path.join(SOURCE_DIR, 'versions.json'));
  const latestVersion = getLatestVersion(versions);

  return {
    latestVersion,
    championsJson: readJson(path.join(SOURCE_DIR, 'champion.json')),
    itemsJson: readJson(path.join(SOURCE_DIR, 'item.json')),
    summonersJson: readJson(path.join(SOURCE_DIR, 'summoner.json')),
    runesJson: readJson(path.join(SOURCE_DIR, 'runesReforged.json'))
  };
}

async function main() {
  const useOffline = process.argv.includes('--offline');

  const { latestVersion, championsJson, itemsJson, summonersJson, runesJson } = useOffline
    ? loadFromLocal()
    : await loadFromApi();

  const champions = await toChampionList(championsJson, latestVersion, useOffline);
  const items = toItemList(itemsJson, latestVersion);
  const summonerSpells = toSummonerSpellList(summonersJson, latestVersion);
  const runes = toRunes(runesJson);

  ensureDir(OUTPUT_DIR);

  writeJson(path.join(OUTPUT_DIR, 'champions.json'), champions);
  writeJson(path.join(OUTPUT_DIR, 'items.json'), items);
  writeJson(path.join(OUTPUT_DIR, 'summoner-spells.json'), summonerSpells);
  writeJson(path.join(OUTPUT_DIR, 'runes.json'), runes);
  writeJson(path.join(OUTPUT_DIR, 'metadata.json'), {
    version: latestVersion,
    generatedAt: new Date().toISOString(),
    source: useOffline ? 'api-json' : 'data-dragon'
  });

  console.log(`Data updated for version ${latestVersion}.`);

  if (!useOffline) {
    await downloadIcons(champions, items, summonerSpells, runes, latestVersion);
  } else {
    console.log('Skipping icon download in offline mode.');
  }
}

main().catch((error) => {
  console.error('Data update failed.', error);
  process.exitCode = 1;
});

const fs = require('fs');
const path = require('path');
const https = require('https');

const SOURCE_DIR = path.resolve(__dirname, '..', 'api-json');
const OUTPUT_DIR = path.resolve(__dirname, '..', 'data');
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

function toChampionList(championJson) {
  const data = championJson && championJson.data ? championJson.data : {};
  return Object.values(data).map((champion) => ({
    name: champion.name,
    class: champion.title
  }));
}

function toSummonerSpellList(spellJson) {
  const data = spellJson && spellJson.data ? spellJson.data : {};
  const names = Object.values(data).map((spell) => spell.name);
  return Array.from(new Set(names)).sort((a, b) => a.localeCompare(b));
}

function toItemList(itemJson) {
  const data = itemJson && itemJson.data ? itemJson.data : {};
  const items = Object.values(data)
    .filter((item) => item.gold && item.gold.purchasable)
    .filter((item) => item.maps && item.maps['11'])
    .filter((item) => !item.tags || !item.tags.includes('Trinket'))
    .map((item) => ({
      name: item.name,
      tags: item.tags || []
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

  const champions = toChampionList(championsJson);
  const items = toItemList(itemsJson);
  const summonerSpells = toSummonerSpellList(summonersJson);
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
}

main().catch((error) => {
  console.error('Data update failed.', error);
  process.exitCode = 1;
});

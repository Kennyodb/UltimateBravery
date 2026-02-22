// League of Legends Data
const champions = [
  { name: 'Aatrox', class: 'Darkin Blade' },
  { name: 'Ahri', class: 'Nine-Tailed Fox' },
  { name: 'Akali', class: 'The Rogue Assassin' },
  { name: 'Akshan', class: 'Sentinel of Souls' },
  { name: 'Alistar', class: 'the Minotaur' },
  { name: 'Amumu', class: 'the Sad Mummy' },
  { name: 'Anivia', class: 'the Cryophoenix' },
  { name: 'Annie', class: 'the Dark Child' },
  { name: 'Aphelios', class: 'the Weapon of the Faithful' },
  { name: 'Ashe', class: 'the Frost Archer' },
  { name: 'Aurelion Sol', class: 'the Star Forger' },
  { name: 'Evelynn', class: 'Agony\'s Embrace' },
  { name: 'Azir', class: 'the Emperor of the Sands' },
  { name: 'Bard', class: 'the Wandering Caretaker' },
  { name: 'Blitzcrank', class: 'the Great Steam Golem' },
  { name: 'Brand', class: 'the Burning Vengeance' },
  { name: 'Braum', class: 'the Heart of the Freljord' },
  { name: 'Briar', class: 'the Restrained' },
  { name: 'Caitlyn', class: 'the Sheriff of Piltover' },
  { name: 'Camille', class: 'the Steel Shadow' },
  { name: 'Cassiopeia', class: 'the Serpent\'s Embrace' },
  { name: 'Corki', class: 'the Daring Bombardier' },
  { name: 'Darius', class: 'the Hand of Noxus' },
  { name: 'Diana', class: 'Scorn of the Moon' },
  { name: 'Dr. Mundo', class: 'the Madman of Zaun' },
  { name: 'Draven', class: 'the Glorious Executioner' },
  { name: 'Ekko', class: 'the Boy Who Shattered Time' },
  { name: 'Elise', class: 'the Spider Queen' },
  { name: 'Ezreal', class: 'the Prodigal Explorer' },
  { name: 'Fiddlesticks', class: 'the Harbinger of Doom' },
  { name: 'Fiora', class: 'the Grand Duelist' },
  { name: 'Fizz', class: 'the Tidal Trickster' },
  { name: 'Galio', class: 'the Sentinel\'s Sorrow' },
  { name: 'Gangplank', class: 'the Saltwater Scourge' },
  { name: 'Garen', class: 'Might of Demacia' },
  { name: 'Gnar', class: 'the Missing Link' },
  { name: 'Gragas', class: 'the Rabble Rouser' },
  { name: 'Graves', class: 'the Outlaw' },
  { name: 'Gwen', class: 'the Hallowed Seamstress' },
  { name: 'Hecarim', class: 'the Shadow of War' },
  { name: 'Heimerdinger', class: 'the Revered Inventor' },
  { name: 'Hwei', class: 'the Visionary' },
  { name: 'Illaoi', class: 'the Kraken Priestess' },
  { name: 'Irelia', class: 'the Blade Dancer' },
  { name: 'Ivern', class: 'the Green Father' },
  { name: 'Janna', class: 'the Storm\'s Fury' },
  { name: 'Jarvan IV', class: 'the Exemplar of Demacia' },
  { name: 'Jax', class: 'Grandmaster at Arms' },
  { name: 'Jayce', class: 'the Defender of Tomorrow' },
  { name: 'Jhin', class: 'the Virtuoso' },
  { name: 'Jinx', class: 'the Loose Cannon' },
  { name: 'K\'Sante', class: 'the Empyrean' },
  { name: 'Kai\'Sa', class: 'Daughter of the Void' },
  { name: 'Kalista', class: 'The Spear of Vengeance' },
  { name: 'Karma', class: 'the Enlightened One' },
  { name: 'Karthus', class: 'the Deathsinger' },
  { name: 'Kassadin', class: 'the Void Walker' },
  { name: 'Katarina', class: 'the Sinister Blade' },
  { name: 'Kayle', class: 'the Righteous' },
  { name: 'Kayn', class: 'the Shadow Reaper' },
  { name: 'Kennen', class: 'the Heart of the Tempest' },
  { name: 'Kha\'Zix', class: 'the Void Reaver' },
  { name: 'Kindred', class: 'The Eternal Hunters' },
  { name: 'Kled', class: 'the Cantankerous Cavalier' },
  { name: 'Kog\'Maw', class: 'the Mouth of the Abyss' },
  { name: 'LeBlanc', class: 'the Deceiver' },
  { name: 'Lee Sin', class: 'the Blind Monk' },
  { name: 'Leona', class: 'the Radiant Dawn' },
  { name: 'Lillia', class: 'the Bashful Bloom' },
  { name: 'Lissandra', class: 'the Ice Witch' },
  { name: 'Lulu', class: 'the Fae Sorceress' },
  { name: 'Lux', class: 'the Lady of Luminosity' },
  { name: 'Malphite', class: 'Shard of the Monolith' },
  { name: 'Malzahar', class: 'the Prophet of the Void' },
  { name: 'Maokai', class: 'the Twisted Treant' },
  { name: 'Milio', class: 'the Gentle Flame' },
  { name: 'Miss Fortune', class: 'the Bounty Hunter' },
  { name: 'Mordekaiser', class: 'the Iron Revenant' },
  { name: 'Morgana', class: 'Fallen Angel' },
  { name: 'Nami', class: 'the Tidecaller' },
  { name: 'Nasus', class: 'the Curator of the Sands' },
  { name: 'Nautilus', class: 'the Titan of the Depths' },
  { name: 'Neeko', class: 'the Curious Chameleon' },
  { name: 'Nidalee', class: 'the Bestial Huntress' },
  { name: 'Nilah', class: 'the Joy Unbound' },
  { name: 'Nocturne', class: 'Eternal Nightmare' },
  { name: 'Nunu & Willump', class: 'the Boy and His Yeti' },
  { name: 'Olaf', class: 'the Berserker' },
  { name: 'Orianna', class: 'the Lady of Clockwork' },
  { name: 'Ornn', class: 'the Fire below the Mountain' },
  { name: 'Pantheon', class: 'the Unbreakable Spear' },
  { name: 'Poppy', class: 'Keeper of the Hammer' },
  { name: 'Pyke', class: 'the Bloodharbor Ripper' },
  { name: 'Qiyana', class: 'Empress of the Elements' },
  { name: 'Quinn', class: 'Demacia\'s Wings' },
  { name: 'Rakan', class: 'the Charmer' },
  { name: 'Rammus', class: 'the Armordillo' },
  { name: 'Rek\'Sai', class: 'the Void Burrower' },
  { name: 'Renata Glasc', class: 'the Duchess of Chemtech' },
  { name: 'Renekton', class: 'the Butcher of the Sands' },
  { name: 'Rengar', class: 'the Pridestalker' },
  { name: 'Riven', class: 'the Exile' },
  { name: 'Rumble', class: 'the Mechanized Menace' },
  { name: 'Ryze', class: 'the Rune Mage' },
  { name: 'Samira', class: 'the Desert Rose' },
  { name: 'Senna', class: 'the Redeemer' },
  { name: 'Seraphine', class: 'the Star Charmer' },
  { name: 'Sett', class: 'the Boss' },
  { name: 'Shaco', class: 'the Demon Jester' },
  { name: 'Shen', class: 'the Eye of Twilight' },
  { name: 'Shyvana', class: 'the Half-Dragon' },
  { name: 'Singed', class: 'Mad Chemist' },
  { name: 'Sion', class: 'the Undead Juggernaut' },
  { name: 'Sivir', class: 'the Battle Mistress' },
  { name: 'Skarner', class: 'Crystal Venom' },
  { name: 'Sona', class: 'Maven of the Strings' },
  { name: 'Soraka', class: 'the Starchild' },
  { name: 'Swain', class: 'the Noxian Grand General' },
  { name: 'Sylas', class: 'the Unshackled' },
  { name: 'Syndra', class: 'the Dark Sovereign' },
  { name: 'Tahm Kench', class: 'the River King' },
  { name: 'Taliyah', class: 'the Stoneweaver' },
  { name: 'Talon', class: 'the Blade\'s Shadow' },
  { name: 'Taric', class: 'the Shield of Valoran' },
  { name: 'Teemo', class: 'the Swift Scout' },
  { name: 'Thresh', class: 'the Chain Warden' },
  { name: 'Tristana', class: 'the Megling Gunner' },
  { name: 'Trundle', class: 'the Troll King' },
  { name: 'Tryndamere', class: 'the Barbarian King' },
  { name: 'Twisted Fate', class: 'the Card Master' },
  { name: 'Twitch', class: 'the Plague Rat' },
  { name: 'Udyr', class: 'the Spirit Walker' },
  { name: 'Urgot', class: 'the Headsman\'s Pride' },
  { name: 'Varus', class: 'the Arrow of Retribution' },
  { name: 'Vayne', class: 'the Night Hunter' },
  { name: 'Veigar', class: 'the Tiny Master of Evil' },
  { name: 'Vel\'Koz', class: 'the Eye of the Void' },
  { name: 'Vex', class: 'the Gloomist' },
  { name: 'Vi', class: 'the Enforcer' },
  { name: 'Viego', class: 'the Ruined King' },
  { name: 'Viktor', class: 'the Machine Herald' },
  { name: 'Vladimir', class: 'the Crimson Reaper' },
  { name: 'Volibear', class: 'the Relentless Storm' },
  { name: 'Warwick', class: 'the Uncaged Wrath of Zaun' },
  { name: 'Wukong', class: 'the Monkey King' },
  { name: 'Xayah', class: 'the Rebel' },
  { name: 'Xerath', class: 'the Magus Ascendant' },
  { name: 'Xin Zhao', class: 'the Seneschal of Demacia' },
  { name: 'Yasuo', class: 'the Unforgiven' },
  { name: 'Yone', class: 'the Gathering Storm' },
  { name: 'Yorick', class: 'the Shepherd of Souls' },
  { name: 'Yuumi', class: 'the Magical Cat' },
  { name: 'Zac', class: 'the Secret Weapon' },
  { name: 'Zed', class: 'the Master of Shadows' },
  { name: 'Zeri', class: 'the Spark Pack' },
  { name: 'Ziggs', class: 'the Hexplosives Expert' },
  { name: 'Zilean', class: 'the Chrono Keeper' },
  { name: 'Zoe', class: 'the Aspect of Twilight' },
  { name: 'Zyra', class: 'Rise of the Thorns' }
];

const summonerSpells = [
  'Flash',
  'Smite',
  'Exhaust',
  'Ignite',
  'Heal',
  'Teleport',
  'Clarity',
  'Cleanse',
  'Ghost',
  'Barrier',
  'Snowball',
  'Predator'
];

const items = [
  'Trinity Force',
  'Divine Sunderer',
  'Iceborn Gauntlet',
  'Hollow Radiance',
  'Liandry\'s Torment',
  'Ludens Tempest',
  'Rocketbelt',
  'Protobelt',
  'Zhonyas Hourglass',
  'Banshees Veil',
  'Abyssal Mask',
  'Spirit Visage',
  'Force of Nature',
  'Maw of Malmortius',
  'Kaenic Rookern',
  'Adaptive Helm',
  'Black Cleaver',
  'Manamune',
  'Muramana',
  'Essence Reaver',
  'Bloodthirster',
  'Serylda\'s Grudge',
  'Krakhalm',
  'Lord Dominiks Regards',
  'Mortal Reminder',
  'Chempunk Chainsword',
  'Rylai\'s Crystal Scepter',
  'Demonic Embrace',
  'Cosmic Drive',
  'Shadowflame',
  'Nashor\'s Tooth',
  'Void Staff',
  'Morellonomicon',
  'Shurelya\'s Battlesong',
  'Ardent Censer',
  'Redemption',
  'Mikael\'s Blessing',
  'Zeke\'s Convergence',
  'Oblivion Orb',
  'Spectre\'s Cowl',
  'Kindlegem',
  'Negatron Cloak',
  'Adaptive Helm',
  'Silvermere Dawn',
  'Mercury\'s Treads',
  'Plated Steelcaps',
  'Swiftness Boots',
  'Ionian Boots of Lucidity',
  'Abyssal Mask',
  'Force of Nature',
  'Thornmail',
  'Kaenic Rookern',
  'Warmog\'s Armor',
  'Stoneplate',
  'Infinite Radiance'
];

// Get random element from array
function getRandomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Generate ability leveling order (18 levels with R at 6, 11, 16)
function generateAbilityOrder() {
  const order = [];
  const nonUltAbilities = ['Q', 'W', 'E'];

  for (let i = 1; i <= 18; i++) {
    if (i === 6 || i === 11 || i === 16) {
      order.push('R');
    } else {
      order.push(getRandomElement(nonUltAbilities));
    }
  }

  return order;
}

// Roll function
function roll() {
  const champion = getRandomElement(champions);
  const spell1 = getRandomElement(summonerSpells);
  let spell2 = getRandomElement(summonerSpells);
  while (spell2 === spell1) {
    spell2 = getRandomElement(summonerSpells);
  }

  const selectedItems = [];
  const availableItems = [...items];
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * availableItems.length);
    selectedItems.push(availableItems[randomIndex]);
    availableItems.splice(randomIndex, 1);
  }

  const abilityOrder = generateAbilityOrder();

  return {
    champion,
    spell1,
    spell2,
    items: selectedItems,
    abilityOrder
  };
}

// Display results
function displayResults(data) {
  document.getElementById('championName').textContent = data.champion.name;
  document.getElementById('championClass').textContent = data.champion.class;

  document.getElementById('summonerSpell1').textContent = data.spell1;
  document.getElementById('summonerSpell2').textContent = data.spell2;

  for (let i = 0; i < 6; i++) {
    document.getElementById(`item${i + 1}`).textContent = data.items[i];
  }

  for (let i = 0; i < 18; i++) {
    document.getElementById(`level${i + 1}`).textContent = data.abilityOrder[i];
  }

  document.getElementById('results').style.display = 'block';
}

// Event listeners
document.getElementById('rollBtn').addEventListener('click', () => {
  const data = roll();
  displayResults(data);
});

document.getElementById('rerollBtn').addEventListener('click', () => {
  const data = roll();
  displayResults(data);
});

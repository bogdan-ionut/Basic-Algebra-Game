import { useMemo, useState } from 'react';

type Profile = {
  name: string;
  biome: string;
  avatar: string;
};

type Challenge = {
  left: number;
  right: number;
  op: '+' | '-' | '×';
  answer: number;
};

type Loot = {
  id: string;
  name: string;
  rarity: 'Common' | 'Rare' | 'Epic';
  icon: string;
};

const avatars = ['⛏️', '🛡️', '🧱', '🐺', '🧭', '🔥'];
const biomes = ['Plains', 'Forest', 'Desert', 'Taiga', 'Jungle', 'Nether'];

const lootTable: Loot[] = [
  { id: 'coal', name: 'Coal', rarity: 'Common', icon: '⚫' },
  { id: 'iron', name: 'Iron Ingot', rarity: 'Common', icon: '⛓️' },
  { id: 'redstone', name: 'Redstone Dust', rarity: 'Rare', icon: '🔴' },
  { id: 'emerald', name: 'Emerald', rarity: 'Rare', icon: '💚' },
  { id: 'diamond', name: 'Diamond', rarity: 'Epic', icon: '💎' },
  { id: 'totem', name: 'Totem of Undying', rarity: 'Epic', icon: '🗿' },
];

const rarityWeight: Record<Loot['rarity'], number> = {
  Common: 65,
  Rare: 28,
  Epic: 7,
};

function buildChallenge(level: number): Challenge {
  const max = Math.min(12 + level * 2, 50);
  const left = 1 + Math.floor(Math.random() * max);
  const right = 1 + Math.floor(Math.random() * max);
  const opPool: Challenge['op'][] = ['+', '-', '×'];
  const op = opPool[Math.floor(Math.random() * opPool.length)];

  if (op === '+') return { left, right, op, answer: left + right };
  if (op === '×') return { left, right, op, answer: left * right };
  const bigger = Math.max(left, right);
  const smaller = Math.min(left, right);
  return { left: bigger, right: smaller, op, answer: bigger - smaller };
}

function pickLoot(): Loot {
  const roll = Math.random() * 100;
  let cursor = 0;
  const ordered: Loot['rarity'][] = ['Common', 'Rare', 'Epic'];

  let selectedRarity: Loot['rarity'] = 'Common';
  for (const rarity of ordered) {
    cursor += rarityWeight[rarity];
    if (roll <= cursor) {
      selectedRarity = rarity;
      break;
    }
  }

  const bucket = lootTable.filter((item) => item.rarity === selectedRarity);
  return bucket[Math.floor(Math.random() * bucket.length)];
}

function xpForNext(level: number): number {
  return 80 + level * 40;
}

export default function App() {
  const [profile, setProfile] = useState<Profile>({
    name: 'Block Learner',
    biome: 'Forest',
    avatar: '⛏️',
  });
  const [editingProfile, setEditingProfile] = useState(false);
  const [challenge, setChallenge] = useState<Challenge>(() => buildChallenge(1));
  const [answerInput, setAnswerInput] = useState('');
  const [message, setMessage] = useState('Mine your first equation to start the adventure.');
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [streak, setStreak] = useState(0);
  const [hearts, setHearts] = useState(5);
  const [inventory, setInventory] = useState<Loot[]>([]);

  const xpNeeded = useMemo(() => xpForNext(level), [level]);
  const progress = Math.min(100, Math.round((xp / xpNeeded) * 100));

  const totalBlocksMined = inventory.length;
  const rareCount = inventory.filter((item) => item.rarity !== 'Common').length;

  function nextChallenge(currentLevel = level) {
    setChallenge(buildChallenge(currentLevel));
    setAnswerInput('');
  }

  function handleSubmit() {
    const parsed = Number(answerInput);
    if (Number.isNaN(parsed)) {
      setMessage('Type a number before mining the block.');
      return;
    }

    if (parsed === challenge.answer) {
      const bonus = Math.max(8, 18 + streak * 2);
      const earnedLoot = pickLoot();
      const nextXp = xp + bonus;
      let nextLevel = level;
      let leftoverXp = nextXp;

      while (leftoverXp >= xpForNext(nextLevel)) {
        leftoverXp -= xpForNext(nextLevel);
        nextLevel += 1;
      }

      setXp(leftoverXp);
      setLevel(nextLevel);
      setStreak((current) => current + 1);
      setInventory((current) => [earnedLoot, ...current].slice(0, 18));
      setMessage(
        `Perfect mine! +${bonus} XP, found ${earnedLoot.icon} ${earnedLoot.name}${
          nextLevel > level ? ' and leveled up!' : '!'
        }`
      );
      if (hearts < 5) setHearts((current) => current + 1);
      nextChallenge(nextLevel);
    } else {
      setHearts((current) => Math.max(0, current - 1));
      setStreak(0);
      setMessage(`Creeper moment 💥 Correct answer was ${challenge.answer}. Try another block.`);
      nextChallenge();
    }
  }

  function resetRun() {
    setXp(0);
    setLevel(1);
    setStreak(0);
    setHearts(5);
    setInventory([]);
    setMessage('Fresh world generated. Time to mine smart.');
    setChallenge(buildChallenge(1));
    setAnswerInput('');
  }

  return (
    <div className="app-shell">
      <header className="topbar pixel-card">
        <div>
          <h1>MATHCRAFT ACADEMY</h1>
          <p>Train algebra with blocky progression, loot, and survival pressure.</p>
        </div>
        <button className="btn" onClick={() => setEditingProfile(true)}>Profile</button>
      </header>

      <main className="layout">
        <section className="pixel-card hero">
          <div className="hero-line">
            <span className="avatar">{profile.avatar}</span>
            <div>
              <h2>{profile.name}</h2>
              <p>{profile.biome} biome expedition</p>
            </div>
          </div>

          <div className="hearts" aria-label="health">
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i}>{i < hearts ? '❤️' : '🖤'}</span>
            ))}
          </div>

          <div className="progress-wrap">
            <div className="progress-meta">
              <span>Level {level}</span>
              <span>{xp}/{xpNeeded} XP</span>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
          </div>

          <div className="stats-grid">
            <div><strong>{streak}</strong><span>Combo</span></div>
            <div><strong>{totalBlocksMined}</strong><span>Blocks Mined</span></div>
            <div><strong>{rareCount}</strong><span>Rare Finds</span></div>
          </div>
        </section>

        <section className="pixel-card challenge">
          <h3>Mining Challenge</h3>
          <p className="equation">{challenge.left} {challenge.op} {challenge.right} = ?</p>
          <div className="challenge-controls">
            <input
              value={answerInput}
              onChange={(e) => setAnswerInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              placeholder="answer"
              inputMode="numeric"
            />
            <button className="btn" onClick={handleSubmit}>Mine Block</button>
          </div>
          <p className="message">{message}</p>
        </section>

        <section className="pixel-card inventory">
          <div className="inventory-head">
            <h3>Backpack</h3>
            <button className="btn ghost" onClick={resetRun}>New World</button>
          </div>
          <div className="items-grid">
            {inventory.length === 0 ? (
              <p className="empty">No loot yet. Solve equations to fill your backpack.</p>
            ) : (
              inventory.map((item, index) => (
                <article key={`${item.id}-${index}`} className={`item ${item.rarity.toLowerCase()}`}>
                  <span>{item.icon}</span>
                  <div>
                    <strong>{item.name}</strong>
                    <p>{item.rarity}</p>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      </main>

      {editingProfile && (
        <div className="modal">
          <div className="pixel-card modal-card">
            <h3>Edit Adventurer</h3>
            <label>
              Name
              <input
                value={profile.name}
                maxLength={20}
                onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value || 'Block Learner' }))}
              />
            </label>
            <label>
              Biome
              <select
                value={profile.biome}
                onChange={(e) => setProfile((p) => ({ ...p, biome: e.target.value }))}
              >
                {biomes.map((biome) => <option key={biome}>{biome}</option>)}
              </select>
            </label>
            <div>
              <p>Avatar</p>
              <div className="avatar-row">
                {avatars.map((avatar) => (
                  <button
                    key={avatar}
                    className={`avatar-pick ${profile.avatar === avatar ? 'active' : ''}`}
                    onClick={() => setProfile((p) => ({ ...p, avatar }))}
                  >
                    {avatar}
                  </button>
                ))}
              </div>
            </div>
            <button className="btn" onClick={() => setEditingProfile(false)}>Done</button>
          </div>
        </div>
      )}
    </div>
  );
}

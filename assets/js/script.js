let log = new Log(document.querySelector(".log"));

let char = new Sorcerer("Merlin");

const monsters = [LittleMonster, BigMonster, Skeleton, Orc, Slime, Dragon];


alert('A aventura aguarda por você, bravo herói! Prepare-se para enfrentar monstros formidáveis e conquistar glórias inesquecíveis!');

function powerOf(MonsterClass){
    try{
        const inst = new MonsterClass();
        return inst.attack + inst.defense + (inst.life / 10);
    }catch(e){ return 0; }
}

const sortedMonsters = monsters.slice().sort((a,b)=> powerOf(a) - powerOf(b));
let progressiveIndex = 0;

function createMonster(){
    const MonsterClass = sortedMonsters[progressiveIndex];
    progressiveIndex = (progressiveIndex + 1) % sortedMonsters.length;
    return new MonsterClass();
}

let monster = createMonster();
log.addMessage(`${monster.name} apareceu! Prepare-se para a luta.`);

const stage = new Stage(
    char,
    monster,
    document.querySelector("#char"),
    document.querySelector("#monster"),
    log,
    createMonster,
    (killedName) => {
        incrementKillCount();
        stage.update();
        refreshUI();
        log.addMessage(`${killedName} foi abatido pelo herói.`);
        return showRewardPanel(killedName);
    },
    (attackedObj, damage) => {
        showDamagePop(attackedObj, damage);
    }
);


const charEl = document.querySelector('#char');
const monsterEl = document.querySelector('#monster');
const newMonsterBtn = document.querySelector('#newMonster');
const startButton = document.querySelector('#startBattle');

const emojiMap = {
    'Merlin': '🧙',
    'Little Monster': '🐀',
    'Big Monster': '🐲',
    'Skeleton': '💀',
    'Orc': '👹',
    'Slime': '🟢',
    'Dragon': '🐉'
};

function refreshUI(){
    const f1Avatar = charEl.querySelector('.avatar');
    const f2Avatar = monsterEl.querySelector('.avatar');
    f1Avatar.textContent = emojiMap[stage.fighter1.name] || '🧑';
    f2Avatar.textContent = emojiMap[stage.fighter2.name] || '👾';
    monsterEl.classList.add('spawn-fade');
    setTimeout(()=> monsterEl.classList.remove('spawn-fade'), 500);
}

let killCount = 0;
const killCountEl = document.querySelector('#killCount');
function incrementKillCount(){
    killCount++;
    if(killCountEl) killCountEl.textContent = String(killCount);
}

const rewardPanel = document.querySelector('#rewardPanel');
const rewardButtons = rewardPanel ? rewardPanel.querySelectorAll('[data-reward]') : null;

function pauseAutoAttack(){
    if(autoIntervalChar){ clearInterval(autoIntervalChar); autoIntervalChar = null; }
    if(autoIntervalMonster){ clearInterval(autoIntervalMonster); autoIntervalMonster = null; }
}

function resumeAutoAttack(){
    if(!autoIntervalChar){
        autoIntervalChar = setInterval(()=>{
            if(stage.fighter1.life > 0 && stage.fighter2.life > 0){
                charEl.querySelector('.attackButton').click();
            }
        }, 900);
    }
    if(!autoIntervalMonster){
        autoIntervalMonster = setInterval(()=>{
            if(stage.fighter2.life > 0 && stage.fighter1.life > 0){
                monsterEl.querySelector('.attackButton').click();
            }
        }, 1100);
    }
}

function applyReward(type, amount){
    const hero = stage.fighter1;
    if(!hero) return;
    amount = Number(amount) || 0;
    if(type === 'attack'){
        hero.attack += amount;
        log.addMessage(`Ataque aumentado em +${amount}! (Agora ${hero.attack})`);
    } else if(type === 'life'){
        hero.maxLife += amount;
        hero.life += amount;
        log.addMessage(`Vida aumentada em +${amount}! (Agora ${hero.life.toFixed(1)}/${hero.maxLife})`);
    } else if(type === 'defense'){
        hero.defense += amount;
        log.addMessage(`Defesa aumentada em +${amount}! (Agora ${hero.defense})`);
    }
    stage.update();
    refreshUI();
}

function showRewardPanel(killedName){
    return new Promise((resolve)=>{
        if(!rewardPanel || !rewardButtons){ resolve(); return; }
        pauseAutoAttack();
        rewardPanel.classList.remove('hidden');
        function rand(min,max){ return Math.floor(Math.random()*(max-min+1))+min; }
        rewardButtons.forEach(b => {
            const type = b.getAttribute('data-reward');
            let amt = 0;
            if(type === 'attack') amt = rand(1,5);
            else if(type === 'life') amt = rand(10,40);
            else if(type === 'defense') amt = rand(1,3);
            b.setAttribute('data-amount', String(amt));
            if(type === 'attack') b.textContent = `+${amt} Ataque`;
            else if(type === 'life') b.textContent = `+${amt} Vida`;
            else if(type === 'defense') b.textContent = `+${amt} Defesa`;
        });
        function onChoose(e){
            const btn = e.currentTarget;
            const type = btn.getAttribute('data-reward');
            const amount = btn.getAttribute('data-amount') || btn.dataset.amount || 0;
            applyReward(type, amount);
            rewardButtons.forEach(b => b.removeEventListener('click', onChoose));
            rewardPanel.classList.add('hidden');
            resumeAutoAttack();
            resolve();
        }
        rewardButtons.forEach(b => b.addEventListener('click', onChoose));
    });
}

function playHitAnimation(targetEl){
    targetEl.classList.add('hit');
    setTimeout(()=> targetEl.classList.remove('hit'), 300);
}

function showDamagePop(attackedObj, damage){
    const targetEl = (stage.fighter2 === attackedObj) ? monsterEl : charEl;
    const avatar = targetEl.querySelector('.avatar');
    const rect = avatar.getBoundingClientRect();
    const pop = document.createElement('div');
    pop.className = 'damage-pop';
    pop.textContent = `-${Number(damage).toFixed(0)}`;
    document.body.appendChild(pop);
    pop.style.left = `${rect.left + rect.width/2 - 12}px`;
    pop.style.top = `${rect.top - 8}px`;
    setTimeout(()=>{ pop.remove(); }, 950);
}

charEl.querySelector('.attackButton').addEventListener('click', ()=>{
    playHitAnimation(monsterEl);
    setTimeout(()=> { stage.update(); refreshUI(); }, 300);
});

monsterEl.querySelector('.attackButton').addEventListener('click', ()=>{
    playHitAnimation(charEl);
    setTimeout(()=> { stage.update(); refreshUI(); }, 300);
});

newMonsterBtn.addEventListener('click', ()=>{
    const nm = createMonster();
    stage.fighter2 = nm;
    log.addMessage(`${nm.name} apareceu (forçado)!`);
    stage.update();
    refreshUI();
});

let autoIntervalChar = null;
let autoIntervalMonster = null;

if(startButton){
    charEl.querySelector('.attackButton').disabled = true;
    monsterEl.querySelector('.attackButton').disabled = true;
    startButton.addEventListener('click', ()=>{
        stage.start();
        charEl.querySelector('.attackButton').disabled = false;
        monsterEl.querySelector('.attackButton').disabled = false;
        resumeAutoAttack();
        log.addMessage('Batalha iniciada! Ataque automático ativado.');
        startButton.disabled = true;
    });
}

stage.update();
refreshUI();


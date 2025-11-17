class Stage {
    constructor(fighter1, fighter2, fighter1El, fighter2El, log) {
        this.fighter1 = fighter1;
        this.fighter2 = fighter2;
        this.fighter1El = fighter1El;
        this.fighter2El = fighter2El;
        this.log = log;
        this.lastDefeated = null;
    }

    start() {
        this.update();
        this.fighter1El.querySelector('.attackButton').addEventListener('click', () => {
            this.playerTurn();
        });
    }

    playerTurn() {
        if (this.fighter1.life <= 0 || this.fighter2.life <= 0) return;
        this.lastDefeated = null;
        this.doAttack(this.fighter1, this.fighter2);
        if (this.lastDefeated === 'monster') return;
        if (this.fighter2.life > 0 && this.fighter1.life > 0) {
            setTimeout(() => {
                this.doAttack(this.fighter2, this.fighter1);
            }, 600);
        }
    }

    update() {
        this.updateFighter(this.fighter1, this.fighter1El);
        this.updateFighter(this.fighter2, this.fighter2El);
    }

    updateFighter(fighter, element) {
        element.querySelector('.name').innerHTML =
            `${fighter.name} - ${fighter.life.toFixed(1)} HP`;
        let pct = (fighter.life / fighter.maxLife) * 100;
        if (pct < 0) pct = 0;
        element.querySelector('.bar').style.width = `${pct}%`;
    }

    doAttack(attacking, attacked) {
        if (attacking.life <= 0 || attacked.life <= 0) return;

        let attackFactor = Math.random() * 2;
        let defenseFactor = Math.random() * 2;

        let actualAttack = attacking.attack * attackFactor;
        let actualDefense = attacked.defense * defenseFactor;

        let attackerColor = attacking === this.fighter1 ? "green" : "red";

        if (actualAttack > actualDefense) {
            let damage = actualAttack - actualDefense;
            attacked.life -= damage;
            this.log.addMessage(
                `<span style="color:${attackerColor}">${attacking.name}</span> causou ${damage.toFixed(1)} de dano em ${attacked.name}`
            );
        } else {
            this.log.addMessage(
                `${attacked.name} defendeu o ataque de <span style="color:${attackerColor}">${attacking.name}</span>`
            );
        }

        this.update();

        if (attacked.life <= 0) {
            if (attacked === this.fighter2) {
                this.lastDefeated = 'monster';
                this.log.addMessage(`${attacked.name} foi derrotado! Um novo monstro apareceu!`);
                this.fighter1.life = this.fighter1.maxLife;
                this.log.addMessage(`O jogador recuperou toda a vida!`);
                this.spawnNewMonster();
            } else {
                this.lastDefeated = 'player';
                this.log.addMessage(`${attacked.name} foi derrotado! Fim de jogo.`);
            }
        }
    }

    spawnNewMonster() {
        this.fighter2 = Math.random() > 0.5 ? new LittleMonster() : new BigMonster();
        this.update();
    }
}

class Log {
    constructor(listEl) {
        this.listEl = listEl;
        this.messages = [];
        this.maxMessages = 5;
    }

    addMessage(msg) {
        this.messages.push(msg);
        if (this.messages.length > this.maxMessages) this.messages.shift();
        this.render();
    }

    render() {
        this.listEl.innerHTML = '';
        for (let msg of this.messages) {
            const li = document.createElement('li');
            li.innerHTML = msg;
            this.listEl.appendChild(li);
        }
    }
}

const charEl = document.querySelector('#char');
const monsterEl = document.querySelector('#monster');
const log = new Log(document.querySelector('#log'));
const startButton = document.querySelector('#startButton');
const characterButtons = document.querySelectorAll('.char-option');
const nameInput = document.querySelector('#playerName');

let selectedClass = null;
let player;
let monster;
let stage;

characterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        characterButtons.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        selectedClass = btn.getAttribute('data-class');
        log.addMessage(`Você escolheu: ${btn.innerText.trim()}`);
    });
});

startButton.addEventListener('click', () => {
    let customName = nameInput.value.trim();
    if (customName === "") customName = "Herói";

    if (!selectedClass) {
        log.addMessage('Escolha um personagem antes de iniciar a luta!');
        return;
    }

    if (selectedClass === 'knight') player = new Knight(customName);
    else if (selectedClass === 'sorcerer') player = new Sorcerer(customName);
    else if (selectedClass === 'archer') player = new Archer(customName);
    else player = new Knight(customName);

    monster = Math.random() > 0.5 ? new LittleMonster() : new BigMonster();

    log.messages = [];
    log.render();

    log.addMessage(`A luta começou! ${player.name} vs ${monster.name}`);

    stage = new Stage(player, monster, charEl, monsterEl, log);
    stage.start();
});

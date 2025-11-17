class Character {
  _life = 1;
  maxLife = 1;
  attack = 0;
  defense = 0;

  constructor(name) {
    this.name = name;
  }

  get life() {
    return this._life;
  }

  set life(newLife) {
    this._life = newLife < 0 ? 0 : newLife;
  }
}

class Knight extends Character {
  constructor(name) {
    super(name);
    this.life = 100;
    this.attack = 10;
    this.defense = 8;
    this.maxLife = this.life;
  }
}

class Sorcerer extends Character {
  constructor(name) {
    super(name);
    this.life = 200;
    this.attack = 24;
    this.defense = 5;
    this.maxLife = this.life;
  }
}

class LittleMonster extends Character {
  constructor() {
    super("Little Monster");
    this.life = 40;
    this.attack = 4;
    this.defense = 4;
    this.maxLife = this.life;
  }
}

class BigMonster extends Character {
  constructor() {
    super("Big Monster");
    this.life = 120;
    this.attack = 16;
    this.defense = 6;
    this.maxLife = this.life;
  }
}

class Skeleton extends Character {
  constructor() {
    super("Skeleton");
    this.life = 60;
    this.attack = 6;
    this.defense = 2;
    this.maxLife = this.life;
  }
}

class Orc extends Character {
  constructor() {
    super("Orc");
    this.life = 90;
    this.attack = 12;
    this.defense = 5;
    this.maxLife = this.life;
  }
}

class Slime extends Character {
  constructor() {
    super("Slime");
    this.life = 25;
    this.attack = 3;
    this.defense = 1;
    this.maxLife = this.life;
  }
}

class Dragon extends Character {
  constructor() {
    super("Dragon");
    this.life = 200;
    this.attack = 25;
    this.defense = 12;
    this.maxLife = this.life;
  }
}

class Stage {
  constructor(fighter1, fighter2, fighter1El, fighter2El, logObject, monsterFactory, monsterKilledCallback, onDamage) {
    this.fighter1 = fighter1;
    this.fighter2 = fighter2;
    this.fighter1El = fighter1El;
    this.fighter2El = fighter2El;
    this.log = logObject;
    this.monsterFactory = monsterFactory;
    this.monsterKilledCallback = monsterKilledCallback;
    this.onDamage = onDamage;
  }

  start() {
    this.update()
    this.fighter1El.querySelector(".attackButton").addEventListener("click", () => {
      this.doAttack(this.fighter1, this.fighter2);
    });
    this.fighter2El.querySelector(".attackButton").addEventListener("click", () => {
      this.doAttack(this.fighter2, this.fighter1);
    });
  }

  update() {
    this.fighter1El.querySelector(".name").innerHTML = `${this.fighter1.name} - ${this.fighter1.life.toFixed(1)} HP`;
    let f1Pct = (this.fighter1.life / this.fighter1.maxLife) * 100;
    const f1Bar = this.fighter1El.querySelector(".bar");
    f1Bar.style.width = `${f1Pct}%`;
    f1Bar.classList.remove('low','medium','high');
    if(f1Pct <= 30) f1Bar.classList.add('low');
    else if(f1Pct <= 60) f1Bar.classList.add('medium');
    else f1Bar.classList.add('high');
    this.fighter2El.querySelector(".name").innerHTML = `${this.fighter2.name} - ${this.fighter2.life.toFixed(1)} HP`;
    let f2Pct = (this.fighter2.life / this.fighter2.maxLife) * 100;
    const f2Bar = this.fighter2El.querySelector(".bar");
    f2Bar.style.width = `${f2Pct}%`;
    f2Bar.classList.remove('low','medium','high');
    if(f2Pct <= 30) f2Bar.classList.add('low');
    else if(f2Pct <= 60) f2Bar.classList.add('medium');
    else f2Bar.classList.add('high');
  }

  async doAttack(attacking, attacked) {
    if(attacking.life <= 0 || attacked.life <= 0) {
      this.log.addMessage("Voce esta atacando cachorro morto!");
      return;
    }
    let attackFactor = (Math.random() * 2).toFixed(2);
    let defenseFactor = (Math.random() * 2).toFixed(2);
    let actualAttack = attacking.attack * attackFactor;
    let actualDefense = attacked.defense * defenseFactor;
    if(actualAttack > actualDefense) {
      attacked.life -= actualAttack;
      this.log.addMessage(`${attacking.name} causou ${actualAttack.toFixed(2)} de dano em ${attacked.name}`);
      if(this.onDamage && typeof this.onDamage === 'function'){
        try{ this.onDamage(attacked, actualAttack); }catch(e){ console.error(e); }
      }
      if(attacked.life <= 0) {
        this.log.addMessage(`${attacked.name} foi derrotado!`);
        if(this.monsterFactory && attacked === this.fighter2) {
          if(this.monsterKilledCallback && typeof this.monsterKilledCallback === 'function'){
            try{
              const maybePromise = this.monsterKilledCallback(attacked.name);
              if(maybePromise && typeof maybePromise.then === 'function'){
                await maybePromise;
              }
            }catch(e){ console.error(e); }
          }
          const newMonster = this.monsterFactory();
          this.fighter2 = newMonster;
          this.log.addMessage(`${newMonster.name} apareceu!`);
        }
      }
    } else {
      this.log.addMessage(`${attacked.name} conseguiu defender o ataque de ${attacking.name}`);
    }
    this.update();
  }
}

class Log {
  list = [];

  constructor(listEl) {
    this.listEl = listEl;
  }

  addMessage(msg) {
    this.list.push(msg);
    this.render();
  }

  render() {
    this.listEl.innerHTML = "";
    for(let i in this.list) {
      this.listEl.innerHTML += `<li>${this.list[i]}</li>`;
    }
  }

}
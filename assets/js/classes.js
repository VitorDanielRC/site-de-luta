
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
        this.life = 120;
        this.maxLife = this.life;
        this.attack = 10;
        this.defense = 12;
    }
}

class Sorcerer extends Character {
    constructor(name) {
        super(name);
        this.life = 80;
        this.maxLife = this.life;
        this.attack = 16;
        this.defense = 6;
    }
}

class Archer extends Character {
    constructor(name) {
        super(name);
        this.life = 100;
        this.maxLife = this.life;
        this.attack = 14;
        this.defense = 8;
    }
}



class LittleMonster extends Character {
    constructor() {
        super('Monstrinho');
        this.life = 80;
        this.maxLife = this.life;
        this.attack = 10;
        this.defense = 5;
    }
}

class BigMonster extends Character {
    constructor() {
        super('Monstro Gigante');
        this.life = 150;
        this.maxLife = this.life;
        this.attack = 13;
        this.defense = 10;
    }
}

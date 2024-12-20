class Animal {
  constructor(public name: string) {
    this.name = name;
  }

  move(distance: number = 0) {
    console.log(`${this.name} moved ${distance}m.`);
  }

  speak() {
    console.log(`${this.name} makes a noise.`);
  }
}

export { Animal };

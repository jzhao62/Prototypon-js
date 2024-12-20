import { meaningOfLife } from '@nighttrax/foo';
import { Animal } from './model';

// eslint-disable-next-line no-console
console.log(meaningOfLife);

const animal = new Animal('dog');

animal.move(234);
animal.speak();

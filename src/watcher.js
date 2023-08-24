import { watch } from 'fs';
import Atlasser from './atlasser.js';

const path = './sprites/example/'
const name = 'spritesheet'

const atlasser = new Atlasser(path, name, {})
atlasser.generate()

watch(path, (eventType, fileName) => {
    if (fileName === `${name}.png` || fileName === `${name}.json`) return

    if (eventType === 'rename') {
        console.log(`${fileName} was added or deleted`);
    } else {
        console.log(`${fileName} was updated`);
    }
    atlasser.generate()
});
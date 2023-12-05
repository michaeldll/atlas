import { watch } from 'fs';
import Atlasser from './atlasser.js';

// Change PATH and OUTPUT_NAME to match your needs
const PATH = './sprites/trees/'
const OUTPUT_NAME = 'spritesheet'

const atlasser = new Atlasser(PATH, OUTPUT_NAME, {})
atlasser.generate()

watch(PATH, (eventType, fileName) => {
    if (fileName === `${OUTPUT_NAME}.png` || fileName === `${OUTPUT_NAME}.json`) return

    if (eventType === 'rename') {
        console.log(`${fileName} was added or deleted`);
    } else {
        console.log(`${fileName} was updated`);
    }
    atlasser.generate()
});
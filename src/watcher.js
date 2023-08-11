import { watch } from 'fs';
import Atlasser from './atlasser.js';

const path = './sprites/example/'
const name = 'spritesheet'

const atlasser = new Atlasser(path, name, {
    size: [1024, 1024],
})
atlasser.draw()

watch(path, (eventType, fileName) => {
    if (name === fileName) return

    if (eventType === 'rename') {
        console.log(`${fileName} was added or deleted`);
    } else {
        console.log(`${fileName} was updated`);
    }
    atlasser.draw()
});
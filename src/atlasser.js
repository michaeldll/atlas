// import spritesheet from 'spritesheet-js';
import fs from 'fs'
import Spritesmith from "spritesmith"

export default class Atlasser {
    path = './sprites/example/'
    name = 'spritesheet'
    algorithm = 'top-down'
    padding = 0

    constructor(path, name, { algorithm = 'left-right', padding = 0 }) {
        this.path = path
        this.name = name
        this.algorithm = algorithm
        this.padding = padding
    }

    draw = () => {
        console.log("Generating spritesheet...");

        // Get all images in input folder
        const images = fs.readdirSync(this.path + "/input/").filter(file => file.endsWith('.png'))
        // Add path to each image
        images.forEach((image, index) => {
            images[index] = this.path + "input/" + image;
        });
        Spritesmith.run({ src: images, algorithm: this.algorithm, padding: this.padding, algorithmOpts: { sort: false } }, (err, result) => {
            // If there was an error, throw it
            if (err) {
                throw err;
            }

            console.log("Done!");

            // Output the image
            fs.writeFileSync(`${this.path}/output/${this.name}.png`, result.image);

            // result.image; // Buffer representation of image
            // result.coordinates; // Object mapping filename to {x, y, width, height} of image
            // result.properties; // Object with metadata about spritesheet {width, height}
        });
    }
}
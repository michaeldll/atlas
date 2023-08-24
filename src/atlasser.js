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

    generate = () => {
        console.log("Generating spritesheet...");

        // Get all images in input folder
        const images = fs.readdirSync(this.path).filter(file => file.endsWith('.png') && file !== `${this.name}.png` && file !== `${this.name}.json`)
        // Add path to each image
        images.forEach((image, index) => {
            images[index] = this.path + image;
        });
        Spritesmith.run({ src: images, algorithm: this.algorithm, padding: this.padding, algorithmOpts: { sort: false } }, (err, result) => {
            // If there was an error, throw it
            if (err) {
                throw err;
            }

            // result.image; // Buffer representation of image
            // result.coordinates; // Object mapping filename to {x, y, width, height} of image
            // result.properties; // Object with metadata about spritesheet {width, height}

            this.write(result)
        });
    }

    write = (result) => {
        // Output the image
        fs.writeFileSync(`${this.path}/${this.name}.png`, result.image);

        const coordinates = JSON.stringify(result.coordinates, null, 2)
        const properties = JSON.stringify(result.properties, null, 2)

        // Merge coordinates and properties into one json file
        // and add a tab before each line for proper formatting
        const json = "{\n\t\"coordinates\": " + coordinates.replace(/\n/g, "\n\t") + ",\n\t\"properties\": " + properties.replace(/\n/g, "\n\t") + "\n}"

        fs.writeFileSync(`${this.path}/${this.name}.json`, json);

        console.log("Done!")
    }
}
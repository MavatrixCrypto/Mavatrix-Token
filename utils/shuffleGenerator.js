
const bodies = [
    {
        name: 'white',
        meta_count: 1,
        range: 0.5
    },
    {
        name: 'black',
        meta_count: 2,
        range: 1.0
    }
]

const shoes = [
    {
        name: 'slippers',
        meta_count: 1,
        range: 0.4
    },
    {
        name: 'heels',
        meta_count: 2,
        range: 0.7
    },
    {
        name: 'adidas',
        meta_count: 3,
        range: 0.9
    },
    {
        name: 'mocassino',
        meta_count: 4,
        range: 1.0
    },
]

const eyes = [
    {
        name: 'brown',
        meta_count: 1,
        range: 0.5
    },
    {
        name: 'blueish',
        meta_count: 2,
        range: 0.85
    },
    {
        name: 'demonic',
        meta_count: 3,
        range: 0.95
    },
    {
        name: 'sharingan',
        meta_count: 4,
        range: 1.0
    },
]

const heads = [
    {
        name: 'male',
        meta_count: 1,
        range: 0.3
    },
    {
        name: 'female',
        meta_count: 2,
        range: 0.5
    },
    {
        name: 'bold',
        meta_count: 3,
        range: 0.7
    },
    {
        name: 'super_sayan',
        meta_count: 4,
        range: 0.85
    },
    {
        name: 'bunny_hat',
        meta_count: 5,
        range: 0.95
    },
    {
        name: 'devil_horns',
        meta_count: 6,
        range: 1.0
    },
]

const mouths = [
    {
        name: 'smiley',
        meta_count: 1,
        range: 0.6
    },
    {
        name: 'sad',
        meta_count: 2,
        range: 0.9
    },
    {
        name: 'vampire',
        meta_count: 3,
        range: 1.0
    }
]

const accessories = [
    {
        name: 'rayban',
        meta_count: 1,
        range: 0.4
    },
    {
        name: 'wings',
        meta_count: 2,
        range: 0.65
    },
    {
        name: 'microphone',
        meta_count: 3,
        range: 0.8
    },
    {
        name: 'tbd',
        meta_count: 4,
        range: 0.93
    },
    {
        name: 'devil_tail',
        meta_count: 5,
        range: 1.0
    }
]

const dresses = [
    {
        name: 'elegant',
        meta_count: 1,
        range: 0.35
    },
    {
        name: 'casual',
        meta_count: 2,
        range: 0.6
    },
    {
        name: 'beach',
        meta_count: 3,
        range: 0.8
    },
    {
        name: 'tbd',
        meta_count: 4,
        range: 0.95
    },
    {
        name: 'supernatural',
        meta_count: 5,
        range: 1.0
    }
]

const extensions = [
    {
        name: 'fairy_wings',
        meta_count: 1,
        range: 0.3
    },
    {
        name: 'angel_devil_wings',
        meta_count: 2,
        range: 0.55
    },
    {
        name: 'devil_tail',
        meta_count: 3,
        range: 0.75
    },
    {
        name: 'nine_fox_tail',
        meta_count: 4,
        range: 0.9
    },
    {
        name: 'cloud_buster_sword',
        meta_count: 5,
        range: 1.0
    }
]

const createShuffle = (currentArray, cycleName) => {
    let entropy = Math.random()
    let cycleResult
    for (let i = 0; i <= currentArray.length; i++) {
        if (entropy <= currentArray[i].range) {
            cycleResult = i + 1
            break
        }
    }
    return cycleResult
}

const generateDNA = () => {
    let rand_body, rand_shoes, rand_eyes, rand_head, rand_mouth, rand_accessories, rand_dress, rand_extensions
    rand_extensions = `1${createShuffle(extensions, 'extensions')}`
    rand_body = `2${createShuffle(bodies, 'body')}`
    rand_mouth = `3${createShuffle(mouths, 'mouths')}`
    rand_eyes = `4${createShuffle(eyes, 'eyes')}`
    rand_head = `5${createShuffle(heads, 'heads')}`
    rand_shoes = `6${createShuffle(shoes, 'accessories')}`
    rand_dress = `7${createShuffle(dresses, 'dresses')}`
    rand_accessories = `8${createShuffle(accessories, 'accessories')}`

    return rand_extensions + rand_body + rand_mouth + rand_eyes + rand_head + rand_shoes + rand_dress + rand_accessories
}

const createBatchEssences = (n) => {
    let newBatch = [...new Array(n)].map(() => generateDNA());
    return newBatch
}

module.exports = { createBatchEssences }
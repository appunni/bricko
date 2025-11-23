export const CONFIG = {
    gridSize: 32,
    unitSize: 10, // 1 stud width
    brickHeight: 12, // Standard brick height
    plateHeight: 4,  // Plate height
    studRadius: 2.4,
    studHeight: 1.6,
    colors: [
        { name: 'Red', hex: 0xC91A09 },
        { name: 'Blue', hex: 0x0055BF },
        { name: 'Yellow', hex: 0xF2CD37 },
        { name: 'Green', hex: 0x237841 },
        { name: 'White', hex: 0xFFFFFF },
        { name: 'Black', hex: 0x05131D },
        { name: 'Orange', hex: 0xFE8A18 },
        { name: 'Lime', hex: 0xBBE90B },
        { name: 'Dark Blue', hex: 0x0A3463 },
        { name: 'Bright Lt Yellow', hex: 0xF8F184 }, // Cool Yellow
        { name: 'Tan', hex: 0xE4CD9E },
        { name: 'Dark Tan', hex: 0x958A73 }
    ],
    bricks: [
        { label: '1x1 Brick', w: 1, d: 1, h: 'brick' },
        { label: '1x2 Brick', w: 1, d: 2, h: 'brick' },
        { label: '1x4 Brick', w: 1, d: 4, h: 'brick' },
        { label: '2x2 Brick', w: 2, d: 2, h: 'brick' },
        { label: '2x3 Brick', w: 2, d: 3, h: 'brick' },
        { label: '2x4 Brick', w: 2, d: 4, h: 'brick' },
        { label: '1x1 Plate', w: 1, d: 1, h: 'plate' },
        { label: '2x2 Plate', w: 2, d: 2, h: 'plate' },
        { label: '2x4 Plate', w: 2, d: 4, h: 'plate' }
    ]
};

export const STATE = {
    color: CONFIG.colors[0].hex,
    brickType: CONFIG.bricks[0],
    bricks: [] // Array of mesh objects
};
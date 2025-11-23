export const CONFIG = {
    gridSize: 32,
    unitSize: 10, // 1 stud width
    brickHeight: 12, // Standard brick height
    plateHeight: 4,  // Plate height
    studRadius: 2.4,
    studHeight: 1.6,
    colors: [
        { name: 'Super Red', hex: 0xFF4757 },
        { name: 'Ocean Blue', hex: 0x1E90FF },
        { name: 'Sunshine Yellow', hex: 0xFFD32A },
        { name: 'Slime Green', hex: 0x2ED573 },
        { name: 'Bubblegum Pink', hex: 0xFF6B81 },
        { name: 'Grape Purple', hex: 0x8E44AD },
        { name: 'Tiger Orange', hex: 0xFFA502 },
        { name: 'Sky Blue', hex: 0x70A1FF },
        { name: 'Snow White', hex: 0xFFFFFF },
        { name: 'Midnight Black', hex: 0x2F3542 },
        { name: 'Chocolate', hex: 0x8D6E63 },
        { name: 'Gold', hex: 0xE1B12C }
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
    bricks: [], // Array of mesh objects
    mode: 'build' // 'build' or 'destroy'
};
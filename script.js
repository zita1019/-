// Matter.js 模块重命名
const { Engine, Render, Runner, Bodies, Composite, Mouse, MouseConstraint, World, Body, Events } = Matter;

// 初始化引擎
const engine = Engine.create();
const world = engine.world;

// 获取画布容器
const container = document.getElementById('canvas-container');
const width = window.innerWidth;
const height = window.innerHeight;

// 创建渲染器
const render = Render.create({
    element: container,
    engine: engine,
    options: {
        width: width,
        height: height,
        wireframes: false, // 设为 false 以显示颜色
        background: 'transparent'
    }
});

Render.run(render);

// 创建运行器
const runner = Runner.create();
Runner.run(runner, engine);

// --- 鼠标交互 (提前初始化以供磁力逻辑使用) ---
const mouse = Mouse.create(render.canvas);
const mouseConstraint = MouseConstraint.create(engine, {
    mouse: mouse,
    constraint: {
        stiffness: 0.1,
        render: { visible: false }
    }
});

Composite.add(world, mouseConstraint);
render.mouse = mouse;

// --- 物理对象创建 ---

// 箱子参数
const boxWidth = 300;
const boxHeight = 250;
const bottomBoxHeight = 350;
const thickness = 15;
const topY = height / 2 - 180;
const bottomY = height / 2 + 220;
const leftX = width / 2 - 200;
const rightX = width / 2 + 200;

// 玻璃墙样式
const glassStyle = {
    fillStyle: 'rgba(255, 255, 255, 0.05)',
    strokeStyle: 'rgba(255, 255, 255, 0.2)',
    lineWidth: 1
};

// 创建箱子的函数
function createBox(x, y, w, h, t) {
    return [
        Bodies.rectangle(x, y + h / 2, w, t, { isStatic: true, render: glassStyle }), // 底
        Bodies.rectangle(x - w / 2, y, t, h, { isStatic: true, render: glassStyle }), // 左
        Bodies.rectangle(x + w / 2, y, t, h, { isStatic: true, render: glassStyle }), // 右
    ];
}

// 创建 4 个箱子
const boxes = [
    ...createBox(leftX, topY, boxWidth, boxHeight, thickness),   // 上左
    ...createBox(rightX, topY, boxWidth, boxHeight, thickness),  // 上右
    ...createBox(leftX, bottomY, boxWidth, bottomBoxHeight, thickness), // 下左
    ...createBox(rightX, bottomY, boxWidth, bottomBoxHeight, thickness) // 下右
];

// 边界
const ground = Bodies.rectangle(width / 2, height + 50, width, 100, { isStatic: true });
const ceil = Bodies.rectangle(width / 2, -50, width, 100, { isStatic: true });
const leftWall = Bodies.rectangle(-50, height / 2, 100, height, { isStatic: true });
const rightWall = Bodies.rectangle(width + 50, height / 2, 100, height, { isStatic: true });

Composite.add(world, [...boxes, ground, ceil, leftWall, rightWall]);

// --- 创建球体 ---

const ballRadius = 14;
const ballOptions = { restitution: 0.5, friction: 0.1, density: 0.001 };

function spawnBalls(x, y, w, h, count, color, stroke) {
    for (let i = 0; i < count; i++) {
        const ball = Bodies.circle(
            x + (Math.random() - 0.5) * (w - 40),
            y - h / 2 + Math.random() * h,
            ballRadius,
            {
                ...ballOptions,
                render: { fillStyle: color, strokeStyle: stroke, lineWidth: 2 }
            }
        );
        Composite.add(world, ball);
    }
}

// 上排：9红，9蓝
spawnBalls(leftX, topY, boxWidth, boxHeight, 9, '#ef4444', '#991b1b');
spawnBalls(rightX, topY, boxWidth, boxHeight, 9, '#3b82f6', '#1e40af');

// 下排：80红，80蓝
spawnBalls(leftX, bottomY, boxWidth, bottomBoxHeight, 80, '#ef4444', '#991b1b');
spawnBalls(rightX, bottomY, boxWidth, bottomBoxHeight, 80, '#3b82f6', '#1e40af');

// (已移至顶部)

// --- 响应式调整 ---

window.addEventListener('resize', () => {
    const newWidth = window.innerWidth;
    const newHeight = window.innerHeight;

    render.canvas.width = newWidth;
    render.canvas.height = newHeight;
    render.options.width = newWidth;
    render.options.height = newHeight;

    // 这里如果需要完美适配屏幕尺寸变化，通常需要重新计算所有 Bodies 的位置
    // 但为了演示简单，我们主要保证渲染区域更新
});

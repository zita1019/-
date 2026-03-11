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
});

// --- 思路提醒逻辑 ---

const tipsData = [
    "（1）上面的任务是和概率有关的，但下面这个新任务还受概率影响吗？",
    "（2）如果把左右两个盒子看成一个大系统，左边的盒子和右边的盒子分别看成两个小系统，大系统中球的数量有变化吗？小系统中球的数量有变化吗？",
    "（3）接着思考，如果大系统、小系统中的球总数都没有变化，而左边的盒子混入了x个右边的球，那么，右边的盒子混入了几个左边的球呢？"
];

let currentTipIndex = 0;
const addTipBtn = document.getElementById('add-tip-btn');
const tipsList = document.getElementById('tips-list');
const toggleTipsBtn = document.getElementById('toggle-tips-btn');
const tipsWidget = document.getElementById('tips-widget');

// 切换收起/展开
toggleTipsBtn.addEventListener('click', () => {
    tipsWidget.classList.toggle('collapsed');
    // 如果是展开状态显示减号，收起状态显示加号（或者箭头）
    if (tipsWidget.classList.contains('collapsed')) {
        toggleTipsBtn.textContent = '+';
    } else {
        toggleTipsBtn.textContent = '−';
    }
});

addTipBtn.addEventListener('click', () => {
    if (currentTipIndex < tipsData.length) {
        const tipText = tipsData[currentTipIndex];

        // 创建新提示元素
        const tipElement = document.createElement('div');
        tipElement.className = 'tip-item';
        tipElement.textContent = tipText;

        // 将新提示插入到列表顶部 (序号大的排在序号小的前面)
        if (tipsList.firstChild) {
            tipsList.insertBefore(tipElement, tipsList.firstChild);
        } else {
            tipsList.appendChild(tipElement);
        }

        currentTipIndex++;

        // 如果所有提示都显示了，可以禁用按钮或改变样式
        if (currentTipIndex >= tipsData.length) {
            addTipBtn.style.opacity = '0.5';
            addTipBtn.style.cursor = 'default';
        }
    }
});

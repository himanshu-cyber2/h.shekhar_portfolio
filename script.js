const container = document.getElementById('canvas-container');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight); 
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
container.appendChild(renderer.domElement);

const grid = new THREE.GridHelper(100, 50, 0x00d4ff, 0x0a0a15); 
grid.position.y = -12; 
grid.material.opacity = 0.15; 
grid.material.transparent = true; 
scene.add(grid);

const shardGroup = new THREE.Group(); 
scene.add(shardGroup);
for(let i=0; i<40; i++) {
    const shard = new THREE.Mesh(
        new THREE.IcosahedronGeometry(Math.random()*1.5, 0), 
        new THREE.MeshBasicMaterial({ color: 0x00d4ff, wireframe: true, transparent: true, opacity: 0.1 })
    );
    shard.position.set((Math.random()-0.5)*80, (Math.random()-0.5)*60, (Math.random()-0.5)*60);
    shardGroup.add(shard);
}

const prism = new THREE.Mesh(
    new THREE.OctahedronGeometry(6, 0), 
    new THREE.MeshPhongMaterial({ color: 0x00d4ff, emissive: 0x00d4ff, emissiveIntensity: 0.1, wireframe: true, transparent: true, opacity: 0.3 })
); 
scene.add(prism);

const light = new THREE.PointLight(0x00d4ff, 2, 80); 
light.position.set(20, 20, 20); 
scene.add(light);
scene.add(new THREE.AmbientLight(0x101015)); 
camera.position.z = 45;

// --- EXPENSE TRACKER LOGIC ---
let etState = { expenses: [], budgets: {}, charts: { all: null, monthly: null } };

function initExpenseTracker() {
    const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const mSel = document.getElementById('et-budget-month');
    if (mSel) {
        MONTHS.forEach((m, i) => mSel.add(new Option(m, i + 1)));
        mSel.value = new Date().getMonth() + 1;
    }
    
    const etForm = document.getElementById('et-form');
    if (etForm) {
        etForm.onsubmit = (e) => {
            e.preventDefault();
            const exp = { 
                id: Date.now(), 
                description: document.getElementById('et-desc').value, 
                amount: parseFloat(document.getElementById('et-amount').value), 
                category: document.getElementById('et-cat').value, 
                date: new Date() 
            };
            etState.expenses.unshift(exp); 
            etForm.reset(); 
            refreshET();
        };
    }

    const budgetForm = document.getElementById('et-budget-form');
    if (budgetForm) {
        budgetForm.onsubmit = (e) => {
            e.preventDefault();
            etState.budgets[`${document.getElementById('et-budget-year').value}-${document.getElementById('et-budget-month').value}`] = parseFloat(document.getElementById('et-budget-amt').value);
            refreshET();
        };
    }
    refreshET();
}

function refreshET() {
    const list = document.getElementById('et-list');
    if (!list) return;
    list.innerHTML = etState.expenses.length ? '' : '<p class="text-center text-gray-400 py-10 text-sm">No transactions found.</p>';
    etState.expenses.forEach(e => {
        const div = document.createElement('div'); 
        div.className = "flex justify-between items-center p-3 bg-white rounded-lg border border-gray-100 mb-2 shadow-sm";
        div.innerHTML = `
            <div class="flex-1">
                <div class="font-bold text-sm text-gray-800">${e.description}</div>
                <div class="text-[10px] text-gray-500 uppercase font-bold">${e.category}</div>
            </div>
            <div class="text-right">
                <div class="font-black text-indigo-600">$${e.amount.toFixed(2)}</div>
                <button onclick="deleteET(${e.id})" class="text-[10px] text-red-400 hover:text-red-600 font-bold">REMOVE</button>
            </div>`;
        list.appendChild(div);
    });
    renderETCharts();
}

window.deleteET = (id) => { 
    etState.expenses = etState.expenses.filter(e => e.id !== id); 
    refreshET(); 
};

function renderETCharts() {
    const summary = etState.expenses.reduce((acc, e) => { acc[e.category] = (acc[e.category] || 0) + e.amount; return acc; }, {});
    const labels = Object.keys(summary); 
    const data = Object.values(summary);
    const emptyHint = document.getElementById('et-chart-empty');
    
    if (labels.length === 0) { 
        emptyHint?.classList.remove('hidden'); 
        if (etState.charts.all) etState.charts.all.destroy(); 
        return; 
    }
    emptyHint?.classList.add('hidden');
    const ctxAll = document.getElementById('et-chart-all')?.getContext('2d');
    if (ctxAll) {
        if (etState.charts.all) etState.charts.all.destroy();
        etState.charts.all = new Chart(ctxAll, { 
            type: 'doughnut', 
            data: { labels, datasets: [{ data, backgroundColor: ['#4f46e5', '#34d399', '#f59e0b', '#ef4444', '#6366f1'] }] }, 
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } } 
        });
    }
}

// --- ROCK PAPER SCISSORS LOGIC ---
let rpsUserScore = 0;
let rpsCompScore = 0;

function initRPS() {
    const choices = document.querySelectorAll(".choice");
    const msg = document.querySelector("#msg");
    const userScorePara = document.querySelector("#user-Score");
    const compScorePara = document.querySelector("#comp-Score");
    
    const genCompChoice = () => { 
        const options = ["rock", "paper", "scissor"]; 
        return options[Math.floor(Math.random() * 3)]; 
    };

    const drawGame = () => { 
        if (msg) {
            msg.innerText = "Match sequence draw. No data modified."; 
            msg.style.color = "#94A3B8";
        }
    };

    const showWinner = (userWin, userChoice, compChoice) => {
        if (userWin) { 
            rpsUserScore++; 
            if (userScorePara) userScorePara.innerText = rpsUserScore; 
            if (msg) {
                msg.innerText = `Access Granted: ${userChoice} overrides ${compChoice}`; 
                msg.style.color = "var(--success-ice)"; 
            }
        } else { 
            rpsCompScore++; 
            if (compScorePara) compScorePara.innerText = rpsCompScore; 
            if (msg) {
                msg.innerText = `Access Denied: ${compChoice} neutralized ${userChoice}`; 
                msg.style.color = "var(--error-ice)"; 
            }
        }
    };

    const playGame = (userChoice) => {
        const compChoice = genCompChoice();
        if (userChoice === compChoice) drawGame();
        else {
            let userWin = true;
            if (userChoice === "rock") userWin = compChoice === "paper" ? false : true;
            else if (userChoice === "paper") userWin = compChoice === "scissor" ? false : true;
            else userWin = compChoice === "rock" ? false : true;
            showWinner(userWin, userChoice, compChoice);
        }
    };

    choices.forEach((choice) => { 
        choice.addEventListener("click", () => { 
            const userChoice = choice.getAttribute("id"); 
            if(userChoice) playGame(userChoice); 
        }); 
    });
}

// --- AIRA THE TYPO LOGIC ---
function initTypoGame() {
    const paraBanks = {
        easy: ['The sun shines bright in the sky. Birds sing in the trees.', 'I like to read books at home. My cat sits on my lap.'],
        medium: ['Technology continues to transform our daily lives in remarkable ways.', 'Education opens doors to endless opportunities and personal growth.'],
        hard: ['The hard problem of consciousness questions how physical processes give rise to awareness.', 'Quantum mechanics fundamentally challenged classical physics paradigms.']
    };
    
    const diffEl = document.getElementById('diff-sel-typo');
    const durEl = document.getElementById('dur-sel-typo');
    
    let typoState = { 
        timer: null, 
        start: null, 
        diff: diffEl?.value || 'medium', 
        dur: parseInt(durEl?.value || 30), 
        cWords: 0, 
        cStreak: 0, 
        tKey: 0, 
        cKey: 0, 
        synth: window.speechSynthesis 
    };

    const c = document.getElementById('words-box-typo'); 
    if(!c) return;
    c.innerHTML = '';
    const txt = paraBanks[typoState.diff][Math.floor(Math.random() * paraBanks[typoState.diff].length)];
    txt.split(' ').forEach(w => {
        let d = document.createElement('div'); d.className = 'word-item';
        w.split('').forEach(l => { 
            let s = document.createElement('span'); s.className = 'letter-item'; s.textContent = l; d.appendChild(s); 
        });
        c.appendChild(d);
    });

    const fW = c.querySelector('.word-item'); 
    const fL = fW?.querySelector('.letter-item');
    if(fW) fW.classList.add('current'); 
    if(fL) fL.classList.add('current');
    
    document.getElementById('over-modal-aira-typo')?.classList.remove('active');
    const wpmStat = document.getElementById('stat-wpm-typo');
    const timeStat = document.getElementById('stat-time-typo');
    if(wpmStat) wpmStat.innerText = '0';
    if(timeStat) timeStat.innerText = typoState.dur + 's';
}

// --- GSAP & INTERACTION ---
gsap.registerPlugin(ScrollTrigger);

// Hero Reveal
gsap.to("#hero-content", { opacity: 1, y: -40, duration: 2 });

// Section Reveals
document.querySelectorAll('.reveal').forEach(el => {
    gsap.fromTo(el, { opacity: 0, y: 100 }, { 
        opacity: 1, y: 0, duration: 1.5, scrollTrigger: { trigger: el, start: "top 90%" } 
    });
});

let mX = 0, mY = 0;
document.addEventListener('mousemove', (e) => {
    mX = (e.clientX / window.innerWidth - 0.5) * 300; 
    mY = (e.clientY / window.innerHeight - 0.5) * 300;
    
    document.querySelectorAll('.tilt-card').forEach(card => {
        const r = card.getBoundingClientRect(); 
        const x = (e.clientX - r.left) / r.width - 0.5; 
        const y = (e.clientY - r.top) / r.height - 0.5;
        gsap.to(card, { rotationY: x * 10, rotationX: -y * 10, duration: 0.5 });
    });
});

function animate() {
    requestAnimationFrame(animate); 
    const t = Date.now() * 0.0005;
    grid.rotation.y = t * 0.05; 
    prism.rotation.y += 0.005; 
    prism.position.y = Math.sin(t * 2) * 2;
    shardGroup.children.forEach((s, i) => { 
        s.rotation.x += 0.001; 
        s.position.y += Math.sin(t + i) * 0.01; 
    });
    camera.position.x += (mX/100 - camera.position.x) * 0.05; 
    camera.position.y += (-mY/100 - camera.position.y) * 0.04;
    camera.lookAt(scene.position); 
    renderer.render(scene, camera);
}

// Responsive Handling
window.addEventListener('resize', () => { 
    camera.aspect = window.innerWidth / window.innerHeight; 
    camera.updateProjectionMatrix(); 
    renderer.setSize(window.innerWidth, window.innerHeight); 
});

// Initialization on Load
window.onload = () => { 
    animate();
    initTypoGame(); 
    initExpenseTracker(); 
    initRPS(); 
};
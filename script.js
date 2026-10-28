// Keadaan (State) Kalkulator
let currentExpression = '';
let isDegreeMode = true;
let memoryValue = 0;
let is2ndActive = false;
let isCalculated = false;

// Elemen UI
const mainDisplay = document.getElementById('main-display');
const equationDisplay = document.getElementById('equation-display');
const angleModeDisplay = document.getElementById('angle-mode-display');
const memoryIndicator = document.getElementById('memory-indicator');
const historyList = document.getElementById('history-list');

// Kawalan Papan Kekunci
window.addEventListener('keydown', (e) => {
    if (e.key >= '0' && e.key <= '9') inputNum(e.key);
    else if (e.key === '.') inputDot();
    else if (e.key === '+') inputOperator('+');
    else if (e.key === '-') inputOperator('-');
    else if (e.key === '*') inputOperator('×');
    else if (e.key === '/') inputOperator('÷');
    else if (e.key === '^') inputOperator('^');
    else if (e.key === '(') inputSymbol('(');
    else if (e.key === ')') inputSymbol(')');
    else if (e.key === 'Enter' || e.key === '=') { e.preventDefault(); calculate(); }
    else if (e.key === 'Backspace') deleteLast();
    else if (e.key === 'Escape') clearAll();
});

function updateDisplay() {
    mainDisplay.value = currentExpression || '0';
}

function inputNum(num) {
    if (isCalculated) {
        currentExpression = '';
        isCalculated = false;
    }
    currentExpression += num;
    updateDisplay();
}

function inputDot() {
    if (isCalculated) {
        currentExpression = '0';
        isCalculated = false;
    }
    const lastNum = currentExpression.split(/[\+\−\×\÷\^]/).pop();
    if (!lastNum.includes('.')) {
        currentExpression += currentExpression === '' ? '0.' : '.';
        updateDisplay();
    }
}

function inputOperator(op) {
    isCalculated = false;
    if (currentExpression === '' && op === '-') {
        currentExpression = '-';
        updateDisplay();
        return;
    }
    if (currentExpression === '') return;

    const lastChar = currentExpression.slice(-1);
    if (['+', '-', '×', '÷', '^'].includes(lastChar)) {
        currentExpression = currentExpression.slice(0, -1) + op;
    } else {
        currentExpression += op;
    }
    updateDisplay();
}

function inputSymbol(sym) {
    if (isCalculated) {
        currentExpression = '';
        isCalculated = false;
    }
    currentExpression += sym;
    updateDisplay();
}

function inputConst(c) {
    if (isCalculated) {
        currentExpression = '';
        isCalculated = false;
    }
    currentExpression += c;
    updateDisplay();
}

function inputFunc(funcName) {
    if (isCalculated) isCalculated = false;
    currentExpression += funcName + '(';
    updateDisplay();
}

function clearAll() {
    currentExpression = '';
    equationDisplay.textContent = '';
    updateDisplay();
}

function deleteLast() {
    if (isCalculated) {
        clearAll();
        return;
    }
    currentExpression = currentExpression.slice(0, -1);
    updateDisplay();
}

function toggleAngleMode() {
    isDegreeMode = !isDegreeMode;
    const btn = document.getElementById('btn-deg-rad');
    btn.textContent = isDegreeMode ? 'DEG' : 'RAD';
    angleModeDisplay.textContent = isDegreeMode ? 'DEG' : 'RAD';
}

function toggle2nd() {
    is2ndActive = !is2ndActive;
    const fn1st = document.querySelectorAll('.fn-1st');
    const fn2nd = document.querySelectorAll('.fn-2nd');

    fn1st.forEach(e => e.classList.toggle('hidden', is2ndActive));
    fn2nd.forEach(e => e.classList.toggle('hidden', !is2ndActive));
}

function factorial(n) {
    if (n < 0) return NaN;
    if (n === 0 || n === 1) return 1;
    let result = 1;
    for (let i = 2; i <= n; i++) result *= i;
    return result;
}

function calculate() {
    if (!currentExpression) return;

    let rawExpression = currentExpression;
    equationDisplay.textContent = rawExpression + ' =';

    try {
        let parsed = rawExpression
            .replace(/×/g, '*')
            .replace(/÷/g, '/')
            .replace(/π/g, 'Math.PI')
            .replace(/e/g, 'Math.E');

        const toRad = (val) => isDegreeMode ? (val * Math.PI) / 180 : val;
        const fromRad = (val) => isDegreeMode ? (val * 180) / Math.PI : val;

        parsed = parsed.replace(/sin\(([^)]+)\)/g, (_, arg) => `Math.sin(${toRad(eval(arg))})`);
        parsed = parsed.replace(/cos\(([^)]+)\)/g, (_, arg) => `Math.cos(${toRad(eval(arg))})`);
        parsed = parsed.replace(/tan\(([^)]+)\)/g, (_, arg) => `Math.tan(${toRad(eval(arg))})`);

        parsed = parsed.replace(/asin\(([^)]+)\)/g, (_, arg) => `${fromRad(Math.asin(eval(arg)))}`);
        parsed = parsed.replace(/acos\(([^)]+)\)/g, (_, arg) => `${fromRad(Math.acos(eval(arg)))}`);
        parsed = parsed.replace(/atan\(([^)]+)\)/g, (_, arg) => `${fromRad(Math.atan(eval(arg)))}`);

        parsed = parsed.replace(/log\(([^)]+)\)/g, (_, arg) => `Math.log10(${arg})`);
        parsed = parsed.replace(/ln\(([^)]+)\)/g, (_, arg) => `Math.log(${arg})`);
        parsed = parsed.replace(/sqrt\(([^)]+)\)/g, (_, arg) => `Math.sqrt(${arg})`);
        parsed = parsed.replace(/sqr\(([^)]+)\)/g, (_, arg) => `Math.pow(${arg}, 2)`);
        parsed = parsed.replace(/fact\(([^)]+)\)/g, (_, arg) => `factorial(${eval(arg)})`);

        parsed = parsed.replace(/([0-9.]+|\([^\)]+\))\^([0-9.]+|\([^\)]+\))/g, 'Math.pow($1,$2)');

        let result = eval(parsed);

        if (typeof result === 'number' && !Number.isInteger(result)) {
            result = parseFloat(result.toFixed(10));
        }

        if (isNaN(result) || !isFinite(result)) {
            mainDisplay.value = 'Ralat';
        } else {
            addToHistory(rawExpression, result);
            currentExpression = result.toString();
            updateDisplay();
            isCalculated = true;
        }

    } catch (err) {
        mainDisplay.value = 'Ralat Input';
        isCalculated = true;
    }
}

function memoryClear() {
    memoryValue = 0;
    memoryIndicator.classList.add('hidden');
}

function memoryRecall() {
    currentExpression += memoryValue.toString();
    updateDisplay();
}

function memoryAdd() {
    try {
        let val = eval(mainDisplay.value);
        if (!isNaN(val)) {
            memoryValue += val;
            memoryIndicator.classList.remove('hidden');
        }
    } catch (e) {}
}

function memorySubtract() {
    try {
        let val = eval(mainDisplay.value);
        if (!isNaN(val)) {
            memoryValue -= val;
            memoryIndicator.classList.remove('hidden');
        }
    } catch (e) {}
}

function addToHistory(expr, result) {
    const emptyMsg = document.getElementById('empty-history-msg');
    if (emptyMsg) emptyMsg.remove();

    const item = document.createElement('div');
    item.style.cssText = "background: rgba(30,41,59,0.5); padding: 0.5rem; border-radius: 0.5rem; text-align: right; font-size: 0.875rem; cursor: pointer;";
    item.onclick = () => {
        currentExpression = result.toString();
        updateDisplay();
    };

    item.innerHTML = `
        <div style="color: #94a3b8; font-size: 0.75rem;">${expr}</div>
        <div style="color: #f8fafc; font-weight: bold; font-family: monospace;">= ${result}</div>
    `;

    historyList.prepend(item);
}

function clearHistory() {
    historyList.innerHTML = `<div class="empty-msg" id="empty-history-msg">Tiada rekod pengiraan lagi.</div>`;
}
// ============================================================================
// 1. ตัวแปรและข้อมูลเริ่มต้น (State & Database)
// ============================================================================
let isAdmin = false;
let showAllHistory = false;
let typingTimer;
const DEBOUNCE_DELAY = 800;
let currentSelectedUnit = "หน่วย";

// โหลดประวัติรายการและฐานข้อมูลสินค้าจาก LocalStorage
let farmData = JSON.parse(localStorage.getItem('farmData')) || [];
let farmDataStorage = JSON.parse(localStorage.getItem('farmDataStorage')) || {
    "pets-group": [{name: "🐔 ไก่ไข่", price: 230, marketPrice: 240, unit: "ตัว"}, {name: "🐟 ปลานิล", price: 5, marketPrice: 8, unit: "ตัว"}],
    "plants-group": [{name: "🌿 มะกรูด", price: 20, marketPrice: 20, unit: "ลูก"}, {name: "🍄 เห็ด", price: 12, marketPrice: 15, unit: "กก."}, {name: "🌿 ชะอม", price: 20, marketPrice: 20, unit: "กำ"}],
    "consumable-group": [{name: "🛢️ ปั๊มน้ำ 2 แรง", price: 2590, marketPrice: 2590, unit: "ตัว"}]
};

let groupTitles = JSON.parse(localStorage.getItem('groupTitles')) || {
    "pets-group": "สัตว์เลี้ยง",
    "plants-group": "พืชสวน",
    "consumable-group": "วัสดุสิ้นเปลือง"
};

// ฐานข้อมูลราคากลางและอีโมจิอัตโนมัติ
const smartMarketData = {
    "มะกรูด": { price: 20, marketPrice: 20, group: "plants-group", emoji: "🌿", unit: "ลูก" },
    "มะนาว": { price: 3, marketPrice: 4, group: "plants-group", emoji: "🍋", unit: "ลูก" },
    "มะละกอ": { price: 20, marketPrice: 25, group: "plants-group", emoji: "🥭", unit: "ลูก" },
    "ทุเรียน": { price: 150, marketPrice: 180, group: "plants-group", emoji: "🌳", unit: "กก." },
    "เห็ด": { price: 12, marketPrice: 15, group: "plants-group", emoji: "🍄", unit: "กก." },
    "ชะอม": { price: 20, marketPrice: 20, group: "plants-group", emoji: "🌿", unit: "กำ" },
    "ไก่": { price: 230, marketPrice: 240, group: "pets-group", emoji: "🐔", unit: "ตัว" },
    "ปลา": { price: 5, marketPrice: 8, group: "pets-group", emoji: "🐟", unit: "ตัว" },
    "ไข่": { price: 120, marketPrice: 130, group: "pets-group", emoji: "🥚", unit: "แผง" },
    "อาหาร": { price: 450, marketPrice: 460, group: "consumable-group", emoji: "🌾", unit: "กระสอบ" },
    "น้ำมัน": { price: 32, marketPrice: 33, group: "consumable-group", emoji: "🛢️", unit: "ถุง" },
    "สายไฟ": { price: 650, marketPrice: 680, group: "consumable-group", emoji: "⚡", unit: "ม้วน" },
    "ปั๊มน้ำ": { price: 2590, marketPrice: 2590, group: "consumable-group", emoji: "⚙️", unit: "ตัว" },
    "มาม่า": { price: 7, marketPrice: 7, group: "consumable-group", emoji: "🍜", unit: "ซอง" }
};

// ฐานข้อมูลเกร็ดความรู้
const knowledgeBase = {
    "มะกรูด": {
        title: "🌿 การปลูกและดูแลมะกรูด",
        info: "มะกรูดชอบดินร่วนซุย ระบายน้ำได้ดี ควรตัดแต่งกิ่งเพื่อให้ทรงพุ่มโปร่งและแตกใบใหม่ได้ดี"
    },
    "ไก่ไข่": {
        title: "🐔 การเลี้ยงไก่ไข่",
        info: "ควรให้อาหารโปรตีน 16-18% เพื่อการเจริญเติบโต และเสริมแคลเซียมเพื่อสร้างเปลือกไข่ให้แข็งแรง"
    },
    "ปลานิล": {
        title: "🐟 การเลี้ยงปลานิล",
        info: "ควบคุมคุณภาพน้ำ pH 6.5-8.5 ให้อาหารเช้า-เย็นอย่างเป็นเวลา"
    }
};

// ============================================================================
// 2. ระบบเข้าสู่ระบบ & สมัครสมาชิก (Authentication)
// ============================================================================
window.onload = () => {
    // กำหนดให้แสดงหน้า Login ตอนเปิดแอป
    document.getElementById("auth-wrapper").style.display = "block";
    document.getElementById("app-page").style.display = "none";
};

function switchAuthMode(mode) {
    const loginPage = document.getElementById("login-page");
    const registerPage = document.getElementById("register-page");
    
    if (mode === 'register') {
        loginPage.style.display = "none";
        registerPage.style.display = "flex";
    } else {
        registerPage.style.display = "none";
        loginPage.style.display = "flex";
    }
}

function register() {
    const name = document.getElementById("regNameInput").value.trim();
    const pass = document.getElementById("regPassInput").value;
    const confirmPass = document.getElementById("regConfirmPassInput").value;

    if (!name || !pass) return alert("กรุณากรอกชื่อผู้ใช้งานและรหัสผ่านให้ครบถ้วน");
    if (pass !== confirmPass) return alert("รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน!");

    localStorage.setItem('farmUser', JSON.stringify({ name, pass }));
    alert("สมัครสมาชิกสำเร็จ! กรุณาเข้าสู่ระบบด้วยบัญชีของคุณ");
    
    document.getElementById("regNameInput").value = "";
    document.getElementById("regPassInput").value = "";
    document.getElementById("regConfirmPassInput").value = "";
    switchAuthMode('login');
}

function login() {
    const nameInput = document.getElementById("loginNameInput").value.trim();
    const passInput = document.getElementById("loginPassInput").value;
    const savedUser = JSON.parse(localStorage.getItem('farmUser'));

    const isValidRegisteredUser = savedUser && savedUser.name === nameInput && savedUser.pass === passInput;
    const isDefaultAdmin = passInput === "1234";

    if (isValidRegisteredUser || isDefaultAdmin) {
        isAdmin = true;
        document.getElementById("auth-wrapper").style.display = "none";
        document.getElementById("app-page").style.display = "block";
        
        const displayName = isValidRegisteredUser ? savedUser.name : (nameInput || "ผู้ดูแลระบบ");
        document.getElementById("displayName").innerText = displayName;
        initApp();
    } else {
        alert("ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง!");
    }
}

function logout() { 
    location.reload(); 
}

// ============================================================================
// 3. ระบบหลัก & UI (App Initialization & Rendering)
// ============================================================================
function initApp() {
    const expenseDateEl = document.getElementById('expenseDate');
    if (expenseDateEl) expenseDateEl.valueAsDate = new Date();
    
    renderGroupContainers();
    renderButtons();
    updateGroupSelectOptions();
    updateTable();
}

function renderGroupContainers() {
    const container = document.getElementById("groups-container");
    if (!container) return;
    container.innerHTML = "";

    for (let groupId in farmDataStorage) {
        const title = groupTitles[groupId] || groupId.replace('-group', '');
        const groupHtml = `
            <h4 class="group-title">${title}</h4>
            <div id="${groupId}" class="btn-group"></div>
        `;
        container.insertAdjacentHTML('beforeend', groupHtml);
    }
}

function renderButtons(filter = "") {
    for (let groupId in farmDataStorage) {
        let container = document.getElementById(groupId);
        if (!container) continue;
        container.innerHTML = "";

        farmDataStorage[groupId].forEach((item, index) => {
            if (item.name.toLowerCase().includes(filter.toLowerCase())) {
                const btn = document.createElement("button");
                btn.innerText = item.name;
                
                btn.onclick = () => {
                    const itemUnit = item.unit || "หน่วย";
                    currentSelectedUnit = itemUnit;

                    document.getElementById("expenseDetail").value = item.name;
                    document.getElementById("unitPrice").value = item.price;
                    document.getElementById("unitQuantity").value = 1;
                    
                    displayPriceComparison(item.name, item.price, item.marketPrice || item.price, itemUnit);
                    updateUnitLabels(itemUnit);
                    calculateTotal();
                    fetchKnowledgeData(item.name.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '').trim(), item.name);
                    
                    document.querySelector('.account-panel').scrollIntoView({ behavior: 'smooth' });
                };
                
                btn.oncontextmenu = (e) => {
                    e.preventDefault();
                    if (confirm(`คุณต้องการลบ "${item.name}" ใช่หรือไม่?`)) {
                        farmDataStorage[groupId].splice(index, 1);
                        localStorage.setItem('farmDataStorage', JSON.stringify(farmDataStorage));
                        renderButtons(filter);
                    }
                };
                container.appendChild(btn);
            }
        });
    }
}

function filterButtons(query) { 
    renderButtons(query); 
}

// ============================================================================
// 4. ระบบเพิ่มรายการใหม่ & จัดการกลุ่ม (Item Management)
// ============================================================================
function updateGroupSelectOptions() {
    const select = document.getElementById("groupSelect");
    if (!select) return;
    select.innerHTML = "";
    
    for (let groupId in farmDataStorage) {
        const title = groupTitles[groupId] || groupId.replace('-group', '');
        const option = document.createElement("option");
        option.value = groupId;
        option.innerText = `กลุ่ม: ${title}`;
        select.appendChild(option);
    }
    
    const newOpt = document.createElement("option");
    newOpt.value = "new";
    newOpt.innerText = "-- สร้างกลุ่มใหม่ --";
    select.appendChild(newOpt);
}

function toggleNewGroupInput(val) { 
    const groupNameEl = document.getElementById('newGroupName');
    if (groupNameEl) groupNameEl.style.display = (val === 'new') ? 'block' : 'none'; 
}

function toggleCustomUnitInput(val) {
    const customInput = document.getElementById("customUnitName");
    if (customInput) customInput.style.display = (val === 'custom') ? 'block' : 'none';
}

function addNewButton() {
    const rawName = document.getElementById("newItemName").value.trim();
    const price = parseFloat(document.getElementById("newItemPrice").value) || 0;
    const marketPrice = parseFloat(document.getElementById("newItemMarketPrice").value) || price;
    let unitVal = document.getElementById("newItemUnit").value;
    let groupVal = document.getElementById("groupSelect").value;

    if (unitVal === "custom") {
        unitVal = document.getElementById("customUnitName").value.trim() || "หน่วย";
    }

    if (!rawName) return alert("กรุณากรอกชื่อรายการ");

    const name = getSmartEmoji(rawName);

    if (groupVal === "new") {
        const customName = document.getElementById("newGroupName").value.trim();
        if (!customName) return alert("กรุณาตั้งชื่อกลุ่มใหม่");
        
        groupVal = "group-" + Date.now();
        groupTitles[groupVal] = customName;
        localStorage.setItem('groupTitles', JSON.stringify(groupTitles));
        farmDataStorage[groupVal] = [];
    }

    if(!farmDataStorage[groupVal]) farmDataStorage[groupVal] = [];
    farmDataStorage[groupVal].push({ name, price, marketPrice, unit: unitVal });
    localStorage.setItem('farmDataStorage', JSON.stringify(farmDataStorage));
    
    renderGroupContainers();
    renderButtons();
    updateGroupSelectOptions();
    
    document.getElementById("newItemName").value = "";
    document.getElementById("newItemPrice").value = "";
    document.getElementById("newItemMarketPrice").value = "";
    document.getElementById("customUnitName").value = "";
    document.getElementById("customUnitName").style.display = "none";
    document.getElementById("newGroupName").value = "";
    document.getElementById("newGroupName").style.display = "none";
}

// ============================================================================
// 5. ระบบบัญชี ประวัติ และการคำนวณ (Accounting & Calculation)
// ============================================================================
function addEntry(type) {
    const dateInput = document.getElementById("expenseDate").value;
    const detail = document.getElementById("expenseDetail").value.trim();
    const qty = parseFloat(document.getElementById("unitQuantity").value) || 1;
    const total = parseFloat(document.getElementById("displayTotal").innerText.replace(/,/g, '')) || 0;
    
    if (!dateInput || !detail || total === 0) return alert("กรุณากรอกข้อมูลและราคาให้ครบถ้วน");
    
    const parts = dateInput.split('-');
    const formattedDate = `${parts[2]}/${parts[1]}/${parts[0]}`;
    const detailWithUnit = `${detail} (${qty} ${currentSelectedUnit})`;

    farmData.push({ date: formattedDate, type, detail: detailWithUnit, total });
    localStorage.setItem('farmData', JSON.stringify(farmData));
    updateTable();
    
    document.getElementById("expenseDetail").value = "";
    document.getElementById("unitPrice").value = "";
    document.getElementById("unitQuantity").value = "1";
    document.getElementById("displayTotal").innerText = "0";
    const compareBox = document.getElementById("priceCompareBox");
    if (compareBox) compareBox.style.display = "none";
    updateUnitLabels("หน่วย");
}

function updateTable() {
    const historyBody = document.getElementById("historyBody");
    if (!historyBody) return;
    
    let reversedData = farmData.map((item, index) => ({ ...item, originalIndex: index })).reverse();
    const displayData = showAllHistory ? reversedData : reversedData.slice(0, 5);
    const historyCountText = document.getElementById("historyCountText");
    if (historyCountText) historyCountText.innerText = showAllHistory ? `ทั้งหมด ${reversedData.length} รายการ` : `5 รายการ`;

    historyBody.innerHTML = displayData.map((obj) => `
        <tr>
            <td style="color: #94a3b8; font-size: 13px;">${obj.date}</td>
            <td style="text-align: left;">
                ${obj.detail}<br>
                <span style="font-size: 11px; color: ${obj.type === 'รายรับ' ? '#10b981' : '#ef4444'}; font-weight: bold;">
                    ${obj.type}
                </span>
            </td>
            <td style="font-weight: bold; color: ${obj.type === 'รายรับ' ? '#10b981' : '#ef4444'};">
                ${obj.total.toLocaleString()}
            </td>
            <td><button onclick="deleteRecord(${obj.originalIndex})" class="danger-btn" style="padding: 4px 8px; font-size: 12px; border-radius: 4px;">✖</button></td>
        </tr>
    `).join('');

    let totalIncome = 0;
    let totalExpense = 0;

    farmData.forEach(item => {
        const amount = parseFloat(item.total) || 0;
        if (item.type === 'รายรับ') totalIncome += amount;
        else if (item.type === 'รายจ่าย') totalExpense += amount;
    });

    if (document.getElementById("totalIncome")) document.getElementById("totalIncome").innerText = totalIncome.toLocaleString();
    if (document.getElementById("totalExpense")) document.getElementById("totalExpense").innerText = totalExpense.toLocaleString();
    if (document.getElementById("netBalance")) document.getElementById("netBalance").innerText = (totalIncome - totalExpense).toLocaleString();
}

function toggleHistoryLimit() {
    showAllHistory = !showAllHistory;
    const btn = document.getElementById("toggleHistoryBtn");
    if (btn) btn.innerText = showAllHistory ? "ย่อประวัติ 📝" : "ดูประวัติทั้งหมด 📝";
    updateTable();
}

function deleteRecord(index) { 
    if (confirm("ต้องการลบรายการนี้ใช่หรือไม่?")) {
        farmData.splice(index, 1); 
        localStorage.setItem('farmData', JSON.stringify(farmData)); 
        updateTable(); 
    }
}

function calculateTotal() { 
    const p = parseFloat(document.getElementById("unitPrice").value) || 0;
    const q = parseFloat(document.getElementById("unitQuantity").value) || 0;
    const displayTotal = document.getElementById("displayTotal");
    if (displayTotal) displayTotal.innerText = (p * q).toLocaleString(); 
}

function clearAllData() { 
    if (confirm("คุณแน่ใจหรือไม่ว่าต้องการล้างข้อมูล 'ทั้งหมด' ?\n(ข้อมูลการเงินและสินค้าที่เพิ่มเองจะหายไป)")) { 
        localStorage.removeItem('farmData');
        localStorage.removeItem('farmDataStorage');
        localStorage.removeItem('groupTitles');
        location.reload(); 
    } 
}

// ============================================================================
// 6. ระบบช่วยเหลือ อัจฉริยะ & API (Smart Features & Debounce)
// ============================================================================
function onTypeDebounce(inputElement) {
    clearTimeout(typingTimer);
    typingTimer = setTimeout(() => {
        const query = inputElement.value.trim();
        if (query.length >= 1) handleRealtimeSearch(query);
    }, DEBOUNCE_DELAY);
}

function handleRealtimeSearch(query) {
    const cleanName = query.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '').trim();
    
    let matchedData = null;
    for (let key in smartMarketData) {
        if (cleanName.includes(key)) {
            matchedData = smartMarketData[key];
            break;
        }
    }

    const marketPriceInput = document.getElementById("newItemMarketPrice");
    const farmPriceInput = document.getElementById("newItemPrice");
    const groupSelect = document.getElementById("groupSelect");
    const unitSelect = document.getElementById("newItemUnit");

    if (matchedData) {
        if (marketPriceInput) marketPriceInput.value = matchedData.marketPrice;
        if (farmPriceInput && !farmPriceInput.value) farmPriceInput.value = matchedData.price;
        if (groupSelect) {
            groupSelect.value = matchedData.group;
            toggleNewGroupInput(matchedData.group);
        }
        if (unitSelect && matchedData.unit) {
            unitSelect.value = matchedData.unit;
            toggleCustomUnitInput(matchedData.unit);
        }
        currentSelectedUnit = matchedData.unit || "หน่วย";
    }

    const currentMarketPrice = matchedData ? matchedData.marketPrice : 0;
    displayPriceComparison(query, farmPriceInput ? farmPriceInput.value : 0, currentMarketPrice, currentSelectedUnit);
    updateUnitLabels(currentSelectedUnit);
    fetchKnowledgeData(cleanName, query);
}

function displayPriceComparison(itemName, farmPrice, marketPrice, unit) {
    const compareBox = document.getElementById("priceCompareBox");
    if (!compareBox) return;

    if (document.getElementById("farmPriceDisplay")) document.getElementById("farmPriceDisplay").innerText = farmPrice || 0;
    if (document.getElementById("marketPriceDisplay")) document.getElementById("marketPriceDisplay").innerText = marketPrice || farmPrice || 0;
    
    const unitText = unit ? `฿/${unit}` : `฿`;
    if (document.getElementById("farmPriceUnit")) document.getElementById("farmPriceUnit").innerText = unitText;
    if (document.getElementById("marketPriceUnit")) document.getElementById("marketPriceUnit").innerText = unitText;

    compareBox.style.display = "flex";
}

function updateUnitLabels(unit) {
    if (document.getElementById("unitPriceLabel")) document.getElementById("unitPriceLabel").innerText = `บาท/${unit}`;
    if (document.getElementById("unitQtyLabel")) document.getElementById("unitQtyLabel").innerText = unit;
}

function getSmartEmoji(text) {
    const hasEmoji = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu.test(text); 
    if (hasEmoji) return text;
    for (let key in smartMarketData) {
        if (text.includes(key)) return smartMarketData[key].emoji + " " + text;
    }
    return text;
}

async function fetchKnowledgeData(cleanItemName, rawItemName) {
    for (let key in knowledgeBase) {
        if (cleanItemName.includes(key)) {
            openKnowledgeDrawer(knowledgeBase[key].title, knowledgeBase[key].info);
            return;
        }
    }

    try {
        const response = await fetch(`https://th.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(cleanItemName)}`);
        const data = await response.json();

        if (data.type === "standard" && data.extract) {
            openKnowledgeDrawer(`🌐 เกร็ดความรู้: ${rawItemName}`, data.extract);
        }
    } catch (e) {
        // เงียบไว้เมื่อไม่เจอ เพื่อไม่ให้รบกวนผู้ใช้งาน
    }
}

function openKnowledgeDrawer(title, info) {
    const drawer = document.getElementB

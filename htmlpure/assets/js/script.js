class ShoppingListAPI {
    //change the this address
    constructor(baseURL = 'http://sarvcrm.loc/api') {
        this.baseURL = baseURL;
        this.headers = {
            'Content-Type': 'application/json; charset=utf-8',
            'Accept': 'application/json'
        };
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: this.headers,
            ...options
        };

        try {
            const response = await fetch(url, config);
            let data;
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            } else {
                data = { error: await response.text() };
            }

            if (!response.ok) {
                throw new Error(data.error || `HTTP error! status: ${response.status}`);
            }

            return data;
        } catch (error) {
            console.error('API Request failed:', error);
            throw error;
        }
    }

    async getAllItems() {
        return this.request('/items');
    }

    async getItem(id) {
        return this.request(`/items/${id}`);
    }

    async createItem(itemName) {
        return this.request('/items', {
            method: 'POST',
            body: JSON.stringify({
                item_name: itemName.trim()
            })
        });
    }

    async updateItem(id, itemName) {
        return this.request(`/items/${id}`, {
            method: 'PUT',
            body: JSON.stringify({
                item_name: itemName.trim()
            })
        });
    }

    async deleteItem(id) {
        return this.request(`/items/${id}`, {
            method: 'DELETE'
        });
    }

    async toggleItem(id) {
        return this.request(`/items/${id}/toggle`, {
            method: 'PATCH'
        });
    }

    async getStats() {
        return this.request('/stats');
    }

    async clearCompleted() {
        return this.request('/clear-completed', {
            method: 'DELETE'
        });
    }
}

// App State
let items = [];
let editingId = null;
let isError = false;
let loading = false;
let stats = { total: 0, completed: 0, pending: 0 };

const api = new ShoppingListAPI(); //you can add the your backend address in the middle of new ShoppingListApi 

const loadingOverlay = document.getElementById('loadingOverlay');
const newItemInput = document.getElementById('newItemInput');
const addBtn = document.getElementById('addBtn');
const totalItemsEl = document.getElementById('totalItems');
const completedItemsEl = document.getElementById('completedItems');
const pendingItemsEl = document.getElementById('pendingItems');
const emptyState = document.getElementById('emptyState');
const itemsList = document.getElementById('itemsList');
const clearSection = document.getElementById('clearSection');
const clearCompletedBtn = document.getElementById('clearCompletedBtn');

function startLoading() {
    loading = true;
    loadingOverlay.classList.add('show');
    disableControls(true);
}

function stopLoading() {
    loading = false;
    loadingOverlay.classList.remove('show');
    disableControls(false);
}

function disableControls(disabled) {
    const controls = document.querySelectorAll('input, button');
    controls.forEach(control => {
        control.disabled = disabled;
    });
}

async function getStats() {
    try {
        startLoading();
        const response = await api.getStats();

        if (response.success && response.data) {
            stats = {
                total: response.data.total_items,
                completed: response.data.completed_items,
                pending: response.data.pending_items
            };
            updateStatsDisplay();
        }
    } catch (error) {
        console.error('خطا در بارگذاری آمار لیست خرید:', error);
    } finally {
        stopLoading();
    }
}

function updateStatsDisplay() {
    totalItemsEl.textContent = stats.total;
    completedItemsEl.textContent = stats.completed;
    pendingItemsEl.textContent = stats.pending;
}

async function loadItems() {
    try {
        startLoading();
        const response = await api.getAllItems();

        if (response.success && response.data) {
            items = response.data.items.map(item => ({
                id: item.id,
                text: item.item_name,
                checked: item.is_completed,
                createdAt: new Date(item.created_at).toLocaleString('fa-IR')
            }));
            renderItems();
        }
    } catch (error) {
        console.error('خطا در بارگذاری آیتم‌ها:', error);
    } finally {
        stopLoading();
    }
}

function renderItems() {
    if (items.length === 0) {
        emptyState.style.display = 'block';
        itemsList.style.display = 'none';
        clearSection.style.display = 'none';
    } else {
        emptyState.style.display = 'none';
        itemsList.style.display = 'block';
        clearSection.style.display = 'block';

        itemsList.innerHTML = '';
        items.forEach(item => {
            const itemElement = createItemElement(item);
            itemsList.appendChild(itemElement);
        });
    }
}

function createItemElement(item) {
    const itemDiv = document.createElement('div');
    itemDiv.className = `item ${item.checked ? 'checked' : ''} ${isError && item.id === editingId ? 'custom-pading-style' : ''}`;
    itemDiv.dataset.id = item.id;

    itemDiv.innerHTML = `
                ${(isError && item.id === editingId) ? '<small class="text-danger validator-class">نام آیتم را خالی نگذارید</small>' : ''}
                <div class="item-content">
                    <input
                        type="checkbox"
                        ${item.checked ? 'checked' : ''}
                        class="item-checkbox"
                        onchange="toggleCheck(${item.id})"
                    />
                    ${editingId === item.id ? createEditForm(item) : createItemInfo(item)}
                </div>
                ${editingId !== item.id ? createItemActions(item) : ''}
            `;

    return itemDiv;
}

function createEditForm(item) {
    return `
                <div class="edit-form">
                    <input
                        type="text"
                        value="${item.text}"
                        class="edit-input ${isError ? 'red-border' : ''}"
                        id="editInput-${item.id}"
                        onkeypress="handleEditKeyPress(event, ${item.id})"
                    />
                    <div class="edit-actions">
                        <button
                            onclick="saveEdit(${item.id})"
                            class="save-btn"
                        >
                            ✅
                        </button>
                        <button
                            onclick="cancelEdit()"
                            class="cancel-btn"
                        >
                            ❌
                        </button>
                    </div>
                </div>
            `;
}

function createItemInfo(item) {
    return `
                <div class="item-info">
                    <span class="item-text">${item.text}</span>
                    <small class="item-date">${item.createdAt}</small>
                </div>
            `;
}

function createItemActions(item) {
    return `
                <div class="item-actions">
                    <button
                        onclick="startEdit(${item.id}, '${item.text.replace(/'/g, "\\'")}')"
                        class="edit-btn"
                        title="ویرایش"
                    >
                        ✏️
                    </button>
                    <button
                        onclick="deleteItem(${item.id})"
                        class="delete-btn"
                        title="حذف"
                    >
                        🗑️
                    </button>
                </div>
            `;
}

async function addItem() {
    const newItemText = newItemInput.value.trim();
    if (newItemText !== '') {
        try {
            startLoading();
            const response = await api.createItem(newItemText);

            if (response.success) {
                await loadItems();
                await getStats();
                newItemInput.value = '';
            }
        } catch (error) {
            console.error('خطا در اضافه کردن آیتم:', error);
        } finally {
            stopLoading();
        }
    }
}

async function deleteItem(id) {
    try {
        startLoading();
        const response = await api.deleteItem(id);

        if (response.success) {
            await loadItems();
            await getStats();
        }
    } catch (error) {
        console.error('خطا در حذف آیتم:', error);
    } finally {
        stopLoading();
    }
}

async function toggleCheck(id) {
    try {
        const response = await api.toggleItem(id);

        if (response.success) {
            await loadItems();
            await getStats();
        }
    } catch (error) {
        console.error('خطا در تغییر وضعیت آیتم:', error);
    }
}

function startEdit(id, text) {
    editingId = id;
    isError = false;
    hideEditError();
    renderItems();

    setTimeout(() => {
        const editInput = document.getElementById(`editInput-${id}`);
        if (editInput) {
            editInput.focus();
            editInput.select();
        }
    }, 100);
}

async function saveEdit(id) {
    const editInput = document.getElementById(`editInput-${id}`);
    const newText = editInput.value.trim();

    if (newText !== '') {
        try {
            startLoading();
            const response = await api.updateItem(id, newText);

            if (response.success) {
                await loadItems();
                await getStats();
                editingId = null;
                isError = false;
            }
        } catch (error) {
            console.error('خطا در ویرایش آیتم:', error);
        } finally {
            stopLoading();
        }
    } else {
        showEditError(id);
    }
}

function cancelEdit() {
    editingId = null;
    isError = false;
    hideEditError();
    renderItems();
}

// تابع نمایش error برای edit
function showEditError(id) {
    isError = true;
    const itemDiv = document.querySelector(`.item[data-id="${id}"]`);
    const editInput = document.getElementById(`editInput-${id}`);

    if (itemDiv && editInput) {
        // اضافه کردن کلاس error
        editInput.classList.add('red-border');
        itemDiv.classList.add('custom-pading-style');

        // چک کردن اگر error message وجود ندارد، اضافه کنید
        let errorMsg = itemDiv.querySelector('.validator-class');
        if (!errorMsg) {
            errorMsg = document.createElement('small');
            errorMsg.className = 'text-danger validator-class';
            errorMsg.textContent = 'نام آیتم را خالی نگذارید';
            itemDiv.insertBefore(errorMsg, itemDiv.firstChild);
        }
    }
}

// تابع مخفی کردن error برای edit
function hideEditError() {
    // حذف تمام error messages
    const errorMessages = document.querySelectorAll('.validator-class');
    errorMessages.forEach(msg => msg.remove());

    // حذف کلاس‌های error
    const errorInputs = document.querySelectorAll('.red-border');
    errorInputs.forEach(input => input.classList.remove('red-border'));

    const errorItems = document.querySelectorAll('.custom-pading-style');
    errorItems.forEach(item => item.classList.remove('custom-pading-style'));
}

async function clearCompleted() {
    try {
        startLoading();
        const response = await api.clearCompleted();

        if (response.success) {
            await loadItems();
            await getStats();
        }
    } catch (error) {
        console.error('خطا در پاک کردن آیتم‌های تکمیل شده:', error);
    } finally {
        stopLoading();
    }
}

// Event handlers
function handleKeyPress(e) {
    if (e.key === 'Enter') {
        addItem();
    }
}

function handleEditKeyPress(e, id) {
    if (e.key === 'Enter') {
        saveEdit(id);
    }
}

// Event listeners
addBtn.addEventListener('click', addItem);
newItemInput.addEventListener('keypress', handleKeyPress);
clearCompletedBtn.addEventListener('click', clearCompleted);

// Initialize app
async function init() {
    await loadItems();
    await getStats();
}

// Start the app
init();
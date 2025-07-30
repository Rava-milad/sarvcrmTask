import React, { useState, useEffect } from 'react';
import ShoppingListAPI from './api/ShoppingListAPI';
import './App.css';

const api = new ShoppingListAPI();

function App() {
    const [items, setItems] = useState([]);
    const [newItem, setNewItem] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editingText, setEditingText] = useState('');
    const [isError, setIsError] = useState(false);
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState({ total: 0, completed: 0, pending: 0 });
    const [showLoading, setShowLoading] = useState(false);


    const startLoading = () => {
        setLoading(true);
        setTimeout(() => {
            setShowLoading(true);
        }, 30000);
    };

    const stopLoading = () => {
        setLoading(false);
        setShowLoading(false);
    };

    useEffect(() => {
        loadItems();
        getStats();
    }, []);

    useEffect(() => {
        getStats();
    }, [items]);

    const getStats = async () => {
        try {
            startLoading();
            const response = await api.getStats();

            if (response.success && response.data) {
                setStats({
                    total: response.data.total_items,
                    completed: response.data.completed_items,
                    pending: response.data.pending_items
                });
            }
        } catch (error) {
            console.error('خطا در بارگذاری آمار لیست خرید:', error);
        } finally {
            stopLoading()
        }
    };

    // دریافت آیتم‌ها از سرور
    const loadItems = async () => {
        try {
            startLoading();
            const response = await api.getAllItems();

            if (response.success && response.data) {
                // تبدیل فرمت API به فرمت کامپوننت
                const apiItems = response.data.items.map(item => ({
                    id: item.id,
                    text: item.item_name,
                    checked: item.is_completed,
                    createdAt: new Date(item.created_at).toLocaleString('fa-IR')
                }));

                setItems(apiItems);
            }
        } catch (error) {
            console.error('خطا در بارگذاری آیتم‌ها:', error);
        } finally {
            stopLoading();
        }
    };

    // اضافه کردن آیتم جدید
    const addItem = async () => {
        if (newItem.trim() !== '') {
            try {
                startLoading();
                const response = await api.createItem(newItem.trim());

                if (response.success) {
                    await loadItems();
                    setNewItem('');
                }
            } catch (error) {
                console.error('خطا در اضافه کردن آیتم:', error);
            } finally {
                stopLoading();
            }
        }
    };

    const deleteItem = async (id) => {
        try {
            setLoading(true);
            const response = await api.deleteItem(id);

            if (response.success) {
                await loadItems();
            }
        } catch (error) {
            console.error('خطا در حذف آیتم:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleCheck = async (id) => {
        try {
            const response = await api.toggleItem(id);

            if (response.success) {
                await loadItems();
            }
        } catch (error) {
            console.error('خطا در تغییر وضعیت آیتم:', error);
        }
    };

    const startEdit = (id, text) => {
        setEditingId(id);
        setEditingText(text);
        setIsError(false);
    };

    const saveEdit = async () => {
        if (editingText.trim() !== '') {
            try {
                setLoading(true);
                const response = await api.updateItem(editingId, editingText.trim());

                if (response.success) {
                    await loadItems();
                    setEditingId(null);
                    setEditingText('');
                    setIsError(false);
                }
            } catch (error) {
                console.error('خطا در ویرایش آیتم:', error);
            } finally {
                setLoading(false);
            }
        } else {
            setIsError(true);
        }
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditingText('');
        setIsError(false);
    };

    const clearCompleted = async () => {
        try {
            setLoading(true);
            const response = await api.clearCompleted();

            if (response.success) {
                await loadItems();
            }
        } catch (error) {
            console.error('خطا در پاک کردن آیتم‌های تکمیل شده:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e, action) => {
        if (e.key === 'Enter') {
            action();
        }
    };

    return (
        <div className="app">
            <div className="container">
                {loading && (
                    <div className="loading-overlay">
                        <div className="spinner"></div>
                    </div>
                )}
                <header className="header">
                    <h1>📝 لیست خرید من</h1>
                    <p>آیتم‌های مورد نیاز خود را اضافه، ویرایش و مدیریت کنید</p>
                    {loading && <div className="loading">در حال بارگذاری...</div>}
                </header>

                <section className="add-section">
                    <div className="add-form">
                        <input
                            type="text"
                            value={newItem}
                            onChange={(e) => setNewItem(e.target.value)}
                            onKeyPress={(e) => handleKeyPress(e, addItem)}
                            placeholder="آیتم جدید را وارد کنید..."
                            className="add-input"
                            disabled={loading}
                        />
                        <button
                            onClick={addItem}
                            className="add-btn"
                            disabled={loading}
                        >
                            ➕ اضافه کردن
                        </button>
                    </div>
                </section>

                <section className="stats">
                    <div className="stat-item">
                        <span className="stat-number">{stats.total}</span>
                        <span className="stat-label">کل آیتم‌ها</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-number">{stats.completed}</span>
                        <span className="stat-label">تکمیل شده</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-number">{stats.pending}</span>
                        <span className="stat-label">باقی‌مانده</span>
                    </div>
                </section>

                <section className="items-section">
                    {items.length === 0 ? (
                        <div className="empty-state">
                            <p>🛒 هنوز آیتمی اضافه نکرده‌اید</p>
                            <p>اولین آیتم خود را اضافه کنید!</p>
                        </div>
                    ) : (
                        <div className="items-list">
                            {items.map(item => (
                                <div key={item.id} className={`item ${item.checked ? 'checked' : ''} ${isError && item.id === editingId ? 'custom-pading-style' : ''}`}>
                                    {(isError && item.id === editingId &&
                                        <small className="text-danger validator-class">نام آیتم را خالی نگذارید</small>
                                    )}
                                    <div className="item-content">
                                        <input
                                            type="checkbox"
                                            checked={item.checked}
                                            onChange={() => toggleCheck(item.id)}
                                            className="item-checkbox"
                                            disabled={loading}
                                        />

                                        {editingId === item.id ? (
                                            <div className="edit-form">
                                                <input
                                                    type="text"
                                                    value={editingText}
                                                    onChange={(e) => setEditingText(e.target.value)}
                                                    onKeyPress={(e) => handleKeyPress(e, saveEdit)}
                                                    className={`edit-input ${isError ? 'red-border' : ''}`}
                                                    autoFocus
                                                    disabled={loading}
                                                />
                                                <div className="edit-actions">
                                                    <button
                                                        onClick={saveEdit}
                                                        className="save-btn"
                                                        disabled={loading}
                                                    >
                                                        ✅
                                                    </button>
                                                    <button
                                                        onClick={cancelEdit}
                                                        className="cancel-btn"
                                                        disabled={loading}
                                                    >
                                                        ❌
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="item-info">
                                                <span className="item-text">{item.text}</span>
                                                <small className="item-date">{item.createdAt}</small>
                                            </div>
                                        )}
                                    </div>

                                    {editingId !== item.id && (
                                        <div className="item-actions">
                                            <button
                                                onClick={() => startEdit(item.id, item.text)}
                                                className="edit-btn"
                                                title="ویرایش"
                                                disabled={loading}
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                onClick={() => deleteItem(item.id)}
                                                className="delete-btn"
                                                title="حذف"
                                                disabled={loading}
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {items.length > 0 && (
                    <section className="clear-section">
                        <button
                            onClick={clearCompleted}
                            className="clear-completed-btn"
                            disabled={loading}
                        >
                            🗑️ پاک کردن آیتم‌های تکمیل شده
                        </button>
                    </section>
                )}
            </div>
        </div>
    );
}

export default App;
class ShoppingListAPI {
    //TODO: change this address with your backend
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

    async markAsCompleted(id) {
        return this.request(`/items/${id}`, {
            method: 'PUT',
            body: JSON.stringify({
                is_completed: true
            })
        });
    }

    async markAsPending(id) {
        return this.request(`/items/${id}`, {
            method: 'PUT',
            body: JSON.stringify({
                is_completed: false
            })
        });
    }

    async createMultipleItems(itemNames) {
        const promises = itemNames.map(name => this.createItem(name));
        return Promise.all(promises);
    }

    async searchItems(query) {
        const response = await this.getAllItems();
        if (response.success && response.data.items) {
            const filtered = response.data.items.filter(item =>
                item.item_name.toLowerCase().includes(query.toLowerCase())
            );
            return {
                ...response,
                data: {
                    ...response.data,
                    items: filtered
                }
            };
        }
        return response;
    }
}

export default ShoppingListAPI;

if (typeof window !== 'undefined') {
    window.ShoppingListAPI = ShoppingListAPI;
}
<?php
if (strpos($_SERVER['REQUEST_URI'], '/api') === 0) {
    require_once './../api/index.php';
} else {
    echo json_encode([
        'message' => 'Shopping List API',
        'version' => '1.0.0',
        'endpoints' => [
            'GET /api/items' => 'Get all items',
            'POST /api/items' => 'Create new item',
            'PUT /api/items/{id}' => 'Update item',
            'DELETE /api/items/{id}' => 'Delete item',
            'PATCH /api/items/{id}/toggle' => 'Toggle item status',
            'GET /api/stats' => 'Get statistics',
            'DELETE /api/clear-completed' => 'Clear completed items'
        ]
    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
}

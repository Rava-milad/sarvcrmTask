<?php
header('Content-Type: application/json; charset=utf-8');

// Enable error reporting for development
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Include all classes
require_once '../config/app.php';
require_once '../config/database.php';
require_once '../core/Response.php';
require_once '../core/Router.php';
require_once '../core/Controller.php';
require_once '../core/Model.php';
require_once '../middleware/CorsMiddleware.php';
require_once '../models/ShoppingList.php';
require_once '../controllers/ShoppingListController.php';

// Initialize app
AppConfig::init();

// Initialize router
$router = new Router();

// Add middleware
$router->addMiddleware('CorsMiddleware');

// Define API routes
$router->addRoute('GET', '/', 'ShoppingListController', 'index');
$router->addRoute('GET', '/items', 'ShoppingListController', 'index');
$router->addRoute('GET', '/items/{id}', 'ShoppingListController', 'show');
$router->addRoute('POST', '/items', 'ShoppingListController', 'store');
$router->addRoute('PUT', '/items/{id}', 'ShoppingListController', 'update');
$router->addRoute('DELETE', '/items/{id}', 'ShoppingListController', 'destroy');
$router->addRoute('PATCH', '/items/{id}/toggle', 'ShoppingListController', 'toggle');
$router->addRoute('GET', '/stats', 'ShoppingListController', 'stats');
$router->addRoute('DELETE', '/clear-completed', 'ShoppingListController', 'clearCompleted');

// Dispatch the request
$router->dispatch();


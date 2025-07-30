<?php

class Router
{
    private $routes = [];
    private $middlewares = [];

    public function addRoute($method, $path, $controller, $action)
    {
        $this->routes[] = [
            'method' => strtoupper($method),
            'path' => $path,
            'controller' => $controller,
            'action' => $action
        ];
    }

    public function addMiddleware($middleware)
    {
        $this->middlewares[] = $middleware;
    }

    public function dispatch()
    {
        foreach ($this->middlewares as $middleware) {
            $middleware::handle();
        }

        $requestMethod = $_SERVER['REQUEST_METHOD'];
        $requestUri = $this->getCleanUri();

        foreach ($this->routes as $route) {
            if ($this->matchRoute($route, $requestMethod, $requestUri)) {
                return $this->executeRoute($route, $requestUri);
            }
        }

        Response::error('not found', 404);
    }

    private function getCleanUri()
    {
        $requestUri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

        $basePath = '/api';
        if (strpos($requestUri, $basePath) === 0) {
            $requestUri = substr($requestUri, strlen($basePath));
        }

        return $requestUri ?: '/';
    }

    private function matchRoute($route, $method, $uri)
    {
        if ($route['method'] !== $method) {
            return false;
        }

        $pattern = preg_replace('/\{([^}]+)\}/', '([^/]+)', $route['path']);
        $pattern = '#^' . $pattern . '$#';

        return preg_match($pattern, $uri);
    }

    private function executeRoute($route, $uri)
    {
        $controllerName = $route['controller'];
        $actionName = $route['action'];

        $pattern = preg_replace('/\{([^}]+)\}/', '([^/]+)', $route['path']);
        $pattern = '#^' . $pattern . '$#';
        preg_match($pattern, $uri, $matches);
        array_shift($matches);

        if (class_exists($controllerName)) {
            $controller = new $controllerName();
            if (method_exists($controller, $actionName)) {
                return call_user_func_array([$controller, $actionName], $matches);
            }
        }

        Response::error('Controller or method not found', 500);
    }
}

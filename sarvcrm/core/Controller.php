<?php

abstract class Controller
{
    protected function getRequestData()
    {
        $input = file_get_contents('php://input');
        $data = json_decode($input, true);

        // Also check for form data
        if (empty($data)) {
            $data = $_POST;
        }

        return $data ?? [];
    }

    protected function validateRequired($data, $fields)
    {
        $missing = [];
        foreach ($fields as $field) {
            if (!isset($data[$field]) || empty(trim($data[$field]))) {
                $missing[] = $field;
            }
        }
        return $missing;
    }

    protected function sanitizeString($string)
    {
        return trim(htmlspecialchars($string, ENT_QUOTES, 'UTF-8'));
    }
}

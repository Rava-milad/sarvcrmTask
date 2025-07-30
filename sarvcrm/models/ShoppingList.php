<?php

class ShoppingList extends Model
{
    protected $table = 'shopping_lists';

    public function getAll()
    {
        $sql = "SELECT *,
                DATE_FORMAT(created_at, '%Y/%m/%d %H:%i') as formatted_date
                FROM {$this->table}
                ORDER BY created_at DESC";

        $stmt = $this->executeQuery($sql);
        return $stmt->fetchAll();
    }

    public function getById($id)
    {
        $sql = "SELECT *,
                DATE_FORMAT(created_at, '%Y/%m/%d %H:%i') as formatted_date
                FROM {$this->table}
                WHERE id = ?";

        $stmt = $this->executeQuery($sql, [$id]);
        return $stmt->fetch();
    }

    public function create($data)
    {
        $sql = "INSERT INTO {$this->table} (item_name, is_completed, created_at, updated_at)
                VALUES (?, 0, NOW(), NOW())";

        $this->executeQuery($sql, [$data['item_name']]);

        return $this->getById($this->db->lastInsertId());
    }

    public function update($id, $data)
    {
        $fields = [];
        $values = [];

        if (isset($data['item_name'])) {
            $fields[] = 'item_name = ?';
            $values[] = $data['item_name'];
        }

        if (isset($data['is_completed'])) {
            $fields[] = 'is_completed = ?';
            $values[] = $data['is_completed'] ? 1 : 0;
        }

        $fields[] = 'updated_at = NOW()';
        $values[] = $id;

        $sql = "UPDATE {$this->table} SET " . implode(', ', $fields) . " WHERE id = ?";
        $this->executeQuery($sql, $values);

        return $this->getById($id);
    }

    public function delete($id)
    {
        $sql = "DELETE FROM {$this->table} WHERE id = ?";
        $stmt = $this->executeQuery($sql, [$id]);
        return $stmt->rowCount() > 0;
    }

    public function toggle($id)
    {
        $sql = "UPDATE {$this->table}
                SET is_completed = !is_completed, updated_at = NOW()
                WHERE id = ?";

        $this->executeQuery($sql, [$id]);
        return $this->getById($id);
    }

    public function getStats()
    {
        $sql = "SELECT
                COUNT(*) as total_items,
                COUNT(CASE WHEN is_completed = 1 THEN 1 END) as completed_items,
                COUNT(CASE WHEN is_completed = 0 THEN 1 END) as pending_items
                FROM {$this->table}";

        $stmt = $this->executeQuery($sql);
        return $stmt->fetch();
    }

    public function clearCompleted()
    {
        $sql = "DELETE FROM {$this->table} WHERE is_completed = 1";
        $stmt = $this->executeQuery($sql);
        return $stmt->rowCount();
    }
}

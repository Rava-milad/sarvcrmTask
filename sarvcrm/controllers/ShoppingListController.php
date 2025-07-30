<?php

class ShoppingListController extends Controller
{
    private $shoppingList;

    public function __construct()
    {
        $this->shoppingList = new ShoppingList();
    }

    public function index()
    {
        try {
            $items = $this->shoppingList->getAll();
            $stats = $this->shoppingList->getStats();

            Response::success([
                'items' => $items,
                'stats' => $stats
            ]);
        } catch (Exception $e) {
            Response::error('خطا در دریافت لیست آیتم‌ها', 500);
        }
    }

    public function show($id)
    {
        try {
            $item = $this->shoppingList->getById($id);
            if (!$item) {
                Response::error('آیتم مورد نظر یافت نشد', 404);
            }

            Response::success($item);
        } catch (Exception $e) {
            Response::error('خطا در دریافت آیتم', 500);
        }
    }

    public function store()
    {
        try {
            $data = $this->getRequestData();
            $missing = $this->validateRequired($data, ['item_name']);

            if (!empty($missing)) {
                Response::error('نام آیتم الزامی است', 400);
            }

            $data['item_name'] = $this->sanitizeString($data['item_name']);

            if (strlen($data['item_name']) < 2) {
                Response::error('نام آیتم باید حداقل ۲ کاراکتر باشد', 400);
            }

            $item = $this->shoppingList->create($data);
            Response::success($item, 'آیتم با موفقیت اضافه شد', 201);
        } catch (Exception $e) {
            Response::error('خطا در ایجاد آیتم', 500);
        }
    }

    public function update($id)
    {
        try {
            $data = $this->getRequestData();

            if (empty($data)) {
                Response::error('داده‌ای برای به‌روزرسانی ارسال نشده', 400);
            }

            if (isset($data['item_name'])) {
                $data['item_name'] = $this->sanitizeString($data['item_name']);
                if (strlen($data['item_name']) < 2) {
                    Response::error('نام آیتم باید حداقل ۲ کاراکتر باشد', 400);
                }
            }

            $item = $this->shoppingList->update($id, $data);
            if (!$item) {
                Response::error('آیتم مورد نظر یافت نشد', 404);
            }

            Response::success($item, 'آیتم با موفقیت به‌روزرسانی شد');
        } catch (Exception $e) {
            Response::error('خطا در به‌روزرسانی آیتم', 500);
        }
    }

    public function destroy($id)
    {
        try {
            $success = $this->shoppingList->delete($id);
            if (!$success) {
                Response::error('آیتم مورد نظر یافت نشد', 404);
            }

            Response::success(null, 'آیتم با موفقیت حذف شد');
        } catch (Exception $e) {
            Response::error('خطا در حذف آیتم', 500);
        }
    }

    public function toggle($id)
    {
        try {
            $item = $this->shoppingList->toggle($id);
            if (!$item) {
                Response::error('آیتم مورد نظر یافت نشد', 404);
            }

            $message = $item['is_completed'] ? 'آیتم تکمیل شد' : 'آیتم به حالت در انتظار برگشت';
            Response::success($item, $message);
        } catch (Exception $e) {
            Response::error('خطا در تغییر وضعیت آیتم', 500);
        }
    }

    public function stats()
    {
        try {
            $stats = $this->shoppingList->getStats();
            Response::success($stats);
        } catch (Exception $e) {
            Response::error('خطا در دریافت آمار', 500);
        }
    }

    public function clearCompleted()
    {
        try {
            $count = $this->shoppingList->clearCompleted();
            Response::success(['deleted_count' => $count], "{$count} آیتم تکمیل شده حذف شد");
        } catch (Exception $e) {
            Response::error('خطا در پاک کردن آیتم‌های تکمیل شده', 500);
        }
    }
}

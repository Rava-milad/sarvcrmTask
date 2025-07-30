<?php

class AppConfig
{
    const API_VERSION = 'v1';
    const TIMEZONE = 'Asia/Tehran';
    const ITEMS_PER_PAGE = 50;

    public static function init()
    {
        date_default_timezone_set(self::TIMEZONE);
        mb_internal_encoding('UTF-8');
    }
}

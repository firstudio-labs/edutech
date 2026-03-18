<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PaymentMethod extends Model
{
    protected $fillable = [
        'bank_name',
        'slug',
        'account_number',
        'account_name',
        'status',
    ];

    public function getRouteKeyName()
    {
        return 'slug';
    }

    protected static function booted()
    {
        static::creating(function ($pm) {
            if (empty($pm->slug)) {
                $pm->slug = \Illuminate\Support\Str::slug($pm->bank_name) . '-' . uniqid();
            }
        });

        static::updating(function ($pm) {
            if ($pm->isDirty('bank_name') || empty($pm->slug)) {
                $pm->slug = \Illuminate\Support\Str::slug($pm->bank_name) . '-' . uniqid();
            }
        });
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }
}

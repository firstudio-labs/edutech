<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PaymentMethod extends Model
{
    protected $fillable = [
        'bank_name',
        'account_number',
        'account_name',
        'status',
    ];

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }
}

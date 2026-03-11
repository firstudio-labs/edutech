<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'category_id',
        'price',
        'normal_price',
        'rating',
        'total_ratings',
        'sold_count',
        'image',
        'badge',
        'featured',
        'short_description',
        'description',
        'benefits',
        'materials',
        'start_at',
        'end_at',
        'location',
    ];

    protected $casts = [
        'benefits' => 'array',
        'materials' => 'array',
        'price' => 'decimal:2',
        'normal_price' => 'decimal:2',
        'rating' => 'decimal:1',
        'featured' => 'boolean',
        'start_at' => 'datetime',
        'end_at' => 'datetime',
    ];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function users()
    {
        return $this->belongsToMany(User::class, 'user_products')->withPivot('purchased_at')->withTimestamps();
    }
}

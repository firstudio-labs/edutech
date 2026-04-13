<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminUserController extends Controller
{
    public function index()
    {
        // Ensure all users have slugs
        User::whereNull('slug')->orWhere('slug', '')->get()->each(function($u) {
            $u->slug = \Illuminate\Support\Str::slug($u->name) . '-' . uniqid();
            $u->save();
        });

        $users = User::latest()->get();
        return Inertia::render('Admin/AdminUsers', [
            'dbUsers' => $users
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'role' => 'required|string|in:customer,admin',
            'status' => 'required|string|in:Aktif,Nonaktif',
            'phone' => 'nullable|string|max:20',
        ]);

        User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => \Illuminate\Support\Facades\Hash::make($request->password),
            'role' => $request->role,
            'status' => $request->status,
            'phone' => $request->phone,
        ]);

        return back()->with('success', 'Pengguna berhasil ditambahkan.');
    }

    public function update(Request $request, User $user)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'password' => 'nullable|string|min:8',
            'role' => 'required|string|in:customer,admin',
            'status' => 'required|string|in:Aktif,Nonaktif',
            'phone' => 'nullable|string|max:20',
        ]);

        $data = [
            'name' => $request->name,
            'email' => $request->email,
            'role' => $request->role,
            'status' => $request->status,
            'phone' => $request->phone,
        ];

        if ($request->password) {
            $data['password'] = \Illuminate\Support\Facades\Hash::make($request->password);
        }

        $user->update($data);

        return back()->with('success', 'Data pengguna berhasil diperbarui.');
    }

    public function toggleStatus(User $user)
    {
        $user->status = $user->status === 'Aktif' ? 'Nonaktif' : 'Aktif';
        $user->save();

        return back()->with('success', 'Status pengguna diperbarui.');
    }

    public function destroy(User $user)
    {
        $user->delete();
        return back()->with('success', 'Pengguna berhasil dihapus.');
    }
}

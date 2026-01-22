<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::query()->create([
            'name' => 'Administrador',
            'cpf' => '11111111111',
            'email' => 'admin@example.com',
            'password' => Hash::make('senha123'),
            'role' => 'Administrador',
            'level' => 1,
            'can_edit' => true,
            'can_delete' => true,
        ]);

        User::query()->create([
            'name' => 'Moderador',
            'cpf' => '22222222222',
            'email' => 'moderador@example.com',
            'password' => Hash::make('senha123'),
            'role' => 'Moderador',
            'level' => 2,
            'can_edit' => true,
            'can_delete' => false,
        ]);

        User::query()->create([
            'name' => 'Leitor',
            'cpf' => '33333333333',
            'email' => 'leitor@example.com',
            'password' => Hash::make('senha123'),
            'role' => 'Leitor',
            'level' => 3,
            'can_edit' => false,
            'can_delete' => false,
        ]);
    }
}

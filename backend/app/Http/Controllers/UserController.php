<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    private function currentUser(Request $request): ?User
    {
        $userId = $request->header('X-User-Id');

        if (!$userId) {
            return null;
        }

        return User::query()->find($userId);
    }

    private function roleConfig(string $role): array
    {
        return match ($role) {
            'Administrador' => ['level' => 1, 'can_edit' => true, 'can_delete' => true],
            'Moderador' => ['level' => 2, 'can_edit' => true, 'can_delete' => false],
            default => ['level' => 3, 'can_edit' => false, 'can_delete' => false],
        };
    }

    public function index(Request $request): JsonResponse
    {
        $currentUser = $this->currentUser($request);

        if (!$currentUser) {
            return response()->json(['message' => 'Usuario nao autenticado.'], 401);
        }

        $users = User::query()
            ->orderBy('name')
            ->get(['id', 'name', 'cpf', 'email', 'role', 'level', 'can_edit', 'can_delete']);

        return response()->json($users);
    }

    public function store(Request $request): JsonResponse
    {
        $currentUser = $this->currentUser($request);

        if (!$currentUser || !$currentUser->can_edit) {
            return response()->json(['message' => 'Sem permissao para cadastrar usuarios.'], 403);
        }

        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'cpf' => ['required', 'string', 'max:20', 'unique:users,cpf'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'role' => ['required', 'in:Administrador,Moderador,Leitor'],
            'password' => ['nullable', 'string', 'min:6'],
        ]);

        $config = $this->roleConfig($data['role']);
        $password = $data['password'] ?? 'senha123';

        $user = User::query()->create([
            'name' => $data['name'],
            'cpf' => $data['cpf'],
            'email' => $data['email'],
            'role' => $data['role'],
            'level' => $config['level'],
            'can_edit' => $config['can_edit'],
            'can_delete' => $config['can_delete'],
            'password' => Hash::make($password),
        ]);

        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'cpf' => $user->cpf,
            'email' => $user->email,
            'role' => $user->role,
            'level' => $user->level,
            'can_edit' => $user->can_edit,
            'can_delete' => $user->can_delete,
        ], 201);
    }

    public function update(Request $request, User $user): JsonResponse
    {
        $currentUser = $this->currentUser($request);

        if (!$currentUser || !$currentUser->can_edit) {
            return response()->json(['message' => 'Sem permissao para editar usuarios.'], 403);
        }

        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'cpf' => ['required', 'string', 'max:20', Rule::unique('users', 'cpf')->ignore($user->id)],
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'role' => ['required', 'in:Administrador,Moderador,Leitor'],
            'password' => ['nullable', 'string', 'min:6'],
        ]);

        $config = $this->roleConfig($data['role']);

        $user->fill([
            'name' => $data['name'],
            'cpf' => $data['cpf'],
            'email' => $data['email'],
            'role' => $data['role'],
            'level' => $config['level'],
            'can_edit' => $config['can_edit'],
            'can_delete' => $config['can_delete'],
        ]);

        if (!empty($data['password'])) {
            $user->password = Hash::make($data['password']);
        }

        $user->save();

        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'cpf' => $user->cpf,
            'email' => $user->email,
            'role' => $user->role,
            'level' => $user->level,
            'can_edit' => $user->can_edit,
            'can_delete' => $user->can_delete,
        ]);
    }

    public function destroy(Request $request, User $user): JsonResponse
    {
        $currentUser = $this->currentUser($request);

        if (!$currentUser || !$currentUser->can_delete) {
            return response()->json(['message' => 'Sem permissao para excluir usuarios.'], 403);
        }

        $user->delete();

        return response()->json(['message' => 'Usuario removido.']);
    }
}

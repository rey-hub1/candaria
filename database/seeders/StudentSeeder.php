<?php

namespace Database\Seeders;

use App\Models\Student;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class StudentSeeder extends Seeder
{
    /**
     * Dummy students for testing the marketplace flow — real NISN data comes later.
     */
    public function run(): void
    {
        $dummyStudents = [
            // Siswa 1: tidak dipaksa ganti password — password default selalu jalan untuk tes cepat.
            ['nisn' => '0011223344', 'name' => 'Siswa Uji Coba 1', 'class' => 'X RPL 1', 'birth_date' => '2009-05-12', 'must_change_password' => false],
            // Siswa 2: dipaksa ganti password — untuk menguji alur forced password change.
            ['nisn' => '0011223355', 'name' => 'Siswa Uji Coba 2', 'class' => 'XI TKJ 2', 'birth_date' => '2008-11-30', 'must_change_password' => true],
        ];

        foreach ($dummyStudents as $data) {
            $birthDate = \Carbon\Carbon::parse($data['birth_date']);

            $existing = Student::where('nisn', $data['nisn'])->first();

            $user = User::updateOrCreate(
                ['id' => $existing?->user_id],
                [
                    'name' => $data['name'],
                    'email' => null,
                    'password' => Hash::make(Student::generateDefaultPassword($birthDate)),
                    'role' => 'student',
                ]
            );

            Student::updateOrCreate(
                ['nisn' => $data['nisn']],
                [
                    'user_id' => $user->id,
                    'name' => $data['name'],
                    'class' => $data['class'],
                    'birth_date' => $birthDate,
                    'must_change_password' => $data['must_change_password'],
                ]
            );
        }
    }
}

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
            ['nisn' => '0011223344', 'name' => 'Siswa Uji Coba 1', 'class' => 'X RPL 1', 'birth_date' => '2009-05-12'],
            ['nisn' => '0011223355', 'name' => 'Siswa Uji Coba 2', 'class' => 'XI TKJ 2', 'birth_date' => '2008-11-30'],
        ];

        foreach ($dummyStudents as $data) {
            $birthDate = \Carbon\Carbon::parse($data['birth_date']);

            $user = User::firstOrCreate(
                ['name' => $data['name'], 'role' => 'student'],
                [
                    'email' => null,
                    'password' => Hash::make(Student::generateDefaultPassword($birthDate)),
                    'role' => 'student',
                ]
            );

            Student::firstOrCreate(
                ['nisn' => $data['nisn']],
                [
                    'user_id' => $user->id,
                    'name' => $data['name'],
                    'class' => $data['class'],
                    'birth_date' => $birthDate,
                    'must_change_password' => true,
                ]
            );
        }
    }
}

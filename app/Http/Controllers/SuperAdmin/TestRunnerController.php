<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Symfony\Component\Process\Process;

class TestRunnerController extends Controller
{
    public function index(Request $request)
    {
        abort_if(app()->isProduction(), 403, 'Test runner tidak tersedia di lingkungan produksi.');

        return Inertia::render('SuperAdmin/TestRunner', [
            'testSuccess' => $request->session()->get('testSuccess'),
            'testOutput' => $request->session()->get('testOutput'),
        ]);
    }

    public function run()
    {
        abort_if(app()->isProduction(), 403, 'Test runner tidak tersedia di lingkungan produksi.');

        // Cegah dua proses pest jalan bersamaan (klik ganda / retry) yang bisa
        // menghabiskan worker. Lock dilepas otomatis setelah selesai / timeout.
        $lock = Cache::lock('test-runner', 360);

        if (! $lock->get()) {
            return redirect()->back()->with([
                'testSuccess' => false,
                'testOutput' => 'Test suite sedang berjalan. Tunggu hingga selesai.',
            ]);
        }

        try {
            $process = new Process([\PHP_BINARY, 'vendor/bin/pest', '--colors=never']);
            $process->setWorkingDirectory(base_path());
            $process->setTimeout(300); // 5 minutes max
            $process->run();

            $output = $process->getOutput()."\n".$process->getErrorOutput();

            return redirect()->back()->with([
                'testSuccess' => $process->isSuccessful(),
                // Batasi ukuran output yang disimpan di session DB.
                'testOutput' => mb_substr($output, -50000),
            ]);
        } finally {
            $lock->release();
        }
    }
}

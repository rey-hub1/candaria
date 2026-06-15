<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Symfony\Component\Process\Process;

class TestRunnerController extends Controller
{
    public function index(\Illuminate\Http\Request $request)
    {
        return Inertia::render('SuperAdmin/TestRunner', [
            'testSuccess' => $request->session()->get('testSuccess'),
            'testOutput' => $request->session()->get('testOutput')
        ]);
    }

    public function run()
    {
        $process = new Process([\PHP_BINARY, 'vendor/bin/pest', '--colors=never']);
        $process->setWorkingDirectory(base_path());
        $process->setTimeout(300); // 5 minutes max
        $process->run();

        return redirect()->back()->with([
            'testSuccess' => $process->isSuccessful(),
            'testOutput' => $process->getOutput() . "\n" . $process->getErrorOutput()
        ]);
    }
}

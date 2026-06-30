<?php

use App\Jobs\SendWhatsAppMessage;
use App\Services\WhatsAppService;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Queue;

beforeEach(function () {
    config([
        'services.waha.enabled'  => true,
        'services.waha.base_url' => 'http://localhost:3000',
        'services.waha.api_key'  => 'test-key',
        'services.waha.session'  => 'default',
    ]);
});

it('normalizes 08xx phone to 628xx chatId', function () {
    $wa = new WhatsAppService;
    expect($wa->toChatId('081234567890'))->toBe('6281234567890@c.us');
});

it('normalizes 8xx phone to 628xx chatId', function () {
    $wa = new WhatsAppService;
    expect($wa->toChatId('81234567890'))->toBe('6281234567890@c.us');
});

it('keeps 62xx phone as-is', function () {
    $wa = new WhatsAppService;
    expect($wa->toChatId('6281234567890'))->toBe('6281234567890@c.us');
});

it('returns null for invalid phone', function () {
    $wa = new WhatsAppService;
    expect($wa->toChatId('123'))->toBeNull();
});

it('posts correct payload to waha sendText endpoint', function () {
    Http::fake([
        'http://localhost:3000/api/sendText' => Http::response(['id' => 'ok'], 200),
    ]);

    $wa = new WhatsAppService;
    $result = $wa->send('081234567890', 'Halo dari kantin!');

    expect($result['ok'])->toBeTrue();
    expect($result['error'])->toBeNull();

    Http::assertSent(function ($request) {
        return $request->url() === 'http://localhost:3000/api/sendText'
            && $request['session'] === 'default'
            && $request['chatId'] === '6281234567890@c.us'
            && $request['text'] === 'Halo dari kantin!'
            && $request->header('X-Api-Key')[0] === 'test-key';
    });
});

it('returns error string on waha HTTP error', function () {
    Http::fake([
        'http://localhost:3000/api/sendText' => Http::response(['error' => 'session not found'], 500),
    ]);

    $wa = new WhatsAppService;
    $result = $wa->send('081234567890', 'test');

    expect($result['ok'])->toBeFalse();
    expect($result['error'])->toContain('500');
});

it('returns error when WA_ENABLED is false', function () {
    config(['services.waha.enabled' => false]);

    Http::fake();

    $wa = new WhatsAppService;
    $result = $wa->send('081234567890', 'test');

    expect($result['ok'])->toBeFalse();
    expect($result['error'])->toContain('WA_ENABLED');
    Http::assertNothingSent();
});

it('sendImage posts to /api/sendImage with file payload', function () {
    Http::fake([
        'http://localhost:3000/api/sendImage' => Http::response(['id' => 'ok'], 200),
    ]);

    $wa = new WhatsAppService;
    $result = $wa->sendImage('081234567890', 'test caption', 'https://example.com/img.jpg');

    expect($result['ok'])->toBeTrue();
    Http::assertSent(fn ($req) =>
        str_ends_with($req->url(), '/api/sendImage')
        && $req['chatId'] === '6281234567890@c.us'
        && $req['file']['url'] === 'https://example.com/img.jpg'
    );
});

it('sendDocument posts to /api/sendFile with pdf payload', function () {
    Http::fake([
        'http://localhost:3000/api/sendFile' => Http::response(['id' => 'ok'], 200),
    ]);

    $wa = new WhatsAppService;
    $result = $wa->sendDocument('081234567890', 'test doc', 'https://example.com/file.pdf', 'test.pdf');

    expect($result['ok'])->toBeTrue();
    Http::assertSent(fn ($req) =>
        str_ends_with($req->url(), '/api/sendFile')
        && $req['file']['filename'] === 'test.pdf'
        && $req['file']['mimetype'] === 'application/pdf'
    );
});

it('status returns ok true when waha reachable', function () {
    Http::fake([
        'http://localhost:3000/api/version' => Http::response(['version' => '2025.1.0'], 200),
    ]);

    $wa = new WhatsAppService;
    $result = $wa->status();

    expect($result['ok'])->toBeTrue();
    expect($result['version'])->toBe('2025.1.0');
});

it('status returns error when waha unreachable', function () {
    Http::fake([
        'http://localhost:3000/api/version' => Http::response(null, 503),
    ]);

    $wa = new WhatsAppService;
    $result = $wa->status();

    expect($result['ok'])->toBeFalse();
    expect($result['error'])->toContain('503');
});

it('job dispatches and calls send', function () {
    Queue::fake();

    SendWhatsAppMessage::dispatch('081234567890', 'test pesan');

    Queue::assertPushed(SendWhatsAppMessage::class, function ($job) {
        return $job->phone === '081234567890' && $job->message === 'test pesan';
    });
});

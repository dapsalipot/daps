<?php

namespace App\Http\Controllers;

use App\Http\Requests\ContactRequest;
use App\Mail\ContactFormMail;
use App\Models\Contact;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Inertia\Response;

class ContactController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('contact');
    }

    public function store(ContactRequest $request): RedirectResponse
    {
        $data = $request->validated();
        unset($data['website']);

        $contact = Contact::create([
            ...$data,
            'ip' => $request->ip(),
        ]);

        Mail::to(config('portfolio.links.email'))->send(new ContactFormMail($contact));

        return back()->with('contact', 'sent');
    }
}

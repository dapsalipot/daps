<x-mail::message>
# New contact from {{ $contact->name }}

**Email:** {{ $contact->email }}
**Subject:** {{ $contact->subject ?: '(none)' }}
**IP:** {{ $contact->ip ?: '(unknown)' }}
**Time:** {{ $contact->created_at->format('Y-m-d H:i:s') }}

---

{{ $contact->message }}

Thanks,<br>
DAPS Portfolio
</x-mail::message>

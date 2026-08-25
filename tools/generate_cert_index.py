#!/usr/bin/env python3
"""Generate a simple index.json manifest for certificates.

Usage: run from the repository root. It writes assets/certificates/index.json
containing entries for image and PDF files in that folder.
"""
import os
import json

ROOT = os.path.dirname(os.path.dirname(__file__))
CERT_DIR = os.path.join(ROOT, 'assets', 'certificates')
OUT_FILE = os.path.join(CERT_DIR, 'index.json')

SKIP = {'index.json', 'placeholder-cert.png'}


def make_entry(fname):
    name = os.path.splitext(fname)[0]
    title = name.replace('-', ' ').replace('_', ' ').title()
    return {
        'title': title,
        'issuer': 'Certificate',
        'year': '',
        'filename': fname,
        'description': 'Certificate credential and completion record.'
    }


def main():
    if not os.path.isdir(CERT_DIR):
        print('Certificates folder not found:', CERT_DIR)
        return

    files = []
    for item in sorted(os.listdir(CERT_DIR)):
        if item in SKIP or item.startswith('.'):
            continue
        full = os.path.join(CERT_DIR, item)
        if os.path.isfile(full) and item.lower().endswith(('.png', '.jpg', '.jpeg', '.gif', '.webp', '.pdf')):
            files.append(item)

    entries = [make_entry(f) for f in files]
    with open(OUT_FILE, 'w', encoding='utf-8') as fh:
        json.dump(entries, fh, indent=2)
    print(f'Wrote {OUT_FILE} with {len(entries)} entries')


if __name__ == '__main__':
    main()

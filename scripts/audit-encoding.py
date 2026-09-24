#!/usr/bin/env python3
"""
audit-encoding.py - Auditor de encoding del proyecto.

Verifica que todo archivo de texto del repo sea:
  1. UTF-8 valido (decode estricto)
  2. Sin BOM
  3. Sin line endings mixtos

Uso:
  python scripts/audit-encoding.py            # escanea el repo
  python scripts/audit-encoding.py <path...>  # escanea paths puntuales
Exit code: 0 = OK, 1 = al menos un archivo con fallos.

Salida ASCII-safe (regla global del operador).
"""
import io, os, sys

SKIP_DIRS = {'.git', '.vscode', 'node_modules', '__pycache__', '.codebase-memory', 'vendor'}
SKIP_EXTS = {'.png', '.jpg', '.jpeg', '.gif', '.webp', '.ico', '.pdf', '.zip', '.zst', '.woff', '.woff2', '.ttf', '.otf', '.mp3', '.mp4'}
SKIP_FILES = {'.DS_Store', 'Thumbs.db', '.editorconfig'}

def is_text(path):
    return os.path.splitext(path)[1].lower() not in SKIP_EXTS

def audit_file(path):
    problems = []
    with open(path, 'rb') as fh:
        raw = fh.read()
    if raw[:3] == b'\xef\xbb\xbf':
        problems.append('BOM detectado')
    try:
        raw.decode('utf-8')
    except UnicodeDecodeError as e:
        problems.append('UTF-8 invalido: %s' % e)
        return problems
    crlf = raw.count(b'\r\n')
    lf = raw.count(b'\n') - crlf
    if crlf > 0 and lf > 0:
        problems.append('line endings mixtos (CRLF=%d, LF=%d)' % (crlf, lf))
    return problems

def main():
    targets = sys.argv[1:] if len(sys.argv) > 1 else ['.']
    files = []
    for t in targets:
        if os.path.isfile(t):
            files.append(t)
        else:
            for root, dirs, names in os.walk(t):
                dirs[:] = [d for d in dirs if d not in SKIP_DIRS]
                for n in names:
                    p = os.path.join(root, n)
                    if n in SKIP_FILES:
                        continue
                    if is_text(p):
                        files.append(p)
    bad = 0
    for f in sorted(files):
        probs = audit_file(f)
        rel = os.path.relpath(f)
        if probs:
            bad += 1
            print('[BAD] %s' % rel)
            for pr in probs:
                print('      -> %s' % pr)
        else:
            print('[OK ] %s' % rel)
    print('---')
    print('Archivos: %d | Fallos: %d' % (len(files), bad))
    sys.exit(1 if bad else 0)

if __name__ == '__main__':
    main()
+++
title = 'Quick Python Syntax Checks from the Command Line'
date = 2025-11-07T10:00:00+11:00
draft = false
description = "A super handy trick to check Python syntax without running your code using py_compile"
categories = ['Tools']
tags = ['python', 'cli', 'testing']
+++

Today I learned a super handy trick to check Python syntax without running your
code. Perfect for catching errors early!

## From the Command Line

You can run:

```bash
python3 -m py_compile src/app/analysis.py && echo "💡 Syntax is valid – no errors found"
```

Or for another file:

```bash
python3 -m py_compile src/app/server.wsgi && echo "💡 server.wsgi syntax is valid"
```

## How it Works

- `python3 -m py_compile <file>` attempts to compile the file to bytecode (.pyc)
- If compilation succeeds, the command after `&&` runs (our little "syntax is
  good" message)
- If there's a syntax error, Python prints the error and the success message
  won't appear

## Programmatic Usage

You can also do this programmatically in Python:

```python
import py_compile

try:
    py_compile.compile("src/app/analysis.py", doraise=True)
    print("💡 analysis.py syntax is valid")
except py_compile.PyCompileError as e:
    print(f"❌ Syntax error: {e.msg}")
```

This is a super lightweight way to sanity-check code, add to CI pipelines, or
run in pre-commit hooks, without ever executing the script.

More info:
[py_compile documentation](https://docs.python.org/3/library/py_compile.html)

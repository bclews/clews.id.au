+++
title = 'Creating Type Stubs for Type Checking Without Installing Dependencies'
date = 2025-11-24T10:00:00+11:00
draft = false
description = "How to create manual type stubs to avoid installing heavy dependencies just for type checking"
categories = ['Python']
tags = ['python', 'type-checking', 'pyright', 'testing']
+++

## The Problem

When type-checking Python code, tools like Pyright need to import all
dependencies to understand function signatures. But some packages have heavy
dependencies (NetCDF libraries, scientific computing tools, databases, etc.)
that you don't want to install just for type checking.

## The Solution: Manual Type Stubs

You can create a **fake package** in your virtual environment that provides type
information without any implementation.

### How It Works

Python's import system doesn't distinguish between packages installed via pip
and packages manually created in `site-packages`. Both are treated identically.

```bash
# These are equivalent to Python's import system:
pip install phase-gap                    # Real package
mkdir -p .venv/lib/python3.X/site-packages/phase_gap  # Fake stub
```

### Example Implementation

```bash
#!/bin/bash
# Create path to stub package
STUB_DIR=".venv/lib/python$(python3 -c 'import sys; print(f"{sys.version_info.major}.{sys.version_info.minor}")')/site-packages/phase_gap"
mkdir -p "$STUB_DIR"

# Create minimal __init__.py with type signatures only
cat > "$STUB_DIR/__init__.py" << 'EOF'
"""Type stubs for phase-gap package (type checking only)."""
import pandas as pd

def run_compute_job(
    netcdf_file: str,
    export_csv: bool = False,
    output_filename: str | None = None,
    verbose: bool = False
) -> pd.DataFrame:
    """Process NetCDF tidal data."""
    ...  # Ellipsis = stub implementation

def run_analysis(
    external_tidal_data: pd.DataFrame,
    external_profile_data: pd.DataFrame,
    output_path: str
) -> int:
    """Run analysis. Returns error code (0 = success)."""
    ...
EOF
```

### Key Points

1. **Function signatures with types** - Include all parameters with type
   annotations and return types
2. **Ellipsis (`...`) for implementation** - Standard Python way to indicate
   stub/placeholder
3. **Minimal imports** - Only import what's needed for type hints (e.g.,
   `pandas` for `pd.DataFrame`)
4. **No actual logic** - The code can't run, but Pyright can validate against it

### What Pyright Sees

When analysing your code:

```python
from phase_gap import run_compute_job

tidal_df = run_compute_job(netcdf_file="foo.nc")
```

Pyright:

1. Looks in `site-packages/phase_gap/__init__.py`
2. Reads the stub signature
3. Validates that `netcdf_file="foo.nc"` matches `netcdf_file: str`
4. Infers `tidal_df` has type `pd.DataFrame`
5. **Never tries to execute the `...` implementation**

### Benefits

- **Fast setup** - Create a text file instead of installing packages
- **No bloat** - Avoid heavy dependencies (C libraries, databases, etc.)
- **Type safety** - Pyright still catches type errors
- **Clear intent** - The `...` makes it obvious this is type-checking only
- **Version control friendly** - Can check in the stub creation script

### Alternative: `.pyi` Files

The official Python approach is `.pyi` stub files:

```python
# phase_gap.pyi
import pandas as pd

def run_compute_job(
    netcdf_file: str,
    export_csv: bool = ...,
    output_filename: str | None = ...,
    verbose: bool = ...
) -> pd.DataFrame: ...
```

Both approaches work, but creating a minimal Python module is simpler and
doesn't require understanding the `.pyi` stub file format.

## Real-World Use Case

In our project, `phase-gap` has dependencies on:

- NetCDF4 (C library bindings)
- XBeach simulation tools
- Matplotlib, NumPy, Pandas
- Various scientific computing libraries

For type checking `analysis.py`, we only need to know:

- What functions exist
- What parameters they accept
- What they return

Creating a stub lets us type-check without installing any of the heavy
dependencies!

## See Also

- [PEP 484 - Type Hints](https://peps.python.org/pep-0484/)
- [PEP 561 - Distributing and Packaging Type Information](https://peps.python.org/pep-0561/)

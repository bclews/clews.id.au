+++
title = 'Setting Up Postgresql 16 and Postgis on Macos With Homebrew'
date = 2025-02-03T15:42:42+11:00
draft = false
description = "Complete guide to installing PostgreSQL 16 with PostGIS on macOS using Homebrew. Navigate dependency conflicts, compile from source, and get your spatial database running on M1/M2 Macs."
categories = ['Tutorials']
tags = ['databases', 'tutorial', 'tools']
+++
Recently, I needed to install PostgreSQL 16 with PostGIS on my MacBook M1 Pro (running macOS 15.2), and what I assumed would be a quick `brew install postgis` turned into a tedious debugging session.

As of now, the Homebrew postgis formula is linked to PostgreSQL 14. To use PostGIS with PostgreSQL 16, you'll need to compile PostGIS manually. Here are the notes from my experience.

## TL;DR: If You're in a Hurry, Here's the Script

```bash
# Stop PostgreSQL Services
brew services stop postgresql

# Remove existing PostGIS and PostgreSQL@14 to avoid conflicts
brew remove postgis
brew remove postgresql@14

# Reinstall json-c (must be done after removing old postgis)
brew uninstall json-c
brew install json-c
brew link json-c

# Install PostgreSQL 16 (if not already installed)
brew install postgresql@16
sudo ln -sf /opt/homebrew/Cellar/postgresql@16/16.4/bin/postgres /usr/local/bin/postgres
sudo chown -R "$USER":admin /usr/local/bin /usr/local/share

# Install necessary utilities
brew install wget
brew install pcre

# Fix issues with missing gettext headers
brew reinstall gettext
brew unlink gettext && brew link gettext --force

# Install PostGIS dependencies
brew install geos gdal libxml2 sfcgal protobuf-c

# Download and build PostGIS 3.5.2 from source
wget https://download.osgeo.org/postgis/source/postgis-3.5.2.tar.gz
tar -xvzf postgis-3.5.2.tar.gz
rm postgis-3.5.2.tar.gz
cd postgis-3.5.2

# Use the correct gettext version
GETTEXT_VERSION=$(brew info gettext | grep -Eo 'stable [0-9]+\.[0-9]+' | awk '{print $2}')

./configure \
  --with-projdir=/opt/homebrew/opt/proj \
  --with-pgconfig=/opt/homebrew/opt/postgresql@16/bin/pg_config \
  --with-jsondir=/opt/homebrew/opt/json-c \
  --with-sfcgal=/opt/homebrew/opt/sfcgal/bin/sfcgal-config \
  --with-pcredir=/opt/homebrew/opt/pcre \
  --without-protobuf \
  --without-topology \
  LDFLAGS="$LDFLAGS -L/opt/homebrew/Cellar/gettext/$GETTEXT_VERSION/lib" \
  CFLAGS="-I/opt/homebrew/Cellar/gettext/$GETTEXT_VERSION/include"

make
make install
```

## The Pain Points

### 1. **Homebrew's PostgreSQL Versions Can Clash**

If you have `postgresql@14` or an older version installed, you might run into conflicts. You might see errors like:

```bash
Error: The `brew link` step did not complete successfully
The formula built, but is not symlinked into /opt/homebrew
Could not symlink bin/postgres
Target /opt/homebrew/bin/postgres already exists
```

Removing older versions before installing `postgresql@16` ensures a clean setup.

### 2. **PostGIS Dependencies Can Be Finicky**

While `brew install postgis` should work in theory, the latest PostGIS versions sometimes require explicit handling of dependencies. You might encounter errors like:

```bash
configure: error: Could not find JSON-C
```

This is why we explicitly handle json-c, sfcgal, and protobuf-c installations in our script.

### 3. **The Infamous `libintl.h` Not Found Error**

If you see this error:

```bash
fatal error: 'libintl.h' file not found
#include <libintl.h>
         ^~~~~~~~~~~
1 error generated.
make: *** [lwgeom_functions_basic.o] Error 1
```

It's because macOS and Homebrew don't always expose the right `gettext` headers. The fix? Reinstall `gettext` and explicitly link it:

```bash
brew reinstall gettext
brew unlink gettext && brew link gettext --force
```

### 4. **`/usr/local/bin/postgres` Not Found? Create a Symlink**

By default, Homebrew installs PostgreSQL under `/opt/homebrew/`, but some build scripts still expect it in `/usr/local/bin/`. A simple fix is to create a symlink:

```bash
sudo ln -sf /opt/homebrew/Cellar/postgresql@16/16.4/bin/postgres /usr/local/bin/postgres
```

## Verifying the Installation

Once PostGIS is installed, you can enable it in your PostgreSQL database:

### 1. Connect to PostgreSQL

Use the `psql` command-line tool to connect:

```bash
psql postgres
```

### 2. Create a New Database (Optional)

If you want to create a new database for PostGIS:

```sql
CREATE DATABASE your_database_name;
\c your_database_name;
```

### 3. Enable PostGIS Extension

Run the following SQL command:

```sql
CREATE EXTENSION postgis;
```

### 4. Verify PostGIS Installation

Check if PostGIS is properly installed by running:

```sql
SELECT PostGIS_Full_Version();
```

If everything is working correctly, you should see a response that includes the PostGIS version, GEOS, Proj, and other details. For example:

```shell
 POSTGIS="3.5.2 dea6d0a" [EXTENSION] PGSQL="160" GEOS="3.13.0-CAPI-1.19.0" PROJ="9.5.1 NETWORK_ENABLED=OFF URL_ENDPOINT=https://cdn.proj.org USER_WRITABLE_DIRECTORY=/Users/cle126/Library/Application Support/proj DATABASE_PATH=/opt/homebrew/Cellar/proj/9.5.1/share/proj/proj.db" (compiled against PROJ 9.5.1) LIBXML="2.9.13" LIBJSON="0.18"
(1 row)
```

## Troubleshooting Common Issues

1. **PostgreSQL Service Won't Start**

   ```bash
   # Check the logs
   tail -f /opt/homebrew/var/log/postgresql@16.log
   # Ensure data directory permissions are correct
   sudo chown -R $USER:admin /opt/homebrew/var/postgresql@16
   ```

2. **PostGIS Extension Creation Fails**
   If you see "could not open extension control file", ensure PostGIS was compiled against the correct PostgreSQL version:

   ```bash
   ls -l /opt/homebrew/share/postgresql@16/extension/postgis*
   ```

3. **Memory Issues During Compilation**
   If make fails due to memory constraints, try:

   ```bash
   make -j2  # Reduces parallel jobs
   ```

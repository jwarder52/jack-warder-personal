FROM python:3.11-slim

WORKDIR /app

# Install system build tools required by amulet C/C++ extensions.
# zlib1g-dev is needed by amulet-leveldb (-lz linker flag).
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc g++ make zlib1g-dev && \
    rm -rf /var/lib/apt/lists/*

# Pre-install all build tools amulet's C/C++ extensions need globally.
# --no-build-isolation (used below) bypasses PEP 517 isolation so these are
# visible during builds of amulet-nbt, amulet-leveldb, and amulet-rocksdb.
RUN pip install --upgrade \
    "cmake>=4.1" \
    "cython~=3.0" \
    "numpy~=1.17" \
    pybind11 \
    versioneer \
    setuptools \
    wheel

COPY requirements.txt .
# amulet-rocksdb's setup.py does `import amulet` at build time, which requires
# amulet-core to be installed first. amulet-core is a pure Python wheel so we
# can install it without deps to seed the amulet namespace, then do the full
# install (which builds amulet-rocksdb and can now find `import amulet`).
# amulet/__init__.py imports amulet_nbt at load time, so both must be present
# before amulet-rocksdb's setup.py runs its `import amulet`.
# amulet-rocksdb's setup.py does `import amulet` which chain-imports all of
# amulet-core's runtime deps. Pre-install them all so amulet initialises
# cleanly inside rocksdb's setup.py. Order: namespace seed → C exts that
# built fine already → pure-Python runtime deps → full install.
RUN pip install --no-cache-dir --no-deps "amulet-core>=1.9.32"
RUN pip install --no-cache-dir --no-build-isolation "amulet-nbt~=2.0"
RUN pip install --no-cache-dir "portalocker~=2.4" "pymctranslate~=1.2" "platformdirs~=3.1" "lz4~=4.3"
RUN pip install --no-cache-dir --no-build-isolation "amulet-leveldb~=1.0"
# amulet-rocksdb is only needed for Minecraft Bedrock worlds. Our app uses Java
# Edition worlds (anvil/leveldb), so we skip the C++ build entirely by:
# 1. Creating a stub `rocksdb` module so `import amulet` succeeds at runtime
# 2. Faking an amulet-rocksdb dist-info so pip skips building the wheel
RUN python -c "import sys,os; s=next(p for p in sys.path if 'site-packages' in p and 'local' in p); os.makedirs(s+'/rocksdb',exist_ok=True); open(s+'/rocksdb/__init__.py','w').write('class RocksDB: pass\nclass Options: pass\nclass WriteOptions: pass\nclass CompressionType: pass\n'); d=s+'/amulet_rocksdb-1.0.3.dist-info'; os.makedirs(d,exist_ok=True); open(d+'/METADATA','w').write('Metadata-Version: 2.1\nName: amulet-rocksdb\nVersion: 1.0.3\n'); open(d+'/INSTALLER','w').write('pip\n'); open(d+'/RECORD','w').write('')"
RUN pip install --no-cache-dir --no-build-isolation -r requirements.txt

COPY . .

CMD uvicorn app:app --host 0.0.0.0 --port $PORT

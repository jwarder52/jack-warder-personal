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
# amulet-rocksdb's setup.py imports 'amulet' at build time, so amulet-core
# must be installed before the full requirements build kicks off.
RUN pip install --no-cache-dir "amulet-core>=1.9.32"
RUN pip install --no-cache-dir --no-build-isolation -r requirements.txt

COPY . .

CMD uvicorn app:app --host 0.0.0.0 --port $PORT

FROM python:3.11-slim

WORKDIR /app

# Install system build tools required by amulet C/C++ extensions
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc g++ make && \
    rm -rf /var/lib/apt/lists/*

# Pre-install all build tools amulet's C/C++ extensions need globally.
# --no-build-isolation (used below) bypasses PEP 517 isolation so these are
# visible during builds of amulet-nbt (no Linux wheels) and amulet-rocksdb.
RUN pip install --upgrade \
    "cmake>=4.1" \
    "cython~=3.0" \
    "numpy~=1.17" \
    versioneer \
    setuptools \
    wheel

COPY requirements.txt .
RUN pip install --no-cache-dir --no-build-isolation -r requirements.txt

COPY . .

CMD uvicorn app:app --host 0.0.0.0 --port $PORT

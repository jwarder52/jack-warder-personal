FROM python:3.11-slim

WORKDIR /app

# Install system build tools required by amulet C/C++ extensions
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc g++ make && \
    rm -rf /var/lib/apt/lists/*

# Install cmake 4.1+ globally via pip so amulet-rocksdb can find it
# --no-build-isolation lets the build env see the globally installed cmake
RUN pip install --upgrade "cmake>=4.1"

COPY requirements.txt .
RUN pip install --no-cache-dir --no-build-isolation -r requirements.txt

COPY . .

CMD uvicorn app:app --host 0.0.0.0 --port $PORT

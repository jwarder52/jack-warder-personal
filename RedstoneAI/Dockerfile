FROM python:3.11-slim

WORKDIR /app

# Install cmake 4.1+ via pip so amulet-rocksdb can build
RUN pip install --upgrade "cmake>=4.1"

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD uvicorn app:app --host 0.0.0.0 --port $PORT

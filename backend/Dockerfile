FROM python:3.12-slim

ENV PYTHONUNBUFFERED=1

RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY . .

# torch (pulled in by docling) defaults to CUDA builds on Linux, dragging in
# 1.5GB+ of nvidia-* GPU packages this CPU-only cron job never uses. Install
# the CPU-only wheels first so the resolver doesn't reach for the GPU ones.
RUN pip install --no-cache-dir uv \
    && uv pip install --system torch==2.13.0 torchvision==0.28.0 --index-url https://download.pytorch.org/whl/cpu \
    && uv pip install --system .

CMD ["python", "main.py"]

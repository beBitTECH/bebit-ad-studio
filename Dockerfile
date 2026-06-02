FROM python:3.11-slim

RUN apt-get update && apt-get install -y \
    nodejs \
    npm \
    chromium \
    libnss3 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libgbm1 \
    libasound2t64 \
    libpangocairo-1.0-0 \
    libgtk-3-0 \
    libxshmfence1 \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY package*.json .
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
RUN npm ci

COPY . .

CMD gunicorn app:app --bind 0.0.0.0:$PORT

FROM node:18

# ✅ Install bash dan netcat
RUN apt-get update && apt-get install -y netcat-openbsd bash

WORKDIR /app

# Salin file package.json dan install dependency
COPY package*.json ./
RUN npm install

# Salin semua source code
COPY . .
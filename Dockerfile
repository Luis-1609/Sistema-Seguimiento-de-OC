# === Desarrollo ===
FROM node:20-alpine AS dev

WORKDIR /app

# Instalar dependencias primero (cacheo de capas)
COPY package.json package-lock.json* ./
RUN npm install

# El código fuente se monta como volumen en docker-compose
# para tener hot-reload sin rebuild

EXPOSE 3000

# Variable de entorno para que Next.js escuche en todas las interfaces
ENV HOSTNAME=0.0.0.0

CMD ["npm", "run", "dev"]

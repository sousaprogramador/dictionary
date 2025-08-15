# ---------- builder ----------
FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json yarn.lock* package-lock.json* ./
RUN if [ -f yarn.lock ]; then yarn install --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; else npm i; fi

COPY tsconfig*.json ./
COPY nest-cli.json ./
COPY ormconfig.ts ./
COPY src ./src

RUN yarn build

# ---------- runner ----------
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY package.json yarn.lock* package-lock.json* ./
RUN if [ -f yarn.lock ]; then yarn install --frozen-lockfile --production; \
  elif [ -f package-lock.json ]; then npm ci --omit=dev; else npm i --omit=dev; fi

COPY --from=builder /app/dist ./dist

EXPOSE 3000
CMD ["node", "dist/src/main.js"]

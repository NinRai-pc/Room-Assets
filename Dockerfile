# ---- Base dependencies stage ----
FROM node:24-alpine AS deps
WORKDIR /app
COPY app/package*.json ./
RUN npm ci

# ---- Dev stage: Vite with HMR ----
FROM node:24-alpine AS dev
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY app/ .
EXPOSE 5173
CMD ["npm", "run", "dev"]

# ---- Build stage: Compile static dist ----
FROM node:24-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY app/ .
RUN npm run build

# ---- Prod stage: Nginx + static files ----
FROM nginx:1.27-alpine AS prod
RUN rm -f /etc/nginx/conf.d/default.conf
COPY nginx/nginx.conf /etc/nginx/conf.d/app.conf
COPY --from=build /app/dist/ /usr/share/nginx/html/
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

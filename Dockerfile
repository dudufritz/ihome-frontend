# ═══════════════════════════════════════════════════════════════════
#  iHome — frontend servido por Caddy
#
#  A imagem final contém o build do React E o servidor web. Isso resolve
#  um problema concreto do deploy em VM: se o Caddy lesse os arquivos de
#  uma pasta na máquina, atualizar o site exigiria copiá-los por SSH —
#  exatamente o que a disciplina veda. Empacotando tudo na imagem, a
#  atualização vira "publicar imagem nova", e a VM se atualiza sozinha.
# ═══════════════════════════════════════════════════════════════════

# ── ESTÁGIO 1: build do React ──
FROM node:24-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# ⚠️ No Create React App as variáveis REACT_APP_* são substituídas no
# código DURANTE O BUILD, não lidas em execução. Por isso o valor precisa
# entrar aqui, e não como variável do contêiner.
#
# O padrão é /api porque o Caddy serve frontend e API no MESMO domínio:
# uma URL relativa dispensa CORS e funciona em qualquer domínio para o
# qual a imagem for publicada.
ARG REACT_APP_API_URL=/api
ENV REACT_APP_API_URL=$REACT_APP_API_URL

# CI=false: o CRA trata avisos como erro quando CI=true, e um aviso de
# lint não deve impedir a publicação.
RUN CI=false npm run build


# ── ESTÁGIO 2: servidor ──
FROM caddy:2-alpine AS runtime

# Só o resultado do build entra na imagem final: nada de node_modules,
# código-fonte ou testes. A imagem sai com poucas dezenas de MB.
COPY --from=build /app/build /srv
COPY Caddyfile /etc/caddy/Caddyfile

EXPOSE 80 443

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -q --spider http://127.0.0.1/ || exit 1

#!/usr/bin/env bash
# Genera un .htpasswd compatible con Apache usando openssl
# Uso: ./generate_htpasswd.sh usuario > /absolute/path/to/admin/.htpasswd
# Requiere openssl instalado

if [ "$#" -ne 1 ]; then
  echo "Uso: $0 <usuario>" >&2
  exit 1
fi
USER="$1"
# Genera hash MD5 estilo Apache (apr1)
HASH=$(openssl passwd -apr1)
# openssl passwd without argument prompts; use -1 for MD5 crypt; some systems support -apr1
# Mejor usar htpasswd si está disponible: htpasswd -nbB usuario contraseña
if command -v htpasswd >/dev/null 2>&1; then
  echo "Usando htpasswd para generar la entrada"
  htpasswd -nbB "$USER" $(read -s -p "Password: " PW; echo "$PW")
else
  echo "htpasswd no disponible. Se recomienda instalar apache2-utils o apache-tools" >&2
  echo "Puedes generar manualmente usando: htpasswd -nbB usuario contraseña" >&2
  exit 2
fi

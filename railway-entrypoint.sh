#!/bin/sh
set -eu

PORT_VALUE="${PORT:-10000}"
SERVER_XML="${CATALINA_HOME}/conf/server.xml"

# Railway expects the app to listen on PORT.
sed -i "s/port=\"8080\" protocol=\"HTTP\\/1.1\"/port=\"${PORT_VALUE}\" protocol=\"HTTP\\/1.1\"/" "$SERVER_XML"

exec catalina.sh run

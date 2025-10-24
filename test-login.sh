#!/bin/bash

echo "Testing login..."
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@muponi.co.za\",\"password\":\"Demo!234\"}" \
  -c cookies.txt \
  -w "\n\nStatus: %{http_code}\n"

echo -e "\n\nTesting /me endpoint..."
curl http://localhost:3000/api/auth/me \
  -b cookies.txt \
  -w "\n\nStatus: %{http_code}\n"

echo -e "\n\nTesting contacts..."
curl http://localhost:3000/api/contacts \
  -b cookies.txt \
  -w "\n\nStatus: %{http_code}\n"

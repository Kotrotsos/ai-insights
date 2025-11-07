#!/bin/bash
set -e

# Set a placeholder DATABASE_URL if not already set (for build phase)
if [ -z "$DATABASE_URL" ]; then
  export DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder"
fi

# Run prisma generate and next build
prisma generate
next build

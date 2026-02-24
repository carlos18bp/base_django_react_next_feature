#!/bin/bash

# Script para ejecutar todas las pruebas y generar un resumen
# Usage: bash scripts/test-summary.sh

set -e

echo "======================================"
echo "🧪 EJECUTANDO SUITE COMPLETA DE PRUEBAS"
echo "======================================"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}📊 Paso 1/2: Ejecutando pruebas unitarias con cobertura...${NC}"
echo ""
npm run test:coverage
echo ""

echo -e "${BLUE}🎭 Paso 2/2: Ejecutando pruebas E2E con Playwright...${NC}"
echo ""
npm run test:e2e
echo ""

echo -e "${GREEN}✅ TODAS LAS PRUEBAS COMPLETADAS${NC}"
echo ""
echo "======================================"
echo "📈 RESUMEN"
echo "======================================"
echo ""
echo "Reportes generados:"
echo "  - Cobertura unitaria: coverage/lcov-report/index.html"
echo "  - Resultados E2E: test-results/"
echo ""
echo "Para ver el reporte de Playwright:"
echo "  npx playwright show-report"
echo ""
echo "Para ver la cobertura en el navegador:"
echo "  open coverage/lcov-report/index.html"
echo ""

#!/bin/bash

# SEO Verification Script
# Run this script to verify your site's SEO configuration
# Usage: ./verify-seo.sh

echo "🔍 News Today SEO Verification"
echo "================================="
echo ""

SITE_URL="https://today-news-pathum.vercel.app"

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to check URL accessibility
check_url() {
    local url=$1
    local name=$2
    echo -n "Checking $name... "
    
    response=$(curl -s -o /dev/null -w "%{http_code}" "$url")
    
    if [ "$response" = "200" ]; then
        echo -e "${GREEN}✓ OK (200)${NC}"
        return 0
    else
        echo -e "${RED}✗ FAILED ($response)${NC}"
        return 1
    fi
}

# Function to check for content
check_content() {
    local url=$1
    local name=$2
    local pattern=$3
    echo -n "Checking $name... "
    
    response=$(curl -s "$url")
    
    if echo "$response" | grep -q "$pattern"; then
        echo -e "${GREEN}✓ FOUND${NC}"
        return 0
    else
        echo -e "${RED}✗ NOT FOUND${NC}"
        return 1
    fi
}

# 1. Sitemap Check
echo -e "${YELLOW}1. Sitemap Verification${NC}"
check_url "$SITE_URL/sitemap.xml" "Sitemap XML"
check_content "$SITE_URL/sitemap.xml" "Sitemap URLs" "<url>"
check_content "$SITE_URL/sitemap.xml" "Change Frequency" "changefreq"
check_content "$SITE_URL/sitemap.xml" "Priority" "priority"
echo ""

# 2. Robots.txt Check
echo -e "${YELLOW}2. Robots.txt Verification${NC}"
check_url "$SITE_URL/robots.txt" "Robots.txt"
check_content "$SITE_URL/robots.txt" "User-Agent rules" "User-Agent"
check_content "$SITE_URL/robots.txt" "Sitemap reference" "sitemap"
echo ""

# 3. Homepage Meta Tags
echo -e "${YELLOW}3. Homepage Meta Tags${NC}"
check_content "$SITE_URL/" "Title tag" "<title>"
check_content "$SITE_URL/" "Meta description" "meta name=\"description\""
check_content "$SITE_URL/" "Open Graph tags" "property=\"og:"
check_content "$SITE_URL/" "Twitter Card tags" "twitter:"
echo ""

# 4. Category Pages
echo -e "${YELLOW}4. Category Pages${NC}"
categories=("general" "business" "technology" "science" "entertainment" "health" "sports")
for cat in "${categories[@]}"; do
    check_url "$SITE_URL/?category=$cat" "Category: $cat"
done
echo ""

# 5. Structured Data
echo -e "${YELLOW}5. Structured Data (JSON-LD)${NC}"
check_content "$SITE_URL/" "NewsMediaOrganization schema" "NewsMediaOrganization"
check_content "$SITE_URL/" "WebSite schema" "WebSite"
check_content "$SITE_URL/" "BreadcrumbList schema" "BreadcrumbList"
echo ""

# 6. Dashboard Protection
echo -e "${YELLOW}6. Dashboard Protection${NC}"
check_url "$SITE_URL/dashboard/login" "Dashboard login page"
echo -n "Checking robots.txt blocks /dashboard/... "
response=$(curl -s "$SITE_URL/robots.txt")
if echo "$response" | grep -q "Disallow:.*dashboard"; then
    echo -e "${GREEN}✓ BLOCKED${NC}"
else
    echo -e "${RED}✗ NOT BLOCKED${NC}"
fi
echo ""

# 7. Security Headers
echo -e "${YELLOW}7. Security Headers${NC}"
echo -n "Checking X-Content-Type-Options... "
header=$(curl -s -I "$SITE_URL" | grep -i "X-Content-Type-Options")
if [ ! -z "$header" ]; then
    echo -e "${GREEN}✓ PRESENT${NC}"
else
    echo -e "${YELLOW}⚠ NOT PRESENT (may be optional)${NC}"
fi

echo -n "Checking HTTPS... "
if [[ "$SITE_URL" == https://* ]]; then
    echo -e "${GREEN}✓ ENABLED${NC}"
else
    echo -e "${RED}✗ DISABLED${NC}"
fi
echo ""

# 8. Performance
echo -e "${YELLOW}8. Performance Checks${NC}"
echo "⚠️  Manual checks required:"
echo "   - Visit: https://pagespeed.web.dev/"
echo "   - Enter: $SITE_URL"
echo "   - Target: > 90 score"
echo ""

# 9. Manual Tools
echo -e "${YELLOW}9. Manual SEO Verification Tools${NC}"
echo "Please use these tools for comprehensive SEO verification:"
echo ""
echo "🔍 Schema Validation:"
echo "   https://validator.schema.org/"
echo ""
echo "🐦 Twitter Card Validator:"
echo "   https://cards-dev.twitter.com/validator"
echo ""
echo "📱 Mobile-Friendly Test:"
echo "   https://search.google.com/test/mobile-friendly"
echo ""
echo "📊 Google Search Console:"
echo "   https://search.google.com/search-console"
echo ""
echo "🔗 Backlink Checker:"
echo "   https://www.ahrefs.com/backlink-checker"
echo ""
echo "⚡ PageSpeed Insights:"
echo "   https://pagespeed.web.dev/"
echo ""

# Summary
echo -e "${YELLOW}=================================${NC}"
echo "✅ Automated SEO checks completed"
echo "⚠️  Please run manual verification using tools above"
echo "📖 See SEO_GUIDE.md for detailed information"
echo ""

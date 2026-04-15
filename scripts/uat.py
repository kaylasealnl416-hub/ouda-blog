# -*- coding: utf-8 -*-
"""UAT -- ouda-blog (server must be running on port 3000)"""

import sys, re, urllib.request
sys.stdout.reconfigure(encoding="utf-8")

from playwright.sync_api import sync_playwright, expect

BASE = "http://localhost:3000"
results = []

def check(name, fn):
    try:
        fn()
        print("  [PASS]  " + name)
        results.append((name, True, None))
    except Exception as e:
        msg = str(e).split("\n")[0][:120]
        print("  [FAIL]  " + name)
        print("          " + msg)
        results.append((name, False, msg))


with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    ctx = browser.new_context(viewport={"width": 1280, "height": 800})
    page = ctx.new_page()

    # ── 1. Homepage ──────────────────────────────────────────────
    print("\n[1] Homepage")
    page.goto(BASE, timeout=60000, wait_until="domcontentloaded")
    page.wait_for_load_state("networkidle", timeout=60000)

    check("H1 brand name visible",
          lambda: expect(page.locator("h1").first).to_be_visible())
    check("brand name h1 not empty",
          lambda: expect(page.locator("h1").first).not_to_have_text(""))
    check("article post links exist",
          lambda: expect(page.locator("a[href*='/posts/']").first).to_be_visible())

    # ── 2. Category filter ───────────────────────────────────────
    print("\n[2] Category filter")

    def test_category_count():
        count = page.locator("a[href*='category=']").count()
        assert count >= 4, "expected >= 4 category tabs, got %d" % count

    check("at least 4 category tabs", test_category_count)

    def test_ai_filter():
        page.locator("a[href*='category=ai']").first.click()
        # Next.js client-side navigation via pushState; poll URL
        page.wait_for_timeout(2000)
        assert "category=ai" in page.url, "URL missing category=ai: " + page.url

    check("click AI tab -> URL updates to category=ai", test_ai_filter)

    def test_stock_filter():
        page.goto(BASE + "/?category=stock", timeout=60000, wait_until="domcontentloaded")
        page.wait_for_load_state("networkidle", timeout=30000)
        links = page.locator("a[href*='/posts/']").count()
        assert links > 0, "no posts shown for stock category"

    check("stock category shows posts", test_stock_filter)

    page.goto(BASE, timeout=60000, wait_until="domcontentloaded")
    page.wait_for_load_state("networkidle", timeout=60000)

    # ── 3. Post detail ───────────────────────────────────────────
    print("\n[3] Post detail page")

    first_href = page.locator("a[href*='/posts/']").first.get_attribute("href")

    def open_post():
        target = (BASE + first_href) if first_href.startswith("/") else first_href
        page.goto(target, timeout=60000, wait_until="domcontentloaded")
        page.wait_for_load_state("networkidle", timeout=30000)

    check("can open first post", open_post)
    check("post has h1 title",
          lambda: expect(page.locator("h1").first).to_be_visible())
    check("post has prose content",
          lambda: expect(page.locator(".prose").first).to_be_visible())
    check("back-to-home link exists",
          lambda: expect(page.locator("a[href='/']").first).to_be_visible())

    # ── 4. 404 protection ────────────────────────────────────────
    print("\n[4] 404 protection")

    def test_404():
        page.goto(BASE + "/posts/this-slug-xyz-does-not-exist",
                  timeout=30000, wait_until="domcontentloaded")
        page.wait_for_load_state("networkidle", timeout=20000)
        content = page.content()
        assert ("404" in content or "not found" in content.lower()), \
            "unknown slug did not return 404"

    check("unknown slug -> 404 page", test_404)

    # ── 5. Admin auth guard ──────────────────────────────────────
    print("\n[5] Admin auth guard")

    def test_admin_redirect():
        # fresh context (no cookie)
        fresh = browser.new_context()
        p2 = fresh.new_page()
        p2.goto(BASE + "/admin", timeout=20000, wait_until="domcontentloaded")
        p2.wait_for_load_state("networkidle", timeout=15000)
        url = p2.url
        fresh.close()
        assert "/admin/login" in url, "no redirect, url=" + url

    check("unauthenticated /admin redirects to login", test_admin_redirect)

    page.goto(BASE + "/admin/login", timeout=20000, wait_until="domcontentloaded")
    page.wait_for_load_state("networkidle", timeout=15000)
    check("login page has password input",
          lambda: expect(page.locator("input[type='password']")).to_be_visible())
    check("login page has submit button",
          lambda: expect(page.locator("button[type='submit'], button").first).to_be_visible())

    # ── 6. About page ────────────────────────────────────────────
    print("\n[6] About page")
    page.goto(BASE + "/about", timeout=20000, wait_until="domcontentloaded")
    page.wait_for_load_state("networkidle", timeout=20000)

    check("about page loads (200)",
          lambda: expect(page.locator("body")).to_be_visible())
    check("about page has text content",
          lambda: expect(page.locator("main h1, main h2, main p").first).to_be_visible())

    # ── 7. Security headers ──────────────────────────────────────
    print("\n[7] Security headers")

    def check_headers():
        req = urllib.request.urlopen(BASE, timeout=30)
        headers = {k.lower(): v for k, v in req.headers.items()}
        missing = [h for h in [
            "x-frame-options",
            "x-content-type-options",
            "referrer-policy",
        ] if h not in headers]
        assert not missing, "missing: " + str(missing)

    check("security headers present", check_headers)

    # ── 8. Mobile viewport ───────────────────────────────────────
    print("\n[8] Mobile (390px)")
    m = browser.new_context(viewport={"width": 390, "height": 844})
    mp = m.new_page()
    mp.goto(BASE, timeout=30000, wait_until="domcontentloaded")
    mp.wait_for_load_state("networkidle", timeout=30000)

    check("mobile: homepage loads",
          lambda: expect(mp.locator("h1").first).to_be_visible())
    check("mobile: post links visible",
          lambda: expect(mp.locator("a[href*='/posts/']").first).to_be_visible())

    m.close()
    ctx.close()
    browser.close()

# ── Summary ───────────────────────────────────────────────────────
total  = len(results)
passed = sum(1 for _, ok, _ in results if ok)
failed = total - passed

print("\n" + "=" * 50)
print("UAT: %d/%d passed" % (passed, total))
if failed:
    print("%d FAILED:" % failed)
    for name, ok, err in results:
        if not ok:
            print("  x " + name)
            print("    " + (err or ""))
print("=" * 50)
sys.exit(0 if failed == 0 else 1)

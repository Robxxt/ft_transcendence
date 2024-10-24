import re
from playwright.sync_api import Playwright, sync_playwright, expect


def run(playwright: Playwright) -> None:
    browser = playwright.chromium.launch(headless=False)
    context = browser.new_context()
    page = context.new_page()
    page.goto("http://localhost:8000/")
    page.get_by_role("link", name="Register here").click()
    page.get_by_placeholder("User Name").click()
    page.get_by_placeholder("User Name").fill("paghe")
    page.get_by_placeholder("Password", exact=True).click()
    page.get_by_placeholder("Password", exact=True).press("CapsLock")
    page.get_by_placeholder("Password", exact=True).fill("")
    page.get_by_placeholder("Password", exact=True).press("CapsLock")
    page.get_by_placeholder("Password", exact=True).fill("P4p3r1n0")
    page.get_by_placeholder("Repeat Password").click()
    page.get_by_placeholder("Repeat Password").press("CapsLock")
    page.get_by_placeholder("Repeat Password").fill("P4p3r1n0")
    page.get_by_role("button", name="Register").click()
    page.get_by_placeholder("Welcome Player").click()
    page.get_by_placeholder("Welcome Player").fill("paghe")
    page.get_by_placeholder("Password").click()
    page.get_by_placeholder("Password").press("CapsLock")
    page.get_by_placeholder("Password").fill("P4p3r1n0")
    page.get_by_role("button", name="Login").click()
    page.get_by_role("button", name="Just play Pong").click()
    page.get_by_role("button", name="Join Game Room").click()

    # ---------------------
    context.close()
    browser.close()


with sync_playwright() as playwright:
    run(playwright)

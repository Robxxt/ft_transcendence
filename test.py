import re
from playwright.sync_api import Playwright, sync_playwright, expect


def run(playwright: Playwright) -> None:
    browser = playwright.chromium.launch(headless=False)
    context = browser.new_context()
    page = context.new_page()
    page.goto("http://localhost:8000/")
    page.get_by_placeholder("Welcome Player").click()
    page.get_by_placeholder("Welcome Player").fill("lena1234")
    page.get_by_placeholder("Password").click()
    page.get_by_placeholder("Password").fill("lena1234")
    page.get_by_role("button", name="Login").click()
    page.get_by_placeholder("Password").dblclick()
    page.get_by_placeholder("Password").fill("hola1234")
    page.get_by_role("button", name="Login").click()
    page.get_by_role("button", name="Login").click()
    page.get_by_placeholder("Welcome Player").click()
    page.get_by_placeholder("Welcome Player").fill("lena")
    page.get_by_role("button", name="Login").click()
    page.close()

    # ---------------------
    context.close()
    browser.close()


with sync_playwright() as playwright:
    run(playwright)

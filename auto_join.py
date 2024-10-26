import re
from playwright.sync_api import Playwright, sync_playwright, expect

import sys
import time

if len(sys.argv) != 2:
	sys.exit("Must have a username as argument!")


def run(playwright: Playwright, user_name: str) -> None:
    browser = playwright.chromium.launch(headless=False)
    context = browser.new_context()
    page = context.new_page()
    page.goto("http://localhost:8000/")
    page.get_by_role("link", name="Register here").click()
    page.get_by_placeholder("User Name").click()
    page.get_by_placeholder("User Name").fill(user_name)
    page.get_by_placeholder("Password", exact=True).click()
    page.get_by_placeholder("Password", exact=True).fill("hola1234")
    page.get_by_placeholder("Repeat Password").click()
    page.get_by_placeholder("Repeat Password").fill("hola1234")
    page.get_by_role("button", name="Register").click()
    page.go_back()
    page.get_by_placeholder("Welcome Player").click()
    page.get_by_placeholder("Welcome Player").fill(user_name)
    page.get_by_placeholder("Password").click()
    page.get_by_placeholder("Password").fill("hola1234")
    page.get_by_role("button", name="Login").click()
    page.get_by_role("button", name="Just play Pong").click()
    page.get_by_role("button", name="Join Game Room").click()
    page.get_by_role("button", name="Start Game").click()
    page.get_by_role("button", name="Start Game").click()
    time.sleep(20)
    page.close()

    # ---------------------
    context.close()
    browser.close()


with sync_playwright() as playwright:
	run(playwright, sys.argv[1])

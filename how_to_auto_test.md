# How to generate automatically a user

```bash
python3 -m venv venv
source venv/bin/activate
pip install playwright
playwright install chromium
```

# How to build your own automations

*Note*: you must be inside the venv!

```bash
playwright codegen localhost:8000 --output test.py
```

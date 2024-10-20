import subprocess


def start_server(script_name, port):
    subprocess.Popen(["python", script_name])


if __name__ == "__main__":
    services = [
        ("news.py", 8000),
        ("portfolio_rebalancing.py", 8001),
        ("portfolio_summarizer.py", 8002),
        ("tax_saving.py", 8003),
    ]

    for script, port in services:
        start_server(script, port)

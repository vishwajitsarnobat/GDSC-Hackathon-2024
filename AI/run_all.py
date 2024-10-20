import subprocess
import signal
import sys
import time

processes = []


def start_server(script_name, port):
    process = subprocess.Popen(["python", script_name])
    processes.append(process)


def terminate_processes(signal, frame):
    print("Terminating all processes...")
    for process in processes:
        process.terminate()
    for process in processes:
        process.wait()  # Wait for the process to terminate
    sys.exit(0)


if __name__ == "__main__":
    services = [
        ("news.py", 8000),
        ("portfolio_rebalancing.py", 8001),
        ("portfolio_summarizer.py", 8002),
        ("tax_saving.py", 8003),
    ]

    signal.signal(signal.SIGINT, terminate_processes)

    for script, port in services:
        start_server(script, port)

    # Keep the main thread alive to catch signals
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        terminate_processes(None, None)

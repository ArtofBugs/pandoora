import sqlite3

try:
    tasks_db = sqlite3.connect("tasks.db")
    assert tasks_db.total_changes == 0
except AssertionError:
    print("Error initializing task databse. Exiting.")
    exit(1)

def show_tasks():
    print("Not yet implemented")

def show_specific_task():
    print("Not yet implemented")

def add_task():
    print("Not yet implemented")

def edit_task():
    print("Not yet implemented")

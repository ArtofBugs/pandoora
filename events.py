import sqlite3

events_db = sqlite3.connect("events.db")
cursor =  events_db.cursor()
cursor.execute("CREATE TABLE events (name TEXT, description TEXT, start_date DATE, start_time TIME, end_date DATE, end_time TIME, reward INTEGER)")

def show_set_events():
    print(cursor.execute("SELECT name, start_date, start_time FROM events").fetchall())

def show_specific_set_event():
    name = input("Event name (required): ")
    print(cursor.execute("SELECT name, description, start_date, start_time, end_date, end_time, reward FROM events WHERE name = ?", (name)).fetchall())

def add_set_event():
    name = input("Event name (required): ")
    description = input("Description: ")
    start_date = input("Start Date: ")
    start_time = input("Start Time: ")
    end_date = input("End Date: ")
    end_time = input("End Time: ")
    reward = input("Reward Level: ")
    cursor.execute(f"INSERT INTO events VALUES ('{name}', '{description}', '{start_date}', '{start_time}', '{end_date}', '{end_time}', '{reward}')")

def edit_set_event():
    print("Not yet implemented")

def delete_set_event():
    print("Not yet implemented")

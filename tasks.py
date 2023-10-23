import sqlite3

# TODO: tasks and events are pretty similar... might make a class to abstract out
tasks_db = sqlite3.connect("tasks.db")
cursor =  tasks_db.cursor()
cursor.execute("CREATE TABLE tasks (name TEXT, description TEXT, end_date DATE, end_time TIME, planned_date DATE, actual_date DATE, reward INTEGER)")

def show_tasks():
    print(cursor.execute("SELECT name, end_date, end_time, reward FROM tasks").fetchall())

def show_specific_task():
    name = input("Task name (required): ")
    print(cursor.execute("SELECT name, description, end_date, end_time, planned_date, actual_date, reward FROM tasks WHERE name = ?", (name)).fetchall())

def add_task():
    # TODO: make a list of field names and their human readable names so this can be procedurally generated
    name = input("Task name (required): ")
    description = input("Description: ")
    end_date = input("End Date: ")
    end_time = input("End Time: ")
    planned_date = input("Planned Date: ")
    reward = input("Reward Level: ")
    cursor.execute(f"INSERT INTO tasks VALUES ('{name}', '{description}', '{end_date}', '{end_time}', '{planned_date}', '', '{reward}')")

def edit_task():
    print("Not yet implemented")

def delete_task():
    print("Not yet implemented")

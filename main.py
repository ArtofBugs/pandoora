import calendar
import sqlite3

from functions import *

actions = [
    show_month,
    show_week,
    show_focus_blocks,
    show_reward_blocks,
    show_tasks,
    show_specific_task,
    show_set_events,
    show_specific_set_event,
    add_task,
    add_set_event,
    edit_task,
    edit_set_event,
    enable_locking,
    disable_locking,
    activate_focus_block,
    activate_reward_block,
    config_focus_block,
    config_reward_block,
    config_rewards,
]

menu = [
    "Show month",
    "Show week",
    "Show focus blocks",
    "Show reward blocks",
    "Show tasks",
    "Show specific task",
    "Show set events",
    "Show specific set event",
    "Add task",
    "Add set event",
    "Edit task",
    "Edit set event",
    "Enable locking",
    "Disable locking",
    "Activate focus block",
    "Activate reward block",
    "Configure focus block length",
    "Configure reward block length",
    "Configure reward amounts",
    "Quit",
]

def prompt():
    while (True):
        print("(pandoora)> ", end = "")
        try:
            choice = int(input())
        except ValueError:
            print("Invalid option")
            continue

        if int(choice) not in range(1, len(menu)+1):
            print("Invalid option.")
            continue
        
        if choice == len(menu):
            print("Thanks for using Pandoora! Exiting.")
            return

        actions[int(choice)-1]()

def show_menu():

    for n in range(len(menu)):
        print(str(n+1) + "." + menu[n])

def main():
    show_menu()
    prompt()

if __name__ == '__main__':
    main()



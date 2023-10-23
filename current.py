import sqlite3

try:
    config_db = sqlite3.connect("config.db")
    assert config_db.total_changes == 0
except AssertionError:
    print("Error initializing config database. Exiting.")
    exit(1)

def activate_focus_block():
    print("Not yet implemented")

def activate_reward_block():
    print("Not yet implemented")

def enable_locking():
    print("Not yet implemented")

def disable_locking():
    print("Not yet implemented")

def config_focus_block():
    print("Not yet implemented")

def config_reward_block():
    print("Not yet implemented")

def config_rewards():
    print("Not yet implemented")
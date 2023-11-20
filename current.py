import sqlite3


events_db = sqlite3.connect("events.db")
cursor =  events_db.cursor()
cursor.execute("CREATE TABLE config (field TEXT, value INTEGER)")
cursor.execute("INSERT INTO config VALUES ('focus_blocks', '10')")
cursor.execute("INSERT INTO config VALUES ('reward_blocks', '10')")
cursor.execute("INSERT INTO config VALUES ('locking', '1')")


def show_focus_blocks():
    print("Not yet implemented")

def show_reward_blocks():
    print("Not yet implemented")

def activate_focus_block():
    print("Not yet implemented")

def activate_reward_block():
    print("Not yet implemented")

def enable_locking():
    print("Not yet implemented")

def disable_locking():
    cursor.execute("UPDATE config SET value = '0' WHERE field = 'locking'")

def config_focus_block():
    print("Not yet implemented")

def config_reward_block():
    print("Not yet implemented")

def config_rewards():
    print("Not yet implemented")
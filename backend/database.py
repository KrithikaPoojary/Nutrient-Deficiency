import sqlite3

def connect_db():
    return sqlite3.connect("nutrient.db")

def create_tables():
    conn = connect_db()
    cursor = conn.cursor()

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        age INTEGER,
        gender TEXT,
        lifestyle TEXT
    )
    """)

    conn.commit()
    conn.close()

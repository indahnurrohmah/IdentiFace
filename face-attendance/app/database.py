from multiprocessing import connection
import  os
import psycopg2
from pgvector.psycopg2 import register_vector
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

def get_connection():
    conn = psycopg2.connect(DATABASE_URL)
    register_vector(conn)
    return conn

def test_connection():
    try:
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("SELECT version();")
        version = cur.fetchone()
        cur.close()
        conn.close()
        print(f"Database connected: POstgreSQL version: {version[0]}")
        return True
    except Exception as e:
        print(f"Database connection failed: {e}")
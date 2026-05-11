import os
import psycopg2
import psycopg2.extras
from psycopg2 import pool
from dotenv import load_dotenv

load_dotenv()

class DatabaseService:
    _pool = None

    def __init__(self):
        self.db_url = os.getenv("DATABASE_URL")
        if not self.db_url or "[YOUR-PASSWORD]" in self.db_url:
            print("Warning: DATABASE_URL not configured correctly in .env")
        
        # Inicializar el pool si no existe
        if DatabaseService._pool is None and self.db_url:
            try:
                DatabaseService._pool = psycopg2.pool.SimpleConnectionPool(
                    1, 10, self.db_url
                )
                print("Database connection pool initialized.")
            except Exception as e:
                print(f"Error initializing connection pool: {e}")

    def _get_connection(self):
        if DatabaseService._pool:
            return DatabaseService._pool.getconn()
        return None

    def _release_connection(self, conn):
        if DatabaseService._pool and conn:
            DatabaseService._pool.putconn(conn)

    def create_session(self, company_name: str, department: str, task_name: str = "", monthly_agreement: float = 0, minutes_per_hour: float = 60, staff_count: int = 1, hourly_cost: float = 0):
        conn = self._get_connection()
        if not conn: return None
        
        try:
            with conn:
                with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
                    query = """
                    INSERT INTO sessions (company_name, department, task_name, monthly_agreement, minutes_per_hour, staff_count, hourly_cost)
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                    RETURNING *;
                    """
                    cur.execute(query, (company_name, department, task_name, monthly_agreement, minutes_per_hour, staff_count, hourly_cost))
                    return cur.fetchone()
        finally:
            self._release_connection(conn)

    def add_activity(self, session_id: str, activity_data: dict):
        conn = self._get_connection()
        if not conn: return None
        
        try:
            # Calculate annual minutes if not provided (20 working days * 12 months)
            time_unit = activity_data.get("time_unit", 0)
            volume_daily = activity_data.get("volume_daily", 0)
            annual_minutes = time_unit * volume_daily * 20 * 12
            
            with conn:
                with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
                    query = """
                    INSERT INTO activities (
                        session_id, name, category, classification, 
                        time_unit, volume_daily, annual_minutes, 
                        justification, is_confirmed
                    )
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, TRUE)
                    RETURNING *;
                    """
                    cur.execute(query, (
                        session_id,
                        activity_data.get("name") or "Actividad sin nombre",
                        activity_data.get("category") or "Operación",
                        activity_data.get("classification") or "VA",
                        time_unit,
                        volume_daily,
                        annual_minutes,
                        activity_data.get("justification") or ""
                    ))

                    return cur.fetchone()
        finally:
            self._release_connection(conn)

    def get_session_activities(self, session_id: str):
        conn = self._get_connection()
        if not conn: return []
        
        try:
            with conn:
                with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
                    query = "SELECT * FROM activities WHERE session_id = %s ORDER BY created_at;"
                    cur.execute(query, (session_id,))
                    return cur.fetchall()
        finally:
            self._release_connection(conn)

    def get_session(self, session_id: str):
        conn = self._get_connection()
        if not conn: return None
        
        try:
            with conn:
                with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
                    query = "SELECT * FROM sessions WHERE id = %s;"
                    cur.execute(query, (session_id,))
                    return cur.fetchone()
        finally:
            self._release_connection(conn)

    def delete_activity(self, activity_id: str):
        conn = self._get_connection()
        if not conn: return False
        
        try:
            with conn:
                with conn.cursor() as cur:
                    cur.execute("DELETE FROM activities WHERE id = %s;", (activity_id,))
                    return cur.rowcount > 0
        finally:
            self._release_connection(conn)

    def update_activity(self, activity_id: str, activity_data: dict):
        conn = self._get_connection()
        if not conn: return None
        
        try:
            time_unit = activity_data.get("time_unit", 0)
            volume_daily = activity_data.get("volume_daily", 0)
            annual_minutes = time_unit * volume_daily * 20 * 12
            
            with conn:
                with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
                    query = """
                    UPDATE activities 
                    SET name = %s, category = %s, classification = %s, 
                        time_unit = %s, volume_daily = %s, annual_minutes = %s
                    WHERE id = %s
                    RETURNING *;
                    """
                    cur.execute(query, (
                        activity_data.get("name"),
                        activity_data.get("category"),
                        activity_data.get("classification"),
                        time_unit,
                        volume_daily,
                        annual_minutes,
                        activity_id
                    ))
                    return cur.fetchone()
        finally:
            self._release_connection(conn)

    def get_activity(self, activity_id: str):
        conn = self._get_connection()
        if not conn: return None
        
        try:
            with conn:
                with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
                    query = "SELECT * FROM activities WHERE id = %s;"
                    cur.execute(query, (activity_id,))
                    return cur.fetchone()
        finally:
            self._release_connection(conn)

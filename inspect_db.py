import sqlite3

def inspect_database(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # Get all tables
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = cursor.fetchall()

    print("Database Tables and Schema:")
    print("=" * 50)

    for table in tables:
        table_name = table[0]
        print(f"\nTable: {table_name}")
        print("-" * 30)

        # Get table schema
        cursor.execute(f"PRAGMA table_info({table_name});")
        columns = cursor.fetchall()

        for col in columns:
            col_id, col_name, col_type, not_null, default_val, is_pk = col
            pk_indicator = " (PRIMARY KEY)" if is_pk else ""
            null_indicator = " NOT NULL" if not_null else ""
            print(f"  {col_name} ({col_type}){null_indicator}{pk_indicator}")

        # Get sample data (first 3 rows)
        try:
            cursor.execute(f"SELECT * FROM {table_name} LIMIT 3;")
            rows = cursor.fetchall()
            if rows:
                print(f"\n  Sample Data ({len(rows)} rows shown):")
                for row in rows:
                    print(f"    {row}")
            else:
                print("  (No data in table)"
        except Exception as e:
            print(f"  (Error retrieving data: {e})")

    conn.close()

if __name__ == "__main__":
    inspect_database("resume_screener.db")

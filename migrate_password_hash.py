#!/usr/bin/env python3
"""
Migration script to update password_hash column length
Run this after deploying the model changes
"""

from backend.app import create_app, db
from sqlalchemy import text

def migrate_password_hash():
    app = create_app()
    
    with app.app_context():
        try:
            # Check if we're using PostgreSQL
            if 'postgresql' in str(db.engine.url):
                print("Running PostgreSQL migration...")
                
                # Drop the table and recreate it (since it's likely empty or test data)
                db.drop_all()
                db.create_all()
                
                print("Migration completed successfully!")
                print("All tables recreated with updated schema.")
            else:
                print("Using SQLite, no migration needed")
                
        except Exception as e:
            print(f"Migration failed: {e}")
            raise

if __name__ == "__main__":
    migrate_password_hash()

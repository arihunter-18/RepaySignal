import os
import sys

# Ensure backend module is discoverable
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from backend.database import engine, Base
from backend.models.schema import Institute, Student, Outcome, DemandIndex, ModelRegistry

def setup():
    print("Creating all tables in the database...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    print("Database setup complete. All tables created.")

if __name__ == "__main__":
    setup()

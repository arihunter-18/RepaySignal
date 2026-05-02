import sys, os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend.database import engine, Base
from backend.models.student import Institute, Student
from backend.models.risk import RiskScore, AlertState, ModelRegistry

def setup():
    print("Creating all tables...")
    Base.metadata.create_all(bind=engine)
    print("Done.")

if __name__ == "__main__":
    setup()
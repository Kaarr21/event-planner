web: gunicorn "app:create_app()" --chdir backend --bind 0.0.0.0:$PORT --timeout 120 --log-level info
release: python backend/manage.py db upgrade

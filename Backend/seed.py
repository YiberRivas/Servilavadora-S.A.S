import pymysql
from app.security.password import hash_password
from app.utils.uuid import generate_uuid
import os

db_url = os.getenv("DATABASE_URL", "mysql+aiomysql://root:12345@localhost:3306/servilavadora_sas")
parts = db_url.split("://")[1]
user_pass, rest = parts.split("@")
user, password = user_pass.split(":")
host_db = rest.split("/")
host_port = host_db[0].split(":")
host = host_port[0]
port = int(host_port[1]) if len(host_port) > 1 else 3306
database = host_db[1]

conn = pymysql.connect(host=host, user=user, password=password, port=port, database=database)
cur = conn.cursor()

persona_uuid = generate_uuid()
cur.execute(
    "INSERT INTO persona (uuid, id_tipo_documento, numero_documento, nombres, apellidos, correo, telefono, estado) "
    "VALUES (%s, 1, '1234567890', 'Super', 'Administrador', 'admin@servilavadora.co', '3001234567', 1)",
    (persona_uuid,)
)
persona_id = cur.lastrowid
print(f"Persona creada: id={persona_id}, uuid={persona_uuid}")

pw_hash = hash_password("123456")
user_uuid = generate_uuid()
cur.execute(
    "INSERT INTO usuario (uuid, id_persona, id_rol, id_estado_usuario, username, password_hash, estado) "
    "VALUES (%s, %s, 1, 1, 'admin@servilavadora.co', %s, 1)",
    (user_uuid, persona_id, pw_hash)
)
user_id = cur.lastrowid
print(f"Usuario creado: id={user_id}, uuid={user_uuid}")

conn.commit()
conn.close()
print("Seed completado exitosamente")

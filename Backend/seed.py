import pymysql
from app.security.password import hash_password
from app.utils.uuid import generate_uuid

conn = pymysql.connect(host='localhost', user='root', password='12345', port=3306, database='servilavadora_sas')
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

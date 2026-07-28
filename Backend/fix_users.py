import pymysql
import uuid
from app.security.password import hash_password

conn = pymysql.connect(host='localhost', user='root', password='12345', port=3306, database='servilavadora_sas')
cur = conn.cursor()
pw = hash_password("123456")

cur.execute("SELECT id_rol FROM rol WHERE codigo='SUPER_ADMIN'")
r_super = cur.fetchone()[0]
cur.execute("SELECT id_rol FROM rol WHERE codigo='ADMIN_EMPRESA'")
r_admin = cur.fetchone()[0]
cur.execute("SELECT id_estado_usuario FROM estado_usuario WHERE codigo='ACTIVO'")
e_act = cur.fetchone()[0]
cur.execute("SELECT id_tipo_documento FROM tipo_documento WHERE codigo='CC'")
td = cur.fetchone()[0]

# Super Admin
cur.execute("INSERT INTO persona (uuid,id_tipo_documento,numero_documento,nombres,apellidos,correo,telefono,estado) VALUES (%s,%s,%s,%s,%s,%s,%s,1)",
            (str(uuid.uuid4()),td,'1000000000','Admin','Sistema','admin@servilavadora.co','3000000000'))
pid_super = cur.lastrowid
cur.execute("INSERT INTO usuario (uuid,id_persona,id_rol,id_estado_usuario,username,password_hash,estado) VALUES (%s,%s,%s,%s,%s,%s,1)",
            (str(uuid.uuid4()),pid_super,r_super,e_act,'admin@servilavadora.co',pw))
print("Super Admin: admin@servilavadora.co / 123456")

# Admin Empresa
cur.execute("INSERT INTO persona (uuid,id_tipo_documento,numero_documento,nombres,apellidos,correo,telefono,estado) VALUES (%s,%s,%s,%s,%s,%s,%s,1)",
            (str(uuid.uuid4()),td,'2000000000','Admin','CleanHouse','adminempresa@cleanhouse.co','3000000001'))
pid_admin = cur.lastrowid
cur.execute("INSERT INTO usuario (uuid,id_persona,id_rol,id_estado_usuario,username,password_hash,estado) VALUES (%s,%s,%s,%s,%s,%s,1)",
            (str(uuid.uuid4()),pid_admin,r_admin,e_act,'adminempresa@cleanhouse.co',pw))
uid_admin = cur.lastrowid

cur.execute("SELECT id_empresa FROM empresa WHERE nombre_comercial='CleanHouse' LIMIT 1")
eid = cur.fetchone()[0]
cur.execute("INSERT INTO cliente_empresa (uuid,id_empresa,id_usuario,fecha_registro,estado) VALUES (%s,%s,%s,NOW(),1)",
            (str(uuid.uuid4()),eid,uid_admin))

conn.commit()
print("Admin Empresa: adminempresa@cleanhouse.co / 123456")
conn.close()

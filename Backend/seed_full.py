import pymysql
import uuid
from datetime import datetime, date, timedelta
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

def u():
    return str(uuid.uuid4())

now = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
today = date.today().strftime('%Y-%m-%d')

print("=== SEED DATA - Servilavadora S.A.S. ===")

from app.security.password import hash_password
pw = hash_password("123456")

# 0. Super Admin (recreate if not exists)
cur.execute("SELECT id_usuario FROM usuario WHERE username='admin@servilavadora.co'")
existing_admin = cur.fetchone()
if existing_admin:
    super_admin_id = existing_admin[0]
    print(f"[SKIP] Super Admin ya existe: id={super_admin_id}")
else:
    pa_uuid = u()
    cur.execute("INSERT INTO persona (uuid, id_tipo_documento, numero_documento, nombres, apellidos, correo, telefono, estado) VALUES (%s, 1, '1234567890', 'Super', 'Administrador', 'admin@servilavadora.co', '3001234567', 1)", (pa_uuid,))
    pa_id = cur.lastrowid
    ua_uuid = u()
    cur.execute("INSERT INTO usuario (uuid, id_persona, id_rol, id_estado_usuario, username, password_hash, estado) VALUES (%s, %s, 1, 1, 'admin@servilavadora.co', %s, 1)", (ua_uuid, pa_id, pw))
    super_admin_id = cur.lastrowid
    print(f"[OK] Super Admin creado: id={super_admin_id}")

# 1. Direccion base (para empresa y sucursal)
dir_uuid = u()
cur.execute("INSERT INTO direccion (uuid, direccion, complemento, latitud, longitud) VALUES (%s, 'Calle 80 #15-20', 'Centro', 4.60971000, -74.08175000)", (dir_uuid,))
dir_id = cur.lastrowid
print(f"[OK] Direccion base: id={dir_id}")

# 2. Empresa CleanHouse
emp_uuid = u()
cur.execute("""
    INSERT INTO empresa (uuid, nit, razon_social, nombre_comercial, representante_legal,
    correo, telefono, celular, id_direccion, id_estado_empresa, fecha_registro, estado)
    VALUES (%s, '900123456-7', 'CleanHouse Colombia S.A.S.', 'CleanHouse',
    'Carlos Martinez', 'admin@cleanhouse.co', '6012345678', '3101234567',
    %s, 2, %s, 1)
""", (emp_uuid, dir_id, now))
emp_id = cur.lastrowid
print(f"[OK] Empresa CleanHouse: id={emp_id}")

# 3. Empresa Lavados Express
emp2_uuid = u()
cur.execute("""
    INSERT INTO empresa (uuid, nit, razon_social, nombre_comercial, representante_legal,
    correo, telefono, celular, id_direccion, id_estado_empresa, fecha_registro, estado)
    VALUES (%s, '900765432-1', 'Lavados Express Ltda.', 'Lavados Express',
    'Maria Rodriguez', 'contacto@lavexpress.co', '6019876543', '3209876543',
    %s, 2, %s, 1)
""", (emp2_uuid, dir_id, now))
emp2_id = cur.lastrowid
print(f"[OK] Empresa Lavados Express: id={emp2_id}")

# 4. Empresa pendiente
emp3_uuid = u()
cur.execute("""
    INSERT INTO empresa (uuid, nit, razon_social, nombre_comercial, representante_legal,
    correo, telefono, id_direccion, id_estado_empresa, fecha_registro, estado)
    VALUES (%s, '900555111-3', 'TodoLavados S.A.S.', 'TodoLavados',
    'Pedro Gomez', 'info@todolavados.co', '6015551111',
    %s, 1, %s, 1)
""", (emp3_uuid, dir_id, now))
emp3_id = cur.lastrowid
print(f"[OK] Empresa TodoLavados (pendiente): id={emp3_id}")

# 5. Suscripciones
sub1_uuid = u()
cur.execute("""
    INSERT INTO suscripcion (uuid, id_empresa, id_plan, fecha_inicio, fecha_fin, valor, pagada, activa)
    VALUES (%s, %s, 2, '2026-01-01', '2026-12-31', 50000.00, 1, 1)
""", (sub1_uuid, emp_id))
sub1_id = cur.lastrowid

sub2_uuid = u()
cur.execute("""
    INSERT INTO suscripcion (uuid, id_empresa, id_plan, fecha_inicio, fecha_fin, valor, pagada, activa)
    VALUES (%s, %s, 3, '2026-03-01', '2027-02-28', 120000.00, 1, 1)
""", (sub2_uuid, emp2_id))
sub2_id = cur.lastrowid
print(f"[OK] Suscripciones creadas")

# 6. Pagos empresa
for i in range(5):
    pago_uuid = u()
    mes = i + 1
    fecha_pago = f"2026-{mes:02d}-05 10:00:00"
    cur.execute("""
        INSERT INTO pago_empresa (uuid, id_empresa, id_suscripcion, id_metodo_pago, id_estado_pago, valor, fecha_pago, numero_transaccion)
        VALUES (%s, %s, %s, 4, 2, 50000.00, %s, %s)
    """, (pago_uuid, emp_id, sub1_id, fecha_pago, f"TXN-{2026}{mes:02d}-001"))

for i in range(3):
    pago_uuid = u()
    mes = i + 1
    fecha_pago = f"2026-{mes:02d}-10 14:30:00"
    cur.execute("""
        INSERT INTO pago_empresa (uuid, id_empresa, id_suscripcion, id_metodo_pago, id_estado_pago, valor, fecha_pago, numero_transaccion)
        VALUES (%s, %s, %s, 2, 2, 120000.00, %s, %s)
    """, (pago_uuid, emp2_id, sub2_id, fecha_pago, f"TXN-{2026}{mes:02d}-002"))

# Pago pendiente
pago_pend_uuid = u()
cur.execute("""
    INSERT INTO pago_empresa (uuid, id_empresa, id_suscripcion, id_metodo_pago, id_estado_pago, valor, numero_transaccion)
    VALUES (%s, %s, %s, 4, 1, 50000.00, 'TXN-PEND-001')
""", (pago_pend_uuid, emp_id, sub1_id))
print(f"[OK] Pagos empresa creados")

# 7. Persona + Usuario Admin Empresa (CleanHouse)
persona_admin_uuid = u()
cur.execute("""
    INSERT INTO persona (uuid, id_tipo_documento, numero_documento, nombres, apellidos, correo, telefono, estado)
    VALUES (%s, 1, '1098765432', 'Carlos', 'Martinez', 'admin@cleanhouse.co', '3101234567', 1)
""", (persona_admin_uuid,))
persona_admin_id = cur.lastrowid

user_admin_uuid = u()
cur.execute("""
    INSERT INTO usuario (uuid, id_persona, id_rol, id_estado_usuario, username, password_hash, estado)
    VALUES (%s, %s, 2, 1, 'adminempresa@cleanhouse.co', %s, 1)
""", (user_admin_uuid, persona_admin_id, pw))
user_admin_id = cur.lastrowid
print(f"[OK] Admin Empresa: id={user_admin_id}")

# 8. Persona + Usuario Cliente
for i in range(1, 6):
    p_uuid = u()
    cur.execute("""
        INSERT INTO persona (uuid, id_tipo_documento, numero_documento, nombres, apellidos, correo, telefono, estado)
        VALUES (%s, 1, %s, %s, %s, %s, %s, 1)
    """, (p_uuid, f"100000000{i}", f"Cliente{i}", f"Apellido{i}", f"cliente{i}@mail.co", f"300123456{i}"))
    p_id = cur.lastrowid

    u_uuid = u()
    cur.execute("""
        INSERT INTO usuario (uuid, id_persona, id_rol, id_estado_usuario, username, password_hash, estado)
        VALUES (%s, %s, 4, 1, %s, %s, 1)
    """, (u_uuid, p_id, f"cliente{i}@mail.co", pw))
    u_id = cur.lastrowid

    ce_uuid = u()
    cur.execute("""
        INSERT INTO cliente_empresa (uuid, id_empresa, id_usuario, fecha_registro, estado)
        VALUES (%s, %s, %s, %s, 1)
    """, (ce_uuid, emp_id, u_id, today))

print(f"[OK] 5 Clientes creados")

# 9. Persona + Usuario Repartidor
for i in range(1, 4):
    p_uuid = u()
    cur.execute("""
        INSERT INTO persona (uuid, id_tipo_documento, numero_documento, nombres, apellidos, correo, telefono, estado)
        VALUES (%s, 1, %s, %s, %s, %s, %s, 1)
    """, (p_uuid, f"200000000{i}", f"Repartidor{i}", f"RepartidorApellido{i}", f"repartidor{i}@mail.co", f"310123456{i}"))
    p_id = cur.lastrowid

    u_uuid = u()
    cur.execute("""
        INSERT INTO usuario (uuid, id_persona, id_rol, id_estado_usuario, username, password_hash, estado)
        VALUES (%s, %s, 3, 1, %s, %s, 1)
    """, (u_uuid, p_id, f"repartidor{i}@mail.co", pw))
    u_id = cur.lastrowid

    r_uuid = u()
    lat = 4.6097 + (i * 0.005)
    lng = -74.0817 + (i * 0.005)
    cur.execute("""
        INSERT INTO repartidor (uuid, id_empresa, id_usuario, licencia, vence_licencia, disponible, latitud, longitud, estado)
        VALUES (%s, %s, %s, %s, %s, 1, %s, %s, 1)
    """, (r_uuid, emp_id, u_id, f"LIC-{1000+i}", f"2028-12-31", lat, lng))

print(f"[OK] 3 Repartidores creados")

# 10b. Modelos lavadora (needed for FK)
modelos_data = [
    ('WM-7KG', 1), ('WM-10KG', 2), ('WM-12KG', 3),
    ('WA-8KG', 2), ('WA-10KG', 4), ('WT-11KG', 5),
    ('WV-14KG', 7), ('WZ-9KG', 3),
]
for nombre, marca_id in modelos_data:
    m_uuid = u()
    cur.execute("INSERT INTO modelo_lavadora (uuid, id_marca_lavadora, nombre, estado) VALUES (%s, %s, %s, 1)", (m_uuid, marca_id, nombre))
print(f"[OK] 8 Modelos lavadora creados")

# 11. Sucursal
suc_uuid = u()
cur.execute("""
    INSERT INTO sucursal (uuid, id_empresa, nombre, telefono, correo, id_direccion, principal, estado)
    VALUES (%s, %s, 'Sucursal Principal', '6012345678', 'sucursal@cleanhouse.co', %s, 1, 1)
""", (suc_uuid, emp_id, dir_id))
suc_id = cur.lastrowid
print(f"[OK] Sucursal Principal: id={suc_id}")

# 11. Configuracion empresa
conf_uuid = u()
cur.execute("""
    INSERT INTO configuracion_empresa (uuid, id_empresa, permite_reservas, tiempo_maximo_reserva, moneda, zona_horaria)
    VALUES (%s, %s, 1, 30, 'COP', 'America/Bogota')
""", (conf_uuid, emp_id))

# 12. Lavadoras
cur.execute("SELECT id_modelo_lavadora FROM modelo_lavadora ORDER BY id_modelo_lavadora")
modelo_ids = [r[0] for r in cur.fetchall()]
for i in range(1, 11):
    lav_uuid = u()
    marca_id = (i % 7) + 1
    modelo_id = modelo_ids[(i - 1) % len(modelo_ids)]
    cap_id = ((i - 1) % 8) + 1
    estado_id = 1 if i <= 7 else (5 if i == 8 else 6)
    cur.execute("""
        INSERT INTO lavadora (uuid, id_empresa, id_sucursal, id_marca_lavadora, id_modelo_lavadora,
        id_capacidad_lavadora, id_estado_lavadora, codigo_interno, numero_serie, color, fecha_compra, valor_compra, disponible, estado)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 1)
    """, (lav_uuid, emp_id, suc_id, marca_id, modelo_id, cap_id, estado_id,
          f"LAV-{i:03d}", f"SN-{100000+i}", 'Blanco', '2025-06-15', 2500000.00 + (i * 100000), 1 if estado_id == 1 else 0))

print(f"[OK] 10 Lavadoras creadas")

# 13. Tarifas empresa
for cap_id in range(1, 9):
    tar_uuid = u()
    valor_hora = 3000 + (cap_id * 500)
    cur.execute("""
        INSERT INTO tarifa_empresa (uuid, id_empresa, id_capacidad_lavadora, valor_hora, valor_minuto, activa, fecha_inicio)
        VALUES (%s, %s, %s, %s, %s, 1, '2026-01-01')
    """, (tar_uuid, emp_id, cap_id, valor_hora, round(valor_hora / 60, 2)))

print(f"[OK] 8 Tarifas creadas")

# 14. Notificaciones
for i in range(1, 8):
    n_uuid = u()
    leida = 1 if i > 4 else 0
    cur.execute("""
        INSERT INTO notificacion (uuid, id_usuario, titulo, mensaje, tipo, leida, created_at)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
    """, (n_uuid, super_admin_id,
          f"Notificacion {i}",
          f"Mensaje de ejemplo numero {i}. Esta es una notificacion de prueba.",
          "sistema" if i % 2 == 0 else "pago",
          leida,
          f"2026-07-{23-i:02d} 10:00:00"))

print(f"[OK] 7 Notificaciones creadas")

# 15. Tickets soporte
for i in range(1, 4):
    t_uuid = u()
    prioridades = ['BAJA', 'MEDIA', 'ALTA']
    estados = ['ABIERTO', 'PROCESO', 'CERRADO']
    cur.execute("""
        INSERT INTO soporte_ticket (uuid, id_empresa, id_usuario, asunto, descripcion, prioridad, estado, created_at)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
    """, (t_uuid, emp_id, user_admin_id,
          f"Ticket de soporte #{i}",
          f"Descripcion del problema {i}. Necesito ayuda con el sistema.",
          prioridades[i-1], estados[i-1],
          f"2026-07-{20+i:02d} 09:00:00"))

print(f"[OK] 3 Tickets creados")

conn.commit()
conn.close()
print("\n=== SEED COMPLETADO ===")

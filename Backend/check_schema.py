import pymysql
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

tables_needed = [
    'direccion', 'departamento', 'municipio', 'barrio', 'pais',
    'empresa', 'sucursal', 'cliente_empresa', 'repartidor', 'empleado_empresa',
    'lavadora', 'solicitud_alquiler', 'alquiler', 'cronometro_alquiler',
    'pago_cliente', 'factura', 'liquidacion_alquiler',
    'soporte_ticket', 'soporte_respuesta',
    'notificacion', 'ruta', 'historial_ruta',
    'auditoria', 'mantenimiento_lavadora', 'historial_lavadora', 'movimiento_lavadora',
    'archivo', 'empresa_archivo', 'fotografia_lavadora',
    'configuracion_empresa', 'suscripcion', 'rol_permiso',
    'devolucion_lavadora', 'evidencia_entrega', 'evidencia_devolucion',
    'asignacion_solicitud', 'estado_solicitud',
    'cola_espera',
]

for t in tables_needed:
    try:
        cur.execute(f'DESCRIBE {t}')
        cols = cur.fetchall()
        print(f'=== {t} ===')
        for c in cols:
            null_str = 'NOT NULL' if c[2] == 'NO' else 'NULL'
            default_str = f' DEFAULT {c[4]}' if c[4] else ''
            extra_str = f' {c[5]}' if c[5] else ''
            print(f'  {c[0]}: {c[1]} {null_str}{default_str}{extra_str}')
        print()
    except Exception as e:
        print(f'=== {t} === ERROR: {e}\n')

conn.close()

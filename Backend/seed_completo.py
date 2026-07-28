import pymysql
import uuid as uuid_lib
from datetime import datetime, timedelta
import random
import os

def u():
    return str(uuid_lib.uuid4())

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
cur.execute("SET FOREIGN_KEY_CHECKS=0")
tables = ['tipo_documento','genero','metodo_pago','estado_empresa','estado_usuario','estado_pago',
    'estado_solicitud','estado_lavadora','plan','marca_lavadora','modelo_lavadora','capacidad_lavadora',
    'permiso','rol','rol_permiso','pais','departamento','municipio','barrio','direccion',
    'persona','usuario','empresa','sucursal','lavadora','alquiler','solicitud_alquiler',
    'empleado_empresa','repartidor','cliente_empresa','notificacion','soporte_ticket','soporte_respuesta',
    'auditoria','configuracion_empresa','pago_cliente','liquidacion_alquiler','cronometro_alquiler',
    'factura','devolucion_lavadora','evidencia_entrega','evidencia_devolucion','asignacion_solicitud',
    'ruta','historial_ruta','cola_espera','mantenimiento_lavadora','historial_lavadora',
    'movimiento_lavadora','archivo','empresa_archivo','fotografia_lavadora','suscripcion','pago_empresa']
for t in tables:
    try: cur.execute(f"DELETE FROM {t}")
    except: pass
cur.execute("SET FOREIGN_KEY_CHECKS=1")
conn.commit()
print("=== BD LIMPIADA ===\n")

def get_ids(table, col=None):
    col = col or f"id_{table}"
    cur.execute(f"SELECT {col} FROM {table} ORDER BY {col}")
    return [r[0] for r in cur.fetchall()]

# ============================================================
# 1. PAISES
# ============================================================
for n,c2,c3,ind in [('Colombia','CO','COL','+57'),('Mexico','MX','MEX','+52'),('Argentina','AR','ARG','+54'),('Chile','CL','CHL','+56'),('Peru','PE','PER','+51')]:
    cur.execute("INSERT INTO pais (uuid,nombre,codigo_iso2,codigo_iso3,indicativo,estado) VALUES (%s,%s,%s,%s,%s,1)",(u(),n,c2,c3,ind))
conn.commit(); print("[OK] 5 Paises")

# ============================================================
# 2. DEPARTAMENTOS
# ============================================================
pais_id = get_ids('pais')[0]
deps = [('Bogota D.C.','11'),('Antioquia','05'),('Valle del Cauca','76'),('Atlantico','08'),('Bolivar','13'),
        ('Santander','68'),('Narino','52'),('Tolima','73'),('Cundinamarca','25'),('Boyaca','15'),('Cauca','19'),('N. de Santander','54')]
for n,cod in deps:
    cur.execute("INSERT INTO departamento (uuid,id_pais,nombre,codigo_dane,estado) VALUES (%s,%s,%s,%s,1)",(u(),pais_id,n,cod))
dep_ids = get_ids('departamento')
dep_map = {d[0]:i for i,d in enumerate(deps)}
conn.commit(); print("[OK] 12 Departamentos")

# ============================================================
# 3. MUNICIPIOS
# ============================================================
mun_data = [
    ('Bogota D.C.','Bogota','11001'),('Antioquia','Medellin','05001'),('Antioquia','Envigado','05266'),
    ('Antioquia','Itagui','05360'),('Valle del Cauca','Cali','76001'),('Valle del Cauca','Palmira','76520'),
    ('Atlantico','Barranquilla','08001'),('Atlantico','Soledad','08758'),('Bolivar','Cartagena','13001'),
    ('Santander','Bucaramanga','68001'),('Santander','Floridablanca','68276'),('Tolima','Ibague','73001'),
    ('Cundinamarca','Soacha','25754'),('N. de Santander','Cucuta','54001'),('Boyaca','Tunja','15001'),
]
for dep_n,mun_n,cod in mun_data:
    cur.execute("INSERT INTO municipio (uuid,id_departamento,nombre,codigo_dane,estado) VALUES (%s,%s,%s,%s,1)",
                (u(), dep_ids[dep_map[dep_n]], mun_n, cod))
mun_ids = get_ids('municipio')
mun_map = {m[1]:i for i,m in enumerate(mun_data)}
conn.commit(); print("[OK] 15 Municipios")

# ============================================================
# 4. BARRIOS
# ============================================================
bar_data = [
    ('Bogota','Chapinero'),('Bogota','Usaquen'),('Bogota','Suba'),('Bogota','Kennedy'),('Bogota','Engativa'),('Bogota','Barrios Unidos'),
    ('Medellin','El Poblado'),('Medellin','Laureles'),('Medellin','Envigado Centro'),
    ('Cali','San Fernando'),('Cali','Granada'),('Cali','Ciudad Jardin'),
    ('Barranquilla','Narino'),('Barranquilla','Alto Prado'),('Barranquilla','Villa Santos'),
    ('Cartagena','Bocagrande'),('Cartagena','Castillo Grande'),('Cartagena','Olaya'),
    ('Bucaramanga','Cabecera'),('Bucaramanga','Sotomayor'),
]
for mn,bn in bar_data:
    cur.execute("INSERT INTO barrio (uuid,id_municipio,nombre,estado) VALUES (%s,%s,%s,1)",
                (u(), mun_ids[mun_map[mn]], bn))
bar_ids = get_ids('barrio')
conn.commit(); print("[OK] 20 Barrios")

# ============================================================
# 5. DIRECCIONES
# ============================================================
direcciones = [
    'Calle 80 #15-30','Carrera 7 #45-12','Diagonal 23 #10-56','Avenida 68 #24-10','Calle 50 #8-22',
    'Carrera 15 #72-35','Calle 100 #11-40','Transversal 5 #12-67','Carrera 40 #85-20','Avenida Caracas #30-15',
    'Calle 72 #9-50','Diagonal 80 #20-33','Carrera 50 #60-18','Calle 26 #14-70','Avenida Boyaca #55-25',
    'Carrera 80 #42-12','Calle 45 #68-90','Diagonal 15 #33-44','Transversal 78 #12-08','Carrera 22 #95-17',
    'Calle 120 #5-60','Avenida Ciudad de Quito #80-30','Carrera 33 #7-25','Calle 63 #19-42','Diagonal 48 #11-55',
]
for d in direcciones:
    cur.execute("INSERT INTO direccion (uuid,id_barrio,direccion,latitud,longitud) VALUES (%s,%s,%s,%s,%s)",
                (u(), bar_ids[random.randint(0,len(bar_ids)-1)], d, round(4.0+random.uniform(-3,6),6), round(-72.0+random.uniform(-8,8),6)))
dir_ids = get_ids('direccion')
conn.commit(); print("[OK] 25 Direcciones")

# ============================================================
# 6. CATALOGOS
# ============================================================
# Tipo documento: uuid,codigo,nombre,descripcion,estado
for cod,n in [('CC','Cedula de Ciudadania'),('NIT','NIT'),('CE','Cedula Extranjeria')]:
    cur.execute("INSERT INTO tipo_documento (uuid,codigo,nombre,estado) VALUES (%s,%s,%s,1)",(u(),cod,n))

# Genero: uuid,nombre,estado (NO tiene codigo)
for n in ['Masculino','Femenino','Otro']:
    cur.execute("INSERT INTO genero (uuid,nombre,estado) VALUES (%s,%s,1)",(u(),n))

# Metodo pago: uuid,nombre,descripcion,estado (NO tiene codigo)
for n in ['Efectivo','Tarjeta Credito','Tarjeta Debito','Transferencia','PSE','Nequi']:
    cur.execute("INSERT INTO metodo_pago (uuid,nombre,descripcion,estado) VALUES (%s,%s,%s,1)",(u(),n,n))

# Estado empresa: uuid,codigo,nombre,descripcion,color,estado
for cod,n,col in [('ACTIVO','Activo','#28A745'),('PENDIENTE','Pendiente','#E8A317'),('SUSPENDIDO','Suspendido','#D64545'),('INACTIVO','Inactivo','#666')]:
    cur.execute("INSERT INTO estado_empresa (uuid,codigo,nombre,color,estado) VALUES (%s,%s,%s,%s,1)",(u(),cod,n,col))

# Estado usuario
for cod,n,col in [('ACTIVO','Activo','#28A745'),('PENDIENTE','Pendiente','#E8A317'),('SUSPENDIDO','Suspendido','#D64545'),('INACTIVO','Inactivo','#666')]:
    cur.execute("INSERT INTO estado_usuario (uuid,codigo,nombre,color,estado) VALUES (%s,%s,%s,%s,1)",(u(),cod,n,col))

# Estado pago
for cod,n,col in [('PAGADO','Pagado','#28A745'),('PENDIENTE','Pendiente','#E8A317'),('VENCIDO','Vencido','#D64545'),('ANULADO','Anulado','#666')]:
    cur.execute("INSERT INTO estado_pago (uuid,codigo,nombre,color,estado) VALUES (%s,%s,%s,%s,1)",(u(),cod,n,col))

# Estado solicitud
for cod,n,col in [('PENDIENTE','Pendiente','#E8A317'),('ACEPTADA','Aceptada','#28A745'),('RECHAZADA','Rechazada','#D64545'),('EN_CURSO','En Curso','#2D6CB5'),('COMPLETADA','Completada','#12A594')]:
    cur.execute("INSERT INTO estado_solicitud (uuid,codigo,nombre,color,estado) VALUES (%s,%s,%s,%s,1)",(u(),cod,n,col))

# Estado lavadora
for cod,n,col in [('DISPONIBLE','Disponible','#28A745'),('EN_USO','En Uso','#2D6CB5'),('MANTENIMIENTO','Mantenimiento','#E8A317'),('REPARACION','Reparacion','#D64545'),('BAJA','Baja','#666')]:
    cur.execute("INSERT INTO estado_lavadora (uuid,codigo,nombre,color,estado) VALUES (%s,%s,%s,%s,1)",(u(),cod,n,col))

# Plan: uuid,nombre,descripcion,precio_mensual,cantidad_sucursales,cantidad_repartidores,cantidad_lavadoras,soporte_prioritario,estado
planes = [('Basico','Plan basico',250000,2,3,5,0),('Profesional','Plan profesional',500000,5,10,20,1),('Empresarial','Plan empresarial',1200000,15,25,50,1)]
for n,d,p,s,r,l,sp in planes:
    cur.execute("INSERT INTO plan (uuid,nombre,descripcion,precio_mensual,cantidad_sucursales,cantidad_repartidores,cantidad_lavadoras,soporte_prioritario,estado) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,1)",
                (u(),n,d,p,s,r,l,sp))

# Marca lavadora
for m in ['Samsung','LG','Whirlpool','Bosch','Electrolux','Mabe','Indurama']:
    cur.execute("INSERT INTO marca_lavadora (uuid,nombre,estado) VALUES (%s,%s,1)",(u(),m))
marca_ids = get_ids('marca_lavadora')

# Modelo lavadora: uuid,id_marca_lavadora,nombre,descripcion,estado
modelos = [('Samsung WF45R6100AW',0),('LG WM3500CW',1),('Whirlpool WFW5605MW',2),('Bosch WAX32K41',3),
           ('Electrolux EWF1410AEWA',4),('Mabe 8STSMF80',5),('Indurima LI12LVP',6),('Samsung WA50R5400AW',0)]
for n,mi in modelos:
    cur.execute("INSERT INTO modelo_lavadora (uuid,id_marca_lavadora,nombre,estado) VALUES (%s,%s,%s,1)",
                (u(),marca_ids[mi],n))

# Capacidad lavadora: uuid,capacidad_kg,descripcion,estado
for c in [8,10,12,14,16,18,20,22]:
    cur.execute("INSERT INTO capacidad_lavadora (uuid,capacidad_kg,descripcion,estado) VALUES (%s,%s,%s,1)",
                (u(),float(c),f"Lavadora de {c} kg"))

# Permiso: uuid,modulo,codigo,nombre,descripcion,estado
permisos_nombres = [
    ('empresas','EMPRESA_VER','Ver empresas','Ver listado de empresas'),
    ('empresas','EMPRESA_CREAR','Crear empresa','Crear nueva empresa'),
    ('empresas','EMPRESA_EDITAR','Editar empresa','Editar empresa existente'),
    ('empresas','EMPRESA_ELIMINAR','Eliminar empresa','Eliminar empresa'),
    ('usuarios','USUARIO_VER','Ver usuarios','Ver listado de usuarios'),
    ('usuarios','USUARIO_CREAR','Crear usuario','Crear nuevo usuario'),
    ('usuarios','USUARIO_EDITAR','Editar usuario','Editar usuario existente'),
    ('usuarios','USUARIO_ELIMINAR','Eliminar usuario','Eliminar usuario'),
    ('lavadoras','LAVADORA_VER','Ver lavadoras','Ver listado de lavadoras'),
    ('lavadoras','LAVADORA_CREAR','Crear lavadora','Crear nueva lavadora'),
    ('lavadoras','LAVADORA_EDITAR','Editar lavadora','Editar lavadora existente'),
    ('alquileres','ALQUILER_VER','Ver alquileres','Ver listado de alquileres'),
    ('alquileres','ALQUILER_CREAR','Crear alquiler','Crear nuevo alquiler'),
    ('alquileres','ALQUILER_EDITAR','Editar alquiler','Editar alquiler existente'),
    ('rutas','RUTA_VER','Ver rutas','Ver listado de rutas'),
    ('rutas','RUTA_CREAR','Crear ruta','Crear nueva ruta'),
    ('pagos','PAGO_VER','Ver pagos','Ver listado de pagos'),
    ('pagos','PAGO_CREAR','Crear pago','Crear nuevo pago'),
    ('reportes','REPORTE_VER','Ver reportes','Ver reportes'),
    ('reportes','REPORTE_CREAR','Crear reportes','Crear reportes'),
    ('configuraciones','CONFIG_VER','Ver configuraciones','Ver configuraciones del sistema'),
    ('configuraciones','CONFIG_EDITAR','Editar configuraciones','Editar configuraciones'),
    ('soporte','SOPORTE_VER','Ver soporte','Ver tickets de soporte'),
]
for mod,cod,nom,desc in permisos_nombres:
    cur.execute("INSERT INTO permiso (uuid,modulo,codigo,nombre,descripcion,estado) VALUES (%s,%s,%s,%s,%s,1)",
                (u(),mod,cod,nom,desc))

# Rol: uuid,codigo,nombre,descripcion,es_sistema,estado
for cod,n,d,sys in [('SUPER_ADMIN','Super Administrador','Control total del sistema',1),('ADMIN_EMPRESA','Administrador Empresa','Administra una empresa',1),('REPARTIDOR','Repartidor','Entrega y recoge lavadoras',1),('CLIENTE','Cliente','Alquila lavadoras',1)]:
    cur.execute("INSERT INTO rol (uuid,codigo,nombre,descripcion,es_sistema,estado) VALUES (%s,%s,%s,%s,%s,1)",(u(),cod,n,d,sys))
conn.commit(); print("[OK] Catalogos completos")

# ============================================================
# 7. ROLES + ROL_PERMISO
# ============================================================
cur.execute("SELECT id_rol FROM rol WHERE codigo='SUPER_ADMIN'"); r_super = cur.fetchone()[0]
cur.execute("SELECT id_rol FROM rol WHERE codigo='ADMIN_EMPRESA'"); r_admin = cur.fetchone()[0]
cur.execute("SELECT id_rol FROM rol WHERE codigo='REPARTIDOR'"); r_repart = cur.fetchone()[0]
cur.execute("SELECT id_rol FROM rol WHERE codigo='CLIENTE'"); r_cliente = cur.fetchone()[0]
perm_ids = get_ids('permiso')
for pid in perm_ids: cur.execute("INSERT INTO rol_permiso (id_rol,id_permiso) VALUES (%s,%s)",(r_super,pid))
for pid in perm_ids[7:20]: cur.execute("INSERT INTO rol_permiso (id_rol,id_permiso) VALUES (%s,%s)",(r_admin,pid))
for pid in perm_ids[11:16]: cur.execute("INSERT INTO rol_permiso (id_rol,id_permiso) VALUES (%s,%s)",(r_repart,pid))
cur.execute("INSERT INTO rol_permiso (id_rol,id_permiso) VALUES (%s,%s)",(r_cliente,perm_ids[11]))
conn.commit(); print("[OK] Roles y permisos")

# ============================================================
# 8. PERSONAS (25)
# ============================================================
tdoc_ids = get_ids('tipo_documento')
nombres = [('Juan','Perez'),('Maria','Garcia'),('Carlos','Rodriguez'),('Ana','Martinez'),('Pedro','Lopez'),
    ('Laura','Hernandez'),('Diego','Gonzalez'),('Sofia','Ramirez'),('Andres','Torres'),('Valentina','Flores'),
    ('Santiago','Morales'),('Camila','Vargas'),('Luis','Jimenez'),('Daniela','Ruiz'),('Miguel','Alvarez'),
    ('Isabella','Mendoza'),('Fernando','Castillo'),('Luciana','Reyes'),('Ricardo','Gutierrez'),('Carolina','Ortega'),
    ('Jorge','Ramos'),('Paola','Delgado'),('Sebastian','Medina'),('Natalia','Vargas'),('Felipe','Acosta')]
for nom,ape in nombres:
    cur.execute("INSERT INTO persona (uuid,id_tipo_documento,numero_documento,nombres,apellidos,correo,telefono,estado) VALUES (%s,%s,%s,%s,%s,%s,%s,1)",
                (u(),tdoc_ids[0],f"{random.randint(10000000,99999999)}",nom,ape,f"{nom.lower()}.{ape.lower()}@mail.co",f"310{random.randint(1000000,9999999)}"))
conn.commit(); print("[OK] 25 Personas")

# ============================================================
# 9. USUARIOS (25)
# ============================================================
from app.security.password import hash_password
pw = hash_password("123456")
pids = get_ids('persona')

# Obtener IDs reales de estado
eusua_ids = get_ids('estado_usuario')
cur.execute("SELECT id_estado_usuario FROM estado_usuario WHERE codigo='ACTIVO'")
e_activo = cur.fetchone()[0]

for i,pid in enumerate(pids):
    if i < 2: rol = r_super
    elif i < 5: rol = r_admin
    elif i < 10: rol = r_repart
    else: rol = r_cliente
    email = f"{nom.lower()}.{ape.lower()}@mail.co"
    cur.execute("INSERT INTO usuario (uuid,id_persona,id_rol,id_estado_usuario,username,password_hash,estado) VALUES (%s,%s,%s,%s,%s,%s,1)",
                (u(),pid,rol,e_activo,email,pw))
conn.commit(); print("[OK] 25 Usuarios")

# ============================================================
# 10. EMPRESAS (10)
# ============================================================
dir_ids = get_ids('direccion')

# Obtener IDs reales de estado_empresa
cur.execute("SELECT id_estado_empresa FROM estado_empresa WHERE codigo='ACTIVO'"); eemp_activo = cur.fetchone()[0]
cur.execute("SELECT id_estado_empresa FROM estado_empresa WHERE codigo='PENDIENTE'"); eemp_pend = cur.fetchone()[0]
empresas_raw = [
    ('900123456-1','CleanHouse Colombia S.A.S.','CleanHouse','Carlos Martinez','admin@cleanhouse.co'),
    ('900234567-2','Lavados Express Ltda.','Lavados Express','Maria Garcia','admin@lavadosexpress.co'),
    ('900345678-3','TodoLavados S.A.S.','TodoLavados','Pedro Lopez','admin@todolavados.co'),
    ('900456789-4','Lavanderia Express','LavaExpress','Diego Gonzalez','admin@lavaexpress.co'),
    ('900567890-5','EcoLavado S.A.','EcoLavado','Sofia Ramirez','admin@ecolavado.co'),
    ('900678901-6','ProLavado Ltda.','ProLavado','Andres Torres','admin@prolavado.co'),
    ('900789012-7','LavMax Colombia','LavMax','Valentina Flores','admin@lavmax.co'),
    ('900890123-8','SuperLav S.A.S.','SuperLav','Santiago Morales','admin@superlav.co'),
    ('900901234-9','RapidLav','RapidLav','Camila Vargas','admin@rapidlav.co'),
    ('901012345-0','Lavanderia Total','LavTotal','Luis Jimenez','admin@lavtotal.co'),
]
for i,(nit,razon,nombre,resp,correo) in enumerate(empresas_raw):
    estado = eemp_activo if i < 7 else eemp_pend
    fecha_reg = datetime(2025,random.randint(1,12),random.randint(1,28),10,0,0)
    fecha_aprob = fecha_reg + timedelta(days=random.randint(1,5)) if i < 7 else None
    cur.execute("""INSERT INTO empresa (uuid,nit,razon_social,nombre_comercial,representante_legal,correo,
        telefono,celular,id_direccion,id_estado_empresa,fecha_registro,fecha_aprobacion,estado)
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,1)""",
                (u(),nit,razon,nombre,resp,correo,f"601{random.randint(1000000,9999999)}",
                 f"3{random.randint(10,19)}{random.randint(1000000,9999999)}",dir_ids[i],estado,fecha_reg,fecha_aprob))
emp_ids = get_ids('empresa')
conn.commit(); print("[OK] 10 Empresas")

# ============================================================
# 11. SUCURSALES (20)
# ============================================================
for i,eid in enumerate(emp_ids):
    for s in range(2):
        cur.execute("INSERT INTO sucursal (uuid,id_empresa,nombre,telefono,correo,id_direccion,principal,estado) VALUES (%s,%s,%s,%s,%s,%s,%s,1)",
                    (u(),eid,f"Sucursal {s+1} - {empresas_raw[i][2]}",f"601{random.randint(1000000,9999999)}",
                     f"s{s+1}@{empresas_raw[i][2].lower().replace(' ','')}.co",dir_ids[(i*2+s)%len(dir_ids)],1 if s==0 else 0))
suc_ids = get_ids('sucursal')
conn.commit(); print("[OK] 20 Sucursales")

# ============================================================
# 12. CONFIG EMPRESA (10)
# ============================================================
for eid in emp_ids:
    cur.execute("INSERT INTO configuracion_empresa (uuid,id_empresa,permite_reservas,tiempo_maximo_reserva,moneda) VALUES (%s,%s,%s,%s,%s)",
                (u(),eid,random.choice([0,1]),random.choice([15,30,60]),'COP'))
conn.commit(); print("[OK] 10 Config Empresa")

# ============================================================
# 13. CLIENTE_EMPRESA (20)
# ============================================================
cur.execute("SELECT id_usuario FROM usuario WHERE id_rol=%s",(r_cliente,))
c_uids = [r[0] for r in cur.fetchall()]
for i in range(20):
    cur.execute("INSERT INTO cliente_empresa (uuid,id_empresa,id_usuario,fecha_registro,estado) VALUES (%s,%s,%s,%s,1)",
                (u(),emp_ids[i%7],c_uids[i%len(c_uids)],datetime(2025,random.randint(1,12),random.randint(1,28))))
conn.commit(); print("[OK] 20 Cliente-Empresa")

# ============================================================
# 14. REPARTIDORES (15)
# ============================================================
cur.execute("SELECT id_usuario FROM usuario WHERE id_rol=%s",(r_repart,))
r_uids = [r[0] for r in cur.fetchall()]
for i in range(15):
    cur.execute("""INSERT INTO repartidor (uuid,id_empresa,id_usuario,licencia,vence_licencia,
        disponible,latitud,longitud,estado) VALUES (%s,%s,%s,%s,%s,1,%s,%s,1)""",
                (u(),emp_ids[i%7],r_uids[i%len(r_uids)],f"LIC-{1000+i}",f"202{random.randint(6,9)}-12-31",
                 round(4.0+random.uniform(-2,4),6),round(-72.0+random.uniform(-5,3),6)))
conn.commit(); print("[OK] 15 Repartidores")

# ============================================================
# 15. EMPLEADO_EMPRESA (20)
# ============================================================
cur.execute("SELECT id_usuario FROM usuario ORDER BY id_usuario")
a_uids = [r[0] for r in cur.fetchall()]
for i in range(20):
    cur.execute("""INSERT INTO empleado_empresa (uuid,id_empresa,id_usuario,cargo,fecha_ingreso,salario,estado)
        VALUES (%s,%s,%s,%s,%s,%s,1)""",
                (u(),emp_ids[i%7],a_uids[i%len(a_uids)],random.choice(['Gerente','Supervisor','Operario','Tecnico','Administrativo']),
                 f"2025-{random.randint(1,12):02d}-{random.randint(1,28):02d}",1200000+random.randint(0,15)*100000))
conn.commit(); print("[OK] 20 Empleados Empresa")

# ============================================================
# 16. LAVADORAS (30)
# ============================================================
marca_ids = get_ids('marca_lavadora')
modelo_ids = get_ids('modelo_lavadora')
cap_ids = get_ids('capacidad_lavadora')
cur.execute("SELECT id_estado_lavadora FROM estado_lavadora WHERE codigo='DISPONIBLE'"); el_disp = cur.fetchone()[0]
cur.execute("SELECT id_estado_lavadora FROM estado_lavadora WHERE codigo='EN_USO'"); el_uso = cur.fetchone()[0]
cur.execute("SELECT id_estado_lavadora FROM estado_lavadora WHERE codigo='MANTENIMIENTO'"); el_mant = cur.fetchone()[0]
colores = ['Blanco','Gris','Plateado','Negro']
for i in range(30):
    estado = random.choice([el_disp,el_disp,el_disp,el_uso,el_mant])
    cur.execute("""INSERT INTO lavadora (uuid,id_empresa,id_sucursal,id_marca_lavadora,
        id_modelo_lavadora,id_capacidad_lavadora,id_estado_lavadora,codigo_interno,
        numero_serie,color,fecha_compra,valor_compra,disponible,estado)
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,1)""",
                (u(),emp_ids[i%7],suc_ids[i%len(suc_ids)],marca_ids[i%len(marca_ids)],
                 modelo_ids[i%len(modelo_ids)],cap_ids[i%len(cap_ids)],estado,
                 f"LAV-{i+1:03d}",f"SN-{100000+i}",random.choice(colores),
                 f"2025-{random.randint(1,12):02d}-{random.randint(1,28):02d}",
                 2500000+random.randint(0,15)*100000,1 if estado==el_disp else 0))
lav_ids = get_ids('lavadora')
conn.commit(); print("[OK] 30 Lavadoras")

# ============================================================
# 17. SOLICITUDES (25)
# ============================================================
cur.execute("SELECT id_estado_solicitud FROM estado_solicitud WHERE codigo='PENDIENTE'"); es_pend = cur.fetchone()[0]
cur.execute("SELECT id_estado_solicitud FROM estado_solicitud WHERE codigo='ACEPTADA'"); es_acept = cur.fetchone()[0]
cur.execute("SELECT id_estado_solicitud FROM estado_solicitud WHERE codigo='EN_CURSO'"); es_curso = cur.fetchone()[0]
cur.execute("SELECT id_estado_solicitud FROM estado_solicitud WHERE codigo='COMPLETADA'"); es_comp = cur.fetchone()[0]
cur.execute("SELECT id_cliente_empresa FROM cliente_empresa ORDER BY id_cliente_empresa")
ce_ids = [r[0] for r in cur.fetchall()]
for i in range(25):
    estado = random.choice([es_pend,es_pend,es_acept,es_curso,es_comp])
    fecha = datetime(2026,7,max(1,23-i),random.randint(8,18),random.randint(0,59))
    cur.execute("""INSERT INTO solicitud_alquiler (uuid,id_empresa,id_cliente_empresa,id_sucursal,
        id_capacidad_lavadora,id_estado_solicitud,fecha_solicitud,direccion_entrega,estado)
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s,1)""",
                (u(),emp_ids[i%7],ce_ids[i%len(ce_ids)],suc_ids[(i%7)*2],
                 cap_ids[i%len(cap_ids)],estado,fecha,direcciones[i]))
sol_ids = get_ids('solicitud_alquiler')
conn.commit(); print("[OK] 25 Solicitudes")

# ============================================================
# 18. ALQUILERES (20)
# ============================================================
cur.execute("SELECT id_repartidor FROM repartidor ORDER BY id_repartidor")
rep_ids = [r[0] for r in cur.fetchall()]
for i in range(20):
    fecha = datetime(2026,7,random.randint(1,22),random.randint(8,18),0,0)
    mins = random.randint(30,480)
    cur.execute("""INSERT INTO alquiler (uuid,id_solicitud_alquiler,id_lavadora,id_cliente_empresa,
        id_repartidor,id_estado_alquiler,fecha_inicio,fecha_fin,minutos_facturados,valor_total,estado)
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,1)""",
                (u(),sol_ids[i%len(sol_ids)],lav_ids[i%len(lav_ids)],ce_ids[i%len(ce_ids)],
                 rep_ids[i%len(rep_ids)],random.choice([1,2,3,4]),
                 fecha,fecha+timedelta(minutes=mins),mins,round(mins*250,2)))
alq_ids = get_ids('alquiler')
conn.commit(); print("[OK] 20 Alquileres")

# ============================================================
# 19. CRONOMETROS (20)
# ============================================================
for aid in alq_ids:
    fecha = datetime(2026,7,random.randint(1,22),random.randint(8,18),0,0)
    mins = random.randint(30,480)
    cur.execute("""INSERT INTO cronometro_alquiler (uuid,id_alquiler,fecha_inicio,fecha_fin,
        minutos_transcurridos,minutos_facturables,valor_acumulado,activo)
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s)""",
                (u(),aid,fecha,fecha+timedelta(minutes=mins),mins,mins,round(mins*250,2),0))
conn.commit(); print("[OK] 20 Cronometros")

# ============================================================
# 20. LIQUIDACIONES (20)
# ============================================================
for aid in alq_ids:
    t = random.randint(30,480)
    sub = round(t*250,2)
    desc = round(random.uniform(0,sub*0.1),2)
    cur.execute("""INSERT INTO liquidacion_alquiler (uuid,id_alquiler,tiempo_real_minutos,
        tiempo_facturado_minutos,subtotal,descuentos,total,fecha_liquidacion)
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s)""",
                (u(),aid,t,t,sub,desc,round(sub-desc,2),datetime(2026,7,random.randint(1,23),12,0)))
liq_ids = get_ids('liquidacion_alquiler')
conn.commit(); print("[OK] 20 Liquidaciones")

# ============================================================
# 21. PAGOS CLIENTE (20)
# ============================================================
mpago_ids = get_ids('metodo_pago')
cur.execute("SELECT id_estado_pago FROM estado_pago WHERE codigo='PAGADO'"); ep_pag = cur.fetchone()[0]
cur.execute("SELECT id_estado_pago FROM estado_pago WHERE codigo='PENDIENTE'"); ep_pend = cur.fetchone()[0]
cur.execute("SELECT id_estado_pago FROM estado_pago WHERE codigo='VENCIDO'"); ep_venc = cur.fetchone()[0]
for lid in liq_ids:
    ep = random.choice([ep_pag,ep_pag,ep_pend,ep_venc])
    cur.execute("""INSERT INTO pago_cliente (uuid,id_liquidacion_alquiler,id_metodo_pago,
        id_estado_pago,numero_transaccion,valor,fecha_pago,referencia)
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s)""",
                (u(),lid,mpago_ids[random.randint(0,len(mpago_ids)-1)],ep,
                 f"TXN-{2026}{random.randint(100000,999999)}",round(random.uniform(50000,500000),2),
                 datetime(2026,7,random.randint(1,23),random.randint(8,20),0),"Pago alquiler"))
conn.commit(); print("[OK] 20 Pagos Cliente")

# ============================================================
# 22. FACTURAS (20)
# ============================================================
cur.execute("SELECT id_estado_factura FROM estado_factura WHERE codigo='EMITIDA'"); ef_emit = cur.fetchone()[0]
cur.execute("SELECT id_estado_factura FROM estado_factura WHERE codigo='PAGADA'"); ef_pag = cur.fetchone()[0]
cur.execute("SELECT id_estado_factura FROM estado_factura WHERE codigo='BORRADOR'"); ef_borr = cur.fetchone()[0]
for i,lid in enumerate(liq_ids):
    sub = round(random.uniform(50000,500000),2)
    desc = round(random.uniform(0,sub*0.05),2)
    iva = round(sub*0.19,2)
    cur.execute("""INSERT INTO factura (uuid,id_liquidacion_alquiler,id_estado_factura,
        numero_factura,subtotal,descuentos,impuestos,total,fecha_emision)
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s)""",
                (u(),lid,random.choice([ef_emit,ef_pag,ef_borr]),
                 f"FAC-{2026}-{i+1:04d}",sub,desc,iva,round(sub-desc+iva,2),datetime(2026,7,random.randint(1,23),12,0)))
conn.commit(); print("[OK] 20 Facturas")

# ============================================================
# 23. DEVOLUCIONES (15)
# ============================================================
estados_lav = ['Buena','Regular','Mala','Para mantenimiento']
for i in range(15):
    cur.execute("""INSERT INTO devolucion_lavadora (uuid,id_alquiler,id_repartidor,
        fecha_devolucion,estado_lavadora,observaciones,requiere_mantenimiento) VALUES (%s,%s,%s,%s,%s,%s,%s)""",
                (u(),alq_ids[i%len(alq_ids)],rep_ids[i%len(rep_ids)],
                 datetime(2026,7,random.randint(1,23),random.randint(8,20),0),
                 random.choice(estados_lav),
                 f"Devolucion lavadora {i+1}",
                 random.choice([0,0,0,1])))
conn.commit(); print("[OK] 15 Devoluciones")

# ============================================================
# 25. TICKETS (20)
# ============================================================
asuntos = ['Problema con lavadora','Factura incorrecta','No llega repartidor','Sistema no carga','Error en cobro',
    'Lavadora danada','Solicitud no procesada','Pago no registrado','App no funciona','Cancelar alquiler',
    'Cambiar plan','Soporte tecnico','Reclamo cliente','Datos incorrectos','Sucursal cerrada',
    'Lavadora ruidosa','Tiempo de espera','Descuento no aplicado','Estado incorrecto','Queja servicio']
cur.execute("SELECT id_usuario FROM usuario ORDER BY id_usuario")
uids = [r[0] for r in cur.fetchall()]
for i in range(20):
    cur.execute("""INSERT INTO soporte_ticket (uuid,id_empresa,id_usuario,asunto,descripcion,
        prioridad,estado) VALUES (%s,%s,%s,%s,%s,%s,%s)""",
                (u(),emp_ids[i%7],uids[i%len(uids)],asuntos[i],
                 f"Descripcion del ticket {i+1}.",random.choice(['BAJA','MEDIA','ALTA','CRITICA']),
                 random.choice(['ABIERTO','PROCESO','CERRADO'])))
tk_ids = get_ids('soporte_ticket')
conn.commit(); print("[OK] 20 Tickets")

# ============================================================
# 26. RESPUESTAS (25)
# ============================================================
for i in range(25):
    cur.execute("INSERT INTO soporte_respuesta (uuid,id_soporte_ticket,id_usuario,respuesta) VALUES (%s,%s,%s,%s)",
                (u(),tk_ids[i%len(tk_ids)],uids[i%len(uids)],f"Respuesta {i+1}: Recibido su solicitud."))
conn.commit(); print("[OK] 25 Respuestas")

# ============================================================
# 27. NOTIFICACIONES (25)
# ============================================================
tipos_n = ['sistema','pago','alquiler','empresa','alerta']
titulos = ['Bienvenido','Pago recibido','Nuevo alquiler','Empresa aprobada','Mantenimiento',
    'Suscripcion renovada','Ticket soporte','Lavadora disponible','Ruta actualizada','Factura generada',
    'Cambio estado','Nuevo cliente','Pago vencido','Alerta inventario','Solicitud pendiente',
    'Alquiler completado','Repartidor asignado','Devolucion registrada','Liquidacion generada',
    'Reporte mensual','Config actualizada','Nuevo empleado','Sucursal creada','Plan cambiado','Sistema actualizado']
for i in range(25):
    cur.execute("INSERT INTO notificacion (uuid,id_usuario,titulo,mensaje,tipo,leida,created_at) VALUES (%s,%s,%s,%s,%s,%s,%s)",
                (u(),uids[i%len(uids)],titulos[i],f"Mensaje ejemplo {i+1}.",random.choice(tipos_n),
                 1 if i>15 else 0,datetime(2026,7,max(1,23-i),random.randint(8,20),random.randint(0,59))))
conn.commit(); print("[OK] 25 Notificaciones")

# ============================================================
# 28. RUTAS (20)
# ============================================================
origenes = ['Bogota Centro','Medellin Norte','Cali Sur','Barranquilla Puerto','Bucaramanga Centro']
destinos = ['Soacha','Envigado','Palmira','Soledad','Floridablanca','Itagui','Medellin Centro']
for i in range(20):
    cur.execute("""INSERT INTO ruta (uuid,id_empresa,nombre,origen,destino,distancia_km,
        tiempo_estimado_minutos,activa) VALUES (%s,%s,%s,%s,%s,%s,%s,1)""",
                (u(),emp_ids[i%7],f"Ruta {i+1}: {origenes[i%len(origenes)]}-{destinos[i%len(destinos)]}",
                 origenes[i%len(origenes)],destinos[i%len(destinos)],round(random.uniform(3,45),2),random.randint(15,90)))
ruta_ids = get_ids('ruta')
conn.commit(); print("[OK] 20 Rutas")

# ============================================================
# 29. HISTORIAL RUTA (20)
# ============================================================
# historial_ruta: uuid,id_ruta,id_repartidor,id_alquiler,fecha_inicio,fecha_fin,kilometros_recorridos,tiempo_real_minutos,observaciones
for i in range(20):
    fini = datetime(2026,7,random.randint(1,23),random.randint(8,20),0)
    ff = fini + timedelta(minutes=random.randint(15,120))
    cur.execute("""INSERT INTO historial_ruta (uuid,id_ruta,id_repartidor,id_alquiler,fecha_inicio,fecha_fin,
        kilometros_recorridos,tiempo_real_minutos,observaciones)
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s)""",
                (u(),ruta_ids[i%len(ruta_ids)],rep_ids[i%len(rep_ids)],
                 alq_ids[i%len(alq_ids)],fini,ff,round(random.uniform(3,45),2),
                 random.randint(15,120),f"Registro ruta {i+1}"))
conn.commit(); print("[OK] 20 Historial Ruta")

# ============================================================
# 30. COLA ESPERA (15)
# ============================================================
for i in range(15):
    prio = random.randint(1,5)
    cur.execute("""INSERT INTO cola_espera (uuid,id_empresa,id_cliente_empresa,id_capacidad_lavadora,
        fecha_solicitud,prioridad,observaciones,estado) VALUES (%s,%s,%s,%s,%s,%s,%s,%s)""",
                (u(),emp_ids[i%7],ce_ids[i%len(ce_ids)],cap_ids[i%len(cap_ids)],
                 datetime(2026,7,random.randint(1,23),random.randint(8,20),0),
                 prio,f"Cliente espera {i+1}",1))
conn.commit(); print("[OK] 15 Cola Espera")

# ============================================================
# 31. MANTENIMIENTO (20)
# ============================================================
tipos_m = ['Preventivo','Correctivo','Limpieza','Calibracion','Cambio pieza']
for i in range(20):
    cur.execute("""INSERT INTO mantenimiento_lavadora (uuid,id_lavadora,fecha,tipo,descripcion,
        costo,realizado_por,proximo_mantenimiento) VALUES (%s,%s,%s,%s,%s,%s,%s,%s)""",
                (u(),lav_ids[i%len(lav_ids)],f"2026-{random.randint(1,7):02d}-{random.randint(1,28):02d}",
                 random.choice(tipos_m),"Mantenimiento realizado",round(random.uniform(50000,500000),2),
                 f"Tecnico {random.randint(1,10)}",f"2026-{random.randint(8,12):02d}-{random.randint(1,28):02d}"))
conn.commit(); print("[OK] 20 Mantenimientos")

# ============================================================
# 32. HISTORIAL LAVADORA (25)
# ============================================================
eventos = ['Asignada','Retirada','En mantenimiento','Disponible','Asignada']
for i in range(25):
    cur.execute("""INSERT INTO historial_lavadora (uuid,id_lavadora,evento,descripcion,usuario,fecha_evento)
        VALUES (%s,%s,%s,%s,%s,%s)""",
                (u(),lav_ids[i%len(lav_ids)],eventos[i%len(eventos)],"Evento registrado",
                 f"Usuario {random.randint(1,10)}",datetime(2026,random.randint(1,7),random.randint(1,28),random.randint(8,20),0)))
conn.commit(); print("[OK] 25 Historial Lavadoras")

# ============================================================
# 33. MOVIMIENTO LAVADORA (20)
# ============================================================
for i in range(20):
    cur.execute("""INSERT INTO movimiento_lavadora (uuid,id_lavadora,id_estado_anterior,id_estado_nuevo,
        motivo,fecha_movimiento,observaciones) VALUES (%s,%s,%s,%s,%s,%s,%s)""",
                (u(),lav_ids[i%len(lav_ids)],el_disp,el_disp,
                 random.choice(['Asignacion','Devolucion','Mantenimiento','Reparacion','Actualizacion']),
                 datetime(2026,random.randint(1,7),random.randint(1,28),random.randint(8,20),0),
                 f"Movimiento lavadora {i+1}"))
conn.commit(); print("[OK] 20 Movimientos Lavadora")

# ============================================================
# 34. ARCHIVOS (20)
# ============================================================
exts = ['pdf','jpg','doc','xls','png']
mimes = ['application/pdf','image/jpeg','application/msword','application/vnd.ms-excel','image/png']
for i in range(20):
    ext = exts[i%len(exts)]
    cur.execute("""INSERT INTO archivo (uuid,nombre_original,nombre_servidor,extension,mime_type,peso,ruta)
        VALUES (%s,%s,%s,%s,%s,%s,%s)""",
                (u(),f"archivo_{i+1}.{ext}",f"srv_{u()[:8]}.{ext}",ext,mimes[i%len(mimes)],
                 random.randint(10000,5000000),f"/uploads/{ext}/{i+1}.{ext}"))
arch_ids = get_ids('archivo')
conn.commit(); print("[OK] 20 Archivos")

# ============================================================
# 35. EMPRESA ARCHIVO (20)
# ============================================================
tipos_de = ['RUT','Camara de Comercio','Cedula Representante','Estados Financieros','Certificado Bancario']
for i in range(20):
    cur.execute("""INSERT INTO empresa_archivo (uuid,id_empresa,id_archivo,tipo_documento,aprobado)
        VALUES (%s,%s,%s,%s,%s)""",
                (u(),emp_ids[i%7],arch_ids[i%len(arch_ids)],random.choice(tipos_de),random.choice([0,1])))
conn.commit(); print("[OK] 20 Empresa Archivos")

# ============================================================
# 37. EVIDENCIAS (15+15)
# ============================================================
# evidencia_entrega: uuid,id_alquiler,id_archivo,descripcion,fecha_registro
for i in range(15):
    cur.execute("""INSERT INTO evidencia_entrega (uuid,id_alquiler,id_archivo,descripcion,fecha_registro)
        VALUES (%s,%s,%s,%s,%s)""",
                (u(),alq_ids[i%len(alq_ids)],arch_ids[i%len(arch_ids)],
                 f"Evidencia entrega {i+1}",datetime(2026,7,random.randint(1,23),random.randint(8,20),0)))
# evidencia_devolucion: uuid,id_devolucion_lavadora,id_archivo,descripcion,fecha_registro
cur.execute("SELECT id_devolucion_lavadora FROM devolucion_lavadora ORDER BY id_devolucion_lavadora")
dev_ids = [r[0] for r in cur.fetchall()]
for i in range(15):
    cur.execute("""INSERT INTO evidencia_devolucion (uuid,id_devolucion_lavadora,id_archivo,descripcion,fecha_registro)
        VALUES (%s,%s,%s,%s,%s)""",
                (u(),dev_ids[i%len(dev_ids)],arch_ids[(i+15)%len(arch_ids)],
                 f"Evidencia devolucion {i+1}",datetime(2026,7,random.randint(1,23),random.randint(8,20),0)))
conn.commit(); print("[OK] 30 Evidencias")

# ============================================================
# 36. FOTOGRAFIA LAVADORA (20)
# ============================================================
# fotografia_lavadora: uuid,id_lavadora,nombre_archivo,ruta,principal
for i in range(20):
    cur.execute("INSERT INTO fotografia_lavadora (uuid,id_lavadora,nombre_archivo,ruta,principal) VALUES (%s,%s,%s,%s,%s)",
                (u(),lav_ids[i%len(lav_ids)],f"foto_lav_{i+1}.jpg",f"/uploads/fotos/lav_{i+1}.jpg",1 if i%5==0 else 0))
conn.commit(); print("[OK] 20 Fotografias")

# ============================================================
# 37. ASIGNACION SOLICITUD (15)
# ============================================================
# asignacion_solicitud: uuid,id_solicitud_alquiler,id_lavadora,id_repartidor,fecha_asignacion,observaciones
for i in range(15):
    cur.execute("""INSERT INTO asignacion_solicitud (uuid,id_solicitud_alquiler,id_lavadora,id_repartidor,
        fecha_asignacion,observaciones) VALUES (%s,%s,%s,%s,%s,%s)""",
                (u(),sol_ids[i%len(sol_ids)],lav_ids[i%len(lav_ids)],rep_ids[i%len(rep_ids)],
                 datetime(2026,7,random.randint(1,23),random.randint(8,20),0),
                 f"Asignacion {i+1}"))
conn.commit(); print("[OK] 15 Asignaciones")

# ============================================================
# 38. SUSCRIPCIONES (20)
# ============================================================
plan_ids = get_ids('plan')
precios = [250000,500000,1200000]
for i in range(20):
    pid = plan_ids[i%len(plan_ids)]
    cur.execute("""INSERT INTO suscripcion (uuid,id_empresa,id_plan,fecha_inicio,fecha_fin,
        valor,pagada,activa) VALUES (%s,%s,%s,%s,%s,%s,%s,%s)""",
                (u(),emp_ids[i%7],pid,datetime(2026,random.randint(1,7),1).date(),
                 datetime(2026,random.randint(7,12),28).date(),precios[i%len(precios)],random.choice([0,1]),1))
conn.commit(); print("[OK] 20 Suscripciones")

# ============================================================
# 39. PAGOS EMPRESA (20)
# ============================================================
sus_ids = get_ids('suscripcion')
for i in range(20):
    cur.execute("""INSERT INTO pago_empresa (uuid,id_empresa,id_suscripcion,id_metodo_pago,id_estado_pago,
        valor,numero_transaccion,fecha_pago,comprobante,observaciones) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)""",
                (u(),emp_ids[i%7],sus_ids[i%len(sus_ids)],mpago_ids[random.randint(0,len(mpago_ids)-1)],
                 random.choice([ep_pag,ep_pag,ep_pend,ep_venc]),
                 round(random.uniform(100000,2000000),2),
                 f"EMP-TXN-{2026}{random.randint(100000,999999)}",
                 datetime(2026,7,random.randint(1,23),random.randint(8,20),0),
                 f"comprobante_{i+1}.pdf",
                 f"Pago empresa {empresas_raw[i%len(empresas_raw)][2]}"))
conn.commit(); print("[OK] 20 Pagos Empresa")

# ============================================================
# 40. AUDITORIA (25)
# ============================================================
acciones = ['CREAR','ACTUALIZAR','ELIMINAR','CONSULTAR','EXPORTAR']
modulos = ['Empresas','Usuarios','Lavadoras','Alquileres','Pagos','Tickets','Configuraciones']
for i in range(25):
    cur.execute("""INSERT INTO auditoria (uuid,id_usuario,modulo,accion,tabla_afectada,
        ip,descripcion) VALUES (%s,%s,%s,%s,%s,%s,%s)""",
                (u(),uids[i%len(uids)],random.choice(modulos),random.choice(acciones),
                 random.choice(['empresa','usuario','lavadora','alquiler']),
                 f"192.168.1.{random.randint(1,254)}",f"Accion {random.choice(acciones).lower()} en {random.choice(modulos).lower()}"))
conn.commit(); print("[OK] 25 Auditorias")

# ============================================================
# RESUMEN FINAL
# ============================================================
conn.close()
print("\n=== SEED COMPLETO ===")

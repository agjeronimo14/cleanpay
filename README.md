# CleanPay SaaS - Control de Deuda Transparente

CleanPay es una plataforma SaaS moderna diseñada para erradicar las discusiones por pagos entre empresas de limpieza y sus trabajadores, promoviendo transparencia absoluta y cuentas claras mediante un historial unificado y cálculo automático de deudas en tiempo real.

## Características Principales

* **Portal Multi-Inquilino**: Cada empresa de limpieza opera de manera aislada y segura.
* **Control de Deuda**: Registro automatizado de servicios, pagos y ajustes para determinar saldos precisos.
* **Sincronización en Tiempo Real**: Integración nativa con base de datos robusta en la nube (Supabase).
* **Consenso de Pagos**: Historial verificado tanto por el jefe como por el trabajador para evitar discrepancias.

## Configuración y Despliegue Independiente

Este proyecto está configurado para ejecutarse localmente o ser desplegado de manera gratuita en la nube mediante Cloudflare Pages y Supabase.

### 1. Variables de Entorno

Crea un archivo `.env` en el directorio raíz (puedes basarte en `.env.example`) con las credenciales de tu proyecto. El sistema de base de datos se conectará automáticamente.

### 2. Base de Datos en Supabase

1. Crea un proyecto gratuito en [Supabase](https://supabase.com).
2. Abre la sección de **SQL Editor** en tu panel de Supabase.
3. Copia y pega el script completo de inicialización ubicado en `supabase-schema.sql` de este repositorio.
4. Ejecuta el script de SQL para crear todas las tablas, funciones de trigger y políticas de seguridad (RLS).

### 3. Conexión de la Aplicación

Puedes configurar tus credenciales de Supabase (URL de API y clave anónima pública) directamente desde el panel de control de la interfaz web pulsando el botón **BBDD Real (Supabase)** en la barra de navegación superior.
